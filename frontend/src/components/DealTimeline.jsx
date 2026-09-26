import React from 'react';
import { Check, Clock, ChevronRight } from 'lucide-react';

const STAGES = [
  { key: 'Deal Initiated', label: 'Initiated' },
  { key: 'Assessment', label: 'Assessment' },
  { key: 'Price Negotiation', label: 'Price Negotiation' },
  { key: 'Agreement', label: 'Agreement' },
  { key: 'Payment Completed', label: 'Escrow Payment' },
  { key: 'In Transit', label: 'Dispatch / Transit' },
  { key: 'Quality Confirmation', label: 'Quality Audit' },
  { key: 'Exchange Completed', label: 'Completed' },
];

export default function DealTimeline({ currentStatus = 'Deal Initiated', onSelectStage }) {
  const getStageIndex = (status) => {
    if (status === 'Payment Pending') return 3;
    if (status === 'Dispatch') return 4;
    if (status === 'Delivery') return 6;
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full card-ivory p-4 md:p-6 border border-[#E3DBCC]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase font-mono text-[#101010]/55 tracking-wider">
            Exchange Lifecycle Progression
          </span>
          <h4 className="text-base font-bold text-[#101010]">
            Current Phase: <span className="underline decoration-[#E3DBCC] underline-offset-4">{currentStatus}</span>
          </h4>
        </div>
        <div className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-[#E3DBCC] text-[#101010]">
          Step {Math.min(currentIndex + 1, STAGES.length)} of {STAGES.length}
        </div>
      </div>

      {/* Stepper Grid / Horizontal Bar */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[650px] flex items-center justify-between relative">
          {/* Background Track Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#E3DBCC] -translate-y-1/2 z-0" />

          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex || currentStatus === 'Exchange Completed';
            const isCurrent = idx === currentIndex && currentStatus !== 'Exchange Completed';
            const isUpcoming = idx > currentIndex;

            return (
              <div
                key={stage.key}
                onClick={() => onSelectStage && onSelectStage(stage.key)}
                className={`relative z-10 flex flex-col items-center group cursor-pointer transition-all ${
                  isCurrent ? 'scale-105' : ''
                }`}
              >
                {/* Circle Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-[#101010] text-[#FDFCF8]'
                      : isCurrent
                      ? 'bg-[#FDFCF8] text-[#101010] border-2 border-[#101010] ring-4 ring-[#E3DBCC]'
                      : 'bg-[#F3F0E9] text-[#101010]/40 border border-[#E3DBCC]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
                </div>

                {/* Stage Label */}
                <span
                  className={`text-[11px] font-medium mt-2 text-center max-w-[85px] leading-tight ${
                    isCurrent
                      ? 'text-[#101010] font-bold'
                      : isCompleted
                      ? 'text-[#101010]'
                      : 'text-[#101010]/45'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
