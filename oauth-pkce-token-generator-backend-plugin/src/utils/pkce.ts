// eslint-disable-next-line no-restricted-imports
import crypto from "crypto";

const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
};

// Node.js-safe SHA-256 and encoding
const sha256 = async (plain: string): Promise<Buffer> => {
  return crypto.createHash('sha256').update(plain).digest();
};

const base64UrlEncode = (buffer: Buffer): string => {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const generatePKCE = async (): Promise<{ verifier: string; challenge: string }> => {
  const verifier = generateRandomString(64);
  const hashed = await sha256(verifier);
  const challenge = base64UrlEncode(hashed);
  return {verifier, challenge};
};
