"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function LogoMark() {
  return (
    <div
      className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25"
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <path
          d="M8 22V10l6 6 6-6v12"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const isSurveys = pathname.startsWith("/admin/surveys");
  const isDocuments = pathname.startsWith("/admin/documents");

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-e border-border/50 bg-card/40 py-6 backdrop-blur-sm md:flex">
      <div className="flex items-center gap-3 px-5 pb-8">
        <LogoMark />
        <div className="min-w-0 text-right">
          <p className="text-lg font-semibold tracking-tight">Weezmo</p>
          <p className="text-xs text-muted-foreground">ניהול</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 text-sm">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-80">
          תפריט
        </p>
        <Link
          href="/admin/surveys"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5 font-medium transition-colors",
            isSurveys
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <LayoutDashboard className="size-[18px] shrink-0 opacity-90" />
          סקרי לקוחות
        </Link>
        <Link
          href="/admin/documents"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5 font-medium transition-colors",
            isDocuments
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <FileText className="size-[18px] shrink-0 opacity-90" />
          מסמכים דיגיטליים
        </Link>
        <span className="flex cursor-not-allowed items-center gap-3 rounded-2xl px-3 py-2.5 text-muted-foreground/55">
          <BarChart3 className="size-[18px] shrink-0" />
          דוחות (בקרוב)
        </span>
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-border/50 px-3 pt-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-right text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Bell className="size-[18px] shrink-0" />
          התראות
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-right text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <LifeBuoy className="size-[18px] shrink-0" />
          תמיכה
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-right text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Settings className="size-[18px] shrink-0" />
          הגדרות
        </button>
      </div>

      <div className="mx-3 mt-4 rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/25">
        <div className="flex items-start gap-2 text-right">
          <Sparkles className="mt-0.5 size-4 shrink-0 opacity-90" />
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-snug">שדרוג תוכנית</p>
            <p className="text-xs leading-relaxed opacity-90">כלים מתקדמים לניתוח סקרים בקרוב.</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="mt-3 w-full rounded-xl border-0 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
          type="button"
        >
          לפרטים
        </Button>
      </div>
    </aside>
  );
}
