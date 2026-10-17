import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";
import { listContactMessages } from "@/lib/contact-storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Sign in to view messages." }, {
      status: 401,
      headers: { "Cache-Control": "no-store" }
    });
  }

  try {
    const messages = await listContactMessages();
    return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[AppverseSI admin inbox] Could not load messages.", {
      reason: error instanceof Error ? error.message : "Unknown storage error"
    });
    return NextResponse.json({ error: "The inbox is temporarily unavailable." }, {
      status: 503,
      headers: { "Cache-Control": "no-store" }
    });
  }
}
