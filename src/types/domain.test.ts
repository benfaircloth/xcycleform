import { describe, expect, it } from 'vitest'
import type { Landmark, Measurement, PoseFrame } from './domain'

describe('domain types', () => {
  it('constructs a valid Landmark', () => {
    const landmark: Landmark = { x: 0.5, y: 0.3, visibility: 0.95 }
    expect(landmark.x).toBe(0.5)
    expect(landmark.visibility).toBe(0.95)
  })

  it('constructs a valid PoseFrame', () => {
    const frame: PoseFrame = {
      timestampMs: 1000,
      frameIndex: 30,
      landmarks: {
        left_hip: { x: 0.4, y: 0.6 },
        left_knee: { x: 0.35, y: 0.8 },
      },
      modelConfidence: 0.92,
    }
    expect(frame.landmarks['left_hip'].x).toBe(0.4)
    expect(Object.keys(frame.landmarks)).toHaveLength(2)
  })

  it('represents unavailable measurements', () => {
    const measurement: Measurement = {
      metricId: 'knee_angle',
      metricVersion: '0.1.0',
      timestampMs: 1000,
      value: null,
      unit: 'deg',
      status: 'unavailable',
      confidence: null,
      sourceLandmarks: ['left_hip', 'left_knee', 'left_ankle'],
      qualityFlags: ['landmark_occluded'],
    }
    expect(measurement.value).toBeNull()
    expect(measurement.status).toBe('unavailable')
  })
})
