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
    <div className={`${notoSansHebrew.className} min-h-svh bg-[#f3f4f6]`} dir="rtl" lang="he">
      {children}
    </div>
  );
}
