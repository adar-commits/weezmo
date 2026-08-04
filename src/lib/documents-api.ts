import type { NextRequest } from "next/server";
import { resolveBranchDisplayName } from "@/lib/allowed-branches";
import type { CreateDocumentPayload } from "@/types/document";
import { getPublicDocumentUrl } from "@/lib/public-urls";
import { resolveTemplateFromRow } from "@/lib/templates/registry";
import { TEMPLATE_IDS } from "@/constants/templates";

export function getDocumentsApiKeyFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.headers.get("x-api-key");
}

export function isDocumentsApiAuthorized(req: NextRequest): boolean {
  const expectedKey = process.env.DOCUMENTS_API_KEY;
  if (!expectedKey) return false;
  return getDocumentsApiKeyFromRequest(req) === expectedKey;
}

export type DocumentApiResult = {
  id: string;
  link: string;
  created_at: string;
  template_id: string;
  total_price: number | null;
  invoice_number: string | null;
  branchid: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
};

type DocumentRow = {
  id: string;
  created_at: string;
  template_id?: string | null;
  type?: string | null;
  branch_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  payload?: unknown;
};

export type DocumentApiDetail = DocumentApiResult & {
  type: string | null;
  branch_id: string | null;
  customer_name: string | null;
  branchName: string | null;
  payload: unknown;
  pdf_link: string | null;
};

function asRecord(v: unknown): Record<string, unknown> | undefined {
  return typeof v === "object" && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined;
}

export function resolveDocumentBranchId(row: {
  branch_id?: string | null;
  payload?: unknown;
}): string | null {
  if (row.branch_id != null && String(row.branch_id).trim() !== "") {
    return String(row.branch_id).trim();
  }
  const p = asRecord(row.payload);
  const raw = p?.BranchID ?? p?.branch_id ?? p?.branchId;
  if (raw != null && String(raw).trim() !== "") return String(raw).trim();
  return null;
}

export function resolveDocumentTotalPrice(payload: unknown): number | null {
  const p = asRecord(payload);
  const raw = p?.TotalPrice ?? p?.total_price;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function resolveDocumentInvoiceNumber(payload: unknown): string | null {
  const p = asRecord(payload);
  const raw = p?.InvoiceNumber ?? p?.invoice_number;
  if (raw != null && String(raw).trim() !== "") return String(raw).trim();
  return null;
}

export function resolveDocumentCustomerPhone(row: {
  customer_phone?: string | null;
  payload?: unknown;
}): string | null {
  if (row.customer_phone != null && String(row.customer_phone).trim() !== "") {
    return String(row.customer_phone).trim();
  }
  const p = asRecord(row.payload);
  const raw = p?.CustomerPhone ?? p?.customer_phone ?? p?.customerPhone;
  if (raw != null && String(raw).trim() !== "") return String(raw).trim();
  return null;
}

export function resolveDocumentCustomerEmail(payload: unknown): string | null {
  const p = asRecord(payload);
  const raw = p?.CustomerEmail ?? p?.customer_email ?? p?.customerEmail;
  if (raw != null && String(raw).trim() !== "") return String(raw).trim();
  return null;
}

export function toDocumentApiResult(row: DocumentRow): DocumentApiResult {
  const templateId = resolveTemplateFromRow(row);
  return {
    id: row.id,
    link: getPublicDocumentUrl(templateId, row.id),
    created_at: row.created_at,
    template_id: templateId,
    total_price: resolveDocumentTotalPrice(row.payload),
    invoice_number: resolveDocumentInvoiceNumber(row.payload),
    branchid: resolveDocumentBranchId(row),
    customerPhone: resolveDocumentCustomerPhone(row),
    customerEmail: resolveDocumentCustomerEmail(row.payload),
  };
}

export function toDocumentApiDetail(row: DocumentRow): DocumentApiDetail {
  const summary = toDocumentApiResult(row);
  const templateId = resolveTemplateFromRow(row);
  const payload = asRecord(row.payload) ?? row.payload ?? {};
  const receiptPayload = payload as CreateDocumentPayload;

  return {
    ...summary,
    type: row.type ?? null,
    branch_id: row.branch_id ?? null,
    customer_name: row.customer_name ?? receiptPayload.CustomerName ?? null,
    branchName: resolveBranchDisplayName(receiptPayload) || null,
    payload,
    pdf_link:
      templateId === TEMPLATE_IDS.receipt
        ? `${summary.link}/pdf`
        : null,
  };
}

export function receiptDenormFromPayload(payload: CreateDocumentPayload): {
  branch_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
} {
  return {
    branch_id: payload.BranchID?.trim() ? payload.BranchID.trim() : null,
    customer_name: payload.CustomerName?.trim() ? payload.CustomerName.trim() : null,
    customer_phone: payload.CustomerPhone?.trim() ? payload.CustomerPhone.trim() : null,
  };
}

export const DOCUMENTS_API_DEFAULT_PAGE_SIZE = 50;
export const DOCUMENTS_API_MAX_PAGE_SIZE = 100;
