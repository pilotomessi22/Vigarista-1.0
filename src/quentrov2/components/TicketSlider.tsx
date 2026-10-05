import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Pencil,
  ZoomIn,
  Camera,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ConcertEvent, Ticket } from '../types';
import { TicketmasterLogo } from './TicketmasterLogo';
import { AntiScreenshotModal } from './AntiScreenshotModal';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active tickets fallback
  const activeTickets = tickets.length > 0 ? tickets : event.tickets;
  const currentTicket = activeTickets[currentIndex] || activeTickets[0];

  // Inline edit state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editCpfValue, setEditCpfValue] = useState<string>('');

  // Modals
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [customBannerUrlInput, setCustomBannerUrlInput] = useState('');

  // Anti-Screenshot Modal State matching 68342559-182f-47e3-b75a-617766e4be17.jpeg
  const [isAntiScreenshotOpen, setIsAntiScreenshotOpen] = useState(false);

  // Stealth 100% Pitch-Black Screen Mode for recordings / screen sharing
  const [isTotalBlackoutActive, setIsTotalBlackoutActive] = useState(false);
  const blackoutTapCountRef = useRef(0);
  const blackoutTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimestampRef = useRef(0);

  const handleBlackoutScreenTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (e.cancelable) {
      e.preventDefault();
    }
    const now = Date.now();
    // Debounce duplicate touch+click within 40ms
    if (now - lastTapTimestampRef.current < 40) return;
    lastTapTimestampRef.current = now;

    blackoutTapCountRef.current += 1;

    if (blackoutTapTimerRef.current) {
      clearTimeout(blackoutTapTimerRef.current);
    }

    if (blackoutTapCountRef.current >= 3) {
      // 3 Taps: Restore normal ticket screen!
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(60);
        } catch (_) {}
      }
      blackoutTapCountRef.current = 0;
      setIsTotalBlackoutActive(false);
      return;
    }

    // Wait 280ms to check if a 3rd tap arrives
    blackoutTapTimerRef.current = setTimeout(() => {
      if (blackoutTapCountRef.current === 2) {
        // 2 Taps: Open Transfer tab!
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([40, 40, 40]);
          } catch (_) {}
        }
        blackoutTapCountRef.current = 0;
        setIsTotalBlackoutActive(false);
        onOpenTransfer();
      } else {
        blackoutTapCountRef.current = 0;
      }
    }, 280);
  };

  // Dynamic token progress bar (Quentro/Ticketmaster live refresh)
  const [progressPercent, setProgressPercent] = useState(72);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) return 10;
        return prev + 1.5;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  // Listen for screenshot shortcuts and print events to show the security screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's')
      ) {
        setIsAntiScreenshotOpen(true);
      }
    };

    const handleBeforePrint = () => {
      setIsAntiScreenshotOpen(true);
    };

    const handleCustomTrigger = () => {
      setIsAntiScreenshotOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('quentro:trigger_anti_screenshot', handleCustomTrigger);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('quentro:trigger_anti_screenshot', handleCustomTrigger);
    };
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
    if (field === 'titular') {
      setEditCpfValue(currentTicket.titularCpf || '662.266.173-14');
    }
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
    } else if (field === 'categoryBanner') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { categoryBanner: trimmed });
    } else if (field === 'sector') {
      const isInteira = /inteira/i.test(currentTicket.category || '') || /inteira/i.test(currentTicket.taxaText || '');
      let autoTaxa = isInteira ? 'INTEIRA: Inteira - R$ 1.250' : 'ESTUDA: Meia-Entrada - R$ 625';
      let autoSection = trimmed.toUpperCase();
      let autoRow = '-';
      let autoSeat = currentTicket.seat || '-';

      if (/arquibancada/i.test(trimmed)) {
        autoTaxa = isInteira ? 'INTEIRA: Inteira - R$ 680' : 'ESTUDA: Meia-Entrada - R$ 340';
        autoSection = 'ARQUIBANCADA';
        autoRow = '-';
        autoSeat = 'Livre';
      } else if (/superior/i.test(trimmed)) {
        autoTaxa = isInteira ? 'INTEIRA: Inteira - R$ 980' : 'ESTUDA: Meia-Entrada - R$ 490';
        autoSection = 'CADEIRA SUPERIOR';
        autoRow = '-';
      } else if (/inferior/i.test(trimmed)) {
        autoTaxa = isInteira ? 'INTEIRA: Inteira - R$ 1.080' : 'ESTUDA: Meia-Entrada - R$ 540';
        autoSection = 'CADEIRA INFERIOR';
        autoRow = '-';
      } else if (/pista/i.test(trimmed)) {
        autoTaxa = isInteira ? 'INTEIRA: Inteira - R$ 1.250' : 'ESTUDA: Meia-Entrada - R$ 625';
        autoSection = 'PISTA';
        autoRow = '-';
        autoSeat = '-';
      }

      if (onUpdateTicket) {
        onUpdateTicket(currentTicket.id, {
          sector: trimmed,
          section: autoSection,
          taxaText: autoTaxa,
          row: autoRow,
          seat: autoSeat,
        });
      }
    } else if (field === 'titular') {
      const trimmedCpf = editCpfValue.trim() || currentTicket.titularCpf || '662.266.173-14';
      if (onUpdateTicket) {
        onUpdateTicket(currentTicket.id, {
          titularName: trimmed,
          titularCpf: trimmedCpf,
        });
      }
      if (onUpdateTitular) onUpdateTitular(currentTicket.id, trimmed);
    } else if (field === 'taxa') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { taxaText: trimmed });
    } else if (field === 'section') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { section: trimmed });
    } else if (field === 'row') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { row: trimmed });
    } else if (field === 'openingTime') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { openingTime: trimmed });
    } else if (field === 'startTime') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { startTime: trimmed });
    } else if (field === 'hashtagText') {
      if (onUpdateTicket) onUpdateTicket(currentTicket.id, { hashtagText: trimmed });
    }

    setEditingField(null);
    showToast('Atualizado!');
  };

  const handleSetBanner = (
    type: 'ticketmaster' | 'custom',
    imageUrl?: string
  ) => {
    if (onUpdateTicket) {
      onUpdateTicket(currentTicket.id, {
        bannerType: type,
        bannerImage: imageUrl,
      });
    }
    setIsBannerModalOpen(false);
    showToast('Banner atualizado!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleSetBanner('custom', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Values matching IMG_9243.jpeg
  const displayTitle = event.title || 'BTS WORLD TOUR ARIRANG';
  const displaySubtitle = event.headerSubtitle || '28/10/26 - MorumBis';
  const displayCategoryBanner = currentTicket.categoryBanner || 'MEIA-ENTRADA';
  const displaySector = currentTicket.sector || 'Cadeira Superior';
  const displayTitular = currentTicket.titularName || 'Fernanda Lucena';
  const displayTitularCpf = currentTicket.titularCpf || '662.266.173-14';
  const displayTaxa = currentTicket.taxaText || 'ESTUDA: Meia-Entrada - R$ 490';
  const displaySection = currentTicket.section || 'CADEIRA SUPERIOR';
  const displayRow = currentTicket.row || 'Não numerado';
  const displayOpening = currentTicket.openingTime || '16:00';
  const displayStart = currentTicket.startTime || '20:00';
  const displayHashtag = currentTicket.hashtagText || '#OAoVivoÉAgora';

  const qrValue =
    currentTicket.qrData ||
    `https://app.quentro.com/t/${currentTicket.id || '28102026-bts-01'}`;

  // Discreet sector & price switcher when tapping directly on top of the QR code
  const handleQrClick = () => {
    const presets = [
      {
        sector: 'Pista',
        section: 'PISTA',
        category: 'Meia-Entrada',
        categoryBanner: 'MEIA-ENTRADA',
        taxaText: 'ESTUDA: Meia-Entrada - R$ 625',
        row: '-',
        seat: '-',
      },
      {
        sector: 'Pista',
        section: 'PISTA',
        category: 'Inteira',
        categoryBanner: 'INTEIRA',
        taxaText: 'INTEIRA: Inteira - R$ 1.250',
        row: '-',
        seat: '-',
      },
      {
        sector: 'Arquibancada',
        section: 'ARQUIBANCADA',
        category: 'Meia-Entrada',
        categoryBanner: 'MEIA-ENTRADA',
        taxaText: 'ESTUDA: Meia-Entrada - R$ 340',
        row: '-',
        seat: 'Livre',
      },
      {
        sector: 'Arquibancada',
        section: 'ARQUIBANCADA',
        category: 'Inteira',
        categoryBanner: 'INTEIRA',
        taxaText: 'INTEIRA: Inteira - R$ 680',
        row: '-',
        seat: 'Livre',
      },
      {
        sector: 'Cadeira Superior',
        section: 'CADEIRA SUPERIOR',
        category: 'Meia-Entrada',
        categoryBanner: 'MEIA-ENTRADA',
        taxaText: 'ESTUDA: Meia-Entrada - R$ 490',
        row: '-',
        seat: '-',
      },
      {
        sector: 'Cadeira Superior',
        section: 'CADEIRA SUPERIOR',
        category: 'Inteira',
        categoryBanner: 'INTEIRA',
        taxaText: 'INTEIRA: Inteira - R$ 980',
        row: '-',
        seat: '-',
      },
      {
        sector: 'Cadeira Inferior',
        section: 'CADEIRA INFERIOR',
        category: 'Meia-Entrada',
        categoryBanner: 'MEIA-ENTRADA',
        taxaText: 'ESTUDA: Meia-Entrada - R$ 540',
        row: '-',
        seat: '-',
      },
      {
        sector: 'Cadeira Inferior',
        section: 'CADEIRA INFERIOR',
        category: 'Inteira',
        categoryBanner: 'INTEIRA',
        taxaText: 'INTEIRA: Inteira - R$ 1.080',
        row: '-',
        seat: '-',
      },
    ];

    const curSector = (currentTicket.sector || '').toLowerCase();
    const isCurInteira =
      /inteira/i.test(currentTicket.category || '') ||
      /inteira/i.test(currentTicket.taxaText || '');

    let curIdx = presets.findIndex((p) => {
      const matchSector = curSector.includes(p.sector.toLowerCase());
      const matchType = isCurInteira
        ? p.category === 'Inteira'
        : p.category === 'Meia-Entrada';
      return matchSector && matchType;
    });

    if (curIdx === -1) {
      curIdx = 0;
    }

    const nextPreset = presets[(curIdx + 1) % presets.length];

    if (onUpdateTicket) {
      onUpdateTicket(currentTicket.id, {
        sector: nextPreset.sector,
        section: nextPreset.section,
        category: nextPreset.category,
        categoryBanner: nextPreset.categoryBanner,
        taxaText: nextPreset.taxaText,
        row: nextPreset.row,
        seat: nextPreset.seat,
      });
    }

    // Discreet haptic feedback
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } catch {}

    showToast(`${nextPreset.sector} · ${nextPreset.category}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121719] text-white w-full select-none font-sans relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#00D2B4] text-black font-semibold text-xs py-2 px-4 rounded-full shadow-2xl flex items-center gap-2 pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header matching IMG_9243.jpeg: Left Chevron + Title & Subtitle + Top-Right Action */}
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
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        {/* Center/Left Event Header matching IMG_9243.jpeg */}
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
              className="text-[15.5px] sm:text-[16px] font-medium text-white tracking-tight leading-tight truncate cursor-pointer hover:text-[#00D2B4] transition-colors"
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
              className="text-[12.5px] text-[#8696A6] font-normal leading-tight truncate cursor-pointer hover:text-white transition-colors mt-0.5"
              title="Clique para editar data e local"
            >
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Top-Right Action / Upload button matching IMG_9243.jpeg */}
        <button
          id="btn-ticket-action-transfer"
          onClick={onOpenTransfer}
          className="p-1.5 -mr-1 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center rounded-full hover:bg-white/10"
          title="Selecionar / Transferir Ingresso"
          aria-label="Selecionar ou Transferir Ingresso"
        >
          {/* Exact square-with-arrow action icon matching IMG_9243.jpeg */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </header>

      {/* Main Content matching IMG_9243.jpeg */}
      <main
        className="flex-1 px-3.5 sm:px-4 pt-1.5 pb-6 max-w-md mx-auto w-full flex flex-col items-center"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        }}
      >
        <div className="relative w-full">
          {/* ========================================================
              CARD 1: Top QR Card matching IMG_9243.jpeg
              - Royal Blue MEIA-ENTRADA Header
              - Ticketmaster Logo + #OAoVivoÉAgora
              - Quentro Live Mint Security Progress Bar
              - QR Code (Left) + SETOR & Mais informação (Right)
              ======================================================== */}
          <div className="w-full bg-white rounded-[16px] sm:rounded-[18px] overflow-hidden shadow-2xl select-none flex flex-col">
            {/* Top Royal Blue Banner: MEIA-ENTRADA */}
            {editingField === 'categoryBanner' ? (
              <div className="bg-[#0052CC] px-4 py-2.5 flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit('categoryBanner')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit('categoryBanner');
                    if (e.key === 'Escape') setEditingField(null);
                  }}
                  autoFocus
                  className="bg-white/20 border border-white text-white font-bold text-[16px] text-center px-2 py-0.5 rounded w-48 focus:outline-none uppercase"
                />
                <button
                  onClick={() => saveEdit('categoryBanner')}
                  className="p-1 bg-white text-[#0052CC] rounded text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => startEdit('categoryBanner', displayCategoryBanner)}
                className="bg-[#0052CC] py-2.5 px-4 text-center cursor-pointer hover:bg-[#0047b3] transition-colors"
                title="Clique para editar categoria"
              >
                <span className="text-[17px] sm:text-[18px] font-bold text-white tracking-[0.06em] uppercase">
                  {displayCategoryBanner}
                </span>
              </div>
            )}

            {/* Ticketmaster Logo Area with Faint Watermark & #OAoVivoÉAgora */}
            <div className="bg-white py-6 sm:py-7 px-6 w-full flex flex-col items-center justify-center relative select-none overflow-hidden group">
              {/* Subtle background geometric ticket watermark matching IMG_9243.jpeg */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
                <svg
                  className="w-[280px] h-[200px]"
                  viewBox="0 0 200 150"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="2.5"
                >
                  <rect x="25" y="20" width="150" height="90" rx="10" transform="rotate(-6 100 65)" />
                  <line x1="60" y1="20" x2="60" y2="110" strokeDasharray="4 4" transform="rotate(-6 100 65)" />
                  <circle cx="25" cy="65" r="8" fill="white" />
                  <circle cx="175" cy="65" r="8" fill="white" />
                </svg>
              </div>

              {currentTicket.bannerType === 'custom' && currentTicket.bannerImage ? (
                <div className="relative w-full h-[120px] rounded-lg overflow-hidden">
                  <img
                    src={currentTicket.bannerImage}
                    alt="Ticket Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center relative z-10 w-full">
                  <TicketmasterLogo
                    className="w-[230px] sm:w-[250px] h-auto"
                    color="#0052CC"
                  />
                  {editingField === 'hashtagText' ? (
                    <div className="flex items-center gap-1.5 mt-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit('hashtagText')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit('hashtagText');
                          if (e.key === 'Escape') setEditingField(null);
                        }}
                        autoFocus
                        className="text-[13px] font-bold text-black border border-zinc-400 px-1 py-0.5 rounded text-center"
                      />
                      <button
                        onClick={() => saveEdit('hashtagText')}
                        className="p-0.5 bg-[#0052CC] text-white rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEdit('hashtagText', displayHashtag)}
                      className="text-[13.5px] sm:text-[14px] font-extrabold text-black tracking-tight mt-1.5 cursor-pointer hover:text-[#0052CC] transition-colors"
                      title="Clique para editar hashtag"
                    >
                      {displayHashtag}
                    </span>
                  )}
                </div>
              )}

              {/* Discreet button to customize banner */}
              <button
                id="btn-edit-banner"
                onClick={() => setIsBannerModalOpen(true)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                title="Personalizar banner"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quentro Live Security Progress Bar matching IMG_9243.jpeg */}
            <div className="w-full h-[2.5px] bg-[#E5E7EB] flex overflow-hidden">
              <div
                className="h-full bg-[#00D2B4] transition-all duration-300 ease-linear shadow-[0_0_6px_#00D2B4]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Lower Section: QR Code (Left) + SETOR & Mais Informação (Right) */}
            <div className="p-4 sm:p-4.5 bg-white flex items-center justify-between gap-4">
              {/* Dynamic QR Code with discreet sector/price switch on tap */}
              <div
                id="ticket-qr-container"
                onClick={handleQrClick}
                onDoubleClick={() => setIsQrZoomed(true)}
                className="relative w-[122px] h-[122px] sm:w-[130px] sm:h-[130px] shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden cursor-pointer group qr-code-protected active:scale-[0.97] transition-transform select-none"
                title="Toque no QR Code para alternar o setor e valor"
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
                  animate={{ y: [-2, 116, -2] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D2B4] to-transparent shadow-[0_0_8px_#00D2B4] pointer-events-none z-10"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
              </div>

              {/* Right Side: SETOR & Mais informação Button */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-[122px] sm:h-[130px] py-0.5">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider text-[#8A98A5] uppercase block">
                    SETOR
                  </span>

                  {editingField === 'sector' ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
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
                        className="text-[15px] font-medium text-black border-b border-[#0052CC] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                      />
                      <button
                        onClick={() => saveEdit('sector')}
                        className="p-1 rounded bg-[#0052CC] text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEdit('sector', displaySector)}
                      className="text-[15.5px] sm:text-[16px] font-medium text-black cursor-pointer hover:text-[#0052CC] transition-colors truncate mt-0.5 leading-snug"
                      title="Clique para editar setor"
                    >
                      {displaySector}
                    </div>
                  )}
                </div>

                {/* Mais informação Pill Button matching IMG_9243.jpeg */}
                <button
                  id="btn-ticket-more-info"
                  onClick={onOpenInfo}
                  className="bg-[#E5F7FF] hover:bg-[#D9F2FE] active:scale-95 text-[#0099C4] font-medium text-[12.5px] py-2 px-3.5 rounded-[9px] text-center transition-all cursor-pointer w-fit mt-auto"
                >
                  Mais informação
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              CARD 2: Details Card matching IMG_9243.jpeg
              - TITULAR: Fernanda Lucena / 662.266.173-14 + Pencil Icon
              - TAXA: ESTUDA: Meia-Entrada - R$ 490
              - SEÇÃO: CADEIRA SUPERIOR | FILEIRA: Não numerado
              - ABERTURA: 16:00 | INÍCIO: 20:00
              ======================================================== */}
          <div className="w-full bg-white rounded-[16px] sm:rounded-[18px] p-5 shadow-xl text-black mt-2.5 sm:mt-3 select-none">
            {/* Field 1: TITULAR with Pencil Icon on Right */}
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#8A98A5] tracking-wider uppercase">
                  TITULAR
                </span>
                <button
                  id="btn-edit-pencil-titular"
                  onClick={() => startEdit('titular', displayTitular)}
                  className="text-[#00A3C4] hover:text-[#0082A6] active:scale-90 transition-transform p-0.5 cursor-pointer"
                  title="Editar titular e CPF"
                >
                  <Pencil className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {editingField === 'titular' ? (
                <div className="flex flex-col gap-1.5 mt-1.5">
                  <input
                    type="text"
                    placeholder="Nome do Titular"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-[15px] font-medium text-black border-b border-[#0052CC] bg-blue-50/40 px-1 py-0.5 rounded focus:outline-none"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="CPF do Titular"
                    value={editCpfValue}
                    onChange={(e) => setEditCpfValue(e.target.value)}
                    className="text-[14px] font-medium text-black border-b border-[#0052CC] bg-blue-50/40 px-1 py-0.5 rounded focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      onClick={() => setEditingField(null)}
                      className="px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEdit('titular')}
                      className="px-2.5 py-0.5 bg-[#0052CC] text-white rounded text-xs font-semibold"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => startEdit('titular', displayTitular)}
                  className="cursor-pointer hover:text-[#0052CC] transition-colors mt-0.5"
                  title="Clique para editar titular"
                >
                  <p className="text-[15.5px] font-medium text-black leading-tight">
                    {displayTitular}
                  </p>
                  <p className="text-[14px] font-medium text-black leading-tight mt-0.5 tracking-tight">
                    {displayTitularCpf}
                  </p>
                </div>
              )}
            </div>

            {/* Field 2: TAXA */}
            <div className="mt-3.5">
              <span className="text-[10px] font-semibold text-[#8A98A5] tracking-wider uppercase block">
                TAXA
              </span>
              {editingField === 'taxa' ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit('taxa')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('taxa');
                      if (e.key === 'Escape') setEditingField(null);
                    }}
                    autoFocus
                    className="text-[14.5px] font-semibold text-black border-b border-[#0052CC] bg-blue-50/40 px-1 py-0.5 w-full rounded focus:outline-none"
                  />
                  <button
                    onClick={() => saveEdit('taxa')}
                    className="p-1 rounded bg-[#0052CC] text-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <p
                  onClick={() => startEdit('taxa', displayTaxa)}
                  className="text-[14.5px] font-semibold text-black leading-normal mt-0.5 cursor-pointer hover:text-[#0052CC] transition-colors"
                  title="Clique para editar taxa"
                >
                  {displayTaxa}
                </p>
              )}
            </div>

            {/* Field 3: SEÇÃO & FILEIRA (Two columns) */}
            <div className="mt-3.5 flex items-start justify-between">
              {/* Left Column: SEÇÃO */}
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-[#8A98A5] tracking-wider uppercase block">
                  SEÇÃO
                </span>
                {editingField === 'section' ? (
                  <div className="flex items-center gap-1 mt-0.5">
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
                      className="text-[14px] font-bold text-black uppercase border-b border-[#0052CC] bg-blue-50/40 px-1 py-0.5 rounded focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit('section')}
                      className="p-1 rounded bg-[#0052CC] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={() => startEdit('section', displaySection)}
                    className="text-[14px] font-bold text-black uppercase mt-0.5 cursor-pointer hover:text-[#0052CC] transition-colors"
                    title="Clique para editar seção"
                  >
                    {displaySection}
                  </p>
                )}
              </div>

              {/* Right Column: FILEIRA */}
              <div className="min-w-0 text-left">
                <span className="text-[10px] font-semibold text-[#8A98A5] tracking-wider uppercase block">
                  FILEIRA
                </span>
                {editingField === 'row' ? (
                  <div className="flex items-center gap-1 mt-0.5">
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
                      className="text-[14px] font-normal text-black border-b border-[#0052CC] bg-blue-50/40 px-1 py-0.5 rounded focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit('row')}
                      className="p-1 rounded bg-[#0052CC] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={() => startEdit('row', displayRow)}
                    className="text-[14px] font-normal text-black mt-0.5 cursor-pointer hover:text-[#0052CC] transition-colors"
                    title="Clique para editar fileira"
                  >
                    {displayRow}
                  </p>
                )}
              </div>
            </div>

            {/* Field 4: ABERTURA & INÍCIO (Two columns) */}
            <div className="mt-3.5 flex items-start justify-between">
              {/* Left Column: ABERTURA */}
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-[#8A98A5] tracking-wider uppercase block">
                  ABERTURA
                </span>
                {editingField === 'openingTime' ? (
                  <div className="flex items-center gap-1 mt-0.5">
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
                      className="text-[15px] font-bold text-black border-b border-[#0052CC] bg-blue-50/40 px-1 py-0.5 rounded focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit('openingTime')}
                      className="p-1 rounded bg-[#0052CC] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={() => startEdit('openingTime', displayOpening)}
                    className="text-[15px] font-bold text-black mt-0.5 cursor-pointer hover:text-[#0052CC] transition-colors"
                    title="Clique para editar abertura"
                  >
                    {displayOpening}
                  </p>
                )}
              </div>

              {/* Right Column: INÍCIO */}
              <div className="min-w-0 text-left">
                <span className="text-[10px] font-semibold text-[#8A98A5] tracking-wider uppercase block">
                  INÍCIO
                </span>
                {editingField === 'startTime' ? (
                  <div className="flex items-center gap-1 mt-0.5">
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
                      className="text-[15px] font-bold text-black border-b border-[#0052CC] bg-blue-50/40 px-1 py-0.5 rounded focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit('startTime')}
                      className="p-1 rounded bg-[#0052CC] text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p
                    id="btn-trigger-stealth-blackout-time"
                    onClick={() => setIsTotalBlackoutActive(true)}
                    onDoubleClick={() => startEdit('startTime', displayStart)}
                    className="text-[15px] font-bold text-black mt-0.5 cursor-pointer hover:text-[#0052CC] transition-colors select-none"
                    title="Toque no horário para ativar tela preta (2 toques: Transferência / 3 toques: Restaurar)"
                  >
                    {displayStart}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows when multiple tickets exist */}
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

      {/* MODAL 1: Fullscreen QR Code Zoom */}
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
                <TicketmasterLogo className="w-36 h-auto" color="#0052CC" />
              </div>

              <div className="text-center mb-4">
                <span className="text-[11px] font-bold text-[#8A98A5] uppercase tracking-wider block">
                  {displaySector}
                </span>
                <h4 className="text-base font-bold text-zinc-900 mt-0.5">
                  {displaySection}
                </h4>
                <p className="text-xs text-zinc-500">{displayTitular}</p>
              </div>

              {/* Large Crisp QR Code with Animated Scanning Beam */}
              <div className="relative p-2 bg-white rounded-2xl border-2 border-zinc-100 shadow-inner flex items-center justify-center overflow-hidden qr-code-protected">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anti-Screenshot Security Modal matching 68342559-182f-47e3-b75a-617766e4be17.jpeg */}
      <AntiScreenshotModal
        isOpen={isAntiScreenshotOpen}
        onClose={() => setIsAntiScreenshotOpen(false)}
        onOpenMoreInfo={onOpenInfo}
      />

      {/* MODAL 2: Banner Customization Modal */}
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
                  className="w-full p-3 rounded-xl bg-[#0052CC] hover:bg-[#0047b3] active:scale-[0.99] flex items-center justify-between transition-all cursor-pointer"
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
                      event.coverImage || '/bts-poster-square.webp'
                    )
                  }
                  className="w-full p-3 rounded-xl bg-[#252E2E] hover:bg-[#2D3737] border border-zinc-700/60 active:scale-[0.99] flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={event.coverImage || '/bts-poster-square.webp'}
                      alt="Pôster"
                      className="w-10 h-7 rounded object-cover"
                      loading="eager"
                      decoding="async"
                    />
                    <span className="text-xs font-semibold text-zinc-200">
                      Pôster Oficial do Show
                    </span>
                  </div>
                  {currentTicket.bannerType === 'custom' &&
                    currentTicket.bannerImage ===
                      (event.coverImage || '/bts-poster-square.webp') && (
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

      {/* Stealth 100% Pitch-Black Screen Mode for recordings / WhatsApp screen sharing */}
      {isTotalBlackoutActive && (
        <div
          id="stealth-pitch-blackout"
          onClick={handleBlackoutScreenTap}
          onTouchStart={handleBlackoutScreenTap}
          className="fixed inset-0 z-[9999999] bg-black select-none cursor-pointer"
          style={{
            backgroundColor: '#000000',
            width: '100vw',
            height: '100dvh',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          aria-label="Tela preta de proteção ativa"
        />
      )}
    </div>
  );
};
