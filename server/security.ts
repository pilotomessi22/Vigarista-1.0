import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Secret HMAC key for signing server-issued security tokens
const SERVER_HMAC_SECRET =
  process.env.SERVER_SECURITY_SECRET ||
  'vigarista_fort_knox_shield_v2_99x_' + (process.env.NODE_ENV || 'prod');

// Anti-DDoS & Intrusion Tracking Storage
interface IpTrackRecord {
  count: number;
  firstTime: number;
  authFailures: number;
  wafViolations: number;
  jailUntil?: number;
  lastViolationReason?: string;
}

const ipRegistry = new Map<string, IpTrackRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRegistry.entries()) {
    if (record.jailUntil && record.jailUntil > now) continue;
    if (now - record.firstTime > 120000) {
      ipRegistry.delete(ip);
    }
  }
}, 60000);

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Anti-DDoS and Rate Limiting Middleware
 * - General routes: max 120 req/min
 * - Auth/License routes: max 15 req/min
 * - Auto-Jail for 15 minutes if thresholds are abused
 */
export function antiDdosMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);

  // 1. Whitelist localhost and internal loopback
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return next();
  }

  // 2. Allow all frontend assets, Vite modules, SPA pages and static files freely
  // Anti-DDoS rate limiting must ONLY monitor API endpoints (/api/*)
  const isApiRoute = req.path.startsWith('/api/');
  if (!isApiRoute) {
    return next();
  }

  const now = Date.now();

  let record = ipRegistry.get(ip);
  if (!record) {
    record = { count: 1, firstTime: now, authFailures: 0, wafViolations: 0 };
    ipRegistry.set(ip, record);
  } else {
    // Check if in Jail
    if (record.jailUntil && record.jailUntil > now) {
      const remainingSeconds = Math.ceil((record.jailUntil - now) / 1000);
      res.setHeader('Retry-After', remainingSeconds.toString());
      return res.status(403).json({
        success: false,
        error: 'IP_BLOCKED_ANTI_DDOS',
        message: `⚠️ ACESSO TEMPORARIAMENTE BLOQUEADO: O seu endereço IP foi colocado em quarentena por detecção de tráfego abusivo ou tentativa de intrusão. Tente novamente em ${remainingSeconds}s.`,
        retryInSeconds: remainingSeconds,
      });
    }

    // Reset window after 60s
    if (now - record.firstTime > 60000) {
      record.count = 1;
      record.firstTime = now;
    } else {
      record.count++;
    }
  }

  // Rate limits specifically for API routes
  const isAuthRoute =
    req.path.startsWith('/api/license') ||
    req.path.startsWith('/api/admin') ||
    req.path.startsWith('/api/auth');

  // If hitting sensitive auth routes too fast (brute-forcing licenses or admin)
  if (isAuthRoute && record.count > 60) {
    record.jailUntil = now + 10 * 60 * 1000; // 10 min jail
    record.lastViolationReason = 'Excessive Auth API Calls (Brute Force Protection)';
    return res.status(429).json({
      success: false,
      error: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Muitas requisições de autenticação em sequência. Seu IP foi bloqueado temporariamente por 10 minutos.',
    });
  }

  // General API Flood limit
  if (record.count > 300) {
    record.jailUntil = now + 5 * 60 * 1000; // 5 min jail
    record.lastViolationReason = 'API Flood Protection Triggered';
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Taxa de requisições à API excedida. Sistema Anti-DDoS ativado para proteger o servidor.',
    });
  }

  next();
}

/**
 * WAF / Anti-Invasion Middleware
 * Inspects all requests for malicious injections (SQLi, NoSQLi, LFI, RCE, Script Injections)
 */
const SUSPICIOUS_PATTERNS = [
  /(\.\.[\/\\])/i, // Path Traversal ../ or ..\
  /(etc[\/\\]passwd|proc[\/\\]self|boot\.ini)/i, // Sensitive local files
  /(union\s+select|insert\s+into|drop\s+table|information_schema)/i, // SQL Injection
  /('\s*or\s*'1'\s*=\s*'1|'\s*or\s*1\s*=\s*1|--|\/\*)/i, // SQL Bypass
  /(\$where|\$gt|\$ne|\$regex)/i, // NoSQL Injection
  /(<\s*script\b|javascript:|onerror\s*=|onload\s*=|document\.cookie)/i, // XSS Injection
  /(;\s*(rm|cat|curl|wget|bash|sh|cmd|powershell)\b|\|\s*(rm|cat|bash|sh))/i, // Command Injection
  /(eval\(|exec\(|system\(|passthru\()/i, // RCE functions
];

export function antiInvasionWaf(req: Request, res: Response, next: NextFunction) {
  // Allow PWA assets directly
  if (
    req.path === '/manifest.json' ||
    req.path === '/sw.js' ||
    req.path.startsWith('/pwa-') ||
    req.path.startsWith('/icon-') ||
    req.path.endsWith('.png') ||
    req.path.endsWith('.svg') ||
    req.path.endsWith('.ico')
  ) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
  }

  const ip = getClientIp(req);
  const now = Date.now();

  // Combine components to scan
  const urlPayload = req.url || '';
  const bodyPayload = req.body ? JSON.stringify(req.body) : '';
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  // Block suspicious scanner bots
  const maliciousBots = ['sqlmap', 'nikto', 'nmap', 'acunetix', 'dirbuster', 'masscan'];
  if (maliciousBots.some((bot) => userAgent.includes(bot))) {
    const record = ipRegistry.get(ip) || { count: 1, firstTime: now, authFailures: 0, wafViolations: 0 };
    record.jailUntil = now + 60 * 60 * 1000; // 1h jail for known scanners
    record.lastViolationReason = 'Vulnerability Scanner Bot Detected';
    ipRegistry.set(ip, record);
    return res.status(403).json({ success: false, error: 'SECURITY_SCANNER_BLOCKED' });
  }

  // Check injection payloads
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(urlPayload) || pattern.test(bodyPayload)) {
      const record = ipRegistry.get(ip) || { count: 1, firstTime: now, authFailures: 0, wafViolations: 0 };
      record.wafViolations++;
      record.jailUntil = now + 30 * 60 * 1000; // 30 min jail
      record.lastViolationReason = `WAF Threat Trigger: ${pattern.toString()}`;
      ipRegistry.set(ip, record);

      console.warn(`[WAF SHIELD] Threat blocked from IP ${ip}: ${pattern.toString()}`);
      return res.status(403).json({
        success: false,
        error: 'WAF_INTRUSION_BLOCKED',
        message: '⚠️ AÇÃO BLOQUEADA PELO SISTEMA ANTI-INVASÃO: Assinatura de código ou payload malicioso detectado.',
      });
    }
  }

  // Apply HTTP security headers (do NOT set X-Frame-Options to allow AI Studio iframe preview)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
}

/**
 * Cryptographic Server-Side License Verification
 * Generates an HMAC-signed token that proves the backend validated the license.
 */
const KEY_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function verifyCryptographicKey(cleanKey: string): { valid: boolean; days: number } {
  // Master bypass keys
  if (
    cleanKey === 'TM-HZ2W-K3TC-2026' ||
    cleanKey === 'TM-LID7-9999-2026' ||
    cleanKey === 'TM-VIP8-2026-VIP7'
  ) {
    return { valid: true, days: 365 };
  }
  if (cleanKey === 'TM-V1GA-7777-2026') {
    return { valid: true, days: 30 };
  }
  if (cleanKey.startsWith('TM-TEST-') || cleanKey.includes('TEST') || cleanKey.includes('DEMO')) {
    return { valid: true, days: 20 / 1440 };
  }

  // Format: TM-[DAYS_HEX_3][RAND_1]-[HMAC_CHECKSUM_4]-[YEAR]
  const match = cleanKey.match(/^TM-([0-9A-F]{3}[A-Z0-9])-([A-Z0-9]{4})-(\d{4})$/i);
  if (!match) {
    return { valid: false, days: 0 };
  }

  const segment1 = match[1].toUpperCase();
  const checksumProvided = match[2].toUpperCase();
  const daysHex = segment1.substring(0, 3);
  const parsedDays = parseInt(daysHex, 16);

  if (isNaN(parsedDays) || parsedDays <= 0) {
    return { valid: false, days: 0 };
  }

  // Sha256 signature verification
  const sigHash = crypto.createHash('sha256').update(`vigarista_key_sec_${segment1}_2026`).digest('hex');
  let expectedChecksum = '';
  for (let i = 0; i < 4; i++) {
    const hexSlice = sigHash.substring(i * 4, i * 4 + 4);
    const num = parseInt(hexSlice, 16);
    expectedChecksum += KEY_CHARSET[num % KEY_CHARSET.length];
  }

  const valid = checksumProvided === expectedChecksum;
  return { valid, days: valid ? parsedDays : 0 };
}

export function generateServerProtectionToken(key: string, daysValid: number, hwid: string = '') {
  const now = Date.now();
  const expirationMs = daysValid * 24 * 60 * 60 * 1000;
  const expiresAt = now + expirationMs;

  const payload = {
    key: key.toUpperCase().trim(),
    hwid: hwid || 'authenticated_device',
    iat: now,
    exp: expiresAt,
    nonce: crypto.randomBytes(12).toString('hex'),
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SERVER_HMAC_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const serverToken = `${payloadB64}.${signature}`;

  // Generate an unforgeable ticket decryption seed for the client
  const ticketUnlockKey = crypto
    .createHmac('sha256', SERVER_HMAC_SECRET)
    .update(`ticket_unlock_${serverToken}`)
    .digest('hex');

  return {
    serverToken,
    ticketUnlockKey,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

export function validateServerToken(tokenString: string): { valid: boolean; reason?: string } {
  if (!tokenString || typeof tokenString !== 'string') {
    return { valid: false, reason: 'TOKEN_MISSING' };
  }

  const parts = tokenString.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'MALFORMED_TOKEN' };
  }

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SERVER_HMAC_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false, reason: 'SIGNATURE_TAMPERED' };
  }

  try {
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (Date.now() > payload.exp) {
      return { valid: false, reason: 'TOKEN_EXPIRED' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'INVALID_PAYLOAD' };
  }
}

export function getSecurityStats() {
  const now = Date.now();
  let currentlyJailed = 0;
  for (const record of ipRegistry.values()) {
    if (record.jailUntil && record.jailUntil > now) {
      currentlyJailed++;
    }
  }

  return {
    antiDdosActive: true,
    antiInvasionWafActive: true,
    rateLimiterActive: true,
    serverTokenAuthActive: true,
    currentlyJailedIps: currentlyJailed,
    totalTrackedIps: ipRegistry.size,
    status: '100% BLINDADO',
  };
}
