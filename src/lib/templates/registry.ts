import { TEMPLATE_IDS, type TemplateId } from "@/constants/templates";
import type { CustomerSurveyPayload } from "@/types/customer-survey";
import type { CreateDocumentPayload } from "@/types/document";
import { payloadTypeToDbType } from "@/types/document";
import { customerSurveyPayloadSchema, receiptPayloadSchema } from "./schemas";

export type DbDocumentType = "receipt" | "invoice" | "delivery_note";

export type ParsedCreateSuccess =
  | {
      ok: true;
      templateId: typeof TEMPLATE_IDS.customerSurvey;
      payload: CustomerSurveyPayload;
      dbType: DbDocumentType;
    }
  | {
      ok: true;
      templateId: typeof TEMPLATE_IDS.receipt;
      payload: CreateDocumentPayload;
      dbType: DbDocumentType;
    };

export type ParsedCreate = ParsedCreateSuccess | { ok: false; message: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Validates POST /api/documents JSON and picks template-specific schema.
 * Backward compatible: omit `template_id` and send `Items` → receipt.
 */
export function parseCreateDocumentBody(raw: unknown): ParsedCreate {
  if (!isRecord(raw)) {
    return { ok: false, message: "Body must be a JSON object" };
  }

  const templateIdRaw = raw.template_id;

  if (templateIdRaw === TEMPLATE_IDS.customerSurvey) {
    const r = customerSurveyPayloadSchema.safeParse(raw);
    if (!r.success) {
      return {
        ok: false,
        message: r.error.issues.map((i) => i.message).join("; ") || "Invalid survey payload",
      };
    }
    return {
      ok: true,
      templateId: TEMPLATE_IDS.customerSurvey,
      payload: r.data,
      dbType: "receipt",
    };
  }

  if (
    templateIdRaw != null &&
    templateIdRaw !== "" &&
    templateIdRaw !== TEMPLATE_IDS.receipt
  ) {
    return {
      ok: false,
      message: `Unknown template_id: ${String(templateIdRaw)}`,
    };
  }

  const r = receiptPayloadSchema.safeParse(raw);
  if (!r.success) {
    return {
      ok: false,
      message: r.error.issues.map((i) => i.message).join("; ") || "Invalid receipt payload",
    };
  }

  const merged = {
    ...(raw as Record<string, unknown>),
    template_id: TEMPLATE_IDS.receipt,
    Items: r.data.Items,
  } as unknown as CreateDocumentPayload;

  return {
    ok: true,
    templateId: TEMPLATE_IDS.receipt,
    payload: merged,
    dbType: payloadTypeToDbType(merged.type),
  };
}

/**
 * Resolve template from DB row (supports legacy rows without `template_id` column
 * by reading `payload.template_id`).
 */
export function resolveTemplateFromRow(row: {
  template_id?: string | null;
  payload?: unknown;
}): TemplateId {
  if (row.template_id === TEMPLATE_IDS.customerSurvey) {
    return TEMPLATE_IDS.customerSurvey;
  }
  const p = row.payload as Record<string, unknown> | undefined;
  if (p?.template_id === TEMPLATE_IDS.customerSurvey) {
    return TEMPLATE_IDS.customerSurvey;
  }
  return TEMPLATE_IDS.receipt;
}
