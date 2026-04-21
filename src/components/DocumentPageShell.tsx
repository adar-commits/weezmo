import type { CSSProperties, ReactNode } from "react";
import { DOCUMENT_PAGE_RUG_IMAGE_URL } from "@/config/document-branding";

const docPageStyle = {
  ["--doc-rug-image"]: `url("${DOCUMENT_PAGE_RUG_IMAGE_URL}")`,
} as CSSProperties;

export function DocumentPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="doc-page" dir="rtl" lang="he" style={docPageStyle}>
      <div className="doc-body">{children}</div>
    </div>
  );
}
