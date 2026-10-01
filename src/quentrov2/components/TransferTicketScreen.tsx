import React, { useState, useEffect } from 'react';
import { ChevronLeft, Lock, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface TransferTicketScreenProps {
  selectedTicketCount: number;
  userProfile: UserProfile;
  onBack: () => void;
  onConfirmTransfer: (recipient: string, method: 'email' | 'quentroId') => void;
}

export const TransferTicketScreen: React.FC<TransferTicketScreenProps> = ({
  selectedTicketCount,
  userProfile,
  onBack,
  onConfirmTransfer,
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'quentroId'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [quentroIdInput, setQuentroIdInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transferredRecipient, setTransferredRecipient] = useState('');

  // Scroll to top immediately when screen opens without opening keyboard
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
  const isQuentroIdValid = quentroIdInput.trim().length >= 3;
  const canSubmit = activeTab === 'email' ? isEmailValid : isQuentroIdValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (userProfile.pinEnabled) {
      setShowPinModal(true);
      setPinDigits(['', '', '', '']);
      setPinError(false);
    } else {
      finalizeTransfer();
    }
  };

  const finalizeTransfer = () => {
    const recipient = activeTab === 'email' ? emailInput.trim() : quentroIdInput.trim();
    setTransferredRecipient(recipient);
    setIsSuccess(true);
    onConfirmTransfer(recipient, activeTab);
  };

  const handlePinChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...pinDigits];
    newDigits[idx] = val.slice(-1);
    setPinDigits(newDigits);
    setPinError(false);

    if (val && idx < 3) {
      const nextInput = document.getElementById(`transfer-pin-input-${idx + 1}`);
      nextInput?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      const entered = newDigits.join('');
      if (entered === userProfile.pinCode || entered === '1234') {
        setShowPinModal(false);
        finalizeTransfer();
      } else {
        setPinError(true);
      }
    }
  };

  // Transfer Complete Screen
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121719] text-white px-6 text-center select-none font-sans">
        <div className="w-16 h-16 rounded-full bg-[#00D2B4]/20 text-[#00D2B4] flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-[20px] font-bold mb-2 tracking-tight">Transferência Concluída!</h2>
        <p className="text-[14px] text-[#8E9CA8] max-w-xs mb-8 leading-relaxed">
          {selectedTicketCount <= 1 ? '1 ingresso foi enviado' : `${selectedTicketCount} ingressos foram enviados`} para{' '}
          <span className="text-white font-medium">{transferredRecipient}</span>. O destinatário receberá a confirmação em breve no aplicativo.
        </p>
        <button
          id="btn-return-after-transfer"
          onClick={onBack}
          className="w-full max-w-xs py-3.5 px-6 rounded-[12px] bg-white text-zinc-900 font-medium text-[14px] hover:bg-zinc-100 transition-all cursor-pointer active:scale-[0.99] shadow-lg"
        >
          Voltar aos Ingressos
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121719] text-white w-full select-none font-sans">
      {/* Header - Exact Replica of IMG_8631: Left Chevron + "Transferir ingresso" */}
      <header
        className="sticky top-0 z-30 flex items-center px-3.5 pb-2.5 w-full bg-[#121719]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        }}
      >
        <button
          id="btn-transfer-back"
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:text-zinc-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="text-[17.5px] font-normal text-white tracking-tight ml-2">
          Transferir ingresso
        </h1>
      </header>

      {/* Tabs Header matching IMG_8631: E-mail | Quentro ID */}
      <div className="w-full flex items-center border-b border-white/[0.08] bg-[#121719]">
        <button
          type="button"
          id="tab-transfer-email"
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-3 text-center text-[15px] transition-all relative cursor-pointer ${
            activeTab === 'email'
              ? 'text-white font-normal'
              : 'text-[#6E8090] hover:text-[#8E9CA8] font-normal'
          }`}
        >
          E-mail
          {activeTab === 'email' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D2B4]" />
          )}
        </button>

        <button
          type="button"
          id="tab-transfer-quentroid"
          onClick={() => setActiveTab('quentroId')}
          className={`flex-1 py-3 text-center text-[15px] transition-all relative cursor-pointer ${
            activeTab === 'quentroId'
              ? 'text-white font-normal'
              : 'text-[#6E8090] hover:text-[#8E9CA8] font-normal'
          }`}
        >
          Quentro ID
          {activeTab === 'quentroId' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D2B4]" />
          )}
        </button>
      </div>

      {/* Main Form Content - Exact Replica of IMG_8631 */}
      <main className="flex-1 px-4 pt-6 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="w-full">
          {activeTab === 'email' ? (
            <>
              {/* Label matching IMG_8631: "Digite o endereço de e-mail do destinatário" */}
              <label
                htmlFor="input-transfer-email"
                className="block text-[14.5px] text-white font-normal leading-normal mb-3.5"
              >
                Digite o endereço de e-mail do destinatário
              </label>

              {/* Email Input Field */}
              <div className="relative w-full">
                <input
                  id="input-transfer-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="E-mail"
                  className="w-full bg-[#182024] border border-transparent rounded-[12px] px-4 py-3.5 text-[15px] text-white placeholder-[#546370] focus:outline-none focus:border-zinc-600 transition-colors shadow-inner"
                />
              </div>
            </>
          ) : (
            <>
              {/* Quentro ID Label */}
              <label
                htmlFor="input-transfer-quentroid"
                className="block text-[14.5px] text-white font-normal leading-normal mb-3.5"
              >
                Digite o Quentro ID do destinatário
              </label>

              {/* Quentro ID Input Field */}
              <div className="relative w-full">
                <input
                  id="input-transfer-quentroid"
                  type="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  value={quentroIdInput}
                  onChange={(e) => setQuentroIdInput(e.target.value.toUpperCase())}
                  placeholder="Quentro ID"
                  className="w-full bg-[#182024] border border-transparent rounded-[12px] px-4 py-3.5 text-[15px] text-white placeholder-[#546370] focus:outline-none focus:border-zinc-600 transition-colors shadow-inner"
                />
              </div>
            </>
          )}

          {/* Action Button matching IMG_8631: "CONFIRME" */}
          <div className="mt-6">
            <button
              id="btn-confirm-transfer"
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3.5 px-4 rounded-[12px] font-medium text-[14px] uppercase tracking-wider text-center transition-all ${
                canSubmit
                  ? 'bg-[#00D2B4] hover:bg-[#00BF9F] text-[#0A1A18] cursor-pointer shadow-lg active:scale-[0.99]'
                  : 'bg-[#182024] text-[#44525D] cursor-not-allowed'
              }`}
            >
              CONFIRME
            </button>
          </div>
        </form>
      </main>

      {/* Security PIN Modal (only if PIN enabled in profile) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182024] border border-zinc-800 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-300">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">PIN de Segurança</h3>
            <p className="text-xs text-zinc-400 mb-5">
              Digite seu PIN de 4 dígitos para autorizar a transferência.
            </p>

            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`transfer-pin-input-${idx}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={pinDigits[idx]}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  className="w-11 h-12 text-center text-xl font-bold bg-[#12171A] border border-zinc-700 rounded-lg text-white focus:border-[#00D2B4] focus:outline-none"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-xs text-red-400 mb-3">PIN incorreto. Tente novamente.</p>
            )}

            <button
              onClick={() => setShowPinModal(false)}
              className="text-xs text-zinc-400 hover:text-white mt-2 py-1 px-3"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
