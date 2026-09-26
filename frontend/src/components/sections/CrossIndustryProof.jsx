import React from 'react';
import { ArrowRight, Recycle } from 'lucide-react';

export default function CrossIndustryProof() {
  const proofs = [
    {
      from: "Steel Slag",
      to: "Cement Clinker",
      metric: "620k tons diverted",
      impact: "-44% carbon intensity vs traditional lime kiln calcination."
    },
    {
      from: "Food & Organic Waste",
      to: "Biogas & Soil Amendments",
      metric: "185k MWh generated",
      impact: "Zero methane escape through sealed anaerobic digestion cycles."
    },
    {
      from: "Textile Offcuts",
      to: "Acoustic Insulation",
      metric: "94% fiber retention",
      impact: "Replaces petrochemical fiberglass in automotive acoustic baffles."
    },
    {
      from: "Coal Fly Ash",
      to: "Geopolymer Concrete",
      metric: "1.2M tons utilized",
      impact: "High-durability marine concrete without virgin Portland cement."
    }
  ];

  return (
    <section className="py-20 sm:py-28 px-6 max-w-6xl mx-auto border-b border-[#DCE3DE]">
      <div className="text-center max-w-xl mx-auto mb-16">
        <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-[#17231D] tracking-tight">
          Validated Exchange Pathways
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#66736B]">
          Continuous industrial symbiosis matches currently active across heavy manufacturing corridors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {proofs.map((proof, i) => (
          <div 
            key={i}
            className="p-7 rounded-2xl bg-white border border-[#DCE3DE] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#286B4A] mb-3">
                <Recycle className="w-4 h-4" />
                <span>Verified Match</span>
              </div>

              <div className="font-heading font-bold text-base text-[#17231D] mb-1">
                {proof.from}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#66736B] mb-4">
                <span>transforms to</span>
                <ArrowRight className="w-3 h-3 text-[#286B4A]" />
                <span className="font-medium text-[#17231D]">{proof.to}</span>
              </div>

              <p className="text-xs text-[#66736B] leading-relaxed">
                {proof.impact}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCE3DE]">
              <span className="font-heading font-semibold text-xs text-[#3E8990]">
                {proof.metric}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
