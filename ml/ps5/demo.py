from datetime import date, timedelta


def seed(store):
    today = date.today()
    last = (today + timedelta(days=365)).isoformat()
    start = today.isoformat()
    location = {"region": "Western India", "latitude": 19.076, "longitude": 72.878}
    if not store.get("company", "demo-buyer"):
        store.put("company", "demo-buyer", {"name": "Demo Aggregate Buyer", "contact": "buyer@example.invalid"}, "demo-buyer")
        store.put("company", "demo-seller", {"name": "Demo Slag Supplier", "contact": "seller@example.invalid"}, "demo-seller")
        store.put("listing", "demo-seller", {
            "material": "blast furnace slag", "quantity_tonnes": 500, "period": "monthly",
            "available_from": start, "available_until": last, "location": {**location, "latitude": 19.5},
            "price_per_input_tonne": 2000, "currency": "INR", "confidential": True,
            "properties": {"moisture": {"value": 4.2, "unit": "%", "basis": "input", "source_type": "self_reported", "measured_on": start}},
            "sale_mode": "negotiation", "active": True,
        }, "demo-slag")
        store.put("listing", "demo-seller", {
            "material": "aggregate", "quantity_tonnes": 100, "period": "monthly",
            "available_from": start, "available_until": last, "location": location,
            "price_per_input_tonne": 4500, "currency": "INR", "confidential": False,
            "properties": {"moisture": {"value": 12, "unit": "%", "basis": "output", "source_type": "self_reported", "measured_on": start}},
            "sale_mode": "fixed", "active": True,
        }, "demo-rejected")
        store.put("requirement", "demo-buyer", {
            "current_material": "virgin aggregate", "target_resource": "aggregate",
            "intended_application": "road aggregate requiring buyer-specific validation",
            "quantity_output_tonnes": 100, "minimum_output_tonnes": 50, "period": "monthly",
            "needed_from": start, "needed_until": (today + timedelta(days=90)).isoformat(), "location": location,
            "current_delivered_price_per_tonne": 5000, "currency": "INR",
            "constraints": [{"property": "moisture", "unit": "%", "maximum": 5, "basis": "output", "essential": True}],
            "processing_allowed": True, "accepted_route_ids": [],
        }, "demo-aggregate")
