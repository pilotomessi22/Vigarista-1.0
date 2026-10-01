import React, { useMemo } from 'react';
import { Ticket, Flame } from 'lucide-react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  onSelectEvent: (event: EventItem) => void;
  isHot?: boolean;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
  isHot,
  className = '',
}) => {
  // Deterministic realistic particle embers generated for this card
  const embers = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${8 + (i * 9.2) + ((i % 3) * 2.5)}%`,
      size: 2.2 + (i % 3) * 1.4,
      delay: (i * 0.38) % 3.5,
      duration: 2.0 + (i % 4) * 0.55,
      opacity: 0.75 + ((i % 4) * 0.08),
      drift: (i % 2 === 0 ? 1 : -1) * (12 + (i % 3) * 7),
      isGold: i % 2 === 0,
    }));
  }, []);

  // Check if card has hot indicators or was explicitly requested as hot
  const hasFireEffect = isHot !== undefined ? isHot : Boolean(event.badge || event.topBadge);

  return (
    <div
      id={`event-card-${event.id}`}
      onClick={() => onSelectEvent(event)}
      className={`group relative flex flex-col cursor-pointer rounded-2xl overflow-visible isolate transition-transform duration-300 hover:-translate-y-1.5 ${className}`}
    >
      {/* ========================================================================= */}
      {/* ORGANIC MULTI-LAYER BLUR FLAME & PARTICLE COMBUSTION ENGINE (60FPS)       */}
      {/* ========================================================================= */}
      <div
        className={`absolute -inset-2 pointer-events-none z-0 transition-opacity duration-500 will-change-flame ${
          hasFireEffect ? 'opacity-90 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-95'
        }`}
      >
        {/* Layer 0: Deep Atmospheric Ambient Heat Aura (Soft Warm Radial Diffusion) */}
        <div
          className="absolute -inset-3 rounded-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 105%, rgba(255, 60, 0, 0.45) 0%, rgba(255, 120, 0, 0.25) 40%, rgba(255, 200, 0, 0.1) 70%, transparent 100%)',
            filter: 'blur(20px)',
            animation: 'organicCardHeatAura 3s ease-in-out infinite alternate',
            transform: 'translate3d(0,0,0)',
          }}
        />

        {/* Layer 1: Base Crimson Combustion Blobs (Heavy blur, undulating envelope) */}
        <div className="absolute -bottom-3 left-1 right-1 h-16 flex items-end justify-around overflow-visible">
          <div
            className="w-20 h-14 bg-red-600/70 rounded-full will-change-flame"
            style={{
              filter: 'blur(12px)',
              animation: 'organicFlameBlob1 2.8s ease-in-out infinite alternate',
            }}
          />
          <div
            className="w-24 h-16 bg-red-500/75 rounded-full will-change-flame"
            style={{
              filter: 'blur(14px)',
              animation: 'organicFlameBlob2 3.2s ease-in-out infinite alternate 0.4s',
            }}
          />
          <div
            className="w-18 h-12 bg-rose-600/70 rounded-full will-change-flame"
            style={{
              filter: 'blur(11px)',
              animation: 'organicFlameBlob1 2.5s ease-in-out infinite alternate 0.8s',
            }}
          />
        </div>

        {/* Layer 2: Radiant Orange Gas Flames (Medium blur, active tongues) */}
        <div className="absolute -bottom-2.5 left-2 right-2 h-14 flex items-end justify-between overflow-visible">
          <div
            className="w-14 h-11 bg-gradient-to-t from-orange-600 to-amber-500 rounded-full will-change-flame"
            style={{
              filter: 'blur(7px)',
              animation: 'organicFlameBlob2 2.2s ease-in-out infinite alternate',
            }}
          />
          <div
            className="w-20 h-14 bg-gradient-to-t from-orange-500 to-amber-400 rounded-full will-change-flame"
            style={{
              filter: 'blur(8px)',
              animation: 'organicFlameBlob1 2.4s ease-in-out infinite alternate 0.3s',
            }}
          />
          <div
            className="w-14 h-10 bg-gradient-to-t from-orange-600 to-yellow-500 rounded-full will-change-flame"
            style={{
              filter: 'blur(6px)',
              animation: 'organicFlameBlob2 1.9s ease-in-out infinite alternate 0.6s',
            }}
          />
        </div>

        {/* Layer 3: Incandescent Golden & White Core Flame Tongues (Sharp blur, high luminescence) */}
        <div className="absolute -bottom-1.5 left-4 right-4 h-10 flex items-end justify-center gap-3 overflow-visible">
          <div
            className="w-10 h-8 bg-amber-300 rounded-full will-change-flame"
            style={{
              filter: 'blur(3.5px)',
              animation: 'organicFlameBlob3 1.7s ease-in-out infinite alternate',
            }}
          />
          <div
            className="w-12 h-9 bg-white/95 rounded-full shadow-[0_0_12px_#ffcc00] will-change-flame"
            style={{
              filter: 'blur(3px)',
              animation: 'organicFlameBlob3 1.4s ease-in-out infinite alternate 0.25s',
            }}
          />
          <div
            className="w-9 h-7 bg-amber-200 rounded-full will-change-flame"
            style={{
              filter: 'blur(3.5px)',
              animation: 'organicFlameBlob3 1.8s ease-in-out infinite alternate 0.5s',
            }}
          />
        </div>

        {/* Layer 4: Left & Right Side Perimeter Flame Licks */}
        <div
          className="absolute -left-1 bottom-4 top-10 w-2.5 rounded-l-full will-change-flame"
          style={{
            background: 'linear-gradient(to top, #ff3300, #ff9900 65%, transparent)',
            filter: 'blur(3px)',
            animation: 'flameSideLickLeft 2.4s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute -right-1 bottom-4 top-10 w-2.5 rounded-r-full will-change-flame"
          style={{
            background: 'linear-gradient(to top, #ff3300, #ff9900 65%, transparent)',
            filter: 'blur(3px)',
            animation: 'flameSideLickRight 2.1s ease-in-out infinite alternate',
          }}
        />

        {/* Layer 5: Floating Micro Particle Embers (Ascending freely at 60fps) */}
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {embers.map((emb) => (
            <span
              key={emb.id}
              className="absolute rounded-full pointer-events-none will-change-flame"
              style={{
                left: emb.left,
                bottom: '2px',
                width: `${emb.size}px`,
                height: `${emb.size * 1.25}px`,
                backgroundColor: emb.isGold ? '#fff176' : '#ff9800',
                boxShadow: emb.isGold
                  ? '0 0 6px #ffee58, 0 0 10px #ff6d00'
                  : '0 0 6px #ff7043, 0 0 10px #d50000',
                animation: `organicEmberParticle ${emb.duration}s cubic-bezier(0.22, 0.61, 0.36, 1) infinite`,
                animationDelay: `${emb.delay}s`,
                opacity: emb.opacity,
                '--drift-x': `${emb.drift}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Layer 6: Incandescent Glowing Fire Border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none will-change-flame"
          style={{
            border: '1.5px solid rgba(255, 120, 0, 0.75)',
            boxShadow:
              'inset 0 0 14px rgba(255, 80, 0, 0.25), 0 0 16px rgba(255, 100, 0, 0.45)',
            animation: 'flameBorderBreathe 2.2s ease-in-out infinite',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* INNER CARD BODY                                                           */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100/90 shadow-sm group-hover:shadow-xl transition-shadow duration-300">
        {/* Poster Image Container */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Venue / City Badge */}
          {event.topBadge && (
            <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center">
              <span className="bg-[#026cdf]/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide uppercase shadow-sm">
                {event.topBadge}
              </span>

              {hasFireEffect && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                  <Flame className="w-3 h-3 fill-current text-yellow-300" />
                  <span>EM ALTA</span>
                </span>
              )}
            </div>
          )}

          {/* Bottom Tag Badge */}
          {event.badge && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
              <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md shadow-sm">
                {event.badge}
              </span>
            </div>
          )}

          {/* Overlay hover CTA */}
          <div className="absolute inset-0 bg-[#026cdf]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-white text-[#026cdf] text-xs font-bold px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
              <Ticket className="h-3.5 w-3.5 stroke-[2.2]" />
              Comprar / Detalhes
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
          <div>
            <h3
              id={`event-title-${event.id}`}
              className="text-sm sm:text-base font-bold text-gray-900 leading-snug group-hover:text-[#026cdf] transition-colors line-clamp-2"
            >
              {event.title}
            </h3>
            <p
              id={`event-city-${event.id}`}
              className="mt-1 text-xs text-gray-500 font-medium line-clamp-1"
            >
              {event.city}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-normal">A partir de</span>
            <span className="font-bold text-gray-900">
              R$ {event.priceStart.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

