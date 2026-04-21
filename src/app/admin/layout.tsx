import type { Metadata } from "next";
import { notoSansHebrew } from "@/lib/fonts/noto-hebrew";

export const metadata: Metadata = {
  title: "ניהול | Weezmo",
  description: "דשבורד סקרי לקוחות",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`admin-surface ${notoSansHebrew.className} min-h-svh bg-background text-foreground antialiased`}
      dir="rtl"
      lang="he"
    >
      {children}
    </div>
  );
}
