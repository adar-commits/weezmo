import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BranchAggRow } from "@/app/admin/surveys/queries";
import { filtersToQueryString, type SurveyDashboardFilters } from "@/app/admin/surveys/filters";

type Props = { rows: BranchAggRow[]; filters: SurveyDashboardFilters };

export function SurveyBranchSection({ rows, filters }: Props) {
  const exportQs = filtersToQueryString(filters);

  return (
    <Card className="border-0">
      <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 border-b border-border/40 pb-4">
        <Button variant="outline" size="sm" className="gap-1 rounded-xl border-border/60" asChild>
          <a href={`/api/admin/surveys/export?${exportQs}`}>
            <Download className="size-4" />
            ייצוא CSV
          </a>
        </Button>
        <CardTitle className="text-base font-semibold">חלוקה לפי סניפים</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-muted/35">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-right">סניף</TableHead>
              <TableHead className="text-center">תגובות</TableHead>
              <TableHead className="text-center">ממוצע</TableHead>
              <TableHead className="text-center">
                <span className="inline-flex flex-col items-center gap-0.5">
                  <span className="text-amber-500 leading-none" dir="ltr" aria-hidden>
                    ★★★★★
                  </span>
                  <span className="text-[11px] text-muted-foreground">% בדירוג 5</span>
                </span>
              </TableHead>
              <TableHead className="text-center">עדכון אחרון</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  אין נתונים בטווח
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.branch_id || "__empty__"} className="odd:bg-muted/25 transition-colors hover:bg-muted/40">
                  <TableCell className="text-right font-medium">
                    {r.branch_id === "" ? "ללא סניף" : r.branch_id}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{r.response_count}</TableCell>
                  <TableCell className="text-center tabular-nums">{Number(r.avg_score).toFixed(2)}</TableCell>
                  <TableCell className="text-center tabular-nums">
                    {Number(r.pct_five_star).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground" dir="ltr">
                    {r.last_submitted
                      ? new Date(r.last_submitted).toLocaleString("he-IL")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
