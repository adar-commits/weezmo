import type { Metadata } from "next";
import "./architects-form.css";

export const metadata: Metadata = {
  title: "הצטרפו לרשימת האדריכלים והמעצבים | HōM GROUP",
  description: "טופס הצטרפות לרשימת האדריכלים והמעצבים של HōM GROUP",
};

export default function ArchitectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="he" dir="rtl">
      {children}
    </div>
  );
}
