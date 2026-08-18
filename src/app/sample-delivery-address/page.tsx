import { DeliveryAddressView } from "@/app/documents/[id]/DeliveryAddressView";
import { DocumentPageShell } from "@/components/DocumentPageShell";
import type { DeliveryAddressPayload } from "@/types/delivery-address";
import "@/app/documents/[id]/document-page.css";
import "@/app/documents/[id]/survey-page.css";
import "@/app/documents/[id]/delivery-address-page.css";

const DEMO_PAYLOAD: DeliveryAddressPayload = {
  template_id: "delivery_address",
  title: "פרטי משלוח",
  subtitle: "נראה שחסרים לנו פרטי כתובת למשלוח — נשמח שתמלאו את הטופס",
  order_id: "PREVIEW-DEMO-NO-DB",
  branch_id: "3000",
  full_name: "תמר שני",
  street: "הרצל",
  house_number: "12",
  city: "תל אביב",
  floor: "3",
  apartment: "7",
  phone: "0501234567",
  delivery_instructions: "להשאיר ליד הדלת",
  metadata: { preview: true },
};

/** Static UI preview — no DB row; full flow uses POST /api/documents → /documents/{id}. */
export default function SampleDeliveryAddressPage() {
  return (
    <DocumentPageShell survey>
      <DeliveryAddressView
        documentId="00000000-0000-4000-8000-000000000002"
        payload={DEMO_PAYLOAD}
        previewMode
      />
    </DocumentPageShell>
  );
}
