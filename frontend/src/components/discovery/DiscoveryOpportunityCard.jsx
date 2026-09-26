import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, MapPin, LockKeyhole, Check, FileText, Package, CircleHelp } from 'lucide-react';

const money = (value, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
export default function DiscoveryOpportunityCard({ opportunity, index }) {
  const result = opportunity.mlAssessment;
  if (!result) return null;
  const resource = opportunity.resource || {};
  const cost = result.cost;
  const verifiedChecks = result.checks.filter(c => c.status === 'pass');
  const unknownCount = result.checks.filter(c => c.essential && c.status === 'unknown').length;
  const savingsKnown = cost.status === 'estimated' && cost.savings_low != null;
  const negative = savingsKnown && cost.savings_low < 0;
  return <article className="discovery-opportunity">
    <div className="discovery-card-top"><span className={`discovery-status ${result.status === 'ready_for_trial' ? 'is-ready' : ''}`}><span />{result.status === 'ready_for_trial' ? 'Ready to discuss a trial' : 'Potential alternative'}</span><span className="discovery-match-number">OPTION {String(index + 1).padStart(2, '0')}</span></div>
    <div className="discovery-card-main">
      <div className="discovery-material-thumb" aria-hidden="true">{resource.images?.[0] ? <img src={resource.images[0]} alt="" loading="lazy" /> : <Package size={30} strokeWidth={1.3} />}</div>
      <div className="discovery-card-title"><h3>{resource.materialName || resource.title}</h3><p><ArrowRight size={13} /> Potential route to {result.pathway.output}</p></div>
      <div className="discovery-priority"><strong>{Math.round(result.priority_score)}</strong><span>priority / 100</span></div>
    </div>
    <div className="discovery-card-meta"><span><MapPin size={14} />{resource.location?.region || resource.location?.state || 'Region unconfirmed'}</span><span><Package size={14} />{resource.quantity?.toLocaleString()} {resource.unit}</span>{resource.identityVisibility === 'Confidential' && <span><LockKeyhole size={13} />Confidential supplier</span>}</div>
    <div className={`discovery-savings ${negative ? 'is-negative' : ''}`}><div><span className="discovery-overline">{savingsKnown ? negative ? 'Cost difference' : 'Estimated savings' : 'Savings comparison'}</span><strong>{savingsKnown ? `${money(cost.savings_low, cost.currency)}${cost.savings_high !== cost.savings_low ? ` – ${money(cost.savings_high, cost.currency)}` : ''}` : 'Add costs to compare'}</strong><small>{savingsKnown ? `For ${cost.matched_output_tonnes} tonnes of usable output · entered scenario` : 'No prices or processing costs are guessed.'}</small></div>{savingsKnown ? <ArrowUpRight size={22} /> : <CircleHelp size={20} />}</div>
    <div className="discovery-card-evidence"><span><FileText size={14} />{result.pathway.references.length ? `${result.pathway.references.length} research source${result.pathway.references.length > 1 ? 's' : ''}` : 'Direct listing match'}</span><span><Check size={14} />{verifiedChecks.length} checks supported</span></div>
    <details className="discovery-card-details"><summary>Why this option? <span>+</span></summary><p>{result.explanation}</p><ul>{result.next_actions.slice(0, 3).map((action, i) => <li key={i}>{action}</li>)}</ul></details>
    <div className="discovery-card-bottom"><p>{unknownCount ? `${unknownCount} checks still need confirmation` : 'Review before committing to supply'}<small>Priority is a ranking, not a success probability.</small></p><Link to={`/opportunities/${opportunity._id}`} className="discovery-card-link">View opportunity <ArrowUpRight size={16} /></Link></div>
  </article>;
}
