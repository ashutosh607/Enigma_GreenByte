import React from 'react';

export default function ProblemStats() {
  const stats = [
    {
      value: "4.2M t",
      label: "By-products landfilled annually",
      desc: "High-grade industrial materials discarded due to lack of cross-sector discovery."
    },
    {
      value: "61%",
      label: "Virgin material dependence",
      desc: "Manufacturing plants purchasing raw virgin feedstocks with viable local substitutes."
    },
    {
      value: "-38%",
      label: "Emissions reduction per ton",
      desc: "Measured average CO2 lifecycle savings achieved through direct secondary exchange."
    }
  ];

  return (
    <section className="py-20 sm:py-28 px-6 max-w-6xl mx-auto border-b border-[#DCE3DE]">
      <div className="text-center max-w-xl mx-auto mb-16">
        <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-[#17231D] tracking-tight">
          The linear resource bottleneck
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#66736B]">
          Industrial waste streams remain unmonetized while supply chains face virgin material shortages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="p-8 rounded-2xl bg-white border border-[#DCE3DE] shadow-sm hover:border-[#76A887] transition-all"
          >
            <div className="font-heading font-bold text-4xl sm:text-5xl text-[#3E8990] mb-3 tracking-tight">
              {stat.value}
            </div>
            <h3 className="font-semibold text-base text-[#17231D] mb-2">
              {stat.label}
            </h3>
            <p className="text-sm text-[#66736B] leading-relaxed">
              {stat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
