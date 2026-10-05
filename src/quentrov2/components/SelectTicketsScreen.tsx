import React, { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
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
  type: 'title' | 'titular' | 'sector' | 'section' | 'category' | 'row' | 'seat' | 'buttonText';
  ticketId?: string;
  value: string;
}

// 100% accurate reproduction of the track/course layout watermark in 3a0a3f88-19f1-40d8-bd62-0e4052e7ff70.jpeg
const TicketmasterArenaWatermark: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
    viewBox="0 0 100 85"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Upper flowing course tracks */}
    <path
      d="M -5 30 L 42 12 L 105 16"
      stroke="#EAEFF5"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 52 14 L 105 40"
      stroke="#EAEFF5"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    {/* Center diagonal thoroughfare */}
    <path
      d="M 10 16 L 88 74"
      stroke="#EAEFF5"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    {/* Lower left boundary and pathway block */}
    <path
      d="M -5 66 L 32 92"
      stroke="#EAEFF5"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M 16 52 L 16 82 L 36 82"
      stroke="#EAEFF5"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Lower right venue block */}
    <path
      d="M 64 84 L 92 62 L 92 84"
      stroke="#EAEFF5"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SelectTicketsScreen: React.FC<SelectTicketsScreenProps> = ({
  event,
  tickets,
  onBack,
  onProceedToTransfer,
  onUpdateEvent,
  onUpdateTicket,
}) => {
  const eventId = event?.id || 'event-default';
  const activeTickets = (tickets && tickets.length > 0) ? tickets : (event?.tickets || []);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return activeTickets.length > 0 ? [activeTickets[0].id] : [];
  });
  const [screenTitle, setScreenTitle] = useState(() => {
    try {
      return localStorage.getItem(`quentro_select_title_${eventId}`) || 'Selecionar ingressos';
    } catch {
      return 'Selecionar ingressos';
    }
  });
  const [buttonText, setButtonText] = useState(() => {
    try {
      return localStorage.getItem(`quentro_select_btn_${eventId}`) || 'Transferir ingresso';
    } catch {
      return 'Transferir ingresso';
    }
  });
  const [editing, setEditing] = useState<EditState | null>(null);

  const toggleTicket = (id: string) => {
    if (editing) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCategoryBadge = (category?: string) => {
    const clean = (category || 'Meia').trim().toUpperCase();
    if (clean.includes('MEIA')) return 'MEIA-ENTRADA';
    if (clean.includes('INTEIRA')) return 'INTEIRA';
    return clean || 'MEIA-ENTRADA';
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const val = editing.value.trim();

    if (editing.type === 'title') {
      const finalVal = val || 'Selecionar ingressos';
      setScreenTitle(finalVal);
      try {
        localStorage.setItem(`quentro_select_title_${eventId}`, finalVal);
      } catch (e) {
        console.error(e);
      }
    } else if (editing.type === 'buttonText') {
      const finalVal = val || 'Transferir ingresso';
      setButtonText(finalVal);
      try {
        localStorage.setItem(`quentro_select_btn_${eventId}`, finalVal);
      } catch (e) {
        console.error(e);
      }
    } else if (editing.ticketId && onUpdateTicket) {
      if (editing.type === 'titular') {
        onUpdateTicket(editing.ticketId, { titularName: val || 'FERNANDA LUCENA' });
      } else if (editing.type === 'sector') {
        onUpdateTicket(editing.ticketId, { sector: val || 'Cadeira Superior' });
      } else if (editing.type === 'section') {
        onUpdateTicket(editing.ticketId, { section: val || 'CADEIR...' });
      } else if (editing.type === 'category') {
        onUpdateTicket(editing.ticketId, { category: val || 'Meia' });
      } else if (editing.type === 'row') {
        onUpdateTicket(editing.ticketId, { row: val || '-' });
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
      {/* Top Header matching Quentro theme */}
      <header
        className="sticky top-0 z-30 flex items-center px-4 pb-2.5 w-full bg-[#121719] select-none"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        }}
      >
        <button
          id="btn-select-back"
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:text-zinc-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="ml-2 flex-1 min-w-0">
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
              className="text-[18px] font-normal text-white tracking-tight leading-tight cursor-pointer hover:text-zinc-200 inline-block"
              title="Clique para editar título"
            >
              {screenTitle}
            </h1>
          )}
        </div>
      </header>

      {/* Ticket Selection List matching 3a0a3f88-19f1-40d8-bd62-0e4052e7ff70.jpeg */}
      <main className="flex-1 px-4 pt-3 pb-28 max-w-md mx-auto w-full space-y-3">
        {activeTickets.map((ticket) => {
          const isSelected = selectedIds.includes(ticket.id);
          const displayTitular = (ticket.titularName || 'MARCELLE RODRIGUES').toUpperCase();
          const displaySector = ticket.sector || 'Pista';
          const displaySection = ticket.section || 'PISTA';
          const displayCategory = ticket.category || 'Meia';
          const displayRow =
            !ticket.row || /n[aã]o\s*numerado/i.test(ticket.row) ? '-' : ticket.row;
          const displaySeat = ticket.seat || '-';
          const badgeCategory = getCategoryBadge(displayCategory);

          const isEditingTitular =
            editing?.type === 'titular' && editing.ticketId === ticket.id;
          const isEditingSector =
            editing?.type === 'sector' && editing.ticketId === ticket.id;
          const isEditingSection =
            editing?.type === 'section' && editing.ticketId === ticket.id;
          const isEditingRow =
            editing?.type === 'row' && editing.ticketId === ticket.id;
          const isEditingSeat =
            editing?.type === 'seat' && editing.ticketId === ticket.id;

          return (
            <div
              key={ticket.id}
              id={`select-ticket-${ticket.id}`}
              onClick={() => toggleTicket(ticket.id)}
              className="w-full flex flex-row items-stretch gap-[3px] cursor-pointer select-none"
            >
              {/* Left Independent Card: Ticket Art, Blue Category Banner, Edge-to-Edge Ticketmaster Logo, and Center Circle */}
              <div
                className={`w-[114px] sm:w-[122px] shrink-0 rounded-[14px] overflow-hidden flex flex-col items-stretch relative select-none transition-all duration-150 ${
                  isSelected
                    ? 'bg-white shadow-md'
                    : 'bg-[#1F262B]'
                }`}
              >
                {/* Top Blue Badge with Rounded Top Corners: MEIA-ENTRADA / INTEIRA */}
                <div
                  className="w-full bg-[#0055D2] text-white font-bold text-[10.5px] py-1.5 px-1 text-center tracking-wider uppercase leading-none select-none rounded-t-[14px]"
                >
                  {badgeCategory}
                </div>

                {/* Substrate Body: Clean Pure White, Edge-to-Edge Ticketmaster Logo, Blueprint Watermark, and #OAovivoAgora */}
                <div className="flex-1 flex flex-col items-center justify-center px-0 py-2 relative min-h-[92px] bg-white overflow-hidden rounded-b-[14px]">
                  {/* Arena floor plan watermark matching 3a0a3f88-19f1-40d8-bd62-0e4052e7ff70.jpeg */}
                  <TicketmasterArenaWatermark />

                  {ticket.bannerType === 'custom' && ticket.bannerImage ? (
                    <img
                      src={ticket.bannerImage}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center z-10 px-0 select-none">
                      {/* Ticketmaster Logo spanning edge-to-edge from end to end */}
                      <TicketmasterLogo
                        className="w-full h-auto block"
                        color="#0055D2"
                      />
                      <span className="text-[9px] font-bold text-black tracking-tight select-none mt-1 text-center w-full">
                        #OAovivoEAgora
                      </span>
                    </div>
                  )}

                  {/* Centered Circle: Solid Black when unselected, Emerald Green with White Checkmark when selected */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    {isSelected ? (
                      <div className="w-[38px] h-[38px] rounded-full bg-[#18B88E] text-white flex items-center justify-center shadow-md transition-transform duration-150 scale-100">
                        <Check className="w-[22px] h-[22px] stroke-[3.4] text-white" />
                      </div>
                    ) : (
                      <div className="w-[38px] h-[38px] rounded-full bg-black shadow-md transition-transform duration-150 scale-100 ring-1 ring-zinc-700/50" />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Independent Card: Rounded [14px] on all corners, Pure White when selected, Dark Charcoal (#1F262B) when unselected */}
              <div
                className={`flex-1 min-w-0 rounded-[14px] p-3.5 flex flex-col justify-between transition-colors duration-150 ${
                  isSelected
                    ? 'bg-white shadow-md'
                    : 'bg-[#1F262B] border border-white/[0.04]'
                }`}
              >
                <div>
                  {/* Titular Name: Where user had covered it, fully editable on click */}
                  <div className="mb-0.5">
                    {isEditingTitular ? (
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
                          className="bg-[#161C1C] border border-[#00D2B4] rounded px-1.5 py-0.5 text-[11px] text-white w-full uppercase focus:outline-none"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 rounded bg-[#00D2B4] text-[#161C1C]"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing({
                            type: 'titular',
                            ticketId: ticket.id,
                            value: displayTitular,
                          });
                        }}
                        className={`text-[11px] font-semibold uppercase tracking-wide leading-none truncate block cursor-pointer hover:underline ${
                          isSelected ? 'text-[#00A88F]' : 'text-[#00D2B4]'
                        }`}
                        title="Clique para editar titular"
                      >
                        {displayTitular}
                      </span>
                    )}
                  </div>

                  {/* Sector Name: e.g. Pista */}
                  <div className="mb-2.5">
                    {isEditingSector ? (
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
                            type: 'sector',
                            ticketId: ticket.id,
                            value: displaySector,
                          });
                        }}
                        className={`text-[17px] font-bold tracking-tight truncate leading-tight cursor-pointer hover:underline mt-0.5 ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}
                        title="Clique para editar setor"
                      >
                        {displaySector}
                      </h3>
                    )}
                  </div>
                </div>

                {/* 3-Column Info Grid: SEÇÃO | FILEIRA | ASSENTO matching 3a0a3f88-19f1-40d8-bd62-0e4052e7ff70.jpeg */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-1">
                  {/* SEÇÃO */}
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider block leading-none mb-1 ${
                        isSelected ? 'text-[#4A5568]' : 'text-[#8A96A0]'
                      }`}
                    >
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
                        className={`text-[14px] font-bold uppercase truncate block leading-tight cursor-pointer hover:underline ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}
                        title="Clique para editar seção"
                      >
                        {displaySection}
                      </span>
                    )}
                  </div>

                  {/* FILEIRA */}
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider block leading-none mb-1 ${
                        isSelected ? 'text-[#4A5568]' : 'text-[#8A96A0]'
                      }`}
                    >
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
                        className={`text-[14px] font-bold uppercase truncate block leading-tight cursor-pointer hover:underline ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}
                        title="Clique para editar fileira"
                      >
                        {displayRow}
                      </span>
                    )}
                  </div>

                  {/* ASSENTO */}
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider block leading-none mb-1 ${
                        isSelected ? 'text-[#4A5568]' : 'text-[#8A96A0]'
                      }`}
                    >
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
                        className={`text-[14px] font-bold uppercase truncate block leading-tight cursor-pointer hover:underline ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}
                        title="Clique para editar assento"
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

      {/* Bottom Action Button matching 3a0a3f88-19f1-40d8-bd62-0e4052e7ff70.jpeg: Completely White when active, dark when disabled */}
      <footer
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-6 pt-3 bg-gradient-to-t from-[#121719] via-[#121719]/95 to-transparent z-20"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        }}
      >
        <button
          id="btn-confirm-selection"
          disabled={selectedIds.length === 0}
          onClick={() => onProceedToTransfer(selectedIds)}
          className={`w-full py-3.5 px-4 rounded-[14px] text-[16px] font-semibold transition-all text-center tracking-normal ${
            selectedIds.length > 0
              ? 'bg-white hover:bg-zinc-100 text-black cursor-pointer shadow-lg active:scale-[0.99]'
              : 'bg-[#20272D] text-[#55606A] font-medium cursor-not-allowed'
          }`}
        >
          {buttonText}
        </button>
      </footer>
    </div>
  );
};
