# Frontend API handoff

Base URL: `http://127.0.0.1:8000`. Send `Authorization: Bearer <company-token>` and `Content-Type: application/json`. Company ownership comes from the server-side token, not a body field. Use Swagger `/docs` or the exported `openapi.json` for all fields and validation.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Readiness, retrieval mode and graph counts |
| PUT / GET | `/v1/companies/me` | Record/read own company identity |
| POST | `/v1/listings` | Create supplier listing |
| GET | `/v1/listings?material=slag&offset=0&limit=20` | Marketplace listing summaries |
| GET / PUT | `/v1/listings/{id}` | Read safe listing / replace own listing |
| POST / GET | `/v1/requirements` | Create/list own buyer requirements |
| GET / PUT | `/v1/requirements/{id}` | Read/replace own requirement |
| POST | `/v1/matches` | Discover and rank eligible pathways |
| POST | `/v1/assessments` | Calculate a selected opportunity with a cost/yield scenario |
| GET | `/v1/opportunities/{id}` | Reassess saved scenario against current records |
| POST | `/v1/opportunities/{id}/consent` | Each participant records identity reveal consent |
| GET | `/v1/opportunities/{id}/identities` | Identities after both participants consent |
| POST / GET | `/v1/opportunities/{id}/feedback` | Record/read own validation history |
| GET | `/v1/knowledge/routes?q=aggregate&limit=20` | Explore source-backed material routes |
| POST | `/v1/knowledge/routes` | Separate admin token: add/update reviewed route |
| POST | `/v1/extractions` | Optional configured LLM: private document-text draft |

## Buyer flow

1. Create a requirement (current purchase, desired output, intended use, quantity and essential constraints).
2. `POST /v1/matches`. Render cards using `supplier`, `pathway`, `status`, `checks`, `cost`, `next_actions`.
3. Ask only for missing decision inputs. Call `/v1/assessments` with a chosen `route_id` and scenario.
4. Show estimates and unresolved checks. `ready_for_trial` means ready for a trial, not an approved exchange.
5. If participants want to connect, send consent from each company's authenticated session. No participant can set the other party's consent.
6. Read `/identities` only after both consents. Continue to the existing negotiation/bid flow.
7. Record sample/trial results. Change property evidence or buyer route acceptance explicitly; feedback alone does not silently approve a material.

## Discovery request

```json
{
  "requirement_id": "demo-aggregate",
  "limit": 10,
  "similarity_threshold": 0.75,
  "include_rejected": false,
  "scenarios_by_listing": {
    "demo-slag": {
      "yield_fraction": {"low": 0.8, "high": 0.8},
      "processing_per_input_tonne": {"low": 500, "high": 500},
      "transport_per_input_tonne": {"low": 300, "high": 300}
    }
  }
}
```

`listing_ids` optionally narrows discovery to up to 500 known listings. A request exceeding 2,000 candidate pathways is rejected: narrow the set or raise the threshold. Supply scenarios in discovery when cost should affect ranking. A subsequent discovery replaces the saved scenario for a returned pathway; include the scenario again if it should persist. Saved opportunity GET recomputes current specifications without rerunning retrieval.

## Assessment request

```json
{
  "requirement_id": "demo-aggregate",
  "listing_id": "demo-slag",
  "route_id": "use-the-route-id-returned-by-matches",
  "scenario": {
    "yield_fraction": {"low": 0.8, "high": 0.8},
    "processing_per_input_tonne": {"low": 500, "high": 500},
    "transport_per_input_tonne": {"low": 300, "high": 300},
    "processor_confirmed": false
  }
}
```

Use either `yield_fraction` or `input_tonnes_per_output_tonne`, not both. Cost ranges express user assumptions; they are not statistical confidence intervals. Unknown prices/costs remain null. INR is a currency code, not an automatic conversion. All quantities are tonnes per stated period; monthly amounts are not directly compared with one-time amounts. `additional_inputs_total` is the total allocated co-input cost for the matched output, not a per-tonne cost.

## Output rendering

- `status`: `rejected`, `needs_validation`, `ready_for_trial`.
- `priority_score`: rules-based order from 0–100. Never render as “compatibility probability”.
- `evidence_completeness`: fraction of essential checks with known pass/fail outcomes, 0–1.
- `checks[].status`: `pass`, `fail`, `unknown`; render separately.
- `pathway.references`: DOI links. Imported evidence remains unreviewed.
- `cost.status`: `estimated` or `unknown`; null values are unknown, not zero.
- `cost.savings_low/high`: signed values; losses remain negative.
- `impact.status`: no environmental claim unless explicit factors are supplied.
- `supplier.identity_visible`: when false, render `label` and `region` only.
- `next_actions`: actionable blockers, generated from checks.

Marketplace listing reads do not reveal confidential identity after a consent elsewhere. Identity reveal is scoped to a particular opportunity. Exact coordinates and document filenames/source references are omitted from other companies' listing responses. Seller opportunity views withhold the buyer's baseline costs, impact factors and ranking.

## Updating evidence

`PUT` replaces an entire listing or requirement. Preserve all existing fields when editing. A property's `basis` distinguishes measured residual-input properties from properties of a processed output. Never reuse an input measurement as an output measurement without evidence. `source_type` is a declaration; it is not a “verified” badge. `accepted_route_ids` is the buyer's recorded acceptance, not a legal certificate.

## Errors

`401` invalid/missing company credentials; `403` admin/consent missing; `404` inaccessible/nonexistent owned record; `409` saved graph route no longer available; `422` invalid fields or unsupported pathway; `502` extraction provider/schema failure; `503` extraction not configured. Validation errors use FastAPI's `detail` array. Do not retry 4xx writes blindly.

All mutations are local backend operations. Neither discovery nor consent sends external messages, purchases materials or commits an exchange. Stable opportunity IDs identify requirement/listing/route combinations. Route IDs are opaque; do not calculate them in the frontend.

## Optional extraction

Send `{ "text": "the existing report text", "purpose": "material_properties" }` or `transformation_routes`. The configured provider receives that text only for this call. Results are drafts and are not automatically published. Scanned PDFs and OCR are outside this endpoint. Review extracted numbers and source context before submitting structured measurements.

## Private website bridge

`POST /v1/integrations/marketplace/matches` is reserved for the Node backend. It requires the separate `PS5_BRIDGE_TOKEN`, accepts structured requirements/listings with their server-authorized company IDs and declared missing fields, and uses the same retrieval and assessment engine without persisting or reading demo inventory. Browser clients must use the existing website `/api/discovery/match` endpoint. See the repository `ML_INTEGRATION.md` and generated OpenAPI schema for the payload contract.
