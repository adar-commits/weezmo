import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { parseSurveyDashboardFilters } from "@/app/admin/surveys/filters";
import { listSurveyResponsesForExport } from "@/app/admin/surveys/queries";

function searchParamsToRecord(sp: URLSearchParams): Record<string, string | undefined> {
  const o: Record<string, string | undefined> = {};
  for (const [k, v] of sp.entries()) {
    if (o[k] === undefined) o[k] = v;
  }
  return o;
}

function csvEscape(s: unknown): string {
  const t = s === null || s === undefined ? "" : String(s);
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const raw = searchParamsToRecord(request.nextUrl.searchParams);
  const filters = parseSurveyDashboardFilters(raw);
  const rows = await listSurveyResponsesForExport(filters);

  const header = [
    "id",
    "document_id",
    "submitted_at",
    "avg_score",
    "order_id",
    "branch_id",
    "customer_name",
    "customer_phone",
    "webhook_status",
    "answers_json",
  ];

  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.id),
        csvEscape(r.document_id),
        csvEscape(r.submitted_at),
        csvEscape(r.avg_score),
        csvEscape(r.order_id),
        csvEscape(r.branch_id),
        csvEscape(r.customer_name),
        csvEscape(r.customer_phone),
        csvEscape(r.webhook_status),
        csvEscape(JSON.stringify(r.answers)),
      ].join(",")
    );
  }

  const body = "\uFEFF" + lines.join("\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="survey-responses.csv"`,
    },
  });
}
