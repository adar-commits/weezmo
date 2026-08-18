import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TEMPLATE_IDS } from "@/constants/templates";
import {
  buildDeliveryAddressWebhookBody,
  DELIVERY_ADDRESS_WEBHOOK_URL,
} from "@/lib/delivery-address-webhook";
import { postJsonWebhook } from "@/lib/webhook-forward";
import { resolveTemplateFromRow } from "@/lib/templates/registry";
import type { DeliveryAddressFormValues, DeliveryAddressPayload } from "@/types/delivery-address";

function isValidAddress(v: unknown): v is DeliveryAddressFormValues {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  const required = ["full_name", "street", "house_number", "city", "phone"] as const;
  for (const key of required) {
    if (typeof o[key] !== "string" || !o[key].trim()) return false;
  }
  const optional = ["floor", "apartment", "delivery_instructions"] as const;
  for (const key of optional) {
    if (o[key] != null && typeof o[key] !== "string") return false;
  }
  return true;
}

function normalizeAddress(raw: DeliveryAddressFormValues): DeliveryAddressFormValues {
  return {
    full_name: raw.full_name.trim(),
    street: raw.street.trim(),
    house_number: raw.house_number.trim(),
    city: raw.city.trim(),
    floor: raw.floor.trim(),
    apartment: raw.apartment.trim(),
    phone: raw.phone.trim(),
    delivery_instructions: raw.delivery_instructions.trim(),
  };
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const o = body as { documentId?: unknown; address?: unknown };
  const documentId = typeof o.documentId === "string" ? o.documentId.trim() : "";
  if (!documentId) {
    return NextResponse.json({ message: "documentId required" }, { status: 400 });
  }

  if (!isValidAddress(o.address)) {
    return NextResponse.json({ message: "Invalid or incomplete address" }, { status: 400 });
  }

  const address = normalizeAddress(o.address);

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch (e) {
    console.error("Supabase client init failed:", e);
    return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
  }

  const { data: row, error } = await supabase
    .from("documents")
    .select("template_id, payload, branch_id, customer_name, customer_phone")
    .eq("id", documentId)
    .single();

  if (error || !row) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const templateId = resolveTemplateFromRow(row);
  if (templateId !== TEMPLATE_IDS.deliveryAddress) {
    return NextResponse.json({ message: "Not a delivery address document" }, { status: 400 });
  }

  const payload = row.payload as DeliveryAddressPayload;

  const { data: existing } = await supabase
    .from("delivery_address_responses")
    .select("id")
    .eq("document_id", documentId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: "Already submitted" }, { status: 409 });
  }

  const orderId = payload.order_id?.trim() || null;
  const branchId = payload.branch_id?.trim() || row.branch_id?.trim() || null;

  const { data: inserted, error: insertErr } = await supabase
    .from("delivery_address_responses")
    .insert({
      document_id: documentId,
      address,
      order_id: orderId,
      branch_id: branchId,
      customer_name: address.full_name,
      customer_phone: address.phone,
      webhook_status: "pending",
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("delivery_address_responses insert error:", insertErr);
    return NextResponse.json({ message: "Failed to save response" }, { status: 500 });
  }

  const responseId = inserted.id as string;
  const forward = buildDeliveryAddressWebhookBody({
    documentId,
    responseId,
    payload,
    address,
  });

  const result = await postJsonWebhook(DELIVERY_ADDRESS_WEBHOOK_URL, forward);
  if (!result.ok) {
    console.error("Delivery address webhook error:", result.status, result.body);
    await supabase
      .from("delivery_address_responses")
      .update({
        webhook_status: "failed",
        webhook_error: `${result.status}: ${result.body.slice(0, 500)}`,
      })
      .eq("id", responseId);

    return NextResponse.json(
      {
        success: false,
        responseId,
        webhookStatus: "failed" as const,
        message: "Webhook failed",
      },
      { status: 502 }
    );
  }

  await supabase
    .from("delivery_address_responses")
    .update({ webhook_status: "ok", webhook_error: null })
    .eq("id", responseId);

  return NextResponse.json({
    success: true,
    responseId,
    webhookStatus: "ok" as const,
  });
}
