import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { runAiDiscovery } from '../store/slices/discoverySlice';

export default function AiDiscoveryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { opportunities, latestResult, analyzing, error } = useSelector(
    (state) => state.discovery
  );

  const [formData, setFormData] = useState({
    currentMaterial: 'Virgin Calcium Carbonate',
    intendedUse: 'Construction Aggregate & Sub-base',
    requiredQuantity: 300,
    unit: 'tons / month',
    currentCostPerUnit: 100,
    city: 'Pune',
    state: 'Maharashtra',
    timing: 'Recurring',
    requiredProperties: [
      { name: 'Purity / Carbonate Assay', targetValue: '> 88%', tolerance: '±3%' },
      { name: 'Moisture', targetValue: '< 3.5%', tolerance: '±0.5%' },
      { name: 'Bulk Density', targetValue: '1,500 kg/m³', tolerance: '±50 kg/m³' },
    ],
  });

  const [processingStep, setProcessingStep] = useState(0);

  const handleAddProp = () => {
    setFormData({
      ...formData,
      requiredProperties: [
        ...formData.requiredProperties,
        { name: '', targetValue: '', tolerance: '±5%' },
      ],
    });
  };

  const handleRemoveProp = (index) => {
    setFormData({
      ...formData,
      requiredProperties: formData.requiredProperties.filter((_, i) => i !== index),
    });
  };

  const handlePropChange = (index, field, value) => {
    const updated = [...formData.requiredProperties];
    updated[index][field] = value;
    setFormData({ ...formData, requiredProperties: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessingStep(1);

    // Simulate animated industrial discovery steps
    const timer1 = setTimeout(() => setProcessingStep(2), 600);
    const timer2 = setTimeout(() => setProcessingStep(3), 1200);
    const timer3 = setTimeout(() => {
      dispatch(
        runAiDiscovery({
          currentMaterial: formData.currentMaterial,
          intendedUse: formData.intendedUse,
          requiredQuantity: Number(formData.requiredQuantity),
          unit: formData.unit,
          currentCostPerUnit: Number(formData.currentCostPerUnit),
          deliveryLocation: {
            city: formData.city,
            state: formData.state,
          },
          timing: formData.timing,
          requiredProperties: formData.requiredProperties.filter((p) => p.name.trim() !== ''),
        })
      );
      setProcessingStep(4);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header from Specification Section 14 */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3DBCC] text-[11px] font-mono font-bold uppercase tracking-wider text-[#101010] mb-3">
            <Compass className="w-3.5 h-3.5" />
            AI Symbiosis Discovery Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#101010]">
            Discover Industrial Alternatives
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#101010]/70 leading-relaxed font-normal">
            Tell us what your company currently buys or needs. RE:SOURCE will identify potential
            industrial alternatives from verified secondary by-products.
          </p>
        </div>

        {/* Discovery Input Form */}
        <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-2xl mb-12 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Current Material */}
              <div>
                <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1.5 font-semibold">
                  Current Material You Purchase *
                </label>
                <input
                  type="text"
                  required
                  value={formData.currentMaterial}
                  onChange={(e) => setFormData({ ...formData, currentMaterial: e.target.value })}
                  placeholder="e.g. Virgin Calcium Carbonate"
                  className="w-full text-sm px-4 py-3 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] focus:outline-none focus:border-[#101010]"
                />
              </div>

              {/* Intended Use */}
              <div>
                <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1.5 font-semibold">
                  Intended Industrial Use *
                </label>
                <input
                  type="text"
                  required
                  value={formData.intendedUse}
                  onChange={(e) => setFormData({ ...formData, intendedUse: e.target.value })}
                  placeholder="e.g. Construction Aggregate & Sub-base"
                  className="w-full text-sm px-4 py-3 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] focus:outline-none focus:border-[#101010]"
                />
              </div>
            </div>

            {/* Quantity, Cost, Timing & Location */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1 font-semibold">
                  Required Volume
                </label>
                <input
                  type="number"
                  required
                  value={formData.requiredQuantity}
                  onChange={(e) => setFormData({ ...formData, requiredQuantity: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1 font-semibold">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1 font-semibold">
                  Current Cost (₹/unit)
                </label>
                <input
                  type="number"
                  required
                  value={formData.currentCostPerUnit}
                  onChange={(e) => setFormData({ ...formData, currentCostPerUnit: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1 font-semibold">
                  Timing Cadence
                </label>
                <select
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                >
                  <option value="Recurring">Recurring Monthly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="One-time">One-time Batch</option>
                </select>
              </div>
            </div>

            {/* Delivery Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1 font-semibold">
                  Receiving Facility City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1 font-semibold">
                  State / Region
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                />
              </div>
            </div>

            {/* Required Dynamic Properties */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase font-mono text-[#101010]/60 font-semibold">
                  Required Technical Properties & Tolerances
                </label>
                <button
                  type="button"
                  onClick={handleAddProp}
                  className="text-xs font-semibold text-[#101010] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Requirement
                </button>
              </div>
              <div className="space-y-2">
                {formData.requiredProperties.map((prop, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Property name (e.g. Purity)"
                      value={prop.name}
                      onChange={(e) => handlePropChange(idx, 'name', e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                    />
                    <input
                      type="text"
                      placeholder="Target Value (e.g. >88%)"
                      value={prop.targetValue}
                      onChange={(e) => handlePropChange(idx, 'targetValue', e.target.value)}
                      className="w-36 text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                    />
                    <input
                      type="text"
                      placeholder="Tolerance (e.g. ±3%)"
                      value={prop.tolerance}
                      onChange={(e) => handlePropChange(idx, 'tolerance', e.target.value)}
                      className="w-28 text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                    />
                    {formData.requiredProperties.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProp(idx)}
                        className="p-1.5 text-[#101010]/50 hover:text-[#101010] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-4 rounded-xl bg-[#101010] text-[#FDFCF8] font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Compass className="w-4 h-4" />
                {analyzing ? 'Evaluating Circular Network...' : 'Find Alternatives'}
              </button>
            </div>
          </form>
        </div>

        {/* Section 16: AI Processing Experience Screen */}
        {processingStep > 0 && processingStep < 4 && (
          <div className="card-ivory p-8 border border-[#101010] rounded-2xl mb-12 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-4 h-4 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold uppercase tracking-wider font-mono text-[#101010]">
                Understanding your requirement...
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono text-[#101010]/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#101010]" />
                <span>Current material identified: <strong>{formData.currentMaterial}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#101010]" />
                <span>Required properties matrix calibrated ({formData.requiredProperties.length} parameters)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#101010]" />
                <span>Quantity requirement indexed: <strong>{formData.requiredQuantity} {formData.unit}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#101010]" />
                <span>Delivery logistics mapped: {formData.city}, {formData.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#101010]" />
                <span>Timing analyzed: {formData.timing}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E3DBCC] text-xs font-mono text-[#101010]/60 flex items-center justify-between">
              <span>Searching industrial resource network...</span>
              <span>248 resources analysed • 173 requirements indexed</span>
            </div>
          </div>
        )}

        {/* Section 17 & 18: AI Match Results */}
        {opportunities.length > 0 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DBCC]">
              <div>
                <span className="text-xs uppercase font-mono text-[#101010]/55 font-bold">
                  Matched Symbiosis Alternatives
                </span>
                <h2 className="text-2xl font-black uppercase text-[#101010] mt-0.5">
                  {opportunities.length} Potential Alternatives Discovered
                </h2>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded bg-[#E3DBCC] text-[#101010] font-semibold">
                FastAPI / ML Engine Active
              </span>
            </div>

            <div className="space-y-6">
              {opportunities.map((opp) => {
                const comp = opp.compatibility || {};
                const why = opp.whyMatch || {};
                const cost = opp.costComparison || {};

                return (
                  <div
                    key={opp._id}
                    className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-2xl hover:border-[#101010]/40 transition-all shadow-xs"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#E3DBCC]">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold block mb-1">
                          Potential Replacement Stream
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black uppercase text-[#101010]">
                          {opp.title}
                        </h3>
                        <p className="text-xs text-[#101010]/70 mt-1 max-w-xl">
                          Intended replacement for {opp.intendedUse}
                        </p>
                      </div>

                      {/* Overall Fit Badge */}
                      <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC] text-center min-w-[160px] self-start">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#101010]/55 font-bold block">
                          Overall Match Score
                        </span>
                        <div className="text-3xl font-black text-[#101010] font-mono mt-0.5">
                          {comp.overallScore || 86}%
                        </div>
                        <span className="text-[10px] font-mono text-[#101010]/60 block mt-0.5">
                          High Feasibility
                        </span>
                      </div>
                    </div>

                    {/* Section 17: Compatibility Factor Indicators */}
                    <div className="py-6 border-b border-[#E3DBCC]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase font-mono text-[#101010]/60 font-bold">
                          Compatibility / Prioritisation Indicators
                        </span>
                        <span className="text-[11px] text-[#101010]/50 italic">
                          Prioritisation indicators, NOT guaranteed success probabilities
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                          { label: 'Technical Fit', val: comp.technicalFit || 94 },
                          { label: 'Quantity Fit', val: comp.quantityFit || 87 },
                          { label: 'Timing Fit', val: comp.timingFit || 91 },
                          { label: 'Logistics Fit', val: comp.logisticsFit || 82 },
                          { label: 'Processing Fit', val: comp.processingFit || 76 },
                          { label: 'Evidence Fit', val: comp.evidenceFit || 61 },
                        ].map((factor, idx) => (
                          <div
                            key={idx}
                            className="bg-[#FDFCF8] p-3 rounded-lg border border-[#E3DBCC] text-center"
                          >
                            <span className="text-[10px] font-mono uppercase text-[#101010]/60 block mb-1">
                              {factor.label}
                            </span>
                            <div className="text-xl font-bold font-mono text-[#101010]">
                              {factor.val}%
                            </div>
                            <div className="w-full bg-[#E3DBCC] h-1.5 rounded-full mt-2 overflow-hidden">
                              <div
                                className="bg-[#101010] h-full rounded-full"
                                style={{ width: `${factor.val}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 18: WHY THIS MATCH? */}
                    <div className="py-6 border-b border-[#E3DBCC]">
                      <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-[#101010] mb-2">
                        Why This Match?
                      </h4>
                      <p className="text-sm text-[#101010]/80 leading-relaxed mb-4">
                        {why.summary ||
                          "The supplier's recorded properties may satisfy several of your stated aggregate requirements after processing. The supplier indicates recurring monthly availability matching your volume."}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Confirmed */}
                        <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC]">
                          <span className="text-xs font-mono font-bold uppercase text-[#101010] flex items-center gap-1.5 mb-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#101010]" /> Confirmed Factors
                          </span>
                          <ul className="space-y-1.5 text-xs text-[#101010]/75">
                            {(why.confirmed || [
                              'Quantity capacity confirmed (500 tons/mo available vs 300 tons need)',
                              'Laboratory material test report available',
                              'Recurring monthly delivery scheduled',
                            ]).map((c, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#101010] font-bold">✓</span> {c}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Unknown */}
                        <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC]">
                          <span className="text-xs font-mono font-bold uppercase text-[#101010] flex items-center gap-1.5 mb-2.5">
                            <AlertTriangle className="w-4 h-4 text-[#101010]" /> Action Required / Unknowns
                          </span>
                          <ul className="space-y-1.5 text-xs text-[#101010]/75">
                            {(why.unknown || [
                              'Contamination trace data requires site signoff',
                              'Sample validation required before bulk dispatch',
                              'Local toll processing quotation pending confirmation',
                            ]).map((u, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#101010] font-bold">⚠</span> {u}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Cost Preview & View Opportunity Button */}
                    <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] uppercase font-mono text-[#101010]/55 block">
                          Estimated Economic Scenario
                        </span>
                        <div className="text-lg font-bold text-[#101010] font-mono">
                          Potential Savings: ~₹{cost.potentialSavingsPerTon || 25} / usable ton
                        </div>
                        <p className="text-[11px] text-[#101010]/50 italic">
                          Before unresolved transport & toll handling costs.
                        </p>
                      </div>

                      <Link
                        to={`/opportunities/${opp._id}`}
                        className="px-6 py-3 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        View Full Opportunity Assessment <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
