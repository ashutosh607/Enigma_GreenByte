import React from 'react';
import { ArrowRight, ShieldCheck, Database, Building2 } from 'lucide-react';

export default function FooterCTA() {
  return (
    <footer id="contact" className="py-20 sm:py-24 px-6 max-w-6xl mx-auto">
      <div className="bg-[#17231D] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden">
        
        {/* Subtle decorative background gradient */}
        <div 
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(40,107,74,0.4) 0%, transparent 70%)'
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-[#B8D957] mb-4">
            Industrial Resource Network
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-4">
            Accelerate secondary supply chains today.
          </h2>
          <p className="text-sm sm:text-base text-white/70 mb-8 leading-relaxed">
            Join enterprise operators exchanging over 400,000 metric tons of materials each quarter with algorithmic regulatory compliance.
          </p>

          {/* Two-sided action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
            <a
              href="#list"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#B8D957] text-[#17231D] font-semibold text-sm hover:bg-[#c6e663] transition-all"
            >
              List a By-Product <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#find"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-all"
            >
              Find Raw Material
            </a>
          </div>

          {/* Credibility & Methodology line */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#76A887]" />
              <span>Verified against EPA & REACH secondary material guidelines.</span>
            </div>
            <div>
              <span>© {new Date().getFullYear()} Haven Industrial Symbiosis. All rights reserved.</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
