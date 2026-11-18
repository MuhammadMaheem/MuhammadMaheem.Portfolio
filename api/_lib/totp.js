import { createHmac, timingSafeEqual } from 'node:crypto';

// RFC 6238 time-based one-time passwords (what Google Authenticator, Authy, 1Password etc. produce).
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Decode(s) {
  const clean = String(s).toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0; let value = 0; const out = [];
  for (const ch of clean) {
    const i = B32.indexOf(ch);
    if (i < 0) { throw new Error('Not a base32 secret'); }
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export function base32Encode(buf) {
  let bits = 0; let value = 0; let out = '';
  for (const b of buf) {
    value = (value << 8) | b; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) { out += B32[(value << (5 - bits)) & 31]; }
  return out;
}

export function hotp(secretBuf, counter, digits = 6) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac('sha1', secretBuf).update(msg).digest();
  const off = h[h.length - 1] & 15;
  const code = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(code % 10 ** digits).padStart(digits, '0');
}

const usedCounters = new Map(); // a code is accepted once (best effort across one server instance)

// Checks a code without using it up. Accepts the current 30 s step and one step either side (clock drift).
// Returns the matching step, or null. Call markTotpUsed(secret, step) once the whole login has succeeded,
// so a wrong password cannot burn a valid code.
export function matchTotp(secret, input, now = Date.now()) {
  const code = String(input || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) { return null; }
  let key;
  try { key = base32Decode(secret); } catch { return null; }
  const step = Math.floor(now / 30000);
  let hit = null;
  for (const d of [-1, 0, 1]) {
    const want = Buffer.from(hotp(key, step + d));
    const got = Buffer.from(code);
    if (want.length === got.length && timingSafeEqual(want, got)) { hit = step + d; }
  }
  if (hit === null || (usedCounters.get(secret) || -1) >= hit) { return null; }
  return hit;
}
export const markTotpUsed = (secret, step) => { usedCounters.set(secret, step); };

// all-in-one form (used by the tests): off when no secret is configured
export function verifyTotp(secret, input, now = Date.now()) {
  if (!secret) { return true; }
  const step = matchTotp(secret, input, now);
  if (step === null) { return false; }
  markTotpUsed(secret, step);
  return true;
}
export const _resetTotp = () => usedCounters.clear();
