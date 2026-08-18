import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceiptDocumentView } from "@/components/ReceiptDocumentView";
import { PUBLIC_PAGE_TITLES, publicPageMetadata } from "@/config/brand";
import { TEMPLATE_IDS } from "@/constants/templates";
import { getDocumentRow } from "@/lib/documents/get-document-row";
import { resolveTemplateFromRow } from "@/lib/templates/registry";
import type { CustomerSurveyPayload } from "@/types/customer-survey";
import {
  DEFAULT_DELIVERY_ADDRESS_TITLE,
  type DeliveryAddressPayload,
} from "@/types/delivery-address";
import {
  formatDocumentHeading,
  type CreateDocumentPayload,
} from "@/types/document";
import { DocumentPageShell } from "@/components/DocumentPageShell";
import { CustomerSurveyView } from "./CustomerSurveyView";
import { DeliveryAddressView } from "./DeliveryAddressView";
import "./document-page.css";
import "./survey-page.css";
import "./delivery-address-page.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getDocumentRow(id);
  if (!data) {
    return publicPageMetadata(PUBLIC_PAGE_TITLES.document);
  }

  const templateId = resolveTemplateFromRow(data);

  if (templateId === TEMPLATE_IDS.customerSurvey) {
    const payload = data.payload as CustomerSurveyPayload;
    return publicPageMetadata(payload.title?.trim() || PUBLIC_PAGE_TITLES.survey);
  }

  if (templateId === TEMPLATE_IDS.deliveryAddress) {
    const payload = data.payload as DeliveryAddressPayload;
    return publicPageMetadata(
      payload.title?.trim() || DEFAULT_DELIVERY_ADDRESS_TITLE
    );
  }

  return publicPageMetadata(
    formatDocumentHeading(data.payload as CreateDocumentPayload)
  );
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getDocumentRow(id);

  if (!data) {
    notFound();
  }

  const templateId = resolveTemplateFromRow(data);

  if (templateId === TEMPLATE_IDS.customerSurvey) {
    return (
      <DocumentPageShell survey>
        <CustomerSurveyView documentId={id} payload={data.payload as CustomerSurveyPayload} />
      </DocumentPageShell>
    );
  }

  if (templateId === TEMPLATE_IDS.deliveryAddress) {
    return (
      <DocumentPageShell survey>
        <DeliveryAddressView documentId={id} payload={data.payload as DeliveryAddressPayload} />
      </DocumentPageShell>
    );
  }

  return (
    <DocumentPageShell>
      <ReceiptDocumentView documentId={id} payload={data.payload as CreateDocumentPayload} />
    </DocumentPageShell>
  );
}
