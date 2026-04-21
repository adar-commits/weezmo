/**
 * Comma-separated admin emails (case-insensitive). If unset or empty, no logins are allowed.
 * Set `*` to allow any authenticated user (dev only).
 */
export function parseAdminEmailAllowlist(raw: string | undefined): string[] | "*" {
  if (!raw || !raw.trim()) return [];
  if (raw.trim() === "*") return "*";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowlisted(email: string | undefined | null): boolean {
  if (!email) return false;
  const list = parseAdminEmailAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST);
  if (list === "*") return true;
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}
