/** Mongo ObjectId from the legacy receipts app (24 hex chars). */
export const LEGACY_RECEIPT_MONGO_ID_RE = /^[0-9a-f]{24}$/i;

export function isLegacyReceiptMongoId(value: string): boolean {
  return LEGACY_RECEIPT_MONGO_ID_RE.test(value);
}

/** Parse legacy receipts host paths: /{mongoId} or /{mongoId}/pdf */
export function parseLegacyReceiptPath(pathname: string): {
  legacyMongoId: string;
  pdf: boolean;
} | null {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  const match = trimmed.match(/^\/([^/]+)(?:\/(pdf))?$/i);
  if (!match) return null;

  const legacyMongoId = match[1].toLowerCase();
  if (!isLegacyReceiptMongoId(legacyMongoId)) return null;

  return { legacyMongoId, pdf: match[2]?.toLowerCase() === "pdf" };
}

/** Resolve legacy Mongo _id → current documents.id via Supabase REST (anon read). */
export async function lookupDocumentIdByLegacyMongoId(
  legacyMongoId: string,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<string | null> {
  const base = supabaseUrl.replace(/\/$/, "");
  const params = new URLSearchParams({
    select: "id",
    "payload->>legacy_mongo_id": `eq.${legacyMongoId}`,
    limit: "1",
  });

  const res = await fetch(`${base}/rest/v1/documents?${params}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!res.ok) {
    console.error("legacy receipt lookup failed:", res.status, await res.text());
    return null;
  }

  const rows = (await res.json()) as Array<{ id: string }>;
  return rows[0]?.id ?? null;
}
