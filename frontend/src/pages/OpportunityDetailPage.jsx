import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  TrendingDown,
  Layers,
  Leaf,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { discoveryApi, dealApi } from '../services/api';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    discoveryApi
      .getOpportunityById(id)
      .then((res) => {
        setOpportunity(res.data.opportunity);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Opportunity not found');
        setLoading(false);
      });
  }, [id]);

  const handleDoDeal = async () => {
    if (!opportunity) return;
    setInitiating(true);
    try {
      const res = await dealApi.initiateDeal({
        resourceId: opportunity.resource?._id || opportunity.resource,
        opportunityId: opportunity._id,
        quantity: opportunity.environmentalScenario?.materialExchangedPerMonth || 300,
        proposedPrice: opportunity.costComparison?.alternativeMaterialCost || 50,
      });
      navigate(`/deals/${res.data.dealId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate deal');
      setInitiating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#101010] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs uppercase font-mono text-[#101010]/60">
            Synthesizing Symbiosis Parameters...
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
        <div className="card-ivory p-8 border border-[#E3DBCC] max-w-md text-center">
          <p className="text-sm font-bold text-[#101010] mb-4">{error || 'Opportunity not found'}</p>
          <Link
            to="/ai-discovery"
            className="px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-semibold"
          >
            Back to AI Discovery
          </Link>
        </div>
      </div>
    );
  }

  const isConfidential = opportunity.resource?.identityVisibility === 'Confidential';
  const supplierName =
    opportunity.seller?.name || (isConfidential ? '🔐 Confidential Supplier' : 'Verified Producer');

  const assess = opportunity.opportunityAssessment || {};
  const cost = opportunity.costComparison || {};
  const env = opportunity.environmentalScenario || {};

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/ai-discovery"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#101010]/70 hover:text-[#101010] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to AI Alternative Discoveries
        </Link>

        {/* Hero Section from Specification 19 */}
        <div className="card-ivory p-6 sm:p-10 border border-[#E3DBCC] rounded-2xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#101010]" /> Potential Symbiosis Opportunity
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#101010]">
                {opportunity.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-[#101010]/80">
                <div>
                  <span className="font-mono text-[#101010]/50 uppercase block text-[10px]">
                    Material
                  </span>
                  <span className="font-bold text-[#101010] text-sm">
                    {opportunity.resource?.title || 'Steel Slag'}
                  </span>
                </div>

                <div>
                  <span className="font-mono text-[#101010]/50 uppercase block text-[10px]">
                    Potential Use
                  </span>
                  <span className="font-bold text-[#101010] text-sm">
                    {opportunity.intendedUse || 'Aggregate'}
                  </span>
                </div>

                <div>
                  <span className="font-mono text-[#101010]/50 uppercase block text-[10px]">
                    Supplier
                  </span>
                  <span className="font-bold text-[#101010] text-sm flex items-center gap-1">
                    {isConfidential && <Lock className="w-3.5 h-3.5 text-[#101010]" />}
                    {supplierName}
                  </span>
                </div>
              </div>
            </div>

            {/* DO DEAL CTA (Section 22) */}
            <div className="self-start md:self-center">
              <button
                type="button"
                onClick={handleDoDeal}
                disabled={initiating}
                className="px-8 py-4 rounded-xl bg-[#101010] text-[#FDFCF8] font-bold text-base hover:bg-black transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{initiating ? 'Opening Deal Ledger...' : 'Do Deal'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-[11px] text-center text-[#101010]/50 mt-1.5 font-mono">
                Initiates structured commercial deal
              </p>
            </div>
          </div>
        </div>

        {/* Opportunity Assessment Grid (Specification Section 19) */}
        <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-2xl mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-4">
            Opportunity Assessment Matrix
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC] text-center">
              <span className="text-[10px] font-mono uppercase text-[#101010]/55 block mb-1">
                Technical Fit
              </span>
              <div className="text-xl font-black text-[#101010]">{assess.technicalFit || 'High'}</div>
            </div>

            <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC] text-center">
              <span className="text-[10px] font-mono uppercase text-[#101010]/55 block mb-1">
                Practical Fit
              </span>
              <div className="text-xl font-black text-[#101010]">{assess.practicalFit || 'Medium'}</div>
            </div>

            <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC] text-center">
              <span className="text-[10px] font-mono uppercase text-[#101010]/55 block mb-1">
                Evidence
              </span>
              <div className="text-xl font-black text-[#101010]">{assess.evidence || 'Medium'}</div>
            </div>

            <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC] text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-[#101010]/55 block mb-1">
                Economic Potential
              </span>
              <div className="text-xs font-bold text-[#101010] mt-1">{assess.economicPotential || 'Pending transport quote'}</div>
            </div>

            <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC] text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-[#101010]/55 block mb-1">
                Environmental
              </span>
              <div className="text-xs font-bold text-[#101010] mt-1">{assess.environmentalPotential || 'Positive scenario'}</div>
            </div>
          </div>
        </div>

        {/* Section 20 & 21: Cost Comparison & Environmental Scenario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Section 20: Cost Comparison */}
          <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DBCC]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#101010] font-bold">
                  Cost Comparison Breakdown
                </h3>
                <span className="text-[11px] font-mono text-[#101010]/50">Per Usable Ton</span>
              </div>

              {/* Current Virgin Material */}
              <div className="my-5 p-4 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC]">
                <div className="text-xs font-mono uppercase text-[#101010]/55">
                  Current Material ({cost.currentMaterialName || 'Virgin Raw Material'})
                </div>
                <div className="text-2xl font-bold font-mono text-[#101010] mt-1">
                  ₹{cost.currentCostPerTon || 100} <span className="text-xs font-normal text-[#101010]/60">/ usable ton</span>
                </div>
              </div>

              {/* Potential Alternative */}
              <div className="space-y-2.5 text-xs text-[#101010]/80">
                <span className="font-mono uppercase font-bold text-[11px] text-[#101010] block mb-2">
                  Potential Secondary Alternative
                </span>
                <div className="flex justify-between pb-1.5 border-b border-[#E3DBCC]/60">
                  <span>Material Base:</span>
                  <span className="font-mono font-bold text-[#101010]">₹{cost.alternativeMaterialCost || 50}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#E3DBCC]/60">
                  <span>Toll Processing (Screening / Calcining):</span>
                  <span className="font-mono font-bold text-[#101010]">₹{cost.processingCost || 15}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#E3DBCC]/60">
                  <span>Estimated Freight Transport:</span>
                  <span className="font-mono font-bold text-[#101010]">₹{cost.transportCost || 10}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#E3DBCC]/60">
                  <span>Assay & Quality Testing:</span>
                  <span className="font-mono font-bold text-[#101010]">TBD</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm text-[#101010]">
                  <span>Estimated Subtotal:</span>
                  <span className="font-mono">₹{cost.estimatedSubtotal || 75} / ton</span>
                </div>
              </div>
            </div>

            {/* Potential Savings Banner */}
            <div className="mt-6 p-4 rounded-xl bg-[#E3DBCC] text-[#101010]">
              <div className="text-xs font-bold uppercase tracking-wider font-mono">
                Potential Savings: ₹{cost.potentialSavingsPerTon || 25} / usable ton
              </div>
              <p className="text-[11px] text-[#101010]/70 mt-1 italic">
                * Note: Do not call this guaranteed savings. Potential savings before unresolved freight & secondary handling costs.
              </p>
            </div>
          </div>

          {/* Section 21: Environmental Scenario */}
          <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DBCC]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#101010] font-bold flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-[#101010]" /> Environmental Scenario
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] font-bold">
                  Estimated Scenario
                </span>
              </div>

              <div className="space-y-4 my-6 text-xs text-[#101010]">
                <div className="p-3 bg-[#FDFCF8] rounded-lg border border-[#E3DBCC] flex justify-between items-center">
                  <span className="text-[#101010]/70">Potential Material Exchanged:</span>
                  <span className="font-mono font-bold text-sm text-[#101010]">
                    {env.materialExchangedPerMonth || 300} tons / month
                  </span>
                </div>

                <div className="p-3 bg-[#FDFCF8] rounded-lg border border-[#E3DBCC] flex justify-between items-center">
                  <span className="text-[#101010]/70">Potential Virgin Material Displaced:</span>
                  <span className="font-mono font-bold text-sm text-[#101010]">
                    {env.virginMaterialDisplaced || 300} tons / month
                  </span>
                </div>

                <div className="p-3 bg-[#FDFCF8] rounded-lg border border-[#E3DBCC] flex justify-between items-center">
                  <span className="text-[#101010]/70">Potential Residual Material Utilized:</span>
                  <span className="font-mono font-bold text-sm text-[#101010]">
                    {env.residualMaterialUtilized || 300} tons / month
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FDFCF8] rounded-lg border border-[#E3DBCC]">
                    <span className="text-[10px] uppercase font-mono text-[#101010]/60 block mb-1">
                      Transport Emissions
                    </span>
                    <span className="font-mono font-semibold text-[#101010]">
                      {env.transportEmissions || 'Estimated 14 kg CO2e / ton'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FDFCF8] rounded-lg border border-[#E3DBCC]">
                    <span className="text-[10px] uppercase font-mono text-[#101010]/60 block mb-1">
                      Preparation Impact
                    </span>
                    <span className="font-mono font-semibold text-[#101010]">
                      {env.preparationImpact || 'Estimated 6 kg CO2e / ton'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC] text-xs text-[#101010]/80">
              <strong className="block text-[#101010] font-mono uppercase mb-1">
                Net Environmental Scenario:
              </strong>
              {env.netEnvironmentalScenario ||
                'Net reduction of ~74% CO2e compared to conventional quarrying and virgin mineral extraction.'}
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="card-ivory p-6 border border-[#101010] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDFCF8]">
          <div>
            <div className="text-sm font-bold text-[#101010]">Ready to proceed commercially?</div>
            <div className="text-xs text-[#101010]/60">
              Creating a deal initializes engineering assessment and structured price slider negotiation.
            </div>
          </div>
          <button
            type="button"
            onClick={handleDoDeal}
            disabled={initiating}
            className="px-8 py-3.5 rounded-xl bg-[#101010] text-[#FDFCF8] font-bold text-sm hover:bg-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{initiating ? 'Initializing...' : 'Do Deal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
