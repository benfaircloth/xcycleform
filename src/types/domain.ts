export type MeasurementStatus = 'valid' | 'uncertain' | 'unavailable'

export interface Landmark {
  x: number
  y: number
  z?: number
  visibility?: number
  presence?: number
}

export interface PoseFrame {
  timestampMs: number
  frameIndex: number
  landmarks: Record<string, Landmark>
  modelConfidence?: number
}

export interface Measurement {
  metricId: string
  metricVersion: string
  timestampMs: number
  value: number | null
  unit: 'deg' | 'ratio' | 'normalized'
  status: MeasurementStatus
  confidence: number | null
  sourceLandmarks: string[]
  qualityFlags: string[]
  filter?: {
    method: string
    parameters: Record<string, number | string | boolean>
  }
}

export interface ObservedEvent {
  eventId: string
  eventType: string
  metricId: string
  startMs: number
  endMs: number
  baselineValue: number
  observedValue: number
  delta: number
  unit: string
  durationMs: number
  confidence: number | null
  persistence: number
  qualityFlags: string[]
  evidenceRefs: string[]
  algorithmVersion: string
}

export interface SessionQualitySummary {
  overallStatus: 'good' | 'mixed' | 'poor'
  poseCoveragePct: number
  validMeasurementPctByMetric: Record<string, number>
  majorFlags: string[]
  cameraSetupFlags: string[]
}

export interface MetricSummary {
  metricId: string
  metricVersion: string
  unit: string
  validPct: number
  baseline?: number
  mean?: number
  median?: number
  min?: number
  max?: number
  p10?: number
  p90?: number
  trend?: number
  qualityFlags: string[]
}

export interface EvidenceSample {
  evidenceRef: string
  metricId: string
  startMs: number
  endMs: number
  values: Array<{ timestampMs: number; value: number; confidence?: number }>
}

export interface SessionEvidencePackage {
  schemaVersion: string
  sessionId: string
  startedAt: string
  durationMs: number
  activityContext: {
    sport: 'cycling'
    environment: 'indoor_trainer' | 'other'
    riderView: 'left_side' | 'right_side' | 'unknown'
    optionalMetadata?: Record<string, string | number | boolean | null>
  }
  system: {
    poseModel: string
    poseModelVersion?: string
    measurementEngineVersion: string
    temporalAnalyzerVersion: string
  }
  quality: SessionQualitySummary
  metrics: MetricSummary[]
  events: ObservedEvent[]
  samples?: EvidenceSample[]
}
