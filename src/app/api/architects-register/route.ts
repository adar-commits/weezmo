import { NextRequest, NextResponse } from "next/server";
import { postJsonWebhook } from "@/lib/webhook-forward";

const ARCHITECTS_WEBHOOK_URL =
  process.env.ARCHITECTS_WEBHOOK_URL ??
  "https://hook.eu2.make.com/vqahqgxvmpdue35jfxnt8c2l1wm7lc8e";

type ArchitectsEntry = {
  fullName?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  vatNo?: string;
  businessAdress?: string;
  city?: string;
  activityType?: string;
  designType?: string;
  specializationType?: string;
  professionalSeniority?: string;
  birthDate?: string;
  designerOrigin?: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeEntry(raw: unknown): ArchitectsEntry | null {
  if (!raw || typeof raw !== "object") return null;

  const entry = raw as ArchitectsEntry;
  const fullName = isNonEmptyString(entry.fullName) ? entry.fullName.trim() : "";
  const phone = isNonEmptyString(entry.phone) ? entry.phone.trim() : "";
  const email = isNonEmptyString(entry.email) ? entry.email.trim() : "";
  const businessName = isNonEmptyString(entry.businessName) ? entry.businessName.trim() : "";
  const vatNo = isNonEmptyString(entry.vatNo) ? entry.vatNo.trim() : "";
  const businessAdress = isNonEmptyString(entry.businessAdress)
    ? entry.businessAdress.trim()
    : "";
  const city = isNonEmptyString(entry.city) ? entry.city.trim() : "";
  const activityType = isNonEmptyString(entry.activityType) ? entry.activityType.trim() : "";
  const designType = isNonEmptyString(entry.designType) ? entry.designType.trim() : "";
  const specializationType = isNonEmptyString(entry.specializationType)
    ? entry.specializationType.trim()
    : "";

  if (
    !fullName ||
    !phone ||
    !email ||
    !businessName ||
    !vatNo ||
    !businessAdress ||
    !city ||
    !activityType ||
    !designType ||
    !specializationType
  ) {
    return null;
  }

  const normalized: ArchitectsEntry = {
    fullName,
    phone,
    email,
    businessName,
    vatNo,
    businessAdress,
    city,
    activityType,
    designType,
    specializationType,
  };

  if (isNonEmptyString(entry.professionalSeniority)) {
    normalized.professionalSeniority = entry.professionalSeniority.trim();
  }
  if (isNonEmptyString(entry.birthDate)) {
    normalized.birthDate = entry.birthDate.trim();
  }
  if (isNonEmptyString(entry.designerOrigin)) {
    normalized.designerOrigin = entry.designerOrigin.trim();
  }

  return normalized;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const entries = Array.isArray(body) ? body : [body];
  const normalized = entries.map(normalizeEntry).filter((entry): entry is ArchitectsEntry => !!entry);

  if (normalized.length === 0) {
    return NextResponse.json(
      { success: false, message: "Required fields missing" },
      { status: 400 }
    );
  }

  const result = await postJsonWebhook(ARCHITECTS_WEBHOOK_URL, normalized);
  if (!result.ok) {
    console.error("Architects webhook error:", result.status, result.body);
    return NextResponse.json(
      { success: false, message: "Webhook failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
