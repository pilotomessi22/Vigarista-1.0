import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, ShieldCheck, QrCode, RefreshCw, Send, CheckCircle2, Info, Share2 } from 'lucide-react';
import { OrderItem, ActiveView } from '../types';

interface QuentroViewProps {
  order: OrderItem;
  onNavigate: (view: ActiveView) => void;
}

export const QuentroView: React.FC<QuentroViewProps> = ({ order, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [fontSizeOffset, setFontSizeOffset] = useState(0);
  const [ticketUnlocked, setTicketUnlocked] = useState(false);
  const [qrCodeTimer, setQrCodeTimer] = useState(15);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferredSuccess, setTransferredSuccess] = useState(false);

  // Dynamic QR Code countdown refresh simulator
  useEffect(() => {
    if (!ticketUnlocked) return;
    const interval = setInterval(() => {
      setQrCodeTimer((prev) => {
        if (prev <= 1) return 15;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ticketUnlocked]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setTicketUnlocked(true);
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferEmail.trim()) {
      setTransferredSuccess(true);
      setTimeout(() => {
        setTransferredSuccess(false);
        setShowTransferModal(false);
        setTransferEmail('');
      }, 2500);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#11161d] text-white flex flex-col"
      style={{ fontSize: `${16 + fontSizeOffset}px` }}
    >
      {/* Top Header Navigation (00:22) */}
      <div className="bg-[#11161d] border-b border-gray-800 sticky top-0 z-30 px-4 py-3">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <button
            id="quentro-back-btn"
            onClick={() => onNavigate('order-details')}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          <div className="text-center truncate px-2">
            <p className="text-xs font-bold text-gray-300 truncate uppercase max-w-[200px]">
              {order.eventName}
            </p>
          </div>

          <button
            onClick={() => onNavigate('order-details')}
            className="text-xs font-semibold text-[#00d2b4] hover:underline whitespace-nowrap"
          >
            Meus pedidos
          </button>
        </div>
      </div>

      {/* Green Status Bar "Aprovado" (00:22 - 00:23) */}
      <div className="bg-[#5bc09e] text-[#0d3427] font-extrabold text-center py-2 text-base sm:text-lg tracking-wide shadow-sm">
        Aprovado
      </div>

      {/* Main Quentro Content */}
      <div className="flex-1 mx-auto w-full max-w-md px-4 py-6 flex flex-col justify-between">
        {!ticketUnlocked ? (
          /* Email Prompt Screen (Exact Replica of 00:22 - 00:32) */
          <div className="bg-[#1a202c] rounded-2xl p-6 sm:p-7 shadow-2xl border border-gray-800 space-y-6 animate-in fade-in duration-300">
            {/* Top Quentro Branding Bar with accessibility controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="font-extrabold italic text-xl tracking-tight text-[#00d2b4]">
                  Quentro
                </span>
                <ChevronRight className="h-5 w-5 text-[#00d2b4]" />
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="#como-funciona"
                  className="text-xs text-gray-400 hover:text-white underline decoration-gray-500"
                >
                  Como funciona o Quentro?
                </a>

                {/* A- / A+ Accessibility Font Resizer (00:22) */}
                <div className="flex items-center bg-gray-800 rounded px-1.5 py-0.5 border border-gray-700 text-xs text-gray-300 font-bold">
                  <button
                    id="font-size-decrease-btn"
                    onClick={() => setFontSizeOffset((prev) => Math.max(prev - 2, -4))}
                    className="px-1 hover:text-white"
                    title="Diminuir fonte"
                  >
                    A-
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    id="font-size-increase-btn"
                    onClick={() => setFontSizeOffset((prev) => Math.min(prev + 2, 6))}
                    className="px-1 hover:text-white"
                    title="Aumentar fonte"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Heading */}
            <div className="space-y-2 pt-2">
              <h2
                id="quentro-prompt-title"
                className="text-xl sm:text-2xl font-black text-white leading-snug"
              >
                Digite seu e-mail de usuário Quentro.
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Se você não possui um nome de usuário Quentro, insira seu e-mail pessoal.
              </p>
            </div>

            {/* Input Form with interactive editing matching video and photo reference */}
            <form onSubmit={handleContinue} className="space-y-4 pt-2">
              <div className="relative">
                <input
                  id="quentro-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => {
                    window.dispatchEvent(new CustomEvent('hide-bottom-nav'));
                  }}
                  onBlur={() => {
                    window.dispatchEvent(new CustomEvent('show-bottom-nav'));
                  }}
                  placeholder="Endereço de e-mail"
                  className={`w-full rounded-lg bg-[#141b22] px-5 py-4 text-base text-white placeholder:text-gray-400 focus:outline-none transition-all font-sans border ${
                    email.toLowerCase().includes('.com')
                      ? 'border-[#00e5bb] shadow-[0_0_10px_rgba(0,229,187,0.25)]'
                      : 'border-gray-700/60 focus:border-gray-500'
                  }`}
                  required
                />
              </div>

              <button
                id="quentro-continue-btn"
                type="submit"
                className="w-full flex items-center justify-between rounded-lg bg-white text-gray-950 px-5 py-4 text-base font-semibold hover:bg-gray-100 active:scale-[0.99] transition-transform shadow-md cursor-pointer"
              >
                <span>Continuar</span>
                <div className="w-8 h-8 rounded-full bg-[#ebecee] flex items-center justify-center shrink-0">
                  <ChevronRight className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                </div>
              </button>
            </form>

            <div className="pt-2 text-[11px] text-gray-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#00d2b4]" />
              <span>Seus ingressos ficam protegidos por criptografia de ponta a ponta.</span>
            </div>
          </div>
        ) : (
          /* Active Digital Ticket with Dynamic QR Code Screen */
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            {/* Ticket Card Container */}
            <div className="bg-[#1a202c] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
              {/* Top Ticket Header */}
              <div className="bg-[#0b1724] p-5 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00d2b4]">
                    Ingresso Digital Oficial
                  </span>
                  <h3 className="text-base font-extrabold text-white leading-tight mt-0.5">
                    {order.eventName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{order.location}</p>
                </div>
                <div className="bg-[#00d2b4]/15 border border-[#00d2b4]/30 rounded-xl px-2.5 py-1 text-center">
                  <span className="text-[10px] font-bold text-[#00d2b4] block">STATUS</span>
                  <span className="text-xs font-black text-white">ATIVO</span>
                </div>
              </div>

              {/* Dynamic QR Code Canvas with live updating token */}
              <div className="bg-white p-6 flex flex-col items-center justify-center text-gray-950">
                <div className="relative p-3 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  {/* Visual SVG QR Code */}
                  <svg className="w-52 h-52" viewBox="0 0 120 120">
                    <rect width="120" height="120" fill="white" />
                    {/* Top Left Finder */}
                    <rect x="10" y="10" width="30" height="30" fill="black" />
                    <rect x="15" y="15" width="20" height="20" fill="white" />
                    <rect x="20" y="20" width="10" height="10" fill="black" />
                    {/* Top Right Finder */}
                    <rect x="80" y="10" width="30" height="30" fill="black" />
                    <rect x="85" y="15" width="20" height="20" fill="white" />
                    <rect x="90" y="20" width="10" height="10" fill="black" />
                    {/* Bottom Left Finder */}
                    <rect x="10" y="80" width="30" height="30" fill="black" />
                    <rect x="15" y="85" width="20" height="20" fill="white" />
                    <rect x="20" y="90" width="10" height="10" fill="black" />
                    {/* Dynamic matrix elements */}
                    <rect x="45" y="15" width="5" height="15" fill="black" />
                    <rect x="55" y="10" width="15" height="5" fill="black" />
                    <rect x="50" y="25" width="10" height="10" fill="black" />
                    <rect x="15" y="45" width="20" height="5" fill="black" />
                    <rect x="25" y="55" width="10" height="10" fill="black" />
                    <rect x="45" y="45" width="30" height="30" fill="#00bda2" />
                    <rect x="55" y="55" width="10" height="10" fill="white" />
                    <rect x="80" y="50" width="10" height="15" fill="black" />
                    <rect x="95" y="45" width="15" height="10" fill="black" />
                    <rect x="85" y="70" width="25" height="5" fill="black" />
                    <rect x="45" y="85" width="15" height="10" fill="black" />
                    <rect x="65" y="90" width="20" height="15" fill="black" />
                    <rect x="50" y="105" width="10" height="5" fill="black" />
                  </svg>

                  {/* Pulsing overlay for antifraud verification */}
                  <div className="absolute inset-x-0 bottom-1 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold bg-black/80 text-white px-2 py-0.5 rounded-full">
                      TOKEN: QNT-{order.orderNumber.slice(-4)}-{qrCodeTimer}s
                    </span>
                  </div>
                </div>

                {/* Refresh Countdown bar */}
                <div className="w-full max-w-[220px] mt-4">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1">
                    <span className="flex items-center gap-1 text-[#00a892]">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Atualizando código
                    </span>
                    <span>{qrCodeTimer}s</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00d2b4] h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(qrCodeTimer / 15) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3 max-w-xs">
                  Aproxime este código do leitor na catraca de entrada. Não é permitido print de tela.
                </p>
              </div>

              {/* Ticket Details in Card */}
              <div className="p-5 bg-[#141b24] space-y-3 text-xs border-t border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Titular</span>
                  <span className="font-bold text-white">{order.attendeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Setor</span>
                  <span className="font-bold text-white">{order.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">E-mail Quentro</span>
                  <span className="font-mono text-gray-300">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ID do Pedido</span>
                  <span className="font-mono text-gray-300">#{order.orderNumber}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-[#0e141c] border-t border-gray-800 flex gap-2">
                <button
                  id="transfer-ticket-btn"
                  onClick={() => setShowTransferModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-800 hover:bg-gray-700 py-3 text-xs font-bold text-white transition-colors"
                >
                  <Send className="h-3.5 w-3.5 text-[#00d2b4]" />
                  Transferir Ingresso
                </button>
                <button
                  id="edit-quentro-email-btn"
                  onClick={() => setTicketUnlocked(false)}
                  className="flex items-center justify-center rounded-xl bg-gray-800 hover:bg-gray-700 px-4 py-3 text-xs font-bold text-gray-300 transition-colors"
                >
                  Alterar E-mail
                </button>
              </div>
            </div>

            {/* Offline reminder badge */}
            <div className="rounded-xl bg-gray-900/80 border border-gray-800 p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#00d2b4]" />
              <span>Funciona mesmo sem internet no local do evento.</span>
            </div>
          </div>
        )}

        {/* Bottom address bar mockup indicator (matching Safari/iOS bar from video) */}
        <div className="mt-8 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-white transition-colors"
          >
            ‹ Voltar ao início
          </button>
          <div className="rounded-full bg-gray-800 px-3 py-1 text-[11px] font-mono text-gray-300">
            ticketmaster.com.br
          </div>
          <Share2 className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* Ticket Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#1a202c] rounded-2xl max-w-sm w-full p-6 border border-gray-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white">Transferir Ingresso</h3>
            <p className="text-xs text-gray-400">
              Digite o e-mail da conta Quentro do destinatário. O ingresso será transferido instantaneamente e cancelado na sua conta.
            </p>

            {transferredSuccess ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/30 rounded-xl text-center text-emerald-400 text-xs font-bold space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400" />
                <p>Ingresso transferido com sucesso!</p>
              </div>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-4">
                <input
                  type="email"
                  required
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  placeholder="amigo@email.com"
                  className="w-full rounded-xl bg-[#2d3748] border border-gray-700 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d2b4]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#00d2b4] hover:bg-[#00ba9f] text-xs font-black text-gray-950"
                  >
                    Confirmar Envio
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
