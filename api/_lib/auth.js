import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './http.js';

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const SESSION_SECONDS = 8 * 60 * 60;

export function sign(payload, secret) {
  const body = b64u(JSON.stringify(payload));
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return body + '.' + sig;
}

export function verify(token, secret) {
  if (!token || !secret || typeof token !== 'string') { return null; }
  const [body, sig] = token.split('.');
  if (!body || !sig) { return null; }
  const want = createHmac('sha256', secret).update(body).digest();
  let got;
  try { got = Buffer.from(sig, 'base64url'); } catch { return null; }
  if (got.length !== want.length || !timingSafeEqual(got, want)) { return null; }
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return p && typeof p.exp === 'number' && p.exp > Date.now() / 1000 ? p : null;
  } catch { return null; }
}

// compare digests, so length never leaks and the comparison is constant time
export function passwordMatches(input, expected) {
  if (!expected || typeof input !== 'string') { return false; }
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) { out[part.slice(0, i).trim()] = part.slice(i + 1).trim(); }
  });
  return out;
}

const isLocal = (host) => /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host || '');

export function sessionCookie(secret, host) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const token = sign({ exp, v: 1 }, secret);
  return 'adm=' + token + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' + SESSION_SECONDS + (isLocal(host) ? '' : '; Secure');
}

export const clearCookie = (host) => 'adm=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' + (isLocal(host) ? '' : '; Secure');

// every endpoint except login: valid cookie, custom header, same-origin
export function requireAuth(req, env) {
  const h = req.headers;
  const cookies = parseCookies(h.cookie);
  if (!verify(cookies.adm, env.secret)) { throw new HttpError(401, 'Not signed in'); }
  if (h['x-admin'] !== '1') { throw new HttpError(403, 'Missing request header'); }
  const origin = h.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch { /* falls through to the check below */ }
    if (host !== h.host) { throw new HttpError(403, 'Cross-origin request refused'); }
  }
}

// best-effort brute-force brake (memory is per server instance, so this is not a hard limit)
const fails = new Map();
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

export function loginAllowed(ip) {
  const f = fails.get(ip);
  return !(f && f.n >= MAX_FAILS && Date.now() < f.until);
}
export function loginFailed(ip) {
  const f = fails.get(ip) || { n: 0, until: 0 };
  f.n += 1;
  f.until = Date.now() + LOCK_MS;
  fails.set(ip, f);
}
export const loginSucceeded = (ip) => { fails.delete(ip); };
export const _resetLoginLimits = () => fails.clear();
