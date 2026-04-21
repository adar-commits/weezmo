import { Suspense } from "react";
import { parseSurveyDashboardFilters } from "@/app/admin/surveys/filters";
import {
  aggregateByBranch,
  aggregateByQuestion,
  getSurveyKpis,
  listBranchOptions,
  listSurveyResponses,
} from "@/app/admin/surveys/queries";
import { SurveyPeriodTabs } from "@/app/admin/surveys/_components/SurveyPeriodTabs";
import { SurveyControlBar } from "@/app/admin/surveys/_components/SurveyControlBar";
import { SurveyKpiStrip } from "@/app/admin/surveys/_components/SurveyKpiStrip";
import { SurveyBranchSection } from "@/app/admin/surveys/_components/SurveyBranchSection";
import { SurveyQuestionSection } from "@/app/admin/surveys/_components/SurveyQuestionSection";
import { SurveyResponsesTable } from "@/app/admin/surveys/_components/SurveyResponsesTable";

export const dynamic = "force-dynamic";

export default async function AdminSurveysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseSurveyDashboardFilters(sp);

  const [kpis, branchAgg, questionAgg, responses, branchOptions] = await Promise.all([
    getSurveyKpis(filters),
    aggregateByBranch(filters),
    aggregateByQuestion(filters),
    listSurveyResponses(filters),
    listBranchOptions(filters.from, filters.to),
  ]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Suspense fallback={<div className="h-12 animate-pulse rounded-lg bg-muted" />}>
        <SurveyPeriodTabs />
      </Suspense>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
        <SurveyControlBar
          branchOptions={branchOptions}
          scoreMin={filters.scoreMin}
          scoreMax={filters.scoreMax}
        />
      </Suspense>

      <SurveyKpiStrip kpis={kpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SurveyBranchSection rows={branchAgg} filters={filters} />
        <SurveyQuestionSection rows={questionAgg} filters={filters} />
      </div>

      <SurveyResponsesTable rows={responses.rows} total={responses.total} filters={filters} />
    </div>
  );
}
