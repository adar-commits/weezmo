import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReceiptDocumentView } from "@/components/ReceiptDocumentView";
import { TEMPLATE_IDS } from "@/constants/templates";
import { resolveTemplateFromRow } from "@/lib/templates/registry";
import type { CreateDocumentPayload } from "@/types/document";
import type { CustomerSurveyPayload } from "@/types/customer-survey";
import { DocumentPageShell } from "@/components/DocumentPageShell";
import { CustomerSurveyView } from "./CustomerSurveyView";
import "./document-page.css";
import "./survey-page.css";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("template_id, payload")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const templateId = resolveTemplateFromRow(data);

  if (templateId === TEMPLATE_IDS.customerSurvey) {
    return (
      <DocumentPageShell survey>
        <CustomerSurveyView documentId={id} payload={data.payload as CustomerSurveyPayload} />
      </DocumentPageShell>
    );
  }

  return (
    <DocumentPageShell>
      <ReceiptDocumentView documentId={id} payload={data.payload as CreateDocumentPayload} />
    </DocumentPageShell>
  );
}
