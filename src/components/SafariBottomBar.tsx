import React, { useState, useEffect } from 'react';
import { ActiveView, OrderItem } from '../types';

interface SafariBottomBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onBack?: () => void;
  currentOrder?: OrderItem;
  activeOrderSlot?: '1' | '2' | '3' | '4';
  onSwitchOrderSlot?: (slot: '1' | '2' | '3' | '4') => void;
  siteScale?: number;
  onIncreaseScale?: () => void;
  onDecreaseScale?: () => void;
  onResetScale?: () => void;
  isZoomLocked?: boolean;
  onToggleZoomLock?: () => void;
  onTriggerAnalysis?: () => void;
}

export const SafariBottomBar: React.FC<SafariBottomBarProps> = ({
  activeView,
  setActiveView,
  onBack,
  currentOrder,
  activeOrderSlot = '1',
  onSwitchOrderSlot,
  siteScale = 1,
  onIncreaseScale,
  onDecreaseScale,
  onResetScale,
  isZoomLocked = false,
  onToggleZoomLock,
  onTriggerAnalysis,
}) => {
  const [isReloading, setIsReloading] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Standalone detection (Adicionado à Tela de Início / iOS Web Clip / PWA)
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      document.documentElement.classList.contains('is-standalone') ||
      Boolean((window.navigator as any)?.standalone) ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    );
  });

  const [isIosDevice, setIsIosDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      document.documentElement.classList.contains('is-ios') ||
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  });

  useEffect(() => {
    const updateEnvironment = () => {
      const standalone =
        document.documentElement.classList.contains('is-standalone') ||
        Boolean((window.navigator as any)?.standalone) ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      setIsStandalone(standalone);

      const ios =
        document.documentElement.classList.contains('is-ios') ||
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIosDevice(ios);
    };

    updateEnvironment();
    window.addEventListener('resize', updateEnvironment);
    return () => window.removeEventListener('resize', updateEnvironment);
  }, []);

  // Multi-layered virtual keyboard and text input focus detection
  useEffect(() => {
    // 1. Listen to global focusin and focusout
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target.isContentEditable) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        const tag = active?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !active?.isContentEditable) {
          setIsKeyboardOpen(false);
        }
      }, 100);
    };

    // 2. Custom hide/show events
    const handleHideNav = () => setIsKeyboardOpen(true);
    const handleShowNav = () => setIsKeyboardOpen(false);

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    window.addEventListener('hide-bottom-nav', handleHideNav);
    window.addEventListener('show-bottom-nav', handleShowNav);

    // 3. Visual Viewport API for mobile virtual keyboards
    const handleViewportResize = () => {
      if (!window.visualViewport) return;
      const heightDiff = window.innerHeight - window.visualViewport.height;
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea';

      if (heightDiff > 120 || (isInput && heightDiff > 60)) {
        setIsKeyboardOpen(true);
      } else if (!isInput) {
        setIsKeyboardOpen(false);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('hide-bottom-nav', handleHideNav);
      window.removeEventListener('show-bottom-nav', handleShowNav);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      }
    };
  }, []);

  // Handle Refresh Click
  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveView('safari-home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy permanent link with all order customizations encoded in URL
  const handleCopyPermanentLink = () => {
    try {
      const slot = activeOrderSlot || (localStorage.getItem('tm_active_order_slot') as '1' | '2' | '3' | '4') || '1';
      const storageKey = `tm_saved_order_details_${slot}`;
      let orderToEncode = currentOrder;
      if (!orderToEncode) {
        const saved = localStorage.getItem(storageKey) || localStorage.getItem('tm_saved_order_details');
        if (saved) {
          try {
            orderToEncode = JSON.parse(saved);
          } catch {}
        }
      }
      let permalink = window.location.href;
      if (orderToEncode) {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(orderToEncode))));
        const base = window.location.origin + window.location.pathname;
        const currentHash = window.location.hash.split('?')[0] || '#comprovante';
        permalink = `${base}${currentHash}?slot=${slot}&d=${encoded}`;
      }
      navigator.clipboard.writeText(permalink);
      setToastMessage(`Link do Pedido ${slot} copiado!`);
      setShowMenuModal(false);
      setTimeout(() => setToastMessage(null), 2500);
    } catch (e) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link copiado!');
      setShowMenuModal(false);
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-black/90 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap border border-white/10">
          {toastMessage}
        </div>
      )}

      {/* Options Menu Modal (Triggered by the 3 dots '···') */}
      {showMenuModal && (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowMenuModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#f2f2f7] rounded-t-3xl p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />

            {/* iOS Safari 'aA' Scale / Zoom Widget */}
            {onIncreaseScale && onDecreaseScale && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-200/80 px-4 py-3 text-sm flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <span className="text-[17px] font-bold text-gray-800 tracking-tighter">aA</span>
                  <span className="text-xs font-semibold text-gray-700">Tamanho da Página</span>
                </div>
                <div className="flex items-center gap-2 bg-[#f2f2f7] rounded-xl p-1 border border-gray-200/80">
                  <button
                    type="button"
                    onClick={onDecreaseScale}
                    disabled={siteScale <= 0.5}
                    className="px-2.5 py-1 text-xs font-bold text-gray-800 hover:bg-white rounded-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Diminuir zoom"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onResetScale) onResetScale();
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-[#1E4CD6] hover:bg-white rounded-lg active:scale-95 transition-all cursor-pointer"
                    title="Redefinir para 100%"
                  >
                    {Math.round(siteScale * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={onIncreaseScale}
                    disabled={siteScale >= 2.0}
                    className="px-2.5 py-1 text-xs font-bold text-gray-800 hover:bg-white rounded-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Aumentar zoom (até 200%)"
                  >
                    A+
                  </button>
                </div>
              </div>
            )}

            {/* Persistent Lock / Unlock Zoom Option */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-200/80 divide-y divide-gray-100 text-sm">
              <button
                type="button"
                onClick={() => {
                  if (onToggleZoomLock) {
                    onToggleZoomLock();
                    setToastMessage(!isZoomLocked ? '🔒 Zoom Travado e Salvo!' : '🔓 Zoom Destravado!');
                    setTimeout(() => setToastMessage(null), 2500);
                  }
                }}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-medium active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isZoomLocked ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#1E4CD6]'
                    }`}
                  >
                    {isZoomLocked ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="block text-[14px] font-semibold text-gray-900">
                      {isZoomLocked ? 'Destravar Zoom' : 'Travar Zoom da Tela'}
                    </span>
                    <span className="block text-[11px] text-gray-500 font-normal">
                      {isZoomLocked ? 'Salvo: Zoom fixado para não alterar' : 'Fixar tamanho atual salvo permanentemente'}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isZoomLocked
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isZoomLocked ? 'TRAVADO 🔒' : 'DESTRAVADO 🔓'}
                </div>
              </button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-200/80 divide-y divide-gray-100 text-sm">
              <button
                type="button"
                onClick={handleCopyPermanentLink}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-medium text-gray-900 active:bg-gray-50 cursor-pointer"
              >
                <div>
                  <span className="block text-[14px] font-semibold text-gray-900">Copiar link permanente</span>
                  <span className="block text-[11px] text-gray-500 font-normal">Todas as alterações salvas na URL</span>
                </div>
                <span className="text-gray-400 text-xs">ticketmaster.com.br</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleReload();
                  setShowMenuModal(false);
                }}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-medium text-gray-900 active:bg-gray-50 cursor-pointer"
              >
                <span>Recarregar página</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('safari-home');
                  setShowMenuModal(false);
                }}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-medium text-gray-900 active:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-[#1E4CD6]">🌐</span>
                  <span className="font-semibold text-gray-900">Página Inicial do Safari (Nova Aba)</span>
                </div>
                <span className="text-gray-400 text-xs">Nova Aba</span>
              </button>

              {onSwitchOrderSlot && (
                <div className="flex flex-col w-full px-4 py-3 bg-blue-50/70 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-[13px] font-bold text-[#1E4CD6]">Alternar Pôster BTS</span>
                    <span className="block text-[11px] text-gray-500">4 telas 100% independentes</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchOrderSlot('1');
                        setActiveView('order-details');
                        setShowMenuModal(false);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer text-center ${
                        activeOrderSlot === '1'
                          ? 'bg-[#1E4CD6] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Pôster 1
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchOrderSlot('2');
                        setActiveView('order-details');
                        setShowMenuModal(false);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer text-center ${
                        activeOrderSlot === '2'
                          ? 'bg-[#1E4CD6] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Pôster 2
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchOrderSlot('3');
                        setActiveView('order-details');
                        setShowMenuModal(false);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer text-center ${
                        activeOrderSlot === '3'
                          ? 'bg-[#1E4CD6] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Pôster 3
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchOrderSlot('4');
                        setActiveView('order-details');
                        setShowMenuModal(false);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer text-center ${
                        activeOrderSlot === '4'
                          ? 'bg-[#1E4CD6] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Pôster 4
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveView('order-details');
                  setShowMenuModal(false);
                }}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-medium text-gray-900 active:bg-gray-50 cursor-pointer"
              >
                <span>Meus Pedidos & Detalhes</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {`Pedido #${activeOrderSlot}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('home');
                  setShowMenuModal(false);
                }}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-medium text-gray-900 active:bg-gray-50 cursor-pointer"
              >
                <span>Página Inicial Ticketmaster</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenuModal(false);
                  if (onTriggerAnalysis) {
                    onTriggerAnalysis();
                  }
                }}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-semibold text-blue-600 active:bg-blue-50 cursor-pointer"
              >
                <span>Diagnóstico & Análise do Site</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  analise
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMenuModal(false)}
              className="w-full rounded-2xl bg-white py-3.5 text-center text-sm font-semibold text-[#007aff] active:bg-gray-50 shadow-xs border border-gray-200/80 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING WHITE IOS SAFARI NAVIGATION BAR - EXACT POSITIONING & ANIMATION  */}
      {/* Smoothly hides on virtual keyboard / email input focus                    */}
      {/* ========================================================================= */}
      <footer
        id="safari-bottom-navigation-bar"
        className="fixed bottom-0 inset-x-0 z-[90] flex flex-col items-center pointer-events-none select-none px-2.5 sm:px-4"
        style={{
          paddingBottom: isStandalone
            ? 'max(6px, calc(env(safe-area-inset-bottom, 24px) - 10px))'
            : 'max(4px, env(safe-area-inset-bottom, 4px))',
        }}
      >
        <div
          className={`w-full max-w-xl mx-auto flex flex-col items-center pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isKeyboardOpen
              ? 'translate-y-36 opacity-0 pointer-events-none scale-95'
              : 'translate-y-0 opacity-100 pointer-events-auto scale-100'
          }`}
        >
          {/* Main Floating Controls Row (Pure White, Solid, iOS Shadow) */}
          <div className="flex items-center gap-2 w-full">
            {/* 1. Left Circle Floating Button: Back (<) */}
            <button
              id="browser-nav-back-btn"
              type="button"
              onClick={handleBack}
              className="h-[44px] w-[44px] rounded-full bg-white border border-black/[0.09] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] shrink-0 active:scale-90 hover:scale-102 transition-all duration-150 cursor-pointer text-black"
              title="Voltar"
              aria-label="Voltar para a página anterior"
            >
              <svg
                width="10"
                height="18"
                viewBox="0 0 10 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.5 2L1.5 9L8.5 16"
                  stroke="#000000"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 2. Center Floating Capsule Pill: [Icon] ticketmaster.com.br [↻] */}
            <div
              id="browser-nav-address-pill"
              className="flex-1 h-[44px] rounded-full bg-white border border-black/[0.09] flex items-center justify-between px-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] select-none active:scale-[0.985] transition-all duration-150"
            >
              {/* Left Page/Screen Icon (exact icon from iOS Safari) */}
              <div className="flex items-center justify-center shrink-0 w-6 text-black">
                <svg
                  width="19"
                  height="18"
                  viewBox="0 0 22 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Top rounded screen/window */}
                  <rect
                    x="2.5"
                    y="2.5"
                    width="17"
                    height="10.5"
                    rx="2.5"
                    stroke="#000000"
                    strokeWidth="2.2"
                  />
                  {/* First line below */}
                  <line
                    x1="3"
                    y1="16"
                    x2="17"
                    y2="16"
                    stroke="#000000"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Second shorter line below */}
                  <line
                    x1="3"
                    y1="19.5"
                    x2="11"
                    y2="19.5"
                    stroke="#000000"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Center text: ticketmaster.com.br */}
              <span
                className="text-[15px] font-medium text-black tracking-tight select-none truncate px-1 text-center"
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                ticketmaster.com.br
              </span>

              {/* Right Reload circular arrow (↻) */}
              <button
                id="browser-nav-reload-btn"
                type="button"
                onClick={handleReload}
                className="flex items-center justify-center shrink-0 w-6 text-black active:scale-80 hover:opacity-80 transition-all duration-150 cursor-pointer"
                title="Recarregar página"
                aria-label="Recarregar página"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-500 ease-out ${isReloading ? 'rotate-360' : ''}`}
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
            </div>

            {/* 3. Right Circle Floating Button: Three Dots (···) */}
            <button
              id="browser-nav-more-btn"
              type="button"
              onClick={() => setShowMenuModal(true)}
              className="h-[44px] w-[44px] rounded-full bg-white border border-black/[0.09] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] shrink-0 active:scale-90 hover:scale-102 transition-all duration-150 cursor-pointer text-black"
              title="Mais opções"
              aria-label="Mais opções"
            >
              <svg
                width="18"
                height="6"
                viewBox="0 0 18 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="2.5" cy="3" r="1.8" fill="#000000" />
                <circle cx="9" cy="3" r="1.8" fill="#000000" />
                <circle cx="15.5" cy="3" r="1.8" fill="#000000" />
              </svg>
            </button>
          </div>

          {/* iPhone Home Indicator Gesture Bar: Only rendered on desktop/browser preview when NOT in standalone mode */}
          {!isStandalone && !isIosDevice && (
            <div className="simulated-home-indicator w-full pt-1.5 pb-0.5 flex justify-center items-center pointer-events-none">
              <div className="w-[134px] h-[4.5px] bg-black/75 rounded-full" />
            </div>
          )}
        </div>
      </footer>
    </>
  );
};
