import { notoSansHebrew } from "@/lib/fonts/noto-hebrew";

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={notoSansHebrew.className} lang="he" dir="rtl">
      {children}
    </div>
  );
}
