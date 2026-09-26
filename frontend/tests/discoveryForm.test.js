import { test } from 'node:test';
import assert from 'node:assert/strict';
import { discoveryPayload, validateDiscovery } from '../src/components/discovery/discoveryForm.js';
const form = { targetResource: 'aggregate', requiredQuantity: '100', unit: 'tons/month', intendedUse: 'road sub-base', city: 'Pune', state: 'Maharashtra', currentMaterial: '', currentCostPerUnit: '', minimumQuantity: '', neededFrom: '', neededUntil: '', latitude: '', longitude: '', processingAllowed: true, requiredProperties: [], yield: '', processing: '', freight: '' };
test('minimal discovery does not invent financial assumptions or confirmed coordinates', () => {
  const payload = discoveryPayload(form);
  assert.equal(validateDiscovery(form, 2), null);
  assert.equal('currentCostPerUnit' in payload, false);
  assert.deepEqual(payload.scenario, {});
  assert.equal(payload.deliveryLocation.coordinatesConfirmed, false);
  assert.equal(payload.deliveryLocation.latitude, null);
});
test('an explicit zero baseline and processing cost are retained', () => {
  const payload = discoveryPayload({ ...form, currentCostPerUnit: '0', processing: '0' });
  assert.equal(payload.currentCostPerUnit, 0);
  assert.deepEqual(payload.scenario.processing_per_input_tonne, { low: 0, high: 0 });
});
test('first step needs only material and positive quantity', () => {
  assert.equal(validateDiscovery({ ...form, intendedUse: '', city: '', state: '' }, 1), null);
  assert.match(validateDiscovery({ ...form, requiredQuantity: '0' }, 1), /greater than zero/);
  assert.match(validateDiscovery({ ...form, city: '' }, 2), /city and state/);
});
test('human-readable specifications preserve inclusive bounds and measurement basis', () => {
  const payload = discoveryPayload({ ...form, requiredProperties: [{ name: ' moisture ', operator: '<=', value: '5', unit: '%', basis: 'output' }] });
  assert.deepEqual(payload.requiredProperties[0], { name: 'moisture', targetValue: '<= 5 %', basis: 'output' });
});
test('impossible quantity, date, coordinate and yield inputs are rejected', () => {
  for (const changes of [{ minimumQuantity: '101' }, { neededFrom: '2026-10-10', neededUntil: '2026-10-01' }, { latitude: '19' }, { latitude: '91', longitude: '72' }, { yield: '101' }]) assert.ok(validateDiscovery({ ...form, ...changes }, 2));
});
