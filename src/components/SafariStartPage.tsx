import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, X, User, ChevronLeft, Clock } from 'lucide-react';
import { SecurityGateModal } from './SecurityGateModal';
import { ClientAuthModal } from './ClientAuthModal';
import { MatrixTransitionOverlay } from './MatrixTransitionOverlay';
import { MasterAdminPanel } from './MasterAdminPanel';
import { MasterPasswordPromptModal } from './MasterPasswordPromptModal';
import { isSecurityUnlocked, getSecurityRemainingSeconds, clearSecurityUnlockCooldown } from '../utils/security';
import { clearActiveClientSession, getActiveClientSession } from '../utils/licenseManager';

interface SafariStartPageProps {
  onSearch: (term: string) => void;
  onOpenApp: () => void;
  onOpenOrder?: () => void;
  onTriggerAnalysis?: () => void;
  onTriggerQuentroV2?: () => void;
}

export const SafariStartPage: React.FC<SafariStartPageProps> = ({
  onSearch,
  onOpenApp,
  onOpenOrder,
  onTriggerAnalysis,
  onTriggerQuentroV2,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSecurityGate, setShowSecurityGate] = useState(false);
  const [showMatrixTransition, setShowMatrixTransition] = useState(false);
  const [showClientAuth, setShowClientAuth] = useState(false);
  const [showMasterPrompt, setShowMasterPrompt] = useState(false);
  const [showMasterPanel, setShowMasterPanel] = useState(false);
  const [isCooldownActive, setIsCooldownActive] = useState(() => isSecurityUnlocked());
  const [remainingSec, setRemainingSec] = useState(() => getSecurityRemainingSeconds());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Monitor the 5-minute security cooldown every second and across window/storage events
  useEffect(() => {
    const updateCooldown = () => {
      const active = isSecurityUnlocked();
      setIsCooldownActive(active);
      setRemainingSec(getSecurityRemainingSeconds());
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tm_security_unlocked_until' || e.key === null) {
        updateCooldown();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tm:security_unlocked', updateCooldown);
    window.addEventListener('tm:security_locked', updateCooldown);
    window.addEventListener('focus', updateCooldown);
    window.addEventListener('visibilitychange', updateCooldown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tm:security_unlocked', updateCooldown);
      window.removeEventListener('tm:security_locked', updateCooldown);
      window.removeEventListener('focus', updateCooldown);
      window.removeEventListener('visibilitychange', updateCooldown);
    };
  }, []);

  // Trigger search navigation: Keyword "painelv1" opens the app directly if cooldown is active, or prompts for password if locked
  const handleExecuteSearch = (termToSearch: string) => {
    const raw = (termToSearch || searchTerm).trim();
    if (!raw) return;

    const query = raw.toLowerCase();

    // Fast, ultra-optimized Safari loading bar
    setIsLoadingTransition(true);
    setLoadingProgress(35);

    const isOwnerPinTrigger =
      query === 'painelv1' ||
      query.includes('painelv1');
    const isVigaristaTrigger =
      query === 'vigarista' ||
      query.includes('vigarista') ||
      query === 'painel vigarista' ||
      query === 'cliente' ||
      query === 'login';
    const isMasterAdminTrigger =
      query === 'admin' ||
      query === 'painel admin' ||
      query === 'administrador' ||
      query === 'painelteste';

    const isAnalysisTrigger = query === 'analise' || query === 'análise';
    const isQuentroV2Trigger =
      query === 'quentrov2' ||
      query === 'quentro v2' ||
      query === 'quentro-v2' ||
      query === 'quentro2' ||
      query.includes('quentrov2');

    // 1. If access is ALREADY unlocked within the 5-minute cooldown, bypass any login screen!
    if (isSecurityUnlocked()) {
      if (isOwnerPinTrigger || isVigaristaTrigger) {
        setIsLoadingTransition(false);
        setLoadingProgress(0);
        onSearch('vigarista');
        return;
      }
    }

    if (isQuentroV2Trigger) {
      // If access is NOT unlocked with a valid key/session, prompt for client login first!
      if (!isSecurityUnlocked() && !getActiveClientSession()) {
        setTimeout(() => setLoadingProgress(90), 80);
        setTimeout(() => {
          setLoadingProgress(100);
          setTimeout(() => {
            setIsLoadingTransition(false);
            setLoadingProgress(0);
            setSearchTerm('');
            setShowMatrixTransition(true);
          }, 120);
        }, 180);
        return;
      }

      setTimeout(() => setLoadingProgress(90), 80);
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoadingTransition(false);
          setLoadingProgress(0);
          setSearchTerm('');
          if (onTriggerQuentroV2) {
            onTriggerQuentroV2();
          } else {
            onSearch('quentrov2');
          }
        }, 120);
      }, 180);
      return;
    }

    if (isAnalysisTrigger) {
      setTimeout(() => setLoadingProgress(90), 80);
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoadingTransition(false);
          setLoadingProgress(0);
          setSearchTerm('');
          if (onTriggerAnalysis) {
            onTriggerAnalysis();
          }
        }, 120);
      }, 180);
      return;
    }

    if (isMasterAdminTrigger) {
      setTimeout(() => setLoadingProgress(90), 80);
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoadingTransition(false);
          setLoadingProgress(0);
          setSearchTerm('');
          setShowMasterPrompt(true);
        }, 120);
      }, 180);
      return;
    }

    // "painelv1": The owner's fast practical iOS passcode PIN keypad
    if (isOwnerPinTrigger) {
      setTimeout(() => {
        setIsLoadingTransition(false);
        setLoadingProgress(0);
        setShowSecurityGate(true);
      }, 60);
      return;
    }

    // "vigarista" / "cliente" / "login": Original Vigarista Client Login with Matrix transition
    if (isVigaristaTrigger) {
      setTimeout(() => setLoadingProgress(90), 80);
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoadingTransition(false);
          setLoadingProgress(0);
          setSearchTerm('');
          setShowMatrixTransition(true);
        }, 120);
      }, 180);
      return;
    }

    // Discrete simulation: quickly resets if keyword is not recognized
    setTimeout(() => {
      setIsLoadingTransition(false);
      setLoadingProgress(0);
      setSearchTerm('');
    }, 120);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch(searchTerm);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white flex flex-col justify-between selection:bg-[#007aff]/30 select-none pb-28 font-sans">
      {/* 1. iOS Top Safari Loading Bar (when searching or navigating) */}
      {isLoadingTransition && (
        <div
          className="fixed top-0 left-0 h-[3px] bg-[#007aff] z-50 transition-all duration-150 ease-out shadow-[0_0_8px_#007aff]"
          style={{ width: `${loadingProgress}%` }}
        />
      )}

      {/* 2. Authentic iOS Safari Top Header: Clean title without artificial device mockup */}
      <div className="w-full max-w-[430px] mx-auto px-5 pt-8 pb-1 flex items-center justify-between">
        <h1 className="text-[32px] font-bold tracking-tight text-white leading-tight">
          Página de Início
        </h1>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/75 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[430px] w-full mx-auto px-4 pt-3 space-y-7">
        {/* Section: Preferidos (Favorites - 100% discrete) */}
        <section className="space-y-3 pb-6">
          {/* Header with User Icon */}
          <div className="flex items-center space-x-2 text-white px-1">
            <User className="w-4 h-4 fill-white" />
            <h3 className="text-[18px] font-bold tracking-tight">Preferidos</h3>
          </div>

          {/* 4-column Grid of Favorites */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-2.5">
            {/* 1. Apple */}
            <button
              type="button"
              onClick={() => handleExecuteSearch('Apple')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-[58px] h-[58px] rounded-2xl bg-[#ffffff] shadow-md flex items-center justify-center group-active:scale-90 transition-transform">
                <svg className="w-7 h-7 fill-[#1d1d1f]" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.71-14.25-5.91-9.28-10.43-19.8-13.56-31.57-3.13-11.77-4.7-23.01-4.7-33.72 0-14.54 3.73-26.68 11.19-36.43 7.46-9.75 16.89-14.77 28.3-15.06 4.97 0 10.43 1.25 16.39 3.75 5.96 2.5 9.8 3.75 11.53 3.75 1.52 0 5.48-1.25 11.88-3.75 6.4-2.5 11.96-3.64 16.68-3.41 12.3.62 22.09 5.38 29.37 14.27-10.74 6.53-15.99 15.65-15.75 27.36.24 9.17 3.86 16.84 10.86 23.01 7 6.17 15.07 9.53 24.22 10.08-1.89 6.06-4.34 12.01-7.36 17.84zM119.22 33.19c0-6.73 2.45-13.06 7.35-18 4.9-4.94 10.87-7.94 17.91-9 0 6.94-2.48 13.3-7.44 18.08-4.96 4.78-11.02 7.72-18.18 8.84.24-.96.36-1.78.36-2.46z" />
                </svg>
              </div>
              <span className="text-[11.5px] text-white mt-1.5 font-medium tracking-tight truncate max-w-[64px] text-center">
                Apple
              </span>
            </button>

            {/* 2. Bing */}
            <button
              type="button"
              onClick={() => handleExecuteSearch('Bing')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-[58px] h-[58px] rounded-2xl bg-[#ffffff] shadow-md flex items-center justify-center group-active:scale-90 transition-transform">
                <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M10 5L24 10V33L36 26L31 23L27 25.5V14.5L10 5Z"
                    fill="#0083eb"
                  />
                  <path
                    d="M24 33L10 25V38L24 44L38 36V20L24 33Z"
                    fill="#00bcf2"
                  />
                </svg>
              </div>
              <span className="text-[11.5px] text-white mt-1.5 font-medium tracking-tight truncate max-w-[64px] text-center">
                Bing
              </span>
            </button>

            {/* 3. Google */}
            <button
              type="button"
              onClick={() => handleExecuteSearch('Google')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-[58px] h-[58px] rounded-2xl bg-[#ffffff] shadow-md flex items-center justify-center group-active:scale-90 transition-transform">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <span className="text-[11.5px] text-white mt-1.5 font-medium tracking-tight truncate max-w-[64px] text-center">
                Google
              </span>
            </button>

            {/* 4. Yahoo */}
            <button
              type="button"
              onClick={() => handleExecuteSearch('Yahoo')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-[58px] h-[58px] rounded-2xl bg-[#6001d2] shadow-md flex items-center justify-center group-active:scale-90 transition-transform">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[10px] font-black text-white">!</span>
                  </div>
                  <span className="text-[8.5px] font-extrabold text-white tracking-tighter -mt-0.5">
                    yahoo!
                  </span>
                </div>
              </div>
              <span className="text-[11.5px] text-white mt-1.5 font-medium tracking-tight truncate max-w-[64px] text-center">
                Yahoo
              </span>
            </button>

            {/* 5. Todos os cheats de Re... */}
            <button
              type="button"
              onClick={() => handleExecuteSearch('cheats')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-[58px] h-[58px] rounded-2xl bg-[#2c2c2e] border border-white/10 shadow-md flex items-center justify-center group-active:scale-90 transition-transform">
                <span className="text-[20px] font-black tracking-tighter text-white font-mono">
                  LG
                </span>
              </div>
              <span className="text-[11px] text-white mt-1.5 font-normal tracking-tight truncate max-w-[68px] text-center">
                Todos os cheats de Re...
              </span>
            </button>

            {/* 6. Download Instagram Vi... */}
            <button
              type="button"
              onClick={() => handleExecuteSearch('instagram')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className="w-[58px] h-[58px] rounded-2xl shadow-md flex items-center justify-center group-active:scale-90 transition-transform"
                style={{
                  background:
                    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                }}
              >
                <div className="w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center relative">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-white" />
                  <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
              <span className="text-[11px] text-white mt-1.5 font-normal tracking-tight truncate max-w-[68px] text-center">
                Download Instagram Vi...
              </span>
            </button>

            {/* 7. Baixar Video TikTok sem... */}
            <button
              type="button"
              onClick={() => handleExecuteSearch('tiktok')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className="w-[58px] h-[58px] rounded-2xl shadow-md flex items-center justify-center group-active:scale-90 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #3a86ff 0%, #8338ec 100%)',
                }}
              >
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16" />
                </svg>
              </div>
              <span className="text-[11px] text-white mt-1.5 font-normal tracking-tight truncate max-w-[68px] text-center">
                Baixar Video TikTok sem...
              </span>
            </button>

            {/* 8. Wikipedia (Discrete standard favorite) */}
            <button
              type="button"
              onClick={() => handleExecuteSearch('wikipedia')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-[58px] h-[58px] rounded-2xl bg-[#ffffff] shadow-md flex items-center justify-center group-active:scale-90 transition-transform">
                <span className="text-[26px] font-black text-[#1d1d1f] font-serif">
                  W
                </span>
              </div>
              <span className="text-[11px] text-white mt-1.5 font-medium tracking-tight truncate max-w-[64px] text-center">
                Wikipédia
              </span>
            </button>
          </div>
        </section>
      </main>

      {/* 3. Floating Bottom Safari Search & Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
        <div
          className="w-full max-w-[430px] pointer-events-auto bg-[#1c1c1e]/95 backdrop-blur-2xl border-t border-white/10 pt-2 px-3 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
        >
          {/* Active 5-minute Cooldown Quick Return Pill */}
          {isCooldownActive && (
            <div className="w-full mb-2 flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => onSearch('vigarista')}
                className="flex-1 py-1.5 px-3 rounded-xl bg-[#007aff]/15 hover:bg-[#007aff]/25 border border-[#007aff]/35 flex items-center justify-between transition-all cursor-pointer active:scale-[0.98]"
                title="Acesso liberado: clique para retornar diretamente ao Vigarista"
              >
                <div className="flex items-center space-x-2 text-[12.5px] font-medium text-white truncate">
                  <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse shrink-0" />
                  <span className="font-semibold text-[#60a5fa]">VIGARISTA</span>
                  <span className="text-gray-300 text-xs hidden sm:inline">• Acesso liberado (5 min)</span>
                </div>
                <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-[#60a5fa] shrink-0 bg-black/40 px-2 py-0.5 rounded-md border border-[#007aff]/30">
                  <Clock className="w-3 h-3 text-[#30d158]" />
                  <span>
                    {Math.floor(remainingSec / 60)}:{(remainingSec % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSecurityUnlockCooldown();
                  clearActiveClientSession();
                  setIsCooldownActive(false);
                  setRemainingSec(0);
                }}
                className="py-1.5 px-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-[11px] font-semibold shrink-0 cursor-pointer active:scale-95 transition-all"
                title="Bloquear agora e voltar a exigir senha"
              >
                Bloquear
              </button>
            </div>
          )}

          <div className="flex items-center justify-between space-x-2 w-full">
            {/* Left: Back Button (<) */}
            <button
              type="button"
              onClick={() => {
                // Discrete default behavior
                handleExecuteSearch(searchTerm);
              }}
              className="w-11 h-11 rounded-full bg-[#2c2c2e]/90 border border-white/5 flex items-center justify-center text-white/40 active:text-white active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
              title="Voltar"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Center: Search Capsule Pill (Buscar ou digitar site) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteSearch(searchTerm);
              }}
              className="flex-1 flex items-center h-11 bg-[#2c2c2e] hover:bg-[#323236] focus-within:bg-[#3a3a3c] rounded-full px-3.5 border border-white/10 shadow-lg transition-colors cursor-text"
              onClick={() => searchInputRef.current?.focus()}
            >
              {/* Search Icon */}
              <Search className="w-[18px] h-[18px] text-[#8e8e93] shrink-0 mr-2" />

              {/* Actual Input */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar ou digitar site"
                className="flex-1 bg-transparent text-[15.5px] text-white placeholder-[#8e8e93] outline-none font-normal w-full"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />

              {/* Clear Button or Mic */}
              {searchTerm ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Mic className="w-[18px] h-[18px] text-[#8e8e93] shrink-0 ml-1" />
              )}
            </form>

            {/* Right: Three Dots Button (···) */}
            <button
              type="button"
              onClick={() => setShowMoreMenu(true)}
              className="w-11 h-11 rounded-full bg-[#2c2c2e]/90 border border-white/5 flex items-center justify-center text-white active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
              title="Mais opções"
            >
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </button>
          </div>

          {/* iPhone Home Indicator Gesture Bar: hidden on iOS and standalone */}
          <div className="simulated-home-indicator w-full pt-2.5 pb-0.5 flex justify-center items-center">
            <div className="w-[134px] h-[5px] bg-white/40 rounded-full" />
          </div>
        </div>
      </footer>

      {/* Discrete More Options Modal (Triggered by ···) */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#2c2c2e] rounded-t-3xl p-5 shadow-2xl space-y-3 border-t border-white/10 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-2" />

            <div className="bg-[#3a3a3c] rounded-2xl overflow-hidden divide-y divide-white/10 text-sm">
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  window.location.reload();
                }}
                className="w-full text-left px-4 py-3.5 text-white font-medium hover:bg-white/5 cursor-pointer flex items-center justify-between"
              >
                <span>Recarregar</span>
                <span className="text-xs text-gray-400">⌘R</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="w-full text-left px-4 py-3.5 text-white font-medium hover:bg-white/5 cursor-pointer flex items-center justify-between"
              >
                <span>Nova Aba Privada</span>
                <span className="text-xs text-gray-400">Safari</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="w-full text-left px-4 py-3.5 text-white font-medium hover:bg-white/5 cursor-pointer flex items-center justify-between"
              >
                <span>Adicionar aos Favoritos</span>
                <span className="text-xs text-[#007aff]">+</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowMatrixTransition(true);
                }}
                className="w-full text-left px-4 py-3.5 text-cyan-400 font-medium hover:bg-white/5 cursor-pointer flex items-center justify-between border-b border-white/10"
              >
                <span className="font-semibold">VIGARISTA (Entrar / Cadastrar)</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">vigarista</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  if (onTriggerAnalysis) onTriggerAnalysis();
                }}
                className="w-full text-left px-4 py-3.5 text-blue-400 font-medium hover:bg-white/5 cursor-pointer flex items-center justify-between"
              >
                <span>Análise do Site</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">analise</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMoreMenu(false)}
              className="w-full py-3 bg-[#3a3a3c] text-white font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Security Gate Modal (Passcode Verification / Permanent Lock) */}
      <SecurityGateModal
        isOpen={showSecurityGate}
        onSuccess={() => {
          setShowSecurityGate(false);
          onSearch('vigarista');
        }}
        onClose={() => {
          setShowSecurityGate(false);
          setSearchTerm('');
        }}
      />

      {/* Matrix Transition Cooldown Animation before opening Vigarista Login */}
      <MatrixTransitionOverlay
        isOpen={showMatrixTransition}
        onComplete={() => {
          setShowMatrixTransition(false);
          setShowClientAuth(true);
        }}
      />

      {/* Painel Vigarista: Hacker Anonymous Client Login / Account Creation Modal */}
      <ClientAuthModal
        isOpen={showClientAuth}
        onSuccess={() => {
          setShowClientAuth(false);
          onSearch('vigarista');
        }}
        onOpenMasterPanel={() => {
          setShowClientAuth(false);
          setShowMasterPrompt(true);
        }}
        onClose={() => {
          setShowClientAuth(false);
          setSearchTerm('');
        }}
      />

      {/* Master Password Prompt (triggered by search "painelteste") */}
      <MasterPasswordPromptModal
        isOpen={showMasterPrompt}
        onSuccess={() => {
          setShowMasterPrompt(false);
          setShowMasterPanel(true);
        }}
        onClose={() => {
          setShowMasterPrompt(false);
          setSearchTerm('');
        }}
      />

      {/* Master Admin Panel (Key Generator with Days Selector) */}
      <MasterAdminPanel
        isOpen={showMasterPanel}
        onClose={() => setShowMasterPanel(false)}
        onEnterAppAsMaster={() => {
          setShowMasterPanel(false);
          onSearch('painelv1');
        }}
      />
    </div>
  );
};

