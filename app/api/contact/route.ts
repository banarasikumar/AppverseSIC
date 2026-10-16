import { NextResponse } from "next/server";

export const runtime = "nodejs";
const cleanText = (value: unknown, maxLength: number): string => typeof value === "string" ? value.trim().slice(0, maxLength) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Please submit a valid form." }, { status: 400 }); }
  if (!payload || typeof payload !== "object") return NextResponse.json({ error: "Please submit a valid form." }, { status: 400 });
  const data = payload as Record<string, unknown>;
  if (cleanText(data.website, 200)) return NextResponse.json({ ok: true });
  const name = cleanText(data.name, 100);
  const email = cleanText(data.email, 254).toLowerCase();
  const company = cleanText(data.company, 120);
  const projectType = cleanText(data.projectType, 100);
  const message = cleanText(data.message, 4000);
  if (!name || !email || !message) return NextResponse.json({ error: "Please complete your name, email, and message." }, { status: 400 });
  if (!emailPattern.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (message.length < 12) return NextResponse.json({ error: "Please add a little more detail to your message." }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return NextResponse.json({ error: "Our inquiry form is not connected yet. Please try again later." }, { status: 503 });
  const emailText = ["New business inquiry from appverse.si", "", "Name: " + name, "Email: " + email, "Company: " + (company || "Not provided"), "Project type: " + (projectType || "Not specified"), "", "Message:", message].join("\n");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject: "AppverseSI inquiry — " + name, text: emailText }),
      cache: "no-store"
    });
    if (!response.ok) return NextResponse.json({ error: "We couldn't send your message right now. Please try again later." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn't send your message right now. Please try again later." }, { status: 502 });
  }
}
