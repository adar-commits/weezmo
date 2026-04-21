import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { current: "surveys" };

export function AdminSidebar({ current }: Props) {
  return (
    <aside className="hidden w-52 shrink-0 border-e border-border/60 bg-card md:block">
      <nav className="flex flex-col gap-0.5 p-3 text-sm">
        <Link
          href="/admin/surveys"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-right font-medium transition-colors",
            current === "surveys"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <LayoutDashboard className="size-4 shrink-0 opacity-70" />
          סקרי לקוחות
        </Link>
      </nav>
    </aside>
  );
}
