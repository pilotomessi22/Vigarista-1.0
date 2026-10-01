import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { verifyMasterSecret } from '../utils/cryptoAuth';
import { checkBruteForceStatus, registerFailedAttempt, resetFailedAttempts } from '../utils/securityShield';
import { recordLoginAttempt } from '../utils/securityLogs';

interface MasterPasswordPromptModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const MasterPasswordPromptModal: React.FC<MasterPasswordPromptModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const bruteStatus = checkBruteForceStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (bruteStatus.isLocked) {
      setErrorMessage(`Bloqueio de segurança anti-invasão ativo. Aguarde ${bruteStatus.remainingSec}s.`);
      return;
    }

    setIsChecking(true);

    setTimeout(() => {
      setIsChecking(false);
      const isMasterValid = verifyMasterSecret(password.trim());

      if (isMasterValid) {
        recordLoginAttempt('success', 'master_access', 'master_admin', 'MASTER_AUTHORIZED');
        resetFailedAttempts();
        setPassword('');
        onSuccess();
      } else {
        const attempt = registerFailedAttempt();
        recordLoginAttempt(
          'failure',
          'master_access',
          'master_admin',
          attempt.isLocked ? 'MASTER_RATE_LIMITED' : 'INVALID_MASTER_SECRET'
        );
        if (attempt.isLocked) {
          setErrorMessage(`Múltiplas tentativas incorretas detectadas! Acesso bloqueado por ${attempt.remainingSec} segundos para segurança.`);
        } else {
          setErrorMessage('Senha mestre incorreta. A tentativa foi registrada no sistema.');
        }
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="w-full max-w-sm bg-[#0f1722] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,229,187,0.2)] overflow-hidden flex flex-col text-white my-auto animate-in zoom-in-95">
        <div className="p-6 text-center border-b border-white/5 bg-[#141f2d] relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-3">
            <KeyRound className="w-7 h-7 text-gray-950 stroke-[2.4]" />
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">
            Autenticação Mestre
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Digite a senha mestre para acessar o gerador de keys
          </p>
        </div>

        <div
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          className="p-6 space-y-4"
        >
          {errorMessage && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Senha Mestre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="sys-mstr-auth-key"
                name="vgar_mstr_tok"
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Digite a senha mestre..."
                autoFocus
                required
                autoComplete="one-time-code"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                style={{
                  WebkitTextSecurity: showPassword ? 'none' : 'disc',
                }}
                className="w-full pl-10 pr-10 py-3 bg-[#0a1017] border border-cyan-500/30 rounded-xl text-sm font-bold text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 tracking-wider shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => handleSubmit(e as any)}
            disabled={isChecking || !password.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-gray-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {isChecking ? (
              <span>Verificando...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Desbloquear Painel Mestre</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
