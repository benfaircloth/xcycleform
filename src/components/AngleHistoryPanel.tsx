export function AngleHistoryPanel() {
  const W = 200
  const H = 80
  const points: string[] = []

  for (let i = 0; i <= W; i++) {
    const t = (i / W) * 47
    const phase = (t / (47 / 9)) % 1
    const angle = 102.5 + 28 * Math.sin(phase * 2 * Math.PI - Math.PI / 2)
    const noise = 1.5 * Math.sin(i * 0.5) + Math.cos(i * 1.1)
    const y = H - ((angle + noise - 65) / (150 - 65)) * H
    points.push(`${i},${y.toFixed(1)}`)
  }

  const gridYs = [140, 110, 80].map((a) => H - ((a - 65) / (150 - 65)) * H)
  const markerX = (15 / 47) * W
  const bdcY = H - ((130.4 - 65) / (150 - 65)) * H

  return (
    <div className="panel">
      <h3>Angle History</h3>
      <h4>R Knee · 47s session</h4>
      <svg viewBox={`-24 -4 ${W + 28} ${H + 20}`} className="chart-svg">
        {gridYs.map((y, i) => (
          <g key={i}>
            <line x1="0" y1={y} x2={W} y2={y} stroke="#2a2a3a" strokeWidth="0.5" />
            <text x="-4" y={y + 2} fill="#555" fontSize="5.5" textAnchor="end">
              {[140, 110, 80][i]}°
            </text>
          </g>
        ))}
        <polyline points={points.join(' ')} fill="none" stroke="#4ac870" strokeWidth="1.2" />
        <line
          x1={markerX} y1="0" x2={markerX} y2={H}
          stroke="#f0b432" strokeWidth="0.5" strokeDasharray="3 3"
        />
        <line
          x1="0" y1={bdcY} x2={W} y2={bdcY}
          stroke="#f0b432" strokeWidth="0.3" strokeDasharray="4 4"
        />
        <text x={W - 2} y={bdcY - 3} fill="#f0b432" fontSize="5" textAnchor="end">
          BDC 130.4°
        </text>
        {[0, 10, 20, 30, 40, 47].map((t) => (
          <text
            key={t}
            x={(t / 47) * W}
            y={H + 10}
            fill="#555"
            fontSize="5"
            textAnchor="middle"
          >
            {t === 47 ? '47s' : String(t)}
          </text>
        ))}
      </svg>
    </div>
  )
}
