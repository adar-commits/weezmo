import { NextRequest, NextResponse } from "next/server";
import { isValidOrderId, parseOrderTrackingPayload } from "@/lib/order-tracking/schema";

const GENERIC_ERROR = "לא ניתן לטעון את פרטי ההזמנה. נא לנסות שוב מאוחר יותר.";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.ORDER_TRACKING_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ message: GENERIC_ERROR }, { status: 503 });
  }

  let body: { orderID?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: GENERIC_ERROR }, { status: 400 });
  }

  const orderID = typeof body.orderID === "string" ? body.orderID.trim() : "";
  if (!orderID || !isValidOrderId(orderID)) {
    return NextResponse.json({ message: GENERIC_ERROR }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID }),
    });
  } catch (err) {
    console.error("Order tracking webhook fetch failed:", err);
    return NextResponse.json({ message: GENERIC_ERROR }, { status: 502 });
  }

  let raw: unknown;
  try {
    raw = await res.json();
  } catch {
    console.error("Order tracking webhook returned non-JSON:", res.status);
    return NextResponse.json({ message: GENERIC_ERROR }, { status: 502 });
  }

  if (!res.ok) {
    console.error("Order tracking webhook error:", res.status, raw);
    return NextResponse.json({ message: GENERIC_ERROR }, { status: 502 });
  }

  const payload = parseOrderTrackingPayload(raw);
  if (!payload) {
    console.error("Order tracking invalid payload:", raw);
    return NextResponse.json({ message: GENERIC_ERROR }, { status: 502 });
  }

  return NextResponse.json(payload);
}
