import type { Metadata } from "next";
import { BRAND_NAME } from "@/config/brand";
import { getAppBaseUrl } from "@/lib/public-urls";
import "./globals.css";

function metadataBaseUrl(): URL {
  try {
    return new URL(getAppBaseUrl());
  } catch {
    return new URL("https://weezmo.vercel.app");
  }
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: "מסמכים דיגיטליים — השטיח האדום",
  applicationName: BRAND_NAME,
  openGraph: {
    siteName: BRAND_NAME,
    locale: "he_IL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>{children}</body>
    </html>
  );
}
