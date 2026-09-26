import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  TrendingDown,
  Sliders,
  DollarSign,
  Truck,
  Leaf,
  Lock,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { resourceApi, impactApi } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ListResourceModal from '../components/ListResourceModal';
import LiveDemoCard from '../components/sections/LiveDemoCard';
import CrossIndustryProof from '../components/sections/CrossIndustryProof';
import DemoModal from '../components/hero/DemoModal';

const factoryVideo = '/assets/video/industrial-hero.mp4';
const factoryPoster = '/assets/video/industrial-hero-poster.jpg';

export default function LandingPage() {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    resourceApi
      .getResources({ limit: 3 })
      .then((res) => setFeaturedResources(res.data.resources?.slice(0, 3) || []))
      .catch(() => {});

    impactApi
      .getImpactMetrics()
      .then((res) => setImpactMetrics(res.data.metrics))
      .catch(() => {});
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div className="w-full bg-[#FDFCF8] text-[#101010]">
      {/* 1. CINEMATIC HERO SECTION WITH HIGH-GRADE INDUSTRIAL VIDEO */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-[#E3DBCC]">
        {/* Background Video / Atmospheric Poster */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            poster={factoryPoster}
            className={`absolute inset-0 w-full h-full object-cover object-center filter grayscale-[30%] contrast-[1.08] transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-90'
            }`}
          >
            <source src={factoryVideo} type="video/mp4" />
          </video>

          {/* Elegant Scrim Overlay: Soft Off-White radial and vertical vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 75% 65% at 50% 45%, rgba(253, 252, 248, 0.93) 0%, rgba(253, 252, 248, 0.82) 48%, rgba(243, 240, 233, 0.89) 100%)',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Subtle Protocol Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3F0E9] border border-[#E3DBCC] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#101010] mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#101010]" />
            Audited B2B Secondary Materials Network
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#101010] uppercase max-w-4xl mx-auto leading-[1.04]">
            Turn Industrial Residuals Into Resources.
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-[#101010]/75 max-w-2xl mx-auto leading-relaxed font-normal">
            Discover materials, connect with industrial suppliers, and uncover by-products that
            could replace conventional raw materials.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#101010] text-[#FDFCF8] text-sm font-bold tracking-wide hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
            >
              Explore Marketplace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/ai-discovery"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#F3F0E9] hover:bg-[#E3DBCC] text-[#101010] border border-[#E3DBCC] text-sm font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#101010]" />
              Discover Alternatives
            </Link>

            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/70 hover:bg-white text-[#101010] border border-[#E3DBCC] text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#101010] fill-current" />
              Watch Video Story
            </button>
          </div>

          {/* Smaller CTA */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setListModalOpen(true)}
              className="text-xs text-[#101010]/70 hover:text-[#101010] font-semibold underline underline-offset-4 cursor-pointer"
            >
              Have by-products? List a Resource →
            </button>
          </div>

          {/* Industrial Flow Pill */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2.5 px-5 rounded-lg bg-[#FDFCF8]/95 border border-[#E3DBCC] text-xs font-mono text-[#101010]/80 shadow-xs">
            <span className="font-bold text-[#101010]">Industrial facility</span>
            <span className="text-[#101010]/40">→</span>
            <span>Residual / Waste</span>
            <span className="text-[#101010]/40">→</span>
            <span className="font-bold text-[#101010]">Resource</span>
            <span className="text-[#101010]/40">→</span>
            <span>Another industrial use</span>
          </div>
        </div>

        {/* Ambient Video Audio Controls (Floating Button in Corner) */}
        <div className="absolute right-5 bottom-5 z-20">
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#101010]/80 hover:bg-[#101010] text-[#FDFCF8] text-xs font-mono font-bold backdrop-blur-md shadow-md transition-all cursor-pointer"
            title={isMuted ? 'Click to enable ambient factory audio' : 'Click to mute audio'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-[#FDFCF8]" />
                <span className="hidden sm:inline">Audio Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Sound Active</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 2. LIVE METRICS RIBBON */}
      <section className="w-full bg-[#F3F0E9] border-b border-[#E3DBCC] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#101010] font-mono">
                {impactMetrics ? impactMetrics.totalWasteDivertedTons?.toLocaleString() : '14,550'}{' '}
                <span className="text-xs font-normal text-[#101010]/60">tons</span>
              </div>
              <div className="text-xs uppercase font-mono text-[#101010]/55 mt-1 font-medium">
                Industrial Waste Diverted
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#101010] font-mono">
                {impactMetrics ? impactMetrics.totalVirginDisplacedTons?.toLocaleString() : '13,200'}{' '}
                <span className="text-xs font-normal text-[#101010]/60">tons</span>
              </div>
              <div className="text-xs uppercase font-mono text-[#101010]/55 mt-1 font-medium">
                Virgin Raw Materials Displaced
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#101010] font-mono">
                {impactMetrics ? impactMetrics.totalCo2eAbatedMT?.toLocaleString() : '9,140'}{' '}
                <span className="text-xs font-normal text-[#101010]/60">MT</span>
              </div>
              <div className="text-xs uppercase font-mono text-[#101010]/55 mt-1 font-medium">
                Net CO2e Abated
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#101010] font-mono">
                0%
              </div>
              <div className="text-xs uppercase font-mono text-[#101010]/55 mt-1 font-medium">
                Chat Friction (Slider Commerce)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISUAL STORY: HOW RE:SOURCE WORKS */}
      <section className="w-full py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-2">
            System Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#101010] tracking-tight">
            How RE:SOURCE Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#101010]/70 leading-relaxed">
            Marketplace and AI Discovery both feed into the same auditable exchange pipeline.
            Every step is structured, certified, and completed without unstructured chat.
          </p>
        </div>

        {/* 7-Step Journey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 01 — List */}
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#E3DBCC] text-[#101010]">
                01 — List
              </span>
              <h3 className="text-xl font-bold uppercase text-[#101010] mt-4 mb-2">
                List Industrial Residuals
              </h3>
              <p className="text-xs text-[#101010]/70 leading-relaxed">
                Companies list industrial residuals, by-products, and secondary streams with verified
                assays, quantity schedules, and confidentiality controls.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center justify-between text-[11px] font-mono text-[#101010]/60">
              <span>Open / Confidential</span>
              <Lock className="w-3.5 h-3.5 text-[#101010]" />
            </div>
          </div>

          {/* 02 — Discover */}
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#E3DBCC] text-[#101010]">
                02 — Discover
              </span>
              <h3 className="text-xl font-bold uppercase text-[#101010] mt-4 mb-2">
                Material Marketplace
              </h3>
              <p className="text-xs text-[#101010]/70 leading-relaxed">
                Procurement teams search and filter verified physical materials by region, sieve size,
                moisture tolerance, and certified evidence status.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center justify-between text-[11px] font-mono text-[#101010]/60">
              <span>Material Passports</span>
              <FileCheck className="w-3.5 h-3.5 text-[#101010]" />
            </div>
          </div>

          {/* 03 — AI Match */}
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl flex flex-col justify-between bg-[#F3F0E9] ring-1 ring-[#101010]/20">
            <div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#101010] text-[#FDFCF8]">
                03 — AI Match
              </span>
              <h3 className="text-xl font-bold uppercase text-[#101010] mt-4 mb-2">
                AI Discovery Engine
              </h3>
              <p className="text-xs text-[#101010]/70 leading-relaxed">
                Input the virgin material you currently buy. AI identifies secondary symbiosis matches
                with compatibility scores across technical, economic, and timing factors.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center justify-between text-[11px] font-mono text-[#101010]/60">
              <span>FastAPI/ML Powered</span>
              <Cpu className="w-3.5 h-3.5 text-[#101010]" />
            </div>
          </div>

          {/* 04 — Assess */}
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#E3DBCC] text-[#101010]">
                04 — Assess
              </span>
              <h3 className="text-xl font-bold uppercase text-[#101010] mt-4 mb-2">
                Engineering Assessment
              </h3>
              <p className="text-xs text-[#101010]/70 leading-relaxed">
                Technical, chemical, quantity, logistics, and lab evidence are evaluated with clear
                blocker owners and completion milestones.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center justify-between text-[11px] font-mono text-[#101010]/60">
              <span>Lab Verification</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#101010]" />
            </div>
          </div>

          {/* 05 — Deal (Slider Negotiation) */}
          <div className="card-ivory p-6 border border-[#101010] rounded-xl flex flex-col justify-between bg-[#FDFCF8] shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#101010] text-[#FDFCF8]">
                  05 — Deal
                </span>
                <span className="text-[10px] font-mono uppercase bg-[#E3DBCC] px-2 py-0.5 rounded font-bold text-[#101010]">
                  NO CHAT
                </span>
              </div>
              <h3 className="text-xl font-bold uppercase text-[#101010] mt-4 mb-2">
                Price Negotiation Slider
              </h3>
              <p className="text-xs text-[#101010]/70 leading-relaxed">
                Buyer selects target price or price band using interactive sliders. Seller reviews on
                dashboard: Accept, Counter, or Reject.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center justify-between text-[11px] font-mono text-[#101010]/60">
              <span>Structured Ledger</span>
              <Sliders className="w-3.5 h-3.5 text-[#101010]" />
            </div>
          </div>

          {/* 06 — Exchange */}
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#E3DBCC] text-[#101010]">
                06 — Exchange
              </span>
              <h3 className="text-xl font-bold uppercase text-[#101010] mt-4 mb-2">
                Escrow → Delivery
              </h3>
              <p className="text-xs text-[#101010]/70 leading-relaxed">
                Escrow deposit → dispatch tracking → receiving inspection → laboratory quality
                confirmation before fund release.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E3DBCC]/70 flex items-center justify-between text-[11px] font-mono text-[#101010]/60">
              <span>Quality Sign-off</span>
              <Truck className="w-3.5 h-3.5 text-[#101010]" />
            </div>
          </div>

          {/* 07 — Impact */}
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl flex flex-col justify-between md:col-span-2 lg:col-span-3 bg-[#F3F0E9]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#E3DBCC] text-[#101010]">
                  07 — Impact & History
                </span>
                <h3 className="text-2xl font-bold uppercase text-[#101010] mt-3 mb-1">
                  Track Circularity & Environmental Credits
                </h3>
                <p className="text-xs text-[#101010]/70 leading-relaxed max-w-2xl">
                  Each completed exchange generates verified displacement certificates: cubic meters of
                  landfill diverted, virgin quarrying avoided, and scope 3 emissions eliminated.
                </p>
              </div>
              <Link
                to="/impact"
                className="px-5 py-2.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-semibold self-start md:self-center shrink-0 cursor-pointer"
              >
                View Impact Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SIMULATION: HOW RE:SOURCE PAIRS INDUSTRIAL STREAMS */}
      <LiveDemoCard />

      {/* 5. VALIDATED INDUSTRY PATHWAYS */}
      <CrossIndustryProof />

      {/* 6. FEATURED MARKETPLACE PREVIEW */}
      <section className="w-full py-20 bg-[#F3F0E9] border-t border-b border-[#E3DBCC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold">
                Live Materials Registry
              </span>
              <h2 className="text-3xl font-black uppercase text-[#101010] mt-1">
                Verified Industrial Offerings
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold uppercase tracking-wider text-[#101010] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Browse All Listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. DUAL ENTRY CTA BANNER */}
      <section className="w-full py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Marketplace route */}
          <div className="card-ivory p-8 border border-[#E3DBCC] rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-2">
                Route A
              </div>
              <h3 className="text-2xl font-black uppercase text-[#101010] mb-3">
                Industrial Marketplace
              </h3>
              <p className="text-sm text-[#101010]/70 leading-relaxed">
                For companies searching for specific secondary raw materials with known particle,
                moisture, and chemical specifications.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="mt-8 px-6 py-3.5 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs font-bold text-center hover:bg-black transition-colors cursor-pointer"
            >
              Open Marketplace Catalog
            </Link>
          </div>

          {/* AI Discovery route */}
          <div className="card-ivory p-8 border border-[#101010]/30 rounded-2xl flex flex-col justify-between bg-[#FDFCF8]">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#101010]" /> Route B (Recommended)
              </div>
              <h3 className="text-2xl font-black uppercase text-[#101010] mb-3">
                AI Discovery System
              </h3>
              <p className="text-sm text-[#101010]/70 leading-relaxed">
                Tell us what virgin materials your company currently buys. AI automatically pairs
                compatible by-products to displace costly extraction.
              </p>
            </div>
            <Link
              to="/ai-discovery"
              className="mt-8 px-6 py-3.5 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs font-bold text-center hover:bg-black transition-colors cursor-pointer"
            >
              Launch AI Alternative Matcher
            </Link>
          </div>
        </div>
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
