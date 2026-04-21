"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function hrefWith(sp: URLSearchParams, q: string) {
  const p = new URLSearchParams(sp.toString());
  if (q.trim()) p.set("q", q.trim());
  else p.delete("q");
  p.set("page", "1");
  return `/admin/surveys?${p.toString()}`;
}

export function AdminDashboardSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get("q") ?? "");

  useEffect(() => {
    setValue(sp.get("q") ?? "");
  }, [sp]);

  const debouncedPush = useMemo(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    return (next: string) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => router.replace(next), 400);
    };
  }, [router]);

  const onChange = useCallback(
    (v: string) => {
      setValue(v);
      debouncedPush(hrefWith(sp, v));
    },
    [debouncedPush, sp]
  );

  return (
    <div className="relative w-full min-w-0 md:max-w-md">
      <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        dir="rtl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="חיפוש לקוח, טלפון או הזמנה…"
        className="h-11 rounded-2xl border-border/60 bg-background/80 pe-10 ps-4 shadow-sm backdrop-blur-sm transition-shadow focus-visible:ring-primary/25"
        aria-label="חיפוש בתגובות"
      />
    </div>
  );
}
