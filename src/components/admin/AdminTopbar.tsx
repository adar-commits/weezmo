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

type Props = {
  title: string;
  email: string;
};

export function AdminTopbar({ title, email }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const exportHref =
    pathname.startsWith("/admin/surveys") && qs
      ? `/api/admin/surveys/export?${qs}`
      : pathname.startsWith("/admin/surveys")
        ? "/api/admin/surveys/export"
        : "/api/admin/surveys/export";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="min-w-0 text-right">
          <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
          <p className="truncate text-xs text-muted-foreground" dir="ltr">
            {email}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="outline" size="sm" className="hidden gap-1 sm:inline-flex" asChild>
            <a href={exportHref}>
              <Download className="size-4" />
              ייצוא CSV
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/surveys${qs ? `?${qs}` : ""}`} prefetch={false} aria-label="רענון">
              <RefreshCw className="size-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="הגדרות">
                <Settings className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[12rem]">
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
    </header>
  );
}
