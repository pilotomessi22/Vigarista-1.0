/**
 * VIGARISTA Anti-Tamper & Security Shield
 * Protects against Brute-Force attacks, DevTools inspection, and client tampering.
 */

import { sha256Sync } from './cryptoAuth';

const BRUTE_FORCE_KEY = 'vigarista_sec_attempts';
const MAX_ATTEMPTS_TIER1 = 4;
const MAX_ATTEMPTS_TIER2 = 7;
const LOCKOUT_TIER1_MS = 30 * 1000; // 30 seconds
const LOCKOUT_TIER2_MS = 30 * 1000; // 30 seconds

interface BruteForceState {
  count: number;
  lockedUntil: number;
  fingerprintHash: string;
}

function getFingerprint(): string {
  try {
    const raw = `${navigator.userAgent}_${screen.width}x${screen.height}_${navigator.language}`;
    return sha256Sync(raw).substring(0, 16);
  } catch {
    return 'generic_fingerprint';
  }
}

export function checkBruteForceStatus(): { isLocked: boolean; remainingSec: number } {
  try {
    const raw = localStorage.getItem(BRUTE_FORCE_KEY);
    if (!raw) return { isLocked: false, remainingSec: 0 };
    const data: BruteForceState = JSON.parse(raw);

    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      // Cap at 30 seconds max so old lockouts never freeze the user
      const maxAllowedUntil = Date.now() + 30 * 1000;
      if (data.lockedUntil > maxAllowedUntil) {
        data.lockedUntil = maxAllowedUntil;
        localStorage.setItem(BRUTE_FORCE_KEY, JSON.stringify(data));
      }
      const remainingSec = Math.max(1, Math.ceil((data.lockedUntil - Date.now()) / 1000));
      return { isLocked: true, remainingSec };
    }

    return { isLocked: false, remainingSec: 0 };
  } catch {
    return { isLocked: false, remainingSec: 0 };
  }
}

export function registerFailedAttempt(): { isLocked: boolean; remainingSec: number; count: number } {
  try {
    const raw = localStorage.getItem(BRUTE_FORCE_KEY);
    let state: BruteForceState = raw ? JSON.parse(raw) : { count: 0, lockedUntil: 0, fingerprintHash: getFingerprint() };

    state.count += 1;

    if (state.count >= MAX_ATTEMPTS_TIER2) {
      state.lockedUntil = Date.now() + LOCKOUT_TIER2_MS;
    } else if (state.count >= MAX_ATTEMPTS_TIER1) {
      state.lockedUntil = Date.now() + LOCKOUT_TIER1_MS;
    }

    localStorage.setItem(BRUTE_FORCE_KEY, JSON.stringify(state));

    const isLocked = state.lockedUntil > Date.now();
    const remainingSec = isLocked ? Math.ceil((state.lockedUntil - Date.now()) / 1000) : 0;
    return { isLocked, remainingSec, count: state.count };
  } catch {
    return { isLocked: false, remainingSec: 0, count: 1 };
  }
}

export function resetFailedAttempts(): void {
  try {
    localStorage.removeItem(BRUTE_FORCE_KEY);
  } catch {}
}

/**
 * Initializes Commercial Anti-Tamper Protection:
 * - Blocks F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Cmd+Option+I
 * - Disables context-menu on client interfaces
 */
export function initCommercialSecurityShield(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleKeyDown = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Cmd+Option+I
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    // Prevent right-click inspection in client mode
    const target = e.target as HTMLElement;
    if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('contextmenu', handleContextMenu, true);

  return () => {
    window.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('contextmenu', handleContextMenu, true);
  };
}
