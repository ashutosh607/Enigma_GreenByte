/** Small integration helper. Generate full types from docs/openapi.json if desired. */
export type Check = {
  code: string; status: "pass" | "fail" | "unknown";
  essential: boolean; reason: string; next_action: string | null;
};
export type Opportunity = {
  id: string; requirement_id: string; listing_id: string; route_id: string;
  status: "rejected" | "needs_validation" | "ready_for_trial";
  priority_score: number; evidence_completeness: number;
  supplier: {identity_visible: boolean; label?: string | null; name?: string | null; region: string};
  pathway: {inputs: string[]; output: string; process: string; references: {doi: string; url: string; chunk?: string | null}[]};
  checks: Check[]; next_actions: string[]; explanation: string; warnings: string[];
  cost: {status: "estimated" | "unknown"; currency: string; savings_low: number | null; savings_high: number | null; missing: string[]};
};
export type Interval = {low: number; high: number};
export type Scenario = {
  yield_fraction?: Interval; input_tonnes_per_output_tonne?: Interval;
  processing_per_input_tonne?: Interval; transport_per_input_tonne?: Interval;
  handling_per_input_tonne?: Interval; testing_total?: Interval;
  additional_inputs_total?: Interval; processor_confirmed?: boolean;
  co_inputs_confirmed?: string[];
};

export function createPS5Client(baseUrl: string, getToken: () => string) {
  async function request<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      method, headers: {Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json"},
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({detail: "Request failed"}));
      throw new Error(JSON.stringify({status: response.status, detail: error.detail}));
    }
    return response.json() as Promise<T>;
  }
  return {
    matches: (requirementId: string, scenarios: Record<string, Scenario> = {}) =>
      request<{results: Opportunity[]; candidates_evaluated: number; elapsed_ms: number}>("/v1/matches", {requirement_id: requirementId, scenarios_by_listing: scenarios}),
    assess: (requirementId: string, listingId: string, routeId: string, scenario: Scenario) =>
      request<Opportunity>("/v1/assessments", {requirement_id: requirementId, listing_id: listingId, route_id: routeId, scenario}),
    opportunity: (id: string) => request<Opportunity>(`/v1/opportunities/${encodeURIComponent(id)}`, undefined, "GET"),
    consent: (id: string, consent: boolean) => request<{identity_revealed: boolean}>(`/v1/opportunities/${encodeURIComponent(id)}/consent`, {consent}),
    feedback: (id: string, stage: string, reason?: string) => request(`/v1/opportunities/${encodeURIComponent(id)}/feedback`, {stage, reason}),
  };
}
