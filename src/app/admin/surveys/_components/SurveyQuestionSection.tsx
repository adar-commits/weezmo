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
import { StarBandHeader } from "@/app/admin/surveys/_components/StarBandHeader";

type Props = { rows: QuestionAggRow[]; filters: SurveyDashboardFilters };

export function SurveyQuestionSection({ rows, filters }: Props) {
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
        <CardTitle className="text-base font-semibold">חלוקה לפי שאלות</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">
        <Table>
          <TableHeader className="bg-muted/35">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-right">מזהה שאלה</TableHead>
              <TableHead className="text-center">ממוצע</TableHead>
              <TableHead className="text-center">תגובות</TableHead>
              <TableHead className="w-[44px] px-0.5 text-center" title="דירוג 5">
                <StarBandHeader level={5} />
              </TableHead>
              <TableHead className="w-[44px] px-0.5 text-center" title="דירוג 4">
                <StarBandHeader level={4} />
              </TableHead>
              <TableHead className="w-[44px] px-0.5 text-center" title="דירוג 3">
                <StarBandHeader level={3} />
              </TableHead>
              <TableHead className="w-[44px] px-0.5 text-center" title="דירוג 2">
                <StarBandHeader level={2} />
              </TableHead>
              <TableHead className="w-[44px] px-0.5 text-center" title="דירוג 1">
                <StarBandHeader level={1} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  אין נתונים בטווח
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.question_id} className="odd:bg-muted/25 transition-colors hover:bg-muted/40">
                  <TableCell className="text-right font-mono text-sm" dir="ltr">
                    {r.question_id}
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold">
                    {Number(r.avg_rating).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{r.response_count}</TableCell>
                  <TableCell className="px-0.5 text-center tabular-nums text-sm">{r.cnt_5}</TableCell>
                  <TableCell className="px-0.5 text-center tabular-nums text-sm">{r.cnt_4}</TableCell>
                  <TableCell className="px-0.5 text-center tabular-nums text-sm">{r.cnt_3}</TableCell>
                  <TableCell className="px-0.5 text-center tabular-nums text-sm">{r.cnt_2}</TableCell>
                  <TableCell className="px-0.5 text-center tabular-nums text-sm">{r.cnt_1}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
