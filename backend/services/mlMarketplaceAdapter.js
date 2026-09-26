// Explicit mapping from website records to the research-backed ML contract.
// No guessed costs, lab verification, substitute quantities or fallback matches.
class MlIntegrationError extends Error {
  constructor(message, statusCode = 422) { super(message); this.statusCode = statusCode; }
}
const idOf = value => String(value?._id ?? value ?? '');
const number = value => value !== '' && value != null && Number.isFinite(Number(value)) ? Number(value) : null;
const propertyName = value => String(value).trim().toLowerCase().replace(/\s+content$/, '');
function dateOnly(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}
function quantity(value, unit, timing) {
  const amount = number(value);
  if (!(amount > 0)) throw new MlIntegrationError('Enter a positive material quantity.');
  const normalized = String(unit || '').toLowerCase().replace(/\s+/g, '');
  const mass = /^(tons?|tonnes?|mt)(\/month)?$/.test(normalized) ? 1 : /^kg(\/month)?$/.test(normalized) ? 0.001 : null;
  if (mass == null) throw new MlIntegrationError(`The AI assessment supports tonnes or kg, not ${unit}.`);
  if (/weekly|week/i.test(`${unit} ${timing}`)) throw new MlIntegrationError('Enter a monthly or one-time quantity for AI assessment; weekly conversion is not assumed.');
  const period = /one.time|spot/i.test(timing || '') ? 'one_time' : /recurring|monthly|\/month/i.test(`${unit} ${timing}`) ? 'monthly' : 'one_time';
  return { amount: amount * mass, factor: mass, period };
}
function location(value = {}, unknown) {
  const lat = number(value.latitude ?? value.coordinates?.lat);
  const lng = number(value.longitude ?? value.coordinates?.lng);
  // Existing Resource schema historically supplied Mumbai coordinates by default.
  // Only an explicit confirmation makes stored coordinates usable for ranking.
  const confirmed = value.coordinatesConfirmed === true;
  if (!confirmed || lat == null || lng == null || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    unknown.push('location');
    return { region: value.region || value.state || value.city || 'Unconfirmed region', latitude: 0, longitude: 0 };
  }
  return { region: value.region || value.state || value.city || 'Recorded location', latitude: lat, longitude: lng };
}
function parseConstraint(item) {
  const text = String(item.targetValue || '').trim();
  const match = text.match(/^(<=|>=|<|>|=)?\s*(-?\d+(?:\.\d+)?)\s*([^\d]*)$/);
  if (!match || !match[3].trim()) return null;
  const unit = match[3].trim();
  let minimum = null, maximum = null;
  const value = Number(match[2]);
  const operator = match[1] || '=';
  // Strict comparisons and tolerances need an explicit interpretation, not silent relaxation.
  if (operator === '<' || operator === '>') return null;
  if (operator === '<=') maximum = value;
  else if (operator === '>=') minimum = value;
  else minimum = maximum = value;
  return { property: propertyName(item.name), unit, minimum, maximum, essential: true, basis: item.basis || 'output' };
}
function measurements(items = []) {
  const output = {};
  for (const item of items) {
    const match = String(item.value ?? '').trim().match(/^(-?\d+(?:\.\d+)?)\s*(.*)$/);
    if (!match) continue;
    const unit = String(item.unit || match[2]).trim();
    if (!unit) continue;
    output[propertyName(item.name)] = { value: Number(match[1]), unit, basis: item.basis || 'input', source_type: 'self_reported', measured_on: dateOnly(item.measuredOn) };
  }
  return output;
}
function price(value, factor, label) {
  const amount = number(value);
  if (amount == null) return null;
  if (amount < 0) throw new MlIntegrationError(`${label} cannot be negative.`);
  return amount / factor;
}
function buildPayload(requirement, resources, buyerId, options = {}) {
  const unknown = [], warnings = [], today = new Date().toISOString().slice(0, 10);
  const requested = quantity(requirement.requiredQuantity, requirement.unit, requirement.timing);
  const minimum = number(requirement.minimumQuantity) ?? requested.amount / requested.factor;
  if (minimum <= 0 || minimum * requested.factor > requested.amount) throw new MlIntegrationError('Minimum quantity must be positive and no larger than the requested quantity.');
  const raw = requirement.requiredProperties || [];
  const constraints = raw.map(parseConstraint).filter(Boolean);
  if (constraints.length !== raw.length) { unknown.push('specification'); warnings.push('Some property limits could not be interpreted. Use inclusive limits such as <= 5 % or >= 1500 kg/m3; unresolved limits require review.'); }
  const start = dateOnly(requirement.neededFrom), end = dateOnly(requirement.neededUntil);
  if (!start || !end) unknown.push('timing');
  if (start && end && start > end) throw new MlIntegrationError('Needed-until date must follow needed-from date.');
  const target = String(requirement.targetResource || '').trim();
  if (!target) throw new MlIntegrationError('Enter the target material you need, separately from its intended application.');
  const scenario = options.scenario || {};
  const convertedListings = [], byId = new Map();
  let own = 0, skipped = 0;
  for (const doc of resources) {
    const resource = doc.toObject ? doc.toObject() : doc;
    const sellerId = idOf(resource.seller);
    if (sellerId === idOf(buyerId)) { own++; continue; }
    const missing = [];
    try {
      if (!sellerId) throw new MlIntegrationError('Supplier company is missing.');
      const supply = quantity(resource.quantity, resource.unit, resource.availability);
      const availableFrom = dateOnly(resource.availableFrom), availableUntil = dateOnly(resource.availableUntil);
      if (!availableFrom || !availableUntil) missing.push('timing');
      if (!availableUntil) missing.push('inventory');
      if (availableFrom && availableUntil && availableFrom > availableUntil) throw new MlIntegrationError('Supplier dates are invalid.');
      const payload = {
        id: idOf(resource), seller_id: sellerId, unknown_checks: [...new Set(missing)], scenario,
        listing: { material: resource.materialName || resource.title, quantity_tonnes: supply.amount, period: supply.period,
          available_from: availableFrom || (availableUntil && availableUntil < today ? availableUntil : today), available_until: availableUntil || (availableFrom && availableFrom > today ? availableFrom : today),
          location: location(resource.location, missing), price_per_input_tonne: price(resource.basePrice, supply.factor, 'Supplier price'), currency: 'INR',
          confidential: resource.identityVisibility === 'Confidential', properties: measurements(resource.properties),
          sale_mode: resource.sellingMethod === 'Auction' ? 'auction' : resource.sellingMethod === 'Fixed Price' ? 'fixed' : 'negotiation', active: resource.status === 'Active' }
      };
      // Location() can add a missing field after the initial object construction.
      payload.unknown_checks = [...new Set(missing)];
      convertedListings.push(payload); byId.set(payload.id, resource);
    } catch (error) {
      if (!(error instanceof MlIntegrationError)) throw error;
      skipped++; warnings.push(`Listing ${idOf(resource)} was excluded: ${error.message}`);
    }
  }
  if (convertedListings.length > 500) throw new MlIntegrationError('More than 500 listings are available; narrow the inventory search before running discovery.');
  const payload = { buyer_id: idOf(buyerId), requirement_id: idOf(requirement), unknown_checks: unknown,
    requirement: { current_material: requirement.currentMaterial, target_resource: target, intended_application: requirement.intendedUse,
      quantity_output_tonnes: requested.amount, minimum_output_tonnes: minimum * requested.factor, period: requested.period,
      needed_from: start || (end && end < today ? end : today), needed_until: end || (start && start > today ? start : today), location: location(requirement.deliveryLocation, unknown),
      current_delivered_price_per_tonne: price(requirement.currentCostPerUnit, requested.factor, 'Current price'), currency: 'INR', constraints,
      processing_allowed: requirement.processingAllowed !== false, accepted_route_ids: [] }, listings: convertedListings, limit: 10 };
  payload.unknown_checks = [...new Set(unknown)];
  return { payload, byId, warnings, inventoryCount: resources.length, own, skipped };
}
function mapResult(result, resource, requirement) {
  const checks = result.checks || [];
  const fit = code => { const check = checks.find(c => c.code === code); return check?.status === 'pass' ? 100 : check?.status === 'fail' ? 0 : null; };
  const cost = result.cost;
  const perOutput = cost.status === 'estimated' && cost.matched_output_tonnes > 0 ? cost.savings_low / cost.matched_output_tonnes : null;
  return { resource, title: `${resource.materialName || resource.title} → ${result.pathway.output}`, intendedUse: requirement.intendedUse,
    compatibility: { technicalFit: null, quantityFit: fit('quantity'), timingFit: fit('timing'), logisticsFit: null,
      processingFit: fit('processing'), evidenceFit: null, overallScore: result.priority_score },
    whyMatch: { summary: result.explanation, confirmed: checks.filter(c => c.status === 'pass').map(c => c.reason), unknown: checks.filter(c => c.status !== 'pass').map(c => c.reason) },
    opportunityAssessment: { technicalFit: 'Needs buyer validation', practicalFit: result.status.replaceAll('_', ' '), evidence: result.pathway.evidence_status,
      economicPotential: perOutput == null ? 'Missing cost inputs' : `₹${perOutput.toFixed(2)} / usable tonne (conservative scenario)`, environmentalPotential: result.impact.status === 'estimated' ? 'Scenario estimate available' : 'Insufficient impact data' },
    costComparison: { currentMaterialName: requirement.currentMaterial, currentCostPerTon: result.cost.baseline_total && result.cost.matched_output_tonnes ? result.cost.baseline_total / result.cost.matched_output_tonnes : null,
      alternativeMaterialCost: resource.basePrice, processingCost: null, transportCost: null, testingCost: null,
      estimatedSubtotal: cost.status === 'estimated' ? cost.alternative_total.high / cost.matched_output_tonnes : null,
      potentialSavingsPerTon: perOutput, note: 'Calculated from supplied scenario inputs; not a supplier quote.' },
    environmentalScenario: { materialExchangedPerMonth: null, virginMaterialDisplaced: null, residualMaterialUtilized: null,
      transportEmissions: 'Unknown', preparationImpact: 'Unknown', netEnvironmentalScenario: 'No unsupported carbon savings are inferred.' },
    mlAssessment: result, engine: 'w2rkg' };
}
module.exports = { MlIntegrationError, buildPayload, mapResult, parseConstraint, quantity };
