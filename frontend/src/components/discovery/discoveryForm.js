export function discoveryPayload(form) {
  const scenario = {};
  if (form.yield !== '') scenario.yield_fraction = { low: Number(form.yield) / 100, high: Number(form.yield) / 100 };
  if (form.processing !== '') scenario.processing_per_input_tonne = { low: Number(form.processing), high: Number(form.processing) };
  if (form.freight !== '') scenario.transport_per_input_tonne = { low: Number(form.freight), high: Number(form.freight) };
  return {
    currentMaterial: form.currentMaterial.trim() || 'Current material not specified',
    targetResource: form.targetResource.trim(), intendedUse: form.intendedUse.trim(), requiredQuantity: Number(form.requiredQuantity),
    minimumQuantity: form.minimumQuantity === '' ? Number(form.requiredQuantity) : Number(form.minimumQuantity),
    unit: form.unit, timing: form.unit.includes('/month') ? 'Recurring' : 'One-time',
    ...(form.currentCostPerUnit !== '' ? { currentCostPerUnit: Number(form.currentCostPerUnit) } : {}),
    ...(form.neededFrom ? { neededFrom: form.neededFrom } : {}), ...(form.neededUntil ? { neededUntil: form.neededUntil } : {}),
    deliveryLocation: { city: form.city.trim(), state: form.state.trim(), latitude: form.latitude === '' ? null : Number(form.latitude), longitude: form.longitude === '' ? null : Number(form.longitude), coordinatesConfirmed: form.latitude !== '' && form.longitude !== '' },
    processingAllowed: form.processingAllowed,
    requiredProperties: form.requiredProperties.map(p => ({ name: p.name.trim(), targetValue: `${p.operator} ${p.value} ${p.unit}`, basis: p.basis })), scenario,
  };
}
export function validateDiscovery(form, step) {
  if (!form.targetResource.trim()) return 'Tell us which material you need.';
  if (!(Number(form.requiredQuantity) > 0)) return 'Enter a quantity greater than zero.';
  if (step === 1) return null;
  if (!form.intendedUse.trim()) return 'Tell us how you plan to use the material.';
  if (!form.city.trim() || !form.state.trim()) return 'Add your receiving city and state.';
  if (form.minimumQuantity !== '' && (!(Number(form.minimumQuantity) > 0) || Number(form.minimumQuantity) > Number(form.requiredQuantity))) return 'Minimum quantity must be positive and no higher than your desired quantity.';
  if (form.currentCostPerUnit !== '' && (!Number.isFinite(Number(form.currentCostPerUnit)) || Number(form.currentCostPerUnit) < 0)) return 'Current cost must be zero or higher.';
  if (form.neededFrom && form.neededUntil && form.neededUntil < form.neededFrom) return 'The end date must follow the start date.';
  if ((form.latitude === '') !== (form.longitude === '')) return 'Enter both coordinates, or leave both blank.';
  if (form.latitude !== '' && (Math.abs(Number(form.latitude)) > 90 || Math.abs(Number(form.longitude)) > 180)) return 'Check the facility coordinates.';
  if (form.yield !== '' && (!(Number(form.yield) > 0) || Number(form.yield) > 100)) return 'Usable yield must be between 0 and 100%.';
  if ([form.processing, form.freight].some(v => v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0))) return 'Processing and freight costs must be zero or higher.';
  if (form.requiredProperties.some(p => !p.name.trim() || p.value === '' || !Number.isFinite(Number(p.value)) || !p.unit.trim())) return 'Complete each specification, or remove the ones you do not need.';
  return null;
}
