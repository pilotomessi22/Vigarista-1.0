import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BANNER_SLIDES } from '../data/mockData';
import { BannerSlide } from '../types';

interface HeroCarouselProps {
  onSelectSlide: (slide: BannerSlide) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelectSlide }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const activeSlide = BANNER_SLIDES[currentIndex];

  return (
    <div className="relative w-full overflow-hidden bg-gray-950 select-none">
      {/* Aspect Ratio Container for mobile layout */}
      <div className="relative h-[250px] w-full">
        {/* Background Image with smooth transition */}
        {BANNER_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="h-full w-full object-cover object-center filter brightness-[0.75]"
            />
            {/* Dark & Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
          </div>
        ))}

        {/* Content Container */}
        <div className="relative z-20 mx-auto flex h-full w-full flex-col justify-end px-4 pb-6 text-white">
          <div className="max-w-xl space-y-1.5">
            <h1
              id="hero-banner-title"
              className="text-xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md"
            >
              {activeSlide.title}
            </h1>

            {activeSlide.subtitle && (
              <p
                id="hero-banner-subtitle"
                className="text-xs font-semibold text-gray-200 drop-shadow-xs"
              >
                {activeSlide.subtitle}
              </p>
            )}

            <div className="pt-2">
              <button
                id="hero-banner-comprar-btn"
                onClick={() => onSelectSlide(activeSlide)}
                className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-sm sm:text-base font-black tracking-wide text-[#026cdf] shadow-lg transition-transform hover:scale-105 active:scale-95 uppercase"
              >
                {activeSlide.buttonText}
              </button>
            </div>
          </div>
        </div>

        {/* Previous Button */}
        <button
          id="hero-prev-btn"
          onClick={handlePrev}
          aria-label="Slide anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition-colors hover:bg-black/70"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Next Button */}
        <button
          id="hero-next-btn"
          onClick={handleNext}
          aria-label="Próximo slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition-colors hover:bg-black/70"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Pagination Dots (matching video timestamp 00:00 - 00:06) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {BANNER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir para slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-2.5 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
