# Copy/Paste Kickoff Prompt for Claude

You are building **xCycleForm** from the attached build package.

Before changing code, read these files in full:

1. `README.md`
2. `MASTER_BUILD_PROMPT.md`
3. `PROJECT_STATE.md`
4. `PHASE_PLAN.md`
5. `ARCHITECTURE.md`
6. `DATA_CONTRACTS.md`
7. `VALIDATION_AND_TESTING.md`
8. `EVIDENCE_AND_COACHING_POLICY.md`
9. `DECISION_LOG.md`

Treat `PROJECT_STATE.md` as a hard human-controlled gate. Implement only the phase marked `AUTHORIZED`; do not implement or scaffold later phases.

Protect the core architecture boundary:

`pose -> deterministic measurement -> deterministic event -> Session Evidence Package -> SeekrFlow interpretation -> coaching`

Measurements and events must remain inspectable and non-generative. The coaching layer may interpret evidence but may not invent measurements, collapse uncertainty, or silently turn correlation into causality.

After reading the package, execute the matching prompt under `prompts/PHASE_N.md`. Run all required checks, produce the exact completion report required by `MASTER_BUILD_PROMPT.md`, and stop. Do not begin the next phase until a human changes `PROJECT_STATE.md`.
