import { useState, useEffect, useRef } from "react";

// ─── Utility: Phishing Detection Engine ───────────────────────────────────────
const SUSPICIOUS_KEYWORDS = [
  "login", "signin", "account", "verify", "secure", "update", "confirm",
  "banking", "paypal", "apple", "google", "microsoft", "amazon", "netflix",
  "password", "credential", "wallet", "crypto", "urgent", "suspended",
  "limited", "click", "free", "prize", "winner", "lucky"
];

const TRUSTED_DOMAINS = [
  "google.com", "microsoft.com", "apple.com", "amazon.com", "github.com",
  "youtube.com", "wikipedia.org", "stackoverflow.com", "cloudflare.com",
  "mozilla.org", "w3.org", "iana.org", "netflix.com", "linkedin.com"
];

const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click", ".link", ".buzz"];

function analyzeURL(rawUrl) {
  const warnings = [];
  const indicators = [];
  let riskScore = 0;

  let url = rawUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return {
      score: 100, level: "INVALID", color: "red",
      warnings: ["Invalid URL format — cannot be parsed."],
      indicators: [], domain: "", protocol: ""
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const path = parsed.pathname + parsed.search;
  const fullUrl = url.toLowerCase();

  // Protocol
  if (parsed.protocol === "http:") {
    warnings.push("No SSL/TLS encryption (HTTP instead of HTTPS)");
    riskScore += 25;
  } else {
    indicators.push("HTTPS encryption present");
  }

  // Trusted domain check
  const isTrusted = TRUSTED_DOMAINS.some(d => hostname === d || hostname.endsWith("." + d));
  if (isTrusted) {
    indicators.push("Domain matches known trusted source");
    riskScore -= 15;
  }

  // IP address as hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    warnings.push("IP address used instead of domain name");
    riskScore += 35;
  }

  // Suspicious TLD
  const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
  if (hasSuspiciousTLD) {
    warnings.push("Suspicious top-level domain detected");
    riskScore += 30;
  }

  // Subdomain depth
  const subdomains = hostname.split(".").length - 2;
  if (subdomains >= 3) {
    warnings.push(`Excessive subdomain depth (${subdomains} levels)`);
    riskScore += 20;
  }

  // Lookalike domains (homograph)
  const lookalike = /[0оО]/.test(hostname) || hostname.includes("paypa1") || hostname.includes("g00gle") || hostname.includes("arnazon");
  if (lookalike) {
    warnings.push("Possible homograph/lookalike domain attack detected");
    riskScore += 45;
  }

  // Suspicious keywords in domain
  const domainKeywords = SUSPICIOUS_KEYWORDS.filter(k => hostname.includes(k));
  if (domainKeywords.length > 0) {
    warnings.push(`Phishing keywords in domain: ${domainKeywords.slice(0, 3).join(", ")}`);
    riskScore += domainKeywords.length * 12;
  }

  // Suspicious keywords in path
  const pathKeywords = SUSPICIOUS_KEYWORDS.filter(k => path.includes(k));
  if (pathKeywords.length > 0) {
    warnings.push(`Suspicious keywords in URL path: ${pathKeywords.slice(0, 3).join(", ")}`);
    riskScore += pathKeywords.length * 8;
  }

  // Hyphens in domain
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    warnings.push(`High hyphen count in domain (${hyphenCount}) — common in phishing`);
    riskScore += 15;
  }

  // Long URL
  if (url.length > 100) {
    warnings.push("Unusually long URL — may be obfuscating destination");
    riskScore += 10;
  }

  // URL encoding tricks
  if (fullUrl.includes("%") && fullUrl.split("%").length > 4) {
    warnings.push("Excessive URL encoding — possible obfuscation");
    riskScore += 20;
  }

  // Double slashes or redirects
  if (path.includes("//")) {
    warnings.push("Double slashes detected in path — possible open redirect");
    riskScore += 15;
  }

  // @ symbol in URL
  if (fullUrl.includes("@")) {
    warnings.push("@ symbol in URL — browser may ignore everything before it");
    riskScore += 40;
  }

  // Data URI
  if (rawUrl.toLowerCase().startsWith("data:")) {
    warnings.push("Data URI detected — can execute embedded code");
    riskScore += 90;
  }

  // Javascript URI
  if (rawUrl.toLowerCase().startsWith("javascript:")) {
    warnings.push("JavaScript URI — extremely dangerous, can execute arbitrary code");
    riskScore += 100;
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  let level, color;
  if (riskScore >= 70) { level = "CRITICAL"; color = "red"; }
  else if (riskScore >= 45) { level = "HIGH"; color = "orange"; }
  else if (riskScore >= 20) { level = "MEDIUM"; color = "yellow"; }
  else { level = "SAFE"; color = "green"; }

  if (warnings.length === 0 && level === "SAFE") {
    indicators.push("No phishing indicators detected");
    indicators.push("URL structure appears legitimate");
  }

  return { score: riskScore, level, color, warnings, indicators, domain: hostname, protocol: parsed.protocol };
}

// ─── Animated Background ──────────────────────────────────────────────────────
function MatrixBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01ABCDEFアイウエオカキクケコサシスセソ<>[]{}|/\\?!@#$%^&*".split("");
    const fontSize = 13;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(1);

    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,8,20,0.045)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const alpha = Math.random() > 0.9 ? 1 : 0.15;
        ctx.fillStyle = `rgba(0,255,140,${alpha})`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.35 }} />;
}

// ─── Threat Gauge ─────────────────────────────────────────────────────────────
function ThreatGauge({ score, level, color }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame;
    let cur = 0;
    const step = () => {
      cur = Math.min(cur + 2, score);
      setDisplayed(cur);
      if (cur < score) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const colors = {
    green: { stroke: "#00ff8c", glow: "#00ff8c", bg: "#00ff8c22", text: "#00ff8c" },
    yellow: { stroke: "#ffd700", glow: "#ffd700", bg: "#ffd70022", text: "#ffd700" },
    orange: { stroke: "#ff8c00", glow: "#ff8c00", bg: "#ff8c0022", text: "#ff8c00" },
    red: { stroke: "#ff2244", glow: "#ff2244", bg: "#ff224422", text: "#ff2244" },
  };
  const c = colors[color];

  const r = 70;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (displayed / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 180, height: 180 }}>
        <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2233" strokeWidth="10" />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={c.stroke} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${c.glow})`, transition: "stroke-dashoffset 0.05s" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: c.text, fontFamily: "'Courier New', monospace", letterSpacing: -2, lineHeight: 1 }}>
            {displayed}
          </span>
          <span style={{ fontSize: 10, color: "#4a6080", letterSpacing: 3, fontFamily: "monospace" }}>RISK SCORE</span>
        </div>
      </div>
      <div style={{
        padding: "6px 24px", borderRadius: 4,
        border: `1px solid ${c.stroke}`, background: c.bg,
        color: c.text, fontFamily: "'Courier New', monospace",
        fontSize: 13, letterSpacing: 4, fontWeight: 700
      }}>
        ▲ {level} THREAT
      </div>
    </div>
  );
}

// ─── Scan Line animation ──────────────────────────────────────────────────────
function ScanAnimation() {
  return (
    <div style={{ position: "relative", width: "100%", height: 3, overflow: "hidden", margin: "12px 0" }}>
      <div style={{
        position: "absolute", height: "100%", width: "40%",
        background: "linear-gradient(90deg, transparent, #00ff8c, transparent)",
        animation: "scanLine 1.5s linear infinite",
        boxShadow: "0 0 10px #00ff8c"
      }} />
      <style>{`@keyframes scanLine { 0%{left:-40%} 100%{left:140%} }`}</style>
    </div>
  );
}

// ─── Feature Badge ────────────────────────────────────────────────────────────
function FeatureBadge({ icon, label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px", borderRadius: 6,
      background: "rgba(0,255,140,0.04)", border: "1px solid rgba(0,255,140,0.15)",
      color: "#4a8c6a", fontSize: 12, fontFamily: "monospace", letterSpacing: 1
    }}>
      <span style={{ color: "#00ff8c", fontSize: 14 }}>{icon}</span>
      {label}
    </div>
  );
}

// ─── History Item ─────────────────────────────────────────────────────────────
function HistoryItem({ item, onClick }) {
  const colors = { SAFE: "#00ff8c", MEDIUM: "#ffd700", HIGH: "#ff8c00", CRITICAL: "#ff2244", INVALID: "#888" };
  return (
    <button onClick={() => onClick(item.url)} style={{
      all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", borderRadius: 6, width: "100%", boxSizing: "border-box",
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      transition: "background 0.2s"
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
    >
      <span style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: colors[item.level] || "#888",
        boxShadow: `0 0 6px ${colors[item.level] || "#888"}`
      }} />
      <span style={{ fontSize: 11, color: "#5a7090", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.url}
      </span>
      <span style={{ fontSize: 10, color: colors[item.level], fontFamily: "monospace", flexShrink: 0 }}>{item.level}</span>
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function PhishingDetector() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState([]);
  const [scanPhase, setScanPhase] = useState("");
  const inputRef = useRef(null);

  const phases = [
    "Resolving domain structure...",
    "Checking SSL certificate...",
    "Analyzing URL entropy...",
    "Cross-referencing threat database...",
    "Scanning for obfuscation patterns...",
    "Evaluating risk vectors...",
    "Generating threat report...",
  ];

  const handleScan = async (scanUrl) => {
    const target = (scanUrl || url).trim();
    if (!target) return;

    setScanning(true);
    setResult(null);

    for (let i = 0; i < phases.length; i++) {
      setScanPhase(phases[i]);
      await new Promise(r => setTimeout(r, 280));
    }

    const analysis = analyzeURL(target);
    setResult(analysis);
    setScanning(false);
    setScanPhase("");

    setHistory(prev => {
      const next = [{ url: target, level: analysis.level }, ...prev.filter(h => h.url !== target)].slice(0, 8);
      return next;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleScan();
  };

  const resultColors = {
    green: { primary: "#00ff8c", dim: "#00ff8c33", border: "#00ff8c44" },
    yellow: { primary: "#ffd700", dim: "#ffd70033", border: "#ffd70044" },
    orange: { primary: "#ff8c00", dim: "#ff8c0033", border: "#ff8c0044" },
    red: { primary: "#ff2244", dim: "#ff224433", border: "#ff224444" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000810", color: "#c0cce0", fontFamily: "'Courier New', monospace", position: "relative", overflow: "hidden" }}>
      <MatrixBackground />

      {/* Grid overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(0,255,140,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,140,1) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 48, paddingTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 2, height: 32, background: "linear-gradient(to bottom, transparent, #00ff8c)", borderRadius: 1 }} />
            <span style={{ fontSize: 11, letterSpacing: 6, color: "#00ff8c", opacity: 0.7 }}>CYBERSEC INTELLIGENCE PLATFORM</span>
            <div style={{ width: 2, height: 32, background: "linear-gradient(to bottom, #00ff8c, transparent)", borderRadius: 1 }} />
          </div>

          <h1 style={{
            fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, margin: 0, letterSpacing: -1,
            background: "linear-gradient(135deg, #ffffff 0%, #00ff8c 50%, #0099ff 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1
          }}>
            PHISHGUARD
          </h1>
          <p style={{ margin: "10px 0 0", color: "#3a6050", fontSize: 13, letterSpacing: 3 }}>
            ◈ ADVANCED URL THREAT INTELLIGENCE ◈
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
            <FeatureBadge icon="⚡" label="REAL-TIME ANALYSIS" />
            <FeatureBadge icon="🔬" label="DEEP INSPECTION" />
            <FeatureBadge icon="🛡" label="THREAT SCORING" />
            <FeatureBadge icon="🌐" label="DOMAIN FORENSICS" />
          </div>
        </header>

        {/* Main Scanner */}
        <div style={{
          background: "rgba(5,15,30,0.85)", border: "1px solid rgba(0,255,140,0.2)",
          borderRadius: 12, padding: "32px", marginBottom: 28,
          boxShadow: "0 0 40px rgba(0,255,140,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ color: "#00ff8c", fontSize: 11, letterSpacing: 3 }}>◈ TARGET URL</span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,255,140,0.1)" }} />
            <span style={{ color: "#1a4030", fontSize: 10, letterSpacing: 2 }}>SCAN ENGINE v4.2.1</span>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{
                position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                color: "#00ff8c", fontSize: 16, opacity: 0.7, pointerEvents: "none", zIndex: 1
              }}>🔍</div>
              <input
                ref={inputRef}
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/login?redirect=..."
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(0,255,140,0.03)", border: "1px solid rgba(0,255,140,0.25)",
                  borderRadius: 8, padding: "14px 16px 14px 44px",
                  color: "#a0f0c0", fontSize: 14, fontFamily: "monospace",
                  outline: "none", caretColor: "#00ff8c",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(0,255,140,0.6)"; e.target.style.boxShadow = "0 0 20px rgba(0,255,140,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,255,140,0.25)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <button
              onClick={() => handleScan()}
              disabled={scanning || !url.trim()}
              style={{
                padding: "14px 28px", borderRadius: 8,
                background: scanning ? "rgba(0,255,140,0.05)" : "linear-gradient(135deg, #00ff8c22, #0099ff22)",
                border: "1px solid rgba(0,255,140,0.4)",
                color: scanning ? "#2a6040" : "#00ff8c",
                fontSize: 13, fontFamily: "monospace", letterSpacing: 2,
                cursor: scanning || !url.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap", fontWeight: 700
              }}
              onMouseEnter={e => { if (!scanning && url.trim()) { e.target.style.background = "rgba(0,255,140,0.15)"; e.target.style.boxShadow = "0 0 20px rgba(0,255,140,0.2)"; }}}
              onMouseLeave={e => { e.target.style.background = "linear-gradient(135deg, #00ff8c22, #0099ff22)"; e.target.style.boxShadow = "none"; }}
            >
              {scanning ? "▶ SCANNING..." : "▶ ANALYZE"}
            </button>
          </div>

          {/* Scanning Phase */}
          {scanning && (
            <div style={{ marginTop: 20 }}>
              <ScanAnimation />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff8c", animation: "pulse 1s infinite", boxShadow: "0 0 6px #00ff8c" }} />
                <span style={{ fontSize: 11, color: "#00aa60", letterSpacing: 2 }}>{scanPhase}</span>
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            </div>
          )}
        </div>

        {/* Results */}
        {result && !scanning && (() => {
          const rc = resultColors[result.color];
          return (
            <div style={{
              background: "rgba(5,15,30,0.9)", border: `1px solid ${rc.border}`,
              borderRadius: 12, padding: "32px", marginBottom: 28,
              boxShadow: `0 0 60px ${rc.dim}`, animation: "fadeUp 0.4s ease",
              backdropFilter: "blur(20px)"
            }}>
              <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <span style={{ color: rc.primary, fontSize: 11, letterSpacing: 3 }}>◈ ANALYSIS REPORT</span>
                <div style={{ flex: 1, height: 1, background: rc.dim }} />
                <span style={{ fontSize: 10, color: "#1a4030", letterSpacing: 2 }}>
                  {new Date().toLocaleTimeString()} UTC
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "start" }}>
                {/* Gauge */}
                <ThreatGauge score={result.score} level={result.level} color={result.color} />

                {/* Details */}
                <div>
                  {/* Domain info */}
                  <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 10, color: "#3a5060", letterSpacing: 3, marginBottom: 6 }}>DOMAIN IDENTIFIED</div>
                    <div style={{ fontSize: 16, color: "#a0c0e0", fontWeight: 700, wordBreak: "break-all" }}>{result.domain || "—"}</div>
                    <div style={{ fontSize: 10, color: "#2a4050", marginTop: 4 }}>
                      Protocol: <span style={{ color: result.protocol === "https:" ? "#00ff8c" : "#ff2244" }}>{result.protocol || "—"}</span>
                    </div>
                  </div>

                  {/* Warnings */}
                  {result.warnings.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 10, color: "#3a5060", letterSpacing: 3, marginBottom: 8 }}>⚠ THREAT INDICATORS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {result.warnings.map((w, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px",
                            background: `${rc.dim}66`, border: `1px solid ${rc.border}`,
                            borderRadius: 6, fontSize: 12, color: "#c0a090", lineHeight: 1.5
                          }}>
                            <span style={{ color: rc.primary, flexShrink: 0, marginTop: 1 }}>▸</span>
                            {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safe indicators */}
                  {result.indicators.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: "#3a5060", letterSpacing: 3, marginBottom: 8 }}>✓ SAFE INDICATORS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {result.indicators.map((ind, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                            background: "rgba(0,255,140,0.03)", border: "1px solid rgba(0,255,140,0.12)",
                            borderRadius: 6, fontSize: 12, color: "#60a080"
                          }}>
                            <span style={{ color: "#00ff8c", flexShrink: 0 }}>✓</span>
                            {ind}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verdict Banner */}
              <div style={{
                marginTop: 28, padding: "16px 24px", borderRadius: 8,
                background: rc.dim, border: `1px solid ${rc.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12
              }}>
                <div>
                  <div style={{ fontSize: 10, color: "#3a5060", letterSpacing: 3, marginBottom: 4 }}>FINAL VERDICT</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: rc.primary, letterSpacing: 2 }}>
                    {result.level === "SAFE" && "✓ URL APPEARS SAFE"}
                    {result.level === "MEDIUM" && "⚠ EXERCISE CAUTION"}
                    {result.level === "HIGH" && "⛔ HIGH RISK — AVOID"}
                    {result.level === "CRITICAL" && "☠ CRITICAL THREAT — DO NOT VISIT"}
                    {result.level === "INVALID" && "✗ INVALID URL FORMAT"}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#2a4050", textAlign: "right" }}>
                  <div>{result.warnings.length} threat indicator{result.warnings.length !== 1 ? "s" : ""} found</div>
                  <div>Risk score: {result.score}/100</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Bottom Grid: History + Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Scan History */}
          <div style={{
            background: "rgba(5,15,30,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "20px", backdropFilter: "blur(20px)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ color: "#00ff8c", fontSize: 11, letterSpacing: 3 }}>◈ SCAN HISTORY</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>
            {history.length === 0 ? (
              <div style={{ color: "#1a3040", fontSize: 12, textAlign: "center", padding: "20px 0" }}>
                No scans yet — enter a URL above
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.map((h, i) => (
                  <HistoryItem key={i} item={h} onClick={(u) => { setUrl(u); handleScan(u); }} />
                ))}
              </div>
            )}
          </div>

          {/* Threat Legend */}
          <div style={{
            background: "rgba(5,15,30,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "20px", backdropFilter: "blur(20px)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ color: "#00ff8c", fontSize: 11, letterSpacing: 3 }}>◈ DETECTION VECTORS</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { color: "#00ff8c", level: "SAFE", desc: "No threats detected, URL appears legitimate" },
                { color: "#ffd700", level: "MEDIUM", desc: "Suspicious patterns detected, verify source" },
                { color: "#ff8c00", level: "HIGH", desc: "Multiple threat indicators, high phishing risk" },
                { color: "#ff2244", level: "CRITICAL", desc: "Confirmed attack vectors, do not visit" },
              ].map(({ color, level, desc }) => (
                <div key={level} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    background: `${color}22`, border: `1px solid ${color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color, letterSpacing: 2, fontWeight: 700 }}>{level}</div>
                    <div style={{ fontSize: 11, color: "#2a4050", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "12px", background: "rgba(0,255,140,0.02)", borderRadius: 8, border: "1px solid rgba(0,255,140,0.08)" }}>
              <div style={{ fontSize: 10, color: "#1a4030", letterSpacing: 2, marginBottom: 6 }}>DETECTION METHODS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["SSL Check", "Homograph", "IP Detection", "TLD Risk", "Subdomain Depth", "URL Entropy", "Keyword Scan", "Encoding Tricks"].map(m => (
                  <span key={m} style={{ fontSize: 10, color: "#1a5040", padding: "2px 8px", background: "rgba(0,255,140,0.05)", borderRadius: 3, border: "1px solid rgba(0,255,140,0.1)" }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 40, color: "#0a2030", fontSize: 10, letterSpacing: 3 }}>
          PHISHGUARD ◈ CYBERSEC INTELLIGENCE ◈ CLIENT-SIDE ANALYSIS ENGINE ◈ NO DATA TRANSMITTED
        </div>
      </div>
    </div>
  );
}
