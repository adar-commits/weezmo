import { NextRequest, NextResponse } from "next/server";
import {
  isDocumentsApiAuthorized,
  toDocumentApiDetail,
} from "@/lib/documents-api";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function resolveInvoiceNumber(req: NextRequest): string | null {
  const sp = req.nextUrl.searchParams;
  const raw =
    sp.get("InvoiceNumber") ??
    sp.get("invoice_number") ??
    sp.get("invoiceNumber");
  if (raw == null) return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

export async function GET(req: NextRequest) {
  if (!isDocumentsApiAuthorized(req)) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const invoiceNumber = resolveInvoiceNumber(req);
  if (!invoiceNumber) {
    return NextResponse.json(
      { status: "error", message: "InvoiceNumber query parameter is required" },
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

  const { data, error } = await supabase
    .from("documents")
    .select("id, created_at, template_id, type, branch_id, customer_name, customer_phone, payload")
    .eq("payload->>InvoiceNumber", invoiceNumber)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase receipt lookup error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to lookup document" },
      { status: 500 }
    );
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return NextResponse.json(
      { status: "error", message: "Document not found", invoice_number: invoiceNumber },
      { status: 404 }
    );
  }

  const results = rows.map((row) => toDocumentApiDetail(row));

  return NextResponse.json({
    status: "success",
    data: {
      invoice_number: invoiceNumber,
      count: results.length,
      results,
    },
  });
}
