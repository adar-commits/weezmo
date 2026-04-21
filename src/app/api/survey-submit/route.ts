import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TEMPLATE_IDS } from "@/constants/templates";
import { postJsonWebhook } from "@/lib/webhook-forward";
import { resolveTemplateFromRow } from "@/lib/templates/registry";
import type { CustomerSurveyPayload } from "@/types/customer-survey";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.SURVEY_SUBMIT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { message: "Survey webhook not configured" },
      { status: 503 }
    );
  }

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
    .select("template_id, payload")
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

  const forward = {
    templateId: TEMPLATE_IDS.customerSurvey,
    documentId,
    submittedAt: new Date().toISOString(),
    answers: ans as Record<string, number>,
    metadata: payload.metadata ?? {},
    surveyTitle: payload.title,
  };

  const result = await postJsonWebhook(webhookUrl, forward);
  if (!result.ok) {
    console.error("Survey webhook error:", result.status, result.body);
    return NextResponse.json({ message: "Webhook failed" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
