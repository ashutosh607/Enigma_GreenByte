const Resource = require("../models/Resource");
const { MlIntegrationError, buildPayload, mapResult } = require("./mlMarketplaceAdapter");

async function callFastApiMlEngine(payload) {
  const url = process.env.FASTAPI_ML_URL;
  const token = process.env.FASTAPI_ML_TOKEN;
  if (!url || !token) throw new MlIntegrationError("AI discovery is not configured. Start the ML service and configure its private connection.", 503);
  let response;
  try {
    response = await fetch(`${url.replace(/\/$/, '')}/v1/integrations/marketplace/matches`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new MlIntegrationError("The AI service is unavailable or timed out. Your marketplace listings are still available; try discovery again shortly.", 503);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new MlIntegrationError(response.status === 422 && typeof error.detail === 'string' ? error.detail : "The AI service could not assess these inputs. Check the service configuration and submitted material data.", response.status === 422 ? 422 : 502);
  }
  const data = await response.json();
  if (!Array.isArray(data.results)) throw new MlIntegrationError("The AI service returned an invalid response.", 502);
  return data;
}

async function discoverAlternatives(requirement, buyerCompanyId, options = {}) {
  const resources = await Resource.find({ status: "Active" }).populate("seller");
  const context = buildPayload(requirement, resources, buyerCompanyId, options);
  const data = await callFastApiMlEngine(context.payload);
  return { matches: data.results.map(result => {
      const resource = context.byId.get(result.listing_id);
      if (!resource) throw new MlIntegrationError("AI response references an unknown listing.", 502);
      return mapResult(result, resource, requirement);
    }), metadata: { engine: 'w2rkg', retrievalBackend: data.retrieval_backend, elapsedMs: data.elapsed_ms,
      totalAnalyzed: context.payload.listings.length, inventoryCount: context.inventoryCount, candidatesEvaluated: data.candidates_evaluated,
      rejectedCount: data.rejected_count, skippedCount: context.skipped, warnings: context.warnings } };
}
module.exports = { discoverAlternatives, callFastApiMlEngine };
