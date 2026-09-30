import { describe, expect, it } from 'vitest'
import { PedalStrokeDetector } from './pedal-stroke-detector'

function generateSinusoidalAngles(
  cycles: number,
  fps: number,
  cadenceRpm: number,
  tdcAngle: number,
  bdcAngle: number,
): { angle: number; timestampS: number }[] {
  const periodS = 60 / cadenceRpm
  const totalS = cycles * periodS
  const amplitude = (bdcAngle - tdcAngle) / 2
  const center = (bdcAngle + tdcAngle) / 2
  const samples: { angle: number; timestampS: number }[] = []

  for (let t = 0; t <= totalS; t += 1 / fps) {
    const angle = center - amplitude * Math.cos((2 * Math.PI * t) / periodS)
    samples.push({ angle, timestampS: t })
  }
  return samples
}

describe('PedalStrokeDetector', () => {
  it('detects cycles from sinusoidal knee angle signal', () => {
    const detector = new PedalStrokeDetector()
    const samples = generateSinusoidalAngles(5, 30, 80, 70, 145)

    for (const s of samples) {
      detector.push(s.angle, s.timestampS)
    }

    expect(detector.cycleCount).toBeGreaterThanOrEqual(3)
    expect(detector.cycleCount).toBeLessThanOrEqual(5)

    for (const cycle of detector.cycles) {
      expect(cycle.bdcAngle).toBeGreaterThan(130)
      expect(cycle.bdcAngle).toBeLessThan(150)
      expect(cycle.tdcAngle).toBeGreaterThan(65)
      expect(cycle.tdcAngle).toBeLessThan(80)
      expect(cycle.rom).toBeGreaterThan(55)
      expect(cycle.rom).toBeLessThan(85)
      expect(cycle.cadenceRpm).toBeGreaterThan(60)
      expect(cycle.cadenceRpm).toBeLessThan(100)
    }
  })

  it('returns no cycles for constant angle', () => {
    const detector = new PedalStrokeDetector()
    for (let i = 0; i < 100; i++) {
      detector.push(120, i * 0.033)
    }
    expect(detector.cycleCount).toBe(0)
  })

  it('returns no cycles for small oscillations below hysteresis', () => {
    const detector = new PedalStrokeDetector()
    for (let i = 0; i < 100; i++) {
      const angle = 120 + 5 * Math.sin(i * 0.5)
      detector.push(angle, i * 0.033)
    }
    expect(detector.cycleCount).toBe(0)
  })

  it('reports current cadence from recent cycles', () => {
    const detector = new PedalStrokeDetector()
    const samples = generateSinusoidalAngles(6, 30, 90, 72, 148)

    for (const s of samples) {
      detector.push(s.angle, s.timestampS)
    }

    const cadence = detector.currentCadence
    expect(cadence).not.toBeNull()
    expect(cadence!).toBeGreaterThan(70)
    expect(cadence!).toBeLessThan(110)
  })

  it('clears state', () => {
    const detector = new PedalStrokeDetector()
    const samples = generateSinusoidalAngles(4, 30, 80, 70, 145)

    for (const s of samples) {
      detector.push(s.angle, s.timestampS)
    }

    expect(detector.cycleCount).toBeGreaterThan(0)
    detector.clear()
    expect(detector.cycleCount).toBe(0)
    expect(detector.currentCadence).toBeNull()
  })
})
