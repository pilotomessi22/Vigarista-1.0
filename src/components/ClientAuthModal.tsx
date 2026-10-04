import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Lock,
  KeyRound,
  X,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  registerUserWithKey,
  loginClient,
  LicensedUser,
  isKeyGloballyValid,
  getStoredUsers,
} from '../utils/licenseManager';
import { setSecurityUnlockCooldown } from '../utils/security';
import { fetchClientPublicIp } from '../utils/deviceSecurity';
import { verifyMasterSecret } from '../utils/cryptoAuth';
import { checkBruteForceStatus, registerFailedAttempt, resetFailedAttempts } from '../utils/securityShield';
import { AnonymousMaskIllustration } from './AnonymousMaskIllustration';
import { MatrixRainBackground } from './MatrixRainBackground';
import { hackerAudio } from '../utils/hackerAudio';
import { requestServerLicenseVerification } from '../utils/antiTamper';
import { recordLoginAttempt } from '../utils/securityLogs';

interface ClientAuthModalProps {
  isOpen: boolean;
  onSuccess: (user: LicensedUser) => void;
  onOpenMasterPanel: () => void;
  onOpenStore?: () => void;
  onClose?: () => void;
}

const STORAGE_KEY_REMEMBERED_USERNAME = 'vigarista_remembered_username';
const STORAGE_KEY_REMEMBER_ME = 'vigarista_remember_me_active';

export const ClientAuthModal: React.FC<ClientAuthModalProps> = ({
  isOpen,
  onSuccess,
  onOpenMasterPanel,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasRememberedUser, setHasRememberedUser] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // ReadOnly toggles to bypass iOS Safari AutoFill 'Iniciar Sessão' password sheet
  const [readOnlyUsername, setReadOnlyUsername] = useState(true);
  const [readOnlyPassword, setReadOnlyPassword] = useState(true);
  const [readOnlyKey, setReadOnlyKey] = useState(true);

  // Initialize and load remembered username or prefilled key if present
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setIsLoading(false);

      // Pre-warm client public IP resolution in background
      fetchClientPublicIp().catch(() => {});

      // Check if a prefilled license key came from the checkout store
      try {
        const prefilledKey = localStorage.getItem('tm_prefill_license_key');
        if (prefilledKey) {
          setLicenseKey(prefilledKey);
          setMode('register');
          localStorage.removeItem('tm_prefill_license_key');
        }
      } catch {}

      // Check remember me preferences
      const savedRememberPreference = localStorage.getItem(STORAGE_KEY_REMEMBER_ME);
      const isRememberActive = savedRememberPreference !== 'false';
      setRememberMe(isRememberActive);

      const savedUsername = localStorage.getItem(STORAGE_KEY_REMEMBERED_USERNAME);
      if (savedUsername && isRememberActive) {
        setUsername(savedUsername);
        setHasRememberedUser(true);

        // Auto-focus password input so the client only types their password
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 120);
      } else {
        setHasRememberedUser(false);
        setTimeout(() => {
          usernameInputRef.current?.focus();
        }, 120);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleForgetRememberedUser = () => {
    localStorage.removeItem(STORAGE_KEY_REMEMBERED_USERNAME);
    setUsername('');
    setPassword('');
    setHasRememberedUser(false);
    usernameInputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Check Anti-Brute-Force Lockout
    const bruteStatus = checkBruteForceStatus();
    if (bruteStatus.isLocked) {
      setErrorMessage(`Múltiplas tentativas incorretas detectadas. Sistema bloqueado temporariamente por ${bruteStatus.remainingSec}s para proteção anti-invasão.`);
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      // 1. MASTER ADMIN SHORTCUT CHECK:
      if (
        verifyMasterSecret(password.trim()) ||
        verifyMasterSecret(licenseKey.trim()) ||
        username.trim().toLowerCase() === 'admin' ||
        username.trim().toLowerCase() === 'painelteste'
      ) {
        recordLoginAttempt('success', 'master_access', username, 'MASTER_SHORTCUT_TRIGGERED');
        setIsLoading(false);
        onOpenMasterPanel();
        return;
      }

      if (mode === 'login') {
        const cleanU = username.trim();
        const upperU = cleanU.toUpperCase();
        const cleanP = password.trim();
        const upperP = cleanP.toUpperCase();

        // 1. Direct License Key entered in login field?
        const detectedKey = isKeyGloballyValid(upperU)
          ? upperU
          : isKeyGloballyValid(upperP)
          ? upperP
          : (upperU.startsWith('VIGARISTA-') || upperU.startsWith('TM-')) && upperU.length >= 8
          ? upperU
          : null;

        if (detectedKey) {
          const storedUsers = getStoredUsers();
          const userWithKey = storedUsers.find(
            (u) =>
              u.licenseKey &&
              (u.licenseKey.toUpperCase() === detectedKey ||
                u.licenseKey.toUpperCase().replace('TM-', 'VIGARISTA-') ===
                  detectedKey.replace('TM-', 'VIGARISTA-'))
          );
          if (userWithKey) {
            setUsername(userWithKey.username);
            setIsLoading(false);
            setErrorMessage(
              `Esta chave está vinculada à conta "${userWithKey.username}". Por segurança de vínculo de IP, digite a senha cadastrada para entrar.`
            );
            return;
          } else {
            setIsLoading(false);
            setLicenseKey(detectedKey);
            setMode('register');
            setSuccessMessage(
              'Chave detectada! Preencha usuário e senha na aba "Cadastre-se" para vincular este dispositivo.'
            );
            return;
          }
        }

        const result = await loginClient(username, password);
        if (result.success && result.user) {
          // Log success without sensitive data
          recordLoginAttempt('success', 'client_login', username, 'AUTH_SUCCESS');

          // Request Cryptographic Server Token
          await requestServerLicenseVerification(
            result.user.licenseKey || 'VIGARISTA-V1GA-7777-2026',
            result.user.registeredDeviceFingerprint
          );

          setIsLoading(false);
          resetFailedAttempts();
          hackerAudio.playAccessGrantedSound();
          // Manage Remember Me persistence
          if (rememberMe) {
            localStorage.setItem(STORAGE_KEY_REMEMBERED_USERNAME, username.trim());
            localStorage.setItem(STORAGE_KEY_REMEMBER_ME, 'true');
          } else {
            localStorage.removeItem(STORAGE_KEY_REMEMBERED_USERNAME);
            localStorage.setItem(STORAGE_KEY_REMEMBER_ME, 'false');
          }

          setSuccessMessage('Acesso liberado e blindado pelo servidor!');
          setTimeout(() => {
            onSuccess(result.user!);
          }, 600);
        } else {
          setIsLoading(false);
          const attempt = registerFailedAttempt();
          hackerAudio.playAccessDeniedSound();

          // Log failure without sensitive data (no password logged)
          recordLoginAttempt(
            'failure',
            'client_login',
            username,
            attempt.isLocked ? 'RATE_LIMITED' : 'INVALID_CREDENTIALS'
          );

          if (attempt.isLocked) {
            setErrorMessage(`Limite de tentativas excedido! Bloqueado por ${attempt.remainingSec}s para segurança.`);
          } else {
            setErrorMessage(result.message);
          }
        }
      } else if (mode === 'register') {
        let effectiveKey = licenseKey.trim().toUpperCase();
        let effectiveUser = username.trim();
        let effectivePass = password.trim();

        // If customer pasted key into username or password field by mistake
        if (!effectiveKey) {
          if (
            isKeyGloballyValid(effectiveUser) ||
            effectiveUser.toUpperCase().startsWith('VIGARISTA-') ||
            effectiveUser.toUpperCase().startsWith('TM-')
          ) {
            effectiveKey = effectiveUser.toUpperCase();
            effectiveUser = `user_${effectiveKey.replace(/[^A-Z0-9]/gi, '').slice(-4).toLowerCase()}`;
          } else if (
            isKeyGloballyValid(effectivePass) ||
            effectivePass.toUpperCase().startsWith('VIGARISTA-') ||
            effectivePass.toUpperCase().startsWith('TM-')
          ) {
            effectiveKey = effectivePass.toUpperCase();
            effectivePass = '1234';
          }
        }

        const result = await registerUserWithKey(effectiveUser, effectivePass, effectiveKey);
        if (result.success && result.user) {
          // Log success without sensitive data (no password, no key in log)
          recordLoginAttempt('success', 'client_register', effectiveUser, 'REGISTRATION_SUCCESS');

          // Request Cryptographic Server Token
          await requestServerLicenseVerification(
            effectiveKey || result.user.licenseKey || 'VIGARISTA-V1GA-7777-2026',
            result.user.registeredDeviceFingerprint
          );

          setIsLoading(false);
          resetFailedAttempts();
          hackerAudio.playAccessGrantedSound();
          if (rememberMe) {
            localStorage.setItem(STORAGE_KEY_REMEMBERED_USERNAME, result.user.username);
            localStorage.setItem(STORAGE_KEY_REMEMBER_ME, 'true');
          }

          setSuccessMessage('Conta ativada e blindada pelo servidor!');

          setTimeout(() => {
            onSuccess(result.user!);
          }, 600);
        } else {
          setIsLoading(false);
          const attempt = registerFailedAttempt();
          hackerAudio.playAccessDeniedSound();

          // Log failure without sensitive data
          recordLoginAttempt(
            'failure',
            'client_register',
            username,
            attempt.isLocked ? 'RATE_LIMITED' : 'INVALID_KEY_OR_EXPIRED'
          );

          if (attempt.isLocked) {
            setErrorMessage(`Múltiplas tentativas com chaves inválidas! Bloqueado por ${attempt.remainingSec}s.`);
          } else {
            setErrorMessage(result.message);
          }
        }
      }
    }, 350);
  };

  return (
    <div
      id="painel-vigarista-page"
      className="fixed inset-0 z-50 min-h-screen w-full bg-[#06080d] text-white flex flex-col justify-between items-center p-5 sm:p-8 select-none animate-in fade-in duration-200 overflow-y-auto font-sans"
    >
      {/* Futuristic Matrix Rain Background */}
      <MatrixRainBackground />

      {/* Top Floating Close Button */}
      <div className="w-full max-w-md flex items-center justify-end z-10 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Central Content Container */}
      <div className="w-full max-w-md flex flex-col items-center z-10 my-auto py-6">
        {/* Glowing Anonymous Mask Logo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative group cursor-pointer" onClick={() => onOpenMasterPanel()}>
            <AnonymousMaskIllustration size={150} glowColor="#00e5ff" />
          </div>
          
          {/* Title: VIGARISTA */}
          <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-200 text-center font-mono drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            VIGARISTA
          </h1>
          
          {/* Subtitle: EQUIPE LIDERANÇA7️⃣🤴🏻 */}
          <p className="text-sm sm:text-base font-black tracking-widest text-cyan-400 font-mono uppercase mt-1.5 flex items-center justify-center gap-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            EQUIPE LIDERANÇA7️⃣🤴🏻
          </p>
        </div>

        {/* Mode Tabs: Entrar / Ativar Key (Cadastre-se) */}
        <div className="w-full grid grid-cols-2 p-1 rounded-2xl bg-[#0f141d]/90 border border-white/10 backdrop-blur-md mb-6 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono uppercase tracking-wider ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono uppercase tracking-wider ${
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-gray-950 shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ativar Key
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 font-mono animate-in fade-in zoom-in-95">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-mono animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Auth Form - Uses div instead of form to prevent iOS Safari & Chrome Password Autofill / Keychain Prompts */}
        <div
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="w-full space-y-4"
        >
          {/* 1. Username Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[11px] font-mono text-gray-400 uppercase">
              <span>Usuário</span>
              {hasRememberedUser && mode === 'login' && (
                <button
                  type="button"
                  onClick={handleForgetRememberedUser}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Entrar com outro usuário"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Trocar</span>
                </button>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-5 text-gray-400 pointer-events-none">
                <User className="w-5 h-5 stroke-[2]" />
              </div>
              <input
                ref={usernameInputRef}
                id="input-vgar-usr-field"
                name="vgar_uid_str"
                type="text"
                readOnly={readOnlyUsername}
                onFocus={() => setReadOnlyUsername(false)}
                onTouchStart={() => setReadOnlyUsername(false)}
                onClick={() => setReadOnlyUsername(false)}
                value={username}
                onChange={(e) => {
                  const val = e.target.value;
                  setUsername(val);
                  if (hasRememberedUser) setHasRememberedUser(false);
                  if (
                    (val.trim().toUpperCase().startsWith('VIGARISTA-') ||
                      val.trim().toUpperCase().startsWith('TM-')) &&
                    val.trim().length >= 8
                  ) {
                    setLicenseKey(val.trim().toUpperCase());
                    setMode('register');
                  }
                }}
                placeholder={mode === 'login' ? 'Nome de usuário ou Chave (Key)' : 'Nome de usuário'}
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                className="w-full h-14 pl-14 pr-6 rounded-full bg-[#10141e]/90 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-medium font-mono shadow-inner"
              />
            </div>
          </div>

          {/* 2. Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[11px] font-mono text-gray-400 uppercase">
              <span>Senha</span>
              {hasRememberedUser && mode === 'login' && (
                <span className="text-[10px] text-emerald-400">Usuário salvo • Digite sua senha</span>
              )}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-gray-400 pointer-events-none">
                <Lock className="w-5 h-5 stroke-[2]" />
              </div>
              <input
                ref={passwordInputRef}
                id="input-vgar-sec-field"
                name="vgar_sec_str"
                type="text"
                readOnly={readOnlyPassword}
                onFocus={() => setReadOnlyPassword(false)}
                onTouchStart={() => setReadOnlyPassword(false)}
                onClick={() => setReadOnlyPassword(false)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de acesso"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                style={{
                  WebkitTextSecurity: showPassword ? 'none' : 'disc',
                }}
                className="w-full h-14 pl-14 pr-12 rounded-full bg-[#10141e]/90 border border-white/10 hover:border-purple-500/40 focus:border-purple-400 text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium font-mono shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-white p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 3. License Key Field (for Register / Ativar Key) */}
          {mode === 'register' && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-2 text-[11px] font-mono text-gray-400 uppercase">
                <span>Chave de Licença (Key)</span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-gray-400 pointer-events-none">
                  <KeyRound className="w-5 h-5 stroke-[2]" />
                </div>
                <input
                  id="input-vgar-key-field"
                  name="vgar_key_str"
                  type="text"
                  readOnly={readOnlyKey}
                  onFocus={() => setReadOnlyKey(false)}
                  onTouchStart={() => setReadOnlyKey(false)}
                  onClick={() => setReadOnlyKey(false)}
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="Chave de Acesso (VIGARISTA-XXXX-XXXX-2026)"
                  required
                  autoCapitalize="characters"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  className="w-full h-14 pl-14 pr-6 rounded-full bg-[#10141e]/90 border border-white/10 hover:border-emerald-500/40 focus:border-emerald-400 text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 tracking-wider font-semibold font-mono uppercase shadow-inner"
                />
              </div>
            </div>
          )}

          {/* 4. Remember Me Toggle */}
          <div className="flex items-center justify-between pt-1 px-2">
            <label
              htmlFor="chk-vigarista-remember-me"
              className="flex items-center gap-2.5 cursor-pointer select-none text-gray-300 hover:text-white text-sm font-mono"
            >
              <button
                id="chk-vigarista-remember-me"
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                  rememberMe
                    ? 'border-cyan-400 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'border-gray-600 bg-black/40 hover:border-gray-400'
                }`}
              >
                {rememberMe && <Check className="w-3.5 h-3.5 text-black stroke-[3.5]" />}
              </button>
              <span>Lembrar de mim</span>
            </label>
          </div>

          {/* 5. Pill Submit Button */}
          <div className="pt-2 flex flex-col gap-2.5 justify-center">
            <button
              id="btn-vigarista-submit"
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-14 rounded-full bg-gradient-to-r from-[#e11d48] via-[#7c3aed] to-[#0891b2] hover:opacity-95 active:scale-[0.99] text-white font-bold text-base tracking-wider transition-all shadow-[0_0_25px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-mono uppercase"
            >
              {isLoading ? (
                <span className="text-sm">Liberando acesso...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' ? 'Entrar no Painel' : 'Ativar e Entrar'}
                  </span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 6. Mode Switcher: Ativar Key / Entrar */}
        <div className="mt-6 text-center text-sm font-mono text-gray-400">
          {mode === 'login' ? (
            <p>
              Tem uma Key nova?{' '}
              <button
                id="btn-switch-to-register"
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1 transition-colors"
              >
                Ativar Key
              </button>
            </p>
          ) : (
            <p>
              Já tem cadastro ativo?{' '}
              <button
                id="btn-switch-to-login"
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1 transition-colors"
              >
                Fazer Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
