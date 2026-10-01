import React, { useEffect, useState } from 'react';
import { ActiveView } from '../types';

interface PageLoadingScreenProps {
  targetView: ActiveView | null;
  isExiting?: boolean;
}

export const PageLoadingScreen: React.FC<PageLoadingScreenProps> = ({ targetView, isExiting = false }) => {
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    // Fast simulated progress bar
    const t1 = setTimeout(() => setProgress(70), 50);
    const t2 = setTimeout(() => setProgress(98), 130);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const isDark = targetView === 'safari-home';
  const isQuentroV2 = targetView === 'quentrov2';
  const isQuentro = targetView === 'quentro-ticket' || targetView === 'quentro-email';

  return (
    <div
      id="page-loading-screen"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none transition-all duration-200 ease-out ${
        isExiting
          ? 'opacity-0 backdrop-blur-xl blur-xs scale-[1.01] pointer-events-none'
          : 'opacity-100 backdrop-blur-md scale-100'
      } ${
        isQuentroV2
          ? 'bg-[#121719]/95 text-white'
          : isDark
          ? 'bg-[#1c1c1e]/95 text-white'
          : isQuentro
          ? 'bg-[#f4f5f7]/95 text-gray-900'
          : 'bg-[#f8f9fa]/95 text-gray-900'
      }`}
      style={{
        pointerEvents: isExiting ? 'none' : 'all',
      }}
    >
      {/* Top Safari/Browser Loading Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-black/5 overflow-hidden z-50">
        <div
          className={`h-full transition-all duration-150 ease-out shadow-xs ${
            isQuentroV2
              ? 'bg-[#00D2B4]'
              : isDark
              ? 'bg-[#007aff]'
              : isQuentro
              ? 'bg-[#1E4CD6]'
              : 'bg-[#1E4CD6]'
          }`}
          style={{ width: isExiting ? '100%' : `${progress}%` }}
        />
      </div>

      {/* Center Spinner & Subtle Brand Feedback */}
      <div
        className={`flex flex-col items-center justify-center space-y-4 transition-all duration-200 ${
          isExiting ? 'scale-95 opacity-0 blur-xs' : 'scale-100 opacity-100 blur-none'
        }`}
      >
        {/* iOS Native / Quentro / Ticketmaster Circular Spinner */}
        <div className="relative w-11 h-11 flex items-center justify-center">
          <div
            className={`w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin ${
              isQuentroV2
                ? 'border-white/20 border-t-[#00D2B4]'
                : isDark
                ? 'border-white/20 border-t-[#007aff]'
                : isQuentro
                ? 'border-[#1E4CD6]/20 border-t-[#1E4CD6]'
                : 'border-[#1E4CD6]/20 border-t-[#1E4CD6]'
            }`}
          />
        </div>

        {/* Brand label */}
        <span
          className={`text-[13.5px] font-semibold tracking-tight ${
            isQuentroV2 ? 'text-[#00D2B4]' : isDark ? 'text-white/70' : 'text-gray-600'
          }`}
        >
          {targetView === 'quentrov2'
            ? 'Abrindo Quentro v2...'
            : targetView === 'safari-home'
            ? 'Carregando Safari...'
            : targetView === 'order-details'
            ? 'Carregando detalhes do pedido...'
            : targetView === 'quentro-ticket'
            ? 'Carregando ingresso Quentro...'
            : targetView === 'quentro-email'
            ? 'Acessando Quentro...'
            : 'Carregando Ticketmaster...'}
        </span>
      </div>
    </div>
  );
};
