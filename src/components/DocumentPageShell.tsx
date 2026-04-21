import type { ReactNode } from "react";

export function DocumentPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="doc-page" dir="rtl" lang="he">
      <div className="doc-body">{children}</div>
    </div>
  );
}
