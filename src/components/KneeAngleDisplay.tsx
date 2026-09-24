import type { KneeAngleResult } from '../lib/geometry'

interface KneeAngleDisplayProps {
  result: KneeAngleResult | null
  side: 'left' | 'right'
}

export function KneeAngleDisplay({ result, side }: KneeAngleDisplayProps) {
  const label = side === 'left' ? 'L Knee Angle' : 'R Knee Angle'

  if (!result) {
    return (
      <div className="panel knee-angle-panel">
        <h3>{label}</h3>
        <p className="no-data">Pose unavailable</p>
      </div>
    )
  }

  const { angle, status, reason } = result

  let statusColor: string
  let statusText: string

  if (status === 'unavailable') {
    statusColor = '#f87171'
    statusText = 'Unavailable'
  } else if (status === 'low_confidence') {
    statusColor = '#fbbf24'
    statusText = 'Low confidence'
  } else {
    statusColor = '#4ade80'
    statusText = 'Valid'
  }

  return (
    <div className="panel knee-angle-panel">
      <h3>{label}</h3>
      {angle !== null ? (
        <div className="angle-value" style={{ color: statusColor }}>
          {angle.toFixed(1)}&deg;
        </div>
      ) : (
        <div className="angle-value" style={{ color: statusColor }}>
          --
        </div>
      )}
      <div className="angle-status">
        Measurement: <span style={{ color: statusColor }}>{statusText}</span>
      </div>
      {reason && <div className="angle-reason">{reason}</div>}
    </div>
  )
}
