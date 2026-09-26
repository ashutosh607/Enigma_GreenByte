import React from 'react';
import { UploadCloud, Cpu, ShieldCheck, Link2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "List",
      desc: "Specify material specs, volume, frequency, and location.",
      icon: UploadCloud
    },
    {
      num: "02",
      title: "Match",
      desc: "Algorithm pairs secondary outputs with active procurement needs.",
      icon: Cpu
    },
    {
      num: "03",
      title: "Assess",
      desc: "Evaluate chemical composition, logistics cost, and CO2 delta.",
      icon: ShieldCheck
    },
    {
      num: "04",
      title: "Connect",
      desc: "Execute compliant off-take agreements and supply arrangements.",
      icon: Link2
    }
  ];

  return (
    <section id="usecases" className="py-20 sm:py-28 px-6 max-w-6xl mx-auto border-b border-[#DCE3DE]">
      <div className="text-center max-w-xl mx-auto mb-16">
        <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-[#17231D] tracking-tight">
          How it works
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#66736B]">
          A four-step pathway from industrial by-product to verified manufacturing input.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.num}
              className="p-7 rounded-2xl bg-white border border-[#DCE3DE] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F7F4] flex items-center justify-center text-[#286B4A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#66736B] tracking-wider">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-[#17231D] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#66736B] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
