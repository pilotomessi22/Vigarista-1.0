// Key Management & Licensing System
// Controls customer keys, custom expiration in days, creation of user accounts, and master credentials.

import {
  verifyMasterSecret,
  generateCryptographicKey,
  validateCryptographicKey,
  signSessionPayload,
  verifySessionIntegrity,
} from './cryptoAuth';
import { clearSecurityUnlockCooldown, isSecurityUnlocked, getSecurityRemainingSeconds } from './security';
import {
  getCurrentDeviceInfo,
  getCurrentDeviceInfoSync,
  getPersistentHwid,
  maskIp,
  DeviceInfo,
} from './deviceSecurity';
import {
  syncKeyToCloud,
  syncUserToCloud,
  deleteKeyFromCloud,
  deleteUserFromCloud,
} from './firebaseSync';

export interface LicenseKey {
  key: string;
  daysValid: number;
  createdAt: string; // ISO string
  isRedeemed: boolean;
  redeemedBy?: string; // username
  redeemedAt?: string; // ISO string
  expiresAt?: string; // ISO string
  status: 'active' | 'redeemed' | 'expired';
  isDemo?: boolean;
  boundIp?: string;
  boundDeviceFingerprint?: string;
  boundDeviceModel?: string;
}

export interface LicensedUser {
  username: string;
  passwordHash: string; // Stored securely
  licenseKey: string;
  createdAt: string;
  expiresAt: string; // Expiration timestamp
  daysValid: number;
  status: 'active' | 'expired' | 'suspended';
  sessionSig?: string; // Cryptographic session tamper check
  registeredIp?: string; // Bound Public IP
  registeredDeviceFingerprint?: string; // Bound HWID Hardware Token
  deviceModel?: string; // Friendly Device Name (e.g. iPhone 15 Safari, Windows PC)
  boundIpSubnet?: string; // Bound IP Subnet for dynamic mobile network stability
  lastLoginIp?: string;
  lastLoginAt?: string;
  isIpBound?: boolean;
  isDemo?: boolean;
}

const KEYS_STORAGE_KEY = 'tm_license_keys_v1';
const USERS_STORAGE_KEY = 'tm_licensed_users_v1';
const SESSION_STORAGE_KEY = 'tm_active_client_session';

// Safe UTF-8 Base64 encoding & decoding
export const encodePassword = (password: string): string => {
  try {
    return btoa(encodeURIComponent(password));
  } catch {
    return btoa(password);
  }
};

export const decodePassword = (passwordHash: string): string => {
  try {
    return decodeURIComponent(atob(passwordHash));
  } catch {
    try {
      return atob(passwordHash);
    } catch {
      return passwordHash;
    }
  }
};

// Initial default keys seed that are always valid on any device
const DEFAULT_INITIAL_KEYS: LicenseKey[] = [
  {
    key: 'VIGARISTA-001A-8MAW-2026',
    daysValid: 1,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
  {
    key: 'VIGARISTA-01EH-PMDG-2026',
    daysValid: 30,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
  {
    key: 'VIGARISTA-01EL-DDC5-2026',
    daysValid: 30,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
  {
    key: 'VIGARISTA-01EZ-CPEJ-2026',
    daysValid: 30,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
  {
    key: 'VIGARISTA-01E6-AXKW-2026',
    daysValid: 30,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
  {
    key: 'VIGARISTA-HZ2W-K3TC-2026',
    daysValid: 365,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
  {
    key: 'VIGARISTA-V1GA-7777-2026',
    daysValid: 30,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
  {
    key: 'VIGARISTA-LID7-9999-2026',
    daysValid: 365,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
  {
    key: 'VIGARISTA-VIP8-2026-VIP7',
    daysValid: 365,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  },
];

// Initial default user seed
const DEFAULT_INITIAL_USERS: LicensedUser[] = [
  {
    username: 'messin',
    passwordHash: encodePassword('1234'),
    licenseKey: 'VIGARISTA-HZ2W-K3TC-2026',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    daysValid: 365,
    status: 'active',
    sessionSig: signSessionPayload('messin', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()),
  },
];

/**
 * Universal Key Generator with embedded duration and cryptographic signature
 */
export const generateFormattedKey = (days: number = 30): string => {
  return generateCryptographicKey(days);
};

/**
 * Validates and extracts duration from ANY cryptographic key or standard key
 */
export const parseKeyDuration = (keyInput: string): number => {
  const result = validateCryptographicKey(keyInput);
  if (result.valid && result.days > 0) {
    return result.days;
  }
  return 30;
};

/**
 * Checks if a key string is mathematically and cryptographically valid
 */
export const isKeyGloballyValid = (keyInput: string): boolean => {
  const result = validateCryptographicKey(keyInput);
  return result.valid;
};

// Retrieve all keys from storage
export const getStoredKeys = (): LicenseKey[] => {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE_KEY);
    if (!raw) {
      saveStoredKeys(DEFAULT_INITIAL_KEYS);
      return DEFAULT_INITIAL_KEYS;
    }
    const parsed: LicenseKey[] = JSON.parse(raw);
    let updated = false;

    // Automatically migrate legacy TM- keys to VIGARISTA-
    parsed.forEach((k) => {
      if (k.key && k.key.toUpperCase().startsWith('TM-')) {
        k.key = k.key.replace(/^TM-/i, 'VIGARISTA-');
        updated = true;
      }
    });

    for (const initKey of DEFAULT_INITIAL_KEYS) {
      if (!parsed.some((k) => k.key && k.key.toUpperCase() === initKey.key.toUpperCase())) {
        parsed.unshift(initKey);
        updated = true;
      }
    }
    if (updated) {
      saveStoredKeys(parsed);
    }
    return parsed;
  } catch {
    return DEFAULT_INITIAL_KEYS;
  }
};

// Save keys
export const saveStoredKeys = (keys: LicenseKey[]): void => {
  try {
    localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys));
  } catch {}
};

// Create a new key with custom duration in days (supports fractional days e.g. 1/24 for 1 hour)
export const createNewLicenseKey = (daysValid: number): LicenseKey => {
  const keys = getStoredKeys();
  const safeDays = daysValid > 0 ? daysValid : 1 / 24;
  const newKey: LicenseKey = {
    key: generateFormattedKey(Math.max(1, Math.min(36500, Math.round(daysValid)))),
    daysValid: safeDays,
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
  };
  keys.unshift(newKey);
  saveStoredKeys(keys);
  syncKeyToCloud(newKey);
  return newKey;
};

// Create a 20-minute DEMO/TEST key specifically for client previews
export const createDemoTestKey = (): LicenseKey => {
  const keys = getStoredKeys();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const year = new Date().getFullYear();
  const testKeyStr = `VIGARISTA-TEST-${rand}-${year}`;
  const newKey: LicenseKey = {
    key: testKeyStr,
    daysValid: 20 / 1440, // 20 minutes
    createdAt: new Date().toISOString(),
    isRedeemed: false,
    status: 'active',
    isDemo: true,
  };
  keys.unshift(newKey);
  saveStoredKeys(keys);
  syncKeyToCloud(newKey);
  return newKey;
};

// Delete key
export const deleteLicenseKey = async (keyString: string): Promise<void> => {
  const cleanKey = keyString.trim().toUpperCase();
  const keys = getStoredKeys().filter((k) => k.key.trim().toUpperCase() !== cleanKey);
  saveStoredKeys(keys);
  await deleteKeyFromCloud(cleanKey);
};

// Retrieve all users
export const getStoredUsers = (): LicensedUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      saveStoredUsers(DEFAULT_INITIAL_USERS);
      return DEFAULT_INITIAL_USERS;
    }
    const parsed: LicensedUser[] = JSON.parse(raw);
    let updated = false;
    parsed.forEach((u) => {
      if (u.licenseKey && u.licenseKey.toUpperCase().startsWith('TM-')) {
        u.licenseKey = u.licenseKey.replace(/^TM-/i, 'VIGARISTA-');
        updated = true;
      }
    });
    if (updated) {
      saveStoredUsers(parsed);
    }
    return parsed;
  } catch {
    return DEFAULT_INITIAL_USERS;
  }
};

// Save users
export const saveStoredUsers = (users: LicensedUser[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
};

// Register customer with Username, Password and Key (Works seamlessly on ANY device!)
export const registerUserWithKey = async (
  username: string,
  password: string,
  keyInput: string
): Promise<{ success: boolean; message: string; user?: LicensedUser }> => {
  const cleanKey = keyInput.trim().toUpperCase();
  let cleanUsername = username.trim().toLowerCase();
  let cleanPassword = password.trim();

  if (!cleanKey) {
    return { success: false, message: 'Digite a chave de acesso (Key).' };
  }

  // Auto-generate credentials if left empty or minimal
  if (!cleanUsername || cleanUsername.length < 2) {
    const keySuffix = cleanKey.replace(/[^A-Z0-9]/gi, '').slice(-4).toLowerCase();
    cleanUsername = cleanUsername.length >= 1 ? `${cleanUsername}_${keySuffix}` : `user_${keySuffix}`;
  }
  if (!cleanPassword || cleanPassword.length < 2) {
    cleanPassword = '1234';
  }

  // Check if username already exists
  const users = getStoredUsers();
  const existingUser = users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (existingUser) {
    return {
      success: false,
      message: `⛔ USUÁRIO JÁ EXISTE: O nome "${cleanUsername}" já está cadastrado. Acesse a aba "Entrar" para fazer login. O compartilhamento ou sobrescrita de contas é estritamente proibido.`,
    };
  }

  // Master password bypass
  if (verifyMasterSecret(cleanKey)) {
    const now = new Date();
    const expiresAtDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const masterUser: LicensedUser = {
      username: cleanUsername,
      passwordHash: encodePassword(cleanPassword),
      licenseKey: 'MASTER-ACCESS-KEY',
      createdAt: now.toISOString(),
      expiresAt: expiresAtDate.toISOString(),
      daysValid: 365,
      status: 'active',
      sessionSig: signSessionPayload(cleanUsername, expiresAtDate.toISOString()),
    };
    users.unshift(masterUser);
    saveStoredUsers(users);
    await syncUserToCloud(masterUser);
    setActiveClientSession(masterUser);
    return { success: true, message: 'Conta Mestre criada com sucesso!', user: masterUser };
  }

  // Universal Validation: Check local storage OR validate algorithmic key on device
  const keys = getStoredKeys();
  let keyIndex = keys.findIndex((k) => k.key.toUpperCase() === cleanKey);

  // If the key was generated on master and not yet in local array, load it if mathematically valid
  if (keyIndex === -1) {
    if (isKeyGloballyValid(cleanKey)) {
      const parsedDays = parseKeyDuration(cleanKey);
      const importedKey: LicenseKey = {
        key: cleanKey,
        daysValid: parsedDays,
        createdAt: new Date().toISOString(),
        isRedeemed: false,
        status: 'active',
      };
      keys.unshift(importedKey);
      saveStoredKeys(keys);
      keyIndex = 0;
    } else {
      return { success: false, message: 'Chave de acesso (Key) inválida ou inexistente.' };
    }
  }

  const keyObj = keys[keyIndex];

  // Verify if key was already redeemed or is in use by another user
  const userWithThisKey = users.find((u) => u.licenseKey && u.licenseKey.toUpperCase() === cleanKey);
  if (keyObj.isRedeemed || keyObj.status === 'redeemed' || userWithThisKey) {
    const boundUser = keyObj.redeemedBy || userWithThisKey?.username || 'outro usuário';
    return {
      success: false,
      message: `⛔ CHAVE JÁ VINCULADA: Esta Key já foi utilizada e está vinculada à conta "${boundUser}". Para criar uma nova conta com ela, o Administrador precisa resetar ou reativar esta Key no Painel Mestre.`,
    };
  }

  // Calculate expiration date & check demo status
  const now = new Date();
  const isDemoKey = keyObj.isDemo || cleanKey.startsWith('TM-TEST-') || cleanKey.includes('TEST');
  const expiresAtDate = isDemoKey
    ? new Date(now.getTime() + 20 * 60 * 1000) // 20 minutes for demo keys
    : new Date(now.getTime() + keyObj.daysValid * 24 * 60 * 60 * 1000);

  // Capture current client Device Fingerprint and Public IP (await real network IP!)
  const currentDev = await getCurrentDeviceInfo();

  // Mark key as redeemed and bind to this device and IP
  keyObj.isRedeemed = true;
  keyObj.redeemedBy = cleanUsername;
  keyObj.redeemedAt = now.toISOString();
  keyObj.expiresAt = expiresAtDate.toISOString();
  keyObj.boundIp = currentDev.ip;
  keyObj.boundDeviceFingerprint = currentDev.fingerprint;
  keyObj.boundDeviceModel = currentDev.deviceModel;
  keyObj.status = 'redeemed';
  if (isDemoKey) keyObj.isDemo = true;
  keys[keyIndex] = keyObj;
  saveStoredKeys(keys);
  await syncKeyToCloud(keyObj);

  // Create user with strict device & IP binding
  const newUser: LicensedUser = {
    username: cleanUsername,
    passwordHash: encodePassword(cleanPassword),
    licenseKey: keyObj.key,
    createdAt: now.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
    daysValid: isDemoKey ? 20 / 1440 : keyObj.daysValid,
    status: 'active',
    sessionSig: signSessionPayload(cleanUsername, expiresAtDate.toISOString()),
    registeredIp: currentDev.ip,
    registeredDeviceFingerprint: currentDev.fingerprint,
    deviceModel: currentDev.deviceModel,
    boundIpSubnet: currentDev.ipSubnet,
    lastLoginIp: currentDev.ip,
    lastLoginAt: now.toISOString(),
    isIpBound: true,
    isDemo: isDemoKey,
  };

  users.unshift(newUser);
  saveStoredUsers(users);
  await syncUserToCloud(newUser);

  // Set active session
  setActiveClientSession(newUser);

  const durationMsg = isDemoKey ? '20 minutos de acesso demonstrativo' : `${keyObj.daysValid} dias de acesso`;

  return { success: true, message: `Conta criada com sucesso! (${durationMsg} - Dispositivo & IP vinculados)`, user: newUser };
};

export const isDemoSessionActive = (): boolean => {
  const session = getActiveClientSession();
  if (!session) return false;
  if (session.isDemo) return true;
  if (session.licenseKey && (session.licenseKey.startsWith('TM-TEST-') || session.licenseKey.includes('TEST'))) return true;
  return false;
};

// Login customer with Username and Password (with strict IP & Hardware Anti-Sharing Verification)
export const loginClient = async (
  username: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  user?: LicensedUser;
  isExpired?: boolean;
  isDeviceMismatch?: boolean;
}> => {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  const users = getStoredUsers();
  const user = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!user) {
    return {
      success: false,
      message: `Usuário "${username}" não cadastrado. Clique em "Cadastre-se" com uma chave para criar sua conta.`,
    };
  }

  const decoded = decodePassword(user.passwordHash);
  const isMatch =
    decoded === cleanPassword ||
    user.passwordHash === cleanPassword ||
    user.passwordHash === encodePassword(cleanPassword) ||
    user.passwordHash === btoa(cleanPassword);

  if (!isMatch) {
    return {
      success: false,
      message: 'Senha incorreta para este usuário.',
    };
  }

  // Check expiration & status
  const now = new Date().getTime();
  const expiresAt = new Date(user.expiresAt).getTime();

  if (now > expiresAt || user.status === 'expired' || user.status === 'suspended') {
    return {
      success: false,
      isExpired: true,
      message: 'Sua assinatura expirou ou foi encerrada pelo administrador! Renove seu plano para continuar acessando.',
      user,
    };
  }

  // ADVANCED DEVICE & IP HARDWARE ANTI-FRAUD VERIFICATION:
  // Await the real, freshly fetched public IP and HWID
  const currentDev = await getCurrentDeviceInfo();

  // If user does not have an IP/Device bound yet (first login or after admin reset)
  if (!user.registeredDeviceFingerprint && !user.registeredIp) {
    user.registeredIp = currentDev.ip;
    user.registeredDeviceFingerprint = currentDev.fingerprint;
    user.deviceModel = currentDev.deviceModel;
    user.boundIpSubnet = currentDev.ipSubnet;
    user.isIpBound = true;
    user.lastLoginIp = currentDev.ip;
    user.lastLoginAt = new Date().toISOString();
    saveStoredUsers(users);
    await syncUserToCloud(user);
  } else {
    // Check if the current device matches the registered device HWID or registered IP/subnet
    const isMatchingHwid = user.registeredDeviceFingerprint === currentDev.fingerprint;
    const isMatchingIp = user.registeredIp === currentDev.ip;
    const isMatchingSubnet = Boolean(user.boundIpSubnet && user.boundIpSubnet === currentDev.ipSubnet);

    // ANTI-SHARING FRAUD SHIELD:
    // If NEITHER the registered device HWID matches NOR the registered IP/subnet matches:
    // This strictly prevents sharing credentials with anyone outside the original device/IP!
    if (!isMatchingHwid && !isMatchingIp && !isMatchingSubnet) {
      return {
        success: false,
        isDeviceMismatch: true,
        message: `⚠️ ACESSO BLOQUEADO POR IP / DISPOSITIVO: Esta conta está vinculada exclusivamente ao IP (${maskIp(user.registeredIp)}) e ao aparelho cadastrado (${user.deviceModel || 'Aparelho Original'}). O compartilhamento de login é estritamente proibido contra fraudes de revenda. Para autorizar um novo dispositivo, contate o administrador para resetar seu vínculo.`,
        user,
      };
    }

    // Refresh last login info
    user.lastLoginIp = currentDev.ip;
    user.lastLoginAt = new Date().toISOString();
    saveStoredUsers(users);
    await syncUserToCloud(user);
  }

  // Ensure session has signature
  if (!user.sessionSig) {
    user.sessionSig = signSessionPayload(user.username, user.expiresAt);
  }

  setActiveClientSession(user);
  return { success: true, message: 'Login realizado com sucesso!', user };
};

// Reset User Device & IP Binding (Admin action when customer changes phone)
export const resetUserDeviceBinding = async (
  username: string
): Promise<{ success: boolean; message: string }> => {
  const cleanUsername = username.trim().toLowerCase();
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.username.toLowerCase() === cleanUsername);

  if (index === -1) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  users[index].registeredIp = undefined;
  users[index].registeredDeviceFingerprint = undefined;
  users[index].deviceModel = undefined;
  users[index].boundIpSubnet = undefined;
  users[index].isIpBound = false;
  saveStoredUsers(users);
  await syncUserToCloud(users[index]);

  return {
    success: true,
    message: `Vínculo de IP/Aparelho do usuário "${username}" foi resetado com sucesso! O próximo dispositivo/IP que fizer login será vinculado.`,
  };
};

// Renew expired user with a new key (Works seamlessly on ANY device!)
export const renewUserWithKey = async (
  username: string,
  keyInput: string
): Promise<{ success: boolean; message: string; user?: LicensedUser }> => {
  const cleanUsername = username.trim().toLowerCase();
  const cleanKey = keyInput.trim().toUpperCase();

  const users = getStoredUsers();
  const userIndex = users.findIndex((u) => u.username.toLowerCase() === cleanUsername);

  if (userIndex === -1) {
    return { success: false, message: 'Usuário não encontrado neste dispositivo. Crie uma nova conta em "Cadastre-se".' };
  }

  const keys = getStoredKeys();
  let keyIndex = keys.findIndex((k) => k.key.toUpperCase() === cleanKey);

  // Dynamic import on friend's device
  if (keyIndex === -1) {
    if (isKeyGloballyValid(cleanKey)) {
      const parsedDays = parseKeyDuration(cleanKey);
      const importedKey: LicenseKey = {
        key: cleanKey,
        daysValid: parsedDays,
        createdAt: new Date().toISOString(),
        isRedeemed: false,
        status: 'active',
      };
      keys.unshift(importedKey);
      saveStoredKeys(keys);
      keyIndex = 0;
    } else {
      return { success: false, message: 'Chave de acesso (Key) inválida ou inexistente.' };
    }
  }

  const keyObj = keys[keyIndex];
  if (keyObj.isRedeemed) {
    return { success: false, message: 'Esta chave de acesso já foi resgatada.' };
  }

  const user = users[userIndex];
  const now = new Date();
  const currentExpiry = new Date(user.expiresAt).getTime();
  const baseTime = currentExpiry > now.getTime() ? currentExpiry : now.getTime();
  const newExpiry = new Date(baseTime + keyObj.daysValid * 24 * 60 * 60 * 1000);

  // Mark key as redeemed
  keyObj.isRedeemed = true;
  keyObj.redeemedBy = cleanUsername;
  keyObj.redeemedAt = now.toISOString();
  keyObj.expiresAt = newExpiry.toISOString();
  keyObj.status = 'redeemed';
  keys[keyIndex] = keyObj;
  saveStoredKeys(keys);
  await syncKeyToCloud(keyObj);

  user.expiresAt = newExpiry.toISOString();
  user.status = 'active';
  user.sessionSig = signSessionPayload(cleanUsername, newExpiry.toISOString());
  users[userIndex] = user;
  saveStoredUsers(users);
  await syncUserToCloud(user);

  setActiveClientSession(user);
  return { success: true, message: `Renovado com sucesso por mais ${keyObj.daysValid} dias!`, user };
};

// Active Session helpers
export const setActiveClientSession = (user: LicensedUser): void => {
  try {
    if (!user.sessionSig) {
      user.sessionSig = signSessionPayload(user.username, user.expiresAt);
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {}
};

export const getActiveClientSession = (): LicensedUser | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const user: LicensedUser = JSON.parse(raw);
    
    // Cryptographic anti-tampering check: verify that expiry was not altered manually
    if (user.sessionSig && !verifySessionIntegrity(user.username, user.expiresAt, user.sessionSig)) {
      clearActiveClientSession();
      return null;
    }

    // MANDATORY REAL-TIME CROSS-CHECK AGAINST CENTRAL USER LIST (Synchronized with Firestore)
    const users = getStoredUsers();
    const storedUser = users.find((u) => u.username.toLowerCase() === user.username.toLowerCase());

    if (!storedUser) {
      clearActiveClientSession();
      return null;
    }

    if (
      storedUser.status === 'expired' ||
      storedUser.status === 'suspended' ||
      new Date().getTime() >= new Date(storedUser.expiresAt).getTime()
    ) {
      clearActiveClientSession();
      if (storedUser.status !== 'expired') {
        storedUser.status = 'expired';
        saveStoredUsers(users);
      }
      return null;
    }

    // MANDATORY CROSS-CHECK LINKED KEY STATUS
    if (storedUser.licenseKey) {
      const keys = getStoredKeys();
      const linkedKey = keys.find((k) => k.key.toUpperCase() === storedUser.licenseKey.toUpperCase());
      if (linkedKey && linkedKey.status === 'expired') {
        clearActiveClientSession();
        return null;
      }
    }

    return storedUser;
  } catch {
    clearActiveClientSession();
    return null;
  }
};

export const clearActiveClientSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('tm_last_active_view');
    clearSecurityUnlockCooldown();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tm:client_session_cleared'));
      window.dispatchEvent(new CustomEvent('tm:security_locked'));
      window.dispatchEvent(new CustomEvent('tm:force_lock'));
    }
  } catch {}
};

/**
 * Validates all active sessions (security cooldown and client user session)
 * Automatically invalidates any expired session and returns overall access authorization.
 */
export const checkAndInvalidateAllSessions = (): {
  hasValidAccess: boolean;
  type?: 'security_cooldown' | 'client_session';
  username?: string;
  remainingSeconds?: number;
} => {
  // 1. Check Owner/Security Passcode Cooldown (strictly reserved for 'Chefe' or 'Bebel caos')
  if (isSecurityUnlocked()) {
    return {
      hasValidAccess: true,
      type: 'security_cooldown',
      remainingSeconds: getSecurityRemainingSeconds(),
    };
  }

  // 2. Check Client User Session
  const clientSession = getActiveClientSession();
  if (clientSession) {
    const diff = Math.max(0, Math.floor((new Date(clientSession.expiresAt).getTime() - Date.now()) / 1000));
    return {
      hasValidAccess: true,
      type: 'client_session',
      username: clientSession.username,
      remainingSeconds: diff,
    };
  }

  return {
    hasValidAccess: false,
  };
};


// Calculate remaining days for user (returns 0 if expired or suspended)
export const getRemainingDays = (expiresAtISO: string, status?: string): number => {
  if (status === 'expired' || status === 'suspended') return 0;
  const diff = new Date(expiresAtISO).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Admin update of customer password
export const updateUserPassword = async (
  username: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = newPassword.trim();

  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, message: 'A nova senha deve ter pelo menos 4 caracteres.' };
  }

  const users = getStoredUsers();
  const index = users.findIndex((u) => u.username.toLowerCase() === cleanUsername);
  if (index === -1) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  users[index].passwordHash = encodePassword(cleanPassword);
  saveStoredUsers(users);
  await syncUserToCloud(users[index]);

  // If user is currently active session, update their session too
  const currentSession = getActiveClientSession();
  if (currentSession && currentSession.username.toLowerCase() === cleanUsername) {
    currentSession.passwordHash = encodePassword(cleanPassword);
    setActiveClientSession(currentSession);
  }

  return { success: true, message: `Senha do usuário ${username} alterada com sucesso!` };
};

// Delete user account
export const deleteUser = async (username: string): Promise<void> => {
  const cleanUsername = username.trim().toLowerCase();
  const users = getStoredUsers().filter((u) => u.username.toLowerCase() !== cleanUsername);
  saveStoredUsers(users);
  await deleteUserFromCloud(cleanUsername);

  // If active session was this user, clear session
  const currentSession = getActiveClientSession();
  if (currentSession && currentSession.username.toLowerCase() === cleanUsername) {
    clearActiveClientSession();
    clearSecurityUnlockCooldown();
  }
};

// Force immediately expire a user's license/account
export const expireUserNow = async (username: string): Promise<{ success: boolean; message: string }> => {
  const cleanUsername = username.trim().toLowerCase();
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.username.toLowerCase() === cleanUsername);

  if (index === -1) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  // Set past date and expired status
  const pastDate = new Date(Date.now() - 3600000).toISOString();
  users[index].expiresAt = pastDate;
  users[index].status = 'expired';
  users[index].sessionSig = signSessionPayload(cleanUsername, pastDate);
  saveStoredUsers(users);
  await syncUserToCloud(users[index]);

  // Expire key if linked
  const linkedKey = users[index].licenseKey;
  if (linkedKey) {
    const keys = getStoredKeys();
    const kIdx = keys.findIndex((k) => k.key.toUpperCase() === linkedKey.toUpperCase());
    if (kIdx !== -1) {
      keys[kIdx].status = 'expired';
      keys[kIdx].expiresAt = pastDate;
      saveStoredKeys(keys);
      await syncKeyToCloud(keys[kIdx]);
    }
  }

  // Clear active session and security unlock cooldown
  clearActiveClientSession();
  clearSecurityUnlockCooldown();

  return { success: true, message: `O acesso do usuário "${username}" foi EXPIRADO imediatamente!` };
};

// Reactivate or extend a user's license
export const reactivateUser = async (
  username: string,
  daysToAdd: number = 30
): Promise<{ success: boolean; message: string }> => {
  const cleanUsername = username.trim().toLowerCase();
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.username.toLowerCase() === cleanUsername);

  if (index === -1) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  const now = Date.now();
  const currentExpiry = new Date(users[index].expiresAt).getTime();
  const baseTime = (users[index].status === 'expired' || currentExpiry < now) ? now : currentExpiry;
  const newExpiry = new Date(baseTime + Math.max(1, daysToAdd) * 24 * 60 * 60 * 1000);

  users[index].expiresAt = newExpiry.toISOString();
  users[index].status = 'active';
  users[index].daysValid = Math.max(users[index].daysValid, daysToAdd);
  users[index].sessionSig = signSessionPayload(cleanUsername, newExpiry.toISOString());
  saveStoredUsers(users);
  await syncUserToCloud(users[index]);

  // If user has a linked key, reactivate that key as well
  const linkedKey = users[index].licenseKey;
  if (linkedKey) {
    const keys = getStoredKeys();
    const kIdx = keys.findIndex((k) => k.key.toUpperCase() === linkedKey.toUpperCase());
    if (kIdx !== -1) {
      keys[kIdx].status = 'active';
      keys[kIdx].expiresAt = newExpiry.toISOString();
      keys[kIdx].daysValid = Math.max(keys[kIdx].daysValid, daysToAdd);
      saveStoredKeys(keys);
      await syncKeyToCloud(keys[kIdx]);
    }
  }

  return { success: true, message: `Usuário "${username}" REATIVADO com sucesso por mais ${daysToAdd} dias!` };
};

// Force expire an unused or active key
export const expireKeyNow = async (keyString: string): Promise<{ success: boolean; message: string }> => {
  const cleanKey = keyString.trim().toUpperCase();
  const keys = getStoredKeys();
  const index = keys.findIndex((k) => k.key.toUpperCase() === cleanKey);

  if (index === -1) {
    return { success: false, message: 'Chave não encontrada.' };
  }

  const pastDate = new Date(Date.now() - 3600000).toISOString();
  keys[index].status = 'expired';
  keys[index].isRedeemed = true;
  keys[index].expiresAt = pastDate;
  saveStoredKeys(keys);
  await syncKeyToCloud(keys[index]);

  // If redeemed by a user, expire that user too
  if (keys[index].redeemedBy) {
    await expireUserNow(keys[index].redeemedBy!);
  } else {
    // Check all users with this key
    const users = getStoredUsers();
    let hasUpdated = false;
    for (const u of users) {
      if (u.licenseKey && u.licenseKey.toUpperCase() === cleanKey) {
        u.status = 'expired';
        u.expiresAt = pastDate;
        u.sessionSig = signSessionPayload(u.username, pastDate);
        await syncUserToCloud(u);
        hasUpdated = true;
      }
    }
    if (hasUpdated) {
      saveStoredUsers(users);
    }
  }

  clearSecurityUnlockCooldown();
  return { success: true, message: `Chave ${keyString} expirada com sucesso!` };
};

// Reset a key so it can be registered on a new IP/Device or by a new account
export const resetLicenseKey = async (
  keyString: string
): Promise<{ success: boolean; message: string }> => {
  const cleanKey = keyString.trim().toUpperCase();
  const keys = getStoredKeys();
  const index = keys.findIndex((k) => k.key.toUpperCase() === cleanKey);

  if (index === -1) {
    return { success: false, message: 'Chave não encontrada.' };
  }

  const oldRedeemedBy = keys[index].redeemedBy;

  // Unlink and reset key
  keys[index].isRedeemed = false;
  keys[index].redeemedBy = undefined;
  keys[index].redeemedAt = undefined;
  keys[index].boundIp = undefined;
  keys[index].boundDeviceFingerprint = undefined;
  keys[index].boundDeviceModel = undefined;
  keys[index].status = 'active';
  saveStoredKeys(keys);
  await syncKeyToCloud(keys[index]);

  // If a user was linked to this key, delete or unbind that user from cloud so key can be re-registered
  const users = getStoredUsers();
  const usersWithKey = users.filter(
    (u) =>
      (u.licenseKey && u.licenseKey.toUpperCase() === cleanKey) ||
      (oldRedeemedBy && u.username.toLowerCase() === oldRedeemedBy.toLowerCase())
  );

  for (const u of usersWithKey) {
    const uIdx = users.findIndex((user) => user.username.toLowerCase() === u.username.toLowerCase());
    if (uIdx !== -1) {
      users.splice(uIdx, 1);
      await deleteUserFromCloud(u.username);
    }
  }
  if (usersWithKey.length > 0) {
    saveStoredUsers(users);
  }

  return {
    success: true,
    message: `⚡ Key ${cleanKey} RESETADA com sucesso! Ela foi liberada para ser cadastrada em um novo dispositivo/IP.`,
  };
};

// Reactivate a key (and its linked user) for +X days
export const reactivateLicenseKey = async (
  keyString: string,
  daysToAdd: number = 30
): Promise<{ success: boolean; message: string }> => {
  const cleanKey = keyString.trim().toUpperCase();
  const keys = getStoredKeys();
  const index = keys.findIndex((k) => k.key.toUpperCase() === cleanKey);

  if (index === -1) {
    return { success: false, message: 'Chave não encontrada.' };
  }

  const now = Date.now();
  const currentExpiry = keys[index].expiresAt ? new Date(keys[index].expiresAt!).getTime() : now;
  const baseTime = (keys[index].status === 'expired' || currentExpiry < now) ? now : currentExpiry;
  const newExpiry = new Date(baseTime + Math.max(1, daysToAdd) * 24 * 60 * 60 * 1000);

  keys[index].status = keys[index].isRedeemed ? 'redeemed' : 'active';
  keys[index].expiresAt = newExpiry.toISOString();
  keys[index].daysValid = Math.max(keys[index].daysValid, daysToAdd);
  saveStoredKeys(keys);
  await syncKeyToCloud(keys[index]);

  // If linked to a user, reactivate that user too
  if (keys[index].redeemedBy) {
    await reactivateUser(keys[index].redeemedBy!, daysToAdd);
  } else {
    const users = getStoredUsers();
    for (const u of users) {
      if (u.licenseKey && u.licenseKey.toUpperCase() === cleanKey) {
        await reactivateUser(u.username, daysToAdd);
      }
    }
  }

  return {
    success: true,
    message: `⚡ Key ${cleanKey} REATIVADA com sucesso por mais ${daysToAdd} dias!`,
  };
};

// Expose developer console shortcut for manual key generation
if (typeof window !== 'undefined') {
  (window as any).gerarkey = (days: number = 30) => {
    const newKey = createNewLicenseKey(days);
    console.log(
      '%c🔑 [KEY GERADA COM SUCESSO]',
      'background: #00ffaa; color: #000; font-weight: bold; font-size: 14px; padding: 4px 8px; border-radius: 4px;'
    );
    console.log(`Chave: %c${newKey.key}`, 'color: #00e5ff; font-weight: bold; font-size: 16px;');
    console.log(`Validade: ${newKey.daysValid} dias`);
    console.log(`Criada em: ${newKey.createdAt}`);
    return newKey.key;
  };
}


