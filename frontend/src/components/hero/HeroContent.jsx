import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroContent({ onWatchDemo }) {
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto pt-16 sm:pt-20">
      
      {/* Top Pill / Badge */}
      <div 
        className="inline-flex items-center gap-1.5 px-3.5 py-1 sm:py-1.2 rounded-full bg-white/75 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-xs sm:text-[13px] font-medium text-[#17231D] mb-5 sm:mb-6 select-none transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      >
        <span className="text-[12px] sm:text-sm">🌱</span>
        <span>Built for a cleaner future</span>
      </div>

      {/* Main Headline */}
      <h1 
        className="font-heading font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[80px] text-[#17231D] tracking-[-0.03em] leading-[1.06] mb-5 sm:mb-6 max-w-3xl drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)] animate-in fade-in slide-in-from-bottom-3 duration-500"
      >
        Build a cleaner future.
      </h1>

      {/* Subheading */}
      <p 
        className="font-sans text-base sm:text-lg md:text-[19px] text-[#34443B] font-normal max-w-xl mx-auto leading-relaxed mb-7 sm:mb-9 animate-in fade-in slide-in-from-bottom-4 duration-600"
      >
        Understand your impact. Reduce emissions. Build a better tomorrow.
      </p>

      {/* CTA Buttons Row */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* Primary CTA */}
        <a
          href="#get-started"
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#F7FAF7] active:scale-97 text-[#17231D] font-semibold text-xs sm:text-sm tracking-tight shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/70 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286B4A]"
        >
          <span>Get Started</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
        </a>

        {/* Secondary Ghost CTA */}
        <button
          type="button"
          onClick={onWatchDemo}
          className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-transparent hover:bg-white/40 active:scale-97 text-[#17231D] hover:text-black font-medium text-xs sm:text-sm tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286B4A]"
        >
          <span>Watch Demo</span>
        </button>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="fixed bottom-7 sm:bottom-9 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={scrollToNext}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/45 hover:bg-black/60 active:scale-95 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-white/95 uppercase shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 group cursor-pointer"
          aria-label="Scroll down to explore platform"
        >
          <span>SCROLL</span>
          <span className="transition-transform group-hover:translate-y-0.5 inline-block text-[11px] motion-safe:animate-bounce">
            ↓
          </span>
        </button>
      </div>

    </div>
  );
}
