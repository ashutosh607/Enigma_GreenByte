import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Gauge, ShieldCheck, TrendingUp, Layers } from 'lucide-react';

const industryPairs = [
  {
    id: 'steel-cement',
    donor: { name: 'Tata Metaliks Blast Furnace', output: 'Air-Cooled Blast Furnace Slag', location: 'Kharagpur, WB' },
    receiver: { name: 'UltraTech Cement Works', input: 'Pozzolanic Clinker Substitute', location: 'Durgapur, WB' },
    score: 94,
    distance: '138 km',
    co2Saved: '420 kg / ton',
    economicValue: '₹1,450 / ton margin',
    regulatoryStatus: 'IS 12089 Compliant',
  },
  {
    id: 'power-concrete',
    donor: { name: 'NTPC Thermal Power Station', output: 'Class F Dry Micro-Fly Ash', location: 'Korba, CG' },
    receiver: { name: 'L&T Infrastructure Precast', input: 'Supplementary Cementitious Binder', location: 'Raipur, CG' },
    score: 96,
    distance: '92 km',
    co2Saved: '550 kg / ton',
    economicValue: '₹980 / ton margin',
    regulatoryStatus: 'ASTM C618 Certified',
  },
  {
    id: 'chemical-fertilizer',
    donor: { name: 'Gujarat Heavy Chemicals', output: 'By-Product Phosphogypsum', location: 'Dahej, GJ' },
    receiver: { name: 'IFFCO Agro-Nutrient Facility', input: 'Soil Conditioning Sulfate Base', location: 'Kalol, GJ' },
    score: 89,
    distance: '165 km',
    co2Saved: '310 kg / ton',
    economicValue: '₹1,850 / ton margin',
    regulatoryStatus: 'CPCB Guidelines Verified',
  },
  {
    id: 'foundry-asphalt',
    donor: { name: 'Kirloskar Foundry Unit', output: 'Spent Silica Foundry Sand', location: 'Kolhapur, MH' },
    receiver: { name: 'IRB Highway Pavement Unit', input: 'Bituminous Sub-Base Fine Aggregate', location: 'Satara, MH' },
    score: 91,
    distance: '115 km',
    co2Saved: '280 kg / ton',
    economicValue: '₹750 / ton margin',
    regulatoryStatus: 'MoRTH Section 500 Approved',
  },
];

export default function LiveDemoCard() {
  const [selectedId, setSelectedId] = useState('steel-cement');
  const [displayedScore, setDisplayedScore] = useState(0);
  const [isAssembling, setIsAssembling] = useState(false);

  const activePair = industryPairs.find((p) => p.id === selectedId) || industryPairs[0];

  useEffect(() => {
    setIsAssembling(true);
    setDisplayedScore(0);
    let start = 0;
    const end = activePair.score;
    const duration = 600;
    const intervalTime = 20;
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
    <section className="w-full py-20 bg-[#F3F0E9] border-t border-b border-[#E3DBCC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3DBCC] text-[11px] font-mono font-bold uppercase tracking-wider text-[#101010] mb-3">
            <Layers className="w-3.5 h-3.5 text-[#101010]" />
            Interactive Symbiosis Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#101010] tracking-tight">
            How RE:SOURCE Pairs Industrial Streams
          </h2>
          <p className="mt-3 text-sm text-[#101010]/70 leading-relaxed font-normal">
            Select a secondary output to see how the engine matches chemical compatibility, calculates logistics boundaries, and executes structured commerce.
          </p>
        </div>

        {/* Main Interactive Demo Container */}
        <div className="card-ivory p-6 sm:p-10 border border-[#E3DBCC] rounded-3xl bg-[#FDFCF8] shadow-sm">
          {/* Stream Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
            {industryPairs.map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => setSelectedId(pair.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-tight transition-all cursor-pointer ${
                  selectedId === pair.id
                    ? 'bg-[#101010] text-[#FDFCF8] shadow-sm'
                    : 'bg-[#F3F0E9] text-[#101010]/70 hover:text-[#101010] hover:bg-[#E3DBCC] border border-[#E3DBCC]'
                }`}
              >
                {pair.donor.name.split(' ')[0]} → {pair.receiver.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Dynamic Connection Architecture Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center mb-10">
            {/* Source Industry */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-[#F3F0E9] border border-[#E3DBCC]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#101010]/60">
                  Origin Plant (Producer)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#101010]" />
              </div>
              <h4 className="text-base font-bold uppercase text-[#101010] mb-1">
                {activePair.donor.name}
              </h4>
              <div className="text-xs font-semibold text-[#101010]/80 mb-3">
                Residual: {activePair.donor.output}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#101010]/60">
                <MapPin className="w-3.5 h-3.5" />
                {activePair.donor.location}
              </div>
            </div>

            {/* Center Connection & Animated Score */}
            <div className="md:col-span-3 flex flex-col items-center justify-center py-4 md:py-0">
              <div className="w-full flex items-center justify-center mb-2">
                <svg className="w-full h-8" viewBox="0 0 200 32" fill="none">
                  <line
                    x1="10"
                    y1="16"
                    x2="190"
                    y2="16"
                    stroke="#E3DBCC"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="10"
                    y1="16"
                    x2="190"
                    y2="16"
                    stroke="#101010"
                    strokeWidth="2.5"
                    className={isAssembling ? 'transition-all duration-700 ease-out' : ''}
                    style={{
                      strokeDasharray: 180,
                      strokeDashoffset: isAssembling ? 180 : 0,
                    }}
                  />
                </svg>
              </div>

              {/* Assembling Score Badge */}
              <div className="flex flex-col items-center">
                <div className="px-5 py-2.5 rounded-2xl bg-[#101010] text-[#FDFCF8] flex items-center gap-2 shadow-md">
                  <Gauge className="w-4 h-4 text-[#FDFCF8]" />
                  <span className="font-mono font-black text-2xl text-[#FDFCF8]">
                    {displayedScore}%
                  </span>
                </div>
                <span className="text-[11px] font-mono uppercase font-bold text-[#101010]/60 mt-1.5">
                  Symbiosis Match Score
                </span>
              </div>
            </div>

            {/* Receiver Industry */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-[#F3F0E9] border border-[#E3DBCC]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#101010]/60">
                  Target Consumer (Off-Taker)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#101010]" />
              </div>
              <h4 className="text-base font-bold uppercase text-[#101010] mb-1">
                {activePair.receiver.name}
              </h4>
              <div className="text-xs font-semibold text-[#101010]/80 mb-3">
                Intake: {activePair.receiver.input}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#101010]/60">
                <MapPin className="w-3.5 h-3.5" />
                {activePair.receiver.location}
              </div>
            </div>
          </div>

          {/* Metric Badges Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E3DBCC]">
            <div className="p-4 rounded-xl bg-[#F3F0E9] border border-[#E3DBCC]">
              <span className="text-[11px] font-mono uppercase text-[#101010]/60 font-semibold">
                Logistics Distance
              </span>
              <div className="font-mono font-bold text-lg text-[#101010] mt-1">
                {activePair.distance}
              </div>
              <span className="text-[11px] text-[#101010]/70">Feasible haulage zone</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F3F0E9] border border-[#E3DBCC]">
              <span className="text-[11px] font-mono uppercase text-[#101010]/60 font-semibold">
                Emissions Avoided
              </span>
              <div className="font-mono font-bold text-lg text-[#101010] mt-1">
                {activePair.co2Saved}
              </div>
              <span className="text-[11px] text-[#101010]/70">Scope 3 reduction</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F3F0E9] border border-[#E3DBCC]">
              <span className="text-[11px] font-mono uppercase text-[#101010]/60 font-semibold">
                Economic Spread
              </span>
              <div className="font-mono font-bold text-lg text-[#101010] mt-1">
                {activePair.economicValue}
              </div>
              <span className="text-[11px] text-[#101010]/70">Net avoided landfill fee</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F3F0E9] border border-[#E3DBCC]">
              <span className="text-[11px] font-mono uppercase text-[#101010]/60 font-semibold">
                Regulatory Standard
              </span>
              <div className="font-mono font-bold text-sm text-[#101010] mt-1 truncate" title={activePair.regulatoryStatus}>
                {activePair.regulatoryStatus}
              </div>
              <span className="text-[11px] text-[#101010]/70">Verified technical passport</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
