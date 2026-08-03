import { TEMPLATE_IDS, type TemplateId } from "@/constants/templates";

const LOCAL_FALLBACK = "http://localhost:3000";

function normalizeBaseUrl(raw: string | undefined, fallback: string): string {
  if (!raw?.trim()) return fallback;
  const trimmed = raw.trim().replace(/\/$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function productionFallback(path: string): string {
  return process.env.NODE_ENV === "production" ? path : LOCAL_FALLBACK;
}

/** Admin + legacy default host (weezmo.vercel.app). */
export function getAppBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_APP_URL,
    productionFallback("https://weezmo.vercel.app")
  );
}

export function getTrackingBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_TRACKING_URL,
    productionFallback("https://tracking.carpetshop.co.il")
  );
}

export function getSurveyBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_SURVEY_URL,
    productionFallback("https://survey.carpetshop.co.il")
  );
}

export function getDocumentsBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_DOCUMENTS_URL,
    productionFallback("https://documents.carpetshop.co.il")
  );
}

export function getPublicDocumentBaseUrl(templateId: string): string {
  if (templateId === TEMPLATE_IDS.customerSurvey) return getSurveyBaseUrl();
  return getDocumentsBaseUrl();
}

export function getPublicDocumentUrl(templateId: string, id: string): string {
  return `${getPublicDocumentBaseUrl(templateId)}/documents/${id}`;
}

export function getTrackingOrderUrl(orderId: string): string {
  const base = getTrackingBaseUrl();
  const params = new URLSearchParams({ orderID: orderId });
  return `${base}/track?${params.toString()}`;
}

export function hostnameFromBaseUrl(baseUrl: string): string | null {
  try {
    return new URL(baseUrl).hostname;
  } catch {
    return null;
  }
}

export function getCustomerFacingHostnames(): string[] {
  const hosts = [
    hostnameFromBaseUrl(getTrackingBaseUrl()),
    hostnameFromBaseUrl(getSurveyBaseUrl()),
    hostnameFromBaseUrl(getDocumentsBaseUrl()),
  ].filter((h): h is string => Boolean(h));

  return [...new Set(hosts)];
}

export function isCustomerFacingHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().split(":")[0] ?? hostname;
  return getCustomerFacingHostnames().includes(normalized);
}

export function getTrackingHostname(): string | null {
  return hostnameFromBaseUrl(getTrackingBaseUrl());
}

export type PublicUrlKind = "app" | "tracking" | "survey" | "documents";

export function publicUrlKindForTemplate(templateId: TemplateId): "survey" | "documents" {
  return templateId === TEMPLATE_IDS.customerSurvey ? "survey" : "documents";
}
