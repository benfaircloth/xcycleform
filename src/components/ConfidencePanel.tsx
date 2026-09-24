import type { PoseLandmark } from '../lib/pose-adapter'
import { CYCLING_LANDMARKS, LANDMARK_NAMES } from '../lib/landmarks'

interface ConfidencePanelProps {
  landmarks: PoseLandmark[] | null
  confidenceThreshold: number
}

const KEY_LANDMARKS = [
  CYCLING_LANDMARKS.LEFT_HIP,
  CYCLING_LANDMARKS.LEFT_KNEE,
  CYCLING_LANDMARKS.LEFT_ANKLE,
  CYCLING_LANDMARKS.LEFT_SHOULDER,
  CYCLING_LANDMARKS.LEFT_ELBOW,
  CYCLING_LANDMARKS.LEFT_WRIST,
  CYCLING_LANDMARKS.RIGHT_HIP,
  CYCLING_LANDMARKS.RIGHT_KNEE,
  CYCLING_LANDMARKS.RIGHT_ANKLE,
]

function confColor(value: number, threshold: number): string {
  if (value >= threshold) return '#4ade80'
  if (value >= 0.3) return '#fbbf24'
  return '#f87171'
}

export function ConfidencePanel({ landmarks, confidenceThreshold }: ConfidencePanelProps) {
  if (!landmarks) {
    return (
      <div className="panel confidence-panel">
        <h3>Landmark Confidence</h3>
        <p className="no-data">No pose detected</p>
      </div>
    )
  }

  return (
    <div className="panel confidence-panel">
      <h3>Landmark Confidence</h3>
      <div className="confidence-grid">
        {KEY_LANDMARKS.map((idx) => {
          const lm = landmarks[idx]
          if (!lm) return null
          const conf = lm.visibility
          return (
            <div key={idx} className="confidence-row">
              <span className="landmark-name">{LANDMARK_NAMES[idx]}</span>
              <span
                className="confidence-value"
                style={{ color: confColor(conf, confidenceThreshold) }}
              >
                {conf.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
