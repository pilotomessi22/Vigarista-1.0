import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

export type LoginStatus = 'success' | 'failure';

export type AuthType =
  | 'client_login'
  | 'client_register'
  | 'security_gate'
  | 'master_access';

export interface LoginAttemptLog {
  id?: string;
  status: LoginStatus;
  authType: AuthType;
  maskedTarget: string; // Ex: "ad***" ou "us***" - NUNCA expõe senhas ou dados sensíveis
  reason: string; // Ex: "AUTH_SUCCESS", "INVALID_CREDENTIALS", "RATE_LIMITED", "INVALID_PIN"
  timestamp: string; // Formato ISO 8601
  clientDevice?: string; // Informação anônima de plataforma (ex: "Safari / iOS")
}

const LOGS_COLLECTION = 'login_attempts';
const LOCAL_LOGS_CACHE_KEY = 'tm_security_login_logs_cache';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path,
  };
  console.warn('Firestore Error in securityLogs:', JSON.stringify(errInfo));
}

/**
 * Mascara qualquer identificador para que nenhum dado sensível seja exposto nos logs
 */
export function maskTargetIdentifier(raw?: string): string {
  if (!raw) return 'anonimo';
  const clean = raw.trim().toLowerCase();

  if (clean === 'admin' || clean === 'painelteste') {
    return 'ad***';
  }
  if (clean === 'chefe' || clean === 'bebel caos') {
    return 'gate_pin';
  }
  if (clean.length <= 2) {
    return clean[0] ? `${clean[0]}*` : '***';
  }
  if (clean.length <= 4) {
    return `${clean.slice(0, 2)}**`;
  }
  return `${clean.slice(0, 2)}***${clean.slice(-1)}`;
}

/**
 * Obtém resumo anônimo da plataforma do cliente
 */
function getClientDeviceSummary(): string {
  if (typeof navigator === 'undefined') return 'Desconhecido';
  const ua = navigator.userAgent || '';
  let browser = 'Navegador Web';
  if (ua.includes('iPhone') || ua.includes('iPad')) browser = 'Safari iOS';
  else if (ua.includes('Android')) browser = 'Android Web';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';

  return browser;
}

/**
 * Salva log de tentativa de login no Firestore e em cache local seguro
 * Registra APENAS status de sucesso ou falha, com identificadores ofuscados
 */
export async function recordLoginAttempt(
  status: LoginStatus,
  authType: AuthType,
  rawTarget?: string,
  reason = status === 'success' ? 'AUTH_SUCCESS' : 'AUTH_FAILED'
): Promise<void> {
  const maskedTarget = maskTargetIdentifier(rawTarget);
  const logEntry: LoginAttemptLog = {
    status,
    authType,
    maskedTarget,
    reason,
    timestamp: new Date().toISOString(),
    clientDevice: getClientDeviceSummary(),
  };

  // 1. Grava no cache local de contingência
  try {
    const existingRaw = localStorage.getItem(LOCAL_LOGS_CACHE_KEY);
    const existing: LoginAttemptLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [logEntry, ...existing.slice(0, 49)];
    localStorage.setItem(LOCAL_LOGS_CACHE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tm:login_log_added', { detail: logEntry }));
    }
  } catch {}

  // 2. Grava no Firebase Firestore na coleção append-only 'login_attempts'
  try {
    const colRef = collection(db, LOGS_COLLECTION);
    await addDoc(colRef, logEntry);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, LOGS_COLLECTION);
  }
}

/**
 * Recupera logs em tempo real do Firestore para monitoramento de segurança
 */
export function subscribeToLoginLogs(
  callback: (logs: LoginAttemptLog[]) => void
): () => void {
  try {
    const colRef = collection(db, LOGS_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // Se vazio no Firestore, retorna do cache local
          callback(getLocalCachedLogs());
          return;
        }

        const logs: LoginAttemptLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LoginAttemptLog;
          logs.push({
            id: docSnap.id,
            status: data.status,
            authType: data.authType,
            maskedTarget: data.maskedTarget || 'anonimo',
            reason: data.reason || 'LOG_ENTRY',
            timestamp: data.timestamp || new Date().toISOString(),
            clientDevice: data.clientDevice || 'Dispositivo Web',
          });
        });

        // Atualiza cache local
        try {
          localStorage.setItem(LOCAL_LOGS_CACHE_KEY, JSON.stringify(logs.slice(0, 50)));
        } catch {}

        callback(logs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, LOGS_COLLECTION);
        // Fallback gracioso para o cache local se offline
        callback(getLocalCachedLogs());
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, LOGS_COLLECTION);
    callback(getLocalCachedLogs());
    return () => {};
  }
}

/**
 * Retorna logs do cache local para resposta imediata
 */
export function getLocalCachedLogs(): LoginAttemptLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
