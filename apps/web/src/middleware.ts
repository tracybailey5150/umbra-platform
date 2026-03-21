import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client with full cookie read/write — required for token refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...(options as any) });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...(options as any) });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...(options as any) });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...(options as any) });
        },
      },
    }
  );

  // Refresh session — keeps auth token alive and sets updated cookies on response
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Auth redirect for login/signup only — dashboard auth handled client-side
  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|submit).*)",
  ],
};
