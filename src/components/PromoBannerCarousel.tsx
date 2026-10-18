import React, { useState, useEffect } from 'react';
import { PromoBanner } from '../types';
import { getStoredPromos, getPromoEnabled } from '../lib/storage';
import { getFileFromIDB } from '../lib/idb';
import { ChevronLeft, ChevronRight, X, ExternalLink, Sparkles } from 'lucide-react';

export const PromoBannerCarousel: React.FC = () => {
  const [promos, setPromos] = useState<PromoBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>('');

  useEffect(() => {
    const enabled = getPromoEnabled();
    if (!enabled) {
      setIsVisible(false);
      return;
    }
    const all = getStoredPromos().filter(p => p.active);
    setPromos(all);
  }, []);

  const currentPromo = promos[currentIndex];

  useEffect(() => {
    let active = true;
    const url = currentPromo?.imageUrl;
    if (url && url.startsWith('idb://')) {
      const key = url.replace('idb://', '');
      getFileFromIDB(key).then(res => {
        if (active && res) setResolvedImageUrl(res);
      });
    } else if (url) {
      setResolvedImageUrl(url);
    }
    return () => { active = false; };
  }, [currentPromo]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!isVisible || promos.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isVisible, promos.length, isPaused]);

  if (!isVisible || promos.length === 0) return null;

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
      className="relative rounded-3xl overflow-hidden shadow-xl border border-[#d4cbb3] bg-[#064e3b] text-[#f4ecd8] transition-all group aspect-[16/9] sm:aspect-[21/9] md:aspect-[16/9] min-h-[260px] flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md"
        title="Hide Promotion"
      >
        <X className="w-4 h-4" />
      </button>

      <div 
        onClick={handleClickBanner}
        className="cursor-pointer absolute inset-0 flex items-center"
      >
        {/* Background Image / Poster */}
        {(resolvedImageUrl || currentPromo.imageUrl) && (
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={resolvedImageUrl || currentPromo.imageUrl} 
              alt={currentPromo.title} 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        {/* Left-heavy gradient overlay for crystal clear text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b]/95 via-[#064e3b]/80 to-transparent pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-20 p-6 sm:p-10 md:p-12 max-w-xl space-y-4">
          {currentPromo.badgeText && (
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#fbbf24] text-[#064e3b] text-xs font-bold uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentPromo.badgeText}</span>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
              {currentPromo.title}
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-[#e2f8ec] leading-relaxed line-clamp-3 font-normal drop-shadow-sm">
              {currentPromo.subtitle}
            </p>
          </div>

          {currentPromo.buttonText && (
            <div className="pt-1">
              <span className="inline-flex items-center space-x-2 px-6 py-3 bg-[#fbbf24] text-[#064e3b] rounded-xl font-bold text-xs sm:text-sm hover:bg-[#f59e0b] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
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
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors opacity-75 group-hover:opacity-100 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-12 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors opacity-75 group-hover:opacity-100 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-6 z-30 flex items-center space-x-1.5">
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
