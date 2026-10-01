import React from 'react';

interface QuentroLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  textColor?: string;
}

export const QuentroLogo: React.FC<QuentroLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  textColor = 'text-white',
}) => {
  // Height and width scaled to tightly match font cap-height
  const iconHeight = size === 'sm' ? 18 : size === 'lg' ? 28 : size === 'xl' ? 36 : 24;
  const iconWidth = Math.round(iconHeight * (44 / 54)); // precise aspect ratio
  
  const textSize =
    size === 'sm'
      ? 'text-[17px]'
      : size === 'lg'
      ? 'text-[25px]'
      : size === 'xl'
      ? 'text-[30px]'
      : 'text-[22px]';

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* 1. Official Quentro Wordmark */}
      {showWordmark && (
        <span
          className={`font-sans font-bold tracking-[-0.03em] leading-none ${textSize} ${textColor}`}
          style={{
            fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
          }}
        >
          Quentro
        </span>
      )}

      {/* 2. Official Vector Quentro Origami Ribbon Arrow (Tight Bounding Box matching IMG_7403.png & 5D3D79B8-B5AA-47F0-B22C-01258169919D.jpeg) */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="26 22 45 55"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 translate-y-[1px]"
      >
        <defs>
          {/* Top/Front cyan-mint vibrant gradient (IMG_7403.png: bright cyan to emerald-mint) */}
          <linearGradient id="quentro-main-cyan" x1="30%" y1="20%" x2="70%" y2="60%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="45%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="#1DF8BA" />
          </linearGradient>

          {/* Bottom flap azure-blue gradient (IMG_7403.png: vivid blue under fold) */}
          <linearGradient id="quentro-tail-blue" x1="20%" y1="90%" x2="60%" y2="40%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="60%" stopColor="#0090F5" />
            <stop offset="100%" stopColor="#006EE0" />
          </linearGradient>

          {/* Subtle natural fold shadow giving the origami 3D overlap effect */}
          <filter id="quentro-fold-depth" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="-1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Layer 1: Bottom Blue Ribbon Segment (slanted up-right from lower left) */}
        <path
          d="M 33.5 67.5 L 50.2 50.8 C 50.8 54.0 50.6 59.2 48.0 66.5 L 38.6 74.8 C 36.2 76.8 32.6 76.5 30.6 74.0 C 28.6 71.5 29.0 68.0 31.4 66.0 L 33.5 67.5 Z"
          fill="url(#quentro-tail-blue)"
        />

        {/* Layer 2: Main Continuous Cyan-Turquoise Folded Arrow (pointing right) */}
        <path
          d="M 37.5 31.5 C 35.8 28.5 38.0 24.2 41.5 25.0 C 44.2 25.6 46.5 27.8 49.5 30.5 C 55.5 36.0 62.5 42.5 67.5 48.5 C 70.0 51.5 70.0 54.5 67.5 57.5 C 62.5 63.5 55.0 69.5 48.0 66.5 C 51.5 60.5 52.2 55.5 50.2 50.8 C 46.5 42.5 41.5 36.5 37.5 31.5 Z"
          fill="url(#quentro-main-cyan)"
          filter="url(#quentro-fold-depth)"
        />
      </svg>
    </div>
  );
};


