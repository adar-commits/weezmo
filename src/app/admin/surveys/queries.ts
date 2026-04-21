import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SurveyDashboardFilters } from "./filters";

export const SURVEY_RESPONSES_PAGE_SIZE = 50;

export type SurveyResponseRow = {
  id: string;
  document_id: string;
  submitted_at: string;
  answers: Record<string, number>;
  avg_score: number;
  order_id: string | null;
  branch_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  webhook_status: string;
  webhook_error: string | null;
};

export type BranchAggRow = {
  branch_id: string;
  response_count: number;
  avg_score: number;
  pct_five_star: number;
  last_submitted: string | null;
};

export type QuestionAggRow = {
  question_id: string;
  avg_rating: number;
  cnt_1: number;
  cnt_2: number;
  cnt_3: number;
  cnt_4: number;
  cnt_5: number;
  response_count: number;
};

export type SurveyKpis = {
  responsesCount: number;
  responsesPrev: number;
  avgScore: number;
  avgScorePrev: number;
  pctFiveStar: number;
  pctFiveStarPrev: number;
  completionRate: number;
  completionPrev: number;
  topBranchLabel: string;
  topBranchAvg: number;
  topBranchCount: number;
  worstQuestionId: string;
  worstQuestionAvg: number;
  daily: { day: string; cnt: number }[];
};

type StatsPack = {
  response_count: number;
  avg_score: number;
  five_star_pct: number;
  docs_issued: number;
};

function rpcParams(f: Pick<SurveyDashboardFilters, "from" | "to" | "scoreMin" | "scoreMax" | "branchId" | "q">) {
  return {
    p_from: f.from.toISOString(),
    p_to: f.to.toISOString(),
    p_score_min: f.scoreMin,
    p_score_max: f.scoreMax,
    p_branch_id: f.branchId ?? null,
    p_search: f.q.trim() ? f.q.trim() : null,
  };
}

async function rpcSurveyStatsPack(f: SurveyDashboardFilters): Promise<StatsPack> {
  const sb = createServerSupabaseClient();
  const { data, error } = await sb.rpc("survey_stats_pack", rpcParams(f));
  if (error) {
    console.error("survey_stats_pack", error.message);
    return { response_count: 0, avg_score: 0, five_star_pct: 0, docs_issued: 0 };
  }
  const o = (data ?? {}) as Record<string, unknown>;
  return {
    response_count: Number(o.response_count ?? 0),
    avg_score: Number(o.avg_score ?? 0),
    five_star_pct: Number(o.five_star_pct ?? 0),
    docs_issued: Number(o.docs_issued ?? 0),
  };
}

export async function getDailySparkline(
  f: SurveyDashboardFilters
): Promise<{ day: string; cnt: number }[]> {
  const sb = createServerSupabaseClient();
  const { data, error } = await sb.rpc("survey_daily_submissions", rpcParams(f));
  if (error) {
    console.error("survey_daily_submissions", error.message);
    return [];
  }
  return (data as { day: string; cnt: number }[] | null)?.map((r) => ({
    day: String(r.day),
    cnt: Number(r.cnt),
  })) ?? [];
}

export async function aggregateByBranch(f: SurveyDashboardFilters): Promise<BranchAggRow[]> {
  const sb = createServerSupabaseClient();
  const { data, error } = await sb.rpc("survey_agg_by_branch", rpcParams(f));
  if (error) {
    console.error("survey_agg_by_branch", error.message);
    return [];
  }
  return (data as BranchAggRow[] | null) ?? [];
}

export async function aggregateByQuestion(f: SurveyDashboardFilters): Promise<QuestionAggRow[]> {
  const sb = createServerSupabaseClient();
  const { data, error } = await sb.rpc("survey_agg_by_question", rpcParams(f));
  if (error) {
    console.error("survey_agg_by_question", error.message);
    return [];
  }
  return (data as QuestionAggRow[] | null) ?? [];
}

export async function listBranchOptions(from: Date, to: Date): Promise<string[]> {
  const sb = createServerSupabaseClient();
  const { data, error } = await sb
    .from("survey_responses")
    .select("branch_id")
    .gte("submitted_at", from.toISOString())
    .lt("submitted_at", to.toISOString())
    .not("branch_id", "is", null)
    .limit(3000);
  if (error) {
    console.error("listBranchOptions", error.message);
    return [];
  }
  const set = new Set<string>();
  for (const row of data ?? []) {
    const b = row.branch_id as string | null;
    if (b) set.add(b);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "he"));
}

export async function listSurveyResponses(
  f: SurveyDashboardFilters
): Promise<{ rows: SurveyResponseRow[]; total: number }> {
  const sb = createServerSupabaseClient();
  const from = f.from.toISOString();
  const to = f.to.toISOString();
  const offset = (f.page - 1) * SURVEY_RESPONSES_PAGE_SIZE;

  let q = sb
    .from("survey_responses")
    .select("*", { count: "exact" })
    .gte("submitted_at", from)
    .lt("submitted_at", to)
    .gte("avg_score", f.scoreMin)
    .lte("avg_score", f.scoreMax);

  if (f.branchId) {
    q = q.eq("branch_id", f.branchId);
  }

  const qtrim = f.q.trim().replace(/[%_]/g, "");
  if (qtrim) {
    const pat = `%${qtrim}%`;
    q = q.or(`customer_name.ilike.${pat},customer_phone.ilike.${pat},order_id.ilike.${pat}`);
  }

  q = q
    .order(f.sortField, { ascending: f.sortDir === "asc" })
    .range(offset, offset + SURVEY_RESPONSES_PAGE_SIZE - 1);

  const { data, error, count } = await q;
  if (error) {
    console.error("listSurveyResponses", error.message);
    return { rows: [], total: 0 };
  }
  return { rows: (data as SurveyResponseRow[]) ?? [], total: count ?? 0 };
}

export async function getSurveyKpis(f: SurveyDashboardFilters): Promise<SurveyKpis> {
  const prevF: SurveyDashboardFilters = { ...f, from: f.prevFrom, to: f.prevTo };

  const [cur, prevStats, daily, branches, questions] = await Promise.all([
    rpcSurveyStatsPack(f),
    rpcSurveyStatsPack(prevF),
    getDailySparkline(f),
    aggregateByBranch(f),
    aggregateByQuestion(f),
  ]);

  const top = branches[0];
  let worst: QuestionAggRow | null = null;
  for (const q of questions) {
    if (!worst || q.avg_rating < worst.avg_rating) worst = q;
  }

  const completionRate = cur.docs_issued > 0 ? cur.response_count / cur.docs_issued : 0;
  const completionPrev = prevStats.docs_issued > 0 ? prevStats.response_count / prevStats.docs_issued : 0;

  return {
    responsesCount: cur.response_count,
    responsesPrev: prevStats.response_count,
    avgScore: cur.avg_score,
    avgScorePrev: prevStats.avg_score,
    pctFiveStar: cur.five_star_pct,
    pctFiveStarPrev: prevStats.five_star_pct,
    completionRate,
    completionPrev,
    topBranchLabel: top?.branch_id === "" || top?.branch_id == null ? "ללא סניף" : (top?.branch_id ?? "—"),
    topBranchAvg: top ? Number(top.avg_score) : 0,
    topBranchCount: top ? Number(top.response_count) : 0,
    worstQuestionId: worst?.question_id ?? "—",
    worstQuestionAvg: worst ? Number(worst.avg_rating) : 0,
    daily,
  };
}

export async function getSurveyResponseById(id: string): Promise<SurveyResponseRow | null> {
  const sb = createServerSupabaseClient();
  const { data, error } = await sb.from("survey_responses").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as SurveyResponseRow;
}

/** CSV export — capped at 5000 rows for safety. */
export async function listSurveyResponsesForExport(
  f: SurveyDashboardFilters
): Promise<SurveyResponseRow[]> {
  const sb = createServerSupabaseClient();
  const from = f.from.toISOString();
  const to = f.to.toISOString();

  let q = sb
    .from("survey_responses")
    .select("*")
    .gte("submitted_at", from)
    .lt("submitted_at", to)
    .gte("avg_score", f.scoreMin)
    .lte("avg_score", f.scoreMax);

  if (f.branchId) {
    q = q.eq("branch_id", f.branchId);
  }

  const qtrim = f.q.trim().replace(/[%_]/g, "");
  if (qtrim) {
    const pat = `%${qtrim}%`;
    q = q.or(`customer_name.ilike.${pat},customer_phone.ilike.${pat},order_id.ilike.${pat}`);
  }

  const { data, error } = await q
    .order(f.sortField, { ascending: f.sortDir === "asc" })
    .limit(5000);

  if (error) {
    console.error("listSurveyResponsesForExport", error.message);
    return [];
  }
  return (data as SurveyResponseRow[]) ?? [];
}
