import { NextRequest, NextResponse } from "next/server";
import { postJsonWebhook } from "@/lib/webhook-forward";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { success: false, message: "Newsletter not configured" },
      { status: 503 }
    );
  }

  let body: {
    email?: string;
    consentPrivacy?: boolean;
    documentId?: string;
    branchName?: string;
    phone?: string;
    fullName?: string;
  };
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

  const result = await postJsonWebhook(webhookUrl, payload);
  if (!result.ok) {
    console.error("Newsletter webhook error:", result.status, result.body);
    return NextResponse.json(
      { success: false, message: "Webhook failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
