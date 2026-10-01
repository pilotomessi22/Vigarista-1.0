import React, { useState } from 'react';
import { OrderItem } from '../types';
import { ChevronRight, Sparkles } from 'lucide-react';

interface RioHomeViewProps {
  userName?: string;
  orders: {
    order1: OrderItem;
    order2: OrderItem;
    order3: OrderItem;
    order4: OrderItem;
  };
  activeOrderSlot: '1' | '2' | '3' | '4' | string;
  onSelectSlot: (slot: '1' | '2' | '3' | '4') => void;
  onOpenOrder: (slot: '1' | '2' | '3' | '4') => void;
  onOpenQuentro: () => void;
  onOpenQuentroV2: () => void;
  onOpenSafari: () => void;
  onOpenAnalysis?: () => void;
  onOpenMobileMenu?: () => void;
}

export const RioHomeView: React.FC<RioHomeViewProps> = ({
  onSelectSlot,
  onOpenOrder,
  onOpenQuentroV2,
}) => {
  const [pressedSlot, setPressedSlot] = useState<string | null>(null);

  const handleTriggerCard = (slot: '1' | '2' | '3' | '4') => {
    setPressedSlot(slot);
    onSelectSlot(slot);
    onOpenOrder(slot);
    setTimeout(() => {
      setPressedSlot(null);
    }, 150);
  };

  return (
    <div className="relative w-full min-h-screen min-h-[100dvh] bg-[#000000] text-white flex flex-col items-center justify-start p-0 m-0 select-none overflow-x-hidden overflow-y-auto overscroll-y-contain pb-32 pt-0 touch-manipulation">
      {/* 1. Fundo Preto Profundo e Homogêneo com Gradiente Suave */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#000000]" />

      {/* 2. Conteúdo Principal Centralizado */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto flex flex-col items-center">
        
        {/* Camada da imagem ocupando 100% da largura em dispositivos móveis */}
        <div className="relative w-full overflow-hidden flex items-center justify-center">
          {/* A foto oficial em alta resolução ocupando a tela de ponta a ponta */}
          <img
            src="/vigarista-poster.png"
            alt="Menu Principal"
            loading="eager"
            decoding="sync"
            // @ts-ignore
            fetchpriority="high"
            className="w-full h-auto object-contain block select-none pointer-events-none will-change-transform"
          />

          {/* 4 Zonas de Toque Fluídas mapeadas sobre os 4 cartões de ingresso */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {/* Card 1 (Ingresso 1 - Topo) */}
            <button
              id="slot-ticket-card-1"
              type="button"
              onClick={() => handleTriggerCard('1')}
              className={`absolute left-[4%] right-[4%] top-[26.5%] h-[13.8%] rounded-2xl cursor-pointer transition-all duration-150 border-0 outline-none ring-0 focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] ${
                pressedSlot === '1' ? 'opacity-80 scale-[0.98]' : 'active:opacity-85 active:scale-[0.99]'
              }`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
              }}
              aria-label="Abrir Ingresso 1"
            />

            {/* Card 2 (Ingresso 2) */}
            <button
              id="slot-ticket-card-2"
              type="button"
              onClick={() => handleTriggerCard('2')}
              className={`absolute left-[4%] right-[4%] top-[41.2%] h-[13.8%] rounded-2xl cursor-pointer transition-all duration-150 border-0 outline-none ring-0 focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] ${
                pressedSlot === '2' ? 'opacity-80 scale-[0.98]' : 'active:opacity-85 active:scale-[0.99]'
              }`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
              }}
              aria-label="Abrir Ingresso 2"
            />

            {/* Card 3 (Ingresso 3) */}
            <button
              id="slot-ticket-card-3"
              type="button"
              onClick={() => handleTriggerCard('3')}
              className={`absolute left-[4%] right-[4%] top-[55.9%] h-[13.8%] rounded-2xl cursor-pointer transition-all duration-150 border-0 outline-none ring-0 focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] ${
                pressedSlot === '3' ? 'opacity-80 scale-[0.98]' : 'active:opacity-85 active:scale-[0.99]'
              }`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
              }}
              aria-label="Abrir Ingresso 3"
            />

            {/* Card 4 (Ingresso 4 - Base) */}
            <button
              id="slot-ticket-card-4"
              type="button"
              onClick={() => handleTriggerCard('4')}
              className={`absolute left-[4%] right-[4%] top-[70.6%] h-[13.8%] rounded-2xl cursor-pointer transition-all duration-150 border-0 outline-none ring-0 focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] ${
                pressedSlot === '4' ? 'opacity-80 scale-[0.98]' : 'active:opacity-85 active:scale-[0.99]'
              }`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
              }}
              aria-label="Abrir Ingresso 4"
            />
          </div>
        </div>

        {/* 3. Botão Quentrov2 Ultra Clean, Flutuante e com Vidro Escuro Fosco */}
        <div className="w-full px-5 pt-3 pb-6 flex items-center justify-center">
          <button
            id="btn-access-quentrov2-floating"
            type="button"
            onClick={() => onOpenQuentroV2 && onOpenQuentroV2()}
            className="w-full max-w-[390px] h-[52px] bg-black/60 hover:bg-black/80 active:scale-[0.98] text-white rounded-full border border-white/15 hover:border-[#00D2B4]/50 shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_20px_rgba(0,210,180,0.1)] flex items-center justify-between px-5 transition-all duration-200 backdrop-blur-2xl group outline-none [-webkit-tap-highlight-color:transparent]"
            style={{
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full bg-[#00D2B4]/20 border border-[#00D2B4]/30 flex items-center justify-center text-[#00D2B4] group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(0,210,180,0.3)]">
                <Sparkles className="w-3.5 h-3.5 fill-[#00D2B4]" />
              </div>
              <div className="flex flex-col items-start text-left leading-tight">
                <span className="text-[14px] font-semibold text-white tracking-wide group-hover:text-[#00D2B4] transition-colors">
                  Quentrov2
                </span>
                <span className="text-[10.5px] text-gray-400 font-normal tracking-wider">
                  Carteira Digital
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-[12px] font-medium text-[#00D2B4] bg-[#00D2B4]/10 px-3 py-1 rounded-full border border-[#00D2B4]/20 group-hover:bg-[#00D2B4]/20 transition-colors">
              <span className="tracking-wide">Abrir</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
