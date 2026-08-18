import { PUBLIC_PAGE_TITLES, publicPageMetadata } from "@/config/brand";

export const metadata = publicPageMetadata(PUBLIC_PAGE_TITLES.tracking);

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="he" dir="rtl">
      {children}
    </div>
  );
}
