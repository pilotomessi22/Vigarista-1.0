import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number; // depth layer: 0.4 to 1.3
  width: number;
  height: number;
  vy: number; // vertical speed
  vx: number; // horizontal drift
  rotZ: number; // 2D rotation angle (radians)
  rotZSpeed: number;
  rotY: number; // 3D flip angle (radians)
  rotYSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  type: 'bill' | 'coin';
  opacity: number;
}

interface MoneyRainCanvasProps {
  className?: string;
  density?: number; // default 38
}

export const MoneyRainCanvas: React.FC<MoneyRainCanvasProps> = ({
  className = '',
  density = 42,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let lastTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particle pool
    const particles: Particle[] = [];
    const count = Math.max(25, Math.min(density, 60));

    for (let i = 0; i < count; i++) {
      const isCoin = i % 5 === 0;
      const z = 0.45 + Math.random() * 0.75; // scale factor
      particles.push({
        x: Math.random() * (width || 400),
        y: Math.random() * (height || 800) - (height || 800),
        z,
        width: isCoin ? 16 * z : 38 * z,
        height: isCoin ? 16 * z : 20 * z,
        vy: (1.2 + Math.random() * 2.2) * z * 60, // pixels per second
        vx: (Math.random() - 0.5) * 0.8 * 60,
        rotZ: Math.random() * Math.PI * 2,
        rotZSpeed: (Math.random() - 0.5) * 2.5,
        rotY: Math.random() * Math.PI * 2,
        rotYSpeed: 1.8 + Math.random() * 3.2,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.5 + Math.random() * 2.0,
        swayAmp: 18 * z + Math.random() * 14,
        type: isCoin ? 'coin' : 'bill',
        opacity: Math.min(1, 0.4 + z * 0.55),
      });
    }

    const drawDollarBill = (
      context: CanvasRenderingContext2D,
      w: number,
      h: number,
      opacity: number
    ) => {
      // Outer border (Emerald Green Banknote)
      context.fillStyle = `rgba(16, 185, 129, ${opacity * 0.95})`;
      context.beginPath();
      context.roundRect(-w / 2, -h / 2, w, h, 2.5);
      context.fill();

      // Inner banknote frame
      context.fillStyle = `rgba(6, 78, 59, ${opacity * 0.98})`;
      context.beginPath();
      context.roundRect(-w / 2 + 1.5, -h / 2 + 1.5, w - 3, h - 3, 2);
      context.fill();

      // Inner delicate border
      context.strokeStyle = `rgba(52, 211, 153, ${opacity * 0.85})`;
      context.lineWidth = 0.8;
      context.strokeRect(-w / 2 + 3, -h / 2 + 2.5, w - 6, h - 5);

      // Central Emblem Oval ($100)
      context.fillStyle = `rgba(16, 185, 129, ${opacity * 0.9})`;
      context.beginPath();
      context.ellipse(0, 0, w * 0.24, h * 0.38, 0, 0, Math.PI * 2);
      context.fill();

      // $ symbol in center
      context.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
      context.font = `bold ${Math.max(7, Math.floor(h * 0.55))}px monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('$', 0, 0.5);

      // Corner "100" numbers
      if (w > 26) {
        context.font = `bold ${Math.max(5, Math.floor(h * 0.28))}px sans-serif`;
        context.fillStyle = `rgba(167, 243, 208, ${opacity * 0.9})`;
        context.textAlign = 'left';
        context.fillText('100', -w / 2 + 3.5, -h / 2 + 6.5);
        context.textAlign = 'right';
        context.fillText('100', w / 2 - 3.5, h / 2 - 4.5);
      }
    };

    const drawGoldCoin = (
      context: CanvasRenderingContext2D,
      r: number,
      opacity: number
    ) => {
      // Golden Rim
      context.fillStyle = `rgba(245, 158, 11, ${opacity * 0.95})`;
      context.beginPath();
      context.arc(0, 0, r, 0, Math.PI * 2);
      context.fill();

      // Inner Golden Face
      context.fillStyle = `rgba(251, 191, 36, ${opacity * 0.98})`;
      context.beginPath();
      context.arc(0, 0, r * 0.82, 0, Math.PI * 2);
      context.fill();

      // Embossed $
      context.fillStyle = `rgba(180, 83, 9, ${opacity * 0.95})`;
      context.font = `900 ${Math.max(7, Math.floor(r * 1.1))}px sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('$', 0, 0.5);
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // clamp delta to 100ms
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Render all money particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update kinematics with delta-time for smooth 60-120fps
        p.y += p.vy * dt;
        p.swayPhase += p.swaySpeed * dt;
        p.x += Math.sin(p.swayPhase) * (p.swayAmp * dt * 2.2) + p.vx * dt;
        p.rotZ += p.rotZSpeed * dt;
        p.rotY += p.rotYSpeed * dt;

        // Wrap around bottom to top
        if (p.y > height + 40) {
          p.y = -30 - Math.random() * 60;
          p.x = Math.random() * width;
          p.swayPhase = Math.random() * Math.PI * 2;
        }

        // Screen boundary horizontal wrap
        if (p.x < -40) p.x = width + 30;
        if (p.x > width + 40) p.x = -30;

        // 3D Matrix Transformation
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotZ);

        // Simulated 3D Y-Axis spin
        const cosY = Math.cos(p.rotY);
        ctx.scale(Math.max(0.08, Math.abs(cosY)), 1);

        if (p.type === 'bill') {
          drawDollarBill(ctx, p.width, p.height, p.opacity);
        } else {
          drawGoldCoin(ctx, p.width / 2, p.opacity);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ willChange: 'transform' }}
    />
  );
};
