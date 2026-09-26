import React from 'react';
import HeroSection from './components/hero/HeroSection';
import ProblemStats from './components/sections/ProblemStats';
import HowItWorks from './components/sections/HowItWorks';
import LiveDemoCard from './components/sections/LiveDemoCard';
import CrossIndustryProof from './components/sections/CrossIndustryProof';
import FooterCTA from './components/sections/FooterCTA';

function App() {
  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17231D] selection:bg-[#B8D957]/30 selection:text-[#17231D]">
      {/* 1. Haven-style Hero Section */}
      <HeroSection />

      {/* 2. Flat, calm sections below the hero */}
      <main id="content" className="relative z-10">
        <ProblemStats />
        <HowItWorks />
        <LiveDemoCard />
        <CrossIndustryProof />
      </main>

      {/* 3. Footer CTA */}
      <FooterCTA />
    </div>
  );
}

export default App;