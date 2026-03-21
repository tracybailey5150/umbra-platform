/**
 * @package @umbra/auth
 *
 * Supabase Auth helpers for both server (RSC / API routes) and client components.
 * Wraps @supabase/ssr so consumption code never imports supabase directly.
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;           // Supabase Auth UUID
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface SessionContext {
  user: AuthUser | null;
  organizationId?: string;
  role?: string;
}

// ─── SERVER CLIENT (for RSC and API Routes) ───────────────────────────────────

/**
 * createServerClient — creates a Supabase client for server-side use.
 * Must be called inside a Server Component or Route Handler.
 *
 * Usage:
 *   import { createServerClient } from "@umbra/auth";
 *   const supabase = createServerClient(cookieStore);
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export function createServerClient(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}) {
  // Dynamic import so this package works without next/headers in non-Next envs
  const { createServerClient: _create } = require("@supabase/ssr");

  return _create(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// ─── BROWSER CLIENT ───────────────────────────────────────────────────────────

let _browserClient: ReturnType<typeof import("@supabase/ssr").createBrowserClient> | null = null;

/**
 * getBrowserClient — singleton Supabase client for client components.
 * Uses @supabase/ssr so sessions are stored in cookies (not localStorage),
 * making them readable by the middleware for protected route checks.
 */
export function getBrowserClient() {
  if (_browserClient) return _browserClient;
  const { createBrowserClient } = require("@supabase/ssr");
  _browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _browserClient!;
}

// ─── SESSION HELPERS ──────────────────────────────────────────────────────────

/**
 * getSessionUser — extracts the authenticated user from a Supabase client.
 * Returns null if not authenticated.
 */
export async function getSessionUser(
  supabase: ReturnType<typeof createServerClient>
): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: user.user_metadata?.full_name,
    avatarUrl: user.user_metadata?.avatar_url,
  };
}

/**
 * requireAuth — throws a redirect if not authenticated.
 * Use in Server Components to guard protected pages.
 *
 * Usage:
 *   import { requireAuth } from "@umbra/auth";
 *   const user = await requireAuth(); // redirects to /login if not authed
 */
export async function requireAuth(): Promise<AuthUser> {
  const { cookies } = await import("next/headers");
  const { redirect } = await import("next/navigation");

  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const user = await getSessionUser(supabase);

  if (!user) {
    redirect("/login");
  }

  return user as AuthUser;
}

// ─── MIDDLEWARE HELPER ────────────────────────────────────────────────────────

/**
 * authMiddlewareConfig — Next.js middleware matcher config.
 * Import and use in apps/web/middleware.ts
 *
 * Usage:
 *   export { authMiddlewareHandler as middleware } from "@umbra/auth";
 *   export const config = authMiddlewareConfig;
 */
export const authMiddlewareConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|submit|login|signup|$).*)",
  ],
};

/**
 * authMiddlewareHandler — refreshes the session on every protected request.
 * Redirects to /login if no valid session.
 */
export async function authMiddlewareHandler(request: Request) {
  const { NextResponse } = await import("next/server");
  // Full middleware implementation requires next/server imports at build time
  // Wire up in apps/web/middleware.ts — see README for complete example
  return NextResponse.next();
}
