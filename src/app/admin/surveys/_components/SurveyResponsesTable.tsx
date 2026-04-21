"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SurveyResponseRow } from "@/app/admin/surveys/queries";
import { SURVEY_RESPONSES_PAGE_SIZE } from "@/app/admin/surveys/queries";
import {
  filtersToQueryString,
  mergeSurveyFilters,
  type SurveyDashboardFilters,
  type SurveySortField,
} from "@/app/admin/surveys/filters";

type Props = {
  rows: SurveyResponseRow[];
  total: number;
  filters: SurveyDashboardFilters;
};

function sortHref(f: SurveyDashboardFilters, field: SurveySortField): string {
  const same = f.sortField === field;
  const nextDir: "asc" | "desc" = same && f.sortDir === "desc" ? "asc" : "desc";
  const next = mergeSurveyFilters(f, {
    sortField: field,
    sortDir: same ? nextDir : "desc",
    page: 1,
  });
  return `/admin/surveys?${filtersToQueryString(next)}`;
}

export function SurveyResponsesTable({ rows, total, filters }: Props) {
  const [openRow, setOpenRow] = useState<SurveyResponseRow | null>(null);
  const [retrying, setRetrying] = useState(false);

  const columns = useMemo<ColumnDef<SurveyResponseRow>[]>(
    () => [
      {
        accessorKey: "submitted_at",
        header: () => (
          <Link href={sortHref(filters, "submitted_at")} className="hover:underline">
            תאריך
          </Link>
        ),
        cell: ({ row }) => (
          <span className="text-xs" dir="ltr">
            {new Date(row.original.submitted_at).toLocaleString("he-IL")}
          </span>
        ),
      },
      {
        accessorKey: "customer_name",
        header: () => (
          <Link href={sortHref(filters, "customer_name")} className="hover:underline">
            לקוח
          </Link>
        ),
        cell: ({ getValue }) => String(getValue() ?? "—"),
      },
      {
        accessorKey: "customer_phone",
        header: () => (
          <Link href={sortHref(filters, "customer_phone")} className="hover:underline">
            טלפון
          </Link>
        ),
        cell: ({ getValue }) => <span dir="ltr">{String(getValue() ?? "—")}</span>,
      },
      {
        accessorKey: "order_id",
        header: () => (
          <Link href={sortHref(filters, "order_id")} className="hover:underline">
            הזמנה
          </Link>
        ),
        cell: ({ getValue }) => <span dir="ltr">{String(getValue() ?? "—")}</span>,
      },
      {
        accessorKey: "branch_id",
        header: () => (
          <Link href={sortHref(filters, "branch_id")} className="hover:underline">
            סניף
          </Link>
        ),
      },
      {
        accessorKey: "avg_score",
        header: () => (
          <Link href={sortHref(filters, "avg_score")} className="hover:underline">
            ממוצע
          </Link>
        ),
        cell: ({ getValue }) => (
          <span className="tabular-nums font-semibold">{Number(getValue()).toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "webhook_status",
        header: "Webhook",
        cell: ({ getValue }) => {
          const s = String(getValue());
          const variant =
            s === "ok" ? "secondary" : s === "failed" ? "destructive" : "outline";
          return <Badge variant={variant}>{s}</Badge>;
        },
      },
    ],
    [filters]
  );

  const table = useReactTable({
    data: rows,
    columns,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(total / SURVEY_RESPONSES_PAGE_SIZE));
  const prevHref =
    filters.page > 1
      ? `/admin/surveys?${filtersToQueryString(mergeSurveyFilters(filters, { page: filters.page - 1 }))}`
      : null;
  const nextHref =
    filters.page < totalPages
      ? `/admin/surveys?${filtersToQueryString(mergeSurveyFilters(filters, { page: filters.page + 1 }))}`
      : null;

  async function retryWebhook() {
    if (!openRow) return;
    setRetrying(true);
    try {
      const res = await fetch("/api/admin/surveys/retry-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseId: openRow.id }),
        credentials: "include",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        alert(j.message ?? "שגיאה");
        return;
      }
      window.location.reload();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="text-right">
          <CardTitle className="text-base font-semibold">תגובות אחרונות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="text-center">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                    אין שורות להצגה
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer odd:bg-muted/40"
                    onClick={() => setOpenRow(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4">
            <p className="text-sm text-muted-foreground">
              עמוד {filters.page} מתוך {totalPages} · {total} רשומות
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!prevHref} asChild>
                {prevHref ? (
                  <Link href={prevHref} prefetch={false}>
                    <ChevronRight className="size-4" />
                  </Link>
                ) : (
                  <span>
                    <ChevronRight className="size-4" />
                  </span>
                )}
              </Button>
              <Button variant="outline" size="sm" disabled={!nextHref} asChild>
                {nextHref ? (
                  <Link href={nextHref} prefetch={false}>
                    <ChevronLeft className="size-4" />
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="size-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!openRow} onOpenChange={(o) => !o && setOpenRow(null)}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-lg" dir="rtl">
          <SheetHeader>
            <SheetTitle>פרטי תגובה</SheetTitle>
          </SheetHeader>
          {openRow ? (
            <div className="mt-6 space-y-4 text-right text-sm">
              <p>
                <span className="text-muted-foreground">מזהה: </span>
                <span className="font-mono" dir="ltr">
                  {openRow.id}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">ממוצע: </span>
                {openRow.avg_score.toFixed(2)}
              </p>
              <p>
                <span className="text-muted-foreground">Webhook: </span>
                {openRow.webhook_status}
              </p>
              {openRow.webhook_error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs break-all">
                  {openRow.webhook_error}
                </p>
              ) : null}
              <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-left text-xs" dir="ltr">
                {JSON.stringify(openRow.answers, null, 2)}
              </pre>
              {openRow.webhook_status === "failed" || openRow.webhook_status === "skipped" ? (
                <Button onClick={retryWebhook} disabled={retrying} className="w-full">
                  {retrying ? "שולח…" : "נסו שוב Webhook"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
