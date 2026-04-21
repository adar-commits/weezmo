import { createSupabaseServerClient } from "@/lib/supabase/session";
import { isEmailAllowlisted } from "@/lib/admin-allowlist";

export async function requireAdminSession(): Promise<{ email: string } | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;
    if (!isEmailAllowlisted(user.email)) return null;
    return { email: user.email };
  } catch {
    return null;
  }
}
