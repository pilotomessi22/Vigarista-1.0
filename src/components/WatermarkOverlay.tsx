import React from 'react';
import { ShieldCheck, Lock, Clock } from 'lucide-react';

interface WatermarkOverlayProps {
  remainingTimeText?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ remainingTimeText }) => {
  const WATERMARK_TEXT = 'anti roubo painelzin dos cria 22';

  return (
    <>
      {/* Floating Bottom Badge Pill (Sleek, Non-Intrusive, Non-Blocking) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none max-w-[92%] sm:max-w-max">
        <div className="bg-gray-950/90 dark:bg-black/90 text-white backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/40 shadow-2xl flex items-center gap-2.5 text-xs font-medium tracking-wide">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-gray-200 font-semibold truncate">
            Modo Demonstração <span className="text-amber-400/80 font-normal">| Edição Desativada</span>
          </span>
          {remainingTimeText && (
            <span className="bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full text-[11px] border border-amber-500/30 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-amber-400 inline" />
              <span>{remainingTimeText}</span>
            </span>
          )}
        </div>
      </div>

      {/* Elegant, Semi-Transparent Watermark Pattern (Non-intrusive opacity, clean typography, NO blur boxes) */}
      <div className="fixed inset-0 pointer-events-none z-[9990] overflow-hidden select-none opacity-[0.11] dark:opacity-[0.15]">
        <div className="w-[160vw] h-[160vh] -ml-[30vw] -mt-[30vh] transform -rotate-25 flex flex-col justify-between py-6">
          {[...Array(14)].map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex justify-around whitespace-nowrap text-xs sm:text-sm font-black tracking-[0.25em] uppercase text-gray-900 dark:text-gray-100"
              style={{ transform: `translateX(${(rowIdx % 2) * -60}px)` }}
            >
              {[...Array(5)].map((_, colIdx) => (
                <span key={colIdx} className="mx-8 flex items-center gap-2">
                  <Lock className="w-3 h-3 opacity-70" />
                  <span>{WATERMARK_TEXT}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

