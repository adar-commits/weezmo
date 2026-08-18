import { TEMPLATE_IDS } from "@/constants/templates";
import type { DeliveryAddressFormValues, DeliveryAddressPayload } from "@/types/delivery-address";

/** n8n webhook — delivery address form submitted by customer. */
export const DELIVERY_ADDRESS_WEBHOOK_URL =
  "https://redcarpet.app.n8n.cloud/webhook-test/d5087336-f0dd-432e-b723-85bac2bdd7e9";

export const DELIVERY_ADDRESS_SUBMIT_ACTION = "received" as const;
export const DELIVERY_ADDRESS_CREATE_ACTION = "generate" as const;

export function buildDeliveryAddressWebhookBody(input: {
  documentId: string;
  responseId: string;
  payload: DeliveryAddressPayload;
  address: DeliveryAddressFormValues;
}): Record<string, unknown> {
  const { documentId, responseId, payload, address } = input;
  return {
    action: DELIVERY_ADDRESS_SUBMIT_ACTION,
    customer_id: payload.customer_id ?? null,
    template_id: TEMPLATE_IDS.deliveryAddress,
    document_id: documentId,
    response_id: responseId,
    order_id: payload.order_id ?? null,
    branch_id: payload.branch_id ?? null,
    ...address,
    metadata: payload.metadata ?? null,
    submitted_at: new Date().toISOString(),
  };
}
