"""Run against an explicitly enabled local demo API; writes only demo records."""
import json
import httpx

base = "http://127.0.0.1:8000"
buyer = {"Authorization": "Bearer demo-buyer-token"}
seller = {"Authorization": "Bearer demo-seller-token"}
with httpx.Client(base_url=base) as client:
    health = client.get("/health").json()
    if not health.get("demo"):
        raise SystemExit("Refusing demo mutations: PS5_DEMO is not enabled")
    matches = client.post("/v1/matches", headers=buyer, json={"requirement_id": "demo-aggregate"})
    matches.raise_for_status()
    match = next(r for r in matches.json()["results"] if r["listing_id"] == "demo-slag")
    assessment = client.post("/v1/assessments", headers=buyer, json={
        "requirement_id": "demo-aggregate", "listing_id": "demo-slag", "route_id": match["route_id"],
        "scenario": {"yield_fraction": {"low": .8, "high": .8}, "processing_per_input_tonne": {"low": 500, "high": 500}, "transport_per_input_tonne": {"low": 300, "high": 300}}})
    assessment.raise_for_status()
    result = assessment.json()
    path = f"/v1/opportunities/{result['id']}"
    before = client.get(path + "/identities", headers=buyer).status_code
    for headers in [buyer, seller]:
        consent = client.post(path + "/consent", headers=headers, json={"consent": True})
        consent.raise_for_status()
    revealed = client.get(path + "/identities", headers=buyer)
    revealed.raise_for_status()
    feedback = client.post(path + "/feedback", headers=buyer, json={"stage": "sample_requested"})
    feedback.raise_for_status()
    print(json.dumps({"opportunity_id": result["id"], "status": result["status"], "estimated_savings": result["cost"], "identity_before_http_status": before,
                      "mutual_reveal": revealed.json(), "next_actions": result["next_actions"]}, indent=2))
