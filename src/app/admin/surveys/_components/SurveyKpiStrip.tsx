"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SurveyKpis } from "@/app/admin/surveys/queries";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

function DeltaPct({ cur, prev }: { cur: number; prev: number }) {
  if (prev === 0) return null;
  const pct = ((cur - prev) / prev) * 100;
  const up = pct >= 0;
  return (
    <Badge
      variant={up ? "secondary" : "destructive"}
      className="gap-0.5 rounded-full px-2.5 text-xs font-normal"
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {pct.toFixed(0)}%
    </Badge>
  );
}

function DeltaNum({ cur, prev, digits = 2 }: { cur: number; prev: number; digits?: number }) {
  const d = cur - prev;
  if (Math.abs(d) < 0.0001) return null;
  const up = d >= 0;
  return (
    <Badge
      variant={up ? "secondary" : "destructive"}
      className="gap-0.5 rounded-full px-2.5 text-xs font-normal"
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {d > 0 ? "+" : ""}
      {d.toFixed(digits)}
    </Badge>
  );
}

type Props = { kpis: SurveyKpis };

export function SurveyKpiStrip({ kpis }: Props) {
  const chartData = kpis.daily.map((d) => ({
    day: d.day,
    cnt: d.cnt,
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card className="border-0 xl:col-span-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 text-right">
          <CardTitle className="text-sm font-medium text-muted-foreground">סה״כ תגובות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-right">
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-3xl font-bold tabular-nums">{kpis.responsesCount}</span>
            <DeltaPct cur={kpis.responsesCount} prev={kpis.responsesPrev} />
          </div>
          <p className="text-xs text-muted-foreground">חלון קודם: {kpis.responsesPrev}</p>
          <div className="h-24 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillCnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <Tooltip
                  contentStyle={{
                    direction: "rtl",
                    textAlign: "right",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 24px rgb(15 23 42 / 0.12)",
                  }}
                  formatter={(value) => [String(value ?? ""), "תגובות"]}
                  labelFormatter={(l) => String(l)}
                />
                <Area type="monotone" dataKey="cnt" stroke="var(--color-primary)" fill="url(#fillCnt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0">
        <CardHeader className="pb-2 text-right">
          <CardTitle className="text-sm font-medium text-muted-foreground">ציון ממוצע</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-right">
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-3xl font-bold tabular-nums">
              {kpis.avgScore.toFixed(2)}
              <span className="text-lg font-normal text-muted-foreground">/5</span>
            </span>
            <DeltaNum cur={kpis.avgScore} prev={kpis.avgScorePrev} />
          </div>
          <p className="text-xs text-muted-foreground">קודם: {kpis.avgScorePrev.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="border-0">
        <CardHeader className="pb-2 text-right">
          <CardTitle className="text-sm font-medium text-muted-foreground">שיעור 5 כוכבים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-right">
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-3xl font-bold tabular-nums">{kpis.pctFiveStar.toFixed(1)}%</span>
            <DeltaNum cur={kpis.pctFiveStar} prev={kpis.pctFiveStarPrev} digits={1} />
          </div>
          <p className="text-xs text-muted-foreground">קודם: {kpis.pctFiveStarPrev.toFixed(1)}%</p>
        </CardContent>
      </Card>

      <Card className="border-0">
        <CardHeader className="pb-2 text-right">
          <CardTitle className="text-sm font-medium text-muted-foreground">שיעור השלמה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-right">
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-3xl font-bold tabular-nums">
              {(kpis.completionRate * 100).toFixed(1)}%
            </span>
            <DeltaNum cur={kpis.completionRate * 100} prev={kpis.completionPrev * 100} digits={1} />
          </div>
          <p className="text-xs text-muted-foreground">תגובות / מסמכי סקר שנוצרו בטווח</p>
        </CardContent>
      </Card>

      <Card className="border-0">
        <CardHeader className="pb-2 text-right">
          <CardTitle className="text-sm font-medium text-muted-foreground">סניף מוביל</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-right">
          <p className="text-lg font-semibold leading-tight">{kpis.topBranchLabel}</p>
          <p className="text-2xl font-bold tabular-nums text-primary">{kpis.topBranchAvg.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{kpis.topBranchCount} תגובות</p>
        </CardContent>
      </Card>

      <Card className="border-0">
        <CardHeader className="pb-2 text-right">
          <CardTitle className="text-sm font-medium text-muted-foreground">שאלה חלשה ביותר</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-right">
          <p className="font-mono text-sm font-medium leading-tight" dir="ltr">
            {kpis.worstQuestionId}
          </p>
          <p className="text-2xl font-bold tabular-nums text-destructive">{kpis.worstQuestionAvg.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">ממוצע שאלה</p>
        </CardContent>
      </Card>
    </div>
  );
}
