import React, { useState } from 'react';

interface GosthLogoProps {
  className?: string;
  size?: number | string;
  withGlow?: boolean;
}

export const GosthLogo: React.FC<GosthLogoProps> = ({
  className = 'w-10 h-10',
  size,
  withGlow = true,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {withGlow && (
        <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-rose-500 blur-md rounded-full opacity-70 pointer-events-none" />
      )}
      {!imgError ? (
        <img
          src="/VigaristaLogo.png"
          alt="Logo VIGARISTA Oficial"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full border-2 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.6)] relative z-10"
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_12px_rgba(220,38,38,0.5)]"
        >
          <circle cx="50" cy="50" r="46" stroke="#ef4444" strokeWidth="4" fill="#090a0f" />
          <path d="M25 65 L50 20 L75 65 Z" fill="#ef4444" />
          <path d="M30 45 L70 45" stroke="#ffffff" strokeWidth="4" />
        </svg>
      )}
    </div>
  );
};
