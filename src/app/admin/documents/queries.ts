import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TEMPLATE_IDS } from "@/constants/templates";

export const ADMIN_DOCUMENTS_PAGE_SIZE = 40;

export type AdminDocumentListRow = {
  id: string;
  created_at: string;
  template_id: string;
  type: string | null;
  branch_id: string | null;
};

export type AdminDocumentTemplateFilter = "all" | "receipt" | "customer_survey";

function publicBaseUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL;
  if (u && u.trim()) {
    return u.trim().startsWith("http") ? u.trim().replace(/\/$/, "") : `https://${u.trim().replace(/\/$/, "")}`;
  }
  return "https://weezmo.vercel.app";
}

export function getPublicDocumentUrl(id: string): string {
  return `${publicBaseUrl()}/documents/${id}`;
}

export async function listAdminDocuments(
  page: number,
  template: AdminDocumentTemplateFilter
): Promise<{ rows: AdminDocumentListRow[]; total: number }> {
  const sb = createServerSupabaseClient();
  const offset = Math.max(0, (page - 1) * ADMIN_DOCUMENTS_PAGE_SIZE);

  let q = sb
    .from("documents")
    .select("id, created_at, template_id, type, branch_id", { count: "exact" });

  if (template === TEMPLATE_IDS.receipt) {
    q = q.eq("template_id", TEMPLATE_IDS.receipt);
  } else if (template === TEMPLATE_IDS.customerSurvey) {
    q = q.eq("template_id", TEMPLATE_IDS.customerSurvey);
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(offset, offset + ADMIN_DOCUMENTS_PAGE_SIZE - 1);

  if (error) {
    console.error("listAdminDocuments", error.message);
    return { rows: [], total: 0 };
  }

  return { rows: (data as AdminDocumentListRow[]) ?? [], total: count ?? 0 };
}
