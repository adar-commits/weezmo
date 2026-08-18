export interface DeliveryAddressFields {
  /** שם מלא */
  full_name?: string;
  /** רחוב */
  street?: string;
  /** מס׳ בית */
  house_number?: string;
  /** עיר */
  city?: string;
  /** קומה */
  floor?: string;
  /** דירה */
  apartment?: string;
  /** טלפון */
  phone?: string;
  /** הוראות לשליח */
  delivery_instructions?: string;
}

export interface DeliveryAddressPayload extends DeliveryAddressFields {
  template_id: "delivery_address";
  title?: string;
  subtitle?: string;
  /** Overrides default carpetshop logo when set */
  logoUrl?: string;
  /**
   * External correlation id (e.g. Shopify order id).
   * Forwarded on submit webhook for automation.
   */
  order_id?: string;
  /** Denormalized to DB for admin search / filters */
  branch_id?: string;
  metadata?: Record<string, unknown>;
}

export const DEFAULT_DELIVERY_ADDRESS_TITLE = "פרטי משלוח";

export const DEFAULT_DELIVERY_ADDRESS_SUBTITLE =
  "נראה שחסרים לנו פרטי כתובת למשלוח — נשמח שתמלאו את הטופס";

export type DeliveryAddressFormValues = {
  full_name: string;
  street: string;
  house_number: string;
  city: string;
  floor: string;
  apartment: string;
  phone: string;
  delivery_instructions: string;
};

export function deliveryAddressInitialValues(
  payload: DeliveryAddressPayload
): DeliveryAddressFormValues {
  return {
    full_name: payload.full_name?.trim() ?? "",
    street: payload.street?.trim() ?? "",
    house_number: payload.house_number?.trim() ?? "",
    city: payload.city?.trim() ?? "",
    floor: payload.floor?.trim() ?? "",
    apartment: payload.apartment?.trim() ?? "",
    phone: payload.phone?.trim() ?? "",
    delivery_instructions: payload.delivery_instructions?.trim() ?? "",
  };
}
