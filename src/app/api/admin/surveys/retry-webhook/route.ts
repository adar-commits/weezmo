import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { postJsonWebhook } from "@/lib/webhook-forward";
import { resolveTemplateFromRow } from "@/lib/templates/registry";
import { TEMPLATE_IDS } from "@/constants/templates";
import type { CustomerSurveyPayload } from "@/types/customer-survey";
import { buildSurveySubmitWebhookBody } from "@/lib/survey-webhook-payload";
import { computeSurveyAverageScore } from "@/lib/survey-score";

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl = process.env.SURVEY_SUBMIT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return NextResponse.json({ message: "SURVEY_SUBMIT_WEBHOOK_URL not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const responseId = typeof (body as { responseId?: unknown }).responseId === "string"
    ? (body as { responseId: string }).responseId.trim()
    : "";
  if (!responseId) {
    return NextResponse.json({ message: "responseId required" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data: resp, error: rErr } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("id", responseId)
    .maybeSingle();

  if (rErr || !resp) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const documentId = resp.document_id as string;
  const { data: doc, error: dErr } = await supabase
    .from("documents")
    .select("template_id, payload, branch_id, customer_name, customer_phone")
    .eq("id", documentId)
    .single();

  if (dErr || !doc) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  if (resolveTemplateFromRow(doc) !== TEMPLATE_IDS.customerSurvey) {
    return NextResponse.json({ message: "Not a survey document" }, { status: 400 });
  }

  const payload = doc.payload as CustomerSurveyPayload;
  const answers = resp.answers as Record<string, unknown>;
  const avgScore =
    typeof resp.avg_score === "number" ? resp.avg_score : computeSurveyAverageScore(answers);

  const forward = buildSurveySubmitWebhookBody({
    documentId,
    responseId,
    payload,
    row: doc,
    answers: answers as Record<string, number>,
    avgScore,
    submittedAt: resp.submitted_at as string,
  });

  const result = await postJsonWebhook(webhookUrl, forward);
  if (!result.ok) {
    await supabase
      .from("survey_responses")
      .update({
        webhook_status: "failed",
        webhook_error: `${result.status}: ${result.body.slice(0, 500)}`,
      })
      .eq("id", responseId);
    return NextResponse.json({ message: "Webhook failed" }, { status: 502 });
  }

  await supabase
    .from("survey_responses")
    .update({ webhook_status: "ok", webhook_error: null })
    .eq("id", responseId);

  return NextResponse.json({ success: true });
}
