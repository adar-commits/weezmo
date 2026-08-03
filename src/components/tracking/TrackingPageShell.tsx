import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function TrackingPageShell({ children }: Props) {
  return (
    <div className="track-page" dir="rtl" lang="he">
      <div className="track-body">{children}</div>
    </div>
  );
}

export type TrackingPageShellStyle = CSSProperties;
