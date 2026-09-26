import React from 'react';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';

export default function FloatingControls({ 
  isMuted, 
  onToggleMute, 
  onPrevAction 
}) {
  return (
    <>
      {/* Left side floating control (as in reference image) */}
      <div className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={onPrevAction}
          className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-black/40 hover:bg-black/60 active:scale-95 backdrop-blur-md border border-white/15 text-white/90 hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 group"
          aria-label="Previous view or slide"
          title="Previous section"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
        </button>
      </div>

      {/* Bottom right corner floating control (as in reference image) */}
      <div className="fixed right-5 sm:right-7 bottom-6 sm:bottom-8 z-30 pointer-events-auto flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/60 hover:bg-black/80 active:scale-95 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 group"
          aria-label={isMuted ? "Unmute factory ambiance" : "Mute audio"}
          title={isMuted ? "Audio: Muted (Click to enable)" : "Audio: Playing"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-12 text-white/90" />
          ) : (
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#B8D957] animate-pulse" />
          )}
        </button>
      </div>
    </>
  );
}
