import React, { useEffect, useRef } from 'react';

interface MoneyBill {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  vy: number;
  vx: number;
  rotZ: number;
  rotZSpeed: number;
  rotY: number;
  rotYSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  opacity: number;
}

interface RedEmber {
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  alpha: number;
  maxAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface VigaristaBackgroundCanvasProps {
  className?: string;
  enableBanknotes?: boolean;
  enableEmbers?: boolean;
}

export const VigaristaBackgroundCanvas: React.FC<VigaristaBackgroundCanvasProps> = ({
  className = '',
  enableBanknotes = true,
  enableEmbers = true,
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

    // Initialize R$ 100 Brazilian Real Banknotes
    const bills: MoneyBill[] = [];
    const billCount = 18;

    if (enableBanknotes) {
      for (let i = 0; i < billCount; i++) {
        const z = 0.5 + Math.random() * 0.7; // depth
        bills.push({
          x: Math.random() * (width || 400),
          y: Math.random() * (height || 800) - (height || 800),
          z,
          width: 52 * z,
          height: 27 * z,
          vy: (0.9 + Math.random() * 1.5) * z * 60,
          vx: (Math.random() - 0.5) * 0.6 * 60,
          rotZ: Math.random() * Math.PI * 2,
          rotZSpeed: (Math.random() - 0.5) * 1.8,
          rotY: Math.random() * Math.PI * 2,
          rotYSpeed: 1.2 + Math.random() * 2.5,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 1.2 + Math.random() * 1.6,
          swayAmp: 22 * z + Math.random() * 16,
          opacity: Math.min(0.85, 0.35 + z * 0.45),
        });
      }
    }

    // Initialize Gentle Soft Red Floating Embers / Sparks
    const embers: RedEmber[] = [];
    const emberCount = 35;

    if (enableEmbers) {
      for (let i = 0; i < emberCount; i++) {
        embers.push({
          x: Math.random() * (width || 400),
          y: Math.random() * (height || 800),
          radius: 1.2 + Math.random() * 2.8,
          vy: -(0.3 + Math.random() * 0.7) * 60, // float upwards gently
          vx: (Math.random() - 0.5) * 0.3 * 60,
          alpha: Math.random() * 0.6,
          maxAlpha: 0.3 + Math.random() * 0.5,
          pulseSpeed: 1.5 + Math.random() * 2.5,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Draw realistic R$ 100 Banknote (Brazilian Real Cyan/Teal aesthetic)
    const drawReal100Bill = (
      context: CanvasRenderingContext2D,
      w: number,
      h: number,
      opacity: number
    ) => {
      // Outer border (Cyan-blue gradient base)
      context.fillStyle = `rgba(14, 116, 144, ${opacity * 0.95})`; // cyan-700
      context.beginPath();
      context.roundRect(-w / 2, -h / 2, w, h, 2);
      context.fill();

      // Inner note body (Crisp teal-blue 100 Reais hue)
      context.fillStyle = `rgba(6, 182, 212, ${opacity * 0.85})`; // cyan-500
      context.beginPath();
      context.roundRect(-w / 2 + 1.2, -h / 2 + 1.2, w - 2.4, h - 2.4, 1.5);
      context.fill();

      // Darker shading band
      context.fillStyle = `rgba(8, 51, 68, ${opacity * 0.6})`; // cyan-950
      context.fillRect(-w * 0.15, -h / 2 + 1.5, w * 0.3, h - 3);

      // Delicate inner border line
      context.strokeStyle = `rgba(165, 243, 252, ${opacity * 0.75})`; // cyan-200
      context.lineWidth = 0.6;
      context.strokeRect(-w / 2 + 2.5, -h / 2 + 2, w - 5, h - 4);

      // Watermark oval / Effigy medallion
      context.fillStyle = `rgba(14, 116, 144, ${opacity * 0.75})`;
      context.beginPath();
      context.ellipse(-w * 0.22, 0, w * 0.16, h * 0.36, 0, 0, Math.PI * 2);
      context.fill();

      // "100" Number Top Left & Bottom Right
      if (w > 24) {
        context.font = `900 ${Math.max(6, Math.floor(h * 0.4))}px sans-serif`;
        context.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('100', -w / 2 + 3, -h / 2 + 3);

        context.textAlign = 'right';
        context.textBaseline = 'bottom';
        context.fillText('100', w / 2 - 3, h / 2 - 2);

        // Small "REAIS" text
        if (w > 36) {
          context.font = `700 ${Math.max(4, Math.floor(h * 0.18))}px sans-serif`;
          context.fillStyle = `rgba(207, 250, 254, ${opacity * 0.85})`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText('REAIS', w * 0.2, 0);
        }
      }
    };

    // Draw Soft Glowing Red Embers
    const drawEmber = (
      context: CanvasRenderingContext2D,
      ember: RedEmber
    ) => {
      const currentAlpha =
        ember.maxAlpha * (0.6 + 0.4 * Math.sin(ember.pulsePhase));

      // Outer gentle glow
      const grad = context.createRadialGradient(
        ember.x,
        ember.y,
        0,
        ember.x,
        ember.y,
        ember.radius * 2.8
      );
      grad.addColorStop(0, `rgba(255, 68, 68, ${currentAlpha})`);
      grad.addColorStop(0.5, `rgba(239, 68, 68, ${currentAlpha * 0.45})`);
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      context.fillStyle = grad;
      context.beginPath();
      context.arc(ember.x, ember.y, ember.radius * 2.8, 0, Math.PI * 2);
      context.fill();

      // Bright core
      context.fillStyle = `rgba(255, 200, 200, ${currentAlpha * 0.9})`;
      context.beginPath();
      context.arc(ember.x, ember.y, ember.radius * 0.6, 0, Math.PI * 2);
      context.fill();
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // 1. Render Red Embers (Floating gently from bottom to top)
      if (enableEmbers) {
        for (let i = 0; i < embers.length; i++) {
          const emb = embers[i];
          emb.y += emb.vy * dt;
          emb.x += emb.vx * dt;
          emb.pulsePhase += emb.pulseSpeed * dt;

          // Wrap around top to bottom
          if (emb.y < -15) {
            emb.y = height + 10;
            emb.x = Math.random() * width;
          }
          if (emb.x < -10) emb.x = width + 5;
          if (emb.x > width + 10) emb.x = -5;

          drawEmber(ctx, emb);
        }
      }

      // 2. Render R$ 100 Banknotes (Falling with realistic 3D tumble)
      if (enableBanknotes) {
        for (let i = 0; i < bills.length; i++) {
          const b = bills[i];

          b.y += b.vy * dt;
          b.swayPhase += b.swaySpeed * dt;
          b.x += Math.sin(b.swayPhase) * (b.swayAmp * dt * 2.2) + b.vx * dt;
          b.rotZ += b.rotZSpeed * dt;
          b.rotY += b.rotYSpeed * dt;

          // Wrap around bottom to top
          if (b.y > height + 40) {
            b.y = -30 - Math.random() * 60;
            b.x = Math.random() * width;
            b.swayPhase = Math.random() * Math.PI * 2;
          }

          if (b.x < -40) b.x = width + 30;
          if (b.x > width + 40) b.x = -30;

          // 3D Canvas Transform
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rotZ);

          const cosY = Math.cos(b.rotY);
          ctx.scale(Math.max(0.08, Math.abs(cosY)), 1);

          drawReal100Bill(ctx, b.width, b.height, b.opacity);
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enableBanknotes, enableEmbers]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ willChange: 'transform' }}
    />
  );
};
