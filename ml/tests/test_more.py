import json
from datetime import date, timedelta
from unittest.mock import patch

import httpx
import pytest
from fastapi.testclient import TestClient

from ps5.api import create_app
from ps5.config import Settings
from ps5.extraction import extract
from ps5.store import Store

BUYER = {"Authorization": "Bearer demo-buyer-token"}
SELLER = {"Authorization": "Bearer demo-seller-token"}


@pytest.fixture
def client(tmp_path):
    with TestClient(create_app(Settings(database=str(tmp_path / "db.sqlite"), demo=True))) as client:
        yield client


def row(client, kind, rid, headers):
    data = client.get(f"/v1/{kind}/{rid}", headers=headers).json()
    data.pop("id")
    data.pop("supplier", None)
    return data


def test_currency_mismatch_and_period_mismatch(client):
    listing = row(client, "listings", "demo-slag", SELLER)
    listing["currency"] = "USD"
    client.put("/v1/listings/demo-slag", headers=SELLER, json=listing)
    scenario = {"yield_fraction": {"low": .8, "high": .9}, "processing_per_input_tonne": {"low": 1, "high": 2}, "transport_per_input_tonne": {"low": 1, "high": 2}}
    payload = {"requirement_id": "demo-aggregate", "listing_id": "demo-slag", "scenario": scenario}
    cost = client.post("/v1/assessments", headers=BUYER, json=payload).json()["cost"]
    assert cost["status"] == "unknown" and any("currency" in s for s in cost["missing"])
    listing["currency"] = "INR"
    listing["period"] = "one_time"
    client.put("/v1/listings/demo-slag", headers=SELLER, json=listing)
    cost = client.post("/v1/assessments", headers=BUYER, json=payload).json()["cost"]
    assert cost["status"] == "unknown" and cost["savings_low"] is None and cost["input_tonnes"] is None


def test_partial_quantity_and_environmental_factor_requirements(client):
    listing = row(client, "listings", "demo-slag", SELLER)
    listing["quantity_tonnes"] = 100
    client.put("/v1/listings/demo-slag", headers=SELLER, json=listing)
    scenario = {"yield_fraction": {"low": .8, "high": .8}, "processing_per_input_tonne": {"low": 0, "high": 0}, "transport_per_input_tonne": {"low": 0, "high": 0},
                "baseline_kgco2e_per_output_tonne": 100, "processing_kgco2e_per_input_tonne": 10, "transport_kgco2e_per_input_tonne": 5, "alternative_upstream_kgco2e_per_input_tonne": 5}
    payload = {"requirement_id": "demo-aggregate", "listing_id": "demo-slag", "scenario": scenario}
    result = client.post("/v1/assessments", headers=BUYER, json=payload).json()
    assert result["cost"]["matched_output_tonnes"] == 80
    assert result["cost"]["baseline_total"] == 400000
    assert result["impact"]["status"] == "unknown"
    scenario["factor_source"] = "Synthetic test factor"
    result = client.post("/v1/assessments", headers=BUYER, json=payload).json()
    assert result["impact"]["net_kgco2e_low"] == 6000
    seller = client.get(f"/v1/opportunities/{result['id']}", headers=SELLER).json()
    assert seller["cost"]["baseline_total"] is None and seller["cost"]["savings_low"] is None
    assert seller["impact"]["net_kgco2e_low"] is None


def test_freshness_and_future_measurement_remain_unknown(client):
    requirement = row(client, "requirements", "demo-aggregate", BUYER)
    requirement["constraints"][0]["max_age_days"] = 30
    client.put("/v1/requirements/demo-aggregate", headers=BUYER, json=requirement)
    listing = row(client, "listings", "demo-slag", SELLER)
    prop = listing["properties"]["moisture"]
    prop["basis"] = "output"
    for day in [date.today() - timedelta(days=90), date.today() + timedelta(days=1)]:
        prop["measured_on"] = day.isoformat()
        client.put("/v1/listings/demo-slag", headers=SELLER, json=listing)
        result = client.post("/v1/assessments", headers=BUYER, json={"requirement_id": "demo-aggregate", "listing_id": "demo-slag"}).json()
        assert next(c for c in result["checks"] if c["code"] == "property:moisture")["status"] == "unknown"


def test_store_survives_restart(tmp_path):
    path = str(tmp_path / "persistent.sqlite")
    store = Store(path)
    store.put("requirement", "buyer", {"quantity": 5}, "req")
    store.consent("buyer", "seller", "buyer", True, "opportunity-a")
    store.consent("buyer", "seller", "seller", True, "opportunity-a")
    store.close()
    store = Store(path)
    assert store.get("requirement", "req")[1]["quantity"] == 5
    assert store.revealed("buyer", "seller", "opportunity-a")
    assert not store.revealed("buyer", "seller", "opportunity-b")
    store.close()


def test_llm_draft_validation_and_no_auto_publication():
    settings = Settings(llm_url="https://example.invalid/v1", llm_model="test", llm_key="test-key")
    text = "Rice husk and sludge jointly produce biochar by pyrolysis."
    draft = {"material": None, "properties": {}, "routes": [{"inputs": ["rice husk", "sludge"], "output": "biochar", "process": "pyrolysis", "supporting_text": text}]}
    def response(*args, **kwargs):
        return httpx.Response(200, request=httpx.Request("POST", "https://example.invalid/v1/chat/completions"), json={"choices": [{"message": {"content": json.dumps(draft)}}]})
    with patch("httpx.Client.post", response):
        result = extract(settings, text, "transformation_routes")
        assert result["status"] == "draft_requires_user_review"
        assert result["draft"]["routes"][0]["inputs"] == ["rice husk", "sludge"]
    draft["routes"][0]["supporting_text"] = "invented quotation"
    with patch("httpx.Client.post", response), pytest.raises(ValueError):
        extract(settings, text, "transformation_routes")
