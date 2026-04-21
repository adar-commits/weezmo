import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/session";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<div className="h-14 border-b bg-card" />}>
        <AdminTopbar title="סקרי לקוחות" email={user?.email ?? ""} />
      </Suspense>
      <div className="flex flex-1">
        <AdminSidebar current="surveys" />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
