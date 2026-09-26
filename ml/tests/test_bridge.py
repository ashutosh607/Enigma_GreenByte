from copy import deepcopy

from fastapi.testclient import TestClient
import pytest

from ps5.api import create_app
from ps5.config import Settings


@pytest.fixture
def client(tmp_path):
    with TestClient(create_app(Settings(database=str(tmp_path / "db.sqlite"), demo=True, bridge_token="private-test"))) as client:
        yield client


def payload(client):
    listing = client.get("/v1/listings/demo-slag", headers={"Authorization": "Bearer demo-seller-token"}).json()
    listing.pop("id"); listing.pop("supplier")
    requirement = client.get("/v1/requirements/demo-aggregate", headers={"Authorization": "Bearer demo-buyer-token"}).json()
    requirement.pop("id")
    return {"buyer_id": "website-buyer", "requirement_id": "website-requirement", "requirement": requirement,
            "listings": [{"id": "website-listing", "seller_id": "website-seller", "listing": listing}]}


def run(client, body):
    return client.post("/v1/integrations/marketplace/matches", json=body, headers={"Authorization": "Bearer private-test"})


def test_bridge_requires_separate_secret_and_never_reads_demo_inventory(client):
    body = payload(client)
    assert client.post("/v1/integrations/marketplace/matches", json=body).status_code == 403
    assert client.post("/v1/integrations/marketplace/matches", json=body, headers={"Authorization": "Bearer demo-buyer-token"}).status_code == 403
    body["listings"] = []
    assert run(client, body).json()["results"] == []


def test_dynamic_assessment_and_costs(client):
    body = payload(client)
    body["listings"][0]["scenario"] = {"yield_fraction": {"low": .8, "high": .8}, "processing_per_input_tonne": {"low": 400, "high": 400}, "transport_per_input_tonne": {"low": 400, "high": 400}}
    response = run(client, body)
    assert response.status_code == 200, response.text
    result = response.json()["results"][0]
    assert result["listing_id"] == "website-listing"
    assert result["cost"]["savings_low"] == 150000
    assert result["supplier"]["company_id"] is None
    changed = deepcopy(body)
    changed["requirement"]["constraints"][0]["basis"] = "input"
    changed["requirement"]["constraints"][0]["maximum"] = 3
    response = run(client, changed).json()
    assert response["results"] == [] and response["rejected_count"] > 0
    changed = deepcopy(body)
    changed["listings"][0]["seller_id"] = body["buyer_id"]
    assert run(client, changed).json()["results"] == []


def test_missing_context_cannot_pass_or_receive_proximity_credit(client):
    body = payload(client)
    body["unknown_checks"] = ["location", "timing", "specification"]
    body["listings"][0]["unknown_checks"] = ["inventory"]
    response = run(client, body)
    assert response.status_code == 200, response.text
    result = response.json()["results"][0]
    assert result["status"] == "needs_validation"
    assert result["score_components"]["proximity"] == 0
    assert result["pathway"]["distance_band_km"] == "unknown"
    assert all(next(c for c in result["checks"] if c["code"] == code)["status"] == "unknown" for code in ["location", "timing", "specification", "inventory"])
