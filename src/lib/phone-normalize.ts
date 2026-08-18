/** Normalize Israeli phone numbers for dedup lookups (digits-only local form). */
export function normalizePhoneForDedup(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("972") && digits.length >= 11) {
    return `0${digits.slice(3)}`;
  }
  if (digits.length === 9) {
    return `0${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return digits;
  }

  return digits;
}

/** Variants to match legacy rows stored with different formatting. */
export function phoneDedupCandidates(phone: string): string[] {
  const normalized = normalizePhoneForDedup(phone);
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  const out = new Set<string>();
  if (normalized) out.add(normalized);
  if (trimmed) out.add(trimmed);
  if (digits) out.add(digits);
  if (normalized?.startsWith("0")) {
    out.add(normalized.slice(1));
    out.add(`972${normalized.slice(1)}`);
  }

  return [...out];
}
