export interface CustomerSurveyQuestion {
  id: string;
  text: string;
  required: boolean;
}

export interface CustomerSurveyPayload {
  template_id: "customer_survey";
  title: string;
  subtitle?: string;
  /** Overrides default carpetshop logo when set */
  logoUrl?: string;
  /**
   * Your external correlation id (e.g. Shopify order id / order name).
   * Returned on survey submit webhook as `order_id` for automation.
   */
  order_id?: string;
  /** Denormalized to DB for admin search / filters */
  branch_id?: string;
  customer_name?: string;
  customer_phone?: string;
  questions: CustomerSurveyQuestion[];
  metadata?: Record<string, unknown>;
}

/** Default copy matching the approved survey brief (four mandatory Likert questions). */
export const DEFAULT_CUSTOMER_SURVEY_QUESTIONS: CustomerSurveyQuestion[] = [
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
];
