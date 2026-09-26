// Optional live integration check. Uses a unique disposable MongoDB database,
// actual Express routes, actual JWT login, and the running FastAPI service.
require('dotenv').config({ quiet: true });
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const express = require('express');
const dns = require('node:dns');
const crypto = require('node:crypto');

async function main() {
  if (!process.env.MONGO_URI || !process.env.FASTAPI_ML_TOKEN) throw new Error('Configure backend/.env before this check.');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  const database = `mltest_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  let server;
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: database, serverSelectionTimeoutMS: 15000 });
    const app = express();
    app.use(express.json());
    app.use('/api/auth', require('../routes/authRoutes'));
    app.use('/api/resources', require('../routes/resourceRoutes'));
    app.use('/api/discovery', require('../routes/discoveryRoutes'));
    server = await new Promise(resolve => { const handle = app.listen(0, '127.0.0.1', () => resolve(handle)); });
    const base = `http://127.0.0.1:${server.address().port}/api`;
    async function request(path, data, token, expected = 200) {
      const response = await fetch(base + path, { method: data == null ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(data == null ? {} : { body: JSON.stringify(data) }) });
      const result = await response.json();
      assert.equal(response.status, expected, result.message || JSON.stringify(result));
      return result;
    }
    async function account(role) {
      const name = `Integration ${role} ${database}`;
      return request('/auth/register', { name, companyName: name, email: `${role}@${database}.invalid`, password: crypto.randomBytes(24).toString('hex'), role, industry: 'Steel & Metallurgy', city: 'Pune', state: 'Maharashtra' }, null, 201);
    }
    const seller = await account('seller'), buyer = await account('buyer');
    const today = new Date().toISOString().slice(0, 10);
    const until = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
    const resource = { title: 'blast furnace slag', materialName: 'blast furnace slag', description: 'Synthetic integration fixture; no real material offered.', category: 'By-product', quantity: 500, unit: 'tons/month', availability: 'Recurring', basePrice: 2000, location: { city: 'Nagpur', state: 'Maharashtra', region: 'Western India', coordinates: { lat: 19.5, lng: 72.878 }, coordinatesConfirmed: true }, availableFrom: today, availableUntil: until, properties: [{ name: 'moisture', value: '4.2', unit: '%', basis: 'input' }], identityVisibility: 'Confidential' };
    await request('/resources', resource, seller.token, 201);
    await request('/resources', resource, buyer.token, 201); // own supply must never be recommended
    const input = { currentMaterial: 'virgin aggregate', targetResource: 'aggregate', intendedUse: 'road sub-base', requiredQuantity: 100, minimumQuantity: 50, unit: 'tons/month', timing: 'Recurring', currentCostPerUnit: 5000, neededFrom: today, neededUntil: until, deliveryLocation: { city: 'Pune', state: 'Maharashtra', latitude: 19.076, longitude: 72.878, coordinatesConfirmed: true }, requiredProperties: [{ name: 'moisture', targetValue: '<= 5 %', basis: 'output' }], scenario: { yield_fraction: { low: .8, high: .8 }, processing_per_input_tonne: { low: 400, high: 400 }, transport_per_input_tonne: { low: 400, high: 400 } } };
    await request('/discovery/match', input, null, 401);
    const result = await request('/discovery/match', input, buyer.token);
    assert.equal(result.retrievalBackend, 'sentence_transformers');
    assert.equal(result.totalAnalyzed, 1);
    assert.ok(result.opportunities.length > 0);
    const opportunity = result.opportunities[0];
    assert.equal(opportunity.mlAssessment.cost.savings_low, 150000);
    assert.equal(opportunity.mlAssessment.status, 'needs_validation');
    const serialized = JSON.stringify(opportunity);
    assert.ok(!serialized.includes(seller.user.company.name));
    assert.ok(!serialized.includes('coordinates'));
    assert.ok(!serialized.includes(seller.user._id));
    assert.equal(opportunity.seller.name, 'Confidential supplier');
    const saved = await request(`/discovery/opportunities/${opportunity._id}`, null, buyer.token);
    assert.equal(saved.opportunity.mlAssessment.cost.savings_low, 150000);
    await request(`/discovery/opportunities/${opportunity._id}`, null, seller.token, 404);
    const changed = await request('/discovery/match', { ...input, requiredQuantity: 50 }, buyer.token);
    assert.equal(changed.opportunities[0].mlAssessment.cost.savings_low, 75000);
    const costlier = await request('/discovery/match', { ...input, currentCostPerUnit: 2000 }, buyer.token);
    assert.equal(costlier.opportunities[0].mlAssessment.cost.savings_low, -150000);
    const rejected = await request('/discovery/match', { ...input, requiredProperties: [{ name: 'moisture', targetValue: '<= 3 %', basis: 'input' }] }, buyer.token);
    assert.equal(rejected.opportunities.length, 0);
    assert.ok(rejected.rejectedCount > 0);
    const { currentCostPerUnit, scenario, ...minimal } = input;
    const unpriced = await request('/discovery/match', minimal, buyer.token);
    assert.ok(unpriced.opportunities.length > 0);
    assert.equal(unpriced.opportunities[0].mlAssessment.cost.status, 'unknown');
    assert.equal(unpriced.opportunities[0].mlAssessment.cost.savings_low, null);
    const oldToken = process.env.FASTAPI_ML_TOKEN;
    process.env.FASTAPI_ML_TOKEN = 'intentionally-invalid-test-token';
    await request('/discovery/match', input, buyer.token, 502);
    process.env.FASTAPI_ML_TOKEN = oldToken;
    console.log('PASS: registration, new marketplace listings, real semantic matching, dynamic savings, essential rejection, persistence, buyer isolation, confidential discovery, and explicit ML failure.');
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      // This connection was created solely for our unique test database above.
      assert.equal(mongoose.connection.name, database);
      await mongoose.connection.dropDatabase();
      console.log('Disposable integration database removed; the application database was not changed.');
    }
    await mongoose.disconnect();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
