import { describe, expect, it } from 'vitest'
import { angleDeg, computeKneeAngle } from './geometry'

describe('angleDeg', () => {
  it('returns 90 for a right angle', () => {
    const a = { x: 0, y: 1 }
    const b = { x: 0, y: 0 }
    const c = { x: 1, y: 0 }
    expect(angleDeg(a, b, c)).toBeCloseTo(90, 1)
  })

  it('returns 180 for a straight line', () => {
    const a = { x: -1, y: 0 }
    const b = { x: 0, y: 0 }
    const c = { x: 1, y: 0 }
    expect(angleDeg(a, b, c)).toBeCloseTo(180, 1)
  })

  it('returns 0 for coincident rays', () => {
    const a = { x: 1, y: 0 }
    const b = { x: 0, y: 0 }
    const c = { x: 1, y: 0 }
    expect(angleDeg(a, b, c)).toBeCloseTo(0, 1)
  })

  it('returns 60 for an equilateral triangle vertex', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 1, y: 0 }
    const c = { x: 0.5, y: Math.sqrt(3) / 2 }
    expect(angleDeg(a, b, c)).toBeCloseTo(60, 1)
  })

  it('returns 45 degrees', () => {
    const a = { x: 1, y: 0 }
    const b = { x: 0, y: 0 }
    const c = { x: 1, y: 1 }
    expect(angleDeg(a, b, c)).toBeCloseTo(45, 1)
  })

  it('returns 0 when a point is coincident with vertex', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 0, y: 0 }
    const c = { x: 1, y: 0 }
    expect(angleDeg(a, b, c)).toBe(0)
  })
})

describe('computeKneeAngle', () => {
  const highConf = (x: number, y: number) => ({ x, y, visibility: 0.95 })
  const lowConf = (x: number, y: number) => ({ x, y, visibility: 0.4 })
  const veryLowConf = (x: number, y: number) => ({ x, y, visibility: 0.2 })

  it('returns a valid angle when all landmarks are high confidence', () => {
    const hip = highConf(0, 0)
    const knee = highConf(0, 1)
    const ankle = highConf(1, 1)

    const result = computeKneeAngle(hip, knee, ankle, 0.65)
    expect(result.status).toBe('valid')
    expect(result.angle).toBeCloseTo(90, 1)
  })

  it('returns low_confidence when a landmark is below threshold but above 0.3', () => {
    const hip = highConf(0, 0)
    const knee = highConf(0, 1)
    const ankle = lowConf(1, 1)

    const result = computeKneeAngle(hip, knee, ankle, 0.65)
    expect(result.status).toBe('low_confidence')
    expect(result.angle).toBeCloseTo(90, 1)
    expect(result.reason).toContain('ankle')
  })

  it('returns unavailable when a landmark is very low confidence', () => {
    const hip = highConf(0, 0)
    const knee = highConf(0, 1)
    const ankle = veryLowConf(1, 1)

    const result = computeKneeAngle(hip, knee, ankle, 0.65)
    expect(result.status).toBe('unavailable')
    expect(result.angle).toBeNull()
    expect(result.reason).toContain('ankle')
  })

  it('reports confidence values for all landmarks', () => {
    const hip = highConf(0, 0)
    const knee = highConf(0, 1)
    const ankle = highConf(1, 1)

    const result = computeKneeAngle(hip, knee, ankle, 0.65)
    expect(result.hipConfidence).toBe(0.95)
    expect(result.kneeConfidence).toBe(0.95)
    expect(result.ankleConfidence).toBe(0.95)
  })

  it('computes a realistic cycling knee extension angle', () => {
    // Near bottom dead center: leg mostly extended
    const hip = highConf(0.4, 0.4)
    const knee = highConf(0.42, 0.65)
    const ankle = highConf(0.44, 0.88)

    const result = computeKneeAngle(hip, knee, ankle, 0.65)
    expect(result.status).toBe('valid')
    expect(result.angle).toBeGreaterThan(140)
    expect(result.angle).toBeLessThan(180)
  })

  it('computes a realistic cycling knee flexion angle', () => {
    // Near top dead center: leg bent
    const hip = highConf(0.4, 0.4)
    const knee = highConf(0.5, 0.55)
    const ankle = highConf(0.38, 0.62)

    const result = computeKneeAngle(hip, knee, ankle, 0.65)
    expect(result.status).toBe('valid')
    expect(result.angle).toBeGreaterThan(50)
    expect(result.angle).toBeLessThan(110)
  })
})
