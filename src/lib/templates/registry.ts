import { TEMPLATE_IDS, type TemplateId } from "@/constants/templates";
import { assertAllowedBranchId, getBranchName } from "@/lib/allowed-branches";
import type { CustomerSurveyPayload } from "@/types/customer-survey";
import type { DeliveryAddressPayload } from "@/types/delivery-address";
import type { CreateDocumentPayload } from "@/types/document";
import { payloadTypeToDbType } from "@/types/document";
import {
  customerSurveyPayloadSchema,
  deliveryAddressPayloadSchema,
  receiptPayloadSchema,
} from "./schemas";

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
      templateId: typeof TEMPLATE_IDS.deliveryAddress;
      payload: DeliveryAddressPayload;
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
    if (r.data.branch_id != null && String(r.data.branch_id).trim() !== "") {
      const branchCheck = assertAllowedBranchId(r.data.branch_id, "branch_id");
      if (!branchCheck.ok) return branchCheck;
      return {
        ok: true,
        templateId: TEMPLATE_IDS.customerSurvey,
        payload: { ...r.data, branch_id: branchCheck.branchId },
        dbType: "receipt",
      };
    }
    return {
      ok: true,
      templateId: TEMPLATE_IDS.customerSurvey,
      payload: r.data,
      dbType: "receipt",
    };
  }

  if (templateIdRaw === TEMPLATE_IDS.deliveryAddress) {
    const r = deliveryAddressPayloadSchema.safeParse(raw);
    if (!r.success) {
      return {
        ok: false,
        message:
          r.error.issues.map((i) => i.message).join("; ") || "Invalid delivery address payload",
      };
    }
    if (r.data.branch_id != null && String(r.data.branch_id).trim() !== "") {
      const branchCheck = assertAllowedBranchId(r.data.branch_id, "branch_id");
      if (!branchCheck.ok) return branchCheck;
      const { action: _action, ...stored } = r.data;
      return {
        ok: true,
        templateId: TEMPLATE_IDS.deliveryAddress,
        payload: { ...stored, branch_id: branchCheck.branchId },
        dbType: "delivery_note",
      };
    }
    const { action: _action, ...stored } = r.data;
    return {
      ok: true,
      templateId: TEMPLATE_IDS.deliveryAddress,
      payload: stored,
      dbType: "delivery_note",
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

  const branchCheck = assertAllowedBranchId(r.data.BranchID, "BranchID");
  if (!branchCheck.ok) return branchCheck;

  const merged = {
    ...(raw as Record<string, unknown>),
    template_id: TEMPLATE_IDS.receipt,
    Items: r.data.Items,
    BranchID: branchCheck.branchId,
  } as unknown as CreateDocumentPayload;

  if (!merged.BranchName?.trim()) {
    const mapped = getBranchName(branchCheck.branchId);
    if (mapped) merged.BranchName = mapped;
  }

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
  if (row.template_id === TEMPLATE_IDS.deliveryAddress) {
    return TEMPLATE_IDS.deliveryAddress;
  }
  const p = row.payload as Record<string, unknown> | undefined;
  if (p?.template_id === TEMPLATE_IDS.customerSurvey) {
    return TEMPLATE_IDS.customerSurvey;
  }
  if (p?.template_id === TEMPLATE_IDS.deliveryAddress) {
    return TEMPLATE_IDS.deliveryAddress;
  }
  return TEMPLATE_IDS.receipt;
}
