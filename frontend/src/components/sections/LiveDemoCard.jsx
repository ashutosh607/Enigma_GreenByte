import React, { useState, useEffect } from 'react';
import { Factory, ArrowRight, Sparkles, CheckCircle2, TrendingDown, MapPin, Gauge } from 'lucide-react';

const industryPairs = [
  {
    id: 'steel-cement',
    donor: { name: 'Steel Mill', output: 'Blast Furnace Slag', location: 'Gary, IN' },
    receiver: { name: 'Cement Producer', input: 'Clinker Substitute', location: 'Chicago, IL' },
    score: 94,
    distance: '38 miles',
    co2Saved: '420 kg/ton',
    economicValue: '$18 / ton margin'
  },
  {
    id: 'food-energy',
    donor: { name: 'Brewery & Distiller', output: 'Spent Grain & Mash', location: 'Portland, OR' },
    receiver: { name: 'Bio-gas & Organics', input: 'Anaerobic Feedstock', location: 'Salem, OR' },
    score: 91,
    distance: '45 miles',
    co2Saved: '680 kg/ton',
    economicValue: '$24 / ton margin'
  },
  {
    id: 'textile-auto',
    donor: { name: 'Textile Mill', output: 'Poly-Cotton Offcuts', location: 'Greensboro, NC' },
    receiver: { name: 'Acoustic Composites', input: 'Auto Insulation Felt', location: 'Spartanburg, SC' },
    score: 88,
    distance: '72 miles',
    co2Saved: '310 kg/ton',
    economicValue: '$42 / ton margin'
  },
  {
    id: 'thermal-infra',
    donor: { name: 'Thermal Power', output: 'Class F Fly Ash', location: 'Morgantown, WV' },
    receiver: { name: 'Precast Concrete', input: 'Pozzolanic Binder', location: 'Pittsburgh, PA' },
    score: 96,
    distance: '29 miles',
    co2Saved: '550 kg/ton',
    economicValue: '$22 / ton margin'
  }
];

export default function LiveDemoCard() {
  const [selectedId, setSelectedId] = useState('steel-cement');
  const [displayedScore, setDisplayedScore] = useState(0);
  const [isAssembling, setIsAssembling] = useState(false);

  const activePair = industryPairs.find(p => p.id === selectedId) || industryPairs[0];

  useEffect(() => {
    setIsAssembling(true);
    setDisplayedScore(0);
    let start = 0;
    const end = activePair.score;
    const duration = 750;
    const intervalTime = 25;
    const step = end / (duration / intervalTime);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayedScore(end);
        setIsAssembling(false);
        clearInterval(timer);
      } else {
        setDisplayedScore(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [selectedId, activePair.score]);

  return (
    <section className="py-20 sm:py-28 px-6 max-w-5xl mx-auto border-b border-[#DCE3DE]">
      <div className="text-center max-w-xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8D957]/30 border border-[#B8D957]/60 text-xs font-semibold text-[#17231D] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#286B4A]" />
          Interactive Matching Simulation
        </div>
        <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-[#17231D] tracking-tight">
          Live Exchange Engine
        </h2>
        <p className="mt-2 text-sm text-[#66736B]">
          Select an industrial stream to simulate cross-sector matching criteria and lifecycle impact.
        </p>
      </div>

      {/* Main Interactive Demo Container */}
      <div className="bg-white rounded-3xl border border-[#DCE3DE] shadow-xl overflow-hidden p-6 sm:p-10">
        
        {/* Stream Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {industryPairs.map((pair) => (
            <button
              key={pair.id}
              onClick={() => setSelectedId(pair.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedId === pair.id
                  ? 'bg-[#17231D] text-white shadow-sm'
                  : 'bg-[#F5F7F4] text-[#66736B] hover:text-[#17231D] hover:bg-[#E9EDE7]'
              }`}
            >
              {pair.donor.name} → {pair.receiver.name}
            </button>
          ))}
        </div>

        {/* Dynamic Connection Architecture Diagram */}
        <div className="relative grid grid-cols-1 md:grid-cols-11 gap-4 items-center mb-10 py-4">
          
          {/* Source Industry */}
          <div className="md:col-span-4 p-5 rounded-2xl bg-[#F5F7F4] border border-[#DCE3DE]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#66736B] uppercase tracking-wider">
                Origin Stream
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D99A3D]" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#17231D] mb-1">
              {activePair.donor.name}
            </h4>
            <div className="text-sm font-medium text-[#286B4A] mb-2">
              By-product: {activePair.donor.output}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#66736B]">
              <MapPin className="w-3.5 h-3.5" />
              {activePair.donor.location}
            </div>
          </div>

          {/* Center Connection & Animated Score */}
          <div className="md:col-span-3 flex flex-col items-center justify-center my-4 md:my-0">
            {/* SVG Drawing Line */}
            <div className="w-full relative flex items-center justify-center mb-2">
              <svg className="w-full h-8" viewBox="0 0 200 32" fill="none">
                <line 
                  x1="10" y1="16" x2="190" y2="16" 
                  stroke="#DCE3DE" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                />
                <line 
                  x1="10" y1="16" x2="190" y2="16" 
                  stroke="#286B4A" 
                  strokeWidth="2.5" 
                  className={isAssembling ? "transition-all duration-700 ease-out" : ""}
                  style={{
                    strokeDasharray: 180,
                    strokeDashoffset: isAssembling ? 180 : 0
                  }}
                />
              </svg>
            </div>

            {/* Assembling Score Badge */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 rounded-2xl bg-[#17231D] text-white flex items-center gap-2 shadow-lg">
                <Gauge className="w-4 h-4 text-[#B8D957]" />
                <span className="font-heading font-bold text-xl sm:text-2xl text-[#B8D957]">
                  {displayedScore}%
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#66736B] mt-1.5">
                Compatibility Index
              </span>
            </div>
          </div>

          {/* Receiver Industry */}
          <div className="md:col-span-4 p-5 rounded-2xl bg-[#F5F7F4] border border-[#DCE3DE]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#66736B] uppercase tracking-wider">
                Target Facility
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#286B4A]" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#17231D] mb-1">
              {activePair.receiver.name}
            </h4>
            <div className="text-sm font-medium text-[#3E8990] mb-2">
              Intake: {activePair.receiver.input}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#66736B]">
              <MapPin className="w-3.5 h-3.5" />
              {activePair.receiver.location}
            </div>
          </div>

        </div>

        {/* Metric Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#DCE3DE]">
          <div className="p-4 rounded-xl bg-[#F5F7F4]/60 border border-[#DCE3DE]/60">
            <span className="text-xs text-[#66736B]">Transit Distance</span>
            <div className="font-heading font-bold text-xl text-[#17231D] mt-1">
              {activePair.distance}
            </div>
            <span className="text-[11px] text-[#286B4A]">Low transport penalty</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7F4]/60 border border-[#DCE3DE]/60">
            <span className="text-xs text-[#66736B]">Emissions Avoided</span>
            <div className="font-heading font-bold text-xl text-[#286B4A] mt-1">
              {activePair.co2Saved}
            </div>
            <span className="text-[11px] text-[#66736B]">Scope 3 reduction</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7F4]/60 border border-[#DCE3DE]/60">
            <span className="text-xs text-[#66736B]">Economic Margin</span>
            <div className="font-heading font-bold text-xl text-[#17231D] mt-1">
              {activePair.economicValue}
            </div>
            <span className="text-[11px] text-[#66736B]">Net avoided disposal fee</span>
          </div>
        </div>

      </div>
    </section>
  );
}
