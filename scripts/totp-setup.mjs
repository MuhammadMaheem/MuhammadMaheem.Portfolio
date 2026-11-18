// Prints a new authenticator secret for the admin sign-in. Run: node scripts/totp-setup.mjs
// Add the secret to your authenticator app (enter it as a "setup key", time-based), then set it in Vercel
// as ADMIN_TOTP_SECRET and redeploy. Do not commit it or paste it anywhere else.
import { randomBytes } from 'node:crypto';
import { base32Encode } from '../api/_lib/totp.js';

const secret = base32Encode(randomBytes(20));
console.log('Setup key (base32):', secret);
console.log('otpauth URI:       ', 'otpauth://totp/Portfolio%20admin?secret=' + secret + '&issuer=Portfolio%20admin');
