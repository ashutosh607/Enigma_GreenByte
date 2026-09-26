"""Check the explicitly enabled local demo API; modifies only demo workflows."""
import argparse
import json

import httpx


def main():
    parser = argparse.ArgumentParser(description="Test discovery, rejection, savings, confidentiality and feedback on the demo API.")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="Running demo API address, including its port")
    args = parser.parse_args()
    buyer = {"Authorization": "Bearer demo-buyer-token"}
    seller = {"Authorization": "Bearer demo-seller-token"}
    with httpx.Client(base_url=args.base_url.rstrip("/"), timeout=60) as client:
        def call(method, path, headers=None, body=None):
            response = client.request(method, path, headers=headers, json=body)
            response.raise_for_status()
            return response.json()

        def check(condition, message):
            if not condition:
                raise SystemExit("FAIL: " + message + ". This script expects the original demo records; use a fresh demo database if you edited them.")

        health = call("GET", "/health")
        if not health.get("demo"):
            raise SystemExit("Refusing demo mutations: PS5_DEMO is not enabled")
        print("PASS: API healthy; retrieval backend = " + health["retrieval_backend"])
        response = call("POST", "/v1/matches", buyer, {"requirement_id": "demo-aggregate"})
        match = next((r for r in response["results"] if r["listing_id"] == "demo-slag" and "blast furnace slag" in r["pathway"]["inputs"] and r["pathway"]["output"] == "aggregate"), None)
        check(match is not None, "Research-backed slag-to-aggregate route found")
        check(match["status"] == "needs_validation", "Missing technical evidence remains needs_validation")
        print("PASS: research route discovered; missing evidence is not treated as approval")

        rejected = call("POST", "/v1/matches", buyer, {"requirement_id": "demo-aggregate", "listing_ids": ["demo-rejected"], "include_rejected": True})
        bad = next((r for r in rejected["results"] if r["status"] == "rejected" and any(c["code"] == "property:moisture" and c["status"] == "fail" for c in r["checks"])), None)
        check(bad is not None and bad["priority_score"] == 0, "Essential moisture mismatch is rejected")
        print("PASS: material failing an essential moisture limit is rejected")

        result = call("POST", "/v1/assessments", buyer, {
            "requirement_id": "demo-aggregate", "listing_id": "demo-slag", "route_id": match["route_id"],
            "scenario": {"yield_fraction": {"low": .8, "high": .8}, "processing_per_input_tonne": {"low": 500, "high": 500}, "transport_per_input_tonne": {"low": 300, "high": 300}}})
        check(result["cost"]["status"] == "estimated", "Cost scenario calculated")
        check(result["cost"]["input_tonnes"]["high"] == 125, "100 tonnes usable output requires 125 tonnes input")
        check(result["cost"]["savings_low"] == result["cost"]["savings_high"] == 150000, "Scenario saves INR 150000")
        print("PASS: 125 tonnes input, 100 tonnes output, INR 150000 estimated savings")
        path = f"/v1/opportunities/{result['id']}"

        # Reset consent only for this synthetic opportunity so repeat tests work.
        for headers in [buyer, seller]:
            call("POST", path + "/consent", headers, {"consent": False})
        check(not call("GET", path, buyer)["supplier"]["identity_visible"], "Confidential supplier is hidden")
        before = client.get(path + "/identities", headers=buyer).status_code
        check(before == 403, "Identity endpoint blocks disclosure before consent")
        call("POST", path + "/consent", buyer, {"consent": True})
        check(client.get(path + "/identities", headers=buyer).status_code == 403, "One consent does not reveal identities")
        call("POST", path + "/consent", seller, {"consent": True})
        revealed = call("GET", path + "/identities", buyer)
        check(revealed["seller"]["name"] == "Demo Slag Supplier", "Both consents reveal the demo supplier")
        print("PASS: identities blocked before/after one consent; revealed after both")

        call("POST", path + "/feedback", buyer, {"stage": "sample_requested"})
        history = call("GET", path + "/feedback", buyer)
        check(any(item["stage"] == "sample_requested" for item in history["items"]), "Sample-request feedback persisted")
        print("PASS: sample-request progress recorded")
        print(json.dumps({"opportunity_id": result["id"], "status": result["status"], "estimated_savings": result["cost"], "identity_before_http_status": before, "next_actions": result["next_actions"]}, indent=2))
        print("ALL DEMO CHECKS PASSED. These checks establish software behavior, not industrial suitability.")


if __name__ == "__main__":
    try:
        main()
    except httpx.HTTPError as exc:
        raise SystemExit(f"API request failed: {exc}. Check --base-url, the running server, and PS5_DEMO=1.") from exc
