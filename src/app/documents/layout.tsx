import { Noto_Sans_Hebrew } from "next/font/google";

const notoSansHebrew = Noto_Sans_Hebrew({
  weight: ["400", "500", "700", "900"],
  subsets: ["hebrew", "latin"],
  display: "swap",
});

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
