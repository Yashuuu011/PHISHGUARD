import { useState, useRef } from 'react'
import MatrixBackground from './MatrixBackground.jsx'
import ThreatGauge from './ThreatGauge.jsx'
import Navbar from './Navbar.jsx'
import { analyzeURL } from './engine.js'

const SCAN_PHASES = [
  'Parsing URL structure...',
  'Validating SSL certificate...',
  'Checking domain reputation...',
  'Analysing entropy patterns...',
  'Scanning for obfuscation...',
  'Cross-referencing threat DB...',
  'Computing risk vectors...',
  'Generating threat report...',
]

function ScanLine() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 2, overflow: 'hidden', margin: '14px 0' }}>
      <div style={{
        position: 'absolute', height: '100%', width: '45%',
        background: 'linear-gradient(90deg,transparent,#00ff8c,transparent)',
        animation: 'scanH 1.4s linear infinite',
        boxShadow: '0 0 12px #00ff8c',
      }}/>
      <style>{`@keyframes scanH{0%{left:-50%}100%{left:110%}}`}</style>
    </div>
  )
}

function HistoryItem({ item, onReuse }) {
  const lc = { CRITICAL: '#ff2244', HIGH: '#ff8c00', MEDIUM: '#ffd700', SAFE: '#00ff8c', INVALID: '#888' }
  const col = lc[item.level] || '#888'
  return (
    <button onClick={() => onReuse(item.url)} style={{
      all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 6, width: '100%',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      transition: 'background .15s', marginBottom: 5,
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,140,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}`, flexShrink: 0 }}/>
      <span style={{ flex: 1, fontSize: 11, color: '#5a7090', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.url}
      </span>
      <span style={{ fontSize: 10, color: col, fontFamily: 'monospace', flexShrink: 0 }}>{item.level}</span>
    </button>
  )
}

export default function Scanner({ onNavigate }) {
  const [url, setUrl]         = useState('')
  const [scanning, setScanning] = useState(false)
  const [phase, setPhase]     = useState('')
  const [result, setResult]   = useState(null)
  const [history, setHistory] = useState([])
  const inputRef = useRef(null)

  const runScan = async (target) => {
    const t = (target || url).trim()
    if (!t) return
    setScanning(true); setResult(null)
    for (let i = 0; i < SCAN_PHASES.length; i++) {
      setPhase(SCAN_PHASES[i])
      await new Promise(r => setTimeout(r, 270))
    }
    const res = analyzeURL(t)
    setResult(res); setScanning(false); setPhase('')
    setHistory(prev => [{ url: t, level: res.level }, ...prev.filter(h => h.url !== t)].slice(0, 10))
  }

  const rMap = {
    '#00ff8c': { border: '#00ff8c33', bg: '#00ff8c0a', text: '#00ff8c' },
    '#ffd700': { border: '#ffd70033', bg: '#ffd7000a', text: '#ffd700' },
    '#ff8c00': { border: '#ff8c0033', bg: '#ff8c000a', text: '#ff8c00' },
    '#ff2244': { border: '#ff224433', bg: '#ff22440a', text: '#ff2244' },
    '#888888': { border: '#88888833', bg: '#8888880a', text: '#888888' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020b14', color: '#c0d8e8', fontFamily: "'Share Tech Mono', monospace", position: 'relative' }}>
      <MatrixBackground opacity={0.22}/>
      {/* grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(#00ff8c 1px,transparent 1px),linear-gradient(90deg,#00ff8c 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar activePage="scanner" onNavigate={onNavigate}/>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 2, height: 28, background: 'linear-gradient(to bottom,transparent,#00ff8c)', borderRadius: 1 }}/>
              <span style={{ fontSize: 10, letterSpacing: 6, color: '#00ff8c', opacity: .7 }}>URL THREAT ANALYSIS MODULE</span>
              <div style={{ width: 2, height: 28, background: 'linear-gradient(to bottom,#00ff8c,transparent)', borderRadius: 1 }}/>
            </div>
            <h1 style={{
              fontSize: 'clamp(26px,5vw,48px)', fontWeight: 900, margin: 0,
              fontFamily: "'Orbitron', monospace", letterSpacing: 2,
              background: 'linear-gradient(135deg,#ffffff 0%,#00ff8c 50%,#0099ff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>URL SCANNER</h1>
            <p style={{ margin: '10px 0 0', color: '#1a5040', fontSize: 12, letterSpacing: 4 }}>
              ◈ 15-VECTOR PHISHING DETECTION ENGINE ◈
            </p>
          </div>

          {/* Scanner box */}
          <div style={{
            background: 'rgba(4,15,30,0.9)', border: '1px solid #00ff8c25',
            borderRadius: 12, padding: 28, marginBottom: 24,
            boxShadow: '0 0 40px #00ff8c06', backdropFilter: 'blur(16px)',
          }}>
            <div style={{ fontSize: 10, color: '#00ff8c', letterSpacing: 3, marginBottom: 14 }}>◈ TARGET URL INPUT</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: .6, pointerEvents: 'none' }}>🔍</span>
                <input
                  ref={inputRef} value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runScan()}
                  placeholder="https://example.com/login?redirect=..."
                  style={{
                    width: '100%', background: '#00ff8c05', border: '1px solid #00ff8c28',
                    borderRadius: 8, padding: '13px 14px 13px 42px', color: '#a0f0c0',
                    fontSize: 14, fontFamily: 'monospace', outline: 'none', caretColor: '#00ff8c',
                    transition: 'all .2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#00ff8c66'; e.target.style.boxShadow = '0 0 20px #00ff8c0d' }}
                  onBlur={e  => { e.target.style.borderColor = '#00ff8c28'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <button onClick={() => runScan()} disabled={scanning || !url.trim()} style={{
                padding: '13px 26px', borderRadius: 8,
                background: scanning ? 'transparent' : 'linear-gradient(135deg,#00ff8c20,#0099ff15)',
                border: '1px solid #00ff8c45', color: scanning ? '#1a5030' : '#00ff8c',
                fontSize: 12, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 2,
                cursor: scanning || !url.trim() ? 'not-allowed' : 'pointer',
                transition: 'all .2s', whiteSpace: 'nowrap', fontWeight: 700,
              }}
                onMouseEnter={e => { if (!scanning && url.trim()) { e.currentTarget.style.background = '#00ff8c18'; e.currentTarget.style.boxShadow = '0 0 18px #00ff8c18' }}}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#00ff8c20,#0099ff15)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {scanning ? '◌ SCANNING...' : '▶ ANALYZE'}
              </button>
            </div>

            {scanning && (
              <div style={{ marginTop: 18 }}>
                <ScanLine/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff8c', boxShadow: '0 0 6px #00ff8c', animation: 'pulse 1s infinite' }}/>
                  <span style={{ fontSize: 11, color: '#00aa60', letterSpacing: 2 }}>{phase}</span>
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          {result && !scanning && (() => {
            const rc = rMap[result.color] || rMap['#888888']
            const verdicts = {
              SAFE:     '✓  URL APPEARS SAFE',
              MEDIUM:   '⚠  EXERCISE CAUTION',
              HIGH:     '⛔  HIGH RISK — AVOID',
              CRITICAL: '☠  CRITICAL THREAT — DO NOT VISIT',
              INVALID:  '✗  INVALID URL FORMAT',
            }
            return (
              <div style={{
                background: 'rgba(4,15,30,0.92)', border: `1px solid ${rc.border}`,
                borderRadius: 12, padding: 28, marginBottom: 24,
                boxShadow: `0 0 50px ${rc.bg}`, animation: 'fadeIn .4s ease',
                backdropFilter: 'blur(16px)',
              }}>
                <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <span style={{ color: result.color, fontSize: 10, letterSpacing: 3 }}>◈ ANALYSIS REPORT</span>
                  <div style={{ flex: 1, height: 1, background: rc.border }}/>
                  <span style={{ fontSize: 10, color: '#1a3040', letterSpacing: 2 }}>{new Date().toLocaleTimeString()}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'start' }}>
                  <ThreatGauge score={result.score} level={result.level} color={result.color}/>

                  <div>
                    {/* Domain info */}
                    <div style={{ padding: '12px 16px', background: '#ffffff05', borderRadius: 8, border: '1px solid #0a2030', marginBottom: 16 }}>
                      <div style={{ fontSize: 9, color: '#1a4050', letterSpacing: 3, marginBottom: 6 }}>DOMAIN IDENTIFIED</div>
                      <div style={{ fontSize: 15, color: '#a0c0e0', fontWeight: 700, wordBreak: 'break-all' }}>{result.domain || '—'}</div>
                      <div style={{ fontSize: 10, color: '#1a4050', marginTop: 4 }}>
                        Protocol: <span style={{ color: result.protocol === 'https:' ? '#00ff8c' : '#ff2244' }}>{result.protocol || '—'}</span>
                      </div>
                    </div>

                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 9, color: '#1a4050', letterSpacing: 3, marginBottom: 8 }}>⚠ THREAT INDICATORS ({result.warnings.length})</div>
                        {result.warnings.map((w, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', marginBottom: 5, background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 6, fontSize: 12, color: '#c0a090', lineHeight: 1.5 }}>
                            <span style={{ color: result.color, flexShrink: 0 }}>▸</span>{w}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Safe indicators */}
                    {result.indicators.length > 0 && (
                      <div>
                        <div style={{ fontSize: 9, color: '#1a4050', letterSpacing: 3, marginBottom: 8 }}>✓ SAFE SIGNALS</div>
                        {result.indicators.map((ind, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', marginBottom: 5, background: '#00ff8c06', border: '1px solid #00ff8c18', borderRadius: 6, fontSize: 12, color: '#3a8060' }}>
                            <span style={{ color: '#00ff8c', flexShrink: 0 }}>✓</span>{ind}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Verdict */}
                <div style={{ marginTop: 24, padding: '14px 20px', borderRadius: 8, background: rc.bg, border: `1px solid ${rc.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#1a4050', letterSpacing: 3, marginBottom: 4 }}>FINAL VERDICT</div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: result.color, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>
                      {verdicts[result.level]}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: '#1a4050' }}>
                    <div>{result.warnings.length} indicator{result.warnings.length !== 1 ? 's' : ''} found</div>
                    <div>Score: {result.score} / 100</div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Bottom grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* History */}
            <div style={{ background: 'rgba(4,15,30,0.85)', border: '1px solid #0a2030', borderRadius: 10, padding: 20, backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 3, height: 14, background: '#00ff8c', borderRadius: 2 }}/>
                <span style={{ fontSize: 10, letterSpacing: 3, color: '#00ff8c' }}>◈ SCAN HISTORY</span>
              </div>
              {history.length === 0
                ? <div style={{ color: '#0a2030', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No scans yet</div>
                : history.map((h, i) => <HistoryItem key={i} item={h} onReuse={u => { setUrl(u); runScan(u) }}/>)
              }
            </div>

            {/* Legend */}
            <div style={{ background: 'rgba(4,15,30,0.85)', border: '1px solid #0a2030', borderRadius: 10, padding: 20, backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 3, height: 14, background: '#00ff8c', borderRadius: 2 }}/>
                <span style={{ fontSize: 10, letterSpacing: 3, color: '#00ff8c' }}>◈ THREAT LEVELS</span>
              </div>
              {[
                { color: '#00ff8c', level: 'SAFE',     desc: 'No indicators — URL appears legitimate' },
                { color: '#ffd700', level: 'MEDIUM',   desc: 'Suspicious patterns — verify the source' },
                { color: '#ff8c00', level: 'HIGH',     desc: 'Multiple threat vectors detected' },
                { color: '#ff2244', level: 'CRITICAL', desc: 'Confirmed attack — do not visit' },
              ].map(({ color, level, desc }) => (
                <div key={level} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 4, background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color, letterSpacing: 2, fontWeight: 700 }}>{level}</div>
                    <div style={{ fontSize: 11, color: '#1a4050', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: '10px 12px', background: '#00ff8c05', border: '1px solid #00ff8c12', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: '#1a4050', letterSpacing: 2, marginBottom: 6 }}>DETECTION VECTORS ACTIVE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {['SSL Check','IP Detect','Homograph','TLD Risk','Subdomain','Keyword','Encoding','Redirect','IDN/Punycode','@ Inject','JS URI','Data URI','Length','Params','Protocol'].map(v => (
                    <span key={v} style={{ fontSize: 9, color: '#0a3020', padding: '2px 7px', background: '#00ff8c08', borderRadius: 3, border: '1px solid #00ff8c15' }}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
