import React, { useEffect, useState } from 'react';
import { ActiveView } from '../types';

interface PageLoadingScreenProps {
  targetView: ActiveView | null;
  isExiting?: boolean;
}

export const PageLoadingScreen: React.FC<PageLoadingScreenProps> = ({ targetView, isExiting = false }) => {
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    // Fast simulated progress bar
    const t1 = setTimeout(() => setProgress(75), 40);
    const t2 = setTimeout(() => setProgress(100), 100);
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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none pointer-events-none transition-opacity duration-150 ease-out ${
        isExiting
          ? 'opacity-0 backdrop-blur-none'
          : 'opacity-100 backdrop-blur-sm'
      } ${
        isQuentroV2
          ? 'bg-[#121719]/90 text-white'
          : isDark
          ? 'bg-[#1c1c1e]/90 text-white'
          : isQuentro
          ? 'bg-[#121719]/90 text-white'
          : 'bg-[#121719]/90 text-white'
      }`}
    >
      {/* Top Safari/Browser Loading Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-black/10 overflow-hidden z-50 pointer-events-none">
        <div
          className={`h-full transition-all duration-100 ease-out ${
            isQuentroV2
              ? 'bg-[#00D2B4]'
              : isDark
              ? 'bg-[#007aff]'
              : 'bg-[#00D2B4]'
          }`}
          style={{ width: isExiting ? '100%' : `${progress}%` }}
        />
      </div>

      {/* Center Spinner & Brand Feedback */}
      <div
        className={`flex flex-col items-center justify-center space-y-3 pointer-events-none transition-all duration-150 ${
          isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="w-9 h-9 rounded-full border-[2.5px] border-white/15 border-t-[#00D2B4] animate-spin" />
        <span className="text-[13px] font-medium tracking-tight text-[#00D2B4]">
          Carregando...
        </span>
      </div>
    </div>
  );
};
