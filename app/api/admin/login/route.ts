import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_SECONDS,
  adminAuthConfigured,
  createAdminSessionToken,
  verifyAdminCredentials
} from "@/lib/admin-auth";

export const runtime = "nodejs";

type AttemptBucket = { count: number; resetAt: number };
type AttemptState = typeof globalThis & { __appverseAdminLoginAttempts?: Map<string, AttemptBucket> };
const attemptState = globalThis as AttemptState;
const attempts = attemptState.__appverseAdminLoginAttempts ??= new Map<string, AttemptBucket>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

function clientKey(request: NextRequest) {
  const address = request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(address).digest("hex").slice(0, 24);
}

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store", ...headers }
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return jsonError("This request could not be verified.", 403);
      }
    } catch {
      return jsonError("This request could not be verified.", 403);
    }
  }

  const key = clientKey(request);
  const now = Date.now();
  const oldAttempt = attempts.get(key);
  const bucket = !oldAttempt || oldAttempt.resetAt <= now
    ? { count: 0, resetAt: now + LOGIN_WINDOW_MS }
    : oldAttempt;
  if (bucket.count >= LOGIN_MAX_ATTEMPTS) {
    attempts.set(key, bucket);
    return jsonError("Too many sign-in attempts. Please wait 15 minutes and try again.", 429, {
      "Retry-After": String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)))
    });
  }
  bucket.count += 1;
  attempts.set(key, bucket);

  if (!adminAuthConfigured()) {
    return jsonError("Admin sign-in is not configured yet.", 503);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Enter your username and password.", 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonError("Enter your username and password.", 400);
  }

  const data = payload as Record<string, unknown>;
  const username = typeof data.username === "string" ? data.username.trim().slice(0, 120) : "";
  const password = typeof data.password === "string" ? data.password.slice(0, 1024) : "";
  if (!verifyAdminCredentials(username, password)) {
    return jsonError("Those sign-in details were not accepted.", 401);
  }

  attempts.delete(key);
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS
  });
  return response;
}
