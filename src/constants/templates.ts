/** Known document render templates (stored in `documents.template_id`). */
export const TEMPLATE_IDS = {
  receipt: "receipt",
  customerSurvey: "customer_survey",
} as const;

export type TemplateId = (typeof TEMPLATE_IDS)[keyof typeof TEMPLATE_IDS];
