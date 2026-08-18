import type { Metadata } from "next";

export const BRAND_NAME = "HōM GROUP";

export const PUBLIC_PAGE_TITLES = {
  tracking: "מעקב סטטוס הזמנה",
  survey: "סקר שביעות רצון",
  deliveryAddress: "פרטי משלוח",
  document: "מסמך דיגיטלי",
  architects: "הצטרפו לרשימת האדריכלים והמעצבים",
} as const;

export function brandedTitle(page: string): string {
  const trimmed = page.trim();
  if (!trimmed) return BRAND_NAME;
  if (trimmed === BRAND_NAME || trimmed.endsWith(` | ${BRAND_NAME}`)) return trimmed;
  return `${trimmed} | ${BRAND_NAME}`;
}

export function publicPageMetadata(title: string, description?: string): Metadata {
  const full = brandedTitle(title);
  const desc = description?.trim() || full;
  return {
    title,
    description: desc,
    applicationName: BRAND_NAME,
    openGraph: {
      title: full,
      description: desc,
      siteName: BRAND_NAME,
      locale: "he_IL",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: full,
      description: desc,
    },
  };
}
