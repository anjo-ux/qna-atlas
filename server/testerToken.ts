import crypto from "node:crypto";

const TESTER_REDIRECT_SECRET = process.env.TESTER_REDIRECT_SECRET || "change-me-in-production";
const TOKEN_TTL_SEC = 5 * 60; // 5 minutes

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Buffer {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return Buffer.from(b64, "base64");
}

export interface TesterTokenPayload {
  userId: string;
  exp: number;
}

/**
 * Create a short-lived signed token for redirecting a tester to Atlas Trainer.
 * Token is base64url(payload).base64url(hmac).
 */
export function createTesterRedirectToken(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC;
  const payload: TesterTokenPayload = { userId, exp };
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = crypto.createHmac("sha256", TESTER_REDIRECT_SECRET).update(payloadB64).digest();
  const sigB64 = base64UrlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

/**
 * Verify a tester redirect token and return the payload if valid.
 */
export function verifyTesterRedirectToken(token: string): TesterTokenPayload | null {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;
    const expectedSig = crypto.createHmac("sha256", TESTER_REDIRECT_SECRET).update(payloadB64).digest();
    const expectedB64 = base64UrlEncode(expectedSig);
    if (expectedB64 !== sigB64) return null;
    const payloadBuf = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadBuf.toString("utf8")) as TesterTokenPayload;
    if (typeof payload.userId !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

export const ATLAS_TRAINER_CALLBACK_URL = "https://train.prs-atlas.com/auth/callback";
