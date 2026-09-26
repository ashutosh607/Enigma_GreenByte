import React from 'react';
import { Link } from 'react-router-dom';

const money = (value, currency = 'INR') => value == null ? 'Unknown' : new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
const label = value => String(value || 'unknown').replaceAll('_', ' ');

export default function MlOpportunityAssessment({ opportunity, detailed = false }) {
  const assessment = opportunity.mlAssessment;
  if (!assessment) return null;
  const { cost, impact, pathway } = assessment;
  return (
    <article className="rounded-2xl border border-[#E3DBCC] bg-white p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-xl font-bold">{opportunity.title}</h2><p className="text-sm mt-1 text-black/60">{label(assessment.status)} · {opportunity.resource?.identityVisibility === 'Confidential' ? 'Confidential supplier' : opportunity.seller?.name || 'Marketplace supplier'}</p></div>
        <div className="text-right"><strong className="text-2xl">{assessment.priority_score}/100</strong><p className="text-xs text-black/60">Priority score · not a success probability</p></div>
      </div>
      <p className="text-sm">{assessment.explanation}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div><h3 className="font-semibold text-sm mb-2">Checks supported by supplied data</h3><ul className="text-sm space-y-1">{assessment.checks.filter(c => c.status === 'pass').map(c => <li key={c.code}>✓ {c.reason}</li>)}</ul></div>
        <div><h3 className="font-semibold text-sm mb-2">Next validation steps</h3><ul className="text-sm space-y-1">{assessment.next_actions.map((action, i) => <li key={i}>• {action}</li>)}</ul></div>
      </div>
      <div className="rounded-xl bg-[#FDFCF8] border border-[#E3DBCC] p-4 text-sm space-y-2">
        <h3 className="font-semibold">Cost for equivalent usable output</h3>
        {cost.status === 'estimated' ? <>
          <p>Compared output: {cost.matched_output_tonnes} tonnes; required input: {cost.input_tonnes?.low}–{cost.input_tonnes?.high} tonnes.</p>
          <p>Current delivered cost: {money(cost.baseline_total, cost.currency)}</p>
          <p>Alternative total: {money(cost.alternative_total?.low, cost.currency)}–{money(cost.alternative_total?.high, cost.currency)}</p>
          <p className="font-semibold">Estimated savings: {money(cost.savings_low, cost.currency)}–{money(cost.savings_high, cost.currency)} ({cost.savings_percent_low?.toFixed(1)}–{cost.savings_percent_high?.toFixed(1)}%)</p>
          <p className="text-xs text-black/60">Scenario based on entered assumptions; negative savings mean the alternative costs more.</p>
        </> : <p>Savings cannot yet be calculated. Missing: {cost.missing.join(', ') || 'confirmed calculation inputs'}.</p>}
        {detailed && <ul className="text-xs text-black/60">{cost.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>}
      </div>
      <div className="text-sm space-y-1"><h3 className="font-semibold">Research-supported pathway</h3><p>{pathway.inputs.join(' + ')} → {pathway.output}</p><p>{pathway.process || 'No transformation process specified.'}</p><p className="text-xs text-black/60">Evidence: {label(pathway.evidence_status)} · Distance band: {pathway.distance_band_km === 'unknown' ? 'Unknown' : pathway.distance_band_km + ' km (straight line)'}</p>
        <ul>{pathway.references.map((ref, i) => <li key={i}><a className="underline" href={ref.url} target="_blank" rel="noreferrer">{ref.doi}</a></li>)}</ul>
      </div>
      {detailed && <><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr><th className="py-2">Check</th><th>Status</th><th>Finding</th></tr></thead><tbody>{assessment.checks.map(c => <tr className="border-t border-[#E3DBCC]" key={c.code}><td className="py-2 pr-3">{c.code}</td><td className="pr-3">{c.status}</td><td>{c.reason}</td></tr>)}</tbody></table></div>
        <p className="text-sm">Environmental impact: {impact.status === 'estimated' ? `${impact.net_kgco2e_low}–${impact.net_kgco2e_high} kg CO₂e net benefit, using ${impact.factor_source}` : 'Unknown; the necessary emissions factors have not been supplied.'}</p>
        <ul className="text-xs text-black/60 space-y-1">{assessment.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></>}
      {!detailed && <Link className="inline-block rounded-lg bg-[#101010] text-white px-5 py-3 text-sm font-semibold" to={`/opportunities/${opportunity._id}`}>View full assessment →</Link>}
    </article>
  );
}
