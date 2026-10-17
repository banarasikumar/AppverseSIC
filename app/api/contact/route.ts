import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { saveContactMessage } from "@/lib/contact-storage";

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
    try {
      const script = [
        "local hits = redis.call('INCR', KEYS[1])",
        "if hits == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
        "return {hits, redis.call('TTL', KEYS[1])}"
      ].join("\n");
      const response = await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + redisToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["EVAL", script, "1", "appverse:contact:rate:" + addressHash, String(WINDOW_SECONDS)]),
        cache: "no-store",
        signal: AbortSignal.timeout(3500)
      });
      if (!response.ok) throw new Error("Upstash HTTP " + response.status);
      const result = await response.json() as { result?: unknown; error?: string };
      if (result.error || !Array.isArray(result.result) || result.result.length < 2) {
        throw new Error("Invalid rate-limit response");
      }
      const count = Number(result.result[0]);
      const ttl = Math.max(1, Number(result.result[1]) || WINDOW_SECONDS);
      if (!Number.isFinite(count)) throw new Error("Invalid rate-limit count");
      return { allowed: count <= RATE_LIMIT, retryAfter: ttl };
    } catch (error) {
      console.error("[AppverseSI contact] Shared rate limiter unavailable; using local fallback.", {
        reason: error instanceof Error ? error.message : "Unknown rate-limit error"
      });
    }
  }

  const now = Date.now();
  if (now - (runtimeState.__appverseContactLastSweep ?? 0) > 60_000) {
    for (const [key, bucket] of localBuckets) {
      if (bucket.resetAt <= now) localBuckets.delete(key);
    }
    runtimeState.__appverseContactLastSweep = now;
  }
  const key = "appverse-contact:" + addressHash;
  const existing = localBuckets.get(key);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 1, resetAt: now + WINDOW_SECONDS * 1000 }
    : { count: existing.count + 1, resetAt: existing.resetAt };
  localBuckets.set(key, bucket);
  if (localBuckets.size > 5000) {
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
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return jsonError("This request could not be verified.", 403);
      }
    } catch {
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
  if (cleanText(data.website, 200)) {
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const limit = await checkRateLimit(request);
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

  if (!name || !email || !message) return jsonError("Please complete your name, email, and message.", 400);
  if (!EMAIL_PATTERN.test(email)) return jsonError("Please enter a valid email address.", 400);
  if (message.length < 12) return jsonError("Please add a little more detail to your project enquiry.", 400);

  try {
    await saveContactMessage({ name, email, company, projectType, message });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[AppverseSI contact] Could not save an enquiry.", {
      reason: error instanceof Error ? error.message : "Unknown storage error"
    });
    return jsonError("We couldn’t receive your enquiry right now. Please try again later.", 503);
  }
}
