# 🛡 PhishGuard — Advanced Phishing Detection & Threat Intelligence Platform

A professional, SOC-style phishing detection system built with React + Recharts.  
**100% client-side — no data is ever transmitted.**

---

## 📁 Project Structure

```
phishguard/
├── index.html                        ← Vite HTML entry point
├── package.json                      ← Dependencies
├── vite.config.js                    ← Vite config
└── src/
    ├── main.jsx                      ← React root mount
    ├── App.jsx                       ← Page router (dashboard ↔ scanner)
    ├── engine.js                     ← 🔬 Core threat detection engine
    └── components/
        ├── Navbar.jsx                ← Sticky top navigation bar
        ├── MatrixBackground.jsx      ← Animated matrix rain canvas
        ├── ThreatGauge.jsx           ← Animated SVG risk gauge
        ├── Dashboard.jsx             ← Full SOC dashboard page
        └── Scanner.jsx               ← URL scanner page
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

---

## 🔬 Detection Engine — 15 Threat Vectors

| Vector | Description |
|--------|-------------|
| **Protocol Check** | Flags plain HTTP (no SSL/TLS) |
| **Trusted Domain** | Verifies against 20 known-good domains |
| **Raw IP Address** | Detects IP-as-hostname attacks |
| **Suspicious TLD** | Flags .tk .ml .xyz .click .pw etc. |
| **Subdomain Depth** | Detects excessive subdomain nesting |
| **Homograph Attack** | Catches character substitution (paypa1, g00gle…) |
| **Domain Keywords** | Scans for phishing keywords in hostname |
| **Path Keywords** | Scans URL path/query string |
| **Hyphen Abuse** | High hyphen count in domain |
| **URL Length** | Abnormally long URLs |
| **Encoding Abuse** | Excessive %xx encoding (obfuscation) |
| **Double-Slash** | Open redirect via `//` in path |
| **@ Injection** | Credential injection via `@` symbol |
| **IDN / Punycode** | Internationalised domain name attacks |
| **Param Count** | Excessive query parameters |

---

## 🎨 Tech Stack

- **React 18** — UI framework
- **Recharts** — Area, Bar charts
- **Vite** — Dev server + bundler
- **Google Fonts** — Orbitron + Share Tech Mono
- **Canvas API** — Matrix rain background
- **Pure CSS animations** — No animation libraries needed

---

## 📄 Files You Get

| File | Lines | Purpose |
|------|-------|---------|
| `engine.js` | ~140 | Detection logic, exportable |
| `Dashboard.jsx` | ~240 | SOC-style live dashboard |
| `Scanner.jsx` | ~210 | Full URL scanner page |
| `ThreatGauge.jsx` | ~65 | SVG animated gauge widget |
| `MatrixBackground.jsx` | ~50 | Canvas matrix animation |
| `Navbar.jsx` | ~75 | Shared sticky navbar |
| `App.jsx` | ~12 | Simple page router |

---

*PhishGuard — Built for security professionals. Zero telemetry.*
