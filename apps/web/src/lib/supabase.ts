/**
 * Supabase client helpers for the web app.
 * These wrap @umbra/auth to keep app code clean.
 */

import { createServerClient, getBrowserClient } from "@umbra/auth";
import { cookies } from "next/headers";

/**
 * createClient — server-side Supabase client for RSC and API Routes.
 * Usage: const supabase = createClient();
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient({
    get: (name) => cookieStore.get(name),
  });
}

/**
 * createBrowserClient — client-side Supabase instance.
 * Usage in "use client" components: const supabase = createBrowserClient();
 */
export { getBrowserClient as createBrowserClient };
