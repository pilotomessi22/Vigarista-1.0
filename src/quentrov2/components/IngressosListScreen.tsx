import React, { useState, useRef } from 'react';
import { ChevronLeft, Check, X } from 'lucide-react';
import { ConcertEvent, Ticket } from '../types';

interface IngressosListScreenProps {
  event: ConcertEvent;
  tickets: Ticket[];
  onBack: () => void;
  onSelectTicket: (ticketIndex: number) => void;
  onUpdateEvent?: (eventId: string, updatedFields: Partial<ConcertEvent>) => void;
  onUpdateTicket?: (ticketId: string, updatedFields: Partial<Ticket>) => void;
}

interface EditState {
  type: 'screenTitle' | 'fullDate' | 'section' | 'category' | 'sector';
  ticketId?: string;
  ticketIndex?: number;
  value: string;
}

export const IngressosListScreen: React.FC<IngressosListScreenProps> = ({
  event,
  tickets,
  onBack,
  onSelectTicket,
  onUpdateEvent,
  onUpdateTicket,
}) => {
  const activeTickets = tickets.length > 0 ? tickets : event.tickets;

  // Custom screen title (default "Ingressos")
  const [screenTitle, setScreenTitle] = useState(() => {
    return localStorage.getItem(`quentro_ingressos_title_${event.id}`) || 'Ingressos';
  });

  const [editing, setEditing] = useState<EditState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hidden file upload for changing poster image
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTriggerImageUpload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    fileInputRef.current?.click();
  };

  const startLongPressImage = () => {
    longPressTimerRef.current = setTimeout(() => {
      handleTriggerImageUpload();
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
    if (file && onUpdateEvent) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateEvent(event.id, { coverImage: reader.result });
          showToast('Poster atualizado com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const val = editing.value.trim();

    if (editing.type === 'screenTitle') {
      const finalVal = val || 'Ingressos';
      setScreenTitle(finalVal);
      try {
        localStorage.setItem(`quentro_ingressos_title_${event.id}`, finalVal);
      } catch (e) {
        console.error(e);
      }
    } else if (editing.type === 'fullDate' && onUpdateEvent) {
      onUpdateEvent(event.id, {
        fullDate: val || event.fullDate,
      });
    } else if (editing.ticketId && onUpdateTicket) {
      if (editing.type === 'section') {
        onUpdateTicket(editing.ticketId, { section: val || 'Pista' });
      } else if (editing.type === 'category') {
        onUpdateTicket(editing.ticketId, { category: val || 'Inteira' });
      } else if (editing.type === 'sector') {
        onUpdateTicket(editing.ticketId, { sector: val || 'Pista' });
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

  return (
    <div className="flex flex-col min-h-screen bg-[#121719] text-white w-full select-none font-sans">
      {/* Hidden file input for changing event poster */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0E1414] border border-[#00D2B4]/40 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-[13px] font-medium pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-[#00D2B4] stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header - Fixed at top matching IMG_8617 */}
      <header
        className="sticky top-0 z-30 w-full px-5 pt-3 pb-3.5 select-none bg-[#121719]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        }}
      >
        <div className="flex items-start gap-3.5">
          {/* Back chevron '<' aligned with the title line */}
          <button
            id="btn-ingressos-back"
            onClick={onBack}
            className="text-white hover:text-[#00D2B4] active:scale-95 transition-colors cursor-pointer pt-0.5 -ml-1 shrink-0"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Title and Subtitle aligned together to the right of chevron */}
          <div className="flex-1 min-w-0 flex flex-col justify-start">
            {/* Header Title: "Ingressos" (editable strictly on text click) */}
            <div className="min-h-[28px] flex items-center">
              {editing?.type === 'screenTitle' ? (
                <div
                  className="flex items-center gap-1.5 w-full max-w-[240px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className="bg-[#182023] border border-[#00D2B4] text-white text-[20px] font-normal px-2 py-0.5 rounded-[8px] w-full focus:outline-none"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 rounded bg-[#00D2B4] text-[#161C1C] hover:opacity-90 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({ type: 'screenTitle', value: screenTitle });
                  }}
                  className="cursor-pointer inline-flex items-center"
                >
                  <h1 className="text-[21px] font-normal text-white tracking-tight leading-none">
                    {screenTitle}
                  </h1>
                </div>
              )}
            </div>

            {/* Subtitle: "Quarta-feira, 28/10/2026 · 20:00hs" */}
            <div className="mt-1.5">
              {editing?.type === 'fullDate' ? (
                <div
                  className="flex items-center gap-1.5 w-full max-w-[280px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className="bg-[#182023] border border-[#00D2B4] text-white text-[13px] px-2 py-0.5 rounded-[6px] w-full focus:outline-none"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 rounded bg-[#00D2B4] text-[#161C1C] hover:opacity-90 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({ type: 'fullDate', value: event.fullDate });
                  }}
                  className="cursor-pointer inline-flex items-center"
                >
                  <p className="text-[13px] text-[#7E8E9B] font-normal tracking-tight leading-tight">
                    {event.fullDate}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Ticket List matching IMG_8617 exactly */}
      <main className="flex-1 px-4 pt-1.5 pb-8 max-w-xl mx-auto w-full space-y-3.5">
        {activeTickets.map((ticket, index) => {
          const isEditingSection =
            editing?.type === 'section' && editing.ticketId === ticket.id;
          const isEditingCategory =
            editing?.type === 'category' && editing.ticketId === ticket.id;
          const isEditingSector =
            editing?.type === 'sector' && editing.ticketId === ticket.id;

          return (
            <div
              key={ticket.id}
              id={`ticket-card-row-${ticket.id}`}
              onClick={() => {
                // Tapping anywhere on the ticket card opens the ticket with Ticketmaster & QR Code!
                if (!editing) {
                  onSelectTicket(index);
                }
              }}
              className="w-full bg-[#182023] hover:bg-[#1E272B] active:scale-[0.985] rounded-[14px] overflow-hidden flex flex-row items-stretch cursor-pointer transition-all duration-150 shadow-sm select-none relative"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                height: '88px',
                minHeight: '88px',
                maxHeight: '88px',
                borderRadius: '14px',
                overflow: 'hidden',
              }}
            >
              {/* Left Artwork - Exactly 88x88px with subtle 8px rounded corners aligned with card height */}
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleTriggerImageUpload(e);
                }}
                onTouchStart={startLongPressImage}
                onTouchEnd={cancelLongPressImage}
                onTouchCancel={cancelLongPressImage}
                className="w-[88px] h-[88px] shrink-0 bg-[#f3f3f3] overflow-hidden relative select-none rounded-[8px]"
                style={{
                  width: '88px',
                  height: '88px',
                  minWidth: '88px',
                  maxWidth: '88px',
                  minHeight: '88px',
                  maxHeight: '88px',
                  flexShrink: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={event.coverImage || '/bts-card-oficial.jpeg'}
                  alt={event.title}
                  width="88"
                  height="88"
                  className="w-full h-full object-contain block select-none pointer-events-none rounded-[8px]"
                  style={{
                    width: '88px',
                    height: '88px',
                    minWidth: '88px',
                    maxWidth: '88px',
                    minHeight: '88px',
                    maxHeight: '88px',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '8px',
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('.jpeg')) {
                      target.src = '/bts-card-oficial.png';
                    } else if (target.src.includes('.png')) {
                      target.src = '/bts-card-oficial.jpg';
                    }
                  }}
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Right Content Area: Spacious layout with clean internal padding */}
              <div
                className="flex-1 min-w-0 flex flex-col justify-between px-3.5 py-2.5 h-[88px]"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Title line: e.g. "Pista" */}
                <div className="w-full flex items-center min-w-0">
                  {isEditingSection ? (
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
                        className="bg-[#161C1C] border border-[#00D2B4] rounded px-1.5 py-0.5 text-[14px] font-medium text-white w-full focus:outline-none"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 rounded bg-[#00D2B4] text-[#161C1C]"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <h3
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing({
                          type: 'section',
                          ticketId: ticket.id,
                          ticketIndex: index,
                          value: ticket.section || 'Pista',
                        });
                      }}
                      className="text-white font-normal text-[16px] leading-tight tracking-tight truncate inline-block w-fit max-w-full cursor-pointer"
                    >
                      {ticket.section || 'Pista'}
                    </h3>
                  )}
                </div>

                {/* Bottom Row: CATEGORIA & SETOR */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  {/* CATEGORIA */}
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#6E8090] font-medium uppercase tracking-wider block leading-none mb-1">
                      CATEGORIA
                    </span>
                    {isEditingCategory ? (
                      <div
                        className="flex items-center gap-1"
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
                          className="bg-[#161C1C] border border-[#00D2B4] rounded px-1 py-0.5 text-[12px] font-normal text-white w-full focus:outline-none"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-0.5 rounded bg-[#00D2B4] text-[#161C1C]"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing({
                            type: 'category',
                            ticketId: ticket.id,
                            ticketIndex: index,
                            value: ticket.category || 'Inteira',
                          });
                        }}
                        className="text-[13.5px] font-normal text-zinc-100 block truncate inline-block w-fit max-w-full cursor-pointer leading-tight"
                      >
                        {ticket.category || 'Inteira'}
                      </span>
                    )}
                  </div>

                  {/* SETOR */}
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#6E8090] font-medium uppercase tracking-wider block leading-none mb-1">
                      SETOR
                    </span>
                    {isEditingSector ? (
                      <div
                        className="flex items-center gap-1"
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
                          className="bg-[#161C1C] border border-[#00D2B4] rounded px-1 py-0.5 text-[12px] font-normal text-white w-full focus:outline-none"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-0.5 rounded bg-[#00D2B4] text-[#161C1C]"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing({
                            type: 'sector',
                            ticketId: ticket.id,
                            ticketIndex: index,
                            value: ticket.sector || 'Pista',
                          });
                        }}
                        className="text-[13.5px] font-normal text-zinc-100 block truncate inline-block w-fit max-w-full cursor-pointer leading-tight"
                      >
                        {ticket.sector || 'Pista'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
