import { TEMPLATE_IDS } from "@/constants/templates";
import type { CustomerSurveyPayload } from "@/types/customer-survey";
import {
  resolveSurveyBranchId,
  resolveSurveyCustomerName,
  resolveSurveyCustomerPhone,
  resolveSurveyOrderId,
} from "@/lib/survey-denorm";

type DocRow = {
  branch_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
};

export function buildSurveySubmitWebhookBody(input: {
  documentId: string;
  responseId: string;
  payload: CustomerSurveyPayload;
  row: DocRow;
  answers: Record<string, number>;
  avgScore: number;
  /** Defaults to now; use stored `submitted_at` when retrying a webhook. */
  submittedAt?: string;
}) {
  const { documentId, responseId, payload, row, answers, avgScore, submittedAt } = input;
  const meta = payload.metadata ?? {};
  return {
    templateId: TEMPLATE_IDS.customerSurvey,
    documentId,
    responseId,
    submittedAt: submittedAt ?? new Date().toISOString(),
    order_id: resolveSurveyOrderId(payload),
    branch_id: resolveSurveyBranchId(row, payload),
    customer_name: resolveSurveyCustomerName(row, payload),
    customer_phone: resolveSurveyCustomerPhone(row, payload),
    avg_score: avgScore,
    answers,
    metadata: meta,
    surveyTitle: payload.title,
  };
}
