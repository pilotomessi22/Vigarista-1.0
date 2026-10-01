import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShieldCheck, RefreshCw, Send, Check, Download } from 'lucide-react';
import { OrderItem } from '../types';
import { TicketmasterLogo } from './TicketmasterLogo';

interface QuentroTicketModalProps {
  order: OrderItem;
  email: string;
  onBack: () => void;
}

export const QuentroTicketModal: React.FC<QuentroTicketModalProps> = ({
  order,
  email,
  onBack,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [qrToken, setQrToken] = useState('TM-BR-74195357-A84F');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic QR Code countdown: regenerates code token every 15s to simulate real Quentro anti-screenshot security
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Generate new token
          const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
          setQrToken(`TM-BR-74195357-${randomHex}`);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferEmail.trim()) {
      setTransferSuccess(true);
      setTimeout(() => {
        setIsTransferring(false);
        setTransferSuccess(false);
        setTransferEmail('');
        showToast(`Ingresso transferido para ${transferEmail}!`);
      }, 2000);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const eventTitle = (order.eventName || 'BTS WORLD TOUR ARIRANG').toUpperCase();

  return (
    <div className="min-h-screen bg-[#edf0f5] text-[#000000] flex flex-col pb-20 selection:bg-[#34b0a2] selection:text-white font-sans antialiased relative">
      {/* iOS Overscroll Top Shield (Guarantees zero white gap when pulling down on iPhone) */}
      <div className="absolute -top-[500px] left-0 right-0 h-[500px] bg-[#1E4CD6] pointer-events-none z-50" />
      {/* ========================================================================= */}
      {/* 1. TICKETMASTER BLUE TOP HEADER - EXACT MATCH TO 5D3D79B8-B5AA-47F0-B22C-01258169919D.jpeg */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-[#1E4CD6] text-white select-none pt-[env(safe-area-inset-top,0px)] shadow-xs">
        {/* Top row: ticketmaster logo + 3 white lines (≡) */}
        <div className="flex h-[48px] w-full items-center justify-between px-4">
          {/* Left: ticketmaster® logo */}
          <button
            type="button"
            onClick={onBack}
            className="focus:outline-none flex items-center cursor-pointer hover:opacity-95"
            title="Ticketmaster"
          >
            <TicketmasterLogo variant="white" size="md" />
          </button>

          {/* Right: Hamburger menu icon (3 white lines) */}
          <button
            id="quentro-top-menu-btn"
            type="button"
            onClick={onBack}
            className="p-1 -mr-1 text-white hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Menu"
          >
            <div className="flex flex-col justify-center items-end gap-[4.5px] w-[22px]">
              <span className="block h-[2.2px] w-full bg-white rounded-full" />
              <span className="block h-[2.2px] w-full bg-white rounded-full" />
              <span className="block h-[2.2px] w-full bg-white rounded-full" />
            </div>
          </button>
        </div>

        {/* Second row: Meus pedidos (centered) */}
        <div className="w-full pb-3.5 pt-0.5 flex items-center justify-center">
          <span className="text-[15px] font-medium tracking-normal text-white">
            Meus pedidos
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB HEADER: < Voltar | BTS WORLD TOUR ARIRANG                          */}
      {/* ========================================================================= */}
      <div className="w-full bg-white border-b border-gray-200/80 shadow-xs select-none">
        <div className="flex h-[52px] w-full items-center px-4 max-w-lg mx-auto">
          {/* Left: < Voltar */}
          <button
            type="button"
            id="quentro-back-btn"
            onClick={onBack}
            className="flex items-center gap-2 text-black hover:opacity-80 active:scale-98 transition-all cursor-pointer py-2 pl-0.5 pr-2 shrink-0"
          >
            <ChevronLeft className="h-[20px] w-[20px] text-black stroke-[2.4]" />
            <span className="text-[15px] font-normal tracking-normal text-black font-sans">Voltar</span>
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-[#e2e8f0] mx-3 shrink-0" />

          {/* Right/Title: BTS WORLD TOUR ARIRANG */}
          <div className="flex-1 min-w-0 pr-1">
            <h1
              className="text-[14px] sm:text-[15px] font-medium tracking-[0.03em] text-black truncate uppercase font-sans leading-none"
              title={eventTitle}
            >
              {eventTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-lg w-full px-3 sm:px-4 pt-3.5 sm:pt-4">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#111827] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xl flex items-center gap-2 animate-in fade-in">
            <Check className="h-4 w-4 text-[#34b0a2]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* THE TICKET CARD WITH GREEN "Aprovado" BANNER                               */}
        {/* ========================================================================= */}
        <div className="rounded-xl bg-white border border-gray-200/80 shadow-sm overflow-hidden relative">
          {/* Green "Aprovado" Header - Exact color gradient and refined darker typography */}
          <div 
            className="w-full py-5 px-4 text-center select-none flex items-center justify-center min-h-[76px]"
            style={{
              background: 'linear-gradient(90deg, #53c58b 0%, #41b994 48%, #2ea79f 100%)'
            }}
          >
            <h2 className="text-[20px] sm:text-[21px] font-bold text-[#050505] tracking-tight font-sans leading-tight">
              Aprovado
            </h2>
          </div>

          {/* Dynamic Ticket Center (QR Code Section) */}
          <div className="p-6 flex flex-col items-center text-center bg-white">
            {/* Security Notice */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#0f766e] bg-[#0d9488]/10 px-3.5 py-1 rounded-full border border-[#0d9488]/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>QR Code Dinâmico Antifraude Ativo</span>
            </div>

            {/* QR Code Container with animated laser bar */}
            <div className="relative mt-5 p-3 rounded-2xl bg-white border border-gray-100 shadow-xs flex flex-col items-center">
              {/* Animated scanning line */}
              <div className="absolute inset-x-3 h-0.5 bg-[#0d9488] shadow-[0_0_8px_#0d9488] animate-pulse pointer-events-none top-6" />

              {/* Dynamic QR Code representation */}
              <div className="w-44 h-44 bg-white flex items-center justify-center p-1">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-black"
                  fill="currentColor"
                >
                  {/* Outer Frame Top Left */}
                  <rect x="5" y="5" width="28" height="28" fill="black" rx="3" />
                  <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="13" width="12" height="12" fill="black" rx="1" />

                  {/* Outer Frame Top Right */}
                  <rect x="67" y="5" width="28" height="28" fill="black" rx="3" />
                  <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="75" y="13" width="12" height="12" fill="black" rx="1" />

                  {/* Outer Frame Bottom Left */}
                  <rect x="5" y="67" width="28" height="28" fill="black" rx="3" />
                  <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="75" width="12" height="12" fill="black" rx="1" />

                  {/* Randomized & Simulated QR patterns based on countdown */}
                  <rect x="38" y="8" width="8" height="8" fill="black" />
                  <rect x="50" y="12" width="10" height="6" fill="black" />
                  <rect x="38" y="22" width="6" height="10" fill="black" />
                  <rect x="48" y="24" width="12" height="8" fill="black" />

                  <rect x="8" y="38" width="6" height="12" fill="black" />
                  <rect x="18" y="44" width="12" height="6" fill="black" />
                  <rect x="8" y="54" width="10" height="8" fill="black" />

                  <rect x="38" y="38" width="24" height="24" fill="#3ab5a0" rx="2" />
                  <rect x="44" y="44" width="12" height="12" fill="white" rx="1" />

                  <rect x="68" y="38" width="10" height="6" fill="black" />
                  <rect x="82" y="42" width="10" height="12" fill="black" />
                  <rect x="72" y="52" width="18" height="8" fill="black" />

                  <rect x="38" y="68" width="12" height="8" fill="black" />
                  <rect x="54" y="72" width="8" height="12" fill="black" />
                  <rect x="40" y="82" width="18" height="10" fill="black" />

                  <rect x="68" y="68" width="8" height="10" fill="black" />
                  <rect x="80" y="74" width="12" height="8" fill="black" />
                  <rect x="74" y="86" width="16" height="8" fill="black" />
                </svg>
              </div>

              {/* Dynamic Token String */}
              <div className="mt-1 font-mono text-[9.5px] font-semibold text-gray-500 tracking-wider">
                {qrToken}
              </div>
            </div>

            {/* Countdown timer */}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <RefreshCw className={`h-3.5 w-3.5 text-[#0d9488] ${secondsRemaining === 15 ? 'animate-spin' : ''}`} />
              <span>Atualiza em: <strong className="text-[#111827] font-mono">{secondsRemaining}s</strong></span>
            </div>

            {/* Ticket Information Breakdown - Spaced and refined font sizing */}
            <div className="w-full mt-6 space-y-3.5 text-left border-t border-gray-100 pt-5">
              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-gray-500 font-normal">Setor</span>
                <span className="font-semibold text-gray-900 text-[13px]">{order.sector}</span>
              </div>

              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-gray-500 font-normal">Beneficiário(a)</span>
                <span className="font-semibold text-gray-900 text-[13px]">{order.attendeeName}</span>
              </div>

              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-gray-500 font-normal">Documento</span>
                <span className="font-mono text-gray-700 text-[12px]">{order.attendeeCpf}</span>
              </div>

              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-gray-500 font-normal">E-mail Quentro</span>
                <span className="font-mono text-[#0f766e] font-semibold text-[12px]">{email}</span>
              </div>

              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-gray-500 font-normal">Número do Pedido</span>
                <span className="font-mono text-gray-700 text-[12px]">#{order.orderNumber}</span>
              </div>
            </div>

            {/* Transfer Action Button */}
            <div className="w-full mt-6 space-y-3">
              {!isTransferring ? (
                <button
                  id="quentro-transfer-btn"
                  onClick={() => setIsTransferring(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#59c996] to-[#3ab5a0] py-3 text-[13.5px] font-bold text-black transition-all hover:opacity-95 active:scale-98 shadow-xs"
                >
                  <Send className="h-4 w-4" />
                  <span>Transferir Ingresso com Segurança</span>
                </button>
              ) : (
                <form onSubmit={handleTransferSubmit} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-900 text-left">
                    Informe o e-mail do destinatário:
                  </p>
                  <input
                    type="email"
                    required
                    value={transferEmail}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    placeholder="amigo@email.com"
                    className="w-full rounded-lg bg-white px-3 py-2 text-xs text-gray-900 border border-gray-300 focus:border-[#3ab5a0] outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-gradient-to-r from-[#59c996] to-[#3ab5a0] py-2 text-xs font-bold text-black hover:opacity-95"
                    >
                      {transferSuccess ? 'Transferindo...' : 'Confirmar Envio'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTransferring(false)}
                      className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <button
                id="quentro-wallet-btn"
                onClick={() => showToast('Ingresso adicionado à sua Carteira Digital!')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 text-xs sm:text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <Download className="h-4 w-4" />
                <span>Salvar na Carteira Digital (Wallet)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quentro App Disclaimer */}
        <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
          <p>Não aceite capturas de tela. O QR code dinâmico é verificado na catraca.</p>
          <p className="text-[11px] text-gray-400">Tecnologia Quentro Smart Ticket • Licença Ticketmaster</p>
        </div>
      </div>
    </div>
  );
};

