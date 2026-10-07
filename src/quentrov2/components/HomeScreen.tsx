import React, { useState, useRef } from 'react';
import { Bell, User, RefreshCw, Check, X, CheckCircle2 } from 'lucide-react';
import { ConcertEvent } from '../types';

interface HomeScreenProps {
  events: ConcertEvent[];
  pastEvents: ConcertEvent[];
  homeTitle?: string;
  onUpdateHomeTitle?: (newTitle: string) => void;
  onUpdateEvent?: (eventId: string, updatedFields: Partial<ConcertEvent>) => void;
  onUpdateTicketCount?: (eventId: string, count: number) => void;
  onSelectEvent: (event: ConcertEvent) => void;
  onOpenAccount: () => void;
  onOpenNotifications: () => void;
  onOpenAddToHome?: () => void;
  onToggleScaleAdjuster?: () => void;
  onClose?: () => void;
}

type EditableField =
  | { type: 'homeTitle'; value: string }
  | { type: 'monthYear'; eventId: string; value: string }
  | { type: 'ticketCount'; eventId: string; value: string }
  | { type: 'date'; eventId: string; value: string }
  | { type: 'title'; eventId: string; value: string }
  | { type: 'venue'; eventId: string; value: string }
  | null;

export const HomeScreen: React.FC<HomeScreenProps> = ({
  events,
  pastEvents,
  homeTitle = 'Meus ingressos',
  onUpdateHomeTitle,
  onUpdateEvent,
  onUpdateTicketCount,
  onSelectEvent,
  onOpenAccount,
  onOpenNotifications,
  onOpenAddToHome,
  onToggleScaleAdjuster,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'proximos' | 'anteriores'>('proximos');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editing, setEditing] = useState<EditableField>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetEventIdForImage, setTargetEventIdForImage] = useState<string | null>(null);
  const titleLongPressRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitlePressStart = () => {
    titleLongPressRef.current = setTimeout(() => {
      if (onToggleScaleAdjuster) {
        onToggleScaleAdjuster();
        if (navigator.vibrate) {
          try { navigator.vibrate(40); } catch (_) {}
        }
      }
    }, 650);
  };

  const handleTitlePressEnd = () => {
    if (titleLongPressRef.current) {
      clearTimeout(titleLongPressRef.current);
      titleLongPressRef.current = null;
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const displayedEvents = activeTab === 'proximos' ? events : pastEvents;

  // Group events by monthYear (e.g. "Outubro 2026", matching "Septiembre 2024" in IMG_8610.png)
  const groupedEvents = displayedEvents.reduce((acc, event) => {
    const key = event.monthYear || 'Próximos';
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {} as Record<string, ConcertEvent[]>);

  const hasEvents = displayedEvents.length > 0;

  // Save inline edit
  const handleSaveEdit = () => {
    if (!editing) return;
    const trimmed = editing.value.trim();

    if (editing.type === 'homeTitle') {
      if (trimmed && onUpdateHomeTitle) {
        onUpdateHomeTitle(trimmed);
        showToast('Título salvo com sucesso!');
      }
    } else if (editing.type === 'monthYear') {
      if (trimmed && onUpdateEvent) {
        onUpdateEvent(editing.eventId, { monthYear: trimmed });
        showToast('Mês/Ano salvo com sucesso!');
      }
    } else if (editing.type === 'ticketCount') {
      const parsed = parseInt(trimmed.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 12 && onUpdateTicketCount) {
        onUpdateTicketCount(editing.eventId, parsed);
        showToast(`${parsed} ${parsed === 1 ? 'ingresso salvo' : 'ingressos salvos'}!`);
      }
    } else if (editing.type === 'date') {
      if (trimmed && onUpdateEvent) {
        // e.g. "Sexta-feira 30" -> dayOfWeek "Sexta-feira", dayNumber "30"
        const parts = trimmed.split(' ');
        const dayNumber = parts.length > 1 ? parts[parts.length - 1] : '';
        const dayOfWeek = parts.length > 1 ? parts.slice(0, -1).join(' ') : trimmed;

        onUpdateEvent(editing.eventId, {
          dayOfWeek,
          dayNumber,
          dateFormatted: trimmed,
          fullDate: `${trimmed} 20:00hs`,
        });
        showToast('Data salva com sucesso!');
      }
    } else if (editing.type === 'title') {
      if (trimmed && onUpdateEvent) {
        onUpdateEvent(editing.eventId, { title: trimmed });
        showToast('Título do evento salvo!');
      }
    } else if (editing.type === 'venue') {
      if (trimmed && onUpdateEvent) {
        const currentEvt = events.find((e) => e.id === editing.eventId);
        const shortDate = currentEvt?.shortDate || '30/10/2026';
        onUpdateEvent(editing.eventId, {
          venue: trimmed,
          headerSubtitle: `${shortDate} – ${trimmed}`,
        });
        showToast('Local do evento salvo!');
      }
    }

    setEditing(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  };

  // Image Upload handler (triggered discreetly by double click or touch hold on cover photo)
  const handleTriggerImageUpload = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetEventIdForImage(eventId);
    fileInputRef.current?.click();
  };

  const startLongPressImage = (eventId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      handleTriggerImageUpload(eventId);
    }, 600);
  };

  const cancelLongPressImage = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetEventIdForImage && onUpdateEvent) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onUpdateEvent(targetEventIdForImage, { coverImage: result });
        showToast('Foto da capa atualizada e salva!');
      };
      reader.readAsDataURL(file);
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  const formatDayDisplay = (evt: ConcertEvent) => {
    return (
      evt.dateFormatted ||
      `${evt.dayOfWeek || ''} ${evt.dayNumber || ''} 20:00hs`.trim()
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121719] text-white w-full select-none font-sans relative">
      {/* Hidden file input for cover photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Save Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0E1414] border border-[#00D2B4]/40 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-[13px] font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header - Exact replica of IMG_8627.png */}
      <header
        className="w-full px-4 pt-2 select-none"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        }}
      >
        {/* Top Line: Title + Notifications + User Account */}
        <div className="flex items-center justify-between w-full mb-3.5">
          {/* Editable Title: "Meus ingressos" */}
          {editing?.type === 'homeTitle' ? (
            <div
              className="flex items-center gap-1.5 flex-1 max-w-[240px]"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                autoFocus
                className="bg-[#182023] border border-[#00D2B4] rounded-[8px] px-2 py-0.5 text-[20px] font-normal text-white w-full focus:outline-none"
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 rounded bg-[#00D2B4] text-[#161C1C] hover:opacity-90 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setEditing(null)}
                className="p-1 rounded bg-[#2A343A] text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setEditing({ type: 'homeTitle', value: homeTitle });
              }}
              onMouseDown={handleTitlePressStart}
              onMouseUp={handleTitlePressEnd}
              onMouseLeave={handleTitlePressEnd}
              onTouchStart={handleTitlePressStart}
              onTouchEnd={handleTitlePressEnd}
              className="cursor-pointer inline-flex items-center py-0.5 select-none"
              title="Toque para editar ou segure para ajuste de escala"
            >
              <h1 className="text-[21px] font-normal text-white tracking-tight leading-none">
                {homeTitle}
              </h1>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Notification Bell Button - Exact match to IMG_8627.png */}
            <button
              id="btn-home-notifications"
              onClick={onOpenNotifications}
              className="w-[36px] h-[36px] rounded-[10px] bg-[#182023] active:scale-95 text-[#93A5A5] hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Notificações"
            >
              <Bell className="w-[17px] h-[17px] stroke-[1.4]" />
            </button>

            {/* User Profile Button - Exact match to IMG_8627.png */}
            <button
              id="btn-home-account"
              onClick={onOpenAccount}
              className="w-[36px] h-[36px] rounded-[10px] bg-[#182023] active:scale-95 text-[#93A5A5] hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Conta do Usuário"
            >
              <User className="w-[17px] h-[17px] stroke-[1.4]" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: "Próximos" & "Anterior" - Exact match to IMG_8627.png */}
        <div className="bg-[#182023] p-1 rounded-[14px] h-[46px] flex items-center w-full">
          <button
            id="tab-home-proximos"
            onClick={() => setActiveTab('proximos')}
            className={`w-1/2 h-full text-center text-[13.5px] rounded-[11px] flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'proximos'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-[#516168] hover:text-zinc-200 font-normal'
            }`}
          >
            Próximos
          </button>
          <button
            id="tab-home-anterior"
            onClick={() => setActiveTab('anteriores')}
            className={`w-1/2 h-full text-center text-[13.5px] rounded-[11px] flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'anteriores'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-[#516168] hover:text-zinc-200 font-normal'
            }`}
          >
            Anterior
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className="flex-1 px-4 pt-3.5 pb-4 w-full flex flex-col"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        }}
      >
        {/* Inside "Anterior" tab: Option to close Quentro */}
        {activeTab === 'anteriores' && onClose && (
          <div className="mb-4 pt-1">
            <button
              type="button"
              id="btn-close-quentro-anterior"
              onClick={onClose}
              className="w-full bg-[#182023] hover:bg-[#1E272B] active:scale-[0.985] rounded-[16px] p-3.5 flex items-center justify-between transition-all cursor-pointer border border-[#232D33] shadow-sm text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#232D33] flex items-center justify-center text-[#00D2B4] group-hover:scale-105 transition-transform">
                  <X className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white">
                    Fechar Quentro
                  </div>
                  <div className="text-[12px] text-[#889B9B]">
                    Voltar ao aplicativo principal
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#00D2B4] bg-[#00D2B4]/10 px-3 py-1.5 rounded-full border border-[#00D2B4]/20 group-hover:bg-[#00D2B4]/20 transition-colors">
                Fechar
              </span>
            </button>
          </div>
        )}

        {/* Display: Events List OR Empty State */}
        {!hasEvents ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-20 pt-6">
            <h2 className="text-white font-medium text-[15.5px] tracking-tight leading-snug">
              {activeTab === 'anteriores'
                ? 'Nenhum ingresso anterior.'
                : 'Ainda não há ingressos em sua conta.'}
            </h2>
            <p className="text-[#889B9B] text-[13px] leading-relaxed max-w-[270px] mx-auto mt-2">
              {activeTab === 'anteriores'
                ? 'Seus ingressos utilizados ou passados serão listados aqui.'
                : 'Ao comprar seus ingressos, selecione Quentro como método de entrega.'}
            </p>
            {activeTab === 'anteriores' && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-5 py-2.5 rounded-full bg-[#182023] hover:bg-[#232D33] text-[#00D2B4] border border-[#232D33] text-[13.5px] font-medium transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Fechar Quentro</span>
              </button>
            ) : (
              <button
                id="btn-refresh-empty"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-[#00D2B4] hover:text-[#2fe6cb] active:scale-95 text-[13.5px] font-medium transition-all cursor-pointer mt-6 flex items-center gap-2"
              >
                {isRefreshing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
            )}
          </div>
        ) : (
          /* Grouped Event Cards - Exact match to IMG_8627.png */
          <div className="space-y-6 pb-6 pt-2">
            {(Object.entries(groupedEvents) as [string, ConcertEvent[]][]).map(([monthYear, groupEvents]) => {
              const subPrimaryEventId = groupEvents[0]?.id || '';
              const isEditingSubMonth =
                editing?.type === 'monthYear' && editing.eventId === subPrimaryEventId;

              const subParts = monthYear.trim().split(/\s+/);
              const subMonthName = subParts[0] || '';
              const subYearName = subParts.slice(1).join(' ') || '';

              return (
                <section key={monthYear} className="relative">
                  {/* Sticky Month & Year Header: e.g. "Outubro 2026" */}
                  <div
                    className="sticky z-20 bg-[#121719] py-1.5 -mx-4 px-4 select-none mb-3"
                    style={{
                      top: 0,
                      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 6px)',
                    }}
                  >
                    <div className="flex items-baseline px-0.5">
                      {isEditingSubMonth ? (
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            autoFocus
                            className="bg-[#182023] border border-[#00D2B4] rounded-[6px] px-2 py-0.5 text-[15px] font-medium text-white w-36 focus:outline-none"
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 rounded bg-[#00D2B4] text-[#161C1C] hover:opacity-90 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="p-1 rounded bg-[#2A343A] text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing({
                              type: 'monthYear',
                              eventId: subPrimaryEventId,
                              value: monthYear,
                            });
                          }}
                          className="cursor-pointer inline-flex items-baseline gap-1.5"
                        >
                          <h2 className="text-[16.5px] font-normal text-white tracking-tight leading-none">
                            {subMonthName}
                          </h2>
                          {subYearName && (
                            <span className="text-[16.5px] font-normal text-[#516168] leading-none">
                              {subYearName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cards inside this month group */}
                  <div className="space-y-3">
                    {groupEvents.map((event) => {
                      const ticketCount = event.tickets.length;
                      const dayDisplay = formatDayDisplay(event);

                      const isEditingTicketCount =
                        editing?.type === 'ticketCount' && editing.eventId === event.id;
                      const isEditingDate =
                        editing?.type === 'date' && editing.eventId === event.id;
                      const isEditingTitle =
                        editing?.type === 'title' && editing.eventId === event.id;
                      const isEditingVenue =
                        editing?.type === 'venue' && editing.eventId === event.id;

                      return (
                        <div
                          key={event.id}
                          id={`event-card-${event.id}`}
                          onClick={() => {
                            if (!editing) {
                              onSelectEvent(event);
                            }
                          }}
                          className="w-full bg-[#182023] hover:bg-[#1E272B] active:scale-[0.985] rounded-[16px] overflow-hidden flex flex-row items-center p-2 sm:p-2.5 cursor-pointer transition-all duration-150 shadow-sm select-none relative group/card min-h-[88px]"
                        >
                          {/* Left Artwork - Enlarged and aligned with card height (94x82px, strictly locked) */}
                          <div
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleTriggerImageUpload(event.id);
                            }}
                            onTouchStart={() => startLongPressImage(event.id)}
                            onTouchEnd={cancelLongPressImage}
                            onTouchCancel={cancelLongPressImage}
                            className="w-[94px] h-[82px] min-w-[94px] min-h-[82px] max-w-[94px] max-h-[82px] shrink-0 bg-black/40 overflow-hidden relative select-none rounded-[13px]"
                          >
                            <img
                              src={event.coverImage || '/bts-poster-square.webp'}
                              alt={event.title}
                              className="w-[94px] h-[82px] min-w-[94px] min-h-[82px] max-w-[94px] max-h-[82px] object-cover block select-none pointer-events-none"
                              loading="eager"
                              decoding="async"
                            />
                          </div>

                          {/* Right Content Area: Exact closely-spaced 3-line layout matching IMG_9363.jpeg */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center ml-3 space-y-1">
                            {/* Top Meta Line: "2 ingressos" (cyan) + "Sábado 31 20:00hs" (gray) */}
                            <div className="flex items-center gap-3.5 leading-none overflow-hidden">
                              {/* Ticket Count */}
                              {isEditingTicketCount ? (
                                <div
                                  className="flex items-center gap-1 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={editing.value}
                                    onChange={(e) =>
                                      setEditing({ ...editing, value: e.target.value })
                                    }
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSaveEdit}
                                    autoFocus
                                    className="bg-[#12171A] border border-[#00D2B4] rounded px-1.5 py-0.5 text-[12px] font-normal text-[#00D2B4] w-12 focus:outline-none text-center"
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-0.5 rounded bg-[#00D2B4] text-[#0A1A18] hover:opacity-90 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                </div>
                              ) : (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing({
                                      type: 'ticketCount',
                                      eventId: event.id,
                                      value: `${ticketCount}`,
                                    });
                                  }}
                                  className="text-[#00D2B4] font-normal text-[13px] tracking-normal shrink-0 inline-block w-fit cursor-pointer"
                                >
                                  {ticketCount === 1 ? '1 Ingresso' : `${ticketCount} Ingressos`}
                                </span>
                              )}

                              {/* Day Display (e.g., "Sábado 31 20:00hs") */}
                              {isEditingDate ? (
                                <div
                                  className="flex items-center gap-1 flex-1 min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={editing.value}
                                    onChange={(e) =>
                                      setEditing({ ...editing, value: e.target.value })
                                    }
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSaveEdit}
                                    autoFocus
                                    className="bg-[#12171A] border border-zinc-500 rounded px-1.5 py-0.5 text-[12px] font-normal text-white w-32 focus:outline-none"
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-0.5 rounded bg-zinc-600 text-white hover:opacity-90 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                </div>
                              ) : (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing({
                                      type: 'date',
                                      eventId: event.id,
                                      value: dayDisplay,
                                    });
                                  }}
                                  className="text-[#84959E] font-normal text-[13px] truncate inline-block cursor-pointer"
                                >
                                  {dayDisplay}
                                </span>
                              )}
                            </div>

                            {/* Middle Line: Event Title - exact normal weight matching IMG_8628 */}
                            <div className="w-full flex items-center min-w-0 pt-0.5">
                              {isEditingTitle ? (
                                <div
                                  className="flex items-center gap-1.5 w-full"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={editing.value}
                                    onChange={(e) =>
                                      setEditing({ ...editing, value: e.target.value })
                                    }
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSaveEdit}
                                    autoFocus
                                    className="bg-[#12171A] border border-[#00D2B4] rounded px-2 py-0.5 text-[14.5px] font-normal text-white w-full focus:outline-none"
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-1 rounded bg-[#00D2B4] text-[#161C1C] hover:opacity-90 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </button>
                                </div>
                              ) : (
                                <h3
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing({
                                      type: 'title',
                                      eventId: event.id,
                                      value: event.title,
                                    });
                                  }}
                                  className="text-white font-normal text-[15.5px] leading-tight tracking-normal truncate inline-block w-fit max-w-full cursor-pointer uppercase"
                                >
                                  {event.title}
                                </h3>
                              )}
                            </div>

                            {/* Bottom Line: Venue (e.g. "MorumBis") */}
                            <div className="w-full flex items-center min-w-0">
                              {isEditingVenue ? (
                                <div
                                  className="flex items-center gap-1 w-full"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={editing.value}
                                    onChange={(e) =>
                                      setEditing({ ...editing, value: e.target.value })
                                    }
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSaveEdit}
                                    autoFocus
                                    className="bg-[#12171A] border border-zinc-500 rounded px-1.5 py-0.5 text-[12.5px] font-normal text-white w-full focus:outline-none"
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-0.5 rounded bg-zinc-600 text-white hover:opacity-90 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                </div>
                              ) : (
                                <p
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing({
                                      type: 'venue',
                                      eventId: event.id,
                                      value: event.venue,
                                    });
                                  }}
                                  className="text-[#84959E] font-normal text-[13.5px] leading-none truncate inline-block w-fit max-w-full cursor-pointer"
                                >
                                  {event.venue}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
