import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Delete,
  X,
  Clock,
  Lock,
} from 'lucide-react';
import {
  isSecurityUnlocked,
  setSecurityUnlockCooldown,
  USER_CREDENTIALS,
  VALID_PASSWORDS,
  getAuthenticatedUser,
} from '../utils/security';
import { recordLoginAttempt } from '../utils/securityLogs';

interface SecurityGateModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const KEYPAD_LETTERS: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
};

export const SecurityGateModal: React.FC<SecurityGateModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const UNLOCK_CODE = '26733089';

  const [pin, setPin] = useState('');
  const [readOnlyInput, setReadOnlyInput] = useState(true);
  const [loggedUser, setLoggedUser] = useState<string>(() => getAuthenticatedUser());
  const [welcomeProgress, setWelcomeProgress] = useState(0);
  const [attempts, setAttempts] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('tm_security_failed_attempts');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isBlocked, setIsBlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tm_security_blocked') === 'true';
    } catch {
      return false;
    }
  });

  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);

  // Unlock Code Modal / View
  const [showUnlockInput, setShowUnlockInput] = useState(false);
  const [unlockCodeInput, setUnlockCodeInput] = useState('');
  const [unlockFeedback, setUnlockFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const unlockInputRef = useRef<HTMLInputElement>(null);

  // Reset internal states when opened
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMessage('');
      setErrorShake(false);
      setIsSuccessLoading(false);
      setShowUnlockInput(false);
      setUnlockFeedback(null);
      setUnlockCodeInput('');
      setWelcomeProgress(0);
    }
  }, [isOpen]);

  // Support physical keyboard typing with instant responsiveness
  useEffect(() => {
    if (!isOpen || isBlocked || isSuccessLoading || showUnlockInput) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBlocked, isSuccessLoading, showUnlockInput, pin]);

  // Persist block state
  useEffect(() => {
    try {
      localStorage.setItem('tm_security_failed_attempts', attempts.toString());
      localStorage.setItem('tm_security_blocked', isBlocked ? 'true' : 'false');
    } catch {}
  }, [attempts, isBlocked]);

  if (!isOpen) return null;

  // Handle pin verification
  const handleVerifyPin = (enteredPin: string) => {
    if (isBlocked || isSuccessLoading) return;

    const isValid = VALID_PASSWORDS.includes(enteredPin) || enteredPin === UNLOCK_CODE;

    if (isValid) {
      // Access granted! Assign specific user name based on entered PIN
      const resolvedUser =
        USER_CREDENTIALS[enteredPin] ||
        (enteredPin === UNLOCK_CODE ? 'Chefe' : enteredPin === '0844' ? 'Chefe' : 'Bebel caos');
      setLoggedUser(resolvedUser);
      setErrorMessage('');
      setIsSuccessLoading(true);
      setWelcomeProgress(0);

      // Log success without sensitive data
      recordLoginAttempt('success', 'security_gate', resolvedUser, 'PIN_VERIFIED');

      // Set 5-minute cooldown with the resolved user name
      setSecurityUnlockCooldown(5 * 60 * 1000, resolvedUser);

      // Snappy and responsive progress transition (~800ms)
      const startTime = Date.now();
      const totalDuration = 800; // 800ms

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));

        setWelcomeProgress(currentProgress);

        if (elapsed >= totalDuration) {
          clearInterval(progressInterval);
          setAttempts(0);
          try {
            localStorage.setItem('tm_security_failed_attempts', '0');
          } catch {}
          onSuccess();
        }
      }, 25);

      return () => {
        clearInterval(progressInterval);
      };
    } else {
      // Incorrect password - log failure without sensitive data (no PIN logged)
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 300);

      recordLoginAttempt(
        'failure',
        'security_gate',
        'gate_pin',
        newAttempts >= 3 ? 'PIN_MAX_ATTEMPTS_EXCEEDED' : 'INVALID_PIN'
      );

      if (newAttempts >= 3) {
        setIsBlocked(true);
        setPin('');
      } else {
        const remaining = 3 - newAttempts;
        setErrorMessage(`Senha incorreta! Resta${remaining === 1 ? ' 1 tentativa' : `m ${remaining} tentativas`}.`);
        setPin('');
      }
    }
  };

  // Instant digit entry
  const handleKeyPress = (num: string) => {
    if (isBlocked || isSuccessLoading) return;
    setPin((prev) => {
      if (prev.length < 8) {
        setErrorMessage('');
        const next = prev + num;
        // Auto-verify if 4 digits are typed and matches known PIN
        if (next.length === 4 && (VALID_PASSWORDS.includes(next) || next === '0844' || next === '0001')) {
          setTimeout(() => handleVerifyPin(next), 50);
        }
        return next;
      }
      return prev;
    });
  };

  // Instant delete
  const handleDelete = () => {
    if (isBlocked || isSuccessLoading) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  // Instant clear
  const handleClear = () => {
    if (isBlocked || isSuccessLoading) return;
    setPin('');
    setErrorMessage('');
  };

  // Explicit confirmation button handler
  const handleConfirm = () => {
    if (isBlocked || isSuccessLoading) return;
    if (pin.length < 4) {
      setErrorMessage('Digite ao menos 4 dígitos de acesso.');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 300);
      return;
    }
    handleVerifyPin(pin);
  };

  // Handle Unlock with master code 26733089
  const handleUnlockSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = unlockCodeInput.trim();

    if (cleanCode === UNLOCK_CODE) {
      setUnlockFeedback({ text: 'Código aceito! Sistema liberado.', isError: false });
      setSecurityUnlockCooldown(5 * 60 * 1000, 'Chefe');
      setTimeout(() => {
        setIsBlocked(false);
        setAttempts(0);
        setPin('');
        setShowUnlockInput(false);
        setUnlockFeedback(null);
        setUnlockCodeInput('');
        try {
          localStorage.setItem('tm_security_blocked', 'false');
          localStorage.setItem('tm_security_failed_attempts', '0');
        } catch {}
      }, 400);
    } else {
      setUnlockFeedback({ text: 'Código de desbloqueio inválido.', isError: true });
      setTimeout(() => {
        setUnlockFeedback(null);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200 overflow-y-auto font-sans">
      {/* iOS Practical Card Container */}
      <div
        className={`w-full max-w-[360px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 border relative ${
          isSuccessLoading
            ? 'bg-[#1c1c1e]/95 border-emerald-500/50 shadow-[0_0_60px_rgba(48,209,88,0.3)]'
            : isBlocked
            ? 'bg-[#1c1c1e]/95 border-red-500/60 shadow-[0_0_60px_rgba(239,68,68,0.3)]'
            : 'bg-[#1c1c1e]/95 border-white/10'
        }`}
      >
        {/* ============================================================
            1. WELCOME / ACCESS AUTHORIZED SCREEN (5 SECONDS)
            ============================================================ */}
        {isSuccessLoading ? (
          <div className="p-6 sm:p-7 py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Animated Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(48,209,88,0.4)]">
              <CheckCircle2 className="w-9 h-9 text-[#30d158] animate-pulse" />
            </div>

            {/* Welcome title with User Name */}
            <div className="space-y-2 w-full">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <span>ACESSO LIBERADO • PAINEL V1</span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                SEJA BEM VINDO{' '}
                <span className="text-[#30d158] font-extrabold uppercase">
                  {loggedUser}
                </span>
              </h2>

              {/* Notice Banner */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 text-[14px] font-bold uppercase leading-relaxed text-gray-200">
                <span>VC TEM SEU </span>
                <span className="text-[#30d158]">ACESSO LIBERADO</span>
                <span> POR </span>
                <span className="text-[#30d158]">5 MINUTOS</span>{' '}
                <span className="text-[#30d158] font-extrabold tracking-wider">BIGODE</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 font-mono">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>Entrando no painel ({welcomeProgress}%)...</span>
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-75 ease-linear bg-gradient-to-r from-emerald-500 to-[#30d158] shadow-[0_0_10px_#30d158]"
                  style={{ width: `${welcomeProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : isBlocked ? (
          /* ============================================================
             2. BLOCKED SCREEN
             ============================================================ */
          <div className="p-6 sm:p-7 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500/50 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse">
              <ShieldAlert className="w-9 h-9 text-red-500" />
            </div>

            <h2 className="text-lg font-bold text-red-500 uppercase tracking-tight">
              Acesso Bloqueado
            </h2>

            <p className="text-xs text-gray-300 mt-2 leading-relaxed max-w-[280px]">
              Limite de tentativas excedido. Digite o código mestre para reativar o acesso.
            </p>

            {!showUnlockInput ? (
              <div className="w-full mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnlockInput(true);
                    setTimeout(() => unlockInputRef.current?.focus(), 100);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg cursor-pointer active:scale-95 transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Desbloquear com Código Mestre</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-gray-400 hover:text-white font-medium cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUnlockSubmit(e as any);
                  }
                }}
                className="w-full mt-5 space-y-3"
              >
                <input
                  ref={unlockInputRef}
                  id="unlock-mstr-code-fld"
                  name="vgar_rcv_tok"
                  type="text"
                  readOnly={readOnlyInput}
                  onFocus={() => setReadOnlyInput(false)}
                  onTouchStart={() => setReadOnlyInput(false)}
                  onClick={() => setReadOnlyInput(false)}
                  value={unlockCodeInput}
                  onChange={(e) => setUnlockCodeInput(e.target.value)}
                  placeholder="Código Mestre..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  style={{ WebkitTextSecurity: 'disc' }}
                  className="w-full py-2.5 px-4 rounded-xl bg-black/60 border border-white/20 text-white placeholder-gray-500 text-center font-mono font-bold text-base focus:outline-none focus:border-red-400"
                />

                {unlockFeedback && (
                  <div
                    className={`text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 ${
                      unlockFeedback.isError
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <span>{unlockFeedback.text}</span>
                  </div>
                )}

                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnlockInput(false);
                      setUnlockFeedback(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleUnlockSubmit(e as any)}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs uppercase cursor-pointer shadow-md transition-all"
                  >
                    Desbloquear
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================
             3. CLASSIC PRACTICAL IOS PIN KEYPAD (FOR "PAINELV1")
             ============================================================ */
          <div className="p-6 flex flex-col items-center relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Top Icon */}
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-3 shadow-lg">
              <Lock className="w-7 h-7 text-[#007aff]" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              Digite a Senha
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Ticketmaster Brasil • Acesso Restrito
            </p>

            {/* iOS Pin Dots Indicator */}
            <div className={`flex justify-center items-center space-x-3.5 my-5 ${errorShake ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                    pin.length > index
                      ? 'bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : errorShake
                      ? 'border-2 border-red-500 bg-red-500/30'
                      : 'border-2 border-white/30 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Error Message */}
            {errorMessage ? (
              <div className="mb-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 py-1 px-3 rounded-lg flex items-center space-x-1.5 animate-in fade-in">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <div className="h-5 mb-2" />
            )}

            {/* Authentic iOS Numeric Keypad with Letters */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[270px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex flex-col items-center justify-center transition-all cursor-pointer border border-white/5 select-none focus:outline-none active:scale-95"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                  }}
                >
                  <span className="text-2xl font-normal leading-none">{digit}</span>
                  {KEYPAD_LETTERS[digit] && (
                    <span className="text-[8.5px] font-semibold tracking-widest text-white/50 uppercase mt-0.5">
                      {KEYPAD_LETTERS[digit]}
                    </span>
                  )}
                </button>
              ))}

              {/* Bottom row: Limpar, 0, Apagar */}
              <button
                type="button"
                onClick={handleClear}
                disabled={pin.length === 0}
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full text-xs font-medium text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-all select-none ${
                  pin.length === 0 ? 'opacity-0 pointer-events-none' : 'active:scale-95'
                }`}
              >
                Limpar
              </button>

              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex flex-col items-center justify-center transition-all cursor-pointer border border-white/5 select-none focus:outline-none active:scale-95"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <span className="text-2xl font-normal leading-none">0</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={pin.length === 0}
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-all select-none ${
                  pin.length === 0 ? 'opacity-0 pointer-events-none' : 'active:scale-95'
                }`}
                title="Apagar"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Fast Confirm Button */}
            <div className="w-full max-w-[270px] mt-4">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-3 rounded-2xl bg-[#007aff] hover:bg-[#0071e3] active:scale-98 text-white font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Entrar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
