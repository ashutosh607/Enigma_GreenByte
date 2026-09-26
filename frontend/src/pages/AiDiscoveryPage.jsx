import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { runAiDiscovery } from '../store/slices/discoverySlice';
import MlOpportunityAssessment from '../components/MlOpportunityAssessment';

const inputClass = 'w-full rounded-lg border border-[#E3DBCC] bg-white p-3 text-sm';
const today = new Date().toISOString().slice(0, 10);
export default function AiDiscoveryPage() {
  const dispatch = useDispatch();
  const { opportunities, latestResult, analyzing, error } = useSelector(state => state.discovery);
  const [form, setForm] = useState({ currentMaterial: '', targetResource: '', intendedUse: '', requiredQuantity: '', minimumQuantity: '',
    unit: 'tons/month', currentCostPerUnit: '', city: '', state: '', timing: 'Recurring', neededFrom: today, neededUntil: today,
    latitude: '', longitude: '', processingAllowed: true, requiredProperties: [], yield: '', processing: '', freight: '' });
  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const field = (key, title, type = 'text', required = true) => <label className="block text-sm space-y-1"><span className="font-semibold">{title}</span><input className={inputClass} type={type} required={required} value={form[key]} step={type === 'number' ? 'any' : undefined} onChange={e => change(key, e.target.value)} /></label>;
  const submit = e => {
    e.preventDefault();
    const scenario = {};
    if (form.yield !== '') scenario.yield_fraction = { low: Number(form.yield) / 100, high: Number(form.yield) / 100 };
    if (form.processing !== '') scenario.processing_per_input_tonne = { low: Number(form.processing), high: Number(form.processing) };
    if (form.freight !== '') scenario.transport_per_input_tonne = { low: Number(form.freight), high: Number(form.freight) };
    dispatch(runAiDiscovery({ currentMaterial: form.currentMaterial, targetResource: form.targetResource, intendedUse: form.intendedUse,
      requiredQuantity: Number(form.requiredQuantity), minimumQuantity: form.minimumQuantity === '' ? Number(form.requiredQuantity) : Number(form.minimumQuantity),
      unit: form.unit, currentCostPerUnit: Number(form.currentCostPerUnit), timing: form.timing, neededFrom: form.neededFrom, neededUntil: form.neededUntil,
      deliveryLocation: { city: form.city, state: form.state, latitude: form.latitude === '' ? null : Number(form.latitude), longitude: form.longitude === '' ? null : Number(form.longitude), coordinatesConfirmed: form.latitude !== '' && form.longitude !== '' },
      requiredProperties: form.requiredProperties.filter(p => p.name.trim()), processingAllowed: form.processingAllowed, scenario }));
  };
  return <main className="min-h-screen bg-[#FDFCF8] text-[#101010] py-12"><div className="max-w-6xl mx-auto px-4 space-y-8">
    <header><h1 className="text-3xl font-black uppercase">Discover Industrial Alternatives</h1><p className="mt-3 text-black/70">Find research-supported options from actual marketplace listings. Review feasibility and missing evidence before arranging a trial.</p></header>
    <form onSubmit={submit} className="rounded-2xl border border-[#E3DBCC] bg-white p-6 space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">{field('currentMaterial', 'Material currently purchased')}{field('targetResource', 'Target material needed (e.g. aggregate)')}{field('intendedUse', 'Intended application (e.g. road sub-base)')}{field('currentCostPerUnit', 'Current delivered price (₹ per selected mass unit)', 'number')}</div>
      <div className="grid sm:grid-cols-3 gap-4">{field('requiredQuantity', 'Desired quantity', 'number')}{field('minimumQuantity', 'Minimum acceptable quantity (optional)', 'number', false)}<label className="text-sm space-y-1 block"><span className="font-semibold">Quantity unit</span><select className={inputClass} value={form.unit} onChange={e => { change('unit', e.target.value); change('timing', e.target.value.includes('/month') ? 'Recurring' : 'One-time'); }}><option value="tons/month">Tonnes / month</option><option value="tons">Tonnes, one-time</option><option value="kg/month">kg / month</option><option value="kg">kg, one-time</option></select></label></div>
      <div className="grid sm:grid-cols-2 gap-4">{field('city', 'Receiving city')}{field('state', 'State / region')}{field('neededFrom', 'Needed from', 'date')}{field('neededUntil', 'Needed until', 'date')}</div>
      <details className="space-y-4"><summary className="cursor-pointer font-semibold">Optional facility coordinates</summary><p className="text-sm text-black/60">Without confirmed coordinates, distance remains unknown. Enter the receiving facility location when known.</p><div className="grid sm:grid-cols-2 gap-4">{field('latitude', 'Latitude', 'number', false)}{field('longitude', 'Longitude', 'number', false)}</div></details>
      <section className="space-y-3"><div className="flex justify-between"><h2 className="font-semibold">Essential acceptance specifications</h2><button type="button" onClick={() => change('requiredProperties', [...form.requiredProperties, { name: '', targetValue: '', basis: 'output' }])} className="text-sm underline">Add specification</button></div><p className="text-xs text-black/60">Use inclusive limits with units, such as moisture ≤ 5 %, entered as &quot;&lt;= 5 %&quot;. Missing specifications remain unvalidated.</p>
        {form.requiredProperties.map((p, index) => <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2"><input required className={inputClass} placeholder="Property, e.g. moisture" value={p.name} onChange={e => change('requiredProperties', form.requiredProperties.map((v, i) => i === index ? { ...v, name: e.target.value } : v))} /><input required className={inputClass} placeholder="e.g. <= 5 %" value={p.targetValue} onChange={e => change('requiredProperties', form.requiredProperties.map((v, i) => i === index ? { ...v, targetValue: e.target.value } : v))} /><select className={inputClass} value={p.basis} onChange={e => change('requiredProperties', form.requiredProperties.map((v, i) => i === index ? { ...v, basis: e.target.value } : v))}><option value="output">Usable output</option><option value="input">Incoming material</option></select><button className="text-sm underline" type="button" onClick={() => change('requiredProperties', form.requiredProperties.filter((_, i) => i !== index))}>Remove</button></div>)}
      </section>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.processingAllowed} onChange={e => change('processingAllowed', e.target.checked)} />Allow routes that require processing</label>
      <details className="space-y-4"><summary className="cursor-pointer font-semibold">Optional cost scenario for comparison</summary><p className="text-sm text-black/60">These assumptions apply to this discovery run, not as verified supplier quotes. Leave unknown inputs blank. Confirm each route before relying on a scenario.</p><div className="grid sm:grid-cols-3 gap-4">{field('yield', 'Usable-output yield (%)', 'number', false)}{field('processing', 'Processing (₹ / input tonne)', 'number', false)}{field('freight', 'Freight (₹ / input tonne)', 'number', false)}</div><p className="text-xs text-black/60">Handling and testing default to zero in this illustrative scenario; confirm these before a real purchasing decision.</p></details>
      <button disabled={analyzing} className="rounded-lg bg-black text-white px-6 py-3 font-semibold disabled:opacity-50">{analyzing ? 'Evaluating marketplace listings…' : 'Find alternatives'}</button>
    </form>
    {error && <p role="alert" className="rounded-xl border border-red-300 p-4 text-red-800">{error}</p>}
    {analyzing && <p role="status">Retrieving supported transformation routes and checking your requirements…</p>}
    {!analyzing && latestResult && <section className="space-y-4"><div><h2 className="text-xl font-bold">{opportunities.length} potential alternatives</h2><p className="text-sm text-black/60">{latestResult.totalAnalyzed} listings assessed · {latestResult.candidatesEvaluated} pathways evaluated · {latestResult.rejectedCount} rejected · Retrieval: {latestResult.retrievalBackend} · {latestResult.elapsedMs} ms</p></div>
      {latestResult.warnings?.map((warning, i) => <p key={i} className="text-sm text-amber-800">{warning}</p>)}
      {opportunities.length === 0 && <p>No supported opportunity met the current checks. Try another material or review available supply; the system does not force a match.</p>}
      {opportunities.map(opportunity => <MlOpportunityAssessment key={opportunity._id} opportunity={opportunity} />)}
    </section>}
  </div></main>;
}
