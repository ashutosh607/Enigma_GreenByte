import React, { useRef, useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroContent from './HeroContent';
import FloatingControls from './FloatingControls';
import DemoModal from './DemoModal';

const factoryVideo = '/assets/video/industrial-hero.mp4';

export default function HeroSection() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreference = () => {
      if (videoRef.current) {
        if (mediaQuery.matches) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {
            // Autoplay policy fallback
          });
        }
      }
    };

    handleMotionPreference();
    mediaQuery.addEventListener('change', handleMotionPreference);
    return () => mediaQuery.removeEventListener('change', handleMotionPreference);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handlePrevAction = () => {
    // Smooth scroll to top or re-trigger view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      id="home"
      className="relative w-full h-[100dvh] min-h-[640px] flex items-center justify-center overflow-hidden select-none"
      aria-label="Hero Section"
    >
      {/* 1. Full-screen Cinematic Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          poster="/assets/video/industrial-hero-poster.jpg"
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-90'
          }`}
        >
          {/* Direct Vite-bundled import */}
          <source src={factoryVideo} type="video/mp4" />
        </video>
      </div>

      {/* 2. Tuned Video Scrim / Overlay for Haven-style Visual Balance */}
      {/* Radial soft glow behind the text so dark typography pops crisply while keeping the factory natural */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(255, 255, 255, 0.68) 0%, rgba(255, 255, 255, 0.38) 35%, rgba(245, 247, 244, 0.12) 65%, rgba(23, 35, 29, 0.28) 100%)'
        }}
      />
      {/* Gentle vertical edge vignette for top nav and bottom contrast */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(23, 35, 29, 0.14) 0%, rgba(255, 255, 255, 0) 18%, rgba(255, 255, 255, 0) 65%, rgba(23, 35, 29, 0.35) 100%)'
        }}
      />

      {/* 3. Floating Pill Navigation */}
      <Navbar />

      {/* 4. Central Hero Content (Badge, Headline, Subtitle, CTAs, Scroll Pill) */}
      <HeroContent onWatchDemo={() => setDemoOpen(true)} />

      {/* 5. Corner Floating Action Controls (matches Haven reference side buttons) */}
      <FloatingControls 
        isMuted={isMuted} 
        onToggleMute={toggleMute}
        onPrevAction={handlePrevAction}
      />

      {/* 6. Interactive Demo Modal */}
      <DemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        videoSrc={factoryVideo}
      />
    </section>
  );
}
