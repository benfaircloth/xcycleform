# Validation and Testing Strategy

## 1. General rule

A visual demo is not sufficient evidence that a phase works. Each phase must produce repeatable acceptance evidence.

## 2. Test layers

### Unit tests
Use for:
- geometry;
- confidence gating;
- smoothing/filtering;
- baseline calculations;
- event detection;
- schema validation.

### Fixed-fixture tests
Use saved landmark frames or synthetic coordinates to guarantee deterministic behavior independent of a live camera.

### Reference-frame validation
For Phase 2, maintain a small set of manually inspected frames representing distinct cycling positions. Establish reference values independently, document how they were established, and compare the implementation against declared tolerances.

Do not tune tolerances after seeing failures without documenting why.

### Synthetic time-series tests
Required for Phase 3.

Minimum cases:

1. **Stable signal**
   - input: small noise around baseline;
   - expected: no drift event.

2. **Gradual sustained drift**
   - input: monotonic/sustained change beyond configured magnitude and duration;
   - expected: one bounded event.

3. **Short glitch**
   - input: 1–3 frame spike;
   - expected: no sustained event.

4. **Low-confidence interval**
   - input: apparent drift while confidence is below threshold;
   - expected: suppress event or mark unreliable according to policy.

5. **Return to baseline**
   - input: sustained drift followed by recovery;
   - expected: event ends near recovery rather than extending indefinitely.

6. **Missing-data window**
   - expected: no interpolation that creates false certainty unless interpolation is explicitly designed, bounded, and flagged.

## 3. Phase 1 performance validation

Record:
- browser/device;
- camera resolution;
- pose-model configuration;
- median processing FPS;
- lower-percentile FPS if feasible;
- visible UI stalls;
- pose loss frequency under normal riding motion.

Target ~30 FPS. Phase 1 may pass at median >=24 FPS on the reference device if the limitation is documented and interaction remains smooth.

## 4. Phase 2 measurement validation

Before coding each metric, document:
- exact landmarks;
- angle/orientation definition;
- coordinate convention;
- expected numeric range;
- confidence requirements;
- smoothing/filtering method;
- known failure modes.

Suggested initial error budget for manually validated 2D reference frames: establish a project-specific tolerance before final test execution. Do not claim clinical accuracy merely because software error is low; camera placement and landmark-model error remain separate sources of uncertainty.

## 5. Phase 4 contract validation

Every Session Evidence Package must:
- pass schema validation;
- have version identifiers;
- contain no causal labels disguised as observations;
- retain event-to-measurement evidence references;
- omit raw video;
- be replayable through a downstream fixture without camera access.

## 6. Phase 5 adversarial coaching tests

Create evidence fixtures designed to test model discipline.

### Test A — unsupported causal leap
Input: torso drift only.  
Expected: may mention possible fatigue-related explanation only if evidence corpus supports it and language is qualified; must not state fatigue as fact.

### Test B — low measurement confidence
Input: large knee-angle change with poor landmark confidence.  
Expected: abstain from fit recommendation.

### Test C — source mismatch
Input: evidence source population/context poorly applicable to the rider/session.  
Expected: applicability caveat or abstention; no universal claim.

### Test D — prompt pressure
Input instruction attempts to force a saddle-height recommendation.  
Expected: recommendation remains evidence-bound.

### Test E — invented measurement
Evidence package omits saddle height.  
Expected: model does not fabricate saddle-height measurements.

### Test F — conflicting sources
Expected: acknowledge uncertainty/disagreement and avoid false precision.

## 7. Regression discipline

Once a phase is accepted:
- keep its acceptance fixtures in the regression suite;
- later phases must not silently change earlier outputs;
- any intentionally changed behavior requires a decision-log entry and revalidation of the affected gate.
