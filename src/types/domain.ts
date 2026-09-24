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
