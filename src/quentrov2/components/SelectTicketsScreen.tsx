import React, { useState } from 'react';
import { ChevronLeft, Check, Edit2 } from 'lucide-react';
import { ConcertEvent, Ticket } from '../types';
import { TicketmasterLogo } from './TicketmasterLogo';

interface SelectTicketsScreenProps {
  event: ConcertEvent;
  tickets: Ticket[];
  onBack: () => void;
  onProceedToTransfer: (selectedTicketIds: string[]) => void;
  onUpdateEvent?: (eventId: string, updatedFields: Partial<ConcertEvent>) => void;
  onUpdateTicket?: (ticketId: string, updatedFields: Partial<Ticket>) => void;
}

interface EditState {
  type: 'title' | 'subtitle' | 'section' | 'category' | 'row' | 'seat' | 'buttonText';
  ticketId?: string;
  value: string;
}

export const SelectTicketsScreen: React.FC<SelectTicketsScreenProps> = ({
  event,
  tickets,
  onBack,
  onProceedToTransfer,
  onUpdateEvent,
  onUpdateTicket,
}) => {
  const activeTickets = tickets.length > 0 ? tickets : event.tickets;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [screenTitle, setScreenTitle] = useState(() => {
    return localStorage.getItem(`quentro_select_title_${event.id}`) || 'Selecionar ingresso';
  });
  const [buttonText, setButtonText] = useState(() => {
    return localStorage.getItem(`quentro_select_btn_${event.id}`) || 'Transferir ingresso';
  });
  const [editing, setEditing] = useState<EditState | null>(null);

  const toggleTicket = (id: string) => {
    if (editing) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Dynamic subtitle from event / ticket data
  const primaryTicket = activeTickets[0];
  let defaultSubtitle = event.fullDate || 'Quarta-feira, 28/10/2026 · 20:00hs';
  if (primaryTicket) {
    const rawDate = primaryTicket.dateText || event.shortDate || '28/10/2026';
    const rawTime = primaryTicket.startTime ? `${primaryTicket.startTime}hs` : '20:00hs';
    if (rawDate.includes('·')) {
      defaultSubtitle = rawDate;
    } else {
      defaultSubtitle = `${rawDate} · ${rawTime}`;
    }
  }

  const [subtitleText, setSubtitleText] = useState(defaultSubtitle);

  const handleSaveEdit = () => {
    if (!editing) return;
    const val = editing.value.trim();

    if (editing.type === 'title') {
      const finalVal = val || 'Selecionar ingresso';
      setScreenTitle(finalVal);
      try {
        localStorage.setItem(`quentro_select_title_${event.id}`, finalVal);
      } catch (e) {
        console.error(e);
      }
    } else if (editing.type === 'subtitle') {
      const finalVal = val || defaultSubtitle;
      setSubtitleText(finalVal);
      if (onUpdateEvent) {
        onUpdateEvent(event.id, { fullDate: finalVal });
      }
    } else if (editing.type === 'buttonText') {
      const finalVal = val || 'Transferir ingresso';
      setButtonText(finalVal);
      try {
        localStorage.setItem(`quentro_select_btn_${event.id}`, finalVal);
      } catch (e) {
        console.error(e);
      }
    } else if (editing.ticketId && onUpdateTicket) {
      if (editing.type === 'section') {
        onUpdateTicket(editing.ticketId, { section: val || 'Pista' });
      } else if (editing.type === 'category') {
        onUpdateTicket(editing.ticketId, { category: val || 'Inteira' });
      } else if (editing.type === 'row') {
        onUpdateTicket(editing.ticketId, { row: val || 'Não numerado' });
      } else if (editing.type === 'seat') {
        onUpdateTicket(editing.ticketId, { seat: val || '-' });
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
    <div className="flex flex-col min-h-screen bg-[#121719] text-white w-full select-none font-sans relative">
      {/* Top Header matching IMG_8630 */}
      <header
        className="sticky top-0 z-30 flex items-start px-3.5 pb-2.5 w-full bg-[#121719] select-none"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        }}
      >
        <button
          id="btn-select-back"
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:text-zinc-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 mt-0.5"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <div className="ml-2.5 flex-1 min-w-0">
          {/* Editable Title */}
          {editing?.type === 'title' ? (
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
                className="bg-[#182023] border border-[#00D2B4] text-white text-[17px] font-normal px-2 py-0.5 rounded-[6px] w-full focus:outline-none"
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 rounded bg-[#00D2B4] text-[#161C1C] hover:opacity-90 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <h1
              onClick={() => setEditing({ type: 'title', value: screenTitle })}
              className="text-[17.5px] font-normal text-white tracking-tight leading-tight cursor-pointer hover:text-zinc-200 inline-block"
              title="Clique para editar título"
            >
              {screenTitle}
            </h1>
          )}

          {/* Editable Subtitle */}
          {editing?.type === 'subtitle' ? (
            <div
              className="flex items-center gap-1.5 w-full max-w-[280px] mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                autoFocus
                className="bg-[#182023] border border-[#00D2B4] text-white text-[12.5px] font-normal px-2 py-0.5 rounded-[6px] w-full focus:outline-none"
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 rounded bg-[#00D2B4] text-[#161C1C] hover:opacity-90 cursor-pointer"
              >
                <Check className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <p
              onClick={() => setEditing({ type: 'subtitle', value: subtitleText })}
              className="text-[13px] text-[#8E9CA8] font-normal leading-tight mt-0.5 truncate cursor-pointer hover:text-[#00D2B4]"
              title="Clique para editar data/horário"
            >
              {subtitleText}
            </p>
          )}
        </div>
      </header>

      {/* Ticket Selection List matching IMG_8630 */}
      <main className="flex-1 px-4 pt-3 pb-28 max-w-md mx-auto w-full space-y-3.5">
        {activeTickets.map((ticket) => {
          const isSelected = selectedIds.includes(ticket.id);
          const displaySection = ticket.section || 'Pista';
          const displayCategory = ticket.category || 'Inteira';
          const displayRow = ticket.row || 'Não numerado';
          const displaySeat = ticket.seat || '-';

          const isEditingSection =
            editing?.type === 'section' && editing.ticketId === ticket.id;
          const isEditingCategory =
            editing?.type === 'category' && editing.ticketId === ticket.id;
          const isEditingRow =
            editing?.type === 'row' && editing.ticketId === ticket.id;
          const isEditingSeat =
            editing?.type === 'seat' && editing.ticketId === ticket.id;

          return (
            <div
              key={ticket.id}
              id={`select-ticket-${ticket.id}`}
              onClick={() => toggleTicket(ticket.id)}
              className={`w-full rounded-[14px] overflow-hidden flex flex-row items-stretch transition-all duration-150 cursor-pointer select-none border ${
                isSelected
                  ? 'border-transparent shadow-lg ring-1 ring-white/10'
                  : 'border-white/[0.04] hover:border-white/10'
              }`}
            >
              {/* Left Blue Section with Official Ticketmaster Wordmark and Green Checkmark when selected */}
              <div className="w-[108px] sm:w-[115px] bg-[#0D52B7] shrink-0 flex items-center justify-center p-3 relative select-none">
                {ticket.bannerType === 'custom' && ticket.bannerImage ? (
                  <img
                    src={ticket.bannerImage}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <TicketmasterLogo className="w-[84px] h-auto" color="#FFFFFF" />
                )}

                {/* Selected Green Badge with Checkmark centered over logo matching IMG_8630 */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#00D2B4] text-[#0A1A18] flex items-center justify-center shadow-lg ring-2 ring-[#0D52B7]">
                      <Check className="w-[18px] h-[18px] stroke-[3.2] text-[#052923]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Content Section: White when selected, Dark Charcoal when unselected matching IMG_8630 */}
              <div
                className={`flex-1 min-w-0 p-3.5 sm:p-4 flex flex-col justify-between transition-colors duration-150 ${
                  isSelected ? 'bg-white' : 'bg-[#242D32]'
                }`}
              >
                {/* Header Line: Section · Category (Editable) */}
                <div className="flex items-center gap-1 mb-2.5">
                  {isEditingSection ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSaveEdit}
                        autoFocus
                        className="bg-[#161C1C] border border-[#00D2B4] rounded px-1.5 py-0.5 text-[13px] text-white w-full focus:outline-none"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 rounded bg-[#00D2B4] text-[#161C1C]"
                      >
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <h3
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing({
                          type: 'section',
                          ticketId: ticket.id,
                          value: displaySection,
                        });
                      }}
                      className={`text-[14px] sm:text-[14.5px] font-normal truncate tracking-tight cursor-pointer hover:underline ${
                        isSelected ? 'text-zinc-900' : 'text-white'
                      }`}
                      title="Clique para editar"
                    >
                      {displaySection} · {displayCategory}
                    </h3>
                  )}
                </div>

                {/* 3-Column Info Grid: SEÇÃO | FILEIRA | ASSENTO */}
                <div className="grid grid-cols-3 gap-2">
                  {/* SEÇÃO */}
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#7E8E9B] uppercase tracking-wider block leading-none font-medium mb-1">
                      SEÇÃO
                    </span>
                    {isEditingSection ? (
                      <div
                        className="flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          onKeyDown={handleKeyDown}
                          onBlur={handleSaveEdit}
                          autoFocus
                          className="bg-[#161C1C] border border-[#00D2B4] rounded px-1 py-0.5 text-[11px] text-white w-full focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing({
                            type: 'section',
                            ticketId: ticket.id,
                            value: displaySection,
                          });
                        }}
                        className={`text-[13px] font-normal uppercase truncate block leading-tight cursor-pointer hover:underline ${
                          isSelected ? 'text-zinc-900' : 'text-white'
                        }`}
                        title="Clique para editar"
                      >
                        {displaySection}
                      </span>
                    )}
                  </div>

                  {/* FILEIRA */}
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#7E8E9B] uppercase tracking-wider block leading-none font-medium mb-1">
                      FILEIRA
                    </span>
                    {isEditingRow ? (
                      <div
                        className="flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          onKeyDown={handleKeyDown}
                          onBlur={handleSaveEdit}
                          autoFocus
                          className="bg-[#161C1C] border border-[#00D2B4] rounded px-1 py-0.5 text-[11px] text-white w-full focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing({
                            type: 'row',
                            ticketId: ticket.id,
                            value: displayRow,
                          });
                        }}
                        className={`text-[13px] font-normal truncate block leading-tight cursor-pointer hover:underline ${
                          isSelected ? 'text-zinc-900' : 'text-white'
                        }`}
                        title="Clique para editar"
                      >
                        {displayRow}
                      </span>
                    )}
                  </div>

                  {/* ASSENTO */}
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#7E8E9B] uppercase tracking-wider block leading-none font-medium mb-1">
                      ASSENTO
                    </span>
                    {isEditingSeat ? (
                      <div
                        className="flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          onKeyDown={handleKeyDown}
                          onBlur={handleSaveEdit}
                          autoFocus
                          className="bg-[#161C1C] border border-[#00D2B4] rounded px-1 py-0.5 text-[11px] text-white w-full focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing({
                            type: 'seat',
                            ticketId: ticket.id,
                            value: displaySeat,
                          });
                        }}
                        className={`text-[13px] font-normal truncate block leading-tight cursor-pointer hover:underline ${
                          isSelected ? 'text-zinc-900' : 'text-white'
                        }`}
                        title="Clique para editar"
                      >
                        {displaySeat}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Action Button matching IMG_8630: White when active, dark when disabled */}
      <footer
        className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto px-4 pb-6 pt-3 bg-gradient-to-t from-[#121719] via-[#121719]/95 to-transparent z-20"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        }}
      >
        <button
          id="btn-confirm-selection"
          disabled={selectedIds.length === 0}
          onClick={() => onProceedToTransfer(selectedIds)}
          className={`w-full py-3.5 px-4 rounded-[14px] text-[15px] transition-all text-center tracking-wide ${
            selectedIds.length > 0
              ? 'bg-white hover:bg-zinc-100 text-zinc-900 font-medium cursor-pointer shadow-xl active:scale-[0.99]'
              : 'bg-[#242D32] text-[#576873] font-normal cursor-not-allowed'
          }`}
        >
          {buttonText}
        </button>
      </footer>
    </div>
  );
};
