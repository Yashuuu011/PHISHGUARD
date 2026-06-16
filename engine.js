// ─────────────────────────────────────────────────────────────────────────────
//  PhishGuard — Threat Detection Engine  v4.2.1
//  Client-side analysis · No data transmitted
// ─────────────────────────────────────────────────────────────────────────────

export const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'account', 'verify', 'secure', 'update', 'confirm',
  'banking', 'paypal', 'apple', 'google', 'microsoft', 'amazon', 'netflix',
  'password', 'credential', 'wallet', 'crypto', 'urgent', 'suspended',
  'limited', 'click', 'free', 'prize', 'winner', 'lucky', 'reward',
  'billing', 'invoice', 'payment', 'refund', 'support', 'helpdesk',
]

export const TRUSTED_DOMAINS = [
  'google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'github.com',
  'youtube.com', 'wikipedia.org', 'stackoverflow.com', 'cloudflare.com',
  'mozilla.org', 'w3.org', 'iana.org', 'netflix.com', 'linkedin.com',
  'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'reddit.com',
]

export const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click',
  '.link', '.buzz', '.pw', '.cc', '.icu', '.live', '.online',
]

/**
 * Analyzes a URL for phishing indicators.
 * @param {string} rawUrl
 * @returns {{ score:number, level:string, color:string, warnings:string[], indicators:string[], domain:string, protocol:string, fullUrl:string }}
 */
export function analyzeURL(rawUrl) {
  const warnings   = []
  const indicators = []
  let riskScore    = 0

  // ── Normalise ──────────────────────────────────────────────────────────────
  let url = rawUrl.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  // ── Early exits ────────────────────────────────────────────────────────────
  if (rawUrl.toLowerCase().startsWith('javascript:')) {
    return {
      score: 100, level: 'CRITICAL', color: '#ff2244',
      warnings: ['JavaScript URI — arbitrary code execution risk'],
      indicators: [], domain: '', protocol: 'javascript:', fullUrl: rawUrl,
    }
  }
  if (rawUrl.toLowerCase().startsWith('data:')) {
    return {
      score: 95, level: 'CRITICAL', color: '#ff2244',
      warnings: ['Data URI — can embed and execute malicious code'],
      indicators: [], domain: '', protocol: 'data:', fullUrl: rawUrl,
    }
  }

  // ── Parse ──────────────────────────────────────────────────────────────────
  let parsed
  try { parsed = new URL(url) } catch {
    return {
      score: 100, level: 'INVALID', color: '#888888',
      warnings: ['Invalid URL — cannot be parsed by the browser'],
      indicators: [], domain: '', protocol: '', fullUrl: rawUrl,
    }
  }

  const hostname = parsed.hostname.toLowerCase()
  const path     = parsed.pathname + parsed.search
  const fullUrl  = url.toLowerCase()

  // ── 1. Protocol ────────────────────────────────────────────────────────────
  if (parsed.protocol === 'http:') {
    warnings.push('No SSL/TLS encryption (HTTP instead of HTTPS)')
    riskScore += 25
  } else {
    indicators.push('HTTPS — connection is encrypted')
  }

  // ── 2. Trusted domain ──────────────────────────────────────────────────────
  const isTrusted = TRUSTED_DOMAINS.some(
    d => hostname === d || hostname.endsWith('.' + d)
  )
  if (isTrusted) {
    indicators.push('Domain matches a known trusted source')
    riskScore -= 15
  }

  // ── 3. Raw IP address ──────────────────────────────────────────────────────
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    warnings.push('Raw IP address used instead of a domain name')
    riskScore += 35
  }

  // ── 4. Suspicious TLD ──────────────────────────────────────────────────────
  if (SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld))) {
    warnings.push('High-risk / free top-level domain detected')
    riskScore += 30
  }

  // ── 5. Subdomain depth ─────────────────────────────────────────────────────
  const subDepth = hostname.split('.').length - 2
  if (subDepth >= 3) {
    warnings.push(`Excessive subdomain depth (${subDepth} levels) — common phishing tactic`)
    riskScore += 20
  }

  // ── 6. Homograph / lookalike ───────────────────────────────────────────────
  const homographPatterns = [
    /[0оО]/, /paypa[l1]/, /g[o0]{2}gle/, /arnazon/, /micros0ft/,
    /appl[e3]/, /facebo[o0]k/, /netfl[i1]x/,
  ]
  if (homographPatterns.some(p => p.test(hostname))) {
    warnings.push('Homograph / lookalike domain detected (character substitution attack)')
    riskScore += 45
  }

  // ── 7. Phishing keywords in domain ────────────────────────────────────────
  const domKw = SUSPICIOUS_KEYWORDS.filter(k => hostname.includes(k))
  if (domKw.length) {
    warnings.push(`Phishing keywords in domain: ${domKw.slice(0, 3).join(', ')}`)
    riskScore += Math.min(domKw.length * 12, 48)
  }

  // ── 8. Phishing keywords in path/query ────────────────────────────────────
  const pathKw = SUSPICIOUS_KEYWORDS.filter(k => path.includes(k))
  if (pathKw.length) {
    warnings.push(`Suspicious keywords in URL path: ${pathKw.slice(0, 3).join(', ')}`)
    riskScore += Math.min(pathKw.length * 8, 32)
  }

  // ── 9. Hyphen abuse ────────────────────────────────────────────────────────
  const hyphens = (hostname.match(/-/g) || []).length
  if (hyphens >= 3) {
    warnings.push(`High hyphen count in domain (${hyphens}) — common in phishing URLs`)
    riskScore += 15
  }

  // ── 10. Excessive length ───────────────────────────────────────────────────
  if (url.length > 100) {
    warnings.push('Abnormally long URL — may be obfuscating the true destination')
    riskScore += 10
  }

  // ── 11. URL encoding abuse ────────────────────────────────────────────────
  const encodedParts = (fullUrl.match(/%[0-9a-f]{2}/gi) || []).length
  if (encodedParts > 4) {
    warnings.push('Excessive URL-encoding — possible obfuscation of malicious content')
    riskScore += 20
  }

  // ── 12. Double-slash / open redirect ─────────────────────────────────────
  if (path.includes('//')) {
    warnings.push('Double slashes in path — possible open redirect exploit')
    riskScore += 15
  }

  // ── 13. @ symbol injection ────────────────────────────────────────────────
  if (fullUrl.includes('@')) {
    warnings.push('@ symbol in URL — browser ignores everything before it (credential injection)')
    riskScore += 40
  }

  // ── 14. Punycode / IDN ────────────────────────────────────────────────────
  if (hostname.startsWith('xn--')) {
    warnings.push('Internationalised domain (IDN/Punycode) — often used in homograph attacks')
    riskScore += 25
  }

  // ── 15. Query parameter count ─────────────────────────────────────────────
  const params = [...parsed.searchParams].length
  if (params > 6) {
    warnings.push(`Unusually high query-parameter count (${params}) — may mask redirect`)
    riskScore += 10
  }

  // ── Clamp & grade ─────────────────────────────────────────────────────────
  riskScore = Math.min(100, Math.max(0, riskScore))

  let level, color
  if      (riskScore >= 70) { level = 'CRITICAL'; color = '#ff2244' }
  else if (riskScore >= 45) { level = 'HIGH';     color = '#ff8c00' }
  else if (riskScore >= 20) { level = 'MEDIUM';   color = '#ffd700' }
  else                      { level = 'SAFE';     color = '#00ff8c' }

  if (!warnings.length) {
    indicators.push('No phishing indicators detected')
    indicators.push('URL structure appears legitimate')
  }

  return { score: riskScore, level, color, warnings, indicators, domain: hostname, protocol: parsed.protocol, fullUrl: url }
}
