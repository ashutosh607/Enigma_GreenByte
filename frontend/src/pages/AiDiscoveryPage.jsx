import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Compass, Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { runAiDiscovery } from '../store/slices/discoverySlice';
import MlOpportunityAssessment from '../components/MlOpportunityAssessment';

const inputClass = 'w-full rounded-xl border border-[#E3DBCC] bg-white p-3 text-sm text-[#101010] placeholder-[#101010]/40 focus:outline-none focus:border-[#101010] transition-colors';
const today = new Date().toISOString().slice(0, 10);

export default function AiDiscoveryPage() {
  const dispatch = useDispatch();
  const { opportunities, latestResult, analyzing, error } = useSelector((state) => state.discovery);

  const [form, setForm] = useState({
    currentMaterial: '',
    targetResource: '',
    intendedUse: '',
    requiredQuantity: '',
    minimumQuantity: '',
    unit: 'tons/month',
    currentCostPerUnit: '',
    city: '',
    state: '',
    timing: 'Recurring',
    neededFrom: today,
    neededUntil: today,
    latitude: '',
    longitude: '',
    processingAllowed: true,
    requiredProperties: [],
    yield: '',
    processing: '',
    freight: '',
  });

  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const field = (key, title, type = 'text', required = true) => (
    <label className="block text-xs font-mono font-semibold uppercase text-[#101010]/70 space-y-1.5">
      <span>{title} {required && <span className="text-[#059669]">*</span>}</span>
      <input
        className={inputClass}
        type={type}
        required={required}
        value={form[key]}
        step={type === 'number' ? 'any' : undefined}
        onChange={(e) => change(key, e.target.value)}
      />
    </label>
  );

  const submit = (e) => {
    e.preventDefault();
    const scenario = {};
    if (form.yield !== '') {
      scenario.yield_fraction = { low: Number(form.yield) / 100, high: Number(form.yield) / 100 };
    }
    if (form.processing !== '') {
      scenario.processing_per_input_tonne = { low: Number(form.processing), high: Number(form.processing) };
    }
    if (form.freight !== '') {
      scenario.transport_per_input_tonne = { low: Number(form.freight), high: Number(form.freight) };
    }

    dispatch(
      runAiDiscovery({
        currentMaterial: form.currentMaterial,
        targetResource: form.targetResource,
        intendedUse: form.intendedUse,
        requiredQuantity: Number(form.requiredQuantity),
        minimumQuantity:
          form.minimumQuantity === '' ? Number(form.requiredQuantity) : Number(form.minimumQuantity),
        unit: form.unit,
        currentCostPerUnit: Number(form.currentCostPerUnit),
        timing: form.timing,
        neededFrom: form.neededFrom,
        neededUntil: form.neededUntil,
        deliveryLocation: {
          city: form.city,
          state: form.state,
          latitude: form.latitude === '' ? null : Number(form.latitude),
          longitude: form.longitude === '' ? null : Number(form.longitude),
          coordinatesConfirmed: form.latitude !== '' && form.longitude !== '',
        },
        requiredProperties: form.requiredProperties.filter((p) => p.name.trim()),
        processingAllowed: form.processingAllowed,
        scenario,
      })
    );
  };

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-[#101010] py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Animated Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3DBCC] text-[11px] font-mono font-bold uppercase tracking-wider text-[#101010]">
            <Compass className="w-3.5 h-3.5" />
            <span>AI Symbiosis Discovery Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#101010]">
            Discover Industrial Alternatives
          </h1>
          <p className="text-sm sm:text-base text-[#101010]/70 max-w-3xl leading-relaxed">
            Find research-supported secondary material options from live verified industrial listings.
            Review technical feasibility and test evidence before initiating commercial trials.
          </p>
        </motion.header>

        {/* Discovery Input Form with Framer Motion Entrance */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
          className="rounded-3xl border border-[#E3DBCC] bg-white p-6 sm:p-8 space-y-6 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('currentMaterial', 'Material currently purchased')}
            {field('targetResource', 'Target material needed (e.g. aggregate)')}
            {field('intendedUse', 'Intended application (e.g. road sub-base)')}
            {field('currentCostPerUnit', 'Current delivered price (₹ per selected unit)', 'number')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {field('requiredQuantity', 'Desired quantity', 'number')}
            {field('minimumQuantity', 'Minimum acceptable quantity (optional)', 'number', false)}
            <label className="text-xs font-mono font-semibold uppercase text-[#101010]/70 space-y-1.5 block">
              <span>Quantity unit <span className="text-[#059669]">*</span></span>
              <select
                className={inputClass}
                value={form.unit}
                onChange={(e) => {
                  change('unit', e.target.value);
                  change('timing', e.target.value.includes('/month') ? 'Recurring' : 'One-time');
                }}
              >
                <option value="tons/month">Tonnes / month (Recurring)</option>
                <option value="tons">Tonnes, one-time batch</option>
                <option value="kg/month">kg / month (Recurring)</option>
                <option value="kg">kg, one-time</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {field('city', 'Receiving city')}
            {field('state', 'State / region')}
            {field('neededFrom', 'Needed from', 'date')}
            {field('neededUntil', 'Needed until', 'date')}
          </div>

          <details className="space-y-4 rounded-xl border border-[#E3DBCC]/70 bg-[#FDFCF8] p-4 text-xs font-mono">
            <summary className="cursor-pointer font-bold uppercase text-[#101010] flex items-center justify-between">
              <span>Optional facility coordinates</span>
              <span className="text-[10px] text-[#101010]/50">[Click to expand]</span>
            </summary>
            <p className="text-xs font-sans text-[#101010]/70">
              Without confirmed coordinates, distance remains estimated. Enter your receiving plant latitude & longitude when known.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('latitude', 'Latitude', 'number', false)}
              {field('longitude', 'Longitude', 'number', false)}
            </div>
          </details>

          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DBCC]">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#101010]">
                Essential Acceptance Specifications
              </h2>
              <button
                type="button"
                onClick={() =>
                  change('requiredProperties', [
                    ...form.requiredProperties,
                    { name: '', targetValue: '', basis: 'output' },
                  ])
                }
                className="text-xs font-bold text-[#059669] hover:underline cursor-pointer"
              >
                + Add specification
              </button>
            </div>
            <p className="text-xs text-[#101010]/60">
              Use inclusive limits with units, e.g. moisture &le; 5%, entered as &quot;&lt;= 5%&quot;.
            </p>

            {form.requiredProperties.map((p, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                <input
                  required
                  className={inputClass}
                  placeholder="Property (e.g. moisture)"
                  value={p.name}
                  onChange={(e) =>
                    change(
                      'requiredProperties',
                      form.requiredProperties.map((v, i) => (i === index ? { ...v, name: e.target.value } : v))
                    )
                  }
                />
                <input
                  required
                  className={inputClass}
                  placeholder="Target (e.g. <= 5%)"
                  value={p.targetValue}
                  onChange={(e) =>
                    change(
                      'requiredProperties',
                      form.requiredProperties.map((v, i) =>
                        i === index ? { ...v, targetValue: e.target.value } : v
                      )
                    )
                  }
                />
                <select
                  className={inputClass}
                  value={p.basis}
                  onChange={(e) =>
                    change(
                      'requiredProperties',
                      form.requiredProperties.map((v, i) =>
                        i === index ? { ...v, basis: e.target.value } : v
                      )
                    )
                  }
                >
                  <option value="output">Usable output</option>
                  <option value="input">Incoming material</option>
                </select>
                <button
                  className="text-xs text-red-600 hover:underline font-semibold cursor-pointer py-2 text-left sm:text-center"
                  type="button"
                  onClick={() =>
                    change(
                      'requiredProperties',
                      form.requiredProperties.filter((_, i) => i !== index)
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </section>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-[#101010] cursor-pointer">
            <input
              type="checkbox"
              checked={form.processingAllowed}
              onChange={(e) => change('processingAllowed', e.target.checked)}
              className="rounded accent-[#101010]"
            />
            <span>Allow circular transformation routes that require processing / beneficiation</span>
          </label>

          <details className="space-y-4 rounded-xl border border-[#E3DBCC]/70 bg-[#FDFCF8] p-4 text-xs font-mono">
            <summary className="cursor-pointer font-bold uppercase text-[#101010] flex items-center justify-between">
              <span>Optional economic scenario for cost comparison</span>
              <span className="text-[10px] text-[#101010]/50">[Click to expand]</span>
            </summary>
            <p className="text-xs font-sans text-[#101010]/70">
              These assumptions calibrate baseline financial models for this discovery run. Confirm each route before formal order placement.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {field('yield', 'Usable-output yield (%)', 'number', false)}
              {field('processing', 'Processing (₹ / input tonne)', 'number', false)}
              {field('freight', 'Freight (₹ / input tonne)', 'number', false)}
            </div>
          </details>

          <button
            disabled={analyzing}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs font-bold uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Compass className="w-4 h-4" />
            <span>{analyzing ? 'Evaluating Circular Listings…' : 'Find Industrial Alternatives'}</span>
          </button>
        </motion.form>

        {error && (
          <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-mono text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {analyzing && (
          <div role="status" className="rounded-2xl border border-[#101010] bg-white p-6 text-xs font-mono text-[#101010] flex items-center gap-3 shadow-sm animate-pulse">
            <div className="w-4 h-4 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
            <span>Retrieving validated transformation pathways and checking specification compliance…</span>
          </div>
        )}

        {!analyzing && latestResult && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3DBCC] gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010]">
                  {opportunities.length} Potential Alternatives Discovered
                </h2>
                <p className="text-xs text-[#101010]/60 font-mono mt-0.5">
                  {latestResult.totalAnalyzed} listings assessed · {latestResult.candidatesEvaluated} pathways evaluated · {latestResult.rejectedCount} rejected · Retrieval: {latestResult.retrievalBackend} · {latestResult.elapsedMs} ms
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded bg-[#E3DBCC] text-[#101010] font-semibold self-start sm:self-auto">
                ML Match Verified
              </span>
            </div>

            {latestResult.warnings?.map((warning, i) => (
              <p key={i} className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                ⚠ {warning}
              </p>
            ))}

            {opportunities.length === 0 && (
              <div className="rounded-2xl border border-[#E3DBCC] bg-white p-8 text-center text-xs font-mono text-[#101010]/60">
                No supported opportunity met the current checks. Try another material or review available supply; the system does not force a match.
              </div>
            )}

            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <motion.div
                  key={opportunity._id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <MlOpportunityAssessment opportunity={opportunity} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
