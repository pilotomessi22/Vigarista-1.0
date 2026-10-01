// Security Gate and Cooldown Helpers
// Keeps access unlocked for at least 5 minutes after entering the correct password, with strict timestamp invalidation

export const UNLOCKED_UNTIL_KEY = 'tm_security_unlocked_until';
export const AUTH_USER_KEY = 'tm_security_auth_user';
export const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export const USER_CREDENTIALS: Record<string, string> = {
  '0844': 'Chefe',
  '0001': 'Bebel caos',
};

export const VALID_PASSWORDS = Object.keys(USER_CREDENTIALS);

/**
 * Checks if the security cooldown timestamp is currently active and valid.
 * Automatically invalidates and cleans up localStorage if the timestamp has expired.
 */
export const isSecurityUnlocked = (): boolean => {
  try {
    const raw = localStorage.getItem(UNLOCKED_UNTIL_KEY);
    if (!raw) return false;
    const expiresAt = parseInt(raw, 10);
    if (isNaN(expiresAt)) {
      clearSecurityUnlockCooldown();
      return false;
    }

    const now = Date.now();
    if (now >= expiresAt) {
      // Timestamp has expired: immediately invalidate and clean up
      clearSecurityUnlockCooldown();
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Sets the unlock cooldown timestamp for 5 minutes (or specified duration in ms) and stores the authenticated user.
 */
export const setSecurityUnlockCooldown = (durationMs = DEFAULT_COOLDOWN_MS, userName?: string): void => {
  try {
    const expiresAt = Date.now() + durationMs;
    localStorage.setItem(UNLOCKED_UNTIL_KEY, expiresAt.toString());
    if (userName) {
      localStorage.setItem(AUTH_USER_KEY, userName);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tm:security_unlocked', { detail: { expiresAt, userName } }));
    }
  } catch {}
};

/**
 * Gets the current authenticated username.
 */
export const getAuthenticatedUser = (): string => {
  try {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user || 'Chefe';
  } catch {
    return 'Chefe';
  }
};

/**
 * Sets the authenticated username explicitly.
 */
export const setAuthenticatedUser = (userName: string): void => {
  try {
    localStorage.setItem(AUTH_USER_KEY, userName);
  } catch {}
};

/**
 * Gets remaining cooldown time in seconds based on timestamp in localStorage.
 * Automatically cleans up if expired.
 */
export const getSecurityRemainingSeconds = (): number => {
  try {
    const raw = localStorage.getItem(UNLOCKED_UNTIL_KEY);
    if (!raw) return 0;
    const expiresAt = parseInt(raw, 10);
    if (isNaN(expiresAt)) {
      clearSecurityUnlockCooldown();
      return 0;
    }
    const diff = expiresAt - Date.now();
    if (diff <= 0) {
      clearSecurityUnlockCooldown();
      return 0;
    }
    return Math.floor(diff / 1000);
  } catch {
    return 0;
  }
};

/**
 * Clears the unlock cooldown (forces lock), clears auth user and last active view.
 * Dispatches a lock event to trigger instant lockout in all open views.
 */
export const clearSecurityUnlockCooldown = (): void => {
  try {
    localStorage.removeItem(UNLOCKED_UNTIL_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('tm_last_active_view');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tm:security_locked'));
    }
  } catch {}
};

/**
 * Validates whether any access (security cooldown or client session) is currently valid based on timestamps.
 * Returns true if valid, or false if completely locked/expired.
 */
export const validateAccessTimestamp = (): boolean => {
  return isSecurityUnlocked();
};

