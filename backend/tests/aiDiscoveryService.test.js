const { test } = require('node:test');
const assert = require('node:assert/strict');
const { callFastApiMlEngine } = require('../services/aiDiscoveryService');

test('uses private endpoint and server-only token; preserves empty results', async () => {
  const oldFetch = global.fetch, oldUrl = process.env.FASTAPI_ML_URL, oldToken = process.env.FASTAPI_ML_TOKEN;
  process.env.FASTAPI_ML_URL = 'http://127.0.0.1:8002/'; process.env.FASTAPI_ML_TOKEN = 'test-private-token';
  try {
    global.fetch = async (url, options) => {
      assert.equal(url, 'http://127.0.0.1:8002/v1/integrations/marketplace/matches');
      assert.equal(options.headers.Authorization, 'Bearer test-private-token');
      return { ok: true, json: async () => ({ results: [], candidates_evaluated: 0 }) };
    };
    assert.deepEqual((await callFastApiMlEngine({})).results, []);
    global.fetch = async () => { throw new Error('offline'); };
    await assert.rejects(callFastApiMlEngine({}), error => error.statusCode === 503);
    global.fetch = async () => ({ ok: false, status: 403, json: async () => ({ detail: 'secret' }) });
    await assert.rejects(callFastApiMlEngine({}), error => error.statusCode === 502 && !error.message.includes('secret'));
    delete process.env.FASTAPI_ML_TOKEN;
    await assert.rejects(callFastApiMlEngine({}), error => error.statusCode === 503);
  } finally {
    global.fetch = oldFetch;
    if (oldUrl == null) delete process.env.FASTAPI_ML_URL; else process.env.FASTAPI_ML_URL = oldUrl;
    if (oldToken == null) delete process.env.FASTAPI_ML_TOKEN; else process.env.FASTAPI_ML_TOKEN = oldToken;
  }
});
