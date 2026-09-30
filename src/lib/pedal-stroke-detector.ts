export interface PedalStrokeCycle {
  tdcAngle: number
  bdcAngle: number
  rom: number
  durationS: number
  cadenceRpm: number
  tdcTimestampS: number
  bdcTimestampS: number
}

type Direction = 'rising' | 'falling' | 'unknown'

interface Extremum {
  angle: number
  timestampS: number
}

const HYSTERESIS_DEG = 15
const MIN_CYCLE_DURATION_S = 0.3
const MAX_CYCLE_DURATION_S = 4.0

export type StrokeEventType = 'bdc' | 'tdc'
export type StrokeEventCallback = (type: StrokeEventType, timestampS: number, angle: number) => void

export class PedalStrokeDetector {
  private direction: Direction = 'unknown'
  private runningMax: Extremum | null = null
  private runningMin: Extremum | null = null
  private lastTdc: Extremum | null = null
  private _cycles: PedalStrokeCycle[] = []
  onEvent: StrokeEventCallback | null = null

  get cycles(): readonly PedalStrokeCycle[] {
    return this._cycles
  }

  get cycleCount(): number {
    return this._cycles.length
  }

  get currentCadence(): number | null {
    if (this._cycles.length < 2) return null
    const recent = this._cycles.slice(-3)
    const avgDuration = recent.reduce((s, c) => s + c.durationS, 0) / recent.length
    return avgDuration > 0 ? 60 / avgDuration : null
  }

  clear() {
    this.direction = 'unknown'
    this.runningMax = null
    this.runningMin = null
    this.lastTdc = null
    this._cycles = []
  }

  push(angle: number, timestampS: number) {
    if (!this.runningMax || !this.runningMin) {
      this.runningMax = { angle, timestampS }
      this.runningMin = { angle, timestampS }
      return
    }

    if (angle > this.runningMax.angle) {
      this.runningMax = { angle, timestampS }
    }
    if (angle < this.runningMin.angle) {
      this.runningMin = { angle, timestampS }
    }

    if (this.direction === 'unknown') {
      if (angle - this.runningMin.angle >= HYSTERESIS_DEG) {
        this.direction = 'rising'
        this.runningMax = { angle, timestampS }
      } else if (this.runningMax.angle - angle >= HYSTERESIS_DEG) {
        this.direction = 'falling'
        this.runningMin = { angle, timestampS }
      }
      return
    }

    if (this.direction === 'rising') {
      if (this.runningMax.angle - angle >= HYSTERESIS_DEG) {
        this.onEvent?.('bdc', this.runningMax.timestampS, this.runningMax.angle)
        this.onBdc(this.runningMax)
        this.direction = 'falling'
        this.runningMin = { angle, timestampS }
      }
    } else if (this.direction === 'falling') {
      if (angle - this.runningMin.angle >= HYSTERESIS_DEG) {
        this.onEvent?.('tdc', this.runningMin.timestampS, this.runningMin.angle)
        this.onTdc(this.runningMin)
        this.direction = 'rising'
        this.runningMax = { angle, timestampS }
      }
    }
  }

  private onBdc(bdc: Extremum) {
    if (!this.lastTdc || bdc.timestampS <= this.lastTdc.timestampS) return

    const halfCycleS = bdc.timestampS - this.lastTdc.timestampS
    const fullCycleS = halfCycleS * 2
    const rom = bdc.angle - this.lastTdc.angle

    if (rom < HYSTERESIS_DEG) return
    if (fullCycleS < MIN_CYCLE_DURATION_S || fullCycleS > MAX_CYCLE_DURATION_S) return

    this._cycles.push({
      tdcAngle: this.lastTdc.angle,
      bdcAngle: bdc.angle,
      rom,
      durationS: fullCycleS,
      cadenceRpm: 60 / fullCycleS,
      tdcTimestampS: this.lastTdc.timestampS,
      bdcTimestampS: bdc.timestampS,
    })
  }

  private onTdc(tdc: Extremum) {
    this.lastTdc = tdc
  }
}
