import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface DynamicQrCodeProps {
  value: string;
  size?: number;
  showScanBar?: boolean;
  color?: string;
  bgColor?: string;
  className?: string;
}

export const DynamicQrCode: React.FC<DynamicQrCodeProps> = ({
  value,
  size = 150,
  showScanBar = true,
  color = '#000000',
  bgColor = '#FFFFFF',
  className = '',
}) => {
  // Timestamp ticker to emulate live dynamic token rotation
  const [tokenSeed, setTokenSeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokenSeed((prev) => (prev + 1) % 100);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div
        className="p-2 rounded-xl relative overflow-hidden flex flex-col items-center"
        style={{ backgroundColor: bgColor }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={color}
          level="M"
          includeMargin={false}
        />

        {/* Dynamic moving scan / security laser line bar */}
        {showScanBar && (
          <div className="w-full mt-2 relative h-1.5 bg-zinc-200/80 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-1/3 rounded-full animate-pulse"
              style={{
                background: 'linear-gradient(90deg, #00D2B4, #00B4D8, #0077B6)',
                animation: 'slideBeam 2s ease-in-out infinite alternate',
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideBeam {
          0% {
            left: 0%;
            transform: translateX(0%);
          }
          100% {
            left: 100%;
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

