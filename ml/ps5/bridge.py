"""Private stateless adapter for authenticated marketplace records.
MongoDB remains authoritative. No demo inventory or identity consent is reused here.
"""
import hmac
import time
from typing import Annotated, Literal

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import Field

from .engine import assess
from .models import ListingInput, Model, RequirementInput, Scenario, Status, Check


class BridgeListing(Model):
    id: str = Field(min_length=1, max_length=100)
    seller_id: str = Field(min_length=1, max_length=100)
    listing: ListingInput
    scenario: Scenario = Field(default_factory=Scenario)
    unknown_checks: list[Literal["inventory", "timing", "location"]] = Field(default_factory=list, max_length=3)


class BridgeRequest(Model):
    buyer_id: str = Field(min_length=1, max_length=100)
    requirement_id: str = Field(min_length=1, max_length=100)
    requirement: RequirementInput
    listings: list[BridgeListing] = Field(max_length=500)
    unknown_checks: list[Literal["timing", "location", "specification"]] = Field(default_factory=list, max_length=3)
    limit: int = Field(default=10, ge=1, le=50)
    similarity_threshold: float = Field(default=0.75, ge=0.5, le=1)


def mark_unknown(result, codes):
    # Neutral placeholder dates/coordinates satisfy the internal schema only.
    # They never establish feasibility or contribute positive proximity credit.
    for code in sorted(set(codes)):
        check = next((c for c in result.checks if c.code == code), None)
        reason = "Marketplace record has no confirmed " + code + " data."
        action = "Confirm " + code + " information before relying on this assessment."
        if check:
            check.status = Status.UNKNOWN
            check.reason = reason
            check.next_action = action
        else:
            result.checks.append(Check(code=code, status=Status.UNKNOWN, essential=True, reason=reason, next_action=action))
        result.next_actions.append(action)
    if "location" in codes:
        result.score_components["proximity"] = 0
        result.pathway.distance_band_km = "unknown"
    essentials = [c for c in result.checks if c.essential]
    result.status = "rejected" if any(c.status == Status.FAIL for c in essentials) else "needs_validation" if any(c.status == Status.UNKNOWN for c in essentials) else "ready_for_trial"
    result.score_components["known_fit"] = round(30 * sum(c.status == Status.PASS for c in essentials) / len(essentials), 2)
    result.evidence_completeness = round(sum(c.status != Status.UNKNOWN for c in essentials) / len(essentials), 4)
    result.priority_score = 0 if result.status == "rejected" else round(sum(result.score_components.values()), 2)
    result.explanation = f"{' + '.join(result.pathway.inputs)} → {result.pathway.output}. Status: {result.status}; {sum(c.status == Status.UNKNOWN for c in essentials)} essential checks remain unknown."
    result.next_actions = list(dict.fromkeys(result.next_actions))


def register_bridge(app, settings):
    bearer = HTTPBearer(auto_error=False)

    def authorize(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]):
        if not settings.bridge_token or not credentials or not hmac.compare_digest(credentials.credentials, settings.bridge_token):
            raise HTTPException(403, "Marketplace bridge token required")

    @app.post("/v1/integrations/marketplace/matches", tags=["Private marketplace integration"], dependencies=[Depends(authorize)])
    def marketplace_matches(payload: BridgeRequest, request: Request):
        start = time.perf_counter()
        kg = request.app.state.knowledge
        requirement = {**payload.requirement.model_dump(mode="json"), "id": payload.requirement_id}
        results, evaluated, rejected = [], 0, 0
        for item in payload.listings:
            if item.seller_id == payload.buyer_id or not item.listing.active:
                continue
            listing = {**item.listing.model_dump(mode="json"), "id": item.id}
            supplier = {"identity_visible": False, "label": "Marketplace supplier", "region": item.listing.location.region, "verification": "not_independently_verified"}
            for route, score in kg.candidates(item.listing.material, payload.requirement.target_resource, payload.similarity_threshold):
                evaluated += 1
                if evaluated > 2000:
                    raise HTTPException(422, "Too many candidate pathways; narrow the marketplace search.")
                result = assess(listing, requirement, route, score, item.scenario, supplier)
                mark_unknown(result, [*payload.unknown_checks, *item.unknown_checks])
                if result.status == "rejected":
                    rejected += 1
                else:
                    results.append(result)
        order = {"ready_for_trial": 0, "needs_validation": 1, "rejected": 2}
        results.sort(key=lambda r: (order[r.status], -r.priority_score, -r.evidence_completeness, r.id))
        return {"results": results[:payload.limit], "candidates_evaluated": evaluated, "rejected_count": rejected,
                "retrieval_backend": kg.similarity.backend, "elapsed_ms": round((time.perf_counter() - start) * 1000, 2)}
