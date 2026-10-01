import React from 'react';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';

interface DiscreteScaleAdjusterProps {
  scale: number;
  onChangeScale: (newScale: number) => void;
  onClose: () => void;
}

export const DiscreteScaleAdjuster: React.FC<DiscreteScaleAdjusterProps> = ({
  scale,
  onChangeScale,
  onClose,
}) => {
  const presets = [90, 94, 97, 100, 103, 106];

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeScale(Math.max(75, scale - 2));
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeScale(Math.min(125, scale + 2));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeScale(100);
  };

  return (
    <div
      className="fixed bottom-6 right-4 z-50 select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#12191B]/95 backdrop-blur-md border border-white/15 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
        {/* Decrease */}
        <button
          onClick={handleDecrease}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
          title="Diminuir escala"
        >
          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Current Scale Display / Reset Button */}
        <button
          onClick={handleReset}
          className="px-2 py-0.5 rounded-full hover:bg-white/10 text-xs font-mono font-bold text-[#00D2B4] tracking-tight flex items-center gap-1 cursor-pointer"
          title="Clique para redefinir para 100%"
        >
          <span>{scale}%</span>
          {scale !== 100 && <RotateCcw className="w-2.5 h-2.5 text-zinc-400" />}
        </button>

        {/* Increase */}
        <button
          onClick={handleIncrease}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
          title="Aumentar escala"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-white/15 my-auto" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-white/15 active:scale-90 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          title="Ocultar ajuste de escala"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
