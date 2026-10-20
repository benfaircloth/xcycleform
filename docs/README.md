# xCycleForm Build Package

Working name: **xCycleForm**  
Purpose: camera-based cycling biomechanics coach built as a strict, phase-gated project separating deterministic measurement from evidence-backed LLM coaching.

## Core product thesis

A phone on a tripod captures a cyclist from the side while riding a trainer. Client-side pose estimation produces landmarks. A deterministic biomechanics layer converts those landmarks into measurements and time-series events. Only after those observations are packaged into a structured **Session Evidence Package** does the LLM interpret the evidence, retrieve relevant biomechanics references, and generate qualified coaching guidance with attribution.

The system must preserve this chain:

`camera -> landmarks -> measurements -> observed events -> evidence package -> interpretation -> recommendation`

Never collapse the deterministic and generative layers.

## What is in this package

- `PHASE_PLAN.md` — strict build phases, allowed scope, forbidden scope, and exit gates.
- `ARCHITECTURE.md` — component boundaries, data flow, and design principles.
- `DATA_CONTRACTS.md` — canonical schemas for measurements, events, evidence packages, sources, and coaching output.
- `VALIDATION_AND_TESTING.md` — empirical acceptance criteria and testing strategy.
- `EVIDENCE_AND_COACHING_POLICY.md` — RAG corpus policy, interpretation rules, abstention, uncertainty, and medical-safety boundaries.
- `PROJECT_STATE.md` — single source of truth for the currently authorized phase.
- `DECISION_LOG.md` — architecture decisions that should not be silently revisited.
- `DEMO_DEFINITION.md` — definition of the technical MVP and demo MVP.
- `examples/session-evidence-package.example.json` — illustrative evidence payload.
- `examples/coaching-response.example.json` — illustrative structured coaching response.

## Phase discipline

Each phase has explicit scope boundaries and an exit gate. Passing a phase does not authorize the next. No speculative scaffolding, abstractions, or dependencies solely for future phases.

## Initial MVP boundary

- **Technical MVP:** Phases 0–5
- **Demo MVP:** Phases 0–6
- **Productization / extended intelligence:** Phases 7–8

The strongest demo is not the skeleton overlay. It is the evidence chain: **what changed, how confidently it was measured, why it may matter, which evidence supports the interpretation, and why the system recommended—or declined to recommend—an action.**
