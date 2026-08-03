export type OrderTrackingProduct = {
  prdDesc: string;
  Quantity: number;
};

export type OrderTrackingEvent = {
  eventDesc: string;
  eventTime: string | null;
};

export type OrderTrackingPayload = {
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  branchDesc: string;
  workingHours: string;
  products: OrderTrackingProduct[];
  Events: OrderTrackingEvent[];
  Notes: string | null;
};
