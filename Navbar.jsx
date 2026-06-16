import { useState, useEffect } from 'react'

export default function Navbar({ activePage, onNavigate }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'scanner',   label: 'SCANNER'   },
  ]

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 28px',
      background: 'rgba(4,15,30,0.97)',
      borderBottom: '1px solid #0a2030',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8,
          background: 'linear-gradient(135deg,#00ff8c18,#0099ff18)',
          border: '1px solid #00ff8c33',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>🛡</div>
        <div>
          <div style={{
            fontSize: 17, fontWeight: 900,
            fontFamily: "'Orbitron', monospace",
            background: 'linear-gradient(90deg,#ffffff,#00ff8c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: 3,
          }}>PHISHGUARD</div>
          <div style={{ fontSize: 9, color: '#1a4030', letterSpacing: 4, fontFamily: "'Share Tech Mono', monospace" }}>
            THREAT INTELLIGENCE PLATFORM
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 4 }}>
        {navItems.map(({ id, label }) => (
          <button key={id} onClick={() => onNavigate(id)} style={{
            all: 'unset', cursor: 'pointer',
            padding: '8px 18px', borderRadius: 6,
            fontSize: 11, letterSpacing: 2,
            fontFamily: "'Share Tech Mono', monospace",
            transition: 'all .2s',
            background: activePage === id ? '#00ff8c18' : 'transparent',
            color: activePage === id ? '#00ff8c' : '#1a4050',
            border: `1px solid ${activePage === id ? '#00ff8c40' : 'transparent'}`,
          }}>
            {label}
          </button>
        ))}
      </nav>

      {/* Clock + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontFamily: "'Share Tech Mono', monospace", color: '#00ff8c', letterSpacing: 2 }}>
            {time.toLocaleTimeString()}
          </div>
          <div style={{ fontSize: 10, color: '#1a4030', letterSpacing: 2, fontFamily: 'monospace' }}>
            {time.toLocaleDateString()}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 6,
          background: '#00ff8c08', border: '1px solid #00ff8c20',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#00ff8c', boxShadow: '0 0 8px #00ff8c',
            animation: 'pulse 2s infinite',
          }}/>
          <span style={{ fontSize: 10, color: '#00ff8c', letterSpacing: 2, fontFamily: "'Share Tech Mono', monospace" }}>
            LIVE
          </span>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.9)}}`}</style>
    </header>
  )
}
