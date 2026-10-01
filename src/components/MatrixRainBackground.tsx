import React, { useEffect, useRef } from 'react';

interface MatrixRainBackgroundProps {
  className?: string;
  opacity?: number;
  fontSize?: number;
  color?: string;
  speed?: number;
}

export const MatrixRainBackground: React.FC<MatrixRainBackgroundProps> = ({
  className = '',
  opacity = 0.75,
  fontSize = 14,
  color = '#00ff66',
  speed = 33,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;

    // Characters for the matrix rain: Katakana, latin, numbers, cyber symbols
    const chars = '0123456789ABCDEFVIGARISTAXZØ10101010日月火水木金土ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
    const charArray = chars.split('');

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let columns = Math.floor(width / fontSize);
    let drops: number[] = [];

    // Initialize drops at random y positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50);
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -50);
      }
    };

    window.addEventListener('resize', handleResize);

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (currentTime - lastTime < speed) {
        return;
      }
      lastTime = currentTime;

      // Dark fade trail
      ctx.fillStyle = 'rgba(2, 6, 4, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Lead character is bright white-green, body is neon green
        if (Math.random() > 0.85) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00ff66';
        } else {
          ctx.fillStyle = color;
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#00cc55';
        }

        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        // Reset drop when it reaches bottom or randomly
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [fontSize, color, speed]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle CRT scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 3px)',
        }}
      />
    </div>
  );
};
