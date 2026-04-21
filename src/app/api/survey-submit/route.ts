import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TEMPLATE_IDS } from "@/constants/templates";
import { postJsonWebhook } from "@/lib/webhook-forward";
import { resolveTemplateFromRow } from "@/lib/templates/registry";
import type { CustomerSurveyPayload } from "@/types/customer-survey";
import { computeSurveyAverageScore } from "@/lib/survey-score";
import { buildSurveySubmitWebhookBody } from "@/lib/survey-webhook-payload";
import {
  resolveSurveyBranchId,
  resolveSurveyCustomerName,
  resolveSurveyCustomerPhone,
  resolveSurveyOrderId,
} from "@/lib/survey-denorm";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const o = body as { documentId?: unknown; answers?: unknown };
  const documentId = typeof o.documentId === "string" ? o.documentId.trim() : "";
  if (!documentId) {
    return NextResponse.json({ message: "documentId required" }, { status: 400 });
  }

  const answers = o.answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return NextResponse.json({ message: "answers object required" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch (e) {
    console.error("Supabase client init failed:", e);
    return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
  }

  const { data: row, error } = await supabase
    .from("documents")
    .select("template_id, payload, branch_id, customer_name, customer_phone")
    .eq("id", documentId)
    .single();

  if (error || !row) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const templateId = resolveTemplateFromRow(row);
  if (templateId !== TEMPLATE_IDS.customerSurvey) {
    return NextResponse.json({ message: "Not a survey document" }, { status: 400 });
  }

  const payload = row.payload as CustomerSurveyPayload;
  const ans = answers as Record<string, unknown>;

  for (const q of payload.questions) {
    if (!q.required) continue;
    const v = ans[q.id];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5) {
      return NextResponse.json(
        { message: `Missing or invalid rating for question: ${q.id}` },
        { status: 400 }
      );
    }
  }

  const avgScore = computeSurveyAverageScore(ans);
  const orderId = resolveSurveyOrderId(payload);
  const branchId = resolveSurveyBranchId(row, payload);
  const customerName = resolveSurveyCustomerName(row, payload);
  const customerPhone = resolveSurveyCustomerPhone(row, payload);

  const { data: inserted, error: insertErr } = await supabase
    .from("survey_responses")
    .insert({
      document_id: documentId,
      answers: ans as Record<string, number>,
      avg_score: avgScore,
      order_id: orderId,
      branch_id: branchId,
      customer_name: customerName,
      customer_phone: customerPhone,
      webhook_status: "pending",
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("survey_responses insert error:", insertErr);
    return NextResponse.json({ message: "Failed to save response" }, { status: 500 });
  }

  const responseId = inserted.id as string;
  const webhookUrl = process.env.SURVEY_SUBMIT_WEBHOOK_URL?.trim();

  const forward = buildSurveySubmitWebhookBody({
    documentId,
    responseId,
    payload,
    row,
    answers: ans as Record<string, number>,
    avgScore,
  });

  if (!webhookUrl) {
    await supabase
      .from("survey_responses")
      .update({
        webhook_status: "skipped",
        webhook_error: "SURVEY_SUBMIT_WEBHOOK_URL not configured",
      })
      .eq("id", responseId);

    return NextResponse.json({
      success: true,
      responseId,
      webhookStatus: "skipped" as const,
    });
  }

  const result = await postJsonWebhook(webhookUrl, forward);
  if (!result.ok) {
    console.error("Survey webhook error:", result.status, result.body);
    await supabase
      .from("survey_responses")
      .update({
        webhook_status: "failed",
        webhook_error: `${result.status}: ${result.body.slice(0, 500)}`,
      })
      .eq("id", responseId);

    return NextResponse.json(
      {
        success: false,
        responseId,
        webhookStatus: "failed" as const,
        message: "Webhook failed",
      },
      { status: 502 }
    );
  }

  await supabase
    .from("survey_responses")
    .update({ webhook_status: "ok", webhook_error: null })
    .eq("id", responseId);

  return NextResponse.json({
    success: true,
    responseId,
    webhookStatus: "ok" as const,
  });
}
