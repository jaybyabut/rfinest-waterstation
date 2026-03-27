import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {

    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }


  if (
    user &&
    (request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/auth"))
  ) {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    const role = supabaseUser?.app_metadata?.role || supabaseUser?.user_metadata?.role;

    const url = request.nextUrl.clone();
    if (role === "admin") {
      url.pathname = "/dashboard";
    } else if (role === "employee") {
      url.pathname = "/tablet";
    } else if (role === "station") {
      url.pathname = "/queueDisplay";
    } else {
      url.pathname = "/home";
    }
    return NextResponse.redirect(url);
  }

  // Route protection for specific dashboards
  if (user) {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    const role = supabaseUser?.app_metadata?.role || supabaseUser?.user_metadata?.role;
    const path = request.nextUrl.pathname;

    // Admin is allowed to visit any endpoint
    if (role === "admin") return supabaseResponse;

    if (path.startsWith("/dashboard") && role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    if (path.startsWith("/tablet") && role !== "employee") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    if (path.startsWith("/queueDisplay") && role !== "station") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
