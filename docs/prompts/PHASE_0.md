# Execute Phase 0 — Foundation

Build only the application foundation. Establish a clean local developer experience, typed app shell, build/lint/type-test path, and minimal project structure. Do not integrate camera, MediaPipe, persistence, SeekrFlow, RAG, or analytics.

Focus on making the next phase easy to validate without prebuilding it. A future capability is not a current requirement.

Acceptance criteria are exactly those in Phase 0 of `PHASE_PLAN.md`.

## Mandatory operating rules
- Read `MASTER_BUILD_PROMPT.md`, `PROJECT_STATE.md`, and the relevant sections of `PHASE_PLAN.md` before modifying code.
- Confirm `PROJECT_STATE.md` authorizes this phase. If it does not, make no implementation changes.
- Do not implement, scaffold, or refactor toward later phases.
- Preserve accepted behavior from prior phases.
- Run tests/build/type checks relevant to this phase.
- Finish with the completion-report format defined in `MASTER_BUILD_PROMPT.md`, then stop.
