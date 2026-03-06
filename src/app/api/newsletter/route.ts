import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { success: false, message: "Newsletter not configured" },
      { status: 503 }
    );
  }

  let body: { email?: string; consentPrivacy?: boolean; documentId?: string; branchName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email required" },
      { status: 400 }
    );
  }

  const payload = {
    actionType: "weezmo",
    email,
    phone: (typeof body.phone === "string" ? body.phone.trim() : "") || "",
    fullName: (typeof body.fullName === "string" ? body.fullName.trim() : "") || "",
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Newsletter webhook error:", res.status, await res.text());
      return NextResponse.json(
        { success: false, message: "Webhook failed" },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter webhook fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Webhook request failed" },
      { status: 502 }
    );
  }
}
