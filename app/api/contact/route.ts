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
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/\\/+$/, "");
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Shared limiting is best-effort. An optional Redis outage must not disable the contact form.
  if (redisUrl && redisToken) {
    try {
      const script = [
        "local hits = redis.call('INCR', KEYS[1])",
        "if hits == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
        "return {hits, redis.call('TTL', KEYS[1])}"
      ].join("\\n");

      const response = await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["EVAL", script, "1", `appverse:contact:rate:${addressHash}`, String(WINDOW_SECONDS)]),
        cache: "no-store",
        signal: AbortSignal.timeout(3500)
      });

      if (!response.ok) throw new Error(`Upstash HTTP ${response.status}`);
      const result = await response.json() as { result?: unknown; error?: string };
      if (result.error || !Array.isArray(result.result) || result.result.length < 2) {
        throw new Error("Upstash returned an invalid rate-limit response");
      }

      const count = Number(result.result[0]);
      const ttl = Math.max(1, Number(result.result[1]) || WINDOW_SECONDS);
      if (!Number.isFinite(count)) throw new Error("Upstash returned an invalid count");
      return { allowed: count <= RATE_LIMIT, retryAfter: ttl };
    } catch (error) {
      console.error("[AppverseSI contact] Shared rate limiter unavailable; using local fallback.", {
        reason: error instanceof Error ? error.message : "Unknown Upstash error"
      });
    }
  } else if (redisUrl || redisToken) {
    console.error("[AppverseSI contact] Only one Upstash variable is configured; using local rate limit.");
  }

  // Best-effort fallback for deployments without working Redis. Not shared across serverless instances.
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

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !to || !from) {
    console.error("[AppverseSI contact] Email delivery is not configured.", {
      hasResendKey: Boolean(apiKey),
      hasRecipient: Boolean(to),
      hasSender: Boolean(from)
    });
    return jsonError("The enquiry form is not connected yet. Please email us directly using the link below.", 503);
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
      cache: "no-store",
      signal: AbortSignal.timeout(12_000)
    });

    if (!response.ok) {
      const providerBody = (await response.text().catch(() => "")).slice(0, 1200);
      const fromDomain = from.match(/@([^>\\s]+)/)?.[1] ?? "unparseable";
      console.error("[AppverseSI contact] Resend rejected an enquiry.", {
        status: response.status,
        senderDomain: fromDomain,
        providerRequestId: response.headers.get("x-resend-id"),
        response: providerBody
      });

      if (response.status === 401 || response.status === 403) {
        return jsonError("Our email service rejected its credentials or sender permissions. Please email us directly using the link below.", 502);
      }
      if (response.status === 422) {
        return jsonError("Our email service rejected the sender or message configuration. Please email us directly using the link below.", 502);
      }
      return jsonError("We couldn't send this through the form just now. Please email us directly using the link below.", 502);
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[AppverseSI contact] Email request failed before Resend confirmed delivery.", {
      reason: error instanceof Error ? error.message : "Unknown network error"
    });
    return jsonError("We couldn't send this through the form just now. Please email us directly using the link below.", 502);
  }
}
