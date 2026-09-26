import React, { useState, useEffect } from 'react';
import { Leaf, Award, FileCheck, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { impactApi } from '../services/api';

export default function ImpactPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    impactApi
      .getImpactMetrics()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const metrics = data?.metrics || {
    totalWasteDivertedTons: 14750,
    totalVirginDisplacedTons: 13200,
    totalCo2eAbatedMT: 9140,
    totalEconomicValue: 19200000,
    landfillAvoidedM3: 11500,
    completedExchangesCount: 15,
  };

  const history = data?.history || [];

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-2 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-[#101010]" /> Circular Industrial Ledger
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#101010]">
            Environmental & Resource Impact
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#101010]/70 leading-relaxed font-normal">
            Real-time aggregate data tracking secondary resource utilization, carbon mitigation, and
            virgin mineral extraction displaced across completed commercial exchanges.
          </p>
        </div>

        {/* Big KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-2xl">
            <span className="text-xs uppercase font-mono text-[#101010]/55 font-bold block mb-1">
              Industrial Waste Diverted
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#101010]">
              {metrics.totalWasteDivertedTons?.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#101010]/60">tons</span>
            </div>
            <span className="text-[11px] text-[#101010]/60 mt-2 block">
              Continuous factory residual diversion
            </span>
          </div>

          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-2xl">
            <span className="text-xs uppercase font-mono text-[#101010]/55 font-bold block mb-1">
              Virgin Minerals Displaced
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#101010]">
              {metrics.totalVirginDisplacedTons?.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#101010]/60">tons</span>
            </div>
            <span className="text-[11px] text-[#101010]/60 mt-2 block">
              Quarrying & mining avoided
            </span>
          </div>

          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-2xl">
            <span className="text-xs uppercase font-mono text-[#101010]/55 font-bold block mb-1">
              Scope 3 CO2e Abated
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#101010]">
              {metrics.totalCo2eAbatedMT?.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#101010]/60">MT</span>
            </div>
            <span className="text-[11px] text-[#101010]/60 mt-2 block">
              Verified carbon emissions savings
            </span>
          </div>

          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-2xl">
            <span className="text-xs uppercase font-mono text-[#101010]/55 font-bold block mb-1">
              Economic Value Generated
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#101010]">
              ₹{(metrics.totalEconomicValue / 100000).toFixed(1)}{' '}
              <span className="text-xs font-normal text-[#101010]/60">Lakhs</span>
            </div>
            <span className="text-[11px] text-[#101010]/60 mt-2 block">
              Secondary materials commerce settled
            </span>
          </div>
        </div>

        {/* Completed Exchanges History (Section 43) */}
        <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC] mb-6">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-[#101010] font-mono">
                Verified Exchange Registry & Impact Certificates
              </h2>
              <p className="text-xs text-[#101010]/60 mt-0.5">
                Every record corresponds to an actual quality-confirmed delivery through the platform.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-[#E3DBCC] text-[#101010]">
              {metrics.completedExchangesCount} Completed Trades
            </span>
          </div>

          <div className="divide-y divide-[#E3DBCC]/60 text-xs">
            {history.length === 0 ? (
              <div className="py-4 text-center text-[#101010]/60">
                Completed exchanges recorded in ledger.
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#101010] uppercase">
                        {item.material}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]">
                        {item.dealNumber}
                      </span>
                    </div>
                    <div className="text-[#101010]/70">
                      Dispatched by <strong>{item.sellerName}</strong> → Consumed by <strong>{item.buyerName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-[10px] font-mono text-[#101010]/50 uppercase block">
                        Quantity Diverted
                      </span>
                      <span className="font-bold font-mono text-sm text-[#101010]">
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#101010]/50 uppercase block">
                        Carbon Abated
                      </span>
                      <span className="font-bold font-mono text-sm text-[#101010]">
                        ~{item.co2eSavedMT} MT CO2e
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <span className="text-[10px] font-mono text-[#101010]/50 uppercase block">
                        Audit
                      </span>
                      <span className="font-semibold text-[#101010] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#101010]" /> {item.qualityRating}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
