/**
 * Branch IDs allowed for new document creation via POST /api/documents.
 * Historical imports may include other BranchIDs; those are not creatable going forward.
 */
export const ALLOWED_BRANCH_IDS = [
  "800", // ירכא
  "1000", // ראשון לציון
  "3000", // אתר אינטרנט
  "5000", // נתניה
  "6000", // עסקאות טלפוניות
  "7000", // בני ברק
  "9000", // קרית אתא
  "10000", // איירפורט סיטי
  "12000", // סגולה פ"ת
  "14000", // באר שבע
] as const;

export type AllowedBranchId = (typeof ALLOWED_BRANCH_IDS)[number];

/** Display names for known branch IDs (POS often sends BranchID without BranchName). */
export const BRANCH_NAMES: Record<AllowedBranchId, string> = {
  "800": "ירכא",
  "1000": "ראשון לציון",
  "3000": "אתר אינטרנט",
  "5000": "נתניה",
  "6000": "עסקאות טלפוניות",
  "7000": "בני ברק",
  "9000": "קרית אתא",
  "10000": "איירפורט סיטי",
  "12000": 'סגולה פ"ת',
  "14000": "באר שבע",
};

const ALLOWED_SET = new Set<string>(ALLOWED_BRANCH_IDS);

/** Normalize numeric-looking ids (e.g. "3000.0" → "3000"). */
export function normalizeBranchId(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  const n = Number(s);
  if (Number.isFinite(n) && Number.isInteger(n)) return String(n);
  if (Number.isFinite(n) && Math.abs(n - Math.trunc(n)) < 1e-9) {
    return String(Math.trunc(n));
  }
  return s;
}

export function isAllowedBranchId(raw: string | undefined | null): boolean {
  if (raw == null) return false;
  const id = normalizeBranchId(String(raw));
  if (!id) return false;
  return ALLOWED_SET.has(id);
}

export function assertAllowedBranchId(
  raw: string | undefined | null,
  fieldName: string
): { ok: true; branchId: string } | { ok: false; message: string } {
  if (raw == null || String(raw).trim() === "") {
    return { ok: false, message: `${fieldName} is required` };
  }
  const branchId = normalizeBranchId(String(raw));
  if (!ALLOWED_SET.has(branchId)) {
    return {
      ok: false,
      message: `${fieldName} "${branchId}" is not an allowed branch`,
    };
  }
  return { ok: true, branchId };
}

export function getBranchName(branchId: string | undefined | null): string | null {
  if (branchId == null || String(branchId).trim() === "") return null;
  const id = normalizeBranchId(String(branchId));
  return BRANCH_NAMES[id as AllowedBranchId] ?? null;
}

export function resolveBranchDisplayName(payload: {
  BranchName?: string;
  BranchID?: string;
}): string {
  const name = payload.BranchName?.trim();
  if (name) return name;
  const fromId = getBranchName(payload.BranchID);
  if (fromId) return fromId;
  return payload.BranchID?.trim() ?? "";
}
