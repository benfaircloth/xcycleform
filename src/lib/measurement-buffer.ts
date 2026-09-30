import type { KneeAngleResult } from './geometry'

const PLAUSIBLE_MIN_ANGLE = 30
const PLAUSIBLE_MAX_ANGLE = 170

export interface AngleSample {
  timestampS: number
  angle: number
  status: 'valid' | 'low_confidence'
  confidence: { hip: number; knee: number; ankle: number }
}

export interface SessionSummary {
  side: 'left' | 'right'
  durationS: number
  frameCount: number
  validFrames: number
  lowConfidenceFrames: number
  unavailableFrames: number
  discardedFrames: number
  angleStats: {
    min: number
    max: number
    mean: number
    range: number
  } | null
  samples: AngleSample[]
}

export class MeasurementBuffer {
  private samples: AngleSample[] = []
  private unavailableCount = 0
  private discardedCount = 0
  private startTimeS: number | null = null
  private endTimeS: number | null = null
  private side: 'left' | 'right' = 'left'

  setSide(side: 'left' | 'right') {
    this.side = side
  }

  record(timestampS: number, result: KneeAngleResult | null) {
    if (this.startTimeS === null) this.startTimeS = timestampS
    this.endTimeS = timestampS

    if (!result || result.status === 'unavailable' || result.angle === null) {
      this.unavailableCount++
      return
    }

    if (result.angle < PLAUSIBLE_MIN_ANGLE || result.angle > PLAUSIBLE_MAX_ANGLE) {
      this.discardedCount++
      return
    }

    this.samples.push({
      timestampS,
      angle: result.angle,
      status: result.status,
      confidence: {
        hip: result.hipConfidence,
        knee: result.kneeConfidence,
        ankle: result.ankleConfidence,
      },
    })
  }

  clear() {
    this.samples = []
    this.unavailableCount = 0
    this.discardedCount = 0
    this.startTimeS = null
    this.endTimeS = null
  }

  get sampleCount() {
    return this.samples.length
  }

  summarize(): SessionSummary {
    const validSamples = this.samples.filter((s) => s.status === 'valid')
    const lowConfSamples = this.samples.filter((s) => s.status === 'low_confidence')
    const allAngles = this.samples.map((s) => s.angle)

    let angleStats: SessionSummary['angleStats'] = null
    if (allAngles.length > 0) {
      const min = Math.min(...allAngles)
      const max = Math.max(...allAngles)
      const mean = allAngles.reduce((a, b) => a + b, 0) / allAngles.length
      angleStats = { min, max, mean, range: max - min }
    }

    return {
      side: this.side,
      durationS: this.startTimeS !== null && this.endTimeS !== null
        ? this.endTimeS - this.startTimeS
        : 0,
      frameCount: this.samples.length + this.unavailableCount + this.discardedCount,
      validFrames: validSamples.length,
      lowConfidenceFrames: lowConfSamples.length,
      unavailableFrames: this.unavailableCount,
      discardedFrames: this.discardedCount,
      angleStats,
      samples: this.samples,
    }
  }
}
