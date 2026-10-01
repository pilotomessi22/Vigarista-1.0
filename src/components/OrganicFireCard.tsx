import React, { useMemo } from 'react';

interface OrganicFireCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'high' | 'medium';
}

export const OrganicFireCard: React.FC<OrganicFireCardProps> = ({
  children,
  className = '',
}) => {
  // Generate random deterministic sparks/embers for this card
  const embers = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${6 + (i * 8.2) + ((i % 3) * 2)}%`,
      size: 2 + (i % 3) * 1.5,
      delay: (i * 0.45) % 4,
      duration: 2.2 + (i % 4) * 0.6,
      opacity: 0.6 + ((i % 5) * 0.08),
      drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 5),
    }));
  }, []);

  return (
    <div className={`relative group/fire rounded-2xl overflow-visible isolate ${className}`}>
      {/* 1. AMBIENT FLAME HEAT HAZE (Soft radiating warm backlight) */}
      <div 
        className="absolute -inset-2.5 rounded-3xl opacity-75 pointer-events-none z-0 transition-opacity duration-500 group-hover/fire:opacity-100"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255, 90, 0, 0.45) 0%, rgba(230, 20, 0, 0.25) 45%, rgba(255, 200, 0, 0.1) 75%, transparent 100%)',
          filter: 'blur(16px)',
          animation: 'flameHeatPulse 2.8s ease-in-out infinite alternate',
        }}
      />

      {/* 2. SILKY ORGANIC BOTTOM LICKING FLAME WAVES */}
      <div className="absolute -bottom-4 -left-2 -right-2 h-20 pointer-events-none z-10 overflow-hidden flex items-end">
        {/* Layer 1: Deep Red Flame Plumes */}
        <svg
          viewBox="0 0 400 80"
          className="absolute bottom-0 left-0 w-full h-16 opacity-80"
          preserveAspectRatio="none"
          style={{ animation: 'flameSwayLayer1 3.2s ease-in-out infinite' }}
        >
          <path
            d="M0,80 L0,45 Q25,10 50,40 T100,25 T150,45 T200,15 T250,40 T300,20 T350,45 T400,30 L400,80 Z"
            fill="url(#fireRedGrad)"
          />
        </svg>

        {/* Layer 2: Radiant Orange Middle Flames */}
        <svg
          viewBox="0 0 400 80"
          className="absolute bottom-0 left-0 w-full h-14 opacity-90"
          preserveAspectRatio="none"
          style={{ animation: 'flameSwayLayer2 2.4s ease-in-out infinite' }}
        >
          <path
            d="M0,80 L0,55 Q30,25 60,45 T120,30 T180,50 T240,25 T300,50 T360,35 T400,55 L400,80 Z"
            fill="url(#fireOrangeGrad)"
          />
        </svg>

        {/* Layer 3: Blazing Golden Core Tongues */}
        <svg
          viewBox="0 0 400 80"
          className="absolute bottom-0 left-0 w-full h-10 opacity-95"
          preserveAspectRatio="none"
          style={{ animation: 'flameSwayLayer3 1.8s ease-in-out infinite' }}
        >
          <path
            d="M0,80 L0,65 Q35,40 70,55 T140,45 T210,60 T280,40 T350,55 T400,60 L400,80 Z"
            fill="url(#fireYellowGrad)"
          />
        </svg>
      </div>

      {/* 3. SIDE FLICKERING FLAME LICKERS (Left & Right Edge Flames) */}
      <div className="absolute top-4 -left-1.5 bottom-6 w-3 pointer-events-none z-10 overflow-visible opacity-80">
        <div 
          className="w-full h-full rounded-l-full"
          style={{
            background: 'linear-gradient(to top, #ff2a00, #ff8c00 60%, transparent)',
            filter: 'blur(3px)',
            animation: 'flameSideLickLeft 2.5s ease-in-out infinite alternate',
          }}
        />
      </div>
      <div className="absolute top-4 -right-1.5 bottom-6 w-3 pointer-events-none z-10 overflow-visible opacity-80">
        <div 
          className="w-full h-full rounded-r-full"
          style={{
            background: 'linear-gradient(to top, #ff2a00, #ff8c00 60%, transparent)',
            filter: 'blur(3px)',
            animation: 'flameSideLickRight 2.2s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* 4. FLOATING RISING EMBER SPARKS (Dancing smoothly upwards) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {embers.map((emb) => (
          <span
            key={emb.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: emb.left,
              bottom: '4px',
              width: `${emb.size}px`,
              height: `${emb.size * 1.3}px`,
              backgroundColor: emb.id % 2 === 0 ? '#ffe600' : '#ff7700',
              boxShadow: `0 0 6px ${emb.id % 2 === 0 ? '#ffea00' : '#ff4400'}, 0 0 10px #ff2200`,
              animation: `emberRise ${emb.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
              animationDelay: `${emb.delay}s`,
              opacity: emb.opacity,
              '--drift-x': `${emb.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 5. LIQUID FIRE INCANDESCENT BORDER (Subtle natural warm border, not a spinning box) */}
      <div 
        className="absolute -inset-[1px] rounded-2xl pointer-events-none z-10"
        style={{
          border: '1.5px solid rgba(255, 120, 0, 0.65)',
          boxShadow: 'inset 0 0 12px rgba(255, 60, 0, 0.25), 0 0 14px rgba(255, 80, 0, 0.35)',
          animation: 'flameBorderBreathe 2s ease-in-out infinite',
        }}
      />

      {/* 6. SVG GRADIENT DEFINITIONS (Shared for all SVG flame layers) */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <linearGradient id="fireRedGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#cc0000" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#ff2200" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#ff6600" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff8800" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fireOrangeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#e63b00" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#ff7b00" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#ffae00" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffd000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fireYellowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff7700" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffcc00" stopOpacity="0.95" />
            <stop offset="90%" stopColor="#fff7a1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 7. INNER CARD CONTENT */}
      <div className="relative z-20 rounded-2xl bg-[#0e1424] h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};
