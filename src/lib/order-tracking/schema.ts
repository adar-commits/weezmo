import { z } from "zod";
import type { OrderTrackingPayload } from "@/types/order-tracking";

const productSchema = z.object({
  prdDesc: z.string(),
  Quantity: z.number(),
});

const eventSchema = z.object({
  eventDesc: z.string(),
  eventTime: z.string().nullable(),
});

export const orderTrackingPayloadSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  customerAddress: z.string(),
  branchDesc: z.string(),
  workingHours: z.string(),
  products: z.array(productSchema),
  Events: z.array(eventSchema),
  Notes: z.string().nullable(),
});

export function parseOrderTrackingPayload(data: unknown): OrderTrackingPayload | null {
  const result = orderTrackingPayloadSchema.safeParse(data);
  return result.success ? result.data : null;
}

/** Priority `SO123` or a bare numeric id such as Shopify `35580`. */
export const ORDER_ID_PATTERN = /^(SO)?\d+$/i;

export function isValidOrderId(value: string): boolean {
  return ORDER_ID_PATTERN.test(value.trim());
}
