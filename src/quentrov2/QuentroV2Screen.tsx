/**
 * Quentro v2 Screen Component
 * Componente pronto para importação sem conflitos em outros projetos
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveScreen, ConcertEvent, Ticket, UserProfile } from './types';
import { initialEvents, initialUserProfile, pastEvents as mockPastEvents } from './data/mockEvents';
import { HomeScreen } from './components/HomeScreen';
import { TicketSlider } from './components/TicketSlider';
import { SelectTicketsScreen } from './components/SelectTicketsScreen';
import { TransferTicketScreen } from './components/TransferTicketScreen';
import { IngressosListScreen } from './components/IngressosListScreen';
import { AccountScreen } from './components/AccountScreen';
import { InfoModal } from './components/InfoModal';
import { HelpModal } from './components/HelpModal';
import { NotificationsModal } from './components/NotificationsModal';
import { DiscreteScaleAdjuster } from './components/DiscreteScaleAdjuster';
import { AddToHomeScreenModal } from './components/AddToHomeScreenModal';

export interface QuentroV2Props {
  onClose?: () => void;
  initialEventId?: string;
  className?: string;
}

export function QuentroV2Screen({ onClose, initialEventId, className = '' }: QuentroV2Props) {
  const STORAGE_KEY = 'quentro_events_v9';

  // Local storage backed state
  const [events, setEvents] = useState<ConcertEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: ConcertEvent[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse saved events:', err);
      }
    }
    return initialEvents;
  });

  const [homeHeaderTitle, setHomeHeaderTitle] = useState<string>(() => {
    return localStorage.getItem('quentro_home_title') || 'Meus ingressos';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('quentro_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialUserProfile,
          ...parsed,
        };
      } catch {
        return initialUserProfile;
      }
    }
    return initialUserProfile;
  });

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [transferReturnScreen, setTransferReturnScreen] = useState<ActiveScreen>('ticket_detail');
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || initialEvents[0].id
  );
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [ticketIndexToView, setTicketIndexToView] = useState<number>(0);

  // Modals & Display Options
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAddToHomeModal, setShowAddToHomeModal] = useState(false);

  // Discrete App Scale (Zoom / Sizing control)
  const [appScale, setAppScale] = useState<number>(() => {
    const saved = localStorage.getItem('quentro_app_scale');
    return saved ? Number(saved) : 100;
  });
  const [showScaleAdjuster, setShowScaleAdjuster] = useState<boolean>(() => {
    return localStorage.getItem('quentro_show_scale_pill') === 'true';
  });

  // Sync scale to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('quentro_app_scale', String(appScale));
    } catch (e) {
      console.error('Error saving app scale:', e);
    }
  }, [appScale]);

  useEffect(() => {
    try {
      localStorage.setItem('quentro_show_scale_pill', String(showScaleAdjuster));
    } catch (e) {
      console.error('Error saving scale adjuster visibility:', e);
    }
  }, [showScaleAdjuster]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving events:', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('quentro_home_title', homeHeaderTitle);
    } catch (e) {
      console.error('Error saving home title:', e);
    }
  }, [homeHeaderTitle]);

  // Always scroll to top of the app when switching screens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeScreen]);

  useEffect(() => {
    try {
      localStorage.setItem('quentro_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  }, [userProfile]);

  const selectedEvent =
    events.find((e) => e.id === selectedEventId) ||
    mockPastEvents.find((e) => e.id === selectedEventId) ||
    events[0];

  // Handlers
  const handleSelectEvent = (event: ConcertEvent) => {
    setSelectedEventId(event.id);
    setTicketIndexToView(0);
    setActiveScreen('ingressos_list');
  };

  const handleUpdateTicket = (ticketId: string, updatedFields: Partial<Ticket>) => {
    setEvents((prevEvents) => {
      const next = prevEvents.map((evt) => ({
        ...evt,
        tickets: evt.tickets.map((tkt) =>
          tkt.id === ticketId ? { ...tkt, ...updatedFields } : tkt
        ),
      }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const handleUpdateEvent = (eventId: string, updatedFields: Partial<ConcertEvent>) => {
    setEvents((prevEvents) => {
      const next = prevEvents.map((evt) =>
        evt.id === eventId ? { ...evt, ...updatedFields } : evt
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const handleUpdateTicketCount = (eventId: string, newCount: number) => {
    if (newCount < 1 || newCount > 10) return;
    setEvents((prevEvents) => {
      const next = prevEvents.map((evt) => {
        if (evt.id !== eventId) return evt;
        const currentTickets = [...evt.tickets];
        if (currentTickets.length === newCount) return evt;

        let updatedTickets: Ticket[] = [];
        if (newCount > currentTickets.length) {
          updatedTickets = [...currentTickets];
          const template = currentTickets[currentTickets.length - 1] || currentTickets[0];
          for (let i = currentTickets.length; i < newCount; i++) {
            updatedTickets.push({
              ...template,
              id: `tkt-${evt.id}-${i + 1}-${Date.now()}`,
              qrData: `QTR-${evt.id.toUpperCase()}-${i + 1}-${Date.now().toString().slice(-4)}`,
            });
          }
        } else {
          updatedTickets = currentTickets.slice(0, newCount);
        }
        return {
          ...evt,
          tickets: updatedTickets,
        };
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const handleUpdateTitular = (ticketId: string, newName: string) => {
    handleUpdateTicket(ticketId, { titularName: newName });
  };

  const handleUpdateHomeTitle = (newTitle: string) => {
    setHomeHeaderTitle(newTitle);
    try {
      localStorage.setItem('quentro_home_title', newTitle);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProceedToTransfer = (chosenIds: string[]) => {
    setSelectedTicketIds(chosenIds);
    setTransferReturnScreen('select_transfer');
    setActiveScreen('transfer_form');
  };

  const handleConfirmTransfer = (recipient: string, method: 'email' | 'quentroId') => {
    setEvents((prevEvents) => {
      const next = prevEvents.map((evt) => {
        if (evt.id !== selectedEventId) return evt;
        return {
          ...evt,
          tickets: evt.tickets.filter((tkt) => !selectedTicketIds.includes(tkt.id)),
        };
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
    setSelectedTicketIds([]);
    setActiveScreen('home');
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  };

  const isTransferScreen = activeScreen === 'transfer_form';

  return (
    <div
      className={`${
        isTransferScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen min-h-[100dvh]'
      } bg-[#121719] text-zinc-100 flex justify-center items-stretch selection:bg-[#00D2B4] selection:text-white font-sans antialiased w-full relative ${className}`}
      style={{
        zoom: appScale !== 100 ? `${appScale}%` : undefined,
      }}
    >
      {/* Viewport Shell - Exact iPhone Proportions & Quentro theme */}
      <div
        className={`w-full max-w-full sm:max-w-[430px] ${
          isTransferScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen min-h-[100dvh]'
        } bg-[#121719] relative flex flex-col overflow-x-clip mx-auto shadow-2xl`}
      >
        <AnimatePresence initial={false}>
          {activeScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.9 }}
              transition={{ duration: 0.12, ease: 'linear' }}
              className="w-full flex-1 flex flex-col bg-[#121719]"
            >
              <HomeScreen
                events={events}
                pastEvents={mockPastEvents}
                homeTitle={homeHeaderTitle}
                onUpdateHomeTitle={handleUpdateHomeTitle}
                onUpdateEvent={handleUpdateEvent}
                onUpdateTicketCount={handleUpdateTicketCount}
                onSelectEvent={handleSelectEvent}
                onOpenAccount={() => setActiveScreen('account')}
                onOpenNotifications={() => setShowNotificationsModal(true)}
                onOpenAddToHome={() => setShowAddToHomeModal(true)}
                onToggleScaleAdjuster={() => setShowScaleAdjuster((prev) => !prev)}
                onClose={onClose}
              />
            </motion.div>
          )}

          {activeScreen === 'ticket_detail' && selectedEvent && (
            <motion.div
              key="ticket_detail"
              initial={{ opacity: 0.9, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.9, x: -20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full flex-1 bg-[#121719]"
            >
              <TicketSlider
                event={selectedEvent}
                tickets={selectedEvent.tickets}
                initialIndex={ticketIndexToView}
                onBack={() => setActiveScreen('ingressos_list')}
                onOpenTransfer={() => {
                  const currentTkt =
                    selectedEvent.tickets[ticketIndexToView] || selectedEvent.tickets[0];
                  if (currentTkt) setSelectedTicketIds([currentTkt.id]);
                  setTransferReturnScreen('select_transfer');
                  setActiveScreen('select_transfer');
                }}
                onOpenList={() => setActiveScreen('ingressos_list')}
                onUpdateTitular={handleUpdateTitular}
                onUpdateTicket={handleUpdateTicket}
                onUpdateEvent={handleUpdateEvent}
                onOpenInfo={() => setShowInfoModal(true)}
              />
            </motion.div>
          )}

          {activeScreen === 'select_transfer' && selectedEvent && (
            <motion.div
              key="select_transfer"
              initial={{ opacity: 0.9, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.9, x: -20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full flex-1 bg-[#121719]"
            >
              <SelectTicketsScreen
                event={selectedEvent}
                tickets={selectedEvent.tickets}
                onBack={() => setActiveScreen('ticket_detail')}
                onProceedToTransfer={handleProceedToTransfer}
                onUpdateEvent={handleUpdateEvent}
                onUpdateTicket={handleUpdateTicket}
              />
            </motion.div>
          )}

          {activeScreen === 'transfer_form' && (
            <motion.div
              key="transfer_form"
              initial={{ opacity: 0.9, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.9, x: -20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full flex-1 flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#121719]"
            >
              <TransferTicketScreen
                selectedTicketCount={selectedTicketIds.length}
                userProfile={userProfile}
                onBack={() => setActiveScreen(transferReturnScreen)}
                onConfirmTransfer={handleConfirmTransfer}
              />
            </motion.div>
          )}

          {activeScreen === 'ingressos_list' && selectedEvent && (
            <motion.div
              key="ingressos_list"
              initial={{ opacity: 0.9, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.9, x: -20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full flex-1 bg-[#121719]"
            >
              <IngressosListScreen
                event={selectedEvent}
                tickets={selectedEvent.tickets}
                onBack={() => setActiveScreen('home')}
                onSelectTicket={(idx) => {
                  setTicketIndexToView(idx);
                  setActiveScreen('ticket_detail');
                }}
                onUpdateEvent={handleUpdateEvent}
                onUpdateTicket={handleUpdateTicket}
              />
            </motion.div>
          )}

          {activeScreen === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0.9, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.9, y: 15 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full flex-1 bg-[#121719]"
            >
              <AccountScreen
                userProfile={userProfile}
                onBack={() => setActiveScreen('home')}
                onUpdateProfile={handleUpdateProfile}
                onOpenHelp={() => setShowHelpModal(true)}
                appScale={appScale}
                onChangeAppScale={setAppScale}
                onOpenAddToHome={() => setShowAddToHomeModal(true)}
                showScaleAdjuster={showScaleAdjuster}
                onToggleScaleAdjuster={() => setShowScaleAdjuster((prev) => !prev)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals & Discrete Overlays */}
        {showInfoModal && selectedEvent && (
          <InfoModal event={selectedEvent} onClose={() => setShowInfoModal(false)} />
        )}
        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
        {showNotificationsModal && (
          <NotificationsModal onClose={() => setShowNotificationsModal(false)} />
        )}
        <AddToHomeScreenModal
          isOpen={showAddToHomeModal}
          onClose={() => setShowAddToHomeModal(false)}
        />
        {showScaleAdjuster && (
          <DiscreteScaleAdjuster
            scale={appScale}
            onChangeScale={setAppScale}
            onClose={() => setShowScaleAdjuster(false)}
          />
        )}
      </div>
    </div>
  );
}

export default QuentroV2Screen;
