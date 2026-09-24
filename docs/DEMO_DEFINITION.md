# Demo Definition

## Technical MVP — Phases 0–5

The technical MVP proves one complete evidence chain:

1. cyclist appears in side-profile camera view;
2. pose is estimated client-side;
3. deterministic metrics are calculated;
4. a sustained posture change is detected;
5. the session becomes a structured evidence package;
6. SeekrFlow produces a qualified coaching interpretation;
7. the response shows which session evidence and external evidence support the guidance;
8. the system can abstain when confidence is insufficient.

## Demo MVP — Phase 6 added

The demo MVP packages the above into a coherent experience a viewer can understand without reading logs or JSON.

### Ideal demo narrative

> At 47:12, the rider's torso angle began moving away from the session baseline. The change persisted for seven minutes and reached 6.7 degrees. Pose quality remained high during that window. xCycleForm identifies this as a measured postural drift event, not as “fatigue.” SeekrFlow then interprets the event using a curated biomechanics source and explains that fatigue-related postural change is one possible explanation. Because this is a single session, it recommends monitoring recurrence rather than changing saddle position. The viewer can inspect both the underlying ride evidence and the source used in the interpretation.

## What the demo should communicate about Seekr

- SeekrFlow can power application logic beyond chat.
- The AI operates over structured, externally measurable evidence.
- Retrieval supplies domain context rather than pretending the model already “knows” the correct fit.
- Context attribution can expose why a recommendation was generated.
- Trust includes knowing when not to recommend something.
- Edge and cloud responsibilities are deliberately separated.

## Anti-demo patterns

Avoid:
- “AI says your bike fit is wrong” without showing evidence;
- LLM analysis of raw camera frames as the core measurement method;
- universal red/green posture scores with weak sourcing;
- claiming agentic architecture when the workflow is a single prompt;
- showing polished coaching language before measurement validity is established.
