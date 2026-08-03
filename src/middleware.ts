import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isEmailAllowlisted } from "@/lib/admin-allowlist";
import {
  getAppBaseUrl,
  getTrackingHostname,
  isCustomerFacingHost,
} from "@/lib/public-urls";

function requestHostname(request: NextRequest): string {
  const host = request.headers.get("host") ?? request.nextUrl.hostname;
  return host.toLowerCase().split(":")[0] ?? host;
}

function handleBrandedSubdomain(request: NextRequest): NextResponse | null {
  const hostname = requestHostname(request);
  const { pathname } = request.nextUrl;

  if (!isCustomerFacingHost(hostname)) {
    return null;
  }

  if (pathname.startsWith("/admin")) {
    const adminUrl = new URL(pathname + request.nextUrl.search, getAppBaseUrl());
    return NextResponse.redirect(adminUrl);
  }

  const trackingHost = getTrackingHostname();
  if (trackingHost && hostname === trackingHost && pathname === "/") {
    const trackUrl = request.nextUrl.clone();
    trackUrl.pathname = "/track";
    return NextResponse.redirect(trackUrl);
  }

  return NextResponse.next({ request });
}

export async function middleware(request: NextRequest) {
  const branded = handleBrandedSubdomain(request);
  if (branded) {
    if (branded.status >= 300 && branded.status < 400) {
      return branded;
    }
  }

  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/admin")) {
    return branded ?? NextResponse.next({ request });
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"],
};
