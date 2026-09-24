# xCycleForm Build Package

Working name: **xCycleForm**  
Purpose: camera-based cycling biomechanics coach built as a strict, phase-gated product demo of deterministic measurement + evidence-backed SeekrFlow coaching.

## Core product thesis

A phone on a tripod captures a cyclist from the side while riding a trainer. Client-side pose estimation produces landmarks. A deterministic biomechanics layer converts those landmarks into measurements and time-series events. Only after those observations are packaged into a structured **Session Evidence Package** does SeekrFlow interpret the evidence, retrieve relevant biomechanics references, and generate qualified coaching guidance with attribution.

The system must preserve this chain:

`camera -> landmarks -> measurements -> observed events -> evidence package -> interpretation -> recommendation`

Never collapse the deterministic and generative layers.

## What is in this package

- `MASTER_BUILD_PROMPT.md` — the governing prompt for Claude / Claude Code.
- `PHASE_PLAN.md` — strict build phases, allowed scope, forbidden scope, and exit gates.
- `ARCHITECTURE.md` — component boundaries, data flow, and design principles.
- `DATA_CONTRACTS.md` — canonical schemas for measurements, events, evidence packages, sources, and coaching output.
- `VALIDATION_AND_TESTING.md` — empirical acceptance criteria and testing strategy.
- `EVIDENCE_AND_COACHING_POLICY.md` — RAG corpus policy, interpretation rules, abstention, uncertainty, and medical-safety boundaries.
- `PROJECT_STATE.md` — single source of truth for the currently authorized phase.
- `DECISION_LOG.md` — architecture decisions that should not be silently revisited.
- `DEMO_DEFINITION.md` — definition of the technical MVP and demo MVP.
- `prompts/PHASE_0.md` through `prompts/PHASE_8.md` — copy/paste prompts for executing one phase at a time.
- `examples/session-evidence-package.example.json` — illustrative evidence payload.
- `examples/coaching-response.example.json` — illustrative structured coaching response.

## How to use this package

1. Give Claude the repository plus this package.
2. Paste `MASTER_BUILD_PROMPT.md` once at the beginning of the project.
3. Confirm `PROJECT_STATE.md` identifies the authorized phase.
4. Paste only the prompt for that phase from `prompts/`.
5. Claude implements only that phase, runs its tests, updates the phase report, and stops.
6. A human reviews the exit gate and explicitly authorizes the next phase by updating `PROJECT_STATE.md`.

## Non-negotiable operating rule

**Passing a phase does not authorize the next phase.** Claude must stop at each gate. No speculative scaffolding, abstractions, placeholders, services, schemas, or dependencies solely for future phases.

## Initial MVP boundary

- **Technical MVP:** Phases 0–5
- **Demo MVP:** Phases 0–6
- **Productization / extended intelligence:** Phases 7–8

The strongest demo is not the skeleton overlay. It is the evidence chain: **what changed, how confidently it was measured, why it may matter, which evidence supports the interpretation, and why the system recommended—or declined to recommend—an action.**
