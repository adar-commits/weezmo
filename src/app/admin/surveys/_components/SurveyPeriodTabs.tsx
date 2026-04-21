"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SurveyPeriod } from "@/app/admin/surveys/filters";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";

const PERIODS: { id: SurveyPeriod; label: string }[] = [
  { id: "yesterday", label: "אתמול" },
  { id: "today", label: "היום" },
  { id: "week", label: "השבוע" },
  { id: "month", label: "החודש" },
  { id: "year", label: "השנה" },
  { id: "custom", label: "מותאם" },
];

function hrefWith(sp: URLSearchParams, patch: Record<string, string | undefined>) {
  const p = new URLSearchParams(sp.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) p.delete(k);
    else p.set(k, v);
  }
  p.set("page", "1");
  return `/admin/surveys?${p.toString()}`;
}

export function SurveyPeriodTabs() {
  const sp = useSearchParams();
  const current = (sp.get("period") as SurveyPeriod) || "week";
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="inline-flex flex-wrap rounded-2xl border border-border/50 bg-card/90 p-1 shadow-sm backdrop-blur-sm">
        {PERIODS.filter((x) => x.id !== "custom").map(({ id, label }) => (
          <Button
            key={id}
            variant={current === id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "rounded-xl px-3.5 transition-all",
              current === id && "shadow-md shadow-primary/15"
            )}
            asChild
          >
            <Link href={hrefWith(sp, { period: id })} prefetch={false}>
              {label}
            </Link>
          </Button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={current === "custom" ? "default" : "ghost"}
              size="sm"
              className={cn("gap-1 rounded-xl px-3", current === "custom" && "shadow-md shadow-primary/15")}
            >
              <CalendarDays className="size-4" />
              מותאם
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto space-y-3 rounded-2xl p-3 shadow-lg" align="end">
            <p className="text-right text-sm font-medium">טווח תאריכים</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Calendar mode="single" selected={from} onSelect={setFrom} />
              <Calendar mode="single" selected={to} onSelect={setTo} />
            </div>
            {from && to ? (
              <Button size="sm" className="w-full" asChild>
                <Link
                  href={hrefWith(sp, {
                    period: "custom",
                    from: format(from, "yyyy-MM-dd"),
                    to: format(to, "yyyy-MM-dd"),
                  })}
                  prefetch={false}
                >
                  החל
                </Link>
              </Button>
            ) : (
              <Button size="sm" className="w-full" disabled>
                בחרו תאריכים
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
