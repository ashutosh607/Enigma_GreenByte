import React, { useEffect } from 'react';
import { X, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Platform Video Overview"
    >
      <div
        className="relative w-full max-w-4xl bg-[#FDFCF8] rounded-3xl overflow-hidden shadow-2xl border border-[#E3DBCC] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3DBCC] bg-[#F3F0E9]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#101010]" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#101010]">
              RE:SOURCE Platform Architecture & Symbiosis Tour
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#E3DBCC] text-[#101010]/70 hover:text-[#101010] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            autoPlay
            controls
            loop
            className="w-full h-full object-cover"
            src={videoSrc || '/assets/video/industrial-hero.mp4'}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Modal Info Footer */}
        <div className="p-6 bg-[#FDFCF8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#E3DBCC]">
          <div className="space-y-1">
            <h4 className="font-bold text-sm uppercase text-[#101010]">Algorithmic Industrial By-Product Exchange</h4>
            <p className="text-xs text-[#101010]/70">
              Matching secondary materials with active manufacturing specifications across 40+ engineering parameters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/marketplace"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
