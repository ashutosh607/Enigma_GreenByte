import hmac
import time
from contextlib import asynccontextmanager
from typing import Annotated

import httpx
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import Settings
from .demo import seed
from .engine import assess
from .extraction import extract
from .knowledge import Knowledge
from .models import (AssessRequest, CompanyInput, ExtractRequest, FeedbackInput, ListingInput,
                     CostResult, Impact, MatchRequest, MatchResponse, Model, Opportunity, RequirementInput, RouteInput, Scenario)
from .store import Store

bearer = HTTPBearer(auto_error=False)


class ConsentInput(Model):
    consent: bool


def create_app(settings=None):
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app):
        app.state.store = Store(settings.database)
        if settings.demo:
            seed(app.state.store)
        try:
            app.state.knowledge = Knowledge(settings, app.state.store)
            yield
        finally:
            app.state.store.close()

    app = FastAPI(title="PS5 Industrial Symbiosis AI", version="0.1.0", lifespan=lifespan,
                  description="Research-backed discovery with explicit unknowns, scenario costs and listing-level confidential identities. Priority scores are not success probabilities.")
    app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=False,
                       allow_methods=["GET", "POST", "PUT", "PATCH"], allow_headers=["Authorization", "Content-Type"])

    def company(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]):
        if credentials and credentials.scheme.lower() == "bearer":
            for token, owner in settings.tokens.items():
                if hmac.compare_digest(token, credentials.credentials):
                    return owner
        raise HTTPException(401, "Valid company bearer token required", headers={"WWW-Authenticate": "Bearer"})

    def admin(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]):
        if not credentials or not settings.admin_token or not hmac.compare_digest(credentials.credentials, settings.admin_token):
            raise HTTPException(403, "Admin token required")
        return "admin"

    Owner = Annotated[str, Depends(company)]

    def owned(request, kind, rid, owner):
        row = request.app.state.store.get(kind, rid)
        if row is None or row[0] != owner:
            raise HTTPException(404, "Record not found")
        return row[1]

    def listing(request, rid):
        row = request.app.state.store.get("listing", rid)
        if not row:
            raise HTTPException(404, "Listing not found")
        return row

    def safe_supplier(request, seller, data, viewer, context=None):
        store = request.app.state.store
        identity = store.get("company", seller)
        revealed = bool(context and store.revealed(viewer, seller, context))
        if viewer == seller or not data["confidential"] or revealed:
            return {"identity_visible": True, "company_id": seller, "name": identity[1]["name"] if identity else "Company profile not recorded",
                    "contact": identity[1]["contact"] if identity else None, "region": data["location"]["region"], "verification": "not_independently_verified"}
        return {"identity_visible": False, "label": "Confidential supplier", "region": data["location"]["region"], "verification": "not_independently_verified"}

    def safe_listing(request, seller, data, viewer):
        if viewer == seller:
            return {**data, "supplier": safe_supplier(request, seller, data, viewer)}
        # Whitelist protects identities, exact coordinates and document metadata.
        public = {k: data[k] for k in ["id", "material", "quantity_tonnes", "period", "available_from", "available_until", "price_per_input_tonne", "currency", "confidential", "sale_mode", "active"]}
        public["properties"] = {name: {k: prop.get(k) for k in ["value", "unit", "basis", "source_type", "measured_on"]} for name, prop in data["properties"].items()}
        public["supplier"] = safe_supplier(request, seller, data, viewer)
        return public

    def save_assessment(request, owner, req, seller, data, route, score, scenario):
        result = assess(data, req, route, score, scenario, safe_supplier(request, seller, data, owner))
        request.app.state.store.put("opportunity", owner,
            {"seller": seller, "requirement_id": req["id"], "listing_id": data["id"], "route_id": route["id"],
             "route": route if route["evidence_status"] == "direct_listing" else None,
             "similarity": score, "matched_input": route.get("matched_input"), "scenario": scenario.model_dump(mode="json")}, result.id)
        # Only this opportunity can authorize identity disclosure.
        result.supplier = safe_supplier(request, seller, data, owner, result.id)
        return result

    def opp_context(request, oid, viewer):
        row = request.app.state.store.get("opportunity", oid)
        if not row or viewer not in {row[0], row[1]["seller"]}:
            raise HTTPException(404, "Opportunity not found")
        return row

    @app.get("/health", tags=["System"])
    def health(request: Request):
        kg = request.app.state.knowledge
        return {"status": "ok", "demo": settings.demo, "retrieval_backend": kg.similarity.backend,
                "source_relationships": kg.raw_count, "loaded_routes": len(kg.routes), "quarantined": kg.quarantined,
                "extraction_configured": bool(settings.llm_url and settings.llm_model)}

    @app.put("/v1/companies/me", tags=["Onboarding"])
    def put_company(payload: CompanyInput, request: Request, owner: Owner):
        return request.app.state.store.put("company", owner, payload.model_dump(mode="json"), owner)

    @app.get("/v1/companies/me", tags=["Onboarding"])
    def get_company(request: Request, owner: Owner):
        return owned(request, "company", owner, owner)

    @app.post("/v1/listings", status_code=201, tags=["Marketplace inputs"])
    def create_listing(payload: ListingInput, request: Request, owner: Owner):
        return request.app.state.store.put("listing", owner, payload.model_dump(mode="json"))

    @app.put("/v1/listings/{listing_id}", tags=["Marketplace inputs"])
    def update_listing(listing_id: str, payload: ListingInput, request: Request, owner: Owner):
        owned(request, "listing", listing_id, owner)
        return request.app.state.store.put("listing", owner, payload.model_dump(mode="json"), listing_id)

    @app.get("/v1/listings", tags=["Marketplace inputs"])
    def get_listings(request: Request, owner: Owner, offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), material: str | None = Query(None, max_length=150)):
        rows = [(seller, data) for seller, data in request.app.state.store.all("listing") if data["active"] and (not material or material.lower() in data["material"].lower())]
        return {"total": len(rows), "items": [safe_listing(request, seller, data, owner) for seller, data in rows[offset:offset + limit]]}

    @app.get("/v1/listings/{listing_id}", tags=["Marketplace inputs"])
    def get_listing(listing_id: str, request: Request, owner: Owner):
        seller, data = listing(request, listing_id)
        if not data["active"] and seller != owner:
            raise HTTPException(404, "Listing not found")
        return safe_listing(request, seller, data, owner)

    @app.post("/v1/requirements", status_code=201, tags=["Buyer requirements"])
    def create_requirement(payload: RequirementInput, request: Request, owner: Owner):
        return request.app.state.store.put("requirement", owner, payload.model_dump(mode="json"))

    @app.get("/v1/requirements", tags=["Buyer requirements"])
    def get_requirements(request: Request, owner: Owner):
        return {"items": [data for _, data in request.app.state.store.all("requirement", owner)]}

    @app.get("/v1/requirements/{requirement_id}", tags=["Buyer requirements"])
    def get_requirement(requirement_id: str, request: Request, owner: Owner):
        return owned(request, "requirement", requirement_id, owner)

    @app.put("/v1/requirements/{requirement_id}", tags=["Buyer requirements"])
    def update_requirement(requirement_id: str, payload: RequirementInput, request: Request, owner: Owner):
        owned(request, "requirement", requirement_id, owner)
        return request.app.state.store.put("requirement", owner, payload.model_dump(mode="json"), requirement_id)

    @app.post("/v1/matches", response_model=MatchResponse, tags=["AI discovery"])
    def matches(payload: MatchRequest, request: Request, owner: Owner):
        start = time.perf_counter()
        req = owned(request, "requirement", payload.requirement_id, owner)
        kg = request.app.state.knowledge
        rows = [listing(request, lid) for lid in payload.listing_ids] if payload.listing_ids is not None else request.app.state.store.all("listing")
        results, count, rejected = [], 0, 0
        for seller, data in rows:
            if seller == owner or not data["active"]:
                continue
            for route, score in kg.candidates(data["material"], req["target_resource"], payload.similarity_threshold):
                # Bound expansions per listing; retains all scored routes up to this explicit ceiling.
                if count >= 2000:
                    raise HTTPException(422, "Candidate set exceeds 2000 pathways; narrow listing_ids or raise similarity_threshold")
                scenario = payload.scenarios_by_listing.get(data["id"], Scenario())
                result = save_assessment(request, owner, req, seller, data, route, score, scenario)
                count += 1
                rejected += result.status == "rejected"
                if result.status != "rejected" or payload.include_rejected:
                    results.append(result)
        order = {"ready_for_trial": 0, "needs_validation": 1, "rejected": 2}
        results.sort(key=lambda r: (order[r.status], -r.priority_score, -r.evidence_completeness, r.id))
        return MatchResponse(requirement_id=req["id"], candidates_evaluated=count, rejected_count=rejected,
                             results=results[:payload.limit], retrieval_backend=kg.similarity.backend,
                             elapsed_ms=round((time.perf_counter() - start) * 1000, 2))

    @app.post("/v1/assessments", response_model=Opportunity, tags=["AI discovery"])
    def assessment(payload: AssessRequest, request: Request, owner: Owner):
        req = owned(request, "requirement", payload.requirement_id, owner)
        seller, data = listing(request, payload.listing_id)
        if seller == owner:
            raise HTTPException(422, "Supply must belong to a different company")
        kg = request.app.state.knowledge
        selected = next(((route, score) for route, score in kg.candidates(data["material"], req["target_resource"]) if payload.route_id is None or route["id"] == payload.route_id), None)
        if not selected:
            raise HTTPException(422, "No supported route for this listing and target; discover a route first")
        return save_assessment(request, owner, req, seller, data, *selected, payload.scenario)

    @app.get("/v1/opportunities/{opportunity_id}", response_model=Opportunity, tags=["Opportunity workspace"])
    def get_opportunity(opportunity_id: str, request: Request, owner: Owner):
        buyer, meta = opp_context(request, opportunity_id, owner)
        req = owned(request, "requirement", meta["requirement_id"], buyer)
        seller, data = listing(request, meta["listing_id"])
        route = request.app.state.knowledge.routes.get(meta["route_id"]) or meta["route"]
        if not route:
            raise HTTPException(409, "Route removed; rediscover opportunity")
        route = {**route, "matched_input": meta.get("matched_input") or data["material"]}
        # Recompute against current records; confidentiality changes take effect immediately.
        result = assess(data, req, route, meta["similarity"], Scenario.model_validate(meta["scenario"]), safe_supplier(request, seller, data, owner, opportunity_id) if owner == buyer else safe_supplier(request, seller, data, owner))
        if owner != buyer:
            # A seller can participate without receiving the buyer's purchasing baseline.
            result.cost = CostResult(status="unknown", currency=req["currency"], missing=["Buyer-private cost scenario is not shared"])
            result.impact = Impact(status="unknown", missing=["Buyer-private impact scenario is not shared"])
            result.priority_score = 0
            result.score_components = {}
            result.score_note = "Buyer ranking is private; score is withheld in seller view."
            result.checks = [c for c in result.checks if c.code != "economics"]
        return result

    @app.post("/v1/opportunities/{opportunity_id}/consent", tags=["Confidentiality"])
    def consent(opportunity_id: str, payload: ConsentInput, request: Request, owner: Owner):
        buyer, meta = opp_context(request, opportunity_id, owner)
        result = request.app.state.store.consent(buyer, meta["seller"], owner, payload.consent, opportunity_id)
        return {"opportunity_id": opportunity_id, "buyer_consent": result["buyer_consent"], "seller_consent": result["seller_consent"], "identity_revealed": result["buyer_consent"] and result["seller_consent"]}

    @app.get("/v1/opportunities/{opportunity_id}/identities", tags=["Confidentiality"])
    def identities(opportunity_id: str, request: Request, owner: Owner):
        buyer, meta = opp_context(request, opportunity_id, owner)
        store = request.app.state.store
        if not store.revealed(buyer, meta["seller"], opportunity_id):
            raise HTTPException(403, "Both parties must consent for this opportunity")
        return {"buyer": (store.get("company", buyer) or (None, None))[1], "seller": (store.get("company", meta["seller"]) or (None, None))[1]}

    @app.post("/v1/opportunities/{opportunity_id}/feedback", status_code=201, tags=["Validation history"])
    def feedback(opportunity_id: str, payload: FeedbackInput, request: Request, owner: Owner):
        opp_context(request, opportunity_id, owner)
        from datetime import datetime, timezone
        return request.app.state.store.put("feedback", owner, {**payload.model_dump(mode="json"), "opportunity_id": opportunity_id, "recorded_at": datetime.now(timezone.utc).isoformat(), "verification": "participant_recorded"})

    @app.get("/v1/opportunities/{opportunity_id}/feedback", tags=["Validation history"])
    def feedback_history(opportunity_id: str, request: Request, owner: Owner):
        opp_context(request, opportunity_id, owner)
        # Notes may contain sensitive information; each actor sees only their own notes.
        return {"items": [data for _, data in request.app.state.store.all("feedback", owner) if data["opportunity_id"] == opportunity_id]}

    @app.get("/v1/knowledge/routes", tags=["Research evidence"])
    def routes(request: Request, owner: Owner, q: str = Query(min_length=1, max_length=150), limit: int = Query(20, ge=1, le=100)):
        return {"items": request.app.state.knowledge.search(q, limit)}

    @app.post("/v1/knowledge/routes", status_code=201, tags=["Research evidence"], dependencies=[Depends(admin)])
    def add_route(payload: RouteInput, request: Request):
        return request.app.state.knowledge.add_reviewed(payload)

    @app.post("/v1/extractions", tags=["Document assistance"])
    def extraction(payload: ExtractRequest, owner: Owner):
        try:
            return extract(settings, payload.text, payload.purpose)
        except RuntimeError as exc:
            raise HTTPException(503, str(exc)) from exc
        except (ValueError, KeyError, IndexError, httpx.HTTPError) as exc:
            raise HTTPException(502, "Extraction failed validation or upstream request; no data was published") from exc

    from .bridge import register_bridge
    register_bridge(app, settings)
    return app


app = create_app()
