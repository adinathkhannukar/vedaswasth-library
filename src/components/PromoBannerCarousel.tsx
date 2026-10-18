import React, { useState, useEffect } from 'react';
import { PromoBanner } from '../types';
import { getStoredPromos, getPromoEnabled } from '../lib/storage';
import { ChevronLeft, ChevronRight, X, ExternalLink, Sparkles } from 'lucide-react';

export const PromoBannerCarousel: React.FC = () => {
  const [promos, setPromos] = useState<PromoBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const enabled = getPromoEnabled();
    if (!enabled) {
      setIsVisible(false);
      return;
    }
    const all = getStoredPromos().filter(p => p.active);
    setPromos(all);
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!isVisible || promos.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isVisible, promos.length, isPaused]);

  if (!isVisible || promos.length === 0) return null;

  const currentPromo = promos[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + promos.length) % promos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % promos.length);
  };

  const handleClickBanner = () => {
    if (currentPromo.linkUrl) {
      window.open(currentPromo.linkUrl, '_blank');
    }
  };

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-lg border border-[#d4cbb3] bg-gradient-to-r from-[#064e3b] to-[#047857] text-[#f4ecd8] transition-all group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors shadow-sm"
        title="Hide Promotion"
      >
        <X className="w-4 h-4" />
      </button>

      <div 
        onClick={handleClickBanner}
        className="cursor-pointer flex flex-col md:flex-row items-center relative min-h-[220px]"
      >
        {/* Background Image / Poster */}
        {currentPromo.imageUrl && (
          <div className="absolute inset-0 opacity-25 md:opacity-35 mix-blend-overlay overflow-hidden">
            <img 
              src={currentPromo.imageUrl} 
              alt={currentPromo.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        <div className="relative z-10 p-6 sm:p-10 flex-1 space-y-4 max-w-2xl">
          {currentPromo.badgeText && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#fbbf24] text-[#064e3b] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentPromo.badgeText}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {currentPromo.title}
            </h3>
            <p className="text-sm sm:text-base text-[#d1fae5] leading-relaxed line-clamp-2">
              {currentPromo.subtitle}
            </p>
          </div>

          {currentPromo.buttonText && (
            <div className="pt-2">
              <span className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#fbbf24] text-[#064e3b] rounded-xl font-bold text-sm hover:bg-[#f59e0b] transition-colors shadow-md">
                <span>{currentPromo.buttonText}</span>
                <ExternalLink className="w-4 h-4" />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slider Controls (if multiple promos) */}
      {promos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors opacity-75 group-hover:opacity-100 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-12 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors opacity-75 group-hover:opacity-100 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-6 z-20 flex items-center space-x-1.5">
            {promos.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-[#fbbf24]' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
