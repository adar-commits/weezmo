import { TrackingPageShell } from "@/components/tracking/TrackingPageShell";
import { TrackingPortalView } from "@/components/tracking/TrackingPortalView";
import type { OrderTrackingPayload } from "@/types/order-tracking";
import "@/app/track/tracking-page.css";

const DEMO_PAYLOAD: OrderTrackingPayload = {
  orderNumber: "SO26016615",
  customerName: "חדידה ארי",
  customerAddress: "שמחה ארליך 2 , קומה/דירה: 3/10, נתניה",
  branchDesc: "בני ברק",
  workingHours: "בימים א׳-ה׳: 09:00 עד 16:00 | שישי-שבת: סגור",
  products: [
    {
      prdDesc: "סול פיסטוק 190*140 SOL",
      Quantity: 1,
    },
  ],
  Events: [
    {
      eventDesc: "הזמנה התקבלה",
      eventTime: "07/21/2026 19:07",
    },
    {
      eventDesc: "בתהליך אריזה",
      eventTime: "07/22/2026 09:25",
    },
    {
      eventDesc: "ממתינה לאיסוף ע׳׳י חברת השילוח",
      eventTime: "07/23/2026 08:04",
    },
    {
      eventDesc: "הזמנה בדרך",
      eventTime: "07/29/2026 09:02",
    },
    {
      eventDesc: "הזמנה נמסרה",
      eventTime: null,
    },
  ],
  Notes: null,
};

/** Static UI preview — no API call; live tracking uses /track?orderID=SO… */
export default function SampleTrackingPage() {
  return (
    <TrackingPageShell>
      <TrackingPortalView previewData={DEMO_PAYLOAD} />
    </TrackingPageShell>
  );
}
