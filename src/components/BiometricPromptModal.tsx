import React, { useState } from 'react';
import { ShieldCheck, X, Sparkles, Check } from 'lucide-react';
import { registerBiometricCredential } from '../utils/biometricAuth';

interface BiometricPromptModalProps {
  isOpen: boolean;
  username: string;
  licenseKey: string;
  onComplete: () => void;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  isOpen,
  username,
  licenseKey,
  onComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');

  if (!isOpen) return null;

  const handleEnableBiometrics = async () => {
    setIsProcessing(true);
    setStatusText('Aguardando leitura do sensor facial...');
    try {
      const res = await registerBiometricCredential(username, licenseKey);
      if (res.success) {
        setStatusText('Face ID cadastrado com sucesso!');
        setTimeout(() => {
          onComplete();
        }, 500);
      } else {
        setStatusText(res.message || 'Face ID cancelado.');
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    } catch {
      onComplete();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e131b] border border-cyan-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl shadow-cyan-950/60 relative animate-in zoom-in-95 text-center text-white">
        {/* Apple Face ID Icon Graphic */}
        <div className="mx-auto mb-5 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-blue-950/60 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] relative">
          {/* Face ID Brackets SVG */}
          <svg
            className="w-12 h-12 text-cyan-400 stroke-current animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Top-left corner */}
            <path d="M4 8V6a2 2 0 0 1 2-2h2" />
            {/* Top-right corner */}
            <path d="M16 4h2a2 2 0 0 1 2 2v2" />
            {/* Bottom-right corner */}
            <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
            {/* Bottom-left corner */}
            <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
            {/* Eyes */}
            <circle cx="9" cy="10" r="0.75" fill="currentColor" />
            <circle cx="15" cy="10" r="0.75" fill="currentColor" />
            {/* Nose & Smile */}
            <path d="M12 11v2.5" />
            <path d="M9 16c.8 1 2.2 1.5 3 1.5s2.2-.5 3-1.5" />
          </svg>
        </div>

        <h2 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono mb-2">
          Ativar Face ID?
        </h2>

        <p className="text-xs text-gray-300 font-mono leading-relaxed mb-6">
          Acesse sua conta <strong className="text-cyan-300 font-bold">@{username}</strong> instantaneamente com o sensor biométrico do seu celular, sem precisar digitar sua senha.
        </p>

        {statusText && (
          <p className="text-xs text-cyan-400 font-mono mb-4 animate-in fade-in">
            {statusText}
          </p>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleEnableBiometrics}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-gray-950 font-black text-sm uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-gray-950" />
            <span>{isProcessing ? 'Validando...' : 'Ativar Face ID'}</span>
          </button>

          <button
            type="button"
            onClick={onComplete}
            disabled={isProcessing}
            className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-200 font-mono transition-colors cursor-pointer"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};
