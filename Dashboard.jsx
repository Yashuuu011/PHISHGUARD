import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import MatrixBackground from './MatrixBackground.jsx'
import Navbar from './Navbar.jsx'

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#020b14', panel: '#040f1e', panelB: '#061522',
  green: '#00ff8c', greenD: '#00cc6a',
  red: '#ff2244', orange: '#ff8c00', yellow: '#ffd700', blue: '#0099ff',
  text: '#8aaabb', textB: '#c0d8e8', muted: '#1a3040', border: '#0a2030',
}

// ── Fake data helpers ─────────────────────────────────────────────────────────
const THREAT_POOL = [
  { url: 'http://paypa1-secure.tk/verify',            level: 'CRITICAL', country: 'RU', type: 'Credential Harvest' },
  { url: 'https://g00gle-login.cf/account',           level: 'CRITICAL', country: 'CN', type: 'Homograph Attack'    },
  { url: 'http://192.168.14.202/login.php',           level: 'HIGH',     country: 'BR', type: 'IP Phishing'         },
  { url: 'https://amazon-security-update.xyz/',       level: 'HIGH',     country: 'NG', type: 'Brand Impersonation' },
  { url: 'https://secure-banking-verify.ml/',         level: 'CRITICAL', country: 'IN', type: 'Banking Fraud'       },
  { url: 'https://github.com/openai/openai-python',   level: 'SAFE',     country: 'US', type: 'Legitimate'          },
  { url: 'https://netflix-account-suspended.top/',    level: 'HIGH',     country: 'PH', type: 'Account Takeover'    },
  { url: 'https://microsoft-office365.link/signin',   level: 'HIGH',     country: 'RO', type: 'Spear Phishing'      },
  { url: 'https://cloudflare.com/cdn/challenge',      level: 'SAFE',     country: 'US', type: 'Legitimate'          },
  { url: 'https://apple-id-locked.pw/verify',         level: 'CRITICAL', country: 'TR', type: 'ID Theft'            },
  { url: 'https://stackoverflow.com/q/72940891',      level: 'SAFE',     country: 'US', type: 'Legitimate'          },
  { url: 'https://update-wallet-crypto.buzz/claim',   level: 'CRITICAL', country: 'UA', type: 'Crypto Scam'         },
  { url: 'http://free-prize-winner.gq/collect',       level: 'CRITICAL', country: 'NG', type: 'Prize Scam'          },
  { url: 'https://linkedin.com/in/profile',           level: 'SAFE',     country: 'US', type: 'Legitimate'          },
  { url: 'https://secure-paypal-verify.cc/login',     level: 'CRITICAL', country: 'CN', type: 'Credential Harvest'  },
]
const FLAGS = { RU:'🇷🇺',CN:'🇨🇳',BR:'🇧🇷',NG:'🇳🇬',IN:'🇮🇳',US:'🇺🇸',PH:'🇵🇭',RO:'🇷🇴',TR:'🇹🇷',UA:'🇺🇦' }

function make24h() {
  return Array.from({ length: 24 }, (_, i) => ({
    h: `${String(i).padStart(2,'0')}:00`,
    critical: Math.floor(Math.random() * 18 + 2),
    high:     Math.floor(Math.random() * 25 + 5),
    safe:     Math.floor(Math.random() * 45 + 10),
  }))
}
function makeWeek() {
  return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({
    d,
    threats: Math.floor(Math.random() * 90 + 20),
    blocked: Math.floor(Math.random() * 65 + 15),
  }))
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon, delta, delay = 0 }) {
  const [disp, setDisp] = useState(0)
  const num = parseInt(String(value).replace(/,/g,'')) || 0
  useEffect(() => {
    let cur = 0, frame
    const step = () => { cur = Math.min(cur + Math.ceil(num / 50), num); setDisp(cur); if (cur < num) frame = requestAnimationFrame(step) }
    const t = setTimeout(() => { frame = requestAnimationFrame(step) }, delay)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [num])

  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '18px 20px', position: 'relative', overflow: 'hidden',
      animation: `fadeIn .5s ease ${delay}ms both`,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${accent},transparent)` }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 3, marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: accent, fontFamily: "'Orbitron',monospace", lineHeight: 1 }}>
            {disp.toLocaleString()}
          </div>
          {sub && <div style={{ fontSize: 11, color: C.text, marginTop: 5, fontFamily: "'Share Tech Mono',monospace" }}>{sub}</div>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      </div>
      {delta != null && (
        <div style={{ marginTop: 10, fontSize: 11, color: delta >= 0 ? C.green : C.red, fontFamily: "'Share Tech Mono',monospace" }}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% from last hour
        </div>
      )}
    </div>
  )
}

function Panel({ title, badge, children, style = {} }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: `1px solid ${C.border}`, background: C.panelB }}>
        <div style={{ width: 3, height: 15, background: C.green, borderRadius: 2, boxShadow: `0 0 8px ${C.green}` }}/>
        <span style={{ fontSize: 10, letterSpacing: 3, color: C.green, fontFamily: "'Share Tech Mono',monospace" }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: C.border }}/>
        {badge && <span style={{ fontSize: 10, color: C.muted, fontFamily: 'monospace' }}>{badge}</span>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  )
}

function FeedRow({ item, idx }) {
  const lc = { CRITICAL: C.red, HIGH: C.orange, MEDIUM: C.yellow, SAFE: C.green }
  const col = lc[item.level] || C.text
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', borderBottom: `1px solid ${C.border}`,
      animation: `slideIn .3s ease ${idx * 0.04}s both`,
      fontFamily: "'Share Tech Mono',monospace",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}`, flexShrink: 0 }}/>
      <span style={{ fontSize: 11, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</span>
      <span style={{ fontSize: 13 }}>{FLAGS[item.country] || '🌐'}</span>
      <span style={{ fontSize: 9, color: col, minWidth: 58, textAlign: 'right' }}>{item.level}</span>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({ onNavigate }) {
  const [feed, setFeed]       = useState(THREAT_POOL.slice(0, 9))
  const [tick, setTick]       = useState(0)
  const [data24h]             = useState(make24h)
  const [weekData]            = useState(makeWeek)

  useEffect(() => {
    const id = setInterval(() => {
      setFeed(prev => {
        const item = THREAT_POOL[Math.floor(Math.random() * THREAT_POOL.length)]
        return [item, ...prev.slice(0, 10)]
      })
      setTick(t => t + 1)
    }, 2600)
    return () => clearInterval(id)
  }, [])

  const totalScanned  = 48_291 + tick * 3
  const blocked       = 12_847 + tick
  const criticalToday = 234    + Math.floor(tick / 3)

  const distribution = [
    { name: 'SAFE',     value: 62, fill: C.green   },
    { name: 'MEDIUM',   value: 18, fill: C.yellow  },
    { name: 'HIGH',     value: 13, fill: C.orange  },
    { name: 'CRITICAL', value:  7, fill: C.red     },
  ]
  const attackTypes = [
    { type: 'Credential', count: 38 },
    { type: 'Brand',      count: 27 },
    { type: 'Homograph',  count: 19 },
    { type: 'IP Based',   count: 14 },
    { type: 'Redirect',   count: 11 },
    { type: 'Script',     count:  8 },
  ]
  const typeColors = [C.red, C.orange, C.yellow, C.blue, C.green, C.greenD]

  const ttStyle = { background: C.panelB, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'monospace', color: C.textB }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.textB, fontFamily: "'Share Tech Mono',monospace", position: 'relative' }}>
      <MatrixBackground opacity={0.22}/>
      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.03, backgroundImage: `linear-gradient(${C.green} 1px,transparent 1px),linear-gradient(90deg,${C.green} 1px,transparent 1px)`, backgroundSize: '40px 40px', pointerEvents: 'none' }}/>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#020b14}
        ::-webkit-scrollbar-thumb{background:#0f3020;border-radius:2px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.9)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px #00ff8c33}50%{box-shadow:0 0 22px #00ff8c66}}
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar activePage="dashboard" onNavigate={onNavigate}/>

        <main style={{ flex: 1, padding: '20px 24px 40px', overflowY: 'auto' }}>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 18 }}>
            <StatCard label="TOTAL SCANNED"     value={totalScanned}  sub="URLs analysed"            accent={C.blue}   icon="🔍" delta={12} delay={0}  />
            <StatCard label="THREATS BLOCKED"   value={blocked}       sub="Phishing URLs stopped"    accent={C.red}    icon="⛔" delta={8}  delay={80} />
            <StatCard label="CRITICAL TODAY"    value={criticalToday} sub="Immediate action required" accent={C.red}    icon="☠"  delta={23} delay={160}/>
            <StatCard label="PROTECTION RATE"   value={97}            sub="% detection accuracy"     accent={C.green}  icon="✓"  delta={2}  delay={240}/>
          </div>

          {/* Row 1: chart + distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <Panel title="THREAT ACTIVITY — 24H" badge="LIVE FEED">
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={data24h} margin={{ top: 5, right: 5, bottom: 0, left: -22 }}>
                  <defs>
                    <linearGradient id="gCrit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.red}   stopOpacity={0.35}/>
                      <stop offset="95%" stopColor={C.red}   stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gSafe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.green} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="h" tick={{ fill: C.muted, fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval={3}/>
                  <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={ttStyle}/>
                  <Area type="monotone" dataKey="critical" stroke={C.red}    fill="url(#gCrit)" strokeWidth={2}   name="Critical"/>
                  <Area type="monotone" dataKey="high"     stroke={C.orange} fill="none"        strokeWidth={1.5} strokeDasharray="5 3" name="High"/>
                  <Area type="monotone" dataKey="safe"     stroke={C.green}  fill="url(#gSafe)" strokeWidth={1.5} name="Safe"/>
                </AreaChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="THREAT DISTRIBUTION">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
                {distribution.map(({ name, value, fill }) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 9, color: C.muted, letterSpacing: 2 }}>{name}</span>
                      <span style={{ fontSize: 11, color: fill }}>{value}%</span>
                    </div>
                    <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${value}%`, background: `linear-gradient(90deg,${fill},${fill}77)`, borderRadius: 3, boxShadow: `0 0 8px ${fill}44` }}/>
                    </div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={attackTypes} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                  <XAxis dataKey="type" tick={{ fill: C.muted, fontSize: 8, fontFamily: 'monospace' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={ttStyle}/>
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {attackTypes.map((_, i) => <Cell key={i} fill={typeColors[i % typeColors.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 2: live feed + weekly + status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 0.75fr', gap: 16 }}>

            <Panel title="LIVE THREAT FEED" badge={`+${tick} EVENTS`}>
              <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                {feed.map((item, i) => <FeedRow key={`${item.url}-${i}`} item={item} idx={i}/>)}
              </div>
            </Panel>

            <Panel title="WEEKLY THREAT VOLUME">
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={weekData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                  <XAxis dataKey="d" tick={{ fill: C.muted, fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={ttStyle}/>
                  <Bar dataKey="threats" name="Detected" fill={C.red}   opacity={0.75} radius={[3,3,0,0]}/>
                  <Bar dataKey="blocked" name="Blocked"  fill={C.green} opacity={0.75} radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="SYSTEM STATUS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Scan Engine',    ok: true,  status: 'ONLINE'  },
                  { label: 'Threat DB',      ok: true,  status: 'SYNCED'  },
                  { label: 'SSL Validator',  ok: true,  status: 'ACTIVE'  },
                  { label: 'ML Model v4',    ok: true,  status: 'RUNNING' },
                  { label: 'DNS Resolver',   ok: true,  status: 'ACTIVE'  },
                  { label: 'Alert System',   ok: true,  status: 'ARMED'   },
                ].map(({ label, ok, status }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: C.panelB, borderRadius: 6, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 10, color: C.text }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? C.green : C.red, boxShadow: `0 0 6px ${ok ? C.green : C.red}` }}/>
                      <span style={{ fontSize: 9, color: ok ? C.green : C.red }}>{status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 14px', background: `${C.green}08`, border: `1px solid ${C.green}18`, borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 4 }}>ENGINE VERSION</div>
                <div style={{ fontSize: 14, color: C.green, fontFamily: "'Orbitron',monospace", letterSpacing: 1 }}>v4.2.1 STABLE</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>15 detection vectors</div>
              </div>

              <button onClick={() => onNavigate('scanner')} style={{
                width: '100%', marginTop: 12, padding: '11px', borderRadius: 7,
                background: `linear-gradient(135deg,${C.green}18,${C.blue}10)`,
                border: `1px solid ${C.green}40`, color: C.green,
                fontFamily: "'Share Tech Mono',monospace", fontSize: 11, letterSpacing: 2,
                cursor: 'pointer', transition: 'all .2s', animation: 'glow 2.5s infinite',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.green}25`; e.currentTarget.style.boxShadow = `0 0 18px ${C.green}20` }}
                onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg,${C.green}18,${C.blue}10)`; e.currentTarget.style.boxShadow = 'none' }}
              >
                + SCAN NEW URL
              </button>
            </Panel>
          </div>
        </main>

        <footer style={{ padding: '10px 24px', borderTop: `1px solid ${C.border}`, background: 'rgba(4,15,30,0.97)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: C.muted, letterSpacing: 2 }}>PHISHGUARD ◈ CLIENT-SIDE ANALYSIS ◈ ZERO DATA TRANSMITTED</span>
          <span style={{ fontSize: 9, color: C.muted, letterSpacing: 2 }}>THREAT DB: <span style={{ color: C.green }}>CURRENT</span></span>
        </footer>
      </div>
    </div>
  )
}
