# xCycleForm Strict Phase Plan

## Phase 0 — Visual Pipeline Validation

### Objective
Validate the core visual pipeline: can we reliably observe a cyclist from a side-profile video, extract useful pose information, derive at least one trustworthy cycling-relevant measurement, and present that information visually?

### Permitted scope
- browser/PWA application shell, build/lint/type-test path;
- prerecorded video playback with pause, seek, and frame stepping;
- client-side MediaPipe pose estimation against video frames;
- skeleton/landmark overlay aligned to the rider;
- per-landmark confidence visibility;
- deterministic knee-angle calculation (hip, knee, ankle);
- measurement confidence gating (valid / low confidence / unavailable);
- simple visual measurement feedback (angle value + measurement status);
- debug/diagnostics panel (FPS, latency, coordinates, confidence);
- paused-frame inspection with stable landmarks and angle;
- live camera input using the same pose pipeline;
- unit tests for deterministic geometry;
- at least five representative regression fixture frames.

### Explicitly forbidden
- SeekrFlow / LLM inference / RAG / coaching agents;
- natural-language coaching;
- normative bike-fit judgment (green/yellow/red scoring);
- multiple biomechanics metrics beyond knee angle;
- temporal/drift analysis;
- session recording or IndexedDB persistence;
- longitudinal history or cloud backend;
- authentication or account management;
- dashboards or charts;
- smoothing or filtering;
- placeholder implementations for future-phase features.

### Exit gate
- prerecorded side-profile cycling video plays with continuous pose detection;
- skeleton overlay visibly tracks the rider;
- pose confidence is exposed and inspectable;
- hip, knee, and ankle landmarks are available for inspection;
- knee angle is calculated deterministically and visibly changes through pedal stroke;
- low-confidence landmarks suppress or qualify the calculated result;
- paused frame can be inspected with stable landmarks and angle;
- at least five representative frames captured as regression fixtures;
- same pipeline operates from a live camera source;
- rendering FPS and inference FPS are visible;
- one simple feedback component consumes the derived measurement;
- no later-phase functionality has been implemented.

---

## Phase 1 — Pose Capture

### Objective
Prove reliable side-profile pose capture and live skeleton visualization on the target browser/device.

### Permitted scope
- camera permission and device selection if needed;
- client-side MediaPipe pose estimation;
- live video preview;
- skeleton/landmark overlay;
- pose confidence diagnostics;
- measured processing/render FPS;
- graceful handling of denied permission, missing camera, model-load failure, and lost pose.

### Explicitly forbidden
- joint-angle engine;
- posture scoring;
- green/yellow/red biomechanics judgment;
- session recording;
- persistent session storage;
- SeekrFlow / RAG / coaching.

### Exit gate
- side-profile cyclist can be captured continuously;
- overlay remains spatially aligned with the rider during normal trainer movement;
- target is ~30 FPS on the reference device; median >=24 FPS is acceptable for Phase 1 only if diagnostics document the device and no significant UI lockups occur;
- pose confidence is visible/inspectable;
- failure states are handled without app crash;
- basic performance metrics are logged.

If the reference device cannot sustain the minimum threshold, stop and report rather than hiding the issue.

---

## Phase 2 — Measurement Engine

### Objective
Convert pose landmarks into stable, deterministic, validated cycling posture measurements.

### Initial metrics
- knee angle;
- hip angle;
- torso/back orientation metric;
- elbow angle;
- neck/head posture metric.

Exact geometric definitions must be documented before implementation and kept versioned.

### Permitted scope
- geometry functions;
- landmark confidence gating;
- smoothing/filtering needed to stabilize metrics;
- camera/setup quality diagnostics needed for trustworthy measurement;
- per-frame metric status: valid / uncertain / unavailable;
- developer visualization of measured angles.

### Explicitly forbidden
- claiming “good” or “bad” fit;
- causal interpretations;
- “core fatigue” or other inferred states;
- RAG/LLM;
- session-level coaching;
- cloud storage.

### Exit gate
- each metric has a documented geometric definition;
- unit tests validate geometry on synthetic coordinates;
- fixed reference frames are checked against manually established values;
- tolerances are declared before final evaluation;
- low-confidence landmarks suppress or downgrade metrics;
- repeated frames do not produce unstable jumps beyond defined tolerance absent movement;
- setup-quality problems are surfaced rather than silently accepted.

---

## Phase 3 — Temporal Analysis

### Objective
Detect meaningful within-session posture changes from measurement time series without assigning unsupported causes.

### Permitted scope
- rolling baselines;
- smoothing/downsampling;
- change-point or drift logic;
- event windows;
- severity based on magnitude/persistence, not medical significance;
- pedal-cycle-aware aggregation if measurement quality supports it;
- replay/debug inspection for detected events.

### Explicitly forbidden
- generative interpretation;
- hardcoded clinical causality;
- automatic bike-fit changes;
- RAG;
- cloud history.

### Exit gate
Synthetic and recorded tests demonstrate at minimum:
- stable posture -> no drift event;
- gradual sustained change -> event;
- brief landmark glitch -> no event;
- low-confidence window -> event suppressed or marked unreliable;
- return to baseline -> correctly bounded event;
- event includes metric, baseline, observed value, delta, duration, confidence, and timestamps.

---

## Phase 4 — Session Evidence Package

### Objective
Create the stable deterministic artifact that forms the boundary between measurement and AI interpretation.

### Permitted scope
- local session lifecycle;
- IndexedDB or equivalent local browser persistence;
- session metadata;
- metric summaries;
- event summaries;
- confidence/quality summaries;
- limited event-window samples if needed;
- schema validation;
- export/import of the evidence object for testing;
- local replay support if required to inspect evidence.

### Explicitly forbidden
- SeekrFlow calls;
- coaching text;
- cloud user history;
- agent frameworks;
- RAG.

### Exit gate
- a completed ride creates one schema-valid Session Evidence Package;
- package can be inspected/exported independently of UI;
- provenance from event -> metric -> relevant source measurements is preserved;
- raw video is not embedded;
- payload is materially smaller than the raw per-frame landmark stream;
- package can be replayed through downstream test fixtures without a live camera.

---

## Phase 5 — SeekrFlow Coaching

### Objective
Demonstrate one complete evidence-backed coaching path through SeekrFlow.

### Permitted scope
- SeekrFlow endpoint/inference integration;
- small curated RAG corpus;
- structured coaching-output schema;
- evidence attribution;
- source metadata;
- uncertainty and abstention;
- mapping one or more observed events to qualified interpretations and recommendations.

### Explicitly forbidden
- full autonomous multi-tool agent unless required by SeekrFlow's minimal execution model;
- broad longitudinal personalization;
- account system;
- complex cloud session management;
- expanding into medical diagnosis.

### Exit gate
At least one deterministic event can produce a structured response containing:
- observation grounded in the evidence package;
- qualified interpretation;
- one or more supporting references where applicable;
- proportionate recommendation;
- uncertainty statement;
- explicit abstention when evidence quality or source applicability is insufficient;
- traceable link from coaching statement to supplied evidence/source material.

The model must not invent measurements absent from the evidence package.

---

## Phase 6 — Post-Ride Demo UX

### Objective
Turn the technical pipeline into a coherent end-to-end product demo.

### Permitted scope
- post-ride summary;
- time-series charts;
- event timeline;
- event detail/replay links;
- coaching cards;
- confidence indicators;
- evidence/source drill-down;
- clear language separating observation, interpretation, and recommendation.

### Explicitly forbidden
- user-account platform work;
- unnecessary cloud sync;
- autonomous agent expansion;
- feature breadth unrelated to the validated evidence chain.

### Exit gate
A first-time observer can:
1. start a session;
2. see pose tracking;
3. complete a session;
4. inspect measured changes;
5. read coaching guidance;
6. inspect why the guidance was produced;
7. recognize when the system is uncertain or abstains.

---

## Phase 7 — Longitudinal Intelligence

### Objective
Compare sessions over time and distinguish persistent rider patterns from one-off within-session changes.

### Permitted scope
- authenticated or pseudonymous rider identity if necessary;
- backend session/history store;
- cross-device sync if justified;
- longitudinal baselines;
- comparable-session filtering;
- trend detection;
- coaching that references prior sessions through explicit evidence.

### Exit gate
The system can accurately answer evidence-based questions such as:

> In comparable endurance rides, torso drift previously began around 55 minutes and now typically begins around 85 minutes.

It must show which sessions support the statement and avoid comparing non-comparable contexts without qualification.

---

## Phase 8 — Agentic Coaching

### Objective
Use agentic orchestration only after multiple distinct tools/data sources genuinely require decision-making.

### Candidate tools
- inspect current-session events;
- retrieve biomechanics evidence;
- query comparable session history;
- assess evidence sufficiency;
- formulate recommendation;
- abstain.

### Exit gate
The agent demonstrates a traceable multi-step decision in which tool selection matters to the result. It must not be an LLM call wrapped in agent terminology.
