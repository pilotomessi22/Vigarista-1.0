import React, { useState } from 'react';
import { Home, X, Save, RotateCcw, Edit3, Check, Sparkles, Settings } from 'lucide-react';
import { OrderItem } from '../types';
import { MoneyRainCanvas } from './MoneyRainCanvas';
import { GosthLogo } from './GosthLogo';

export interface HomeCustomConfig {
  teamName: string;
  slogan: string;
  centerSymbol: string;
  buttons: {
    slot1: { title: string; subtitle: string; tag: string };
    slot2: { title: string; subtitle: string; tag: string };
    slot3: { title: string; subtitle: string; tag: string };
    slot4: { title: string; subtitle: string; tag: string };
  };
}

export const getDefaultConfig = (isCaosMode: boolean): HomeCustomConfig => ({
  teamName: isCaosMode ? 'Equipe Caos' : 'Equipe Liderança',
  slogan: 'FIQUE RICO OU MORRA TENTANDO $',
  centerSymbol: '7',
  buttons: {
    slot1: { title: 'BTS', subtitle: 'PISTA', tag: 'Meia-Entrada • 31/10' },
    slot2: { title: 'BTS', subtitle: 'ARQUIBANCADA', tag: 'Meia-Entrada • 01/11' },
    slot3: { title: 'BTS', subtitle: 'PISTA (2 INGRESSOS)', tag: '2 Ingressos • 30/10' },
    slot4: { title: 'BTS', subtitle: 'ARQ INTEIRA', tag: 'Inteira • 01/11' },
  },
});

interface ChefeLeadershipHomeProps {
  onSelectPoster: (slot: '1' | '2' | '3' | '4') => void;
  onOpenMobileMenu: () => void;
  onGoToTicketmasterHome: () => void;
  orders: {
    order1: OrderItem;
    order2: OrderItem;
    order3: OrderItem;
    order4: OrderItem;
  };
  userName?: string;
  teamTitle?: string; // e.g. "Caos" or "Liderança"
}

export const ChefeLeadershipHome: React.FC<ChefeLeadershipHomeProps> = ({
  onSelectPoster,
  onOpenMobileMenu,
  onGoToTicketmasterHome,
  userName = 'Chefe',
  teamTitle,
}) => {
  const isCaos =
    teamTitle === 'Caos' ||
    userName.toLowerCase().includes('caos') ||
    userName.toLowerCase().includes('bebel');

  const storageKey = isCaos ? 'tm_home_custom_caos' : 'tm_home_custom_chefe';

  const [config, setConfig] = useState<HomeCustomConfig>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const defaults = getDefaultConfig(isCaos);
          return {
            ...defaults,
            ...parsed,
            buttons: {
              ...defaults.buttons,
              ...(parsed.buttons || {}),
            },
          };
        }
      }
    } catch (e) {
      console.error('Error loading custom home config:', e);
    }
    return getDefaultConfig(isCaos);
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formConfig, setFormConfig] = useState<HomeCustomConfig>(config);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenEditModal = () => {
    setFormConfig(config);
    setIsEditModalOpen(true);
  };

  const handleSaveConfig = () => {
    setConfig(formConfig);
    try {
      localStorage.setItem(storageKey, JSON.stringify(formConfig));
    } catch (e) {
      console.error('Error saving custom home config:', e);
    }
    setIsEditModalOpen(false);
    setToastMessage('✨ Informações salvas com sucesso!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleResetConfig = () => {
    const defaults = getDefaultConfig(isCaos);
    setFormConfig(defaults);
    setConfig(defaults);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Error resetting custom home config:', e);
    }
    setToastMessage('🔄 Configurações restauradas para o padrão!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const posterButtons = [
    {
      slot: '1' as const,
      labelTitle: config.buttons.slot1.title || 'BTS',
      labelSub: config.buttons.slot1.subtitle || 'PISTA',
      tag: config.buttons.slot1.tag || 'Meia-Entrada • 31/10',
    },
    {
      slot: '2' as const,
      labelTitle: config.buttons.slot2.title || 'BTS',
      labelSub: config.buttons.slot2.subtitle || 'ARQUIBANCADA',
      tag: config.buttons.slot2.tag || 'Meia-Entrada • 01/11',
    },
    {
      slot: '3' as const,
      labelTitle: config.buttons.slot3.title || 'BTS',
      labelSub: config.buttons.slot3.subtitle || 'PISTA INTEIRA',
      tag: config.buttons.slot3.tag || 'Inteira • 31/10',
    },
    {
      slot: '4' as const,
      labelTitle: config.buttons.slot4.title || 'BTS',
      labelSub: config.buttons.slot4.subtitle || 'ARQ INTEIRA',
      tag: config.buttons.slot4.tag || 'Inteira • 01/11',
    },
  ];

  return (
    <div
      className={`min-h-screen w-full text-white flex flex-col relative overflow-x-hidden select-none ${
        isCaos
          ? 'bg-[#04091c] selection:bg-[#00a2ff] selection:text-white'
          : 'bg-[#0d0e11] selection:bg-[#ff183c] selection:text-white'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER - EXACT MATCH TO REFERENCE IMAGE                              */}
      {/* Crown + "Equipe Caos" / "Equipe Liderança" + Home + 3 White Lines           */}
      {/* ========================================================================= */}
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-md px-4 pt-[max(12px,env(safe-area-inset-top,12px))] pb-3 flex items-center justify-between transition-colors ${
          isCaos
            ? 'bg-[#04091c]/90 border-b border-blue-900/40 shadow-[0_4px_20px_rgba(4,9,28,0.8)]'
            : 'bg-[#0d0e11]/90 border-b border-red-900/30'
        }`}
      >
        {/* Left: Crown Logo (Click on Crown Opens Secret Edit Menu) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleOpenEditModal}
            className={`${isCaos ? 'text-[#00a2ff]' : 'text-[#ff183c]'} active:scale-90 transition-transform cursor-pointer flex items-center justify-center p-1 rounded-lg focus:outline-none`}
            title="Ticketmaster"
            aria-label="Menu Principal"
          >
            <svg
              width="32"
              height="26"
              viewBox="0 0 36 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={isCaos ? 'drop-shadow-[0_0_8px_rgba(0,162,255,0.8)]' : 'drop-shadow-[0_0_8px_rgba(255,24,60,0.8)]'}
            >
              {/* Crown Base */}
              <path
                d="M3 24H33V26C33 26.5 32.5 27 32 27H4C3.5 27 3 26.5 3 26V24Z"
                fill={isCaos ? '#00a2ff' : '#ff183c'}
              />
              {/* Crown Body with 5 sharp points */}
              <path
                d="M4 22L2 6L10 14L18 2L26 14L34 6L32 22H4Z"
                stroke={isCaos ? '#00a2ff' : '#ff183c'}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              {/* Crown Jewels (circles on top points) */}
              <circle cx="2" cy="5" r="1.8" fill={isCaos ? '#00a2ff' : '#ff183c'} />
              <circle cx="18" cy="2" r="2.2" fill="#ffffff" />
              <circle cx="34" cy="5" r="1.8" fill={isCaos ? '#00a2ff' : '#ff183c'} />
            </svg>
          </button>
        </div>

        {/* Center: Full Header Title in Lemon Milk Typography */}
        <div className="flex items-center justify-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          <span
            className={`text-[19px] sm:text-[21px] font-black tracking-wider uppercase text-center ${
              isCaos
                ? 'text-[#00a2ff] drop-shadow-[0_0_12px_rgba(0,162,255,0.85)]'
                : 'text-[#ff183c] drop-shadow-[0_0_12px_rgba(255,24,60,0.85)]'
            }`}
            style={{
              fontFamily: "'LEMON MILK', 'Lemon Milk', 'Arial Black', sans-serif",
            }}
          >
            {config.teamName === 'Caos' || config.teamName === 'Liderança'
              ? `Equipe ${config.teamName}`
              : config.teamName || (isCaos ? 'Equipe Caos' : 'Equipe Liderança')}
          </span>
        </div>

        {/* Right: Home Icon */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoToTicketmasterHome}
            className={`p-1 ${
              isCaos
                ? 'text-[#00a2ff] drop-shadow-[0_0_8px_rgba(0,162,255,0.7)]'
                : 'text-[#ff183c] drop-shadow-[0_0_8px_rgba(255,24,60,0.7)]'
            } hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center justify-center`}
            title="Página Inicial Ticketmaster"
          >
            <Home className="h-[22px] w-[22px] stroke-[2.4]" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. ARTISTIC BACKGROUND WITH 60-120FPS MONEY RAIN (NO CHARACTERS ON CAOS)  */}
      {/* ========================================================================= */}
      <div className="relative flex-1 flex flex-col items-center justify-between px-4 py-4 min-h-[640px]">
        {/* Background Canvas Layer with Money Rain & Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* High-Performance 60 to 120 FPS Animated Falling Money Rain */}
          <MoneyRainCanvas density={isCaos ? 52 : 36} />

          {/* Deep Dark Blue or Dark Charcoal Radial Atmosphere Overlay */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity ${
              isCaos ? 'opacity-35' : 'opacity-20 mix-blend-overlay'
            }`}
            style={{
              backgroundImage: isCaos
                ? `radial-gradient(circle at 50% 25%, #1e3a8a 0%, transparent 65%), radial-gradient(circle at 50% 80%, #0f2356 0%, #030712 100%)`
                : `radial-gradient(circle at 50% 30%, #ff183c 0%, transparent 65%), radial-gradient(circle at 50% 80%, #1e1e24 0%, #0a0a0c 100%)`,
            }}
          />

          {/* Top Center Faint Crown Sketch (Only on Chefe default view) */}
          {!isCaos && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-25">
              <svg width="140" height="90" viewBox="0 0 140 90" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M10 80L25 25L55 55L70 15L85 55L115 25L130 80H10Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="25" cy="22" r="4" fill="#6b7280" />
                <circle cx="70" cy="12" r="5" fill="#6b7280" />
                <circle cx="115" cy="22" r="4" fill="#6b7280" />
              </svg>
            </div>
          )}

          {/* Cartoon Characters rendered ONLY when not in Caos mode */}
          {!isCaos && (
            <>
              {/* Character 1 (Top Left): Gumball Gangster with Hood */}
              <div className="absolute -top-3 -left-4 w-36 h-48 opacity-85 select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                <svg viewBox="0 0 120 140" className="w-full h-full">
                  <path d="M20 50 C10 80 15 130 60 135 C105 130 110 80 100 50 C95 20 25 20 20 50 Z" fill="#18181c" />
                  <ellipse cx="60" cy="72" rx="42" ry="36" fill="#38a9e0" />
                  <ellipse cx="38" cy="85" rx="14" ry="12" fill="#2d94c9" />
                  <ellipse cx="82" cy="85" rx="14" ry="12" fill="#2d94c9" />
                  <path d="M48 85 Q60 80 72 85 Q75 102 60 102 Q45 102 48 85 Z" fill="#f4f4f4" />
                  <rect x="56" y="90" width="8" height="9" fill="#f4f4f4" stroke="#222" strokeWidth="1.5" rx="1" />
                  <ellipse cx="44" cy="65" rx="12" ry="15" fill="#ffffff" stroke="#111" strokeWidth="2.5" />
                  <circle cx="48" cy="67" r="6" fill="#050505" />
                  <ellipse cx="76" cy="65" rx="12" ry="15" fill="#ffffff" stroke="#111" strokeWidth="2.5" />
                  <circle cx="72" cy="67" r="6" fill="#050505" />
                  <path d="M30 52 L54 60" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M90 52 L66 60" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
                  <ellipse cx="60" cy="82" rx="5" ry="3.5" fill="#ea580c" />
                  <line x1="22" y1="80" x2="34" y2="82" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                  <line x1="22" y1="88" x2="34" y2="87" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                  <line x1="98" y1="80" x2="86" y2="82" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                  <line x1="98" y1="88" x2="86" y2="87" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Character 2 (Top Right): Finn the Human with Battle Hood */}
              <div className="absolute -top-3 -right-3 w-36 h-48 opacity-85 select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                <svg viewBox="0 0 120 140" className="w-full h-full">
                  <path d="M25 45 C15 15 35 10 40 25 C50 15 70 15 80 25 C85 10 105 15 95 45 C105 85 95 125 60 125 C25 125 15 85 25 45 Z" fill="#ededed" stroke="#1c1c1e" strokeWidth="2" />
                  <ellipse cx="60" cy="72" rx="25" ry="22" fill="#f8bf9b" stroke="#1c1c1e" strokeWidth="2.5" />
                  <circle cx="50" cy="68" r="4.5" fill="#111" />
                  <circle cx="70" cy="68" r="4.5" fill="#111" />
                  <path d="M42 58 L56 63" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                  <path d="M78 58 L64 63" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                  <path d="M52 82 Q60 78 68 82" stroke="#111" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M15 110 C30 100 90 100 105 110 L115 140 L5 140 Z" fill="#18181c" />
                </svg>
              </div>

              {/* Character 3 (Mid Left): Robin with Red 'R' Crest */}
              <div className="absolute top-[28%] -left-3 w-28 h-40 opacity-80 select-none">
                <svg viewBox="0 0 100 120" className="w-full h-full">
                  <path d="M15 45 L30 10 L50 25 L75 10 L70 45 L85 50 L65 75 L15 45 Z" fill="#0f172a" />
                  <ellipse cx="45" cy="55" rx="22" ry="22" fill="#f3be94" />
                  <path d="M22 50 Q45 60 68 50 Q75 40 68 38 Q45 46 22 38 Q15 40 22 50 Z" fill="#09090b" stroke="#000" strokeWidth="1.5" />
                  <ellipse cx="34" cy="46" rx="6" ry="3.5" fill="#ffffff" />
                  <ellipse cx="56" cy="46" rx="6" ry="3.5" fill="#ffffff" />
                  <line x1="38" y1="68" x2="52" y2="67" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M15 80 L75 80 L70 120 L20 120 Z" fill="#1c1917" />
                  <circle cx="30" cy="95" r="10" fill="#000000" stroke="#facc15" strokeWidth="1.5" />
                  <text x="30" y="99" fill="#dc2626" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                    R
                  </text>
                </svg>
              </div>

              {/* Character 4 (Mid Right): Buttercup (Powerpuff Girls) */}
              <div className="absolute top-[32%] -right-2 w-28 h-36 opacity-80 select-none">
                <svg viewBox="0 0 100 110" className="w-full h-full">
                  <path d="M10 50 C5 15 95 15 90 50 C95 70 85 85 75 80 C70 45 30 45 25 80 C15 85 5 70 10 50 Z" fill="#09090b" />
                  <ellipse cx="50" cy="52" rx="30" ry="26" fill="#fed7aa" />
                  <ellipse cx="36" cy="52" rx="12" ry="14" fill="#ffffff" stroke="#111" strokeWidth="2" />
                  <ellipse cx="36" cy="52" rx="8" ry="10" fill="#16a34a" />
                  <circle cx="36" cy="52" r="5" fill="#050505" />
                  <ellipse cx="64" cy="52" rx="12" ry="14" fill="#ffffff" stroke="#111" strokeWidth="2" />
                  <ellipse cx="64" cy="52" rx="8" ry="10" fill="#16a34a" />
                  <circle cx="64" cy="52" r="5" fill="#050505" />
                  <path d="M22 40 L45 47" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                  <path d="M78 40 L55 47" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                  <path d="M44 68 Q50 64 56 68" stroke="#111" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M25 85 L75 85 L80 110 L20 110 Z" fill="#15803d" />
                  <rect x="23" y="94" width="54" height="6" fill="#09090b" />
                </svg>
              </div>

              {/* Character 5 (Bottom Left): Johnny Bravo */}
              <div className="absolute bottom-2 -left-2 w-32 h-44 opacity-85 select-none">
                <svg viewBox="0 0 110 130" className="w-full h-full">
                  <path d="M15 60 C10 10 70 0 75 35 C80 20 95 30 85 55 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                  <path d="M25 55 L65 55 L60 95 L35 95 Z" fill="#fcd34d" />
                  <rect x="25" y="52" width="22" height="11" rx="2" fill="#09090b" />
                  <rect x="50" y="52" width="18" height="11" rx="2" fill="#09090b" />
                  <line x1="47" y1="56" x2="50" y2="56" stroke="#09090b" strokeWidth="2" />
                  <line x1="38" y1="78" x2="48" y2="76" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M10 90 L80 90 L85 130 L5 130 Z" fill="#09090b" />
                  <ellipse cx="60" cy="110" rx="20" ry="12" fill="#fcd34d" />
                </svg>
              </div>

              {/* Character 6 (Bottom Right): Scrooge McDuck with Dollar Bag */}
              <div className="absolute bottom-2 -right-3 w-36 h-48 opacity-90 select-none">
                <svg viewBox="0 0 120 140" className="w-full h-full">
                  <rect x="35" y="10" width="30" height="28" rx="2" fill="#0f172a" />
                  <rect x="35" y="32" width="30" height="6" fill="#dc2626" />
                  <ellipse cx="50" cy="38" rx="25" ry="5" fill="#0f172a" />
                  <circle cx="50" cy="55" r="18" fill="#ffffff" />
                  <circle cx="44" cy="52" r="5" fill="#93c5fd" stroke="#000" strokeWidth="1.5" opacity="0.8" />
                  <circle cx="56" cy="52" r="5" fill="#93c5fd" stroke="#000" strokeWidth="1.5" opacity="0.8" />
                  <path d="M30 60 Q50 56 70 60 Q65 74 50 74 Q35 74 30 60 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
                  <path d="M25 80 L75 80 L85 125 L15 125 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
                  <ellipse cx="85" cy="98" rx="25" ry="30" fill="#a16207" stroke="#78350f" strokeWidth="2" />
                  <circle cx="85" cy="95" r="14" fill="#ca8a04" opacity="0.3" />
                  <text x="85" y="104" fill="#000000" fontSize="26" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                    $
                  </text>
                  <circle cx="68" cy="125" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                  <circle cx="76" cy="128" r="4" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                  <circle cx="98" cy="126" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                </svg>
              </div>
            </>
          )}

          {/* Floating 100 Dollar Bills across the bottom ground */}
          <div className="absolute bottom-0 inset-x-0 h-16 flex items-center justify-around opacity-40 select-none">
            <div className="w-14 h-7 bg-emerald-950 border border-emerald-500/40 rounded-xs rotate-[-12deg] flex items-center justify-center text-[9px] font-mono text-emerald-300 font-black shadow-lg">
              $100
            </div>
            <div className="w-16 h-8 bg-emerald-950 border border-emerald-500/40 rounded-xs rotate-[8deg] flex items-center justify-center text-[10px] font-mono text-emerald-300 font-black shadow-lg">
              $100
            </div>
            <div className="w-14 h-7 bg-emerald-950 border border-emerald-500/40 rounded-xs rotate-[-6deg] flex items-center justify-center text-[9px] font-mono text-emerald-300 font-black shadow-lg">
              $100
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CENTER CONTENT: OFFICIAL VIGARISTA LOGO + 4 FLOATING 3D BUTTONS        */}
        {/* ========================================================================= */}
        <div className="w-full max-w-[370px] relative z-10 flex flex-col gap-3.5 my-auto pt-2 pb-3">
          {/* Official Vigarista Emblem / Logo Badge */}
          <div className="flex flex-col items-center justify-center -mt-2 mb-1">
            <div className="relative group cursor-pointer" onClick={handleOpenEditModal} title="Personalizar Painel">
              <GosthLogo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]" withGlow={true} />
            </div>
          </div>
          {posterButtons.map((btn) => (
            <button
              key={btn.slot}
              id={`chefe-btn-poster-${btn.slot}`}
              type="button"
              onClick={() => onSelectPoster(btn.slot)}
              className="group relative w-full h-[68px] cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] focus:outline-none select-none"
            >
              {/* Outer Neon Glow Layer */}
              <div
                className={`absolute inset-0 rounded-[14px] ${
                  isCaos
                    ? 'bg-[#00a2ff]/25 blur-[8px] group-hover:bg-[#00a2ff]/40'
                    : 'bg-[#ff183c]/20 blur-[8px] group-hover:bg-[#ff183c]/35'
                } transition-all`}
                style={{
                  clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)',
                }}
              />

              {/* Chamfered Hexagonal Frame Container with Neon Edge */}
              <div
                className={`relative w-full h-full bg-gradient-to-b from-[#222228] via-[#121215] to-[#0a0a0c] border-[2px] ${
                  isCaos
                    ? 'border-[#00a2ff] shadow-[0_4px_20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_0_15px_rgba(0,162,255,0.25)] group-hover:border-[#38bdf8] group-hover:shadow-[0_0_25px_rgba(0,162,255,0.6),inset_0_0_15px_rgba(0,162,255,0.4)]'
                    : 'border-[#ff183c] shadow-[0_4px_20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_0_15px_rgba(255,24,60,0.25)] group-hover:border-[#ff3355] group-hover:shadow-[0_0_25px_rgba(255,24,60,0.6),inset_0_0_15px_rgba(255,24,60,0.4)]'
                } flex items-center justify-between px-4 transition-all`}
                style={{
                  clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)',
                }}
              >
                {/* Top Subtle Glossy Reflection */}
                <div className="absolute top-0 inset-x-3 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[10px]" />

                {/* Left: Glowing Ticket Icon (Blue for Caos, Red for Chefe) */}
                <div className="flex items-center justify-center shrink-0 w-11 h-11">
                  <svg
                    width="36"
                    height="24"
                    viewBox="0 0 38 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={isCaos ? 'drop-shadow-[0_0_8px_rgba(0,162,255,0.8)]' : 'drop-shadow-[0_0_8px_rgba(255,24,60,0.8)]'}
                  >
                    {/* Ticket Body */}
                    <path
                      d="M2 4C2 2.89543 2.89543 2 4 2H34C35.1046 2 36 2.89543 36 4V8C33.7909 8 32 9.79086 32 12C32 14.2091 33.7909 16 36 16V22C36 23.1046 35.1046 24 34 24H4C2.89543 24 2 23.1046 2 22V16C4.20914 16 6 14.2091 6 12C6 9.79086 4.20914 8 2 8V4Z"
                      stroke={isCaos ? '#00a2ff' : '#ff183c'}
                      strokeWidth="2.4"
                      fill={isCaos ? '#00a2ff' : '#ff183c'}
                      fillOpacity="0.15"
                    />
                    {/* Middle dashed line */}
                    <line
                      x1="19"
                      y1="5"
                      x2="19"
                      y2="21"
                      stroke={isCaos ? '#00a2ff' : '#ff183c'}
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  </svg>
                </div>

                {/* Middle: Stacked Label (BTS in White, Subtitle in Italic Neon Blue/Red) + Tag Badge for Meia/Inteira */}
                <div className="flex-1 flex flex-col items-start justify-center pl-2.5 overflow-hidden pr-1">
                  <div className="flex items-baseline gap-2 w-full">
                    <span
                      className="text-white text-[16px] font-black tracking-wider leading-none uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate"
                      style={{
                        fontFamily: "'LEMON MILK', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                      }}
                    >
                      {btn.labelTitle}
                    </span>
                    <span
                      className={`${
                        isCaos
                          ? 'text-[#00a2ff] drop-shadow-[0_0_8px_rgba(0,162,255,0.8)]'
                          : 'text-[#ff183c] drop-shadow-[0_0_8px_rgba(255,24,60,0.8)]'
                      } text-[14px] font-black italic tracking-wider leading-none uppercase truncate`}
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Arial Black', sans-serif",
                      }}
                    >
                      {btn.labelSub}
                    </span>
                  </div>

                  {/* Prominent Tag Badge for Meia-Entrada vs Inteira */}
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm ${
                        btn.tag.toLowerCase().includes('meia')
                          ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                          : 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      }`}
                    >
                      {btn.tag}
                    </span>
                  </div>
                </div>

                {/* Right: Glowing Arrow (->) */}
                <div
                  className={`shrink-0 flex items-center justify-center ${
                    isCaos ? 'text-[#00a2ff]' : 'text-[#ff183c]'
                  } group-hover:translate-x-1 transition-transform`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isCaos ? '#00a2ff' : '#ff183c'}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isCaos ? 'drop-shadow-[0_0_8px_rgba(0,162,255,0.8)]' : 'drop-shadow-[0_0_8px_rgba(255,24,60,0.8)]'}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 4. CENTER-BOTTOM 3D METALLIC CHROME NUMBER / SYMBOL                        */}
        {/* Beveled steel texture with backlight glow (Blue for Caos, Red for Chefe)  */}
        {/* ========================================================================= */}
        <div className="relative z-10 flex flex-col items-center justify-center my-1 select-none">
          {/* Intense Backlight Glow behind Symbol */}
          <div
            className={`absolute w-24 h-24 rounded-full ${
              isCaos ? 'bg-[#00a2ff]/50 blur-[20px]' : 'bg-[#ff183c]/50 blur-[20px]'
            } pointer-events-none`}
          />

          {config.centerSymbol === '7' || !config.centerSymbol ? (
            /* 3D Chrome Beveled Number "7" SVG */
            <div className="relative w-20 h-24 drop-shadow-[0_10px_20px_rgba(0,0,0,0.95)]">
              <svg
                viewBox="0 0 100 120"
                className={`w-full h-full filter ${
                  isCaos ? 'drop-shadow-[0_0_12px_#00a2ff]' : 'drop-shadow-[0_0_12px_#ff183c]'
                }`}
              >
                <defs>
                  {/* Linear Chrome Gradient for Bevel */}
                  <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#a3a3a3" />
                    <stop offset="50%" stopColor="#404040" />
                    <stop offset="75%" stopColor="#737373" />
                    <stop offset="100%" stopColor="#262626" />
                  </linearGradient>
                  {/* Glow Outline Gradient (Blue for Caos, Red for Chefe) */}
                  <linearGradient id="rimGradientCaos" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0052b4" />
                  </linearGradient>
                  <linearGradient id="redRimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff4d6d" />
                    <stop offset="100%" stopColor="#990011" />
                  </linearGradient>
                </defs>

                {/* Beveled Extrusion Layer (Dark Base) */}
                <path
                  d="M15 22 L85 22 L45 105 L22 105 L58 36 L15 36 Z"
                  fill="#171717"
                  stroke={isCaos ? 'url(#rimGradientCaos)' : 'url(#redRimGradient)'}
                  strokeWidth="4"
                  strokeLinejoin="bevel"
                />

                {/* Chrome Top Face */}
                <path
                  d="M18 25 L82 25 L45 102 L25 102 L58 39 L18 39 Z"
                  fill="url(#chromeGradient)"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinejoin="bevel"
                />

                {/* Inner Facet / Chiseled Center Line */}
                <path
                  d="M18 25 L50 32 L45 102"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </svg>
            </div>
          ) : (
            /* Custom Chrome Symbol / Number Display */
            <div
              className={`relative px-5 py-2 rounded-2xl bg-gradient-to-b from-[#333] via-[#111] to-[#000] border-2 ${
                isCaos
                  ? 'border-[#00a2ff] shadow-[0_0_20px_rgba(0,162,255,0.6)]'
                  : 'border-[#ff183c] shadow-[0_0_20px_rgba(255,24,60,0.6)]'
              } drop-shadow-[0_10px_20px_rgba(0,0,0,0.95)] flex items-center justify-center`}
            >
              <span
                className="text-2xl font-black italic tracking-wider bg-gradient-to-b from-white via-gray-300 to-gray-600 bg-clip-text text-transparent"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                {config.centerSymbol}
              </span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. BOTTOM GRAFFITI SLOGAN                                                */}
        {/* Neon Graffiti Typography                                                  */}
        {/* ========================================================================= */}
        <div className="relative z-10 mt-1 mb-2 select-none text-center">
          <p
            className={`${
              isCaos
                ? 'text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.85)]'
                : 'text-[#39ff14] drop-shadow-[0_0_10px_rgba(57,255,20,0.85)]'
            } text-[13.5px] font-black italic tracking-widest uppercase px-2`}
            style={{
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              letterSpacing: '1.8px',
            }}
          >
            {config.slogan || 'FIQUE RICO OU MORRA TENTANDO $'}
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/95 border border-emerald-500/60 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal for Editing Page Information */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-[99] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-text overflow-y-auto"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0e111a] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-gray-100 my-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-4 py-3.5 flex items-center justify-between border-b ${
              isCaos ? 'border-blue-900/50 bg-[#06102e]' : 'border-red-900/50 bg-[#1f0a10]'
            } shrink-0`}>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  isCaos ? 'bg-[#00a2ff]/20 text-[#00a2ff]' : 'bg-[#ff183c]/20 text-[#ff183c]'
                }`}>
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Editar Página
                  </h3>
                </div>
              </div>

              {/* Top Quick Action Bar: Direct Save + Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className={`px-3.5 py-1.5 text-xs font-bold text-white rounded-lg shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                    isCaos
                      ? 'bg-[#00a2ff] hover:bg-[#0082cc] shadow-blue-500/20'
                      : 'bg-[#ff183c] hover:bg-[#e00d30] shadow-red-500/20'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Salvar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable Form */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-sm">
              {/* 1. Nome do Cabeçalho (Totalmente Editável) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Título do Cabeçalho (Totalmente Editável)
                </label>
                <input
                  type="text"
                  value={formConfig.teamName}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, teamName: e.target.value }))
                  }
                  placeholder={isCaos ? 'Equipe Caos' : 'Equipe Liderança'}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-3.5 py-2 text-white font-semibold text-sm focus:outline-none focus:border-[#00a2ff] transition-colors"
                />
              </div>

              {/* 2. Slogan Inferior */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Slogan Inferior
                </label>
                <input
                  type="text"
                  value={formConfig.slogan}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, slogan: e.target.value }))
                  }
                  placeholder="FIQUE RICO OU MORRA TENTANDO $"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-3.5 py-2 text-white font-semibold text-sm focus:outline-none focus:border-[#00a2ff] transition-colors"
                />
              </div>

              {/* 3. Símbolo ou Número Central */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Número ou Símbolo Central
                </label>
                <input
                  type="text"
                  value={formConfig.centerSymbol}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, centerSymbol: e.target.value }))
                  }
                  placeholder="7"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-3.5 py-2 text-white font-semibold text-sm focus:outline-none focus:border-[#00a2ff] transition-colors"
                />
              </div>

              {/* 4. Editar os 4 Botões Principais */}
              <div className="space-y-3 pt-2 border-t border-gray-800">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Botões de Eventos (4 Slots)</span>
                </h4>

                {(['slot1', 'slot2', 'slot3', 'slot4'] as const).map((slotKey, idx) => {
                  const slotNum = idx + 1;
                  const slotData = formConfig.buttons[slotKey];
                  return (
                    <div
                      key={slotKey}
                      className="bg-black/40 border border-gray-800 rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isCaos ? 'bg-blue-900/40 text-blue-300' : 'bg-red-900/40 text-red-300'
                        }`}>
                          Botão #{slotNum}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-400 font-medium mb-0.5">
                            Título (Ex: BTS)
                          </label>
                          <input
                            type="text"
                            value={slotData.title}
                            onChange={(e) =>
                              setFormConfig((prev) => ({
                                ...prev,
                                buttons: {
                                  ...prev.buttons,
                                  [slotKey]: { ...prev.buttons[slotKey], title: e.target.value },
                                },
                              }))
                            }
                            className="w-full bg-black/60 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a2ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-medium mb-0.5">
                            Subtítulo (Ex: PISTA)
                          </label>
                          <input
                            type="text"
                            value={slotData.subtitle}
                            onChange={(e) =>
                              setFormConfig((prev) => ({
                                ...prev,
                                buttons: {
                                  ...prev.buttons,
                                  [slotKey]: { ...prev.buttons[slotKey], subtitle: e.target.value },
                                },
                              }))
                            }
                            className="w-full bg-black/60 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a2ff]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-medium mb-0.5">
                          Tag / Tipo de Ingresso (Ex: Meia-Entrada • 31/10)
                        </label>
                        <input
                          type="text"
                          value={slotData.tag}
                          onChange={(e) =>
                            setFormConfig((prev) => ({
                              ...prev,
                              buttons: {
                                ...prev.buttons,
                                [slotKey]: { ...prev.buttons[slotKey], tag: e.target.value },
                              },
                            }))
                          }
                          className="w-full bg-black/60 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a2ff]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer with Big Sticky Save Button */}
            <div className="p-3 bg-[#080a12] border-t border-gray-800 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetConfig}
                className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title="Restaurar padrão"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                  isCaos
                    ? 'bg-[#00a2ff] hover:bg-[#0082cc] shadow-blue-500/30'
                    : 'bg-[#ff183c] hover:bg-[#e00d30] shadow-red-500/30'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

