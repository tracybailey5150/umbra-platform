import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@umbra/auth";

/**
 * Middleware — refreshes Supabase session and redirects unauthenticated users.
 *
 * Protected routes: everything under /(app) route group
 * Public routes: /, /login, /signup, /submit/*, /api/submissions (public intake)
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Build a cookie accessor from the request
  const supabase = createServerClient({
    get: (name) => request.cookies.get(name),
  });

  // Refresh session — this keeps the auth token alive
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Define protected path prefixes
  const protectedPaths = ["/dashboard", "/leads", "/agents", "/analytics", "/team", "/settings"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authed users away from login/signup
  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - /submit/* (public intake forms)
     */
    "/((?!_next/static|_next/image|favicon.ico|submit).*)",
  ],
};
