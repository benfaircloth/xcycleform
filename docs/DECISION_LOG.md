# Decision Log

## D-001 — Deterministic measurement before generative interpretation
**Status:** Accepted  
Pose landmarks, geometry, temporal drift, and event detection are deterministic. The LLM does not invent measurements.

## D-002 — Local-first raw data
**Status:** Accepted  
Raw video and high-frequency landmark data remain local by default for the MVP. Cloud reasoning consumes a summarized evidence package.

## D-003 — No universal posture traffic light in early phases
**Status:** Accepted  
The MVP will not present unsourced “ideal angle” rules as universal green/yellow/red truth. Real-time indicators prioritize tracking quality and meaningful deviation.

## D-004 — LLM coaching is included in the technical MVP
**Status:** Accepted  
LLM inference enters at Phase 5 as a thin evidence-backed vertical slice rather than an early dependency.

## D-005 — Agentic behavior must be earned
**Status:** Accepted  
A single inference call is not labeled agentic. Full agentic orchestration is Phase 8 and must demonstrate meaningful tool selection / multi-step decision flow.

## D-006 — Local session persistence before cloud history
**Status:** Accepted  
IndexedDB or equivalent local persistence is used for the early MVP. Cross-device longitudinal storage is Phase 7.

## D-007 — Abstention is successful behavior
**Status:** Accepted  
The system should explicitly decline recommendations when measurement quality, source applicability, or evidence strength is insufficient.

## D-008 — Earlier accepted phases are protected
**Status:** Accepted  
Later work may not silently rewrite accepted earlier-phase behavior. Any required change must be proposed, approved, logged, and revalidated.
