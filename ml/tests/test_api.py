import json
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from ps5.api import create_app
from ps5.config import Settings

BUYER = {"Authorization": "Bearer demo-buyer-token"}
SELLER = {"Authorization": "Bearer demo-seller-token"}


@pytest.fixture
def client(tmp_path):
    settings = Settings(database=str(tmp_path / "db.sqlite"), demo=True, admin_token="admin-test",
                        tokens={"stranger-token": "stranger"})
    with TestClient(create_app(settings)) as client:
        yield client


def discover(client, rejected=False):
    response = client.post("/v1/matches", headers=BUYER, json={"requirement_id": "demo-aggregate", "include_rejected": rejected})
    assert response.status_code == 200, response.text
    return response.json()


def slag(client):
    return next(r for r in discover(client)["results"] if r["listing_id"] == "demo-slag")


def test_real_graph_loaded(client):
    health = client.get("/health").json()
    assert health["source_relationships"] == 33679
    assert health["loaded_routes"] > 30000
    assert health["quarantined"] > 0


def test_auth_and_tenant_isolation(client):
    assert client.get("/v1/listings").status_code == 401
    assert client.get("/v1/requirements/demo-aggregate", headers=SELLER).status_code == 404
    payload = client.get("/v1/listings/demo-slag", headers=SELLER).json()
    payload.pop("id")
    payload.pop("supplier")
    assert client.put("/v1/listings/demo-slag", headers=BUYER, json=payload).status_code == 404


def test_discovery_evidence_unknowns_and_hard_failure(client):
    response = discover(client, True)
    candidate = next(r for r in response["results"] if r["listing_id"] == "demo-slag")
    assert candidate["status"] == "needs_validation"
    assert candidate["cost"]["status"] == "unknown"
    assert candidate["impact"]["status"] == "unknown"
    assert candidate["pathway"]["references"][0]["doi"].startswith("10.")
    assert candidate["pathway"]["evidence_status"] == "machine_extracted_unreviewed"
    assert any(c["code"] == "property:moisture" and c["status"] == "unknown" for c in candidate["checks"])
    bad = next(r for r in response["results"] if r["listing_id"] == "demo-rejected")
    assert bad["status"] == "rejected" and bad["priority_score"] == 0
    assert "demo-rejected" not in {r["listing_id"] for r in discover(client)["results"]}


def test_identity_redaction_mutual_reveal_and_scope(client):
    item = client.get("/v1/listings/demo-slag", headers=BUYER).json()
    serialized = json.dumps(item)
    for secret in ["Demo Slag Supplier", "seller@example.invalid", "latitude", "longitude", "source_reference", '"company_id"']:
        assert secret not in serialized
    candidate = slag(client)
    path = f"/v1/opportunities/{candidate['id']}"
    assert client.get(path + "/identities", headers=BUYER).status_code == 403
    assert not client.post(path + "/consent", headers=BUYER, json={"consent": True}).json()["identity_revealed"]
    assert client.get(path + "/identities", headers=BUYER).status_code == 403
    assert client.post(path + "/consent", headers=SELLER, json={"consent": True}).json()["identity_revealed"]
    assert client.get(path + "/identities", headers=BUYER).json()["seller"]["name"] == "Demo Slag Supplier"
    assert client.get(path, headers=BUYER).json()["supplier"]["identity_visible"]
    # Global marketplace responses remain anonymous; consent applies to one opportunity.
    assert not client.get("/v1/listings/demo-slag", headers=BUYER).json()["supplier"]["identity_visible"]
    assert client.get(path, headers={"Authorization": "Bearer stranger-token"}).status_code == 404
    client.post(path + "/consent", headers=SELLER, json={"consent": False})
    assert not client.get(path, headers=BUYER).json()["supplier"]["identity_visible"]


def test_savings_yield_and_negative_savings(client):
    candidate = slag(client)
    payload = {"requirement_id": "demo-aggregate", "listing_id": "demo-slag", "route_id": candidate["route_id"],
               "scenario": {"yield_fraction": {"low": .8, "high": .8}, "processing_per_input_tonne": {"low": 500, "high": 500},
                            "transport_per_input_tonne": {"low": 300, "high": 300}}}
    result = client.post("/v1/assessments", headers=BUYER, json=payload)
    assert result.status_code == 200, result.text
    cost = result.json()["cost"]
    assert cost["input_tonnes"]["high"] == 125
    assert cost["baseline_total"] == 500000
    assert cost["alternative_total"]["high"] == 350000
    assert cost["savings_low"] == cost["savings_high"] == 150000
    payload["scenario"]["processing_per_input_tonne"] = {"low": 5000, "high": 7000}
    result = client.post("/v1/assessments", headers=BUYER, json=payload).json()
    assert result["cost"]["savings_low"] < 0
    assert result["cost"]["savings_low"] <= result["cost"]["savings_high"]


def test_invalid_numeric_and_date_inputs(client):
    data = client.get("/v1/requirements/demo-aggregate", headers=BUYER).json()
    data.pop("id")
    data["needed_until"] = "2000-01-01"
    assert client.post("/v1/requirements", headers=BUYER, json=data).status_code == 422
    assert client.post("/v1/assessments", headers=BUYER, json={"requirement_id": "demo-aggregate", "listing_id": "demo-slag", "scenario": {"yield_fraction": {"low": 0, "high": 2}}}).status_code == 422


def test_processing_not_allowed(client):
    req = client.get("/v1/requirements/demo-aggregate", headers=BUYER).json()
    req.pop("id")
    req["processing_allowed"] = False
    client.put("/v1/requirements/demo-aggregate", headers=BUYER, json=req)
    candidate = next(r for r in discover(client, True)["results"] if r["listing_id"] == "demo-slag")
    assert candidate["status"] == "rejected"


def test_feedback_is_private_and_persistent(client):
    candidate = slag(client)
    path = f"/v1/opportunities/{candidate['id']}/feedback"
    assert client.post(path, headers=BUYER, json={"stage": "sample_requested", "note": "private buyer contact"}).status_code == 201
    assert len(client.get(path, headers=BUYER).json()["items"]) == 1
    assert client.get(path, headers=SELLER).json()["items"] == []


def test_co_inputs_do_not_become_independent_routes(client):
    route = {"inputs": ["blast furnace slag", "activator"], "output": "aggregate", "process": "demo composite process",
             "application_terms": ["road aggregate"], "references": [{"doi": "10.1016/j.jclepro.2024.142457", "url": "https://doi.org/10.1016/j.jclepro.2024.142457"}],
             "reviewer": "Demo reviewer", "supporting_text": "Demonstration route, not newly verified research."}
    assert client.post("/v1/knowledge/routes", headers=BUYER, json=route).status_code == 403
    added = client.post("/v1/knowledge/routes", headers={"Authorization": "Bearer admin-test"}, json=route)
    assert added.status_code == 201, added.text
    rid = added.json()["id"]
    result = client.post("/v1/assessments", headers=BUYER, json={"requirement_id": "demo-aggregate", "listing_id": "demo-slag", "route_id": rid}).json()
    assert result["pathway"]["inputs"] == ["blast furnace slag", "activator"]
    assert next(c for c in result["checks"] if c["code"] == "dependencies")["status"] == "unknown"
    assert "cost of additional required inputs" in result["cost"]["missing"]


def test_extraction_without_credentials_is_explicit(client):
    response = client.post("/v1/extractions", headers=BUYER, json={"text": "moisture 4.2%"})
    assert response.status_code == 503


def test_current_privacy_and_specs_reassessed(client):
    candidate = slag(client)
    data = client.get("/v1/listings/demo-slag", headers=SELLER).json()
    data.pop("id")
    data.pop("supplier")
    data["properties"]["moisture"]["basis"] = "output"
    data["properties"]["moisture"]["value"] = 50
    client.put("/v1/listings/demo-slag", headers=SELLER, json=data)
    updated = client.get(f"/v1/opportunities/{candidate['id']}", headers=BUYER).json()
    assert updated["status"] == "rejected"


def test_cors_and_openapi(client):
    response = client.options("/v1/matches", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,content-type"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    spec = client.get("/openapi.json").json()
    assert "MatchResponse" in spec["components"]["schemas"]
    assert spec["paths"]["/v1/matches"]["post"]["security"]
