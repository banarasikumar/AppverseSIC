import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";
import { updateContactMessageStatus, type ContactStatus } from "@/lib/contact-storage";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_STATUSES = new Set<ContactStatus>(["new", "read", "archived"]);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Sign in to update messages." }, { status: 401 });
  }

  const params = await context.params;
  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Choose a valid message status." }, { status: 400 });
  }
  const status = payload && typeof payload === "object"
    ? (payload as Record<string, unknown>).status
    : undefined;
  if (typeof status !== "string" || !ALLOWED_STATUSES.has(status as ContactStatus)) {
    return NextResponse.json({ error: "Choose a valid message status." }, { status: 400 });
  }

  try {
    await updateContactMessageStatus(params.id, status as ContactStatus);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[AppverseSI admin inbox] Could not update message status.", {
      reason: error instanceof Error ? error.message : "Unknown storage error"
    });
    return NextResponse.json({ error: "The message could not be updated." }, { status: 503 });
  }
}
