import React, { useRef, useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroContent from './HeroContent';
import FloatingControls from './FloatingControls';
import DemoModal from './DemoModal';

import factoryVideo from '../../assets/landingpagevd.mp4';


export default function HeroSection() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Ensure video plays reliably on mount & handle motion preference
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreference = () => {
      if (mediaQuery.matches) {
        video.pause();
      } else {
        video.play().catch((err) => {
          console.warn("Autoplay attempt failed:", err);
        });
      }
    };

    handleMotionPreference();
    mediaQuery.addEventListener('change', handleMotionPreference);

    // Initial play trigger
    video.play().catch(() => {});

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
      {/* 1. Full-screen Cinematic Background Video from src/assets/landingpagevd.mp4 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={factoryVideo}
          onLoadedData={() => setVideoLoaded(true)}
          poster="/assets/video/industrial-hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        >
          <source src={factoryVideo} type="video/mp4" />
        </video>
      </div>

      {/* 2. Tuned Video Scrim / Overlay for Haven-style Visual Balance */}
      {/* Subtle radial center diffusion for text clarity without obscuring factory motion */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 50% at 50% 42%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.2) 45%, transparent 80%)'
        }}
      />
      {/* Gentle vertical edge vignette for top navbar and bottom scroll indicator contrast */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(23, 35, 29, 0.2) 0%, transparent 20%, transparent 70%, rgba(23, 35, 29, 0.4) 100%)'
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
