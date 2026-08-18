import { NextRequest, NextResponse } from "next/server";
import { TEMPLATE_IDS } from "@/constants/templates";
import {
  DOCUMENTS_API_DEFAULT_PAGE_SIZE,
  DOCUMENTS_API_MAX_PAGE_SIZE,
  isDocumentsApiAuthorized,
  receiptDenormFromPayload,
  toDocumentApiResult,
} from "@/lib/documents-api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicDocumentUrl } from "@/lib/public-urls";
import { parseCreateDocumentBody } from "@/lib/templates/registry";
import type { CreateDocumentPayload } from "@/types/document";

function unauthorized() {
  return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
}

function parsePositiveInt(raw: string | null, fallback: number, max?: number): number {
  const n = parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  if (max != null && n > max) return max;
  return n;
}

export async function GET(req: NextRequest) {
  if (!isDocumentsApiAuthorized(req)) {
    return unauthorized();
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch (e) {
    console.error("Supabase client init failed:", e);
    return NextResponse.json(
      { status: "error", message: "Server configuration error (Supabase not configured)" },
      { status: 500 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const page = parsePositiveInt(sp.get("page"), 1);
  const pageSize = parsePositiveInt(
    sp.get("pageSize") ?? sp.get("limit"),
    DOCUMENTS_API_DEFAULT_PAGE_SIZE,
    DOCUMENTS_API_MAX_PAGE_SIZE
  );
  const branchid = sp.get("branchid") ?? sp.get("branch_id") ?? sp.get("BranchID");
  const invoiceNumber = sp.get("invoice_number") ?? sp.get("invoiceNumber") ?? sp.get("InvoiceNumber");
  const templateId = sp.get("template_id") ?? sp.get("template");

  const offset = (page - 1) * pageSize;

  let q = supabase
    .from("documents")
    .select("id, created_at, template_id, branch_id, customer_phone, payload", { count: "exact" });

  if (templateId === TEMPLATE_IDS.receipt || templateId === TEMPLATE_IDS.customerSurvey || templateId === TEMPLATE_IDS.deliveryAddress) {
    q = q.eq("template_id", templateId);
  }

  if (branchid?.trim()) {
    const id = branchid.trim();
    q = q.or(`branch_id.eq.${id},payload->>BranchID.eq.${id}`);
  }

  if (invoiceNumber?.trim()) {
    q = q.eq("payload->>InvoiceNumber", invoiceNumber.trim());
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Supabase list documents error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to list documents" },
      { status: 500 }
    );
  }

  const results = (data ?? []).map((row) => toDocumentApiResult(row));
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({
    status: "success",
    data: {
      results,
      total,
      page,
      pageSize,
      totalPages,
    },
  });
}

export async function POST(req: NextRequest) {
  if (!isDocumentsApiAuthorized(req)) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = parseCreateDocumentBody(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { status: "error", message: parsed.message },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch (e) {
    console.error("Supabase client init failed:", e);
    return NextResponse.json(
      { status: "error", message: "Server configuration error (Supabase not configured)" },
      { status: 500 }
    );
  }

  const insertRow: Record<string, unknown> = {
    template_id: parsed.templateId,
    type: parsed.dbType,
    payload: parsed.payload as unknown as Record<string, unknown>,
  };

  if (parsed.templateId === TEMPLATE_IDS.customerSurvey) {
    const p = parsed.payload;
    insertRow.branch_id = p.branch_id ?? null;
    insertRow.customer_name = p.customer_name ?? null;
    insertRow.customer_phone = p.customer_phone ?? null;
  } else if (parsed.templateId === TEMPLATE_IDS.deliveryAddress) {
    const p = parsed.payload;
    insertRow.branch_id = p.branch_id ?? null;
    insertRow.customer_name = p.full_name?.trim() || null;
    insertRow.customer_phone = p.phone?.trim() || null;
  } else if (parsed.templateId === TEMPLATE_IDS.receipt) {
    const denorm = receiptDenormFromPayload(parsed.payload as CreateDocumentPayload);
    insertRow.branch_id = denorm.branch_id;
    insertRow.customer_name = denorm.customer_name;
    insertRow.customer_phone = denorm.customer_phone;
  }

  const { data: row, error } = await supabase
    .from("documents")
    .insert(insertRow)
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create document" },
      { status: 500 }
    );
  }

  const link = getPublicDocumentUrl(parsed.templateId, row.id);
  const summary = toDocumentApiResult({
    id: row.id,
    created_at: new Date().toISOString(),
    template_id: parsed.templateId,
    branch_id: insertRow.branch_id as string | null,
    customer_phone: insertRow.customer_phone as string | null,
    payload: parsed.payload,
  });

  return NextResponse.json({
    status: "success",
    data: {
      data: {
        ...(parsed.payload as object),
        id: row.id,
      },
      link,
      total_price: summary.total_price,
      invoice_number: summary.invoice_number,
      branchid: summary.branchid,
      customerPhone: summary.customerPhone,
      customerEmail: summary.customerEmail,
    },
  });
}
