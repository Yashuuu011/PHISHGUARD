import { useState, useEffect } from 'react'

const PALETTE = {
  '#00ff8c': { stroke: '#00ff8c', glow: '#00ff8c', bg: '#00ff8c18', text: '#00ff8c' },
  '#ffd700': { stroke: '#ffd700', glow: '#ffd700', bg: '#ffd70018', text: '#ffd700' },
  '#ff8c00': { stroke: '#ff8c00', glow: '#ff8c00', bg: '#ff8c0018', text: '#ff8c00' },
  '#ff2244': { stroke: '#ff2244', glow: '#ff2244', bg: '#ff224418', text: '#ff2244' },
  '#888888': { stroke: '#888888', glow: '#888888', bg: '#88888818', text: '#888888' },
}

export default function ThreatGauge({ score, level, color, size = 180 }) {
  const [displayed, setDisplayed] = useState(0)
  const c = PALETTE[color] || PALETTE['#888888']

  useEffect(() => {
    let cur = 0, frame
    const step = () => {
      cur = Math.min(cur + Math.ceil(score / 45), score)
      setDisplayed(cur)
      if (cur < score) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const r            = size * 0.39
  const cx           = size / 2
  const cy           = size / 2
  const circumference = 2 * Math.PI * r
  const offset       = circumference - (displayed / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0a2030" strokeWidth={size * 0.056} />
          {/* Progress */}
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={c.stroke}
            strokeWidth={size * 0.056}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${c.glow})`, transition: 'stroke-dashoffset 0.04s' }}
          />
        </svg>
        {/* Centre label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: size * 0.2, fontWeight: 900, color: c.text,
            fontFamily: "'Orbitron', monospace", lineHeight: 1, letterSpacing: -2,
          }}>
            {displayed}
          </span>
          <span style={{ fontSize: size * 0.065, color: '#2a5060', letterSpacing: 3, fontFamily: 'monospace' }}>
            RISK
          </span>
        </div>
      </div>

      {/* Badge */}
      <div style={{
        padding: '6px 22px', borderRadius: 4,
        border: `1px solid ${c.stroke}`, background: c.bg,
        color: c.text, fontFamily: "'Share Tech Mono', monospace",
        fontSize: 12, letterSpacing: 4, fontWeight: 700,
      }}>
        ▲ {level} THREAT
      </div>
    </div>
  )
}
