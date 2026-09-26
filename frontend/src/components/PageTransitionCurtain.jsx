import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const getRouteDetails = (pathname) => {
  if (pathname === '/') {
    return { title: 'RE:SOURCE', subtitle: 'Circular Industrial Exchange' };
  }
  if (pathname.startsWith('/marketplace')) {
    return { title: 'MARKETPLACE', subtitle: 'Industrial Materials & Secondary Streams' };
  }
  if (pathname.startsWith('/ai-discovery')) {
    return { title: 'AI DISCOVERY', subtitle: 'Autonomous Symbiosis Compatibility Engine' };
  }
  if (pathname.startsWith('/materials')) {
    return { title: 'SPECIFICATION', subtitle: 'Technical Material Passport & Chemical Assay' };
  }
  if (pathname.startsWith('/opportunities')) {
    return { title: 'AI OPPORTUNITY', subtitle: 'Symbiosis Match & Environmental Assessment' };
  }
  if (pathname.startsWith('/deals')) {
    return { title: 'DEAL WORKSPACE', subtitle: 'Commercial Agreement & Settlement Escrow' };
  }
  if (pathname.startsWith('/register') || pathname.startsWith('/signup')) {
    return { title: 'ONBOARDING', subtitle: 'Enterprise Organization Registration' };
  }
  if (pathname.startsWith('/admin')) {
    return { title: 'ADMIN PORTAL', subtitle: 'Platform Operations & Escrow Clearing' };
  }
  return { title: 'RE:SOURCE', subtitle: 'Industrial Symbiosis Network' };
};

export default function PageTransitionCurtain() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [curtainData, setCurtainData] = useState({ title: '', subtitle: '' });
  const [lastPath, setLastPath] = useState(location.pathname);

  useEffect(() => {
    // Only trigger when path actually changes
    if (location.pathname === lastPath) return;

    // Explicit user requirement: "not needed in dashboard"
    if (location.pathname.startsWith('/dashboard') || lastPath.startsWith('/dashboard')) {
      setLastPath(location.pathname);
      return;
    }

    const details = getRouteDetails(location.pathname);
    setCurtainData(details);
    setIsTransitioning(true);
    setLastPath(location.pathname);

    // Snappy, cinematic timing: 700ms total
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [location.pathname, lastPath]);

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && (
        <motion.div
          key={`curtain-${curtainData.title}`}
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.38, ease: [0.77, 0, 0.175, 1] }}
          className="fixed inset-0 z-[99999] bg-[#101010] text-[#FDFCF8] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          {/* Subtle industrial top & bottom border accents */}
          <div className="absolute top-0 inset-x-0 h-1 bg-[#065F46]" />
          <div className="absolute bottom-0 inset-x-0 h-1 bg-[#065F46]" />

          {/* Huge background watermark */}
          <span className="absolute text-[18vw] font-black uppercase text-white/[0.04] tracking-tighter select-none leading-none pointer-events-none font-mono">
            {curtainData.title}
          </span>

          {/* Central Animated Content */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 1.05 }}
            transition={{ duration: 0.3, delay: 0.08, ease: 'easeOut' }}
            className="text-center px-4 relative z-10 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#A7F3D0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              <span>RE:SOURCE PROTOCOL</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white font-mono leading-none">
              {curtainData.title}
            </h1>

            <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-white/60">
              {curtainData.subtitle}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
