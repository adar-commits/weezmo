import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReceiptPdfDocument } from "@/components/ReceiptPdfDocument";
import { TEMPLATE_IDS } from "@/constants/templates";
import { resolveTemplateFromRow } from "@/lib/templates/registry";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("template_id, payload")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const templateId = resolveTemplateFromRow(data);
  if (templateId === TEMPLATE_IDS.customerSurvey) {
    return NextResponse.json(
      { error: "PDF is not available for this document type" },
      { status: 404 }
    );
  }

  const payload = data.payload as Record<string, unknown>;
  try {
    const el = React.createElement(ReceiptPdfDocument, {
      payload: payload as Parameters<typeof ReceiptPdfDocument>[0]["payload"],
    });
    const buffer = await renderToBuffer(el as Parameters<typeof renderToBuffer>[0]);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document-${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF render error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
