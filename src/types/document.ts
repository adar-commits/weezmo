export interface DocumentItem {
  ItemQTY: number;
  ItemSKU: string;
  ItemPrice: number;
  ItemDescription: string;
}

export interface CreateDocumentPayload {
  InvoiceNumber?: string;
  BranchID?: string;
  BranchName?: string;
  PrintDate?: string;
  SalesRepresentative?: string;
  CustomerName?: string;
  CustomerPhone?: string;
  CustomerEmail?: string;
  Items: DocumentItem[];
  TotalPrice: number;
  type?: string;
  paymentType?: string;
  discount?: number;
  coupons?: unknown[];
  VAT?: number;
  BranchFeedbackUrl?: string;
}

/** Map display type (e.g. "חשבונית מס") to DB type for schema */
export function payloadTypeToDbType(displayType?: string): "receipt" | "invoice" | "delivery_note" {
  if (!displayType) return "receipt";
  const t = displayType.toLowerCase();
  if (t.includes("חשבונית") || t.includes("invoice")) return "invoice";
  if (t.includes("משלוח") || t.includes("delivery")) return "delivery_note";
  return "receipt";
}

/** Hebrew label for document header/PDF — uses payload.type when provided. */
export function resolveDocumentTypeLabel(displayType?: string): string {
  const t = displayType?.trim();
  if (!t) return "קבלה";
  const lower = t.toLowerCase();
  if (lower === "invoice") return "חשבונית מס";
  if (lower === "receipt") return "קבלה";
  if (lower === "delivery_note") return "תעודת משלוח";
  return t;
}

/** Visible heading / browser tab for a receipt-style document. */
export function formatDocumentHeading(payload: Pick<CreateDocumentPayload, "type" | "InvoiceNumber">): string {
  const type = resolveDocumentTypeLabel(payload.type);
  const num = payload.InvoiceNumber?.trim();
  return num ? `${type} ${num}` : type;
}
