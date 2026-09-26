import React, { useState, useEffect, useRef } from 'react';
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
    return { title: 'JOIN NETWORK', subtitle: 'Enterprise Organization Onboarding' };
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
  const [cycleKey, setCycleKey] = useState(0);
  const lastPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only trigger when path actually changes
    if (location.pathname === lastPathRef.current) return;

    const previousPath = lastPathRef.current;
    lastPathRef.current = location.pathname;

    // Explicit user requirement: "not needed in dashboard"
    if (location.pathname.startsWith('/dashboard') || previousPath.startsWith('/dashboard')) {
      return;
    }

    const details = getRouteDetails(location.pathname);
    setCurtainData(details);
    setCycleKey((prev) => prev + 1);
    setIsTransitioning(true);

    // Safety fallback timeout in case tab loses focus during keyframe animation
    const safetyTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1100);

    return () => clearTimeout(safetyTimer);
  }, [location.pathname]);

  const handleAnimationComplete = () => {
    setIsTransitioning(false);
  };

  return (
    <AnimatePresence>
      {isTransitioning && (
        <div
          key={`transition-overlay-${cycleKey}`}
          className="fixed inset-0 z-[99999] pointer-events-none select-none overflow-hidden"
        >
          {/* Layer 1: Leading tactile sand beige accent blade */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: ['100%', '0%', '0%', '-100%'] }}
            transition={{
              duration: 0.82,
              times: [0, 0.35, 0.55, 1],
              ease: [0.77, 0, 0.175, 1],
            }}
            className="absolute inset-0 bg-[#E3DBCC]"
          />

          {/* Layer 2: Main Warm White Beige Curtain */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: ['100%', '0%', '0%', '-100%'] }}
            transition={{
              duration: 0.85,
              delay: 0.04,
              times: [0, 0.36, 0.56, 1],
              ease: [0.77, 0, 0.175, 1],
            }}
            onAnimationComplete={handleAnimationComplete}
            className="absolute inset-0 bg-[#F5F2EB] text-[#101010] flex flex-col items-center justify-center border-y border-[#E3DBCC] shadow-2xl"
          >
            {/* Top & Bottom Emerald Accent Strips */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[#059669]" />
            <div className="absolute bottom-0 inset-x-0 h-1 bg-[#059669]" />

            {/* Giant Architectural Background Watermark */}
            <span className="absolute text-[18vw] font-black uppercase text-[#101010]/[0.04] tracking-tighter select-none leading-none pointer-events-none font-mono">
              {curtainData.title}
            </span>

            {/* Kinetic Typography: "Comes and Goes" smoothly without freezing */}
            <motion.div
              animate={{
                y: [36, 0, 0, -36],
                opacity: [0, 1, 1, 0],
                scale: [0.96, 1, 1, 1.02],
              }}
              transition={{
                duration: 0.85,
                delay: 0.04,
                times: [0, 0.36, 0.56, 1],
                ease: 'easeInOut',
              }}
              className="text-center px-4 relative z-10 space-y-3"
            >
              {/* Institutional Protocol Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E3DBCC] text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#101010] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                <span className="font-semibold">RE:SOURCE PROTOCOL</span>
              </div>

              {/* Big Bold Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[#101010] font-mono leading-none">
                {curtainData.title}
              </h1>

              {/* Monospace Subtitle */}
              <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-[#101010]/60">
                {curtainData.subtitle}
              </p>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
