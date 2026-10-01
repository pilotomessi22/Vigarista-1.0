import React from 'react';
import { RotateCcw, ArrowLeft, Shield, Sparkles, Home, Ticket } from 'lucide-react';
import { MoneyRainCanvas } from './MoneyRainCanvas';

interface ModoLojaViewProps {
  userName: string;
  isCaos: boolean;
  onReturnToPanel: () => void;
  onOpenQuentroV2?: () => void;
}

export const ModoLojaView: React.FC<ModoLojaViewProps> = ({
  userName,
  isCaos,
  onReturnToPanel,
  onOpenQuentroV2,
}) => {
  // Extract user first name or clean display name
  const formattedUser = (userName || 'CHEFE').trim().toUpperCase();

  return (
    <div
      className={`min-h-screen w-full text-white flex flex-col relative overflow-hidden select-none ${
        isCaos
          ? 'bg-[#04091c] selection:bg-[#00a2ff] selection:text-white'
          : 'bg-[#0d0e11] selection:bg-[#ff183c] selection:text-white'
      }`}
    >
      {/* 1. TOP HEADER - MATCHING MAIN PAGE SCENARIO */}
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-md px-4 pt-[max(12px,env(safe-area-inset-top,12px))] pb-3 flex items-center justify-between border-b ${
          isCaos
            ? 'bg-[#04091c]/90 border-blue-900/40 shadow-[0_4px_20px_rgba(4,9,28,0.8)]'
            : 'bg-[#0d0e11]/90 border-red-900/30'
        }`}
      >
        {/* Crown Icon */}
        <div className="flex items-center gap-2">
          <div className={isCaos ? 'text-[#00a2ff]' : 'text-[#ff183c]'}>
            <svg
              width="28"
              height="22"
              viewBox="0 0 36 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={
                isCaos
                  ? 'drop-shadow-[0_0_8px_rgba(0,162,255,0.8)]'
                  : 'drop-shadow-[0_0_8px_rgba(255,24,60,0.8)]'
              }
            >
              <path
                d="M3 24H33V26C33 26.5 32.5 27 32 27H4C3.5 27 3 26.5 3 26V24Z"
                fill={isCaos ? '#00a2ff' : '#ff183c'}
              />
              <path
                d="M4 22L2 6L10 14L18 2L26 14L34 6L32 22H4Z"
                stroke={isCaos ? '#00a2ff' : '#ff183c'}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="2" cy="5" r="1.8" fill={isCaos ? '#00a2ff' : '#ff183c'} />
              <circle cx="18" cy="2" r="2.2" fill="#ffffff" />
              <circle cx="34" cy="5" r="1.8" fill={isCaos ? '#00a2ff' : '#ff183c'} />
            </svg>
          </div>
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
            VIGARISTA
          </span>
        </div>

        {/* Quick Return Button in Header */}
        <button
          type="button"
          onClick={onReturnToPanel}
          className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
            isCaos
              ? 'bg-blue-950/60 border-blue-800/50 text-[#00a2ff] hover:bg-blue-900/80'
              : 'bg-red-950/60 border-red-800/50 text-[#ff183c] hover:bg-red-900/80'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Painel</span>
        </button>
      </header>

      {/* 2. BACKGROUND SCENARIO & FLYING MONEY ANIMATION */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 min-h-[500px]">
        {/* Radial Background Glow matching main page */}
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-700"
          style={{
            backgroundImage: isCaos
              ? `radial-gradient(circle at 50% 40%, #1e3a8a 0%, transparent 65%), radial-gradient(circle at 50% 80%, #0f2356 0%, #030712 100%)`
              : `radial-gradient(circle at 50% 40%, #ff183c 0%, transparent 65%), radial-gradient(circle at 50% 80%, #1e1e24 0%, #0a0a0c 100%)`,
          }}
        />

        {/* 60FPS Flying Money Rain Animation */}
        <MoneyRainCanvas density={48} className="absolute inset-0 pointer-events-none z-0" />

        {/* Subtle Faint Background Crown */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-15 pointer-events-none z-0">
          <svg width="220" height="140" viewBox="0 0 140 90" fill="none" stroke="#ffffff" strokeWidth="1.5">
            <path d="M10 80L25 25L55 55L70 15L85 55L115 25L130 80H10Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25" cy="22" r="4" fill="#ffffff" />
            <circle cx="70" cy="12" r="5" fill="#ffffff" />
            <circle cx="115" cy="22" r="4" fill="#ffffff" />
          </svg>
        </div>

        {/* 3. CLEAN CENTER CONTENT CONTAINER */}
        <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center space-y-8 p-6 sm:p-10 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
          {/* Badge Accent */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest text-gray-300 uppercase">
            <Sparkles className={`w-3.5 h-3.5 ${isCaos ? 'text-[#00a2ff]' : 'text-[#ff183c]'}`} />
            <span>VIGARISTA</span>
          </div>

          {/* MAIN PROMINENT HEADING IN LEMON MILK FONT */}
          <h1
            className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider leading-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
            style={{
              fontFamily: "'LEMON MILK', 'Lemon Milk', 'Arial Black', sans-serif",
            }}
          >
            EAI{' '}
            <span
              className={
                isCaos
                  ? 'text-[#00a2ff] drop-shadow-[0_0_18px_rgba(0,162,255,0.95)]'
                  : 'text-[#ff183c] drop-shadow-[0_0_18px_rgba(255,24,60,0.95)]'
              }
            >
              {formattedUser}
            </span>{' '}
            BORA FAZER A DIARIA DE UM DOUTOR?
          </h1>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
            {onOpenQuentroV2 && (
              <button
                type="button"
                id="btn-vigarista-open-quentrov2"
                onClick={onOpenQuentroV2}
                className="w-full sm:w-auto flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-wider text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-2xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 border border-emerald-400/40"
              >
                <Ticket className="w-5 h-5 stroke-[2.4]" />
                <span>Acessar Quentrov2</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReturnToPanel}
              className={`w-full sm:w-auto flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-wider text-sm sm:text-base text-white shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 ${
                isCaos
                  ? 'bg-gradient-to-r from-[#00a2ff] to-[#0066cc] hover:from-[#00b0ff] hover:to-[#0077e6] shadow-blue-500/30'
                  : 'bg-gradient-to-r from-[#ff183c] to-[#c40d2b] hover:from-[#ff2e50] hover:to-[#d61030] shadow-red-500/30'
              }`}
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>Voltar ao Painel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
