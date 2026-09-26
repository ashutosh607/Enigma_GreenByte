# Test the AI service locally

If your terminal says `Uvicorn running on http://127.0.0.1:8002`, the server is running. Leave that terminal open and use a second terminal for commands. The examples below use port 8002; change it if your server uses another port.

`GET /` and `GET /favicon.ico` returning 404 are expected. This is an API service, not a website homepage. Open http://127.0.0.1:8002/docs for the interactive testing page.

## 1. Check readiness and mode

Open http://127.0.0.1:8002/health. The original dataset should report:

```json
{
  "status": "ok",
  "demo": true,
  "retrieval_backend": "sentence_transformers",
  "source_relationships": 33679,
  "loaded_routes": 32889,
  "quarantined": 790,
  "extraction_configured": false
}
```

Reviewed additions can increase loaded_routes. `sentence_transformers` confirms the semantic backend is enabled; `lexical` means keyword/alias matching. Disabled document extraction does not prevent discovery.

## 2. Run the end-to-end checker

In a second terminal, enter the repository's ml folder and activate the same Python environment as the server. Then run:

```bash
python scripts/demo_flow.py --base-url http://127.0.0.1:8002
```

The checker reads the original synthetic demo records, records an assessment, resets consent for that demo opportunity, obtains both demo consents and records a sample request. It refuses to run if the server is not in demo mode. It does not purchase materials or contact companies.

Expected checks:

- API is healthy and reports its retrieval mode.
- The research-backed slag-to-aggregate route is discovered.
- Missing technical information remains `needs_validation`.
- The demo aggregate listing with excessive moisture is rejected.
- An 80% yield means 125 tonnes of input for 100 tonnes of output.
- The illustrative cost assumptions produce INR 150,000 savings.
- Identities remain blocked with zero or one consent.
- Both consents allow identity reveal.
- Sample-request feedback is recorded.

The final line should say `ALL DEMO CHECKS PASSED`. The checker is repeatable; it resets the relevant demo consents before testing confidentiality. Each run adds a synthetic sample-request event.

If you edited demo prices or properties, the checker may correctly fail its expected values. Use a fresh demo database rather than deleting a database that contains useful records. Stop your server, then start it with a different database file:

```bash
PS5_DEMO=1 PS5_DATABASE=var/local-test.sqlite \
PS5_EMBEDDINGS=sentence_transformers \
PS5_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2 \
python -m uvicorn ps5.api:app --host 127.0.0.1 --port 8002
```

## 3. Inspect discovery manually

Open `/docs`, click Authorize, and enter `demo-buyer-token` (the token alone). Expand `POST /v1/matches`, select Try it out and submit:

```json
{"requirement_id": "demo-aggregate"}
```

Find the result with listing ID `demo-slag`, input `blast furnace slag`, and output `aggregate`. Read its references, checks, explanation and next_actions. Missing yield/cost data should not produce invented savings. Copy its route_id for an assessment.

To include failed candidates, send:

```json
{
  "requirement_id": "demo-aggregate",
  "listing_ids": ["demo-rejected"],
  "include_rejected": true
}
```

The direct aggregate candidate has output moisture 12%, exceeding the buyer's 5% maximum. Expect `rejected`, a failed moisture check and a zero priority score.

## 4. Inspect savings manually

Call `POST /v1/assessments` with:

```json
{
  "requirement_id": "demo-aggregate",
  "listing_id": "demo-slag",
  "route_id": "paste-the-route-id-from-discovery",
  "scenario": {
    "yield_fraction": {"low": 0.8, "high": 0.8},
    "processing_per_input_tonne": {"low": 500, "high": 500},
    "transport_per_input_tonne": {"low": 300, "high": 300}
  }
}
```

Expected: 100 tonnes matched output, 125 tonnes input, current total INR 500,000, alternative total INR 350,000, savings INR 150,000. Status should still be `needs_validation`, since economic estimates do not resolve technical blockers. Environmental impact stays unknown without explicit factors.

## 5. Run regression tests

From the ml folder, in an activated environment:

```bash
python -m pip install -e '.[test]'
python -m pytest -q
```

The current suite has 20 tests. It uses temporary databases and does not require a running server. It covers graph ingestion, tenant isolation, unknown/failed evidence, unit conversions, cost ranges, negative savings, co-input dependencies, privacy, persistence, CORS and extraction validation.

These tests use default lexical retrieval. The running-server checker with `/health` reporting `sentence_transformers` additionally exercises real semantic inference. Passing tests establish software behavior, not validated industrial chemistry or calibrated model accuracy.

## Port and browser troubleshooting

- `Address already in use`: another process occupies that port. Port 8002 is fine; all client/test URLs must use 8002 too.
- `GET /` 404: use `/docs` or `/health`.
- 401: check the demo token and confirm demo mode is enabled.
- 403 on identities: both parties have not consented for this opportunity.
- `/v1/extractions` 503: expected while optional document extraction is disabled.
- Browser CORS error: allow the frontend's actual origin, such as localhost:5173. The API port changing to 8002 does not itself change the frontend origin.
- No response after startup: ensure the terminal still says the server is running, not that it shut down after a port error.
