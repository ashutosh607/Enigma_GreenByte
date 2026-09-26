import hashlib
import math
from datetime import date, datetime, timezone

from .economics import calculate, impact, input_ratio
from .knowledge import normalize
from .models import Check, ListingInput, Opportunity, RequirementInput, Scenario, Status

# Quantitative comparisons use explicit conversions, never LLM guesses.
UNITS = {"%": ("fraction", .01), "fraction": ("fraction", 1), "ppm": ("fraction", 1e-6),
         "mg/kg": ("fraction", 1e-6), "mm": ("length", 1), "um": ("length", .001),
         "µm": ("length", .001), "kg/m3": ("density", 1), "g/cm3": ("density", 1000),
         "ph": ("ph", 1), "c": ("temperature", 1)}


def converted(value, source, target):
    source, target = source.lower(), target.lower()
    if source == target:
        return value
    if source in UNITS and target in UNITS and UNITS[source][0] == UNITS[target][0]:
        return value * UNITS[source][1] / UNITS[target][1]
    return None


def distance_km(a, b):
    lat1, lat2 = math.radians(a.latitude), math.radians(b.latitude)
    delta_lat = lat2 - lat1
    delta_lon = math.radians(b.longitude - a.longitude)
    x = math.sin(delta_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(min(1, x)))


def assess(listing_data, requirement_data, route, similarity, scenario, supplier):
    listing = ListingInput.model_validate({k: v for k, v in listing_data.items() if k != "id"})
    requirement = RequirementInput.model_validate({k: v for k, v in requirement_data.items() if k != "id"})
    checks = []

    def add(code, status, reason, action=None, essential=True):
        checks.append(Check(code=code, status=status, reason=reason, next_action=action, essential=essential))

    add("inventory", Status.PASS if listing.active and listing.available_until >= date.today() else Status.FAIL,
        "Listing is active and not expired." if listing.active and listing.available_until >= date.today() else "Listing is inactive or expired.")
    add("period", Status.PASS if listing.period == requirement.period else Status.UNKNOWN,
        "Supply and demand periods agree." if listing.period == requirement.period else "A one-time quantity cannot be compared directly with recurring demand.",
        None if listing.period == requirement.period else "Confirm the amount available during the buyer's required period.")
    overlap = max(listing.available_from, requirement.needed_from) <= min(listing.available_until, requirement.needed_until)
    if not overlap:
        add("timing", Status.FAIL, "Supply and demand windows do not overlap.")
    elif listing.available_from <= requirement.needed_from and listing.available_until >= requirement.needed_until:
        add("timing", Status.PASS, "Supply covers the requested date window.")
    else:
        add("timing", Status.UNKNOWN, "Only part of the requested date window is covered.", "Agree a partial delivery schedule or another source.")

    accepted = route["id"] in requirement.accepted_route_ids
    direct = route["evidence_status"] == "direct_listing"
    add("material_route", Status.PASS if direct or accepted else Status.UNKNOWN,
        "Direct material identity or buyer-accepted route." if direct or accepted else "A documented pathway identifies a possibility, not supplier-specific suitability.",
        None if direct or accepted else "Review the cited pathway for this material grade and intended use.")
    application_known = accepted or direct or (route.get("application_terms") and any(term.lower() in requirement.intended_application.lower() for term in route["application_terms"]))
    add("application", Status.PASS if application_known else Status.UNKNOWN,
        "Buyer acceptance or recorded application context supports the intended use." if application_known else "Application context is not established by the aggregated graph.",
        None if application_known else "Confirm that the original evidence concerns this intended application.")
    if not route.get("dependencies_known", False):
        add("dependencies", Status.UNKNOWN, "The published pairwise extraction may omit concurrent inputs.", "Inspect the original source for co-inputs, equipment and process conditions.")
    else:
        primary = route.get("matched_input", listing.material)
        required_others = [i for i in route["inputs"] if normalize(i) != normalize(primary)]
        missing = [i for i in required_others if normalize(i) not in {normalize(c) for c in scenario.co_inputs_confirmed}]
        add("dependencies", Status.UNKNOWN if missing else Status.PASS,
            "Missing confirmed co-inputs: " + ", ".join(missing) if missing else "All recorded input dependencies are accounted for.",
            "Confirm availability of all required co-inputs." if missing else None)
    if route["processing_required"]:
        if not requirement.processing_allowed:
            add("processing", Status.FAIL, "This route requires processing, but the buyer does not allow it.")
        else:
            add("processing", Status.PASS if scenario.processor_confirmed else Status.UNKNOWN,
                "A processing arrangement is recorded." if scenario.processor_confirmed else "Processing equipment or service availability is unconfirmed.",
                None if scenario.processor_confirmed else "Confirm a processor and a supplier-specific processing plan.")
    else:
        add("processing", Status.PASS, "No substitution processing is inferred for a direct material match.")

    ratio = input_ratio(route, scenario)
    if ratio is None or listing.period != requirement.period:
        add("quantity", Status.UNKNOWN, "Usable output cannot be established without an input ratio and comparable periods.", "Confirm yield or replacement ratio and supply period.")
    else:
        usable = listing.quantity_tonnes / ratio.high
        add("quantity", Status.PASS if usable >= requirement.minimum_output_tonnes else Status.FAIL,
            f"Conservative usable output is {usable:.2f} tonnes; buyer minimum is {requirement.minimum_output_tonnes:.2f}.")
    if not requirement.constraints:
        add("specification", Status.UNKNOWN, "No essential acceptance specifications have been recorded.", "Add only the properties essential to the buyer's decision.")
    properties = {key.lower(): value for key, value in listing.properties.items()}
    for constraint in requirement.constraints:
        value = properties.get(constraint.property.lower())
        code = "property:" + constraint.property.lower()
        action = "Request an existing measurement or relevant sample result for " + constraint.property + "."
        if not value or value.basis != constraint.basis:
            add(code, Status.UNKNOWN, "Missing measurement on the required input/output basis.", action, constraint.essential)
            continue
        if value.measured_on and value.measured_on > date.today():
            add(code, Status.UNKNOWN, "Measurement date is in the future.", action, constraint.essential)
            continue
        if constraint.max_age_days is not None and (not value.measured_on or (date.today() - value.measured_on).days > constraint.max_age_days):
            add(code, Status.UNKNOWN, "Measurement age does not meet the requested freshness requirement.", action, constraint.essential)
            continue
        actual = converted(value.value, value.unit, constraint.unit)
        if actual is None:
            add(code, Status.UNKNOWN, "Units cannot be safely compared.", "Confirm compatible units and measurement basis.", constraint.essential)
            continue
        fits = (constraint.minimum is None or actual >= constraint.minimum) and (constraint.maximum is None or actual <= constraint.maximum)
        add(code, Status.PASS if fits else Status.FAIL,
            f"Recorded {actual:g} {constraint.unit}; allowed bounds {constraint.minimum} to {constraint.maximum}. Source type: {value.source_type}.",
            None if fits else "Resolve the specification mismatch before a trial.", constraint.essential)
    add("use_acceptance", Status.PASS if accepted else Status.UNKNOWN,
        "Buyer recorded route acceptance; this is not regulatory certification." if accepted else "Buyer-specific use acceptance is outstanding.",
        None if accepted else "Have the buyer's responsible technical person confirm use conditions and any applicable requirements.")

    cost = calculate(listing, requirement, route, scenario)
    if listing.period != requirement.period:
        cost.status = "unknown"
        cost.missing.append("comparable quantity periods")
        cost.baseline_total = cost.alternative_total = cost.savings_low = cost.savings_high = None
        cost.savings_percent_low = cost.savings_percent_high = None
        cost.matched_output_tonnes = cost.input_tonnes = None
    add("economics", Status.UNKNOWN if cost.status == "unknown" else Status.PASS if cost.savings_low >= 0 else Status.UNKNOWN,
        "Cost inputs incomplete." if cost.status == "unknown" else "Estimated savings range is non-negative." if cost.savings_low >= 0 else "Savings may be negative under the conservative scenario.",
        "Confirm missing quotations and assumptions." if cost.status == "unknown" else "Review the cost range before proceeding." if cost.savings_low < 0 else None,
        essential=False)
    km = distance_km(listing.location, requirement.location)
    add("delivery", Status.UNKNOWN if scenario.transport_per_input_tonne is None else Status.PASS,
        "Freight quote is missing." if scenario.transport_per_input_tonne is None else "A user-supplied freight estimate is recorded.",
        "Request a freight quote; straight-line distance is not a road route." if scenario.transport_per_input_tonne is None else None,
        essential=False)
    essentials = [c for c in checks if c.essential]
    status = "rejected" if any(c.status == Status.FAIL for c in essentials) else "needs_validation" if any(c.status == Status.UNKNOWN for c in essentials) else "ready_for_trial"
    complete = sum(c.status != Status.UNKNOWN for c in essentials) / len(essentials)
    known_fit = sum(c.status == Status.PASS for c in essentials) / len(essentials)
    quantity_fit = min(1, cost.matched_output_tonnes / requirement.quantity_output_tonnes) if cost.matched_output_tonnes is not None else 0
    savings = min(1, max(0, (cost.savings_percent_low or 0) / 30)) if cost.status == "estimated" else 0
    components = {"retrieval": round(similarity * 20, 2), "known_fit": round(known_fit * 30, 2),
                  "quantity": round(quantity_fit * 15, 2), "evidence": 10 if route["evidence_status"] == "reviewer_recorded" else 4 if direct else 2,
                  "savings": round(savings * 15, 2), "proximity": round(10 / (1 + km / 100), 2)}
    priority = round(sum(components.values()), 2)
    if status == "rejected":
        priority = 0
    next_actions = list(dict.fromkeys(c.next_action for c in checks if c.next_action and c.status != Status.PASS))
    key = f"{requirement_data['id']}:{listing_data['id']}:{route['id']}"
    oid = "opp-" + hashlib.sha256(key.encode()).hexdigest()[:24]
    pathway = {k: route[k] for k in ["inputs", "output", "process", "references", "evidence_status"]}
    pathway["processing_required"] = route["processing_required"]
    pathway["distance_band_km"] = f"{int(km // 50) * 50}-{(int(km // 50) + 1) * 50}"
    explanation = f"{listing.material} → {route['output']}. {sum(c.status == Status.PASS for c in essentials)} essential checks pass; {sum(c.status == Status.UNKNOWN for c in essentials)} remain unknown. Status: {status}."
    warnings = [route["warning"], "Priority is an ordering score, not a probability of successful substitution.",
                "Recorded properties and confirmations are declarations; no universal waste certificate or independent verification is implied."]
    if len(route["inputs"]) > 1:
        warnings.append("Quantity and costs model the listed primary input; other input costs must be supplied separately.")
    return Opportunity(id=oid, requirement_id=requirement_data["id"], listing_id=listing_data["id"], route_id=route["id"], supplier=supplier,
                       pathway=pathway, status=status, priority_score=priority, score_components=components,
                       evidence_completeness=round(complete, 4), score_note="Weights: retrieval 20, known fit 30, quantity 15, evidence 10, savings 15, proximity 10. Unknowns receive no positive fit credit. Essential failures override scoring.",
                       checks=checks, cost=cost, impact=impact(cost, scenario, route), explanation=explanation,
                       next_actions=next_actions, warnings=warnings, assessed_at=datetime.now(timezone.utc).isoformat())
