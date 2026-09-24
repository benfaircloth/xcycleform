import type { KneeAngleResult } from '../lib/geometry'
import type { PoseLandmark } from '../lib/pose-adapter'
import { CYCLING_LANDMARKS } from '../lib/landmarks'

interface DebugPanelProps {
  videoTimestamp: number
  renderFps: number
  inferenceFps: number
  inferenceLatency: number
  landmarks: PoseLandmark[] | null
  kneeAngle: KneeAngleResult | null
  side: 'left' | 'right'
}

function fmt(v: number, decimals = 2): string {
  return v.toFixed(decimals)
}

export function DebugPanel({
  videoTimestamp,
  renderFps,
  inferenceFps,
  inferenceLatency,
  landmarks,
  kneeAngle,
  side,
}: DebugPanelProps) {
  const hipIdx = side === 'left' ? CYCLING_LANDMARKS.LEFT_HIP : CYCLING_LANDMARKS.RIGHT_HIP
  const kneeIdx = side === 'left' ? CYCLING_LANDMARKS.LEFT_KNEE : CYCLING_LANDMARKS.RIGHT_KNEE
  const ankleIdx = side === 'left' ? CYCLING_LANDMARKS.LEFT_ANKLE : CYCLING_LANDMARKS.RIGHT_ANKLE

  const hip = landmarks?.[hipIdx]
  const knee = landmarks?.[kneeIdx]
  const ankle = landmarks?.[ankleIdx]

  return (
    <div className="panel debug-panel">
      <h3>Debug</h3>
      <div className="debug-section">
        <div className="debug-row">
          <span>Video time</span>
          <span>{fmt(videoTimestamp, 3)}s</span>
        </div>
        <div className="debug-row">
          <span>Render FPS</span>
          <span>{fmt(renderFps, 0)}</span>
        </div>
        <div className="debug-row">
          <span>Inference FPS</span>
          <span>{fmt(inferenceFps, 0)}</span>
        </div>
        <div className="debug-row">
          <span>Inference latency</span>
          <span>{fmt(inferenceLatency, 1)}ms</span>
        </div>
      </div>

      {hip && (
        <div className="debug-section">
          <h4>Hip ({side})</h4>
          <div className="debug-row"><span>x</span><span>{fmt(hip.x, 4)}</span></div>
          <div className="debug-row"><span>y</span><span>{fmt(hip.y, 4)}</span></div>
          <div className="debug-row"><span>conf</span><span>{fmt(hip.visibility)}</span></div>
        </div>
      )}

      {knee && (
        <div className="debug-section">
          <h4>Knee ({side})</h4>
          <div className="debug-row"><span>x</span><span>{fmt(knee.x, 4)}</span></div>
          <div className="debug-row"><span>y</span><span>{fmt(knee.y, 4)}</span></div>
          <div className="debug-row"><span>conf</span><span>{fmt(knee.visibility)}</span></div>
        </div>
      )}

      {ankle && (
        <div className="debug-section">
          <h4>Ankle ({side})</h4>
          <div className="debug-row"><span>x</span><span>{fmt(ankle.x, 4)}</span></div>
          <div className="debug-row"><span>y</span><span>{fmt(ankle.y, 4)}</span></div>
          <div className="debug-row"><span>conf</span><span>{fmt(ankle.visibility)}</span></div>
        </div>
      )}

      {kneeAngle && (
        <div className="debug-section">
          <h4>Knee Angle</h4>
          <div className="debug-row">
            <span>value</span>
            <span>{kneeAngle.angle !== null ? `${fmt(kneeAngle.angle, 1)}°` : '--'}</span>
          </div>
          <div className="debug-row"><span>status</span><span>{kneeAngle.status}</span></div>
        </div>
      )}
    </div>
  )
}
