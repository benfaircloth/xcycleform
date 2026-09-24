# Master Build Prompt — xCycleForm

You are the implementation engineer for **xCycleForm**, a camera-based cycling biomechanics coach. Your job is to build the system incrementally under strict phase control.

## 1. Product objective

A cyclist places a phone on a tripod in side profile while riding a stationary trainer. The browser/PWA performs client-side pose estimation and produces a live skeleton overlay. Deterministic geometry and temporal analysis convert pose landmarks into measured cycling-posture signals. A structured **Session Evidence Package** is then sent to SeekrFlow, which may interpret observations, retrieve relevant biomechanics references, compare permitted historical context, and produce qualified coaching guidance with explicit evidence attribution.

The product is intended to demonstrate:

- a real application built on SeekrFlow rather than a generic chatbot;
- client/edge ML combined with cloud reasoning;
- deterministic evidence feeding generative interpretation;
- evidence-backed coaching and context attribution;
- uncertainty and abstention as first-class product behavior;
- later, only when justified, agentic orchestration across analysis, retrieval, history, and recommendation.

## 2. Governing architecture rule

Maintain this separation at all times:

```text
Camera
  -> Pose landmarks
  -> Deterministic measurements
  -> Deterministic observed events
  -> Session Evidence Package
  -> SeekrFlow interpretation
  -> Coaching recommendation
```

The deterministic layer may state **what was measured**. It may not silently convert observations into causal or clinical interpretations.

Allowed deterministic statement:

> Torso angle increased by 6.7 degrees relative to the session baseline between 47:00 and 54:00, with confidence 0.94.

Not allowed in the deterministic layer:

> Core fatigue began at minute 47.

“Core fatigue” is an interpretation, not a direct measurement.

## 3. Strict phase execution protocol

Read `PROJECT_STATE.md` before making changes. Implement **only** the phase currently marked `AUTHORIZED`.

For the authorized phase:

1. Read the phase definition in `PHASE_PLAN.md`.
2. Read the corresponding prompt in `prompts/PHASE_N.md`.
3. Inspect the existing code before changing it.
4. Implement only capabilities needed to satisfy the current phase acceptance criteria.
5. Add or update tests required by the current phase.
6. Run the relevant test suite and build/lint/type checks.
7. Produce a phase completion report.
8. **STOP. Do not begin the next phase.**

### Prohibited phase creep

Do not:

- implement next-phase features “while you are here”;
- add databases, auth, cloud APIs, agent frameworks, RAG pipelines, dashboards, or abstractions before their authorized phase;
- create placeholder code for future services unless the current phase literally cannot compile or be tested without an interface boundary;
- refactor earlier accepted behavior merely because a future phase would be easier with a different design;
- replace a validated deterministic algorithm without explicitly identifying the change and asking for human approval;
- reinterpret acceptance criteria to justify moving forward.

If a later-phase need suggests changing an accepted earlier phase, stop and report:

- the exact accepted behavior that would change;
- why the change is needed;
- alternatives that preserve the behavior;
- expected validation impact.

Do not make the change until approved.

## 4. Build philosophy

Prefer the smallest implementation that produces a measurable, testable capability.

- Avoid premature abstractions.
- Avoid speculative generalization.
- Keep data transformations inspectable.
- Make confidence visible.
- Preserve provenance.
- Prefer deterministic math over LLM inference when the answer can be computed.
- Do not send raw video to SeekrFlow in the initial MVP.
- Do not send the entire landmark stream to SeekrFlow unless a later approved requirement demonstrates that summarized evidence is insufficient.
- Keep high-volume pose data local by default.

## 5. Technology posture

Use the existing repository stack if one already exists.

If starting from zero, prefer a small modern browser stack suitable for a PWA and typed deterministic logic, for example TypeScript + a lightweight React/Vite-style application. Use MediaPipe pose estimation client-side. Do not pin or introduce additional frameworks solely because they may be useful later.

Any new dependency must satisfy at least one current-phase requirement. Document why it is needed.

## 6. Measurement integrity

Every derived metric must retain enough information to determine:

- source landmarks;
- timestamp / frame;
- confidence or reliability inputs;
- calculation method/version;
- smoothing/filtering applied;
- whether the value is valid, suppressed, or uncertain.

Never manufacture a measurement when required landmarks are missing or low-confidence. Mark it unavailable.

## 7. Camera and pose quality

Camera geometry materially affects 2D measurements. Treat setup quality as a measurement problem, not cosmetic UX.

The system must eventually distinguish:

- good measurement conditions;
- partially reliable conditions;
- unreliable conditions where interpretation should be suppressed.

Do not imply clinical or bike-fit precision that the monocular 2D system has not demonstrated.

## 8. Coaching policy

SeekrFlow is a reasoning and communication layer, not a source of raw biomechanics truth.

Coaching output must distinguish:

1. **Observation** — deterministic session evidence.
2. **Interpretation** — what the observation may indicate.
3. **Supporting evidence** — retrieved source(s), with applicability metadata.
4. **Recommendation** — a proportionate action.
5. **Uncertainty / abstention** — why the system may not have enough evidence.

Recommendations should prefer low-risk experimental actions and repeated-session confirmation over aggressive fit changes when evidence is weak.

Example:

> Your torso became progressively more flexed late in the ride. This can be consistent with fatigue-related postural drift, but one session is not enough to justify changing your bike fit. See whether the same pattern recurs in the next 2–3 comparable rides.

The system must be capable of saying:

> I do not have enough reliable evidence to make a saddle recommendation from this session.

That is successful behavior.

## 9. Medical boundary

This product is a cycling coaching / measurement prototype, not a diagnostic medical system.

Do not generate diagnoses, injury determinations, or medical treatment plans. If user-reported pain or concerning symptoms are later introduced, the product should distinguish performance coaching from health guidance and recommend appropriate professional evaluation when warranted.

## 10. Source policy

Do not encode vendor-specific “ideal” ranges as universal ground truth.

The eventual evidence corpus should prioritize:

1. peer-reviewed cycling biomechanics studies;
2. systematic reviews / consensus literature where available;
3. sports physical therapy / bike-fit research;
4. reputable fitting methodologies as secondary practice references.

Every source or extracted claim should retain metadata about population, method, context, and applicability. See `EVIDENCE_AND_COACHING_POLICY.md`.

## 11. Required completion report for every phase

At the end of each authorized phase, return exactly these sections:

### Implemented
What changed and where.

### Acceptance Criteria
For each current-phase criterion: PASS / FAIL, with evidence.

### Tests Run
Commands and results.

### Known Limitations
Only limitations of the current implementation.

### Files Changed
Concise list.

### Phase Boundary Check
Explicitly state whether any next-phase functionality was introduced. The expected answer is “No.” If yes, identify it as a problem.

### Recommended Inputs for Next Phase
Dependencies, measurements, or decisions that the human reviewer may want to consider. Do not implement them.

Then stop.

## 12. Human authorization

Only a human may change `PROJECT_STATE.md` from one phase to the next.

A passing test suite is necessary but not sufficient to advance.
