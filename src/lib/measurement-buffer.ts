import type { KneeAngleResult } from './geometry'
import { captureFrame } from './frame-capture'
import { PedalStrokeDetector, type PedalStrokeCycle, type StrokeEventType } from './pedal-stroke-detector'

const PLAUSIBLE_MIN_ANGLE = 30
const PLAUSIBLE_MAX_ANGLE = 170
const MAX_CAPTURES_PER_TYPE = 3

export interface AngleSample {
  timestampS: number
  angle: number
  status: 'valid' | 'low_confidence'
  confidence: { hip: number; knee: number; ankle: number }
}

export interface CapturedFrame {
  type: StrokeEventType
  timestampS: number
  angle: number
  dataUrl: string
}

export interface CycleSummary {
  count: number
  avgBdcAngle: number
  avgTdcAngle: number
  avgRom: number
  avgCadenceRpm: number
  cycles: PedalStrokeCycle[]
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
  pedalStrokes: CycleSummary | null
  capturedFrames: CapturedFrame[]
  samples: AngleSample[]
}

export class MeasurementBuffer {
  private samples: AngleSample[] = []
  private unavailableCount = 0
  private discardedCount = 0
  private startTimeS: number | null = null
  private endTimeS: number | null = null
  private side: 'left' | 'right' = 'left'
  private detector = new PedalStrokeDetector()
  private _capturedFrames: CapturedFrame[] = []
  private bdcCaptureCount = 0
  private tdcCaptureCount = 0
  private videoElement: HTMLVideoElement | null = null

  constructor() {
    this.detector.onEvent = (type, timestampS, angle) => {
      this.onStrokeEvent(type, timestampS, angle)
    }
  }

  setVideoElement(el: HTMLVideoElement | null) {
    this.videoElement = el
  }

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

    this.detector.push(result.angle, timestampS)
  }

  private onStrokeEvent(type: StrokeEventType, timestampS: number, angle: number) {
    if (!this.videoElement) return

    const dataUrl = captureFrame(this.videoElement)
    if (!dataUrl) return

    const frame: CapturedFrame = { type, timestampS, angle, dataUrl }
    const count = type === 'bdc' ? this.bdcCaptureCount : this.tdcCaptureCount

    if (count < MAX_CAPTURES_PER_TYPE) {
      this._capturedFrames.push(frame)
    } else {
      // Slots: [0]=first (locked), [1]=middle (tracks temporal midpoint), [2]=last (always latest)
      const slots = this.slotsForType(type)
      const midTime = (slots[0].timestampS + timestampS) / 2
      // Before overwriting last, check if it's a better midpoint candidate
      if (Math.abs(slots[2].timestampS - midTime) < Math.abs(slots[1].timestampS - midTime)) {
        Object.assign(slots[1], slots[2])
      }
      Object.assign(slots[2], frame)
    }

    if (type === 'bdc') this.bdcCaptureCount++
    else this.tdcCaptureCount++
  }

  private slotsForType(type: StrokeEventType): CapturedFrame[] {
    return this._capturedFrames.filter((f) => f.type === type)
  }

  clear() {
    this.samples = []
    this.unavailableCount = 0
    this.discardedCount = 0
    this.startTimeS = null
    this.endTimeS = null
    this.detector.clear()
    this._capturedFrames = []
    this.bdcCaptureCount = 0
    this.tdcCaptureCount = 0
  }

  get sampleCount() {
    return this.samples.length
  }

  get cycleCount() {
    return this.detector.cycleCount
  }

  get currentCadence() {
    return this.detector.currentCadence
  }

  get capturedFrameCount() {
    return this._capturedFrames.length
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

    const cycles = this.detector.cycles
    let pedalStrokes: CycleSummary | null = null
    if (cycles.length > 0) {
      pedalStrokes = {
        count: cycles.length,
        avgBdcAngle: cycles.reduce((s, c) => s + c.bdcAngle, 0) / cycles.length,
        avgTdcAngle: cycles.reduce((s, c) => s + c.tdcAngle, 0) / cycles.length,
        avgRom: cycles.reduce((s, c) => s + c.rom, 0) / cycles.length,
        avgCadenceRpm: cycles.reduce((s, c) => s + c.cadenceRpm, 0) / cycles.length,
        cycles: [...cycles],
      }
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
      pedalStrokes,
      capturedFrames: [...this._capturedFrames],
      samples: this.samples,
    }
  }
}
