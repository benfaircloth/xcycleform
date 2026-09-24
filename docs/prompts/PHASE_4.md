# Execute Phase 4 — Session Evidence Package

Implement the local session lifecycle and canonical Session Evidence Package. Persist locally using IndexedDB or an equivalent browser-local mechanism. The package must summarize the session, metrics, quality, and deterministic events while retaining provenance and remaining materially smaller than raw frame/landmark data.

Add schema validation plus import/export or fixture replay so downstream logic can be tested without live camera input.

Do not call SeekrFlow or generate coaching text. Acceptance criteria are exactly those in Phase 4 of `PHASE_PLAN.md`.

## Mandatory operating rules
- Read `MASTER_BUILD_PROMPT.md`, `PROJECT_STATE.md`, and the relevant sections of `PHASE_PLAN.md` before modifying code.
- Confirm `PROJECT_STATE.md` authorizes this phase. If it does not, make no implementation changes.
- Do not implement, scaffold, or refactor toward later phases.
- Preserve accepted behavior from prior phases.
- Run tests/build/type checks relevant to this phase.
- Finish with the completion-report format defined in `MASTER_BUILD_PROMPT.md`, then stop.
