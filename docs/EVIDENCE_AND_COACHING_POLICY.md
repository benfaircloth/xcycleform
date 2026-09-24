# Evidence and Coaching Policy

## 1. Purpose

The coaching layer should be useful without pretending that monocular pose estimation or bike-fit literature provides universal answers for every rider.

## 2. Evidence hierarchy

Prefer the corpus in this order:

1. systematic reviews / consensus evidence where relevant;
2. peer-reviewed cycling biomechanics research;
3. sports physical therapy / cycling fit research;
4. reputable fitting methodologies and professional practice references;
5. vendor guidance only as clearly labeled secondary material.

A recognizable fitting brand is not automatically ground truth.

## 3. Source metadata

Each source should retain, where available:
- title;
- authors;
- date/year;
- source type;
- population characteristics;
- sample size;
- riding context / discipline;
- measurement method;
- metric definition;
- source claim(s);
- limitations;
- applicability notes.

The RAG unit should be a claim with context, not an isolated number stripped of study conditions.

## 4. No universal “ideal” posture table

Do not begin the product with a global mapping like:

```text
knee = X–Y degrees -> green
outside -> red
```

unless a specific rule has been deliberately sourced, scoped, and labeled for a matching context.

Prefer:
- rider/session baseline;
- sustained deviation from baseline;
- source-specific reference envelopes;
- measurement confidence;
- repeated-session consistency.

## 5. Observation vs interpretation

### Observation
Directly supported by deterministic evidence.

> Knee extension increased by 4.1 degrees during the final 15 minutes relative to the session baseline.

### Interpretation
A qualified explanation supported by source context.

> A change like this may reflect altered pedaling posture or position as the session progresses. The available session data does not establish the cause.

### Recommendation
Should match evidence strength.

> Monitor whether the same change recurs during comparable rides before changing fit.

## 6. Recommendation ladder

Prefer the lowest-impact recommendation that addresses the evidence.

1. **Monitor** — gather more comparable evidence.
2. **Technique cue** — reversible in-session cue.
3. **Setup experiment** — small reversible experiment.
4. **Fit consideration** — something worth reviewing, not automatically changing.
5. **Professional input** — bike fitter / coach / relevant professional when stakes or uncertainty warrant.

The model should not jump to step 4 merely because it can produce a plausible explanation.

## 7. Abstention triggers

Abstain or materially qualify when:
- pose/measurement confidence is poor;
- camera setup undermines geometry;
- event is too brief or inconsistent;
- applicable evidence is weak or mismatched;
- sources disagree materially;
- the requested conclusion exceeds what was measured;
- the recommendation would require medical diagnosis;
- the recommendation is a meaningful fit change supported only by one ambiguous session.

## 8. Longitudinal evidence

When Phase 7 exists, repeated within-rider patterns may be more actionable than one-off reference-range comparisons.

Example:

> In four comparable endurance sessions, torso drift began between 52 and 58 minutes. In the latest two sessions it began after 80 minutes.

This is a descriptive longitudinal finding. The cause still requires interpretation.

## 9. Medical and injury language

Allowed:
- “This posture pattern may be worth discussing with a qualified bike fitter.”
- “Because you reported pain, a biomechanics coaching prototype should not diagnose the cause.”

Not allowed as product behavior without a separate validated medical framework:
- diagnosing tendinopathy, nerve compression, disc problems, or similar conditions;
- prescribing treatment;
- claiming an observed angle caused an injury.

## 10. RAG output expectations

Retrieved context should expose enough source metadata for the model and user to understand:
- what the source actually studied;
- whether the riding context matches;
- whether the metric definitions match;
- what limitations apply.

Context attribution should point to both:
- the rider/session evidence that triggered the finding;
- the external evidence used to interpret it.
