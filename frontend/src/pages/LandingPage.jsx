import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRightLeft,
  Truck,
  FileCheck,
} from 'lucide-react';
import { resourceApi, impactApi } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ListResourceModal from '../components/ListResourceModal';
import DemoModal from '../components/hero/DemoModal';
import factoryVideo from '../assets/landingpagevd.mp4';

const factoryPoster = '/assets/video/industrial-hero-poster.jpg';

export default function LandingPage() {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Ensure video autoplays on mount
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }

    resourceApi
      .getResources({ limit: 3 })
      .then((res) => setFeaturedResources(res.data.resources?.slice(0, 3) || []))
      .catch(() => {});

    impactApi
      .getImpactMetrics()
      .then((res) => setImpactMetrics(res.data.metrics))
      .catch(() => {});
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="w-full bg-[#FDFCF8] text-[#101010]">
      {/* 1. CINEMATIC HERO SECTION WITH HIGH-GRADE INDUSTRIAL VIDEO */}
      <section className="relative w-full h-[100dvh] min-h-[580px] max-h-[100dvh] flex flex-col items-center justify-center overflow-hidden border-b border-[#E3DBCC]">
        {/* Full-screen Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src={factoryVideo}
            onLoadedData={() => setVideoLoaded(true)}
            poster={factoryPoster}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          >
            <source src={factoryVideo} type="video/mp4" />
          </video>

          {/* Elegant Scrim Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(253, 252, 248, 0.45) 0%, rgba(253, 252, 248, 0.22) 48%, rgba(16, 16, 16, 0.38) 100%)',
            }}
          />
        </div>

        {/* Hero Content - Focused Headline and Direct CTAs */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-16 sm:pt-20">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#101010] uppercase max-w-3xl mx-auto leading-[1.06]">
            Turn Industrial Residuals Into Resources.
          </h1>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/marketplace"
              className="px-7 py-3.5 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs sm:text-sm font-bold tracking-wide hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
            >
              Explore Marketplace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/ai-discovery"
              className="px-7 py-3.5 rounded-xl bg-white/85 hover:bg-white text-[#101010] border border-[#E3DBCC] text-xs sm:text-sm font-bold tracking-wide backdrop-blur-md transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#286B4A]" />
              Discover Alternatives
            </Link>
          </div>
        </div>

        {/* Bottom Scroll Indicator Pill */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest text-white/90 uppercase transition-all cursor-pointer"
          >
            <span>SCROLL</span>
            <span className="animate-bounce">↓</span>
          </button>
        </div>
      </section>

      {/* 2. MINIMAL METRICS STRIP (Clean & Subtle) */}
      <section className="w-full bg-[#F3F0E9]/70 border-b border-[#E3DBCC] py-7">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center"
          >
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#101010] font-mono">
                {impactMetrics ? impactMetrics.totalWasteDivertedTons?.toLocaleString() : '14,550'}
                <span className="text-xs font-normal text-[#101010]/60 ml-1">tons</span>
              </div>
              <div className="text-xs uppercase font-mono text-[#101010]/60 mt-1 font-semibold">
                Industrial Residuals Diverted
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#101010] font-mono">
                {impactMetrics ? impactMetrics.totalVirginDisplacedTons?.toLocaleString() : '13,200'}
                <span className="text-xs font-normal text-[#101010]/60 ml-1">tons</span>
              </div>
              <div className="text-xs uppercase font-mono text-[#101010]/60 mt-1 font-semibold">
                Virgin Raw Materials Saved
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl sm:text-3xl font-black text-[#286B4A] font-mono">
                {impactMetrics ? impactMetrics.totalCo2eAbatedMT?.toLocaleString() : '9,140'}
                <span className="text-xs font-normal text-[#101010]/60 ml-1">MT</span>
              </div>
              <div className="text-xs uppercase font-mono text-[#101010]/60 mt-1 font-semibold">
                Net CO2e Abated
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. "WHAT WE PROVIDE" — SIMPLE, MINIMAL WORD BOX WITH FRAMER MOTION */}
      <section className="w-full py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14 sm:mb-18"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3DBCC]/60 text-[11px] font-mono font-bold uppercase tracking-wider text-[#286B4A] mb-3">
            Core Platform
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#101010] tracking-tight">
            What We Provide
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#101010]/70 leading-relaxed font-normal">
            A verified industrial exchange connecting waste-producing plants with manufacturing facilities that can reuse them.
          </p>
        </motion.div>

        {/* 3 Simple, Clean Pillar Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {/* Box 1: Material Marketplace */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-8 rounded-2xl bg-white border border-[#E3DBCC] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F3F0E9] flex items-center justify-center text-[#101010] mb-6">
                <Layers className="w-6 h-6 text-[#286B4A]" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#101010] mb-2">
                Secondary Marketplace
              </h3>
              <p className="text-xs sm:text-sm text-[#101010]/70 leading-relaxed">
                Buy and sell verified industrial by-products, fly ash, mineral slag, and chemical residuals directly with industrial producers.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center gap-1.5 text-xs font-bold text-[#101010] hover:text-[#286B4A] transition-colors"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Box 2: AI Alternative Discovery */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-8 rounded-2xl bg-white border border-[#E3DBCC] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F3F0E9] flex items-center justify-center text-[#101010] mb-6">
                <Compass className="w-6 h-6 text-[#286B4A]" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#101010] mb-2">
                AI Material Discovery
              </h3>
              <p className="text-xs sm:text-sm text-[#101010]/70 leading-relaxed">
                Enter the virgin raw materials your factory purchases. Our AI matches certified secondary substitutes that lower costs.
              </p>
            </div>
            <Link
              to="/ai-discovery"
              className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center gap-1.5 text-xs font-bold text-[#101010] hover:text-[#286B4A] transition-colors"
            >
              <span>Discover Alternatives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Box 3: Certified Escrow & Logistics */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-8 rounded-2xl bg-white border border-[#E3DBCC] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F3F0E9] flex items-center justify-center text-[#101010] mb-6">
                <ShieldCheck className="w-6 h-6 text-[#286B4A]" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#101010] mb-2">
                Audited Settlement
              </h3>
              <p className="text-xs sm:text-sm text-[#101010]/70 leading-relaxed">
                Structured price negotiation, third-party lab quality clearance, and automated escrow release with zero chat friction.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center gap-1.5 text-xs font-bold text-[#101010] hover:text-[#286B4A] transition-colors"
            >
              <span>View Commercial Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. VERIFIED INDUSTRIAL OFFERINGS (Clean Live Showcase) */}
      <section className="w-full py-16 sm:py-24 bg-[#F3F0E9]/60 border-t border-b border-[#E3DBCC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4"
          >
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-1">
                Live Materials Registry
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#101010] tracking-tight">
                Verified Industrial Offerings
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold uppercase tracking-wider text-[#101010] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Browse All Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {featuredResources.map((resource) => (
              <motion.div
                key={resource._id}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <ResourceCard resource={resource} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. MINIMAL BOTTOM CALL-TO-ACTION (Clean & High Contrast) */}
      <section className="w-full py-20 sm:py-28 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-14 rounded-3xl bg-[#101010] text-[#FDFCF8] text-center shadow-xl space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-mono uppercase tracking-wider font-semibold">
            Circular Economy Platform
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to turn industrial residuals into resources?
          </h2>

          <p className="text-xs sm:text-sm text-[#FDFCF8]/70 max-w-xl mx-auto font-normal leading-relaxed">
            Join vetted manufacturing facilities, cement plants, and chemical producers sourcing circular raw materials.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/marketplace"
              className="px-7 py-3.5 rounded-xl bg-[#FDFCF8] text-[#101010] hover:bg-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Explore Marketplace
            </Link>

            <Link
              to="/ai-discovery"
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FDFCF8] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#B8D957]" />
              <span>AI Material Matcher</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Global List Resource Modal */}
      <ListResourceModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        onCreated={() => {
          window.location.reload();
        }}
      />

      {/* Demo Video Modal */}
      <DemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        videoSrc={factoryVideo}
      />
    </div>
  );
}
