import { NextResponse, type NextRequest } from "next/server";

// Auth is handled client-side on protected pages.
// This middleware is intentionally minimal.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
