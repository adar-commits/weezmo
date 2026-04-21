"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type Props = {
  branchOptions: string[];
  scoreMin: number;
  scoreMax: number;
};

function hrefWith(sp: URLSearchParams, patch: Record<string, string | undefined>) {
  const p = new URLSearchParams(sp.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === "") p.delete(k);
    else p.set(k, v);
  }
  p.set("page", "1");
  return `/admin/surveys?${p.toString()}`;
}

export function SurveyControlBar({ branchOptions, scoreMin, scoreMax }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [scoreRange, setScoreRange] = useState<[number, number]>([scoreMin, scoreMax]);

  useEffect(() => {
    setScoreRange([scoreMin, scoreMax]);
  }, [scoreMin, scoreMax]);

  const branchValue = sp.get("branch_id") ?? "__all__";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-sm md:flex-row md:flex-wrap md:items-end">
      <div className="w-full min-w-[180px] space-y-2 text-right md:w-56">
        <Label>סניף</Label>
        <Select
          value={branchValue}
          onValueChange={(v) => {
            const href = hrefWith(sp, { branch_id: v === "__all__" ? undefined : v });
            router.replace(href);
          }}
        >
          <SelectTrigger className="w-full rounded-xl border-border/60 bg-background/80">
            <SelectValue placeholder="כל הסניפים" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="__all__">כל הסניפים</SelectItem>
            {branchOptions.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[220px] flex-1 space-y-3 text-right">
        <Label>טווח ציון ממוצע ({scoreRange[0].toFixed(1)} – {scoreRange[1].toFixed(1)})</Label>
        <div
          onPointerUp={() => {
            const [a, b] = scoreRange;
            const lo = Math.min(a, b);
            const hi = Math.max(a, b);
            router.replace(
              hrefWith(sp, {
                score_min: String(Math.round(lo * 10) / 10),
                score_max: String(Math.round(hi * 10) / 10),
              })
            );
          }}
        >
          <Slider
            min={1}
            max={5}
            step={0.1}
            value={scoreRange}
            onValueChange={(v) => setScoreRange(v as [number, number])}
            className="py-2"
          />
        </div>
      </div>
    </div>
  );
}
