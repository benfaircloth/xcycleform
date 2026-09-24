# Execute Phase 3 — Temporal Analysis

Implement deterministic session-time analysis that can identify sustained changes in measured posture relative to a defined baseline. Produce bounded ObservedEvent objects with timestamps, magnitude, duration, persistence, confidence, quality flags, and evidence references.

Create synthetic tests for stable signals, gradual drift, short glitches, low-confidence intervals, missing data, and return-to-baseline.

Do not attach causal labels. “Torso-angle drift” is allowed; “core fatigue” is not. Acceptance criteria are exactly those in Phase 3 of `PHASE_PLAN.md`.

## Mandatory operating rules
- Read `MASTER_BUILD_PROMPT.md`, `PROJECT_STATE.md`, and the relevant sections of `PHASE_PLAN.md` before modifying code.
- Confirm `PROJECT_STATE.md` authorizes this phase. If it does not, make no implementation changes.
- Do not implement, scaffold, or refactor toward later phases.
- Preserve accepted behavior from prior phases.
- Run tests/build/type checks relevant to this phase.
- Finish with the completion-report format defined in `MASTER_BUILD_PROMPT.md`, then stop.
