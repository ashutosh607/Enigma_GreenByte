# PS5 industrial symbiosis AI backend

An executable FastAPI service for the optional AI mode of your marketplace. It imports the paper authors' actual **33,679-relationship W2RKG** and adds company-specific checks, input/output measurement bases, co-input dependencies, scenario costs, rankings, explanations, confidentiality, and validation history.

This is a working hackathon backend, not a trained predictor of successful industrial exchanges. A research route is a candidate; specifications, process arrangements and buyer acceptance still need confirmation. No universal waste certificate is required or generated.

## Start locally

From this folder, with Python 3.11 or newer:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.lock
pip install --no-deps -e .
PS5_DEMO=1 python -m uvicorn ps5.api:app --host 127.0.0.1 --port 8000
```

- API docs: http://127.0.0.1:8000/docs
- Machine-readable contract: http://127.0.0.1:8000/openapi.json
- Health and loaded data counts: http://127.0.0.1:8000/health
- Demo buyer bearer token: `demo-buyer-token`
- Demo seller bearer token: `demo-seller-token`

Demo companies, prices and properties are synthetic. The graph and DOI references are from the authors. Demo seeding uses today's date and runs once for each new database. To reset, stop the server and remove your disposable `var/` directory.

The default application has demo mode **disabled**. Without server-provisioned keys, protected endpoints return 401. Set `PS5_TOKENS` to a JSON mapping from long random bearer keys to company IDs, or replace the `company` dependency in `ps5/api.py` with your team's validated login/JWT integration. Company IDs in request bodies are not trusted. Admin actions require a separate `PS5_ADMIN_TOKEN`.

`.env.example` documents the configuration. The app does not automatically read `.env`; pass environment variables using your deployment system or a reviewed dotenv loader.

## What is implemented

| Capability | Implementation |
|---|---|
| Research knowledge | Actual author JSON; DOI/chunk provenance; indexed material routes; obvious malformed/nonmaterial records quarantined |
| Retrieval | Exact names, conservative aliases, fast lexical fallback; optional sentence-transformer semantic retrieval |
| Specification assessment | Pass/fail/unknown, essential versus optional constraints, compatible unit conversions, measurement freshness, input versus output basis |
| Quantity and timing | Minimum usable output, conservative yield/replacement ratios, matching supply periods and delivery windows |
| Processing | Explicit processing permission/confirmation, reviewer-recorded application context, concurrent input dependencies |
| Cost | Price + processing + transport + handling + testing + co-input costs; low/high assumptions; equivalent usable output |
| Environmental estimate | Baseline versus alternative upstream, processing and delivery factors; explicit unknown when absent |
| Ranking | Transparent rules; essential failures override ranking; completeness reported separately; no success percentages |
| Explanations | Deterministic text from checks; source references; blockers and next actions |
| Privacy | Response whitelists, hidden exact coordinates/document references, per-opportunity mutual reveal, tenant isolation |
| Learning data | Private participant stage/outcome feedback; not automatically treated as verified success |
| Persistence | SQLite WAL; records survive restart; current records reassessed when opportunities are retrieved |
| Document assistance | Optional OpenAI-compatible text extraction; schema validation; quotation checks; drafts require review |
| Incremental knowledge | Admin-reviewed route ingestion without rebuilding the graph; explicit multi-input routes |
| Frontend integration | Versioned endpoints, OpenAPI, TypeScript helper and examples, configurable CORS |

The privacy rule is identity confidentiality, not guaranteed anonymity. Rare material, quantity or region combinations can identify a company. Free-text material/property fields should not contain company names. The backend never labels a supplier "verified" merely because it has an account or uploaded a report.

## Enable semantic retrieval

```bash
pip install '.[embeddings]'
PS5_DEMO=1 PS5_EMBEDDINGS=sentence_transformers \
  PS5_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2 \
  python -m uvicorn ps5.api:app --host 127.0.0.1 --port 8000
```

The lightweight example is a deployment option, **not** the embedding model evaluated by the paper. The authors use `Alibaba-NLP/gte-large-en-v1.5`. Set `PS5_EMBEDDING_MODEL` to that model or a compatible reviewed local export if your runtime supports it. This service does not enable `trust_remote_code`; checkpoints that require arbitrary remote model code must be independently reviewed/adapted before use. Thresholds need evaluation for the selected model, terminology and sector.

Embeddings are computed at startup for the unique material names and cached in memory. Startup includes model loading; readiness is reported only after the graph and encoder are initialized. FastAPI runs blocking inference/database operations in its request thread pool. The default lexical mode needs no GPU, API key, model download or external service. It is reported as `lexical` in health and matching responses, never presented as semantic AI.

## Frontend integration

See [the API guide](docs/API.md), [the TypeScript client](docs/client.ts), and [the model specification](docs/MODEL.md). `docs/openapi.json` is an exported snapshot of the running application's contract.

```bash
curl http://127.0.0.1:8000/v1/matches \
  -H 'Authorization: Bearer demo-buyer-token' \
  -H 'Content-Type: application/json' \
  -d '{"requirement_id":"demo-aggregate"}'
```

For a complete local demo, run `python scripts/demo_flow.py` in another terminal while the explicitly enabled demo server is running. It discovers slag → aggregate, supplies an illustrative 80% yield and cost scenario, obtains ₹150,000 estimated savings for 100 tonnes, confirms that identities are blocked before consent, records both consents, then logs a sample request. The opportunity still requires technical validation.

## Tests

```bash
pip install '.[test]'
python -m pytest -q
```

Tests cover actual graph ingestion, infeasible candidates, missing evidence, yield-based costs, negative savings, confidential identity leakage, mutual reveal scope/revocation, tenant isolation, multi-input routes, extraction error handling, persistence and CORS/OpenAPI.

## Docker

```bash
docker build -t ps5-ai .
docker run --rm -p 127.0.0.1:8000:8000 -e PS5_DEMO=1 ps5-ai
```

Mount a writable volume at `/app/var` to retain records; the container runs as UID 10001. Docker packaging is provided; see verification report for what was actually exercised.

## Research and limits

- Zhao et al., *Construction of waste-to-resource knowledge graph for industrial symbiosis identification using large language models*: https://doi.org/10.1038/s41467-025-66599-7
- Author construction/data: https://github.com/nancycyzl/W2RKG-construction-with-LLMs
- Author application: https://github.com/nancycyzl/W2RKG_application
- Dataset source/hash/license: `data/SOURCE.json`, `data/UPSTREAM_LICENSE.txt`.

The published graph aggregates multiple process descriptions and references for some pairs. It does not preserve a proven process recipe, all co-input dependencies or experimental conditions. Imported routes remain `machine_extracted_unreviewed`; the system asks for source review rather than fabricating those details. Reviewer-recorded routes are declarations, not independently certified engineering advice.

The service calculates rather than predicts costs and environmental impact. It uses company-supplied prices and explicit factors; it does not fetch live commodity prices, freight quotes or legal approvals. The lightweight API-key scheme is an integration boundary, not a full user-login product. Add your team's login, key rotation, deployment throttling, backups, and domain-specific acceptance rules before handling real companies. There is no payment, auction settlement, shipment booking or marketplace chat implementation here; the AI API connects to your team's existing marketplace flow.

No LLM or ranking model was trained. OCR/scanned PDF parsing, learned ranking, multi-source crawling, automatic industrial lead outreach and network-wide flow optimization are not included. Feedback is collected so a later model can be evaluated on real outcomes rather than fabricated labels.
