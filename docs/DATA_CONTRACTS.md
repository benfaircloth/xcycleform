# Canonical Data Contracts

These contracts define conceptual invariants. Exact code syntax may follow the repository's language, but field meaning should remain stable unless a human-approved schema change is recorded.

## 1. PoseFrame

```ts
interface PoseFrame {
  timestampMs: number;
  frameIndex: number;
  landmarks: Record<string, Landmark>;
  modelConfidence?: number;
}

interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}
```

Coordinates must document their reference space: normalized image coordinates, pixels, or another explicit system.

## 2. Measurement

```ts
type MeasurementStatus = "valid" | "uncertain" | "unavailable";

interface Measurement {
  metricId: string;
  metricVersion: string;
  timestampMs: number;
  value: number | null;
  unit: "deg" | "ratio" | "normalized";
  status: MeasurementStatus;
  confidence: number | null; // normalized 0..1 if available
  sourceLandmarks: string[];
  qualityFlags: string[];
  filter?: {
    method: string;
    parameters: Record<string, number | string | boolean>;
  };
}
```

Invariant: if required landmarks are missing or below the metric's confidence threshold, do not fabricate a value. Use `uncertain` or `unavailable` according to declared rules.

## 3. ObservedEvent

```ts
interface ObservedEvent {
  eventId: string;
  eventType: string;              // e.g. "metric_drift"
  metricId: string;
  startMs: number;
  endMs: number;
  baselineValue: number;
  observedValue: number;
  delta: number;
  unit: string;
  durationMs: number;
  confidence: number | null;
  persistence: number;            // declared normalized measure or explicit units
  qualityFlags: string[];
  evidenceRefs: string[];         // references back to metric windows/samples
  algorithmVersion: string;
}
```

Event names must describe observations, not causes. Good: `torso_angle_drift`. Bad: `core_fatigue`.

## 4. SessionQualitySummary

```ts
interface SessionQualitySummary {
  overallStatus: "good" | "mixed" | "poor";
  poseCoveragePct: number;
  validMeasurementPctByMetric: Record<string, number>;
  majorFlags: string[];
  cameraSetupFlags: string[];
}
```

The labels above describe **measurement quality**, not rider quality.

## 5. SessionEvidencePackage

```ts
interface SessionEvidencePackage {
  schemaVersion: string;
  sessionId: string;
  startedAt: string;
  durationMs: number;
  activityContext: {
    sport: "cycling";
    environment: "indoor_trainer" | "other";
    riderView: "left_side" | "right_side" | "unknown";
    optionalMetadata?: Record<string, string | number | boolean | null>;
  };
  system: {
    poseModel: string;
    poseModelVersion?: string;
    measurementEngineVersion: string;
    temporalAnalyzerVersion: string;
  };
  quality: SessionQualitySummary;
  metrics: MetricSummary[];
  events: ObservedEvent[];
  samples?: EvidenceSample[];
}

interface MetricSummary {
  metricId: string;
  metricVersion: string;
  unit: string;
  validPct: number;
  baseline?: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  p10?: number;
  p90?: number;
  trend?: number;
  qualityFlags: string[];
}

interface EvidenceSample {
  evidenceRef: string;
  metricId: string;
  startMs: number;
  endMs: number;
  values: Array<{timestampMs: number; value: number; confidence?: number}>;
}
```

## 6. EvidenceSource

```ts
interface EvidenceSource {
  sourceId: string;
  title: string;
  authors?: string[];
  publication?: string;
  year?: number;
  sourceType:
    | "peer_reviewed_study"
    | "systematic_review"
    | "consensus"
    | "clinical_or_sports_pt_reference"
    | "fitting_methodology"
    | "other";
  locator?: string;               // DOI, URL, corpus id, etc.
  population?: string;
  sampleSize?: number;
  cyclingContext?: string;
  measurementMethod?: string;
  claims: EvidenceClaim[];
}

interface EvidenceClaim {
  claimId: string;
  statement: string;
  applicabilityNotes: string[];
  limitations: string[];
}
```

## 7. StructuredCoachingResponse

```ts
interface StructuredCoachingResponse {
  schemaVersion: string;
  sessionId: string;
  overallConfidence: "high" | "moderate" | "low" | "insufficient";
  summary: string;
  findings: CoachingFinding[];
  abstentions: Abstention[];
}

interface CoachingFinding {
  findingId: string;
  observation: string;
  observationEvidenceRefs: string[];
  interpretation: string;
  interpretationQualifier: string;
  sourceClaimRefs: string[];
  recommendation: string;
  recommendationType:
    | "monitor"
    | "technique_cue"
    | "setup_experiment"
    | "fit_consideration"
    | "seek_professional_input";
  confidence: "high" | "moderate" | "low";
  limitations: string[];
}

interface Abstention {
  topic: string;
  reason: string;
  missingOrWeakEvidence: string[];
}
```

## 8. Required language discipline

Structured output should make it difficult for the model to blur categories.

- `observation` must only restate supplied deterministic evidence.
- `interpretation` must use qualified language when causality is not demonstrated.
- `sourceClaimRefs` must reference retrieved claims actually supplied to the model.
- `recommendation` must be proportionate to evidence quality.
- unsupported high-impact fit changes should produce abstention or a monitoring recommendation instead.
