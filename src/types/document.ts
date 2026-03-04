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
