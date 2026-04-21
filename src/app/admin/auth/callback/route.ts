import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * OAuth (e.g. Google) return URL. Session cookies MUST be written onto the same
 * `NextResponse` as the redirect — using `cookies()` from `next/headers` here often
 * does not attach auth cookies to the browser, so SSO appears to "fail" after Google.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") ?? "/admin/surveys";
  const safeNext = nextParam.startsWith("/") ? nextParam : "/admin/surveys";
  const oauthError = requestUrl.searchParams.get("error");
  const oauthDesc = requestUrl.searchParams.get("error_description");

  const loginWith = (params: Record<string, string>) => {
    const u = new URL("/admin/login", requestUrl.origin);
    for (const [k, v] of Object.entries(params)) {
      if (v) u.searchParams.set(k, v);
    }
    return NextResponse.redirect(u);
  };

  if (oauthError) {
    return loginWith({
      error: "auth",
      message: (oauthDesc ?? oauthError).slice(0, 300),
    });
  }

  if (!code) {
    return loginWith({ error: "auth" });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return loginWith({ error: "config" });
  }

  const redirectTarget = new URL(safeNext, requestUrl.origin);
  const response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === "production",
            sameSite: options?.sameSite ?? "lax",
            path: options?.path ?? "/",
          });
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("OAuth exchange error:", error.message);
    return loginWith({ error: "auth", message: error.message.slice(0, 300) });
  }

  return response;
}
