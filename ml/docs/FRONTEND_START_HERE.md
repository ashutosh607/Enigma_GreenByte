# Frontend team: start here

Your job is to collect company information, send it to the backend, and display the returned opportunities clearly. You do not need to build the matching logic, calculate savings, or train an AI model in the frontend.

## 1. Get connected

Ask the backend teammate for the API address and the company's access token. An access token tells the backend which company is making the request.

For the local demo:

- API address: `http://localhost:8000`.
- Interactive guide: `http://localhost:8000/docs`.
- Buyer token: `demo-buyer-token`.
- Seller token: `demo-seller-token`.

The backend must be running with demo mode enabled for these tokens to work. Send the token with each request as `Authorization: Bearer <token>`. These two published tokens are only for the demo. Do not put a shared admin token in frontend code.

Important: localhost means the computer running your browser. If a teammate runs the backend on their laptop, your own localhost will not reach it. Each teammate can run a local copy, or the backend teammate can provide a shared test address. The backend must allow your frontend's address through its CORS setting; if the browser blocks a request, give the backend teammate the exact frontend address, including its port.

The AI backend does not provide a login screen or signup endpoint. Your main application handles login. The backend teammate connects authenticated company accounts to the AI service. Using these demo tokens does not implement real company authentication.

## 2. Prove the connection before building screens

Open `/docs`, click Authorize, and enter the buyer token in the bearer-token box. Expand `POST /v1/matches`, select Try it out, and submit:

```json
{"requirement_id": "demo-aggregate"}
```

You should receive a `results` list containing a blast-furnace-slag opportunity for aggregate. It should initially say `needs_validation`, show a confidential supplier, and explain which information is missing. Copy the returned `id` and `route_id` when testing the next steps; do not invent them.

The default server reports `lexical` matching. To demonstrate the embedding model, ask the backend teammate to enable semantic mode using the README. The screens use the same endpoints in either mode.

## 3. Connect each screen to its action

| Screen or button | What the frontend does | Backend call |
|---|---|---|
| Company profile | Save the current company's name and contact | `PUT /v1/companies/me` |
| List my material | Save material, quantity, dates, location, price, properties and privacy choice | `POST /v1/listings` |
| Browse marketplace | Get available listing summaries | `GET /v1/listings` |
| Buyer requirement | Save current purchase, intended use, desired material/function, quantity and specifications | `POST /v1/requirements` |
| Discover alternatives | Send the saved requirement ID | `POST /v1/matches` |
| Opportunity details | Read a returned opportunity ID | `GET /v1/opportunities/{id}` |
| Estimate savings | Send the selected listing, requirement and route IDs plus known cost assumptions | `POST /v1/assessments` |
| Agree to reveal identity | Record only the currently signed-in company's decision | `POST /v1/opportunities/{id}/consent` |
| Show company contacts | Fetch identities after both companies consent | `GET /v1/opportunities/{id}/identities` |
| Record sample or trial progress | Save the current company's stage/outcome | `POST /v1/opportunities/{id}/feedback` |

Use the API guide or `/docs` for the exact form fields. The backend returns an ID when you create a listing or requirement. Keep that ID associated with the record in your application; later calls depend on it. If your marketplace already has its own database, agree with the backend teammate how listings and requirements are synchronized. The AI service does not automatically read your other database.

All quantities are tonnes, with an explicit monthly or one-time period. Dates use `YYYY-MM-DD`. Keep location coordinates for the backend calculation; use the safe returned supplier information when displaying another company's listing.

## 4. Build the opportunity card

For each item in `results`, show:

- Proposed material and what it could become: `pathway.inputs` and `pathway.output`.
- Supplier display: `supplier.name` when `identity_visible` is true; otherwise `supplier.label` and `supplier.region`.
- Current assessment: `status`.
- Why it was found: `explanation`.
- What passes, fails or needs checking: `checks`.
- Estimated savings, if available: `cost`.
- Research links: `pathway.references`.
- The next useful actions: `next_actions`.

Suggested status labels:

| Backend value | User-facing label |
|---|---|
| `needs_validation` | Potential opportunity — some checks are still needed |
| `ready_for_trial` | Ready to discuss a trial |
| `rejected` | Does not meet an essential requirement |

The priority score helps order opportunities. It is not a success probability, so do not display “87% compatible”. A missing value means unknown, not zero. A saved report is not automatically a verified certificate. Research links support a possible pathway; they do not approve this particular material for use.

Discovery normally hides rejected candidates. An empty results list means no candidate was returned under the current data and settings, not that no industrial opportunity exists anywhere.

## 5. Show savings without adding unnecessary form work

First show the opportunity. Then ask only for the cost or process information needed to make the estimate useful. Existing listing prices and the buyer's current delivered purchasing price are reused.

For the slag demo, send an assessment using the returned route ID and these illustrative assumptions:

```json
{
  "requirement_id": "demo-aggregate",
  "listing_id": "demo-slag",
  "route_id": "paste-the-returned-route-id-here",
  "scenario": {
    "yield_fraction": {"low": 0.8, "high": 0.8},
    "processing_per_input_tonne": {"low": 500, "high": 500},
    "transport_per_input_tonne": {"low": 300, "high": 300}
  }
}
```

An 80% yield means 125 tonnes of input are needed for 100 tonnes of usable output. This demo estimates INR 150,000 savings. That is an illustration, not a researched industrial quotation, and the opportunity still needs technical validation.

When `cost.status` is `estimated`, display the savings range and its assumptions. When it is `unknown`, display “Savings need more information” and the `missing` items. Negative savings mean the alternative may cost more; show that honestly. Environmental benefits are also estimates and remain unknown without supplied factors.

If costs should influence the discovery ranking, include them in `scenarios_by_listing` when calling `/v1/matches`. Another discovery request replaces saved scenarios for its returned pathways, so send the same assumptions again when they should be retained. Opening a saved opportunity recalculates against current data.

## 6. Make confidential matching work correctly

The buyer and seller each submit `{"consent": true}` from their own signed-in session. One company cannot submit consent for the other. Before both agree, the identities endpoint returns 403; that means “waiting for the other company”, not a broken app.

After both agree, fetch `/identities` and show contacts inside that opportunity's workspace. Consent applies to that opportunity only. Other confidential marketplace listings remain hidden. Revoking consent hides future identity responses, but cannot erase identities a participant has already seen.

The main marketplace must deliver the connection request and opportunity ID to the supplier. This AI service does not send notifications or provide a seller inbox. Your backend teammate can connect it to the marketplace's existing request/notification flow.

## 7. Connect the remaining marketplace features

Negotiation, bids, auction settlement, chat, payments, shipping bookings and contracts belong to the main marketplace. The AI service provides the opportunity and assessment to support those steps; it does not execute them.

Assessment currently uses the listing's recorded price. It does not automatically read a bid or a buyer-specific negotiated quote. Tell the backend teammate when the final deal price should replace the assessment's price source. Do not let a buyer overwrite a supplier's public listing price to simulate a private deal.

Existing reports can be optional. Structured properties can be entered directly. Automatic document-text extraction is an optional connection, currently disabled; scanned-PDF/OCR upload is not implemented. The UI should not make that feature a required onboarding step.

## 8. Handle ordinary errors clearly

- 401: the company's access token is missing or invalid.
- 403 on identities: both companies have not agreed yet.
- 404: this record is unavailable to the current account, or its ID is wrong.
- 422: a form field needs fixing, or the selected pathway is unsupported. Read the returned `detail`.
- 503 on extraction: document extraction is not enabled; allow manual entry.

Show a loading state while matching runs and a useful message when no opportunity is found. Keep unfinished form values if a request fails. Do not replace unknown measurements with guessed values in the frontend.

## 9. Final integration check

Test the same story in two company sessions: seller listing → buyer requirement → discovery → missing checks → savings estimate → buyer consent → seller consent → identity reveal → sample progress. Also test a rejected material and an empty result.

Give the team `README.md`, this guide, `docs/API.md`, and `docs/client.ts`. The client is a small optional helper, not a complete frontend. `docs/openapi.json` supplies the exact contract if they want to generate types.

## In this Enigma_GreenByte repository

The repository has three separate parts:

- `frontend/`: your React website.
- `backend/`: the main Express application, using port 5000 by default.
- `ml/`: this FastAPI matching service, using port 8000 in the documented setup.

Start the matching service from the repository's `ml/` folder using the README instructions. The frontend must call the matching service address for `/v1/matches` and `/v1/assessments`; those endpoints are not currently mounted on the Express application's port 5000. Use your own login/application backend for the marketplace account flow.

The current main backend contains its health check but does not yet implement login, marketplace records, supplier notifications or an ML proxy. These connections need to be made by the application team. Demo company tokens let the frontend test the matching service independently while that work continues.

For a local demonstration, the frontend team can import the helper from `ml/docs/client.ts` into its application, or implement the same calls with its existing HTTP client. Set the matching-service address to `http://localhost:8000`. Keep this address configurable so it can later point to a shared test server. Frontend developers should use their own signed-in company's access token, never the admin token.

The service already allows `http://localhost:5173` and `http://localhost:3000`. If the frontend runs on another address or port, the backend teammate must add that exact origin to `PS5_CORS_ORIGINS`.
