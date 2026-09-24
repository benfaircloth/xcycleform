# Execute Phase 2 — Measurement Engine

Implement deterministic geometry for the five initial posture metrics. Before implementing each metric, document its exact geometric definition, source landmarks, coordinate convention, confidence requirements, smoothing behavior, and known failure modes.

Add camera/setup and landmark-quality gating where required for trustworthy measurement. Values must be valid, uncertain, or unavailable; never fabricate a usable measurement from weak landmarks.

Build fixture-based and synthetic geometry tests. Do not interpret measurements as good/bad fit, fatigue, injury, or coaching. Acceptance criteria are exactly those in Phase 2 of `PHASE_PLAN.md`.

## Mandatory operating rules
- Read `MASTER_BUILD_PROMPT.md`, `PROJECT_STATE.md`, and the relevant sections of `PHASE_PLAN.md` before modifying code.
- Confirm `PROJECT_STATE.md` authorizes this phase. If it does not, make no implementation changes.
- Do not implement, scaffold, or refactor toward later phases.
- Preserve accepted behavior from prior phases.
- Run tests/build/type checks relevant to this phase.
- Finish with the completion-report format defined in `MASTER_BUILD_PROMPT.md`, then stop.
