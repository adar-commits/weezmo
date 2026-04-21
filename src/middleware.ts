import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isEmailAllowlisted } from "@/lib/admin-allowlist";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/auth/")) {
    return supabaseResponse;
  }

  if (!user) {
    const u = request.nextUrl.clone();
    u.pathname = "/admin/login";
    u.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(u);
  }

  if (!isEmailAllowlisted(user.email)) {
    const u = request.nextUrl.clone();
    u.pathname = "/admin/login";
    u.searchParams.set("error", "forbidden");
    return NextResponse.redirect(u);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
