import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  isValid,
  parse as parseDate,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";

export const SURVEY_PERIODS = ["yesterday", "today", "week", "month", "year", "custom"] as const;
export type SurveyPeriod = (typeof SURVEY_PERIODS)[number];

export type SurveySortField =
  | "submitted_at"
  | "avg_score"
  | "customer_name"
  | "customer_phone"
  | "order_id"
  | "branch_id";

export type SurveyDashboardFilters = {
  period: SurveyPeriod;
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  q: string;
  branchId: string | null;
  scoreMin: number;
  scoreMax: number;
  page: number;
  sortField: SurveySortField;
  sortDir: "asc" | "desc";
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parsePeriod(raw: string | undefined): SurveyPeriod {
  if (raw && (SURVEY_PERIODS as readonly string[]).includes(raw)) return raw as SurveyPeriod;
  return "week";
}

function parseNum(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function windowForPeriod(period: SurveyPeriod, customFrom?: Date, customTo?: Date): { from: Date; to: Date } {
  const now = new Date();
  switch (period) {
    case "yesterday": {
      const y = subDays(startOfDay(now), 1);
      return { from: y, to: endOfDay(y) };
    }
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 0 }), to: endOfDay(now) };
    case "month":
      return { from: startOfMonth(now), to: endOfDay(now) };
    case "year":
      return { from: startOfYear(now), to: endOfDay(now) };
    case "custom": {
      if (customFrom && customTo && customFrom <= customTo) {
        return { from: startOfDay(customFrom), to: endOfDay(customTo) };
      }
      return { from: startOfWeek(now, { weekStartsOn: 0 }), to: endOfDay(now) };
    }
    default:
      return { from: startOfWeek(now, { weekStartsOn: 0 }), to: endOfDay(now) };
  }
}

export function previousWindow(from: Date, to: Date): { prevFrom: Date; prevTo: Date } {
  const ms = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime());
  const prevFrom = new Date(from.getTime() - ms);
  return { prevFrom, prevTo };
}

function parseSortField(raw: string | undefined): SurveySortField {
  const allowed: SurveySortField[] = [
    "submitted_at",
    "avg_score",
    "customer_name",
    "customer_phone",
    "order_id",
    "branch_id",
  ];
  if (raw && (allowed as string[]).includes(raw)) return raw as SurveySortField;
  return "submitted_at";
}

function parseSortDir(raw: string | undefined): "asc" | "desc" {
  return raw === "asc" ? "asc" : "desc";
}

export function parseSurveyDashboardFilters(
  sp: Record<string, string | string[] | undefined>
): SurveyDashboardFilters {
  const period = parsePeriod(firstString(sp.period));
  const fromIso = firstString(sp.from);
  const toIso = firstString(sp.to);
  let customFrom: Date | undefined;
  let customTo: Date | undefined;
  if (fromIso && toIso) {
    const a = parseDate(fromIso, "yyyy-MM-dd", new Date());
    const b = parseDate(toIso, "yyyy-MM-dd", new Date());
    if (isValid(a) && isValid(b)) {
      customFrom = a;
      customTo = b;
    }
  }
  const { from, to } = windowForPeriod(period, customFrom, customTo);
  const { prevFrom, prevTo } = previousWindow(from, to);

  let scoreMin = parseNum(firstString(sp.score_min), 1, 1, 5);
  let scoreMax = parseNum(firstString(sp.score_max), 5, 1, 5);
  if (scoreMin > scoreMax) [scoreMin, scoreMax] = [scoreMax, scoreMin];

  return {
    period,
    from,
    to,
    prevFrom,
    prevTo,
    q: (firstString(sp.q) ?? "").trim(),
    branchId: (() => {
      const b = firstString(sp.branch_id);
      if (!b || b === "__all__") return null;
      return b;
    })(),
    scoreMin,
    scoreMax,
    page: Math.max(1, parseInt(firstString(sp.page) ?? "1", 10) || 1),
    sortField: parseSortField(firstString(sp.sort)),
    sortDir: parseSortDir(firstString(sp.dir)),
  };
}

export function filtersToQueryString(f: SurveyDashboardFilters): string {
  const p = new URLSearchParams();
  p.set("period", f.period);
  if (f.period === "custom") {
    p.set("from", format(f.from, "yyyy-MM-dd"));
    p.set("to", format(f.to, "yyyy-MM-dd"));
  }
  if (f.q) p.set("q", f.q);
  if (f.branchId) p.set("branch_id", f.branchId);
  p.set("score_min", String(f.scoreMin));
  p.set("score_max", String(f.scoreMax));
  p.set("page", String(f.page));
  p.set("sort", f.sortField);
  p.set("dir", f.sortDir);
  return p.toString();
}

export function mergeSurveyFilters(
  base: SurveyDashboardFilters,
  patch: Partial<
    Pick<SurveyDashboardFilters, "page" | "sortField" | "sortDir" | "period" | "q" | "branchId" | "scoreMin" | "scoreMax">
  >
): SurveyDashboardFilters {
  return { ...base, ...patch };
}
