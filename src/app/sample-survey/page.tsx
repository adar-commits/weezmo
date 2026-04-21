import { CustomerSurveyView } from "@/app/documents/[id]/CustomerSurveyView";
import { DocumentPageShell } from "@/components/DocumentPageShell";
import type { CustomerSurveyPayload } from "@/types/customer-survey";
import "@/app/documents/[id]/document-page.css";
import "@/app/documents/[id]/survey-page.css";

const DEMO_PAYLOAD: CustomerSurveyPayload = {
  template_id: "customer_survey",
  title: "סקר שביעות רצון",
  subtitle: "דעתך חשובה לנו ❤️",
  order_id: "PREVIEW-DEMO-NO-DB",
  branch_id: "3000",
  customer_name: "תצוגה מקדימה",
  customer_phone: "0500000000",
  questions: [
    {
      id: "q_service",
      text: "דרג את שביעות רצונך מהשירות שקיבלת",
      required: true,
    },
    {
      id: "q_rep",
      text: "דרג את שביעות רצונך מאדיבות ומקצועיות הנציג",
      required: true,
    },
    {
      id: "q_speed",
      text: "דרג את שביעות רצונך ממהירות התגובה",
      required: true,
    },
    {
      id: "q_solution",
      text: "דרג באיזו מידה הפתרון שקיבלת היה ברור, יעיל ומספק",
      required: true,
    },
  ],
  metadata: { preview: true },
};

/** Static UI preview — no DB row; full flow uses POST /api/documents → /documents/{id}. */
export default function SampleSurveyPage() {
  return (
    <DocumentPageShell>
      <CustomerSurveyView
        documentId="00000000-0000-4000-8000-000000000001"
        payload={DEMO_PAYLOAD}
        previewMode
      />
    </DocumentPageShell>
  );
}
