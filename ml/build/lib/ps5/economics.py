from .models import CostResult, Impact, Range


def input_ratio(route, scenario):
    if scenario.input_tonnes_per_output_tonne:
        return scenario.input_tonnes_per_output_tonne
    if scenario.yield_fraction:
        return Range(low=1 / scenario.yield_fraction.high, high=1 / scenario.yield_fraction.low)
    if not route["processing_required"]:
        return Range(low=1, high=1)
    return None


def calculate(listing, requirement, route, scenario):
    ratio = input_ratio(route, scenario)
    missing = []
    if ratio is None:
        missing.append("yield_fraction or input_tonnes_per_output_tonne")
    if listing.price_per_input_tonne is None:
        missing.append("supplier price")
    if requirement.current_delivered_price_per_tonne is None:
        missing.append("current delivered price")
    if listing.currency != requirement.currency:
        missing.append("prices in a common currency; automatic exchange rates are not used")
    if route["processing_required"] and scenario.processing_per_input_tonne is None:
        missing.append("processing cost")
    if scenario.transport_per_input_tonne is None:
        missing.append("transport cost or explicit zero")
    if len(route["inputs"]) > 1 and scenario.additional_inputs_total is None:
        missing.append("cost of additional required inputs")
    assumptions = ["Scenario inputs are user-supplied estimates, not a quotation or technical approval.",
                   "Costs compare the same usable output over the stated supply period.",
                   "Price uses the current listing/bid and must be recalculated after negotiation."]
    if scenario.assumptions_note:
        assumptions.append(scenario.assumptions_note)
    if ratio is None:
        return CostResult(status="unknown", currency=requirement.currency, missing=missing, assumptions=assumptions)
    output = min(requirement.quantity_output_tonnes, listing.quantity_tonnes / ratio.high)
    input_amount = Range(low=output * ratio.low, high=output * ratio.high)
    if missing:
        return CostResult(status="unknown", currency=requirement.currency, matched_output_tonnes=round(output, 4), input_tonnes=input_amount, missing=missing, assumptions=assumptions)
    processing = scenario.processing_per_input_tonne or Range(low=0, high=0)
    transport = scenario.transport_per_input_tonne
    co_inputs = scenario.additional_inputs_total or Range(low=0, high=0)
    price = listing.price_per_input_tonne
    low = input_amount.low * (price + processing.low + transport.low + scenario.handling_per_input_tonne.low) + scenario.testing_total.low + co_inputs.low
    high = input_amount.high * (price + processing.high + transport.high + scenario.handling_per_input_tonne.high) + scenario.testing_total.high + co_inputs.high
    baseline = output * requirement.current_delivered_price_per_tonne
    return CostResult(status="estimated", currency=requirement.currency, matched_output_tonnes=round(output, 4), input_tonnes=input_amount,
                      baseline_total=round(baseline, 2), alternative_total=Range(low=round(low, 2), high=round(high, 2)),
                      savings_low=round(baseline - high, 2), savings_high=round(baseline - low, 2),
                      savings_percent_low=round(100 * (baseline - high) / baseline, 2) if baseline > 0 else None,
                      savings_percent_high=round(100 * (baseline - low) / baseline, 2) if baseline > 0 else None,
                      assumptions=assumptions)


def impact(cost, scenario, route):
    required = ["baseline_kgco2e_per_output_tonne", "processing_kgco2e_per_input_tonne", "transport_kgco2e_per_input_tonne", "alternative_upstream_kgco2e_per_input_tonne", "factor_source"]
    missing = [key for key in required if getattr(scenario, key) is None or getattr(scenario, key) == ""]
    if len(route["inputs"]) > 1:
        missing.append("environmental accounting for additional inputs (not implemented)")
    if not cost.input_tonnes or cost.matched_output_tonnes is None:
        missing.append("usable output and input ratio")
    if missing:
        return Impact(status="unknown", missing=missing)
    baseline = cost.matched_output_tonnes * scenario.baseline_kgco2e_per_output_tonne
    factor = scenario.processing_kgco2e_per_input_tonne + scenario.transport_kgco2e_per_input_tonne + scenario.alternative_upstream_kgco2e_per_input_tonne
    return Impact(status="estimated", net_kgco2e_low=round(baseline - cost.input_tonnes.high * factor, 2),
                  net_kgco2e_high=round(baseline - cost.input_tonnes.low * factor, 2), factor_source=scenario.factor_source)
