const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPayload, quantity, mapResult, parseConstraint } = require('../services/mlMarketplaceAdapter');
const req = { _id: 'r1', currentMaterial: 'virgin aggregate', targetResource: 'aggregate', intendedUse: 'road sub-base', requiredQuantity: 100, minimumQuantity: 50, unit: 'tons/month', timing: 'Recurring', currentCostPerUnit: 5000, deliveryLocation: { city: 'Pune', state: 'Maharashtra' }, requiredProperties: [{ name: 'Moisture', targetValue: '<= 5 %' }] };
const listing = { _id: 'l1', seller: { _id: 'seller' }, title: 'blast furnace slag', quantity: 500, unit: 'tons/month', availability: 'Recurring', basePrice: 2000, status: 'Active', identityVisibility: 'Confidential', location: { city: 'Nagpur', coordinates: { lat: 19.076, lng: 72.8777 } }, properties: [{ name: 'Moisture Content', value: '4.2%' }] };
test('maps actual material and quantity; does not trust default coordinates or missing dates', () => {
  const result = buildPayload(req, [listing], 'buyer');
  assert.equal(result.payload.listings[0].listing.material, 'blast furnace slag');
  assert.equal(result.payload.listings[0].listing.quantity_tonnes, 500);
  assert.equal(result.payload.requirement.target_resource, 'aggregate');
  assert.deepEqual(result.payload.unknown_checks.sort(), ['location', 'timing']);
  assert.deepEqual(result.payload.listings[0].unknown_checks.sort(), ['inventory', 'location', 'timing']);
  assert.equal(result.payload.listings[0].listing.properties.moisture.basis, 'input');
});
test('kg prices and quantities use the same tonne conversion; zero price is retained', () => {
  const result = buildPayload({ ...req, unit: 'kg/month', requiredQuantity: 100000, minimumQuantity: 50000, currentCostPerUnit: 0 }, [{ ...listing, unit: 'kg/month', quantity: 500000, basePrice: 2 }], 'buyer');
  assert.equal(result.payload.requirement.quantity_output_tonnes, 100);
  assert.equal(result.payload.requirement.current_delivered_price_per_tonne, 0);
  assert.equal(result.payload.listings[0].listing.price_per_input_tonne, 2000);
});
test('unsupported units are excluded; self supply is not sent to ML', () => {
  const result = buildPayload(req, [{ ...listing, unit: 'barrels' }, { ...listing, seller: 'buyer' }], 'buyer');
  assert.equal(result.payload.listings.length, 0); assert.equal(result.skipped, 1); assert.equal(result.own, 1);
  assert.throws(() => quantity(10, 'tons/week', 'Weekly'), /supports|monthly/);
});
test('unparseable acceptance criteria remain an essential unknown', () => {
  const result = buildPayload({ ...req, requiredProperties: [{ name: 'moisture', targetValue: '< 5 %' }] }, [listing], 'buyer');
  assert.ok(result.payload.unknown_checks.includes('specification'));
  assert.equal(parseConstraint({ name: 'Moisture', targetValue: '<= 5 %' }).maximum, 5);
});
test('invalid target, price and minimum are rejected rather than replaced with defaults', () => {
  assert.throws(() => buildPayload({ ...req, targetResource: '' }, [], 'buyer'), /target material/);
  assert.throws(() => buildPayload({ ...req, currentCostPerUnit: -1 }, [], 'buyer'), /negative/);
  assert.throws(() => buildPayload({ ...req, minimumQuantity: 200 }, [], 'buyer'), /Minimum/);
});
test('missing ML economics remains null instead of a fabricated savings figure', () => {
  const result = mapResult({ priority_score: 0, status: 'needs_validation', explanation: 'Test', checks: [], pathway: { output: 'aggregate', evidence_status: 'machine_extracted_unreviewed' }, cost: { status: 'unknown', baseline_total: null, matched_output_tonnes: null }, impact: { status: 'unknown' } }, listing, req);
  assert.equal(result.compatibility.overallScore, 0);
  assert.equal(result.costComparison.potentialSavingsPerTon, null);
  assert.equal(result.compatibility.technicalFit, null);
});

test('omitting the current purchase price preserves an unknown baseline', () => {
  const { currentCostPerUnit, ...withoutPrice } = req;
  const result = buildPayload(withoutPrice, [listing], 'buyer');
  assert.equal(result.payload.requirement.current_delivered_price_per_tonne, null);
});
test('requirement schema permits discovery before the buyer supplies a baseline price', async () => {
  const Requirement = require('../models/Requirement');
  const mongoose = require('mongoose');
  const requirement = new Requirement({ ...req, _id: new mongoose.Types.ObjectId(), buyer: new mongoose.Types.ObjectId(), currentCostPerUnit: undefined });
  await requirement.validate();
  assert.equal(requirement.currentCostPerUnit, undefined);
});
