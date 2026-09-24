# Execute Phase 0 — Visual Pipeline Validation

Validate the core visual pipeline end-to-end:

```text
prerecorded video
→ MediaPipe pose estimation
→ landmark/skeleton overlay
→ confidence visibility
→ deterministic knee-angle calculation
→ simple visual measurement feedback
→ paused-frame inspection
→ live-camera validation
```

Start with prerecorded video for repeatability and deterministic debugging. Add live camera only after the prerecorded pipeline is stable. Both paths must use the same pose-processing, geometry, and rendering components.

Acceptance criteria are exactly those in Phase 0 of `PHASE_PLAN.md`.

## Mandatory operating rules
- Read `MASTER_BUILD_PROMPT.md`, `PROJECT_STATE.md`, and the relevant sections of `PHASE_PLAN.md` before modifying code.
- Confirm `PROJECT_STATE.md` authorizes this phase. If it does not, make no implementation changes.
- Do not implement, scaffold, or refactor toward later phases.
- Preserve accepted behavior from prior phases.
- Run tests/build/type checks relevant to this phase.
- Finish with the completion-report format defined in `MASTER_BUILD_PROMPT.md`, then stop.
