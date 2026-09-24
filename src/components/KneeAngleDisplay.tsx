import type { KneeAngleResult } from '../lib/geometry'

interface KneeAngleDisplayProps {
  result: KneeAngleResult | null
  side: 'left' | 'right'
  referenceMin: number
  referenceMax: number
}

export function KneeAngleDisplay({
  result,
  side,
  referenceMin,
  referenceMax,
}: KneeAngleDisplayProps) {
  const label = side === 'left' ? 'L Knee Angle' : 'R Knee Angle'

  if (!result) {
    return (
      <div className="panel knee-angle-panel">
        <h3>{label}</h3>
        <p className="no-data">No pose detected</p>
      </div>
    )
  }

  const { angle, status, reason } = result

  let statusColor = '#4ade80'
  let statusText = ''

  if (status === 'unavailable') {
    statusColor = '#f87171'
    statusText = 'Unavailable'
  } else if (status === 'low_confidence') {
    statusColor = '#fbbf24'
    statusText = 'Low confidence'
  } else if (angle !== null) {
    if (angle >= referenceMin && angle <= referenceMax) {
      statusText = 'Within reference range'
    } else {
      statusColor = '#fb923c'
      statusText = 'Outside reference envelope'
    }
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
      <div className="reference-info">
        Reference: {referenceMin}&ndash;{referenceMax}&deg;
      </div>
      <div className="angle-status" style={{ color: statusColor }}>
        {statusText}
      </div>
      {reason && <div className="angle-reason">{reason}</div>}
    </div>
  )
}
