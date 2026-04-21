"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Download, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminDashboardSearch } from "@/components/admin/AdminDashboardSearch";

type Props = {
  subtitle?: string;
  email: string;
  displayName?: string;
};

function greetingFromEmail(email: string, displayName?: string) {
  if (displayName?.trim()) return displayName.trim();
  const local = email.split("@")[0]?.replace(/\./g, " ");
  return local || "משתמש";
}

export function AdminTopbar({ subtitle, email, displayName }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const exportHref =
    pathname.startsWith("/admin/surveys") && qs
      ? `/api/admin/surveys/export?${qs}`
      : pathname.startsWith("/admin/surveys")
        ? "/api/admin/surveys/export"
        : "/api/admin/surveys/export";

  const name = greetingFromEmail(email, displayName);

  return (
    <header className="border-b border-border/40 bg-card/30 backdrop-blur-md">
      <div className="space-y-5 px-4 py-5 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-1 text-right">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              שלום, {name}!
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {subtitle ?? "סקירת ביצועי הסקרים בתקופה שנבחרה."}
            </p>
            {email ? (
              <p className="truncate text-xs text-muted-foreground/80" dir="ltr">
                {email}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-1.5 rounded-xl border-border/70 bg-background/80 shadow-sm sm:inline-flex"
              asChild
            >
              <a href={exportHref}>
                <Download className="size-4" />
                ייצוא CSV
              </a>
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl border-border/70 bg-background/80 shadow-sm" asChild>
              <Link href={`/admin/surveys${qs ? `?${qs}` : ""}`} prefetch={false} aria-label="רענון">
                <RefreshCw className="size-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-border/70 bg-background/80 shadow-sm"
                  aria-label="הגדרות"
                >
                  <Settings className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48 rounded-xl">
                <DropdownMenuItem asChild>
                  <a href={exportHref}>ייצוא CSV</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action="/admin/auth/signout" method="post">
                    <button type="submit" className="w-full text-right">
                      יציאה
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <AdminDashboardSearch />
      </div>
    </header>
  );
}
