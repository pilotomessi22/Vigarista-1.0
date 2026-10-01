import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileMenu } from './components/MobileMenu';
import { HeroCarousel } from './components/HeroCarousel';
import { SearchBar } from './components/SearchBar';
import { EventCard } from './components/EventCard';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { OrderDetailsView } from './components/OrderDetailsView';
import { QuentroEmailView } from './components/QuentroEmailView';
import { QuentroTicketModal } from './components/QuentroTicketModal';
import { BuyTicketModal } from './components/BuyTicketModal';
import { SafariBottomBar } from './components/SafariBottomBar';
import { SafariStartPage } from './components/SafariStartPage';
import { PageLoadingScreen } from './components/PageLoadingScreen';
import { ChefeLeadershipHome } from './components/ChefeLeadershipHome';
import { ModoLojaView } from './components/ModoLojaView';
import { CheckoutLojaView } from './components/CheckoutLojaView';
import { SalesLandingView } from './components/Teste1GosthLandingView';
import { RioHomeView } from './components/RioHomeView';
import QuentroV2Screen from './quentrov2/QuentroV2Screen';
import {
  BANNER_SLIDES,
  EXPERIENCIAS_EVENTS,
  ESPORTES_EVENTS,
  CASAS_VENUES,
  INITIAL_ORDER,
  INITIAL_ORDER_1,
  INITIAL_ORDER_2,
  INITIAL_ORDER_3,
  INITIAL_ORDER_4,
} from './data/mockData';
import { ActiveView, BannerSlide, EventItem, OrderItem } from './types';
import { ChevronRight, Sparkles } from 'lucide-react';
import { isSecurityUnlocked, getAuthenticatedUser, clearSecurityUnlockCooldown } from './utils/security';
import { checkAndInvalidateAllSessions, getActiveClientSession } from './utils/licenseManager';
import { initCommercialSecurityShield } from './utils/securityShield';
import { initAntiTamperProtection } from './utils/antiTamper';
import { initRealtimeCloudSync } from './utils/firebaseSync';
import { SiteAnalysisModal } from './components/SiteAnalysisModal';

export default function App() {
  // Initialize Real-time Cloud Synchronization (Firebase Firestore)
  useEffect(() => {
    initRealtimeCloudSync();
  }, []);

  // Activate Commercial Anti-Tamper & Anti-Invasion Shields (Anti-Inspect, Anti-F12, Anti-Source, Server Token Guard)
  useEffect(() => {
    const cleanup = initCommercialSecurityShield();
    initAntiTamperProtection();
    return cleanup;
  }, []);

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash.toLowerCase();

      // Check if accessing standalone sales landing page directly via link (#vendas, ?vendas=1, ?site=vendas)
      if (
        hash.includes('vendas') ||
        search.includes('vendas') ||
        search.includes('site=vendas')
      ) {
        return 'vendas';
      }

      // Check if accessing checkout / loja directly
      if (
        hash.includes('comprar') ||
        hash.includes('loja') ||
        hash.includes('checkout') ||
        search.includes('loja') ||
        search.includes('checkout')
      ) {
        return 'checkout-loja';
      }

      // Check if shared direct link for client receipt
      const isSharedDirectLink = search.includes('order=') || search.includes('d=');
      if (isSharedDirectLink) {
        return 'order-details';
      }

      // Check if accessing safari camouflage directly
      if (hash.includes('safari')) {
        return 'safari-home';
      }
    }
    // Main landing view: Vigarista Poster Home Page
    return 'home';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isExitingLoading, setIsExitingLoading] = useState(false);
  const [loadingTargetView, setLoadingTargetView] = useState<ActiveView | null>(null);

  // Real-time timestamp watchdog: continuously validates localStorage timestamps and forces lock state upon expiration
  useEffect(() => {
    const verifySessionTimestamp = () => {
      const search = window.location.search;
      const isSharedDirectLink = search.includes('order=') || search.includes('d=');
      if (isSharedDirectLink) return;

      // Invalidate expired sessions automatically from localStorage
      const sessionStatus = checkAndInvalidateAllSessions();

      // If in an authenticated view but session has expired or is invalid, force return to lock screen
      if (
        activeView !== 'home' &&
        activeView !== 'safari-home' &&
        activeView !== 'checkout-loja' &&
        activeView !== 'vendas' &&
        !sessionStatus.hasValidAccess
      ) {
        console.warn('🔒 [SEGURANÇA] Sessão expirada ou não autorizada. Bloqueando acesso imediatamente.');
        setActiveView('safari-home');
        window.history.replaceState(null, '', '#safari');
        try {
          localStorage.removeItem('tm_last_active_view');
        } catch {}
      }
    };

    // Run verification immediately
    verifySessionTimestamp();

    // Periodic heartbeat check every 1 second
    const intervalId = setInterval(verifySessionTimestamp, 1000);

    // Sync across cross-tab storage modifications, focus, visibility changes, and security events
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'tm_security_unlocked_until' || e.key === 'tm_active_client_session' || e.key === null) {
        verifySessionTimestamp();
      }
    };

    const handleSecurityLocked = () => {
      verifySessionTimestamp();
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('visibilitychange', verifySessionTimestamp);
    window.addEventListener('focus', verifySessionTimestamp);
    window.addEventListener('tm:security_locked', handleSecurityLocked);
    window.addEventListener('tm:client_session_cleared', handleSecurityLocked);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('visibilitychange', verifySessionTimestamp);
      window.removeEventListener('focus', verifySessionTimestamp);
      window.removeEventListener('tm:security_locked', handleSecurityLocked);
      window.removeEventListener('tm:client_session_cleared', handleSecurityLocked);
    };
  }, [activeView]);

  // Track previous view for smooth return from Quentro v2
  const [previousView, setPreviousView] = useState<ActiveView>('home');

  // Natural and smooth page transition handler with authentic cooldown
  const navigateToView = (nextView: ActiveView, options?: { immediate?: boolean }) => {
    if (nextView === activeView) return;

    if (nextView === 'quentrov2' && activeView !== 'quentrov2') {
      setPreviousView(activeView);
    }

    if (options?.immediate || nextView === 'home' || nextView === 'safari-home') {
      setActiveView(nextView);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    // Trigger authentic cooldown loading transition
    setLoadingTargetView(nextView);
    setIsPageLoading(true);
    setIsExitingLoading(false);

    // Snappy cooldown duration (smooth iOS standard)
    const cooldownDuration = nextView === 'order-details' ? 180 : 150;

    setTimeout(() => {
      setActiveView(nextView);
      window.scrollTo({ top: 0, behavior: 'auto' });
      setIsExitingLoading(true);

      setTimeout(() => {
        setIsPageLoading(false);
        setIsExitingLoading(false);
        setLoadingTargetView(null);
      }, 100);
    }, cooldownDuration);
  };

  // Sync state with URL hash
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search;
      const hasValidAccess = isSecurityUnlocked() || !!getActiveClientSession();

      let target: ActiveView = activeView;
      if (
        hash.includes('vendas') ||
        search.includes('vendas') ||
        search.includes('site=vendas')
      ) {
        target = 'vendas';
      } else if (
        hash.includes('comprar') ||
        hash.includes('loja') ||
        hash.includes('checkout') ||
        search.includes('loja') ||
        search.includes('checkout')
      ) {
        target = 'checkout-loja';
      } else if (
        hash.includes('quentrov2') ||
        hash.includes('quentro-v2') ||
        hash.includes('qv2') ||
        search.includes('quentrov2')
      ) {
        target = hasValidAccess ? 'quentrov2' : 'safari-home';
      } else if (hash.includes('quentro-ticket') || hash.includes('ingresso')) {
        target = hasValidAccess ? 'quentro-ticket' : 'safari-home';
      } else if (hash.includes('comprovante') || hash.includes('pedido') || hash.includes('detalhes')) {
        target = hasValidAccess ? 'order-details' : 'safari-home';
      } else if (hash.includes('quentro') || hash.includes('email')) {
        target = hasValidAccess ? 'quentro-email' : 'safari-home';
      } else if (hash.includes('home') || hash.includes('inicio') || hash === '' || hash === '#') {
        target = 'home';
      } else if (hash.includes('safari')) {
        target = 'safari-home';
      } else if (!hasValidAccess && activeView !== 'home' && activeView !== 'checkout-loja' && activeView !== 'vendas') {
        target = 'safari-home';
      }

      if (target !== activeView) {
        navigateToView(target);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);


  // Update hash and dynamic iOS status bar theme-color when activeView changes
  React.useEffect(() => {
    const targetHash =
      activeView === 'vendas'
        ? '#vendas'
        : activeView === 'checkout-loja'
        ? '#comprar'
        : activeView === 'quentrov2'
        ? '#quentrov2'
        : activeView === 'safari-home'
        ? '#safari'
        : activeView === 'order-details'
        ? '#comprovante'
        : activeView === 'quentro-email'
        ? '#quentro'
        : activeView === 'quentro-ticket'
        ? '#ingresso'
        : '#home';
    if (!window.location.hash.startsWith(targetHash)) {
      window.history.replaceState(null, '', targetHash);
    }

    // Dynamic iOS / Safari theme color & root overscroll background
    const themeColor =
      activeView === 'home'
        ? '#000000'
        : activeView === 'safari-home'
        ? '#1c1c1e'
        : activeView === 'quentro-ticket'
        ? '#edf0f5'
        : activeView === 'quentrov2'
        ? '#121719'
        : activeView === 'order-details' || activeView === 'quentro-email'
        ? '#ffffff'
        : '#000000';

    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    metaTags.forEach((tag) => tag.setAttribute('content', themeColor));

    // Keep html/body background perfectly synced to eliminate white overscroll borders on iOS
    try {
      document.documentElement.style.backgroundColor = themeColor;
      document.body.style.backgroundColor = themeColor;
    } catch {}
  }, [activeView]);

  // Helper to parse order from URL parameter if shared via permanent link
  const getOrderInfoFromUrl = (): { order: OrderItem; slot: '1' | '2' | '3' | '4' } | null => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let data = searchParams.get('order') || searchParams.get('d');
      let slotParam = searchParams.get('slot') || searchParams.get('orderId');

      if (!data && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        data = hashParams.get('order') || hashParams.get('d');
        if (!slotParam) {
          slotParam = hashParams.get('slot') || hashParams.get('orderId');
        }
      }
      if (data) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(data))));
        let slot: '1' | '2' | '3' | '4' = '1';
        if (slotParam === '2') slot = '2';
        else if (slotParam === '3') slot = '3';
        else if (slotParam === '4') slot = '4';

        let base = INITIAL_ORDER_1;
        if (slot === '2') base = INITIAL_ORDER_2;
        else if (slot === '3') base = INITIAL_ORDER_3;
        else if (slot === '4') base = INITIAL_ORDER_4;

        return { order: { ...base, ...decoded }, slot };
      }
    } catch (e) {
      console.warn('Could not parse order from URL', e);
    }
    return null;
  };

  const urlOrderInfo = useMemo(() => getOrderInfoFromUrl(), []);

  // Active Order Slot: '1' | '2' | '3' | '4'
  const [activeOrderSlot, setActiveOrderSlot] = useState<'1' | '2' | '3' | '4'>(() => {
    if (urlOrderInfo?.slot) return urlOrderInfo.slot;
    try {
      const savedSlot = localStorage.getItem('tm_active_order_slot');
      if (savedSlot === '1' || savedSlot === '2' || savedSlot === '3' || savedSlot === '4') return savedSlot;
    } catch {}
    return '1';
  });

  // Independent Order #1 (BTS Pista Meia - 31/10)
  const [order1, setOrder1] = useState<OrderItem>(() => {
    if (urlOrderInfo && urlOrderInfo.slot === '1') {
      try {
        localStorage.setItem('tm_saved_order_details_1', JSON.stringify(urlOrderInfo.order));
        localStorage.setItem('tm_saved_order_details', JSON.stringify(urlOrderInfo.order));
      } catch {}
      return urlOrderInfo.order;
    }
    try {
      const saved = localStorage.getItem('tm_saved_order_details_1') || localStorage.getItem('tm_saved_order_details');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.orderNumber) {
          return { ...INITIAL_ORDER_1, ...parsed };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDER_1;
  });

  // Independent Order #2 (BTS Arquibancada Meia - 01/11)
  const [order2, setOrder2] = useState<OrderItem>(() => {
    if (urlOrderInfo && urlOrderInfo.slot === '2') {
      try {
        localStorage.setItem('tm_saved_order_details_2', JSON.stringify(urlOrderInfo.order));
      } catch {}
      return urlOrderInfo.order;
    }
    try {
      const saved = localStorage.getItem('tm_saved_order_details_2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.orderNumber) {
          return { ...INITIAL_ORDER_2, ...parsed };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDER_2;
  });

  // Independent Order #3 (BTS Pista Inteira - 31/10)
  const [order3, setOrder3] = useState<OrderItem>(() => {
    if (urlOrderInfo && urlOrderInfo.slot === '3') {
      try {
        localStorage.setItem('tm_saved_order_details_3', JSON.stringify(urlOrderInfo.order));
      } catch {}
      return urlOrderInfo.order;
    }
    try {
      const saved = localStorage.getItem('tm_saved_order_details_3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.orderNumber) {
          return { ...INITIAL_ORDER_3, ...parsed };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDER_3;
  });

  // Independent Order #4 (BTS Arquibancada Inteira - 01/11)
  const [order4, setOrder4] = useState<OrderItem>(() => {
    if (urlOrderInfo && urlOrderInfo.slot === '4') {
      try {
        localStorage.setItem('tm_saved_order_details_4', JSON.stringify(urlOrderInfo.order));
      } catch {}
      return urlOrderInfo.order;
    }
    try {
      const saved = localStorage.getItem('tm_saved_order_details_4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.orderNumber) {
          return { ...INITIAL_ORDER_4, ...parsed };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDER_4;
  });

  const currentOrder = useMemo(() => {
    if (activeOrderSlot === '2') return order2;
    if (activeOrderSlot === '3') return order3;
    if (activeOrderSlot === '4') return order4;
    return order1;
  }, [activeOrderSlot, order1, order2, order3, order4]);

  const quentroEmail = currentOrder.quentroEmail || '';

  const [orders, setOrders] = useState<OrderItem[]>([order1, order2, order3, order4]);

  const handleSwitchOrderSlot = (slot: '1' | '2' | '3' | '4' | string) => {
    let normalized: '1' | '2' | '3' | '4' = '1';
    const s = String(slot).toLowerCase().trim();
    if (s.includes('2')) normalized = '2';
    else if (s.includes('3')) normalized = '3';
    else if (s.includes('4')) normalized = '4';
    else normalized = '1';

    setActiveOrderSlot(normalized);
    try {
      localStorage.setItem('tm_active_order_slot', normalized);
    } catch {}
  };

  const handleUpdateOrder = (updatedOrder: OrderItem) => {
    if (activeOrderSlot === '1') {
      setOrder1(updatedOrder);
      try {
        localStorage.setItem('tm_saved_order_details_1', JSON.stringify(updatedOrder));
        localStorage.setItem('tm_saved_order_details', JSON.stringify(updatedOrder));
      } catch (e) {
        console.error(e);
      }
    } else if (activeOrderSlot === '2') {
      setOrder2(updatedOrder);
      try {
        localStorage.setItem('tm_saved_order_details_2', JSON.stringify(updatedOrder));
      } catch (e) {
        console.error(e);
      }
    } else if (activeOrderSlot === '3') {
      setOrder3(updatedOrder);
      try {
        localStorage.setItem('tm_saved_order_details_3', JSON.stringify(updatedOrder));
      } catch (e) {
        console.error(e);
      }
    } else if (activeOrderSlot === '4') {
      setOrder4(updatedOrder);
      try {
        localStorage.setItem('tm_saved_order_details_4', JSON.stringify(updatedOrder));
      } catch (e) {
        console.error(e);
      }
    }

    setOrders([
      activeOrderSlot === '1' ? updatedOrder : order1,
      activeOrderSlot === '2' ? updatedOrder : order2,
      activeOrderSlot === '3' ? updatedOrder : order3,
      activeOrderSlot === '4' ? updatedOrder : order4,
    ]);
  };

  const handleResetOrder = () => {
    if (activeOrderSlot === '1') {
      setOrder1(INITIAL_ORDER_1);
      try {
        localStorage.removeItem('tm_saved_order_details_1');
        localStorage.removeItem('tm_saved_order_details');
      } catch {}
    } else if (activeOrderSlot === '2') {
      setOrder2(INITIAL_ORDER_2);
      try {
        localStorage.removeItem('tm_saved_order_details_2');
      } catch {}
    } else if (activeOrderSlot === '3') {
      setOrder3(INITIAL_ORDER_3);
      try {
        localStorage.removeItem('tm_saved_order_details_3');
      } catch {}
    } else if (activeOrderSlot === '4') {
      setOrder4(INITIAL_ORDER_4);
      try {
        localStorage.removeItem('tm_saved_order_details_4');
      } catch {}
    }
  };

  const handleReplicateOrder = (
    fieldsToCopy: {
      attendeeName?: string;
      attendeeCpf?: string;
      sector?: string;
      quentroEmail?: string;
      eventName?: string;
      location?: string;
      orderDate?: string;
      ticketPrice?: number;
      serviceFee?: number;
      totalPrice?: number;
      paymentMethod?: string;
      cloneAll?: OrderItem;
    },
    targetSlots: Array<'1' | '2' | '3' | '4'>
  ) => {
    const replicateToSlot = (
      slot: '1' | '2' | '3' | '4',
      currentOrderObj: OrderItem,
      setOrderFn: React.Dispatch<React.SetStateAction<OrderItem>>,
      storageKey: string
    ) => {
      let updated: OrderItem;
      if (fieldsToCopy.cloneAll) {
        updated = {
          ...fieldsToCopy.cloneAll,
          items: fieldsToCopy.cloneAll.items ? [...fieldsToCopy.cloneAll.items] : undefined,
        };
      } else {
        let updatedItems = currentOrderObj.items;
        if (updatedItems && updatedItems.length > 0) {
          updatedItems = updatedItems.map((it) => ({
            ...it,
            ...(fieldsToCopy.attendeeName !== undefined ? { attendeeName: fieldsToCopy.attendeeName } : {}),
            ...(fieldsToCopy.attendeeCpf !== undefined ? { attendeeCpf: fieldsToCopy.attendeeCpf } : {}),
            ...(fieldsToCopy.sector !== undefined ? { sector: fieldsToCopy.sector } : {}),
            ...(fieldsToCopy.ticketPrice !== undefined ? { ticketPrice: fieldsToCopy.ticketPrice } : {}),
          }));
        }

        updated = {
          ...currentOrderObj,
          ...(fieldsToCopy.attendeeName !== undefined ? { attendeeName: fieldsToCopy.attendeeName } : {}),
          ...(fieldsToCopy.attendeeCpf !== undefined ? { attendeeCpf: fieldsToCopy.attendeeCpf } : {}),
          ...(fieldsToCopy.sector !== undefined ? { sector: fieldsToCopy.sector } : {}),
          ...(fieldsToCopy.quentroEmail !== undefined ? { quentroEmail: fieldsToCopy.quentroEmail } : {}),
          ...(fieldsToCopy.eventName !== undefined ? { eventName: fieldsToCopy.eventName } : {}),
          ...(fieldsToCopy.location !== undefined ? { location: fieldsToCopy.location } : {}),
          ...(fieldsToCopy.orderDate !== undefined ? { orderDate: fieldsToCopy.orderDate } : {}),
          ...(fieldsToCopy.ticketPrice !== undefined ? { ticketPrice: fieldsToCopy.ticketPrice } : {}),
          ...(fieldsToCopy.serviceFee !== undefined ? { serviceFee: fieldsToCopy.serviceFee } : {}),
          ...(fieldsToCopy.totalPrice !== undefined ? { totalPrice: fieldsToCopy.totalPrice } : {}),
          ...(fieldsToCopy.paymentMethod !== undefined ? { paymentMethod: fieldsToCopy.paymentMethod } : {}),
          items: updatedItems,
        };
      }

      setOrderFn(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        if (slot === '1') {
          localStorage.setItem('tm_saved_order_details', JSON.stringify(updated));
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (targetSlots.includes('1')) replicateToSlot('1', order1, setOrder1, 'tm_saved_order_details_1');
    if (targetSlots.includes('2')) replicateToSlot('2', order2, setOrder2, 'tm_saved_order_details_2');
    if (targetSlots.includes('3')) replicateToSlot('3', order3, setOrder3, 'tm_saved_order_details_3');
    if (targetSlots.includes('4')) replicateToSlot('4', order4, setOrder4, 'tm_saved_order_details_4');
  };

  const [chefeViewMode, setChefeViewMode] = useState<'leadership' | 'ticketmaster'>('leadership');
  const authenticatedUser = getAuthenticatedUser();
  const isUserChefe = authenticatedUser === 'Chefe';
  const isUserCaos =
    authenticatedUser.toLowerCase().includes('caos') ||
    authenticatedUser.toLowerCase().includes('bebel');
  const isLeadershipOrCaosUser = isUserChefe || isUserCaos;

  useEffect(() => {
    let themeColor = '#1E4CD6';
    if (activeView === 'safari-home') {
      themeColor = '#1c1c1e';
    } else if (activeView === 'quentrov2' || activeView === 'quentro-ticket') {
      themeColor = '#121719';
    } else if (activeView === 'vendas') {
      themeColor = '#060709';
    } else if (activeView === 'checkout-loja') {
      themeColor = '#080b11';
    } else if (activeView === 'home' && isLeadershipOrCaosUser && chefeViewMode === 'leadership') {
      themeColor = isUserCaos ? '#04091c' : '#0d0e11';
    } else if (activeView === 'order-details' || activeView === 'quentro-email') {
      themeColor = '#ffffff';
    } else {
      // Home default Ticketmaster Blue #1E4CD6
      themeColor = '#1E4CD6';
    }

    try {
      const metas = document.querySelectorAll('meta[name="theme-color"]');
      metas.forEach((meta) => meta.setAttribute('content', themeColor));
      const metaTheme = document.getElementById('theme-color-meta');
      if (metaTheme) {
        metaTheme.setAttribute('content', themeColor);
      }
      const msNav = document.querySelector('meta[name="msapplication-navbutton-color"]');
      if (msNav) {
        msNav.setAttribute('content', themeColor);
      }

      // iOS Apple status bar style meta
      const appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleStatusMeta) {
        appleStatusMeta.setAttribute(
          'content',
          activeView === 'quentrov2' || activeView === 'quentro-ticket' ? 'black-translucent' : 'default'
        );
      }

      document.documentElement.style.backgroundColor = themeColor;
      document.body.style.backgroundColor = themeColor;
    } catch {}
  }, [activeView, isLeadershipOrCaosUser, isUserCaos, chefeViewMode]);

  const [selectedEventForPurchase, setSelectedEventForPurchase] = useState<EventItem | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Site Analysis & Diagnostic Modal State (triggered when confirming search for "analise")
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Open Quentro v2 as soon as searchTerm matches "quentrov2"
  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (
      q === 'quentrov2' ||
      q === 'quentro v2' ||
      q === 'quentro-v2' ||
      q === 'quentro2'
    ) {
      setSearchTerm('');
      navigateToView('quentrov2');
    }
  }, [searchTerm]);

  // Clean up any legacy destruct keys from storage
  useEffect(() => {
    try {
      localStorage.removeItem('tm_destruct_active');
      localStorage.removeItem('tm_destruct_start_time');
    } catch {}
  }, []);

  // Combined events for global search
  const allEvents = useMemo(() => {
    return [...EXPERIENCIAS_EVENTS, ...ESPORTES_EVENTS, ...CASAS_VENUES];
  }, []);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((item) => {
      const matchesCategory =
        selectedCategory === 'todos' || item.category === selectedCategory;
      const matchesSearch =
        searchTerm.trim() === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.topBadge && item.topBadge.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allEvents, selectedCategory, searchTerm]);

  // Handle Event selection from Hero banner
  const handleBannerSelect = (slide: BannerSlide) => {
    if (
      slide.id.toLowerCase().includes('bts') ||
      slide.id.toLowerCase().includes('arirang') ||
      slide.title.toUpperCase().includes('BTS')
    ) {
      setActiveOrderSlot('1');
      try {
        localStorage.setItem('tm_active_order_slot', '1');
      } catch {}
      navigateToView('order-details');
      return;
    }

    // Check if matching event or create quick purchase item
    const matching = allEvents.find((e) => e.title.toLowerCase().includes(slide.title.toLowerCase().slice(0, 8)));
    if (matching) {
      setSelectedEventForPurchase(matching);
    } else {
      setSelectedEventForPurchase({
        id: slide.id,
        title: slide.title,
        category: 'shows',
        categoryLabel: 'Show',
        location: slide.subtitle || 'Allianz Parque',
        city: 'São Paulo e Rio de Janeiro',
        date: '2026',
        priceStart: 350.0,
        imageUrl: slide.imageUrl,
        topBadge: 'TURNÊ OFICIAL 2026',
        badge: 'Ticketmaster Brasil',
      });
    }
  };

  // Handle Event selection from Card or Grid (opens independent BTS order details)
  const handleSelectEvent = (event: EventItem) => {
    if (event.id === 'bts-world-tour-arirang-extra') {
      // Pôster 2: BTS Data Extra 01/11 (Pedido 2 - 100% Desvinculado)
      setActiveOrderSlot('2');
      try {
        localStorage.setItem('tm_active_order_slot', '2');
      } catch {}
      navigateToView('order-details');
      return;
    }

    const isBts =
      event.id === 'bts-world-tour-arirang' ||
      event.id.toLowerCase().includes('bts') ||
      event.id.toLowerCase().includes('arirang') ||
      event.title.toUpperCase().includes('BTS');

    if (isBts) {
      // Pôster 1: BTS 31/10 (Pedido 1 - 100% Desvinculado)
      setActiveOrderSlot('1');
      try {
        localStorage.setItem('tm_active_order_slot', '1');
      } catch {}
      navigateToView('order-details');
      return;
    }

    setSelectedEventForPurchase(event);
  };

  // Handle purchase completion
  const handleCompletePurchase = (newOrder: OrderItem) => {
    handleUpdateOrder(newOrder);
    setSelectedEventForPurchase(null);
    navigateToView('order-details');
  };

  const handleOpenQuentroTicket = (email: string) => {
    handleUpdateOrder({ ...currentOrder, quentroEmail: email });
    // Instant switch to Quentro without loading screen
    navigateToView('quentro-ticket');
  };

  // Scale state independent per page (home, order-details, quentro-email, quentro-ticket, safari-home, checkout-loja, vendas, quentrov2)
  const DEFAULT_PAGE_SCALES: Record<ActiveView, number> = {
    home: 1,
    'order-details': 1,
    'quentro-email': 1,
    'quentro-ticket': 1,
    'safari-home': 1,
    'checkout-loja': 1,
    vendas: 1,
    'quentrov2': 1,
  };

  const loadAllPageScales = (): Record<ActiveView, number> => {
    const scales: Record<ActiveView, number> = { ...DEFAULT_PAGE_SCALES };
    try {
      const saved = localStorage.getItem('tm_page_scales');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          (['home', 'order-details', 'quentro-email', 'quentro-ticket', 'safari-home', 'checkout-loja', 'vendas', 'quentrov2'] as ActiveView[]).forEach((key) => {
            if (typeof parsed[key] === 'number' && !isNaN(parsed[key]) && parsed[key] >= 0.5 && parsed[key] <= 2.0) {
              scales[key] = parsed[key];
            }
          });
        }
      }

      // Check specific individual keys as authoritative fallback
      (['home', 'order-details', 'quentro-email', 'quentro-ticket', 'safari-home'] as ActiveView[]).forEach((key) => {
        const single = localStorage.getItem(`tm_scale_${key}`);
        if (single) {
          const num = Number(single);
          if (!isNaN(num) && num >= 0.5 && num <= 2.0) {
            scales[key] = num;
          }
        }
      });
    } catch (e) {
      console.error('Error loading page scales:', e);
    }
    return scales;
  };

  const [pageScales, setPageScales] = useState<Record<ActiveView, number>>(() => loadAllPageScales());

  // Persistent Zoom Lock state (saved in localStorage until changed)
  const [isZoomLocked, setIsZoomLocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tm_is_zoom_locked');
      return saved === 'true';
    } catch {}
    return false;
  });

  const handleToggleZoomLock = () => {
    setIsZoomLocked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tm_is_zoom_locked', String(next));
      } catch (e) {
        console.error('Error saving zoom lock:', e);
      }
      return next;
    });
  };

  // Sync viewport meta tag to prevent accidental touch zooming when locked
  useEffect(() => {
    try {
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        if (isZoomLocked) {
          metaViewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          );
        } else {
          metaViewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=2.0, user-scalable=yes, viewport-fit=cover'
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [isZoomLocked]);

  // Keep siteScale strictly synced to current active page
  const siteScale = pageScales[activeView] ?? 1;
  const [scaleFeedback, setScaleFeedback] = useState<string | null>(null);

  const updateCurrentPageScale = (nextVal: number) => {
    const clamped = Math.min(2.0, Math.max(0.5, Math.round(nextVal * 100) / 100));
    setPageScales((prev) => {
      const next = { ...prev, [activeView]: clamped };
      try {
        localStorage.setItem('tm_page_scales', JSON.stringify(next));
        localStorage.setItem(`tm_scale_${activeView}`, String(clamped));
      } catch (e) {
        console.error('Error saving scale to localStorage:', e);
      }
      return next;
    });
  };

  const handleDecreaseScale = () => {
    const current = pageScales[activeView] ?? 1;
    const next = Math.max(0.5, Math.round((current - 0.1) * 100) / 100);
    updateCurrentPageScale(next);
    setScaleFeedback(`${Math.round(next * 100)}%`);
    setTimeout(() => setScaleFeedback(null), 1600);
  };

  const handleIncreaseScale = () => {
    const current = pageScales[activeView] ?? 1;
    const next = Math.min(2.0, Math.round((current + 0.1) * 100) / 100);
    updateCurrentPageScale(next);
    setScaleFeedback(`${Math.round(next * 100)}%`);
    setTimeout(() => setScaleFeedback(null), 1600);
  };

  const handleResetScale = () => {
    updateCurrentPageScale(1);
    setScaleFeedback('100%');
    setTimeout(() => setScaleFeedback(null), 1600);
  };

  const handleSafariSearch = (term: string) => {
    const query = term.toLowerCase().trim();
    if (
      query === 'checkout-loja' ||
      query === 'loja' ||
      query === 'comprar' ||
      query === 'pix' ||
      query === 'checkout'
    ) {
      navigateToView('checkout-loja');
    } else if (
      query === 'quentrov2' ||
      query === 'quentro v2' ||
      query === 'quentro-v2' ||
      query === 'quentro2' ||
      query.includes('quentrov2')
    ) {
      navigateToView('quentrov2');
    } else if (
      query === 'vigarista' ||
      query.includes('vigarista') ||
      query === 'painelv1' ||
      query.includes('painelv1')
    ) {
      setSearchTerm('BTS');
      navigateToView('home');
    } else if (query === 'analise' || query === 'análise') {
      setIsAnalysisModalOpen(true);
    }
  };

  // Standalone Quentro v2 App
  if (activeView === 'quentrov2') {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#121719] w-full flex justify-center relative select-none">
        {/* iOS top status bar safe area filler */}
        <div
          id="ios-status-bar-top-quentrov2"
          className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top,0px)] bg-[#121719] z-50 pointer-events-none"
        />
        {/* iOS bottom safe area filler */}
        <div
          id="ios-safe-area-bottom-quentrov2"
          className="fixed bottom-0 left-0 right-0 h-[env(safe-area-inset-bottom,0px)] bg-[#121719] z-50 pointer-events-none"
        />
        {isPageLoading && (
          <PageLoadingScreen targetView={loadingTargetView} isExiting={isExitingLoading} />
        )}
        <div
          className={`w-full min-h-screen min-h-[100dvh] flex flex-col relative transition-[opacity,filter] duration-200 ease-out bg-[#121719] ${
            isExitingLoading ? 'filter blur-[4px] opacity-85' : 'filter-none opacity-100'
          }`}
          style={{ zoom: siteScale }}
        >
          <QuentroV2Screen
            onClose={() => {
              const returnTarget = previousView && previousView !== 'quentrov2' ? previousView : 'home';
              navigateToView(returnTarget);
            }}
          />
        </div>
      </div>
    );
  }

  // Standalone Sales Landing Page (100% isolada e independente - acessada unicamente por link direto)
  if (activeView === 'vendas') {
    return (
      <div className="min-h-screen bg-[#060709] w-full relative">
        {isPageLoading && (
          <PageLoadingScreen targetView={loadingTargetView} isExiting={isExitingLoading} />
        )}
        <SalesLandingView isStandalone={true} />
      </div>
    );
  }

  // Checkout & Loja Automática Pix
  if (activeView === 'checkout-loja') {
    return (
      <div className="min-h-screen bg-[#080b11] w-full flex justify-center selection:bg-cyan-500/30 relative">
        {isPageLoading && (
          <PageLoadingScreen targetView={loadingTargetView} isExiting={isExitingLoading} />
        )}
        <CheckoutLojaView
          onReturnToApp={() => {
            window.location.hash = 'safari';
            navigateToView('safari-home');
          }}
          onOpenWithKey={(key) => {
            try {
              localStorage.setItem('tm_prefill_license_key', key);
            } catch {}
            window.location.hash = 'safari';
            navigateToView('safari-home');
          }}
        />
      </div>
    );
  }

  // Safari Start Page (Página Inicial / Nova Aba)
  if (activeView === 'safari-home') {
    return (
      <div className="min-h-screen bg-[#1c1c1e] w-full flex justify-center selection:bg-[#007aff]/30 relative">
        {/* Loading screen overlay during page transitions */}
        {isPageLoading && (
          <PageLoadingScreen targetView={loadingTargetView} isExiting={isExitingLoading} />
        )}
        <div
          className={`w-full min-h-screen flex flex-col bg-[#1c1c1e] text-white shadow-2xl relative transition-[opacity,filter] duration-200 ease-out ${
            isExitingLoading ? 'filter blur-[4px] opacity-85' : 'filter-none opacity-100'
          }`}
          style={{ zoom: siteScale }}
        >
          <SafariStartPage
            onSearch={handleSafariSearch}
            onOpenApp={() => navigateToView('home')}
            onOpenOrder={() => navigateToView('order-details')}
            onTriggerAnalysis={() => setIsAnalysisModalOpen(true)}
            onTriggerQuentroV2={() => navigateToView('quentrov2')}
          />
        </div>

        {/* Site Analysis & Optimization Diagnostic Modal */}
        <SiteAnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={() => setIsAnalysisModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex justify-center selection:bg-[#1E4CD6] selection:text-white relative ${
        activeView === 'safari-home'
          ? 'bg-[#1c1c1e]'
          : activeView === 'quentro-ticket'
          ? 'bg-[#edf0f5]'
          : activeView === 'quentrov2'
          ? 'bg-[#121719]'
          : activeView === 'home'
          ? 'bg-black'
          : activeView === 'order-details' || activeView === 'quentro-email'
          ? 'bg-white'
          : 'bg-black'
      }`}
    >
      {/* Top Mobile Status Bar Safe Area Backdrop */}
      <div
        id="ios-status-bar-top-filler"
        className={`fixed top-0 left-0 right-0 h-[env(safe-area-inset-top,0px)] z-50 pointer-events-none transition-colors duration-200 ${
          activeView === 'safari-home'
            ? 'bg-[#1c1c1e]'
            : activeView === 'quentro-ticket'
            ? 'bg-[#1E4CD6]'
            : activeView === 'quentrov2'
            ? 'bg-[#121719]'
            : activeView === 'home'
            ? 'bg-black'
            : activeView === 'order-details' || activeView === 'quentro-email'
            ? 'bg-[#1E4CD6]'
            : 'bg-[#1E4CD6]'
        }`}
      />

      {/* Loading screen overlay during page transitions */}
      {isPageLoading && (
        <PageLoadingScreen targetView={loadingTargetView} isExiting={isExitingLoading} />
      )}

      {/* Full Screen Viewport */}
      <div
        className={`w-full min-h-screen flex flex-col ${
          activeView === 'safari-home'
            ? 'bg-[#1c1c1e] text-white'
            : activeView === 'quentro-ticket'
            ? 'bg-[#edf0f5] text-black'
            : activeView === 'quentrov2'
            ? 'bg-[#121719] text-white'
            : activeView === 'home'
            ? 'bg-black text-white'
            : activeView === 'order-details' || activeView === 'quentro-email'
            ? 'bg-white text-[#1f262d]'
            : 'bg-black text-white'
        } shadow-2xl relative pb-0 transition-[opacity,filter] duration-200 ease-out ${
          isExitingLoading ? 'filter blur-[4px] opacity-85' : 'filter-none opacity-100'
        }`}
      >
        {/* Mobile Drawer Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          setActiveView={navigateToView}
        />

        {/* Scalable Site Container (adjusted via A- / A+) */}
        <div
          id="scalable-site-container"
          className="w-full flex-1 flex flex-col transition-all duration-150 origin-top"
          style={{
            zoom: siteScale,
          }}
        >
          {/* Main View Router */}
          <main
            className="flex-1 p-0 m-0"
          >
        {activeView === 'home' && (
          <RioHomeView
            userName={authenticatedUser}
            orders={{ order1, order2, order3, order4 }}
            activeOrderSlot={activeOrderSlot}
            onSelectSlot={(slot) => handleSwitchOrderSlot(slot)}
            onOpenOrder={(slot) => {
              handleSwitchOrderSlot(slot);
              navigateToView('order-details');
            }}
            onOpenQuentro={() => handleOpenQuentroTicket(currentOrder.quentroEmail || 'cliente@email.com')}
            onOpenQuentroV2={() => navigateToView('quentrov2')}
            onOpenSafari={() => navigateToView('safari-home')}
            onOpenAnalysis={() => setIsAnalysisModalOpen(true)}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
        )}

        {/* Order Details View */}
        {activeView === 'order-details' && (
          <OrderDetailsView
            order={currentOrder}
            activeOrderSlot={activeOrderSlot}
            onSwitchOrderSlot={handleSwitchOrderSlot}
            onBack={() => navigateToView('home')}
            onOpenQuentroTicket={handleOpenQuentroTicket}
            onOpenQuentroEmail={() => navigateToView('quentro-email')}
            onUpdateOrder={handleUpdateOrder}
            onResetOrder={handleResetOrder}
            onReplicateOrder={handleReplicateOrder}
          />
        )}

        {/* Quentro Email Input View ("aonde coloca o email" + Embedded Order Details) */}
        {activeView === 'quentro-email' && (
          <QuentroEmailView
            order={currentOrder}
            initialEmail={quentroEmail}
            onSubmitEmail={(email) => {
              handleUpdateOrder({ ...currentOrder, quentroEmail: email });
            }}
            onOpenTicket={() => navigateToView('quentro-ticket')}
            onBack={() => navigateToView('order-details')}
            onOpenMenu={() => setIsMobileMenuOpen(true)}
            onUpdateOrder={handleUpdateOrder}
            onResetOrder={handleResetOrder}
            onReplicateOrder={handleReplicateOrder}
            activeOrderSlot={activeOrderSlot}
            onSwitchOrderSlot={handleSwitchOrderSlot}
          />
        )}

        {/* Quentro Live Ticket View (Com QR code dinâmico antifraude) */}
        {activeView === 'quentro-ticket' && (
          <QuentroTicketModal
            order={currentOrder}
            email={quentroEmail}
            onBack={() => navigateToView('quentro-email')}
          />
        )}
      </main>

          {/* Footer (Only on specific views, not on clean poster home) */}
          {activeView === 'vendas' && (
            <Footer setActiveView={navigateToView} />
          )}
        </div>

        {/* Ticket Purchase Modal */}
        <BuyTicketModal
          event={selectedEventForPurchase}
          onClose={() => setSelectedEventForPurchase(null)}
          onCompletePurchase={handleCompletePurchase}
        />

        {/* Floating Accessibility Sizer (A- / A+) on right edge - Controls site scale */}
        {activeView !== 'home' && (
          <aside
            id="accessibility-font-widget"
            className="fixed right-0 sm:right-[max(0px,calc(50vw-207px))] top-[52%] -translate-y-1/2 z-40 flex flex-col items-center justify-center bg-[#444b54] text-white rounded-l-[8px] shadow-lg py-1 px-1.5 w-[38px] select-none pointer-events-auto"
          >
            {/* Subtle percentage badge tooltip when scale changes */}
            {scaleFeedback && (
              <button
                id="scale-feedback-toast"
                type="button"
                onClick={handleResetScale}
                title="Clique para redefinir para 100%"
                className="absolute right-[44px] top-1/2 -translate-y-1/2 bg-[#1f262d]/95 backdrop-blur-xs text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-xl border border-gray-600/80 whitespace-nowrap cursor-pointer hover:bg-black transition-all flex items-center gap-1 animate-in fade-in zoom-in-90"
              >
                <span>Escala: {scaleFeedback}</span>
                {siteScale !== 1 && (
                  <span className="text-[10px] text-gray-300 font-normal underline ml-0.5">Reset</span>
                )}
              </button>
            )}

          {/* Button A- (Diminuir escala do site) */}
          <button
            id="btn-accessibility-scale-decrease"
            type="button"
            onClick={handleDecreaseScale}
            disabled={siteScale <= 0.5}
            className="text-[13px] font-black py-1.5 hover:text-[#00e5bb] active:scale-85 disabled:opacity-40 transition-all cursor-pointer w-full text-center flex items-center justify-center"
            title="Diminuir escala do site (A-)"
            aria-label="Diminuir escala do site"
          >
            A-
          </button>

          {/* Horizontal separator */}
          <div className="w-4 h-[1px] bg-white/25 my-0.5" />

          {/* Button A+ (Aumentar escala do site até 200%) */}
          <button
            id="btn-accessibility-scale-increase"
            type="button"
            onClick={handleIncreaseScale}
            disabled={siteScale >= 2.0}
            className="text-[13px] font-black py-1.5 hover:text-[#00e5bb] active:scale-85 disabled:opacity-40 transition-all cursor-pointer w-full text-center flex items-center justify-center"
            title="Aumentar escala do site até 200% (A+)"
            aria-label="Aumentar escala do site até 200%"
          >
            A+
          </button>
        </aside>
      )}
      </div>

      {/* Navigation Bar: Fixed directly to the viewport at z-[90], immune to any container scrolling, zooming, or transforms */}
      <SafariBottomBar
        activeView={activeView}
        setActiveView={navigateToView}
        currentOrder={currentOrder}
        activeOrderSlot={activeOrderSlot}
        onSwitchOrderSlot={handleSwitchOrderSlot}
        siteScale={siteScale}
        onIncreaseScale={handleIncreaseScale}
        onDecreaseScale={handleDecreaseScale}
        onResetScale={handleResetScale}
        isZoomLocked={isZoomLocked}
        onToggleZoomLock={handleToggleZoomLock}
        onBack={() => {
          if (activeView === 'quentro-ticket') {
            navigateToView('quentro-email');
          } else if (activeView === 'quentro-email') {
            navigateToView('order-details');
          } else if (activeView === 'order-details') {
            navigateToView('home');
          } else {
            navigateToView('safari-home');
          }
        }}
        onTriggerAnalysis={() => setIsAnalysisModalOpen(true)}
      />

      {/* Site Analysis & Optimization Diagnostic Modal */}
      <SiteAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
      />
    </div>
  );
}
