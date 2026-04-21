import { z } from "zod";
import { TEMPLATE_IDS } from "@/constants/templates";

const surveyQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  required: z.boolean(),
});

export const customerSurveyPayloadSchema = z.object({
  template_id: z.literal(TEMPLATE_IDS.customerSurvey),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  logoUrl: z.string().url().optional(),
  /** External correlation key (e.g. Shopify order id). Forwarded on submit webhook. */
  order_id: z.string().min(1).max(256).optional(),
  questions: z.array(surveyQuestionSchema).min(1).max(20),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const documentItemSchema = z.object({
  ItemQTY: z.number(),
  ItemSKU: z.string(),
  ItemPrice: z.number(),
  ItemDescription: z.string(),
});

/** Receipt / invoice body as sent by POS or legacy integrations. */
export const receiptPayloadSchema = z
  .object({
    Items: z.array(documentItemSchema).min(1),
    InvoiceNumber: z.string().optional(),
    BranchID: z.string().optional(),
    BranchName: z.string().optional(),
    PrintDate: z.string().optional(),
    SalesRepresentative: z.string().optional(),
    CustomerName: z.string().optional(),
    CustomerPhone: z.string().optional(),
    CustomerEmail: z.string().optional(),
    TotalPrice: z.number().optional(),
    type: z.string().optional(),
    paymentType: z.string().optional(),
    discount: z.number().optional(),
    coupons: z.array(z.unknown()).optional(),
    VAT: z.number().optional(),
    BranchFeedbackUrl: z.string().optional(),
    template_id: z.literal(TEMPLATE_IDS.receipt).optional(),
  })
  .passthrough();
