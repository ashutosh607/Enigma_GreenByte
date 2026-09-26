from datetime import date
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Model(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False, str_strip_whitespace=True, validate_assignment=True)


class Status(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    UNKNOWN = "unknown"


class Location(Model):
    region: str = Field(min_length=1, max_length=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class Measurement(Model):
    value: float
    unit: str = Field(min_length=1, max_length=30)
    source_type: Literal["self_reported", "existing_report", "sample_test"] = "self_reported"
    measured_on: date | None = None
    source_reference: str | None = Field(default=None, max_length=300)
    basis: Literal["input", "output"] = "input"


class Constraint(Model):
    property: str = Field(min_length=1, max_length=80)
    unit: str = Field(min_length=1, max_length=30)
    minimum: float | None = None
    maximum: float | None = None
    essential: bool = True
    max_age_days: int | None = Field(default=None, ge=0)
    basis: Literal["input", "output"] = "output"

    @model_validator(mode="after")
    def valid_bounds(self):
        if self.minimum is None and self.maximum is None:
            raise ValueError("A constraint needs a minimum or maximum")
        if self.minimum is not None and self.maximum is not None and self.minimum > self.maximum:
            raise ValueError("minimum must not exceed maximum")
        return self


class CompanyInput(Model):
    name: str = Field(min_length=1, max_length=150)
    contact: str = Field(min_length=1, max_length=150)


class ListingInput(Model):
    material: str = Field(min_length=1, max_length=150)
    quantity_tonnes: float = Field(gt=0, le=1e9)
    period: Literal["one_time", "monthly"] = "monthly"
    available_from: date
    available_until: date
    location: Location
    price_per_input_tonne: float | None = Field(default=None, ge=0)
    currency: str = Field(default="INR", pattern=r"^[A-Z]{3}$")
    confidential: bool = False
    properties: dict[str, Measurement] = Field(default_factory=dict, max_length=50)
    sale_mode: Literal["fixed", "negotiation", "auction"] = "negotiation"
    active: bool = True

    @model_validator(mode="after")
    def ordered_dates(self):
        if self.available_until < self.available_from:
            raise ValueError("available_until must be after available_from")
        return self


class RequirementInput(Model):
    current_material: str = Field(min_length=1, max_length=150)
    target_resource: str = Field(min_length=1, max_length=150)
    intended_application: str = Field(min_length=1, max_length=500)
    quantity_output_tonnes: float = Field(gt=0, le=1e9)
    minimum_output_tonnes: float = Field(gt=0, le=1e9)
    period: Literal["one_time", "monthly"] = "monthly"
    needed_from: date
    needed_until: date
    location: Location
    current_delivered_price_per_tonne: float | None = Field(default=None, ge=0)
    currency: str = Field(default="INR", pattern=r"^[A-Z]{3}$")
    constraints: list[Constraint] = Field(default_factory=list, max_length=50)
    processing_allowed: bool = True
    accepted_route_ids: list[str] = Field(default_factory=list, max_length=100)

    @model_validator(mode="after")
    def valid_requirement(self):
        if self.needed_until < self.needed_from:
            raise ValueError("needed_until must be after needed_from")
        if self.minimum_output_tonnes > self.quantity_output_tonnes:
            raise ValueError("minimum_output_tonnes exceeds desired quantity")
        return self


class Citation(Model):
    doi: str
    url: str
    chunk: str | None = None


class RouteInput(Model):
    inputs: list[str] = Field(min_length=1, max_length=20)
    output: str = Field(min_length=1, max_length=150)
    process: str = Field(max_length=4000)
    application_terms: list[str] = Field(min_length=1, max_length=30)
    references: list[Citation] = Field(min_length=1, max_length=30)
    reviewer: str = Field(min_length=1, max_length=150)
    supporting_text: str = Field(min_length=1, max_length=12000)
    processing_required: bool = True


class Range(Model):
    low: float = Field(ge=0)
    high: float = Field(ge=0)

    @model_validator(mode="after")
    def ordered(self):
        if self.low > self.high:
            raise ValueError("low must not exceed high")
        return self


class Scenario(Model):
    yield_fraction: Range | None = None
    input_tonnes_per_output_tonne: Range | None = None
    processing_per_input_tonne: Range | None = None
    transport_per_input_tonne: Range | None = None
    handling_per_input_tonne: Range = Field(default_factory=lambda: Range(low=0, high=0))
    testing_total: Range = Field(default_factory=lambda: Range(low=0, high=0))
    additional_inputs_total: Range | None = None
    processor_confirmed: bool = False
    co_inputs_confirmed: list[str] = Field(default_factory=list, max_length=20)
    baseline_kgco2e_per_output_tonne: float | None = Field(default=None, ge=0)
    processing_kgco2e_per_input_tonne: float | None = Field(default=None, ge=0)
    transport_kgco2e_per_input_tonne: float | None = Field(default=None, ge=0)
    alternative_upstream_kgco2e_per_input_tonne: float | None = Field(default=None, ge=0)
    factor_source: str | None = Field(default=None, max_length=300)
    assumptions_note: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def physical_ranges(self):
        if self.yield_fraction and (self.yield_fraction.low <= 0 or self.yield_fraction.high > 1):
            raise ValueError("yield_fraction must be greater than zero and at most one")
        if self.input_tonnes_per_output_tonne and self.input_tonnes_per_output_tonne.low <= 0:
            raise ValueError("input ratio must be greater than zero")
        if self.yield_fraction and self.input_tonnes_per_output_tonne:
            raise ValueError("Specify yield OR replacement ratio, not both")
        return self


class MatchRequest(Model):
    requirement_id: str
    listing_ids: list[str] | None = Field(default=None, max_length=500)
    limit: int = Field(default=10, ge=1, le=50)
    similarity_threshold: float = Field(default=0.75, ge=0.5, le=1)
    include_rejected: bool = False
    scenarios_by_listing: dict[str, Scenario] = Field(default_factory=dict, max_length=500)


class AssessRequest(Model):
    requirement_id: str
    listing_id: str
    route_id: str | None = None
    scenario: Scenario = Field(default_factory=Scenario)


class Check(Model):
    code: str
    status: Status
    essential: bool
    reason: str
    next_action: str | None = None


class CostResult(Model):
    status: Literal["estimated", "unknown"]
    currency: str
    matched_output_tonnes: float | None = None
    input_tonnes: Range | None = None
    baseline_total: float | None = None
    alternative_total: Range | None = None
    savings_low: float | None = None
    savings_high: float | None = None
    savings_percent_low: float | None = None
    savings_percent_high: float | None = None
    missing: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)


class Impact(Model):
    status: Literal["estimated", "unknown"]
    net_kgco2e_low: float | None = None
    net_kgco2e_high: float | None = None
    missing: list[str] = Field(default_factory=list)
    factor_source: str | None = None


class SupplierView(Model):
    identity_visible: bool
    company_id: str | None = None
    name: str | None = None
    contact: str | None = None
    label: str | None = None
    region: str
    verification: str


class Pathway(Model):
    inputs: list[str]
    output: str
    process: str
    references: list[Citation]
    evidence_status: str
    processing_required: bool
    distance_band_km: str


class Opportunity(Model):
    id: str
    requirement_id: str
    listing_id: str
    route_id: str
    supplier: SupplierView
    pathway: Pathway
    status: Literal["rejected", "needs_validation", "ready_for_trial"]
    priority_score: float
    score_components: dict[str, float]
    evidence_completeness: float
    score_note: str
    checks: list[Check]
    cost: CostResult
    impact: Impact
    explanation: str
    next_actions: list[str]
    warnings: list[str]
    ranking_version: str = "rules-v1"
    assessed_at: str


class MatchResponse(Model):
    requirement_id: str
    candidates_evaluated: int
    rejected_count: int
    results: list[Opportunity]
    retrieval_backend: str
    elapsed_ms: float


class FeedbackInput(Model):
    stage: Literal["sample_requested", "sample_passed", "sample_failed", "trial_passed", "trial_failed", "accepted", "rejected", "completed"]
    reason: Literal["technical", "price", "timing", "privacy", "stock", "other"] | None = None
    note: str | None = Field(default=None, max_length=1000)


class ExtractRequest(Model):
    text: str = Field(min_length=1, max_length=30000)
    purpose: Literal["material_properties", "transformation_routes"] = "material_properties"
