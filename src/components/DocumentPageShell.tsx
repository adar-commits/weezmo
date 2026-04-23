import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SURVEY_AMBIENT_BG_URL } from "@/config/document-branding";

type Props = {
  children: ReactNode;
  /** Full-page moving carpet / showroom backdrop (surveys only). */
  survey?: boolean;
};

export function DocumentPageShell({ children, survey = false }: Props) {
  const pageStyle = survey
    ? ({
        ["--survey-ambient-url"]: `url("${SURVEY_AMBIENT_BG_URL}")`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={cn("doc-page", survey && "doc-page--survey")}
      dir="rtl"
      lang="he"
      style={pageStyle}
    >
      {survey ? (
        <div className="survey-ambient" aria-hidden>
          <div className="survey-ambient__glow" />
        </div>
      ) : null}
      <div className={cn("doc-body", survey && "doc-body--survey")}>{children}</div>
    </div>
  );
}
