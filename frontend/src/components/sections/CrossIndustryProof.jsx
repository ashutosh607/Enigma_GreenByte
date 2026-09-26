import React from 'react';
import { ArrowRight, Recycle, ShieldCheck } from 'lucide-react';

export default function CrossIndustryProof() {
  const proofs = [
    {
      from: "Steel Mill Slag",
      to: "Portland Pozzolana Cement",
      metric: "620,000 MT Diverted",
      impact: "-44% carbon intensity vs traditional lime kiln calcination.",
    },
    {
      from: "Fly Ash (Class F)",
      to: "High-Performance Concrete",
      metric: "1.2M MT Utilized",
      impact: "Replaces 30% virgin Portland binder with high sulfate resistance.",
    },
    {
      from: "Phosphogypsum",
      to: "Agricultural Soil Conditioner",
      metric: "185,000 MT Reclaimed",
      impact: "Displaces open chemical gypsum stockpiles across industrial corridors.",
    },
    {
      from: "Spent Foundry Sand",
      to: "Bituminous Paving Sub-Base",
      metric: "94,000 MT Integrated",
      impact: "Eliminates local river sand dredging for highway construction packages.",
    },
  ];

  return (
    <section className="w-full py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#E3DBCC]">
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-2">
          Validated Industry Pathways
        </div>
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#101010] tracking-tight">
          Active Circular Corridors
        </h2>
        <p className="mt-3 text-sm text-[#101010]/70 leading-relaxed font-normal">
          Industrial partnerships operating continuously with algorithmic regulatory verification and automated payment escrows.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {proofs.map((proof, i) => (
          <div
            key={i}
            className="card-ivory p-6 rounded-2xl bg-[#FDFCF8] border border-[#E3DBCC] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#101010] mb-3">
                <Recycle className="w-3.5 h-3.5" />
                <span>Verified Stream</span>
              </div>

              <div className="font-bold text-base uppercase text-[#101010] mb-1">
                {proof.from}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#101010]/60 mb-4 font-mono">
                <span>transforms to</span>
                <ArrowRight className="w-3 h-3 text-[#101010]" />
                <span className="font-bold text-[#101010]">{proof.to}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F3F0E9] border border-[#E3DBCC] font-mono font-bold text-sm text-[#101010] mb-3">
                {proof.metric}
              </div>

              <p className="text-xs text-[#101010]/70 leading-relaxed">
                {proof.impact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
