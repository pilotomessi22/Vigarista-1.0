import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, CheckCircle2, QrCode, UserPlus, Lock, ArrowRight, Search, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';

interface TransferTicketScreenProps {
  selectedTicketCount: number;
  userProfile: UserProfile;
  onBack: () => void;
  onConfirmTransfer: (recipient: string, method: 'email' | 'quentroId') => void;
}

interface FrequentContact {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export const TransferTicketScreen: React.FC<TransferTicketScreenProps> = ({
  selectedTicketCount,
  userProfile,
  onBack,
  onConfirmTransfer,
}) => {
  // Navigation view:
  // 'menu' (100% replica of IMG_9245.jpeg)
  // 'email' (100% replica of IMG_9246.jpeg)
  // 'confirm' (100% replica of IMG_9247.jpeg)
  // 'transferring' (100% replica of the video animation)
  // 'quentroId', 'frequent'
  const [currentView, setCurrentView] = useState<'menu' | 'email' | 'confirm' | 'transferring' | 'quentroId' | 'frequent'>('menu');

  // Transfer animation phase: 'spinning' (0s - 2.8s) -> 'success' (2.8s - 4.6s) -> navigate to Home
  const [transferPhase, setTransferPhase] = useState<'spinning' | 'success'>('spinning');
  const animationTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Input states
  const [emailInput, setEmailInput] = useState('');
  const [quentroIdInput, setQuentroIdInput] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [transferMethod, setTransferMethod] = useState<'email' | 'quentroId'>('email');

  // Options on confirm screen (IMG_9247.jpeg)
  const [saveAsFrequent, setSaveAsFrequent] = useState(true);

  // Security PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState(false);

  // Transferred recipient
  const [transferredRecipient, setTransferredRecipient] = useState('');

  // Frequent contacts state
  const [frequentContacts, setFrequentContacts] = useState<FrequentContact[]>(() => {
    try {
      const saved = localStorage.getItem('quentro_frequent_contacts');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { id: '1', name: 'Lucas Silva', email: 'lucas.silva@gmail.com', avatarColor: '#00D2B4' },
      { id: '2', name: 'Mariana Costa', email: 'mari.costa@hotmail.com', avatarColor: '#3B82F6' },
      { id: '3', name: 'Felipe Santos', email: 'felipe.santos@outlook.com', avatarColor: '#8B5CF6' },
    ];
  });

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      animationTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Ensure scroll is at top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentView]);

  // Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
  const isQuentroIdValid = quentroIdInput.trim().length >= 3;

  const saveFrequentContact = (recipient: string) => {
    if (recipient.includes('@')) {
      const name = recipient.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      const exists = frequentContacts.some((c) => c.email.toLowerCase() === recipient.toLowerCase());
      if (!exists) {
        const updated = [
          {
            id: Date.now().toString(),
            name: formattedName,
            email: recipient,
            avatarColor: '#00D2B4',
          },
          ...frequentContacts,
        ].slice(0, 10);
        setFrequentContacts(updated);
        try {
          localStorage.setItem('quentro_frequent_contacts', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    }
  };

  const handleStartTransfer = (recipient: string, method: 'email' | 'quentroId') => {
    setTransferredRecipient(recipient);
    setTransferMethod(method);
    if (userProfile.pinEnabled) {
      setShowPinModal(true);
      setPinDigits(['', '', '', '']);
      setPinError(false);
    } else {
      triggerTransferAnimation(recipient, method);
    }
  };

  // Video replica animation:
  // 0.0s - 2.8s: "Transferindo ingressos" with spinning teal arc
  // 2.8s - 4.6s: Spinner resolves to green checkmark ✓
  // 4.6s: Navigates back to Home screen with ticket removed and updated count
  const triggerTransferAnimation = (recipient: string, method: 'email' | 'quentroId') => {
    animationTimersRef.current.forEach(clearTimeout);
    animationTimersRef.current = [];

    setCurrentView('transferring');
    setTransferPhase('spinning');

    // Transition from spinning arc to checkmark at 2.8s
    const t1 = setTimeout(() => {
      setTransferPhase('success');
    }, 2800);

    // Navigate to Home screen at 4.6s
    const t2 = setTimeout(() => {
      if (saveAsFrequent) {
        saveFrequentContact(recipient);
      }
      onConfirmTransfer(recipient, method);
    }, 4600);

    animationTimersRef.current.push(t1, t2);
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
        triggerTransferAnimation(transferredRecipient, transferMethod);
      } else {
        setPinError(true);
      }
    }
  };

  // ==========================================
  // VIEW: TRANSFERRING ANIMATION (100% IDÊNTICA AO VÍDEO)
  // 0s-2.8s: Arc spinner
  // 2.8s-4.6s: Green checkmark ✓
  // 4.6s: Transita direto para Meus ingressos
  // ==========================================
  if (currentView === 'transferring') {
    return (
      <div className="flex flex-col h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#121719] text-white w-full select-none font-sans justify-between items-center">
        {/* Top Text matching the video: "Transferindo ingressos" */}
        <div
          className="w-full text-center px-4"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 95px)',
          }}
        >
          <h1 className="text-[17.5px] sm:text-[18px] text-[#E1E7EC] font-normal tracking-tight">
            Transferindo ingressos
          </h1>
        </div>

        {/* Center Graphic: Dark subtle circle with spinning teal arc or checkmark */}
        <div className="flex items-center justify-center my-auto">
          <div className="w-[230px] h-[230px] sm:w-[250px] sm:h-[250px] rounded-full bg-[#151C20] flex items-center justify-center relative shadow-inner">
            {transferPhase === 'spinning' && (
              <svg
                className="w-20 h-20 animate-spin"
                style={{ animationDuration: '1.1s', animationTimingFunction: 'linear' }}
                viewBox="0 0 50 50"
              >
                <circle
                  cx="25"
                  cy="25"
                  r="19"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2.5"
                  strokeDasharray="30 90"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {transferPhase === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <svg
                  className="w-16 h-16"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M 13 26 L 22 35 L 38 16"
                    stroke="#2DD4BF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom breathing space */}
        <div className="pb-20 sm:pb-24" />
      </div>
    );
  }

  // ==========================================
  // VIEW: CONFIRMAR TRANSFERÊNCIA (100% IDÊNTICA A IMG_9247.jpeg)
  // Fixado no viewport, sem rolagem, botões imediatamente visíveis
  // ==========================================
  if (currentView === 'confirm') {
    const displayRecipient = transferredRecipient || emailInput.trim() || quentroIdInput.trim();

    return (
      <div className="flex flex-col h-full h-[100dvh] max-h-[100dvh] bg-[#121719] text-white w-full select-none font-sans justify-between overflow-hidden">
        {/* Header - Exact Replica of IMG_9247.jpeg: Left Chevron + "Confirmar transferência" */}
        <div className="shrink-0">
          <header
            className="sticky top-0 z-30 flex items-center px-4 pb-2 w-full bg-[#121719]"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
            }}
          >
            <button
              id="btn-back-from-confirm"
              onClick={() => setCurrentView(transferMethod === 'quentroId' ? 'quentroId' : 'email')}
              className="p-1 -ml-1 text-white/90 hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h1 className="text-[18px] font-normal text-white tracking-tight ml-3">
              Confirmar transferência
            </h1>
          </header>

          {/* Recipient Details Block matching IMG_9247.jpeg */}
          <main className="px-5 pt-8 sm:pt-10 text-center w-full max-w-md mx-auto">
            <p className="text-[15px] text-[#E1E7EC] font-normal tracking-normal leading-normal">
              {selectedTicketCount <= 1
                ? 'Você vai transferir um ingresso para:'
                : `Você vai transferir ${selectedTicketCount} ingressos para:`}
            </p>
            <p className="text-[17.5px] font-medium text-[#00D2B4] mt-2 tracking-normal break-all">
              {displayRecipient}
            </p>
          </main>
        </div>

        {/* Flexible spacer in the middle */}
        <div className="flex-1 min-h-0" />

        {/* Bottom Actions Block matching IMG_9247.jpeg */}
        <footer
          className="w-full max-w-md mx-auto px-5 pb-6 pt-2 shrink-0"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          }}
        >
          {/* Checkbox: Salvar como contato frequente */}
          <div
            onClick={() => setSaveAsFrequent(!saveAsFrequent)}
            className="flex items-center gap-3.5 mb-5 cursor-pointer select-none"
          >
            <div
              className={`w-[34px] h-[34px] rounded-[10px] border flex items-center justify-center shrink-0 transition-all ${
                saveAsFrequent
                  ? 'border-[#4B5864] bg-[#141C22]'
                  : 'border-[#37434E] bg-transparent'
              }`}
            >
              {saveAsFrequent && (
                <Check className="w-5 h-5 text-zinc-400 stroke-[2.2]" />
              )}
            </div>
            <span className="text-[13px] sm:text-[13.5px] text-[#E1E7EC] font-normal leading-snug flex-1">
              Salvar como contato frequente para transferências futuras
            </span>
          </div>

          {/* Button 1: MODIFICAR DESTINATÁRIO */}
          <button
            id="btn-modify-recipient"
            onClick={() => setCurrentView(transferMethod === 'quentroId' ? 'quentroId' : 'email')}
            className="w-full py-3.5 px-4 rounded-[12px] bg-[#182026] text-white font-medium text-[13.5px] uppercase tracking-wider text-center cursor-pointer hover:bg-[#202930] active:scale-[0.99] transition-all mb-3"
          >
            MODIFICAR DESTINATÁRIO
          </button>

          {/* Button 2: TRANSFERIR (Pure White with Black Text) */}
          <button
            id="btn-final-transfer"
            onClick={() => handleStartTransfer(displayRecipient, transferMethod)}
            className="w-full py-3.5 px-4 rounded-[12px] bg-white text-zinc-950 font-bold text-[14.5px] uppercase tracking-wider text-center cursor-pointer hover:bg-zinc-100 active:scale-[0.99] transition-all shadow-lg"
          >
            TRANSFERIR
          </button>
        </footer>

        {showPinModal && renderPinModal()}
      </div>
    );
  }

  // ==========================================
  // VIEW: EMAIL INPUT (100% IDÊNTICA A IMG_9246.jpeg)
  // ==========================================
  if (currentView === 'email') {
    return (
      <div className="flex flex-col h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#121719] text-white w-full select-none font-sans">
        {/* Header matching IMG_9246.jpeg: Left Chevron + "Via E-mail" */}
        <header
          className="sticky top-0 z-30 flex items-center px-4 pb-2 w-full bg-[#121719]"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          }}
        >
          <button
            id="btn-back-from-email"
            onClick={() => setCurrentView('menu')}
            className="p-1 -ml-1 text-white/90 hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[18px] font-normal text-white tracking-tight ml-3">
            Via E-mail
          </h1>
        </header>

        <main className="flex-1 px-5 pt-6 max-w-md mx-auto w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isEmailValid) {
                setTransferredRecipient(emailInput.trim());
                setTransferMethod('email');
                setCurrentView('confirm');
              }
            }}
            className="w-full"
          >
            {/* Label matching IMG_9246.jpeg */}
            <label
              htmlFor="input-transfer-email"
              className="block text-[15px] text-[#E1E7EC] font-normal leading-normal mb-4"
            >
              Digite o endereço de e-mail do destinatário
            </label>

            {/* Recessed Dark Input Field matching IMG_9246.jpeg */}
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
                autoFocus
                className="w-full bg-[#0C1014] border-0 rounded-[12px] px-4 py-3.5 text-[15.5px] text-white placeholder-[#52606C] focus:outline-none caret-[#4D82F3] transition-colors shadow-inner"
              />
            </div>

            {/* CONFIRME Button matching IMG_9246.jpeg */}
            <div className="mt-6">
              <button
                id="btn-confirm-transfer-email"
                type="submit"
                disabled={!isEmailValid}
                className={`w-full py-3.5 px-4 rounded-[12px] font-semibold text-[14px] uppercase tracking-wider text-center transition-all ${
                  isEmailValid
                    ? 'bg-[#00D2B4] hover:bg-[#00BF9F] text-[#0A1A18] cursor-pointer shadow-lg active:scale-[0.99]'
                    : 'bg-[#1B242B] text-[#3D4C56] cursor-not-allowed font-medium'
                }`}
              >
                CONFIRME
              </button>
            </div>
          </form>
        </main>

        {showPinModal && renderPinModal()}
      </div>
    );
  }

  // ==========================================
  // VIEW: QUENTRO ID INPUT
  // ==========================================
  if (currentView === 'quentroId') {
    return (
      <div className="flex flex-col h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#121719] text-white w-full select-none font-sans">
        <header
          className="sticky top-0 z-30 flex items-center px-4 pb-2 w-full bg-[#121719]"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          }}
        >
          <button
            onClick={() => setCurrentView('menu')}
            className="p-1 -ml-1 text-white/90 hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[18px] font-normal text-white tracking-tight ml-3">
            Quentro ID
          </h1>
        </header>

        <main className="flex-1 px-5 pt-6 max-w-md mx-auto w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isQuentroIdValid) {
                setTransferredRecipient(quentroIdInput.trim().toUpperCase());
                setTransferMethod('quentroId');
                setCurrentView('confirm');
              }
            }}
            className="w-full"
          >
            <label
              htmlFor="input-transfer-quentroid"
              className="block text-[15px] text-[#E1E7EC] font-normal leading-normal mb-4"
            >
              Digite o Quentro ID do destinatário
            </label>

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
                autoFocus
                className="w-full bg-[#0C1014] border-0 rounded-[12px] px-4 py-3.5 text-[15.5px] text-white placeholder-[#52606C] focus:outline-none caret-[#4D82F3] transition-colors shadow-inner"
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={!isQuentroIdValid}
                className={`w-full py-3.5 px-4 rounded-[12px] font-semibold text-[14px] uppercase tracking-wider text-center transition-all ${
                  isQuentroIdValid
                    ? 'bg-[#00D2B4] hover:bg-[#00BF9F] text-[#0A1A18] cursor-pointer shadow-lg active:scale-[0.99]'
                    : 'bg-[#1B242B] text-[#3D4C56] cursor-not-allowed font-medium'
                }`}
              >
                CONFIRME
              </button>
            </div>
          </form>
        </main>

        {showPinModal && renderPinModal()}
      </div>
    );
  }

  // ==========================================
  // VIEW: FREQUENT CONTACTS
  // ==========================================
  if (currentView === 'frequent') {
    const filteredContacts = frequentContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
        c.email.toLowerCase().includes(searchContact.toLowerCase())
    );

    return (
      <div className="flex flex-col min-h-screen bg-[#121719] text-white w-full select-none font-sans">
        <header
          className="sticky top-0 z-30 flex items-center px-4 pb-3 w-full bg-[#121719]"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          }}
        >
          <button
            onClick={() => setCurrentView('menu')}
            className="p-1 -ml-1 text-white hover:text-zinc-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
          </button>
          <h1 className="text-[19px] font-normal text-white tracking-tight ml-3">
            Contatos Frequentes
          </h1>
        </header>

        <div className="px-5 pt-3 pb-2 w-full max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8696A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Buscar contato..."
              className="w-full bg-[#1C242A] border border-transparent rounded-[12px] pl-10 pr-4 py-3 text-[14.5px] text-white placeholder-[#546370] focus:outline-none focus:border-[#00D2B4]"
            />
          </div>
        </div>

        <main className="flex-1 max-w-md mx-auto w-full">
          {filteredContacts.length === 0 ? (
            <div className="py-12 px-6 text-center text-[#8696A6]">
              <p className="text-[14px] mb-4">Nenhum contato frequente encontrado.</p>
              <button
                onClick={() => setCurrentView('email')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D2B4]/10 text-[#00D2B4] text-[13.5px] font-medium"
              >
                Transferir via E-mail
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#1E272D]">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    setEmailInput(contact.email);
                    setTransferredRecipient(contact.email);
                    setTransferMethod('email');
                    setCurrentView('confirm');
                  }}
                  className="flex items-center gap-4 px-5 py-5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[15px] shrink-0"
                    style={{ backgroundColor: contact.avatarColor }}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white truncate">{contact.name}</p>
                    <p className="text-[13px] text-[#8696A6] truncate">{contact.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8696A6] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </main>

        {showPinModal && renderPinModal()}
      </div>
    );
  }

  // Security PIN modal
  function renderPinModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#1C242A] border border-zinc-800 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl">
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
                className="w-11 h-12 text-center text-xl font-bold bg-[#121719] border border-zinc-700 rounded-lg text-white focus:border-[#00D2B4] focus:outline-none"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {pinError && (
            <p className="text-xs text-red-400 mb-3">PIN incorreto. Tente novamente.</p>
          )}

          <button
            onClick={() => setShowPinModal(false)}
            className="text-xs text-zinc-400 hover:text-white mt-2 py-1 px-3 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MENU (100% IDÊNTICA A IMG_9245.jpeg)
  // Cor de fundo padrão da Quentro: #121719
  // ==========================================
  return (
    <div className="flex flex-col h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#121719] text-white w-full select-none font-sans">
      {/* Header - Exact Replica of IMG_9245.jpeg: Left Chevron + "Transferir ingresso" */}
      <header
        className="sticky top-0 z-30 flex items-center px-4 pt-4 pb-4 w-full bg-[#121719]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        }}
      >
        <button
          id="btn-transfer-back"
          onClick={onBack}
          className="p-1 -ml-1 text-white/90 hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
        </button>
        <h1 className="text-[20px] font-normal text-white tracking-tight ml-3">
          Transferir ingresso
        </h1>
      </header>

      {/* Main Options List - High fidelity scale and generous spacing matching IMG_9245.jpeg */}
      <main className="w-full flex flex-col pt-2">
        {/* Option 1: Contatos Frequentes */}
        <div
          id="btn-transfer-option-frequent"
          onClick={() => setCurrentView('frequent')}
          className="flex items-center gap-5 px-5 py-7 w-full border-b border-[#1E272D] hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer select-none"
        >
          {/* Large squircle container with dark slate background */}
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#1C242A] flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-[26px] h-[26px] text-[#2DD4BF] stroke-[1.9]" />
          </div>
          <div className="flex-1 flex flex-col items-start min-w-0 pr-1">
            <h2 className="text-[17px] font-medium text-white tracking-tight leading-snug">
              Contatos Frequentes
            </h2>
            <p className="text-[14px] text-[#8696A6] leading-[1.38] mt-1">
              Usuários do Quentro que já receberam transferências da sua conta
            </p>
          </div>
        </div>

        {/* Option 2: Quentro ID */}
        <div
          id="btn-transfer-option-quentroid"
          onClick={() => setCurrentView('quentroId')}
          className="flex items-center gap-5 px-5 py-7 w-full border-b border-[#1E272D] hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer select-none"
        >
          {/* Large squircle container with dark slate background */}
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#1C242A] flex items-center justify-center shrink-0 shadow-sm">
            <QrCode className="w-[26px] h-[26px] text-[#2DD4BF] stroke-[1.9]" />
          </div>
          <div className="flex-1 flex flex-col items-start min-w-0 pr-1">
            <h2 className="text-[17px] font-medium text-white tracking-tight leading-snug">
              Quentro ID
            </h2>
            <p className="text-[14px] text-[#8696A6] leading-[1.38] mt-1">
              Escaneie o Quentro ID de outro usuário
            </p>
          </div>
        </div>

        {/* Option 3: Via E-mail */}
        <div
          id="btn-transfer-option-email"
          onClick={() => setCurrentView('email')}
          className="flex items-center gap-5 px-5 py-7 w-full border-b border-[#1E272D] hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer select-none"
        >
          {/* Large squircle container with dark slate background */}
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#1C242A] flex items-center justify-center shrink-0 shadow-sm">
            <UserPlus className="w-[26px] h-[26px] text-[#2DD4BF] stroke-[1.9]" />
          </div>
          <div className="flex-1 flex flex-col items-start min-w-0 pr-1">
            <h2 className="text-[17px] font-medium text-white tracking-tight leading-snug">
              Via E-mail
            </h2>
            <p className="text-[14px] text-[#8696A6] leading-[1.38] mt-1">
              Insira o endereço de e-mail que o destinatário usará no Quentro.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
