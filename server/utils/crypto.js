import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

// In production, ENCRYPTION_KEY must be a 64-char hex string (32 bytes)
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
let KEY;
if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 64) {
  KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
} else {
  // Dev fallback — deterministic but weak
  KEY = crypto.scryptSync('dyg-dev-encryption-key', 'salt', 32);
}

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

function decrypt(data) {
  if (!data || !data.includes(':')) return data; // Not encrypted (legacy/plain)
  try {
    const [ivHex, tagHex, encrypted] = data.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return data; // Decryption failed, return raw (legacy token)
  }
}

export { encrypt, decrypt };
