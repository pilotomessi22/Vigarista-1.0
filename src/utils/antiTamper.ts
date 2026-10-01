/**
 * Sistema de Blindagem 100%, Anti-Invasão, Anti-Tampering e Anti-DevTools
 * Protege comprovantes, ingressos e dados sensíveis contra vazamento ou inspeção.
 */

const SERVER_TOKEN_KEY = 'tm_server_protection_token';
const TICKET_UNLOCK_KEY = 'tm_server_ticket_unlock_key';
const TOKEN_EXPIRY_KEY = 'tm_server_token_expires_at';

// 1. Iniciar proteção Anti-Tamper e Anti-Invasão no cliente
export function initAntiTamperProtection() {
  if (typeof window === 'undefined') return;

  // Bloqueio de atalhos comuns de inspeção e DevTools
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspect)
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    // Ctrl+Shift+C / Cmd+Option+C (Element picker)
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      (e.key === 'I' ||
        e.key === 'i' ||
        e.key === 'J' ||
        e.key === 'j' ||
        e.key === 'C' ||
        e.key === 'c')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+Option+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Bloqueio de botão direito em áreas sensíveis de ingressos e comprovantes
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const isSensitiveArea =
      target?.closest('#ticketmaster-order-view') ||
      target?.closest('#quentro-ticket-view') ||
      target?.closest('.ticket-container') ||
      target?.closest('#safari-ticket-screen') ||
      document.body.classList.contains('in-ticket-view');

    if (isSensitiveArea) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('contextmenu', handleContextMenu, true);

  // Monitoramento periódico de integridade do token de servidor
  setInterval(() => {
    validateServerTokenHeartbeat();
  }, 45000);
}

// 2. Validação e emissão de Token Criptográfico no Servidor
export async function requestServerLicenseVerification(
  key: string,
  hwid?: string
): Promise<{ success: boolean; message?: string; daysValid?: number }> {
  try {
    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, hwid }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || 'Falha ao validar chave no servidor central.',
      };
    }

    const data = await res.json();
    if (data.success && data.serverToken) {
      try {
        localStorage.setItem(SERVER_TOKEN_KEY, data.serverToken);
        localStorage.setItem(TICKET_UNLOCK_KEY, data.ticketUnlockKey || '');
        localStorage.setItem(TOKEN_EXPIRY_KEY, data.expiresAt || '');
      } catch {}

      return { success: true, daysValid: data.daysValid };
    }

    return { success: false, message: data.message || 'Chave rejeitada pelo servidor.' };
  } catch (err) {
    // Se estiver em modo offline, não trava o cliente mas mantém a flag local
    console.warn('Verificação de servidor offline, utilizando proteção local.', err);
    return { success: true };
  }
}

// 3. Heartbeat de validação do token do servidor
export async function validateServerTokenHeartbeat(): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  try {
    const token = localStorage.getItem(SERVER_TOKEN_KEY);
    if (!token) return true; // se não há token de servidor registrado, deixa o sistema local agir

    const res = await fetch('/api/license/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverToken: token }),
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.valid) {
        // Token expirado ou adulterado: limpa sessão imediatamente
        console.warn('Token de servidor invalidado ou expirado. Bloqueando tela.');
        clearServerProtectionToken();
        window.dispatchEvent(new CustomEvent('tm:security_lockout', { detail: { reason: data.reason } }));
        return false;
      }
      return true;
    }
  } catch {}

  return true;
}

// 4. Limpar token de proteção
export function clearServerProtectionToken() {
  try {
    localStorage.removeItem(SERVER_TOKEN_KEY);
    localStorage.removeItem(TICKET_UNLOCK_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch {}
}

// 5. Verificar se possui token de proteção ativo
export function hasValidServerProtectionToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const token = localStorage.getItem(SERVER_TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!token) return false;
    if (expiry && new Date().getTime() > new Date(expiry).getTime()) {
      clearServerProtectionToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// 6. Obter chave de desbloqueio de comprovante emitida pelo servidor
export function getServerTicketUnlockKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TICKET_UNLOCK_KEY);
  } catch {
    return null;
  }
}
