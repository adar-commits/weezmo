import type { CustomerSurveyPayload } from "@/types/customer-survey";

type DocumentRow = {
  branch_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
};

export function resolveSurveyOrderId(payload: CustomerSurveyPayload): string | null {
  const meta = payload.metadata ?? {};
  const fromMeta =
    typeof meta.order_id === "string"
      ? meta.order_id
      : typeof meta.orderId === "string"
        ? meta.orderId
        : null;
  return payload.order_id ?? fromMeta ?? null;
}

export function resolveSurveyBranchId(
  row: DocumentRow,
  payload: CustomerSurveyPayload
): string | null {
  if (row.branch_id != null && String(row.branch_id).trim() !== "") {
    return String(row.branch_id);
  }
  const meta = payload.metadata ?? {};
  const m =
    typeof meta.branch_id === "string"
      ? meta.branch_id
      : typeof meta.branchId === "string"
        ? meta.branchId
        : null;
  return payload.branch_id ?? m ?? null;
}

export function resolveSurveyCustomerName(
  row: DocumentRow,
  payload: CustomerSurveyPayload
): string | null {
  if (row.customer_name != null && String(row.customer_name).trim() !== "") {
    return String(row.customer_name);
  }
  return payload.customer_name ?? null;
}

export function resolveSurveyCustomerPhone(
  row: DocumentRow,
  payload: CustomerSurveyPayload
): string | null {
  if (row.customer_phone != null && String(row.customer_phone).trim() !== "") {
    return String(row.customer_phone);
  }
  return payload.customer_phone ?? null;
}
