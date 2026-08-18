import type { Metadata } from "next";
import { PUBLIC_PAGE_TITLES, publicPageMetadata } from "@/config/brand";
import "./architects-form.css";

export const metadata: Metadata = publicPageMetadata(
  PUBLIC_PAGE_TITLES.architects,
  "טופס הצטרפות לרשימת האדריכלים והמעצבים של HōM GROUP"
);

export default function ArchitectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="he" dir="rtl">
      {children}
    </div>
  );
}
