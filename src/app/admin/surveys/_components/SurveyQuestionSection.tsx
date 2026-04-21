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
import type { QuestionAggRow } from "@/app/admin/surveys/queries";
import { filtersToQueryString, type SurveyDashboardFilters } from "@/app/admin/surveys/filters";

function DistBar({ row }: { row: QuestionAggRow }) {
  const total = row.response_count || 1;
  const segs = [
    { n: row.cnt_1, className: "bg-destructive/80" },
    { n: row.cnt_2, className: "bg-orange-400/90" },
    { n: row.cnt_3, className: "bg-amber-400/90" },
    { n: row.cnt_4, className: "bg-emerald-500/80" },
    { n: row.cnt_5, className: "bg-primary" },
  ];
  return (
    <div className="flex h-2 w-full max-w-[140px] overflow-hidden rounded-full bg-muted ms-auto">
      {segs.map((s, i) => (
        <div
          key={i}
          className={s.className}
          style={{ width: `${(Number(s.n) / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

type Props = { rows: QuestionAggRow[]; filters: SurveyDashboardFilters };

export function SurveyQuestionSection({ rows, filters }: Props) {
  const exportQs = filtersToQueryString(filters);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
        <Button variant="outline" size="sm" className="gap-1" asChild>
          <a href={`/api/admin/surveys/export?${exportQs}`}>
            <Download className="size-4" />
            ייצוא CSV
          </a>
        </Button>
        <CardTitle className="text-base font-semibold">חלוקה לפי שאלות</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right">מזהה שאלה</TableHead>
              <TableHead className="text-center">ממוצע</TableHead>
              <TableHead className="text-center">תגובות</TableHead>
              <TableHead className="w-[160px] text-center">1–5</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  אין נתונים בטווח
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.question_id} className="odd:bg-muted/40">
                  <TableCell className="text-right font-mono text-sm" dir="ltr">
                    {r.question_id}
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold">
                    {Number(r.avg_rating).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{r.response_count}</TableCell>
                  <TableCell>
                    <DistBar row={r} />
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
