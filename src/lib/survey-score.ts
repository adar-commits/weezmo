/**
 * Average of numeric Likert answers (1–5) in a survey answers object.
 */
export function computeSurveyAverageScore(answers: Record<string, unknown>): number {
  const vals: number[] = [];
  for (const v of Object.values(answers)) {
    if (typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 5) {
      vals.push(v);
    }
  }
  if (vals.length === 0) return 0;
  const raw = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(raw * 100) / 100;
}
