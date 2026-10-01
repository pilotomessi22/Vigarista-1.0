import React from 'react';

interface AnonymousMaskIllustrationProps {
  className?: string;
  glowColor?: string;
}

export const AnonymousMaskIllustration: React.FC<AnonymousMaskIllustrationProps> = ({
  className = 'w-24 h-24',
  glowColor = '#00ff66',
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer cyber glow aura */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />

      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]"
      >
        <defs>
          <linearGradient id="maskFaceGrad" x1="100" y1="20" x2="100" y2="185" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="60%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>

          <linearGradient id="hoodGrad" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0b0f0d" />
            <stop offset="100%" stopColor="#020403" />
          </linearGradient>

          <filter id="neonGlowEye" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hacker Hood / Silhouette in background */}
        <path
          d="M100 15 C45 15 25 55 20 120 C18 145 28 175 45 190 C60 198 140 198 155 190 C172 175 182 145 180 120 C175 55 155 15 100 15 Z"
          fill="url(#hoodGrad)"
          stroke="#00ff66"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Mask Head Base Shape */}
        <path
          d="M100 35 C65 35 48 55 48 95 C48 135 70 170 100 182 C130 170 152 135 152 95 C152 55 135 35 100 35 Z"
          fill="url(#maskFaceGrad)"
          stroke="#111827"
          strokeWidth="2"
        />

        {/* Hair and temple contours */}
        <path
          d="M48 95 C46 65 60 40 100 38 C140 40 154 65 152 95 C146 72 132 50 100 48 C68 50 54 72 48 95 Z"
          fill="#111827"
        />

        {/* Rosy Cheeks (Iconic Fawkes characteristic) */}
        <ellipse cx="64" cy="118" rx="8" ry="5" fill="#f87171" opacity="0.35" />
        <ellipse cx="136" cy="118" rx="8" ry="5" fill="#f87171" opacity="0.35" />

        {/* High Arched Eyebrows */}
        <path
          d="M58 80 C68 68 84 72 90 82"
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M142 80 C132 68 116 72 110 82"
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Eyes (Narrow, smiling slants with glowing neon pupil) */}
        {/* Left Eye Cutout */}
        <path
          d="M62 90 C70 85 82 86 86 92 C80 94 68 94 62 90 Z"
          fill="#0a0a0a"
        />
        <circle cx="74" cy="89" r="2.5" fill={glowColor} filter="url(#neonGlowEye)" />

        {/* Right Eye Cutout */}
        <path
          d="M138 90 C130 85 118 86 114 92 C120 94 132 94 138 90 Z"
          fill="#0a0a0a"
        />
        <circle cx="126" cy="89" r="2.5" fill={glowColor} filter="url(#neonGlowEye)" />

        {/* Aquiline Nose */}
        <path
          d="M100 78 L98 116 L104 116"
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Iconic Thin Upturned Mustache */}
        <path
          d="M56 120 C72 128 88 126 100 131 C112 126 128 128 144 120 C134 135 114 135 100 133 C86 135 66 135 56 120 Z"
          fill="#111827"
        />
        {/* Curled mustache tips */}
        <path
          d="M56 120 C52 115 52 108 58 107"
          stroke="#111827"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M144 120 C148 115 148 108 142 107"
          stroke="#111827"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Enigmatic Smiling Thin Red Lips */}
        <path
          d="M74 142 C86 149 114 149 126 142"
          stroke="#991b1b"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Pointed Goatee / Beard */}
        <path
          d="M96 150 L104 150 L100 172 Z"
          fill="#111827"
        />

        {/* Cyber Circuit Lines on Hood & Mask */}
        <path
          d="M32 90 L42 90 L48 100"
          stroke={glowColor}
          strokeWidth="1.2"
          strokeOpacity="0.7"
          strokeDasharray="2 3"
        />
        <circle cx="32" cy="90" r="1.5" fill={glowColor} />

        <path
          d="M168 90 L158 90 L152 100"
          stroke={glowColor}
          strokeWidth="1.2"
          strokeOpacity="0.7"
          strokeDasharray="2 3"
        />
        <circle cx="168" cy="90" r="1.5" fill={glowColor} />

        {/* Cyber badge text at bottom */}
        <text
          x="100"
          y="194"
          fill={glowColor}
          fontSize="7"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="2"
          opacity="0.9"
        >
          ANONYMOUS
        </text>
      </svg>
    </div>
  );
};
