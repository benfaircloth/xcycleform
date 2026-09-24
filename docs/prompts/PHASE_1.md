# Execute Phase 1 — Pose Capture

Implement the live camera -> client-side pose -> skeleton overlay path. Add pose-confidence and FPS diagnostics and robust failure handling.

Do not calculate biomechanics angles, score posture, persist sessions, or call any backend. The goal is to prove reliable pose capture and rendering, not to build a coaching app yet.

Record the reference browser/device and measured performance in the completion report. Acceptance criteria are exactly those in Phase 1 of `PHASE_PLAN.md`.

## Mandatory operating rules
- Read `MASTER_BUILD_PROMPT.md`, `PROJECT_STATE.md`, and the relevant sections of `PHASE_PLAN.md` before modifying code.
- Confirm `PROJECT_STATE.md` authorizes this phase. If it does not, make no implementation changes.
- Do not implement, scaffold, or refactor toward later phases.
- Preserve accepted behavior from prior phases.
- Run tests/build/type checks relevant to this phase.
- Finish with the completion-report format defined in `MASTER_BUILD_PROMPT.md`, then stop.
