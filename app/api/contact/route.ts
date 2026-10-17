import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RATE_LIMIT = 5;
const WINDOW_SECONDS = 15 * 60;
const MAX_REQUEST_BYTES = 12 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RateBucket = { count: number; resetAt: number };
type RateLimitState = typeof globalThis & {
  __appverseContactRateBuckets?: Map<string, RateBucket>;
  __appverseContactLastSweep?: number;
};

// In-memory protection is a fallback only; a serverless deployment may have multiple instances.
// Configure the optional Upstash variables documented in README for a shared, atomic limit.
const runtimeState = globalThis as RateLimitState;
const localBuckets = runtimeState.__appverseContactRateBuckets ??= new Map<string, RateBucket>();

const jsonError = (message: string, status: number, extraHeaders?: HeadersInit) =>
  NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders }
  });

const cleanText = (value: unknown, maxLength: number): string =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

function getClientAddress(request: Request): string {
  // Vercel supplies the real client address at the edge; forwarded-for is the fallback.
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 100);

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim().slice(0, 100) || "unknown";
  return "unknown";
}

function hashAddress(address: string): string {
  return createHash("sha256").update(address).digest("hex").slice(0, 32);
}

async function checkRateLimit(request: Request): Promise<{ allowed: boolean; retryAfter: number }> {
  const addressHash = hashAddress(getClientAddress(request));
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, "");
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const script = [
      "local hits = redis.call('INCR', KEYS[1])",
      "if hits == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
      "return {hits, redis.call('TTL', KEYS[1])}"
    ].join("\n");

    const response = await fetch(redisUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(["EVAL", script, "1", `appverse:contact:rate:${addressHash}`, String(WINDOW_SECONDS)]),
      cache: "no-store"
    });

    if (!response.ok) throw new Error("Distributed rate limiter unavailable");
    const result = await response.json() as { result?: unknown; error?: string };
    if (result.error || !Array.isArray(result.result) || result.result.length < 2) {
      throw new Error("Distributed rate limiter returned an invalid response");
    }

    const count = Number(result.result[0]);
    const ttl = Math.max(1, Number(result.result[1]) || WINDOW_SECONDS);
    if (!Number.isFinite(count)) throw new Error("Distributed rate limiter returned an invalid count");
    return { allowed: count <= RATE_LIMIT, retryAfter: ttl };
  }

  // Best-effort fallback for small deployments without Redis. This is not a cross-instance limit.
  const now = Date.now();
  if (now - (runtimeState.__appverseContactLastSweep ?? 0) > 60_000) {
    for (const [key, bucket] of localBuckets) {
      if (bucket.resetAt <= now) localBuckets.delete(key);
    }
    runtimeState.__appverseContactLastSweep = now;
  }
  const key = `appverse-contact:${addressHash}`;
  const existing = localBuckets.get(key);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 1, resetAt: now + WINDOW_SECONDS * 1000 }
    : { count: existing.count + 1, resetAt: existing.resetAt };

  localBuckets.set(key, bucket);
  if (localBuckets.size > 5_000) {
    const firstKey = localBuckets.keys().next().value;
    if (firstKey) localBuckets.delete(firstKey);
  }

  return {
    allowed: bucket.count <= RATE_LIMIT,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
  };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch {
      return jsonError("This request could not be verified.", 403);
    }
    if (originUrl.origin !== new URL(request.url).origin) {
      return jsonError("This request could not be verified.", 403);
    }
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonError("Your message is too large. Please shorten it and try again.", 413);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Please submit a valid form.", 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonError("Please submit a valid form.", 400);
  }

  const data = payload as Record<string, unknown>;
  // Silently accept bot traps so automated form scanners do not receive feedback.
  if (cleanText(data.website, 200)) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });

  let limit: { allowed: boolean; retryAfter: number };
  try {
    limit = await checkRateLimit(request);
  } catch {
    return jsonError("The enquiry service is temporarily unavailable. Please try again later.", 503);
  }
  if (!limit.allowed) {
    return jsonError("Too many enquiries from this connection. Please wait a little and try again.", 429, {
      "Retry-After": String(limit.retryAfter)
    });
  }

  const name = cleanText(data.name, 100);
  const email = cleanText(data.email, 254).toLowerCase();
  const company = cleanText(data.company, 120);
  const projectType = cleanText(data.projectType, 100);
  const message = cleanText(data.message, 4000);

  if (!name || !email || !message) {
    return jsonError("Please complete your name, email, and message.", 400);
  }
  if (!EMAIL_PATTERN.test(email)) return jsonError("Please enter a valid email address.", 400);
  if (message.length < 12) return jsonError("Please add a little more detail to your project enquiry.", 400);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return jsonError("Our enquiry form is not connected yet. Please try again later.", 503);
  }

  const emailText = [
    "New project enquiry from appverse.si",
    "",
    "Name: " + name,
    "Email: " + email,
    "Company: " + (company || "Not provided"),
    "Project type: " + (projectType || "Not specified"),
    "",
    "Project brief:",
    message
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: "AppverseSI project enquiry — " + name,
        text: emailText
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return jsonError("We couldn't send your enquiry right now. Please try again later.", 502);
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("We couldn't send your enquiry right now. Please try again later.", 502);
  }
}
