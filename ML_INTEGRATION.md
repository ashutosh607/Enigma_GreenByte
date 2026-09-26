# Website and ML integration

The website now sends real marketplace listings and buyer requirements to the research-backed Python service. Fixed heuristic recommendations are removed from discovery. An unavailable service produces an error; an empty result stays empty.

## Local setup

1. Create a private token, for example with `python -c 'import secrets; print(secrets.token_urlsafe(32))'`. Keep it out of Git and frontend variables.
2. Set these in `backend/.env`:

   ```dotenv
   FASTAPI_ML_URL=http://127.0.0.1:8002
   FASTAPI_ML_TOKEN=your-private-token
   ```

3. In the Python environment where you installed the ML dependencies, start the service:

   ```sh
   cd ml
   python -m pip install -e '.[embeddings,test]'
   python scripts/start_website_ml.py --port 8002
   ```

   The helper reads the private token from `backend/.env`, so it does not need to be pasted into terminal commands. Stop the earlier server on that port first. Demo mode is optional for Swagger testing; website matching never uses the Python demo listings.
4. On this Mac, port 5000 is occupied by macOS. Local ignored environment files are configured with `PORT=5001` in `backend/.env` and `VITE_API_URL=http://127.0.0.1:5001/api` in `frontend/.env.local`. Other teammates can choose an available port; make both values agree.

   Start the existing Node backend with a working MongoDB connection (`cd backend && npm run dev`), and Vite (`cd frontend && npm run dev`). Restart Node after changing its environment.
5. Register/sign in with a company. Suppliers list resources in Dashboard, buyers use AI Discovery. The service token remains on the Node server; user login remains with the existing website.

## Demo flow

Use two separate company accounts. A supplier lists `blast furnace slag`, 500 tonnes/month at ₹2000/tonne. Optional AI details include a material name, date window and confirmed facility coordinates. Measurement values are self-reported unless separately reviewed.

A buyer enters current material `virgin aggregate`, target material `aggregate`, intended application `road sub-base`, 100 tonnes/month and ₹5000/tonne. Choose overlapping dates and optionally record facility coordinates. Add essential limits only when relevant, such as `moisture`, `<= 5 %`, with the correct input/output basis.

Run discovery. The website shows live research pathways, actual check results, validation actions, and a priority score. Processing plans, use acceptance and original source review can remain outstanding. This is expected.

For an illustrative cost scenario, enter 80% yield, ₹400 processing and ₹400 freight per input tonne. A compatible route should compare 125 tonnes of input against 100 tonnes of output, yielding ₹150,000 estimated savings. The scenario applies to all candidate routes for this request; it is not a verified yield/quote. Handling/testing are explicitly assumed zero. Confirm these and other dependencies before procurement.

Change the quantity or essential measurement limit and rerun. Results are recomputed. A failing essential specification is excluded; no supported routes means no match. Missing dates/coordinates remain unknown and do not silently count as confirmed. Unsupported mass units are excluded with a warning; weekly demand is rejected rather than silently converted.

## Boundaries

- MongoDB remains authoritative for company, listing, requirement, opportunity and deal records. The private FastAPI bridge is stateless and shares the same graph retrieval, feasibility and calculation engine as the public ML API.
- New Mongo fields are optional, so existing documents do not require destructive migration. Existing default coordinates are not used for ranking unless explicitly confirmed.
- AI discovery requires a signed-in company and scopes stored results to the buyer. The existing website also supports simulated-persona authentication; that demonstration mechanism is not production authentication hardening.
- Confidential supplier profiles and precise locations are removed from discovery responses. This adapter does not implement mutual identity reveal across the entire marketplace/deal system; those existing flows need their own review before a confidentiality claim for the whole website.
- The model is pretrained MiniLM, not a newly trained success predictor. Scores are rule-based priorities, not technical-success probabilities. No automatic regulatory approval or certificate is claimed.
- Full exchange success, adoption improvements and material feasibility still require real trials.

## Checks

```sh
cd ml
python -m pytest -q
```

```sh
cd backend
node --test tests/mlMarketplaceAdapter.test.js tests/aiDiscoveryService.test.js
```

```sh
cd frontend
npm run build
npm run lint
```

For an optional live contract check using real registration, JWT login and persistence against a unique disposable MongoDB database:

```sh
cd backend
node scripts/testMlIntegration.js
```

This requires a working MongoDB connection and running semantic ML service. It creates only synthetic records in a separate test database and removes that test database afterward.

## Git collaboration

Changes are limited to discovery, its API adapter, additive model fields, the listing form's optional ML details and the restored `ml/` service. No package dependencies/lockfiles are changed by the integration. Environment files, Python environments, local databases and caches are ignored. The graph file and its attribution/license are intentionally included.

Before your team's push: review `git status` and `git diff`, fetch origin, then merge the newest `origin/main`. Do not force-push a shared main branch. Coordinate edits to AI Discovery and the discovery controller with teammates. This integration has not been pushed automatically.
