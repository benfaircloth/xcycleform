export function CadencePanel() {
  const W = 200
  const H = 50
  const points: string[] = []
  const areaPoints: string[] = [`0,${H}`]

  for (let i = 0; i <= W; i++) {
    const t = (i / W) * 47
    const rpm =
      93 +
      5 * Math.min(1, t / 8) +
      1.8 * Math.sin(t * 0.4) +
      Math.cos(t * 1.1) +
      0.6 * Math.sin(t * 2.3)
    const y = H - ((rpm - 88) / (108 - 88)) * H
    points.push(`${i},${y.toFixed(1)}`)
    areaPoints.push(`${i},${y.toFixed(1)}`)
  }
  areaPoints.push(`${W},${H}`)

  const refY = H - ((98 - 88) / (108 - 88)) * H

  return (
    <div className="panel">
      <h3>Cadence</h3>
      <div className="cadence-value">
        <span className="cadence-number">98</span>
        <span className="cadence-unit">rpm</span>
      </div>
      <div className="cadence-stats">
        <span>Avg <strong>97</strong></span>
        <span>Min <strong>93</strong></span>
        <span>Max <strong>102</strong></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="chart-svg chart-wide">
        <path d={`M${areaPoints.join(' L')}`} fill="rgba(74, 200, 110, 0.08)" />
        <line
          x1="0" y1={refY} x2={W} y2={refY}
          stroke="#2a2a3a" strokeWidth="0.5" strokeDasharray="3 3"
        />
        <polyline points={points.join(' ')} fill="none" stroke="#4ac870" strokeWidth="1" />
      </svg>
    </div>
  )
}
