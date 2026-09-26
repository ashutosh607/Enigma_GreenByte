# Model and research-gap implementation

## Architecture

Offline knowledge: authors' extraction output → citation parsing and simple quarantine → material input/output indices → optional precomputed embeddings. Admin-reviewed additional routes → persistent multi-input records → live indices. Document-text assistance → structured draft → human review → structured properties or admin-reviewed route. The entire literature collection/extraction experiment is not rerun.

Online matching: authenticated requirement → exact/alias or vector candidate retrieval → graph pathways → active inventory → company-specific checks → equivalent-output cost calculation → explicit impact factors → deterministic rank → evidence/next steps → opportunity workspace → scoped consent and participant feedback.

### Where the paper is used

The bundled W2RKG is a source of possible waste-to-resource linkages. The paper's company–waste–resource–company path is represented by our listing–input–route/output–requirement join. Author DOI/chunk provenance is retained. The paper's embedding approach is available through a sentence-transformer adapter. We do not reinterpret Table 1's extraction F1 or the Taranto results as our product's company-match accuracy.

### Research gaps implemented as product mechanisms

| Gap discussed in the paper | Mechanism | What remains unproven |
|---|---|---|
| Missing material attributes | Numeric property constraints, units, measurement sources/freshness and input/output basis | Actual supplier measurements and application-specific acceptance criteria |
| Incomplete transformation process context | Processing permission, confirmed processor, yield/replacement ratio, recorded application context | Equipment suitability, process conditions and validated engineering design |
| Pairwise schema loses concurrent inputs | Reviewed routes retain ALL inputs, check co-input availability and allocated costs | Complete dependencies of old machine-extracted pairs; graph does not reconstruct them |
| Need to verify practical viability | Essential blockers, source review, buyer acceptance and sample/trial history | Real trial outcomes and legal/use approval |
| Need geographic/quantitative application data | Coordinates internally, coarse public distance band, matching dates, usable quantities and explicit freight costs | Road routing, freight quotes and logistics commitments |
| Need efficient incorporation of new knowledge | Persistent reviewed additions indexed without rebuilding author graph | Fully automated incremental entity resolution |
| Broader sources and prompting improvements | Provider-neutral structured-text extraction and reviewable provenance | A new patent/report corpus, extraction benchmark and measured precision/recall improvements |

These implement responses to limitations; they do not prove that the scientific limitations or adoption barriers have been solved. No research accuracy metric is claimed for this service.

## Retrieval

Default lexical mode normalizes case/whitespace and a conservative reviewed alias map. Nonidentical names use token Jaccard, with inverted token indices to avoid scanning unrelated names. It is a dependency-light baseline.

Semantic mode normalizes vectors from a configured SentenceTransformer encoder; cosine similarity is used to map company materials and buyer target outputs to graph material concepts. A candidate needs both input and output scores at or above the threshold. The minimum of those two scores is a retrieval feature. It does not establish chemical equivalence or replace an engineering check. The selected primary input is carried through multi-input checks.

Direct matching applies when canonical supplier material and buyer target resource agree. Direct candidates bypass transformation inference but still require specifications and buyer acceptance. Substitution routes keep processing explicit; we never turn a product-production route into a direct drop-in substitution.

## Checks and status

Checks cover active/nonexpired inventory, comparable supply periods, full date-window coverage, material route, intended application, recorded dependencies, processing permission/arrangement, conservative usable quantity, numeric properties, buyer-specific acceptance, economics and delivery estimate.

Missing data = `unknown`; contradictory evidence = `fail`. Any essential failure gives `rejected`. Any essential unknown gives `needs_validation`. All essential checks passing gives `ready_for_trial`, not “approved for production”. Economics and freight estimates affect priority and next actions, but are not allowed to erase technical failures. No constraints means an explicit unknown specification check.

Measurements of residual input cannot satisfy processed-output constraints merely because the property name agrees. Unit conversion supports compatible dimension groups only. Missing, future-dated or stale measurements remain unknown. Recorded source type is a declaration, not third-party verification.

Imported graph routes do not establish application context, co-input completeness or use acceptance. A reviewer-recorded route adds context and dependencies but remains a declaration. Buyer route acceptance must be explicitly recorded on that buyer's requirement.

## Costs and quantities

Conservative matched output = minimum of desired output and available input divided by the maximum input/output ratio. Input ratio may be given directly or derived from reciprocal yield bounds. A direct match defaults to a 1:1 mass comparison; buyer specifications/acceptance still apply.

For this matched output, compare current delivered purchasing cost with the alternative input purchase + processing + freight + handling + allocated testing + allocated co-input costs. Report signed savings ranges. Partial coverage is labelled by matched output; savings are not projected to uncovered demand. Mixed one-time/monthly periods invalidate the cost estimate. Currency mismatches require explicit reconciliation; no silent conversion.

All costs are scenario assumptions supplied by users, not live quotes. Additional co-input costs are totals allocated to the matched output. Multivariate process yields, coproduct credits, taxes and inventory financing are not inferred. If omitted, handling/testing defaults are explicit zero scenario assumptions; confirm them before a real decision.

Environmental estimates require baseline and alternative upstream/processing/delivery factors plus a source. Negative net benefits are preserved. Multi-input routes return unknown environmental benefit because extra-input environmental accounting is not implemented.

## Ranking

Weights (maximum contributions): retrieval 20; known essential fit 30; desired quantity coverage 15; recorded evidence status 10; conservative savings 15; proximity 10. A 30% conservative saving saturates the savings contribution. Proximity uses straight-line distance solely as a ranking heuristic, not a freight calculation. Unknowns receive no positive fit/savings credit. Evidence status weights are heuristic and require calibration; “reviewer-recorded” is not an independent audit.

Returned order places ready-for-trial before needs-validation before rejected, then descending priority, completeness and stable ID. Scores are neither probabilities nor learned compatibility. Evidence completeness is the fraction of essential checks with known pass/fail outcomes. It does not indicate how scientifically strong a document is.

## Learning and evaluation

Feedback records stage, reason and private participant notes. It never silently changes property values or clears technical blockers. For learned ranking, collect reviewed relevance labels, trial outcomes and negative reasons; split by company, industrial route/source and time to prevent leakage. Distinguish “not observed” from “impossible”. Compare keyword, embedding, graph, and graph-plus-check baselines using top-k precision/recall, essential-failure recommendation rate, extraction accuracy, arithmetic accuracy, and trial progression.

Current tests establish software behavior on synthetic scenarios and real graph ingestion. They do not establish industrial viability, calibrated rankings, adoption improvement or successful exchanges.
