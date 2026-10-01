import React from 'react';

export const RickAndMortyIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer Interdimensional Portal Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/30 via-lime-400/40 to-green-500/30 blur-md animate-pulse" />
      
      {/* SVG Cartoon Artwork: Rick and Morty with Portal */}
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(57,255,20,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="portalGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d9f99d" />
            <stop offset="35%" stopColor="#4ade80" />
            <stop offset="70%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#052e16" />
          </radialGradient>
          <linearGradient id="rickHair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cffafe" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <linearGradient id="mortyHair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#592408" />
          </linearGradient>
        </defs>

        {/* Swirling Portal Disc */}
        <circle cx="80" cy="80" r="74" fill="url(#portalGrad)" />
        <circle cx="80" cy="80" r="74" stroke="#86efac" strokeWidth="2.5" strokeDasharray="6 4" />
        
        {/* Portal swirls / energy streaks */}
        <path
          d="M 30 80 Q 80 40 130 80 Q 80 120 30 80"
          stroke="#bbf7d0"
          strokeWidth="2"
          opacity="0.6"
          strokeDasharray="4 6"
        />
        <circle cx="80" cy="80" r="48" stroke="#a7f3d0" strokeWidth="1.5" opacity="0.5" />
        <circle cx="80" cy="80" r="28" fill="#ecfdf5" opacity="0.25" />

        {/* ----------------- MORTY (Right Side) ----------------- */}
        <g transform="translate(10, 8)">
          {/* Morty Shirt (Yellow) */}
          <path d="M 85 110 Q 102 102 120 110 L 122 145 L 83 145 Z" fill="#fde047" />
          <path d="M 98 110 Q 102 114 106 110" stroke="#ca8a04" strokeWidth="1.5" fill="none" />

          {/* Morty Neck */}
          <rect x="98" y="96" width="9" height="15" fill="#fcd34d" rx="2" />

          {/* Morty Ears */}
          <ellipse cx="86" cy="86" rx="4" ry="5" fill="#fed7aa" />
          <ellipse cx="118" cy="86" rx="4" ry="5" fill="#fed7aa" />

          {/* Morty Hair (Round Brown Dome) */}
          <ellipse cx="102" cy="74" rx="18" ry="18" fill="url(#mortyHair)" />

          {/* Morty Face */}
          <circle cx="102" cy="84" r="15" fill="#fed7aa" />

          {/* Morty Eyes (Big round worried) */}
          <circle cx="97" cy="82" r="5" fill="#ffffff" stroke="#1f2937" strokeWidth="1" />
          <circle cx="97" cy="82" r="1.5" fill="#111827" />
          <circle cx="108" cy="82" r="5" fill="#ffffff" stroke="#1f2937" strokeWidth="1" />
          <circle cx="108" cy="82" r="1.5" fill="#111827" />

          {/* Morty Eyebrows (Worried slant) */}
          <path d="M 93 75 Q 97 78 100 76" stroke="#592408" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 105 76 Q 108 78 112 75" stroke="#592408" strokeWidth="1.5" strokeLinecap="round" />

          {/* Morty Nose & Wobbly Mouth */}
          <path d="M 102 84 Q 100 87 102 88" stroke="#ea580c" strokeWidth="1" fill="none" />
          <path d="M 98 92 Q 102 90 106 92" stroke="#991b1b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>

        {/* ----------------- RICK (Left Side, Foreground) ----------------- */}
        <g transform="translate(-4, 0)">
          {/* Rick Lab Coat (White with Cyan Shirt inside) */}
          <path d="M 32 108 Q 52 98 72 108 L 74 148 L 30 148 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          {/* Inner Teal Shirt */}
          <polygon points="46,108 58,108 55,138 49,138" fill="#38bdf8" />

          {/* Rick Spiky Cyan Hair */}
          <polygon
            points="
              48,26 40,36 30,30 32,44 20,44 26,56 16,62 26,72 18,82 28,88 
              38,98 48,102 62,102 74,96 82,86 86,74 80,60 84,48 74,42 76,28 64,36 56,24
            "
            fill="url(#rickHair)"
            stroke="#0284c7"
            strokeWidth="1.2"
          />

          {/* Rick Ears */}
          <ellipse cx="32" cy="74" rx="4" ry="5.5" fill="#fed7aa" />
          <ellipse cx="72" cy="74" rx="4" ry="5.5" fill="#fed7aa" />

          {/* Rick Face (Longer Oval) */}
          <ellipse cx="52" cy="74" rx="19" ry="24" fill="#fef08a" opacity="0.2" />
          <rect x="36" y="54" width="32" height="38" rx="16" fill="#fed7aa" />

          {/* Rick Unibrow (Iconic Cyan line) */}
          <path
            d="M 40 63 Q 52 59 64 63"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Rick Big Bored Eyes */}
          <circle cx="44" cy="72" r="6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.2" />
          <circle cx="44" cy="72" r="1.5" fill="#0f172a" />
          <circle cx="59" cy="72" r="6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.2" />
          <circle cx="59" cy="72" r="1.5" fill="#0f172a" />

          {/* Eye Bags */}
          <path d="M 40 79 Q 44 82 48 80" stroke="#ca8a04" strokeWidth="1" fill="none" opacity="0.7" />
          <path d="M 55 80 Q 59 82 63 79" stroke="#ca8a04" strokeWidth="1" fill="none" opacity="0.7" />

          {/* Rick Nose */}
          <path d="M 52 72 L 50 78 L 54 78" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Rick Mouth & Spittle Drool */}
          <path d="M 44 86 Q 52 89 60 86" stroke="#713f12" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Toxic Green Drool */}
          <path d="M 45 87 Q 44 92 46 94 Q 48 93 47 88" fill="#4ade80" stroke="#16a34a" strokeWidth="0.8" />
        </g>

        {/* Sci-fi Portal Sparkles */}
        <circle cx="28" cy="40" r="2" fill="#a7f3d0" className="animate-ping" />
        <circle cx="132" cy="50" r="1.8" fill="#fef08a" />
        <circle cx="120" cy="122" r="2.2" fill="#86efac" />
        <circle cx="35" cy="120" r="1.5" fill="#a7f3d0" />
      </svg>
    </div>
  );
};
