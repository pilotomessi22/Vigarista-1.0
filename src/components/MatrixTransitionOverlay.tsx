import React, { useEffect, useState } from 'react';
import { MatrixRainBackground } from './MatrixRainBackground';
import { hackerAudio } from '../utils/hackerAudio';

interface MatrixTransitionOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  duration?: number;
}

export const MatrixTransitionOverlay: React.FC<MatrixTransitionOverlayProps> = ({
  isOpen,
  onComplete,
  duration = 650,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsFadingOut(false);
      return;
    }

    setIsFadingOut(false);

    // Play cyber hacker access audio effect
    hackerAudio.playHackerAccessSound();

    // Trigger fade-out slightly before completion for seamless crossfade
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(duration - 250, 300));

    // Complete transition
    const endTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [isOpen, duration, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      id="matrix-blur-transition"
      className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center transition-all duration-300 ease-out ${
        isFadingOut ? 'opacity-0 backdrop-blur-none' : 'opacity-100 backdrop-blur-xl'
      } bg-[#06080d]/85`}
      style={{
        transitionProperty: 'opacity, backdrop-filter',
      }}
    >
      {/* Descending Matrix Green Rain (Smooth aesthetic streaming) */}
      <MatrixRainBackground opacity={0.7} color="#00ff66" speed={28} fontSize={16} />

      {/* Gentle radial center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 255, 102, 0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
