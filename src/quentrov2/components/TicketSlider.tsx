import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Pencil,
  Info,
  Camera,
  ZoomIn,
  RefreshCw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ConcertEvent, Ticket } from '../types';
import { TicketmasterLogo } from './TicketmasterLogo';

interface TicketSliderProps {
  event: ConcertEvent;
  tickets: Ticket[];
  initialIndex?: number;
  onBack: () => void;
  onOpenTransfer: () => void;
  onOpenList: () => void;
  onUpdateTitular?: (ticketId: string, newName: string) => void;
  onUpdateTicket?: (ticketId: string, updatedFields: Partial<Ticket>) => void;
  onUpdateEvent?: (eventId: string, updatedFields: Partial<ConcertEvent>) => void;
  onOpenInfo: () => void;
}

export const TicketSlider: React.FC<TicketSliderProps> = ({
  event,
  tickets,
  initialIndex = 0,
  onBack,
  onOpenTransfer,
  onOpenList,
  onUpdateTitular,
  onUpdateTicket,
  onUpdateEvent,
  onOpenInfo,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copiedToast, setCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active tickets fallback
  const activeTickets = tickets.length > 0 ? tickets : event.tickets;
  const currentTicket = activeTickets[currentIndex] || activeTickets[0];

  // Inline edit state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Modals
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [customBannerUrlInput, setCustomBannerUrlInput] = useState('');

  // Dynamic token progress bar (Quentro/Ticketmaster live refresh)
  const [progressPercent, setProgressPercent] = useState(38);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleNext = () => {
    if (currentIndex < activeTickets.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setEditingField(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setEditingField(null);
    }
  };

  const startEdit = (field: string, initialText: string) => {
    setEditingField(field);
    setEditValue(initialText);
  };

  const saveEdit = (field: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditingField(null);
      return;
    }

    if (field === 'eventTitle') {
      if (onUpdateEvent) onUpdateEvent(event.id, { title: trimmed });
    } else if (field === 'eventSubtitle') {
      if (onUpdateEvent) onUpdateEvent(event.id, { headerSubtitle: trimmed });
    } else if (field === 'gate') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { gate: trimmed });
    } else if (field === 'titular') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { titularName: trimmed });
      if (onUpdateTitular) onUpdateTitular(currentTicket.id, trimmed);
    } else if (field === 'sector') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { sector: trimmed });
    } else if (field === 'section') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { section: trimmed });
    } else if (field === 'row') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { row: trimmed });
    } else if (field === 'date') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { dateText: trimmed });
    } else if (field === 'openingTime') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { openingTime: trimmed });
    } else if (field === 'startTime') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { startTime: trimmed });
    } else if (field === 'qrData') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { qrData: trimmed });
    }

    setEditingField(null);
    showToast('Informação atualizada!');
  };

  const handleSetBanner = (type: 'ticketmaster' | 'custom', url?: string) => {
    if (onUpdateTicket) {
      onUpdateTicket(currentTicket.id, {
        bannerType: type,
        bannerImage: url || '',
      });
    }
    setIsBannerModalOpen(false);
    showToast(type === 'ticketmaster' ? 'Logo Ticketmaster selecionado!' : 'Foto do banner atualizada!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        handleSetBanner('custom', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Meus ingressos para ${event.title} - ${currentTicket.sector}`,
          url: window.location.href,
        });
      } catch {
        // user canceled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  // Values with safe defaults matching IMG_8616
  const displayTitle = event.title || 'BTS WORLD TOUR ARIRANG';
  const displaySubtitle = event.headerSubtitle || '30/10/2026 – MorumBis';
  const displayGate = currentTicket.gate || 'Portão 1';
  const displayTitular = currentTicket.titularName || 'Nome e Sobrenome';
  const displaySector = currentTicket.sector || 'Arquibancada · Meia';
  const displaySection = currentTicket.section || 'PISTA';
  const displayRow = currentTicket.row || 'Não numerado';
  const displayDate = currentTicket.dateText || event.fullDate || 'Sexta-feira 30/10/2026';
  const displayOpening = currentTicket.openingTime || '16:00';
  const displayStart = currentTicket.startTime || '20:00';
  const qrValue =
    currentTicket.qrData ||
    `https://app.quentro.com/t/${currentTicket.id || '30102026-bts-01'}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#121719] text-white w-full select-none font-sans relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {(toastMessage || copiedToast) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#00D2B4] text-black font-semibold text-xs py-2 px-4 rounded-full shadow-2xl flex items-center gap-2 pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage || 'Link copiado!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header - Fixed matching native app and IMG_8616 */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-3.5 pb-2.5 w-full bg-[#121719] select-none"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        }}
      >
        <button
          id="btn-ticket-back"
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:text-zinc-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2]" />
        </button>

        {/* Center/Left Event Header: Editable Title and Subtitle */}
        <div className="flex-1 min-w-0 px-2 flex flex-col justify-center">
          {editingField === 'eventTitle' ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveEdit('eventTitle')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit('eventTitle');
                  if (e.key === 'Escape') setEditingField(null);
                }}
                autoFocus
                className="bg-black/50 border border-[#00D2B4] text-white text-[15px] font-medium px-1.5 py-0.5 rounded w-full focus:outline-none"
              />
              <button
                onClick={() => saveEdit('eventTitle')}
                className="p-1 bg-[#00D2B4] text-black rounded text-xs"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          ) : (
            <h1
              onClick={() => startEdit('eventTitle', displayTitle)}
              className="text-[15px] sm:text-[16px] font-medium text-white tracking-tight leading-tight truncate cursor-pointer hover:text-[#00D2B4] transition-colors"
              title="Clique para editar título"
            >
              {displayTitle}
            </h1>
          )}

          {editingField === 'eventSubtitle' ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveEdit('eventSubtitle')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit('eventSubtitle');
                  if (e.key === 'Escape') setEditingField(null);
                }}
                autoFocus
                className="bg-black/50 border border-[#00D2B4] text-zinc-300 text-[12px] px-1.5 py-0.5 rounded w-full focus:outline-none"
              />
              <button
                onClick={() => saveEdit('eventSubtitle')}
                className="p-1 bg-[#00D2B4] text-black rounded text-xs"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          ) : (
            <p
              onClick={() => startEdit('eventSubtitle', displaySubtitle)}
              className="text-[12px] text-[#8E9CA8] font-normal leading-tight truncate cursor-pointer hover:text-white transition-colors mt-0.5"
              title="Clique para editar data e local"
            >
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Top-Right Transfer / Download Action Button (Opens SelectTicketsScreen) */}
        <button
          id="btn-ticket-action-transfer"
          onClick={onOpenTransfer}
          className="p-1.5 -mr-1 text-white hover:text-zinc-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center rounded-full hover:bg-white/10"
          title="Selecionar / Transferir Ingresso"
          aria-label="Selecionar ou Transferir Ingresso"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </header>

      {/* Main Content: The Two Separate Cards matching IMG_8616 */}
      <main
        className="flex-1 px-3.5 pt-1.5 pb-6 max-w-xl mx-auto w-full flex flex-col items-center"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        }}
      >
        <div className="relative w-full">
          {/* CARD 1: Ticketmaster Royal Blue Header + Live QR + ACESSO (Exact match to IMG_8616) */}
          <div className="w-full bg-white rounded-[26px] overflow-hidden shadow-2xl select-none flex flex-col">
            {/* Upper Blue Section with Official Ticketmaster Wordmark - Exact tall proportion */}
            <div className="bg-[#0052EA] h-[270px] sm:h-[290px] w-full flex items-center justify-center relative select-none overflow-hidden group">
              {currentTicket.bannerType === 'custom' && currentTicket.bannerImage ? (
                <img
                  src={currentTicket.bannerImage}
                  alt="Ticket Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full px-6 py-8">
                  <TicketmasterLogo
                    className="w-[260px] sm:w-[290px] h-auto drop-shadow-md"
                    color="#FFFFFF"
                  />
                </div>
              )}

              {/* Discreet button to customize banner or upload photo */}
              <button
                id="btn-edit-banner"
                onClick={() => setIsBannerModalOpen(true)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Personalizar banner (Foto do Evento ou Logo Ticketmaster)"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Quentro/Ticketmaster Live Security Progress Bar on Bottom Edge */}
              <div className="absolute bottom-0 left-0 right-0 h-[3.5px] bg-[#003BB0] overflow-hidden">
                <div
                  className="h-full bg-[#00D2B4] transition-all duration-300 ease-linear shadow-[0_0_6px_#00D2B4]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Lower White Section: QR Code (Left) + ACESSO & Button (Right) */}
            <div className="p-4 sm:p-5 bg-white flex items-center justify-between gap-4">
              {/* Dynamic Quentro/Ticketmaster QR Code with Live Scanning Hologram */}
              <div
                id="ticket-qr-container"
                onClick={() => setIsQrZoomed(true)}
                className="relative w-[124px] h-[124px] sm:w-[130px] sm:h-[130px] shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden cursor-pointer group"
                title="Clique para ampliar o QR Code"
              >
                <QRCodeSVG
                  value={qrValue}
                  size={120}
                  level="M"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />

                {/* Quentro Live Hologram Scanning Beam Line */}
                <motion.div
                  animate={{ y: [-2, 118, -2] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
                  className="absolute left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#00D2B4] to-transparent shadow-[0_0_8px_#00D2B4] pointer-events-none z-10"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
              </div>

              {/* Right Side: ACESSO & Mais Informação Button */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-[124px] sm:h-[130px] py-0.5">
                <div>
                  <span className="text-[11px] font-medium tracking-wider text-[#7E8E9B] uppercase block">
                    ACESSO
                  </span>

                  {editingField === 'gate' ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit('gate')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit('gate');
                          if (e.key === 'Escape') setEditingField(null);
                        }}
                        autoFocus
                        className="text-[20px] font-semibold text-zinc-900 border-b-2 border-[#2563EB] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                      />
                      <button
                        onClick={() => saveEdit('gate')}
                        className="p-1 rounded bg-[#2563EB] text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEdit('gate', displayGate)}
                      className="text-[20px] sm:text-[22px] font-semibold text-zinc-900 cursor-pointer hover:text-[#2563EB] transition-colors truncate mt-0.5 leading-tight"
                      title="Clique para editar portão"
                    >
                      {displayGate}
                    </div>
                  )}
                </div>

                {/* Mais Informação Pill Button (Exact match to IMG_8616) */}
                <button
                  id="btn-ticket-more-info"
                  onClick={onOpenInfo}
                  className="bg-[#EAF2FE] hover:bg-[#DDEAFE] active:scale-95 text-[#2563EB] font-medium text-[13px] sm:text-[14px] py-2.5 px-4 rounded-[10px] text-center transition-all cursor-pointer w-full mt-auto"
                >
                  Mais Informação
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: Separate Details Card with Dashed Separators (Exact match to IMG_8616) */}
          <div className="w-full bg-white rounded-[24px] p-5 shadow-xl text-zinc-900 mt-3 select-none">
            {/* ROW 1: TITULAR (with Blue Pencil icon on right) */}
            <div className="pb-2.5 border-b border-dashed border-zinc-200/90">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium text-[#7E8E9B] tracking-wider uppercase">
                  TITULAR
                </span>
                <button
                  id="btn-edit-pencil-titular"
                  onClick={() => startEdit('titular', displayTitular)}
                  className="text-[#2563EB] hover:text-blue-700 active:scale-95 transition-all p-0.5 cursor-pointer"
                  title="Editar titular"
                >
                  <Pencil className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>

              {editingField === 'titular' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit('titular')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('titular');
                      if (e.key === 'Escape') setEditingField(null);
                    }}
                    autoFocus
                    className="text-[16px] font-normal text-zinc-900 border-b-2 border-[#2563EB] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                  />
                  <button
                    onClick={() => saveEdit('titular')}
                    className="p-1 rounded bg-[#2563EB] text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit('titular', displayTitular)}
                  className="text-[16px] sm:text-[17px] font-normal text-zinc-900 cursor-pointer hover:text-[#2563EB] transition-colors truncate"
                  title="Clique para editar titular"
                >
                  {displayTitular}
                </div>
              )}
            </div>

            {/* ROW 2: SETOR */}
            <div className="py-2.5 border-b border-dashed border-zinc-200/90">
              <span className="text-[11px] font-medium text-[#7E8E9B] tracking-wider uppercase block mb-0.5">
                SETOR
              </span>

              {editingField === 'sector' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit('sector')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('sector');
                      if (e.key === 'Escape') setEditingField(null);
                    }}
                    autoFocus
                    className="text-[16px] font-normal text-zinc-900 border-b-2 border-[#2563EB] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                  />
                  <button
                    onClick={() => saveEdit('sector')}
                    className="p-1 rounded bg-[#2563EB] text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit('sector', displaySector)}
                  className="text-[16px] sm:text-[17px] font-normal text-zinc-900 cursor-pointer hover:text-[#2563EB] transition-colors truncate"
                  title="Clique para editar setor"
                >
                  {displaySector}
                </div>
              )}
            </div>

            {/* ROW 3: SEÇÃO + FILEIRA (2 Columns) */}
            <div className="py-2.5 border-b border-dashed border-zinc-200/90 grid grid-cols-2 gap-4">
              {/* SEÇÃO */}
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-[#7E8E9B] tracking-wider uppercase block mb-0.5">
                  SEÇÃO
                </span>

                {editingField === 'section' ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit('section')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit('section');
                        if (e.key === 'Escape') setEditingField(null);
                      }}
                      autoFocus
                      className="text-[16px] font-normal text-zinc-900 border-b-2 border-[#2563EB] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit('section')}
                      className="p-1 rounded bg-[#2563EB] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => startEdit('section', displaySection)}
                    className="text-[16px] sm:text-[17px] font-normal text-zinc-900 cursor-pointer hover:text-[#2563EB] transition-colors truncate"
                    title="Clique para editar seção"
                  >
                    {displaySection}
                  </div>
                )}
              </div>

              {/* FILEIRA */}
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-[#7E8E9B] tracking-wider uppercase block mb-0.5">
                  FILEIRA
                </span>

                {editingField === 'row' ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit('row')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit('row');
                        if (e.key === 'Escape') setEditingField(null);
                      }}
                      autoFocus
                      className="text-[16px] font-normal text-zinc-900 border-b-2 border-[#2563EB] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit('row')}
                      className="p-1 rounded bg-[#2563EB] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => startEdit('row', displayRow)}
                    className="text-[16px] sm:text-[17px] font-normal text-zinc-900 cursor-pointer hover:text-[#2563EB] transition-colors truncate"
                    title="Clique para editar fileira"
                  >
                    {displayRow}
                  </div>
                )}
              </div>
            </div>

            {/* ROW 4: DATA */}
            <div className="py-2.5 border-b border-dashed border-zinc-200/90">
              <span className="text-[11px] font-medium text-[#7E8E9B] tracking-wider uppercase block mb-0.5">
                DATA
              </span>

              {editingField === 'date' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit('date')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('date');
                      if (e.key === 'Escape') setEditingField(null);
                    }}
                    autoFocus
                    className="text-[16px] font-normal text-zinc-900 border-b-2 border-[#2563EB] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                  />
                  <button
                    onClick={() => saveEdit('date')}
                    className="p-1 rounded bg-[#2563EB] text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit('date', displayDate)}
                  className="text-[16px] sm:text-[17px] font-normal text-zinc-900 cursor-pointer hover:text-[#2563EB] transition-colors truncate"
                  title="Clique para editar data"
                >
                  {displayDate}
                </div>
              )}
            </div>

            {/* ROW 5: ABERTURA + INÍCIO (2 Columns) */}
            <div className="pt-2.5 grid grid-cols-2 gap-4">
              {/* ABERTURA */}
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-[#7E8E9B] tracking-wider uppercase block mb-0.5">
                  ABERTURA
                </span>

                {editingField === 'openingTime' ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit('openingTime')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit('openingTime');
                        if (e.key === 'Escape') setEditingField(null);
                      }}
                      autoFocus
                      className="text-[16px] font-normal text-zinc-900 border-b-2 border-[#2563EB] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit('openingTime')}
                      className="p-1 rounded bg-[#2563EB] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => startEdit('openingTime', displayOpening)}
                    className="text-[16px] sm:text-[17px] font-normal text-zinc-900 cursor-pointer hover:text-[#2563EB] transition-colors truncate"
                    title="Clique para editar horário de abertura"
                  >
                    {displayOpening}
                  </div>
                )}
              </div>

              {/* INÍCIO */}
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-[#7E8E9B] tracking-wider uppercase block mb-0.5">
                  INÍCIO
                </span>

                {editingField === 'startTime' ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit('startTime')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit('startTime');
                        if (e.key === 'Escape') setEditingField(null);
                      }}
                      autoFocus
                      className="text-[16px] font-normal text-zinc-900 border-b-2 border-[#2563EB] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit('startTime')}
                      className="p-1 rounded bg-[#2563EB] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => startEdit('startTime', displayStart)}
                    className="text-[16px] sm:text-[17px] font-normal text-zinc-900 cursor-pointer hover:text-[#2563EB] transition-colors truncate"
                    title="Clique para editar horário de início"
                  >
                    {displayStart}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows for convenient switching between tickets */}
          {activeTickets.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute -left-3 top-[135px] w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur shadow-md z-20 transition-transform active:scale-95 cursor-pointer"
                  aria-label="Ingresso anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentIndex < activeTickets.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute -right-3 top-[135px] w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur shadow-md z-20 transition-transform active:scale-95 cursor-pointer"
                  aria-label="Próximo ingresso"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL 1: Fullscreen QR Code Zoom (High brightness for turnstile scanning) */}
      <AnimatePresence>
        {isQrZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="bg-white rounded-[28px] p-6 w-full max-w-xs flex flex-col items-center shadow-2xl relative">
              <button
                onClick={() => setIsQrZoomed(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full flex items-center justify-center mt-2 mb-4">
                <TicketmasterLogo className="w-36 h-auto" color="#0250EB" />
              </div>

              <div className="text-center mb-4">
                <span className="text-[11px] font-bold text-[#7E8E9B] uppercase tracking-wider block">
                  {displaySector}
                </span>
                <h4 className="text-base font-bold text-zinc-900 mt-0.5">
                  {displayGate} · {displaySection}
                </h4>
                <p className="text-xs text-zinc-500">{displayTitular}</p>
              </div>

              {/* Large Crisp QR Code with Animated Scanning Beam */}
              <div className="relative p-2 bg-white rounded-2xl border-2 border-zinc-100 shadow-inner flex items-center justify-center overflow-hidden">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  level="M"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />

                {/* Quentro Live Hologram Scanning Beam */}
                <motion.div
                  animate={{ y: [-4, 196, -4] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                  className="absolute left-2 right-2 h-[3px] bg-gradient-to-r from-transparent via-[#00D2B4] to-transparent shadow-[0_0_10px_#00D2B4] pointer-events-none"
                />
              </div>

              <p className="text-[11px] text-zinc-400 mt-4 text-center font-medium">
                Apresente este código na catraca de acesso
              </p>

              {/* Editable QR Data Option */}
              <div className="w-full mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span className="truncate max-w-[170px] text-[10px] font-mono text-zinc-400">
                  {qrValue}
                </span>
                <button
                  onClick={() => {
                    setIsQrZoomed(false);
                    startEdit('qrData', qrValue);
                  }}
                  className="text-xs font-semibold text-[#0250EB] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Banner Customization Modal (Ticketmaster Logo vs Event Photo) */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1C2323] border border-zinc-700/60 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl relative"
            >
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold mb-1">Personalizar Banner do Ingresso</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Escolha entre a logo oficial da Ticketmaster ou uma imagem personalizada.
              </p>

              <div className="flex flex-col gap-2.5">
                {/* Option 1: Official Ticketmaster Logo (Default) */}
                <button
                  onClick={() => handleSetBanner('ticketmaster')}
                  className="w-full p-3 rounded-xl bg-[#0250EB] hover:bg-[#0047d4] active:scale-[0.99] flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <TicketmasterLogo className="w-24 h-auto" color="#FFFFFF" />
                    <span className="text-xs font-semibold text-white">Logo Oficial (Padrão)</span>
                  </div>
                  {(!currentTicket.bannerType || currentTicket.bannerType === 'ticketmaster') && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>

                {/* Option 2: Event Poster / Image */}
                <button
                  onClick={() =>
                    handleSetBanner(
                      'custom',
                      event.coverImage || '/bts-arirang-poster.jpg'
                    )
                  }
                  className="w-full p-3 rounded-xl bg-[#252E2E] hover:bg-[#2D3737] border border-zinc-700/60 active:scale-[0.99] flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={event.coverImage || '/bts-arirang-poster.jpg'}
                      alt="Pôster"
                      className="w-10 h-7 rounded object-cover"
                    />
                    <span className="text-xs font-semibold text-zinc-200">
                      Pôster Oficial do Show
                    </span>
                  </div>
                  {currentTicket.bannerType === 'custom' &&
                    currentTicket.bannerImage ===
                      (event.coverImage || '/bts-arirang-poster.jpg') && (
                      <Check className="w-4 h-4 text-[#00D2B4] stroke-[3]" />
                    )}
                </button>

                {/* Option 3: Custom URL Input */}
                <div className="p-3 rounded-xl bg-[#252E2E] border border-zinc-700/60 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-zinc-300">
                    URL da Imagem Personalizada
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto.jpg"
                      value={customBannerUrlInput}
                      onChange={(e) => setCustomBannerUrlInput(e.target.value)}
                      className="flex-1 bg-[#161C1C] border border-zinc-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D2B4]"
                    />
                    <button
                      onClick={() => {
                        if (customBannerUrlInput.trim()) {
                          handleSetBanner('custom', customBannerUrlInput.trim());
                        }
                      }}
                      className="px-3 py-1.5 bg-[#00D2B4] hover:bg-[#00B49B] text-black font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* Option 4: File Upload from device */}
                <label className="w-full p-3 rounded-xl bg-[#252E2E] hover:bg-[#2D3737] border border-dashed border-zinc-600 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <Camera className="w-4 h-4 text-[#00D2B4]" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Enviar Foto da Galeria
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
