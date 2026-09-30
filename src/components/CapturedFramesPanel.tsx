export function CapturedFramesPanel() {
  const W = 200
  const bdcY = 18
  const tdcY = 46
  const left = 28
  const trackW = W - left

  const bdcTimes = [2.6, 24, 44.5]
  const tdcTimes = [5.2, 22, 42]

  return (
    <div className="panel">
      <h3>Captured Frames</h3>
      <h4>6 frames · BDC + TDC events</h4>
      <svg viewBox={`0 0 ${W} 72`} className="chart-svg">
        <text x="0" y={bdcY + 3} fill="#f0b432" fontSize="6.5">BDC</text>
        <line x1={left} y1={bdcY} x2={W} y2={bdcY} stroke="#2a2a3a" strokeWidth="1" />
        {bdcTimes.map((t, i) => (
          <circle
            key={i}
            cx={left + (t / 47) * trackW}
            cy={bdcY}
            r="4"
            fill="#f0b432"
          />
        ))}

        <text x="0" y={tdcY + 3} fill="#64a5f0" fontSize="6.5">TDC</text>
        <line x1={left} y1={tdcY} x2={W} y2={tdcY} stroke="#2a2a3a" strokeWidth="1" />
        {tdcTimes.map((t, i) => (
          <circle
            key={i}
            cx={left + (t / 47) * trackW}
            cy={tdcY}
            r="4"
            fill="#64a5f0"
          />
        ))}

        {[0, 15, 30, 47].map((t) => (
          <text
            key={t}
            x={left + (t / 47) * trackW}
            y={62}
            fill="#555"
            fontSize="5"
            textAnchor="middle"
          >
            {t === 0 ? '0s' : t === 47 ? '47s' : `${t}s`}
          </text>
        ))}
      </svg>
      <div className="frames-legend">
        <span className="legend-dot" style={{ background: '#f0b432' }} />
        {' BDC '}
        <span className="legend-dot" style={{ background: '#64a5f0' }} />
        {' TDC · first / mid / last'}
      </div>
    </div>
  )
}
