import React, { useEffect } from 'react';
import { X, Play, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DemoModal({ isOpen, onClose, videoSrc }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Product Demo Modal"
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/40 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE3DE] bg-[#F5F7F4]/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#286B4A]" />
            <h3 className="font-heading font-semibold text-base text-[#17231D]">
              Platform Overview — Industrial Symbiosis in Action
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#66736B] hover:text-[#17231D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286B4A]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Showcase container */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            autoPlay
            controls
            loop
            className="w-full h-full object-cover"
            src={videoSrc}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Modal Info Footer */}
        <div className="p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-[#17231D]">Data-Driven Industrial Material Matching</h4>
            <p className="text-xs text-[#66736B]">
              Matching by-products with secondary manufacturing pipelines across 40+ criteria.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#17231D] hover:bg-[#286B4A] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              Start Matching <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
