/** Likert 1–5: show n filled star glyphs (★) in column headers. */
export function StarBandHeader({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="inline-flex min-w-0 flex-col items-center gap-0.5">
      <span className="text-amber-500 leading-none tracking-tight" style={{ fontSize: "clamp(0.65rem, 1.6vw, 0.8rem)" }} dir="ltr" aria-hidden>
        {"★".repeat(level)}
      </span>
      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">({level})</span>
    </div>
  );
}
