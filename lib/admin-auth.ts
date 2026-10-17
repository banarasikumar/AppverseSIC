import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "appverse_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

function configured() {
  return Boolean(
    process.env.ADMIN_USERNAME?.trim() &&
    process.env.ADMIN_PASSWORD &&
    (process.env.ADMIN_SESSION_SECRET || "").length >= 32
  );
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function constantTimeEqual(actual: string, expected: string) {
  return timingSafeEqual(digest(actual), digest(expected));
}

export function adminAuthConfigured() {
  return configured();
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME?.trim() || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!configured() || !expectedUsername || !expectedPassword) return false;
  return constantTimeEqual(username, expectedUsername) && constantTimeEqual(password, expectedPassword);
}

function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return createHmac("sha256", secret).update("appverse-admin:" + payload).digest("hex");
}

export function createAdminSessionToken() {
  if (!configured()) throw new Error("Admin authentication is not configured.");
  const expiresAt = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS);
  const nonce = randomBytes(18).toString("base64url");
  const payload = expiresAt + "." + nonce;
  return payload + "." + sign(payload);
}

export function isValidAdminSession(token: string | undefined | null) {
  if (!token || !configured()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const expiresAt = Number(parts[0]);
  const nonce = parts[1];
  const suppliedSignature = parts[2];
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + ADMIN_SESSION_TTL_SECONDS + 60) return false;
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(suppliedSignature)) return false;

  const expectedSignature = sign(parts[0] + "." + nonce);
  return timingSafeEqual(Buffer.from(suppliedSignature, "hex"), Buffer.from(expectedSignature, "hex"));
}
