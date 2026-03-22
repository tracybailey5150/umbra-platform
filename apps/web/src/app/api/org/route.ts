import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();

  try {
    // Get Bearer token from Authorization header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up internal user record by supabase_auth_id
    const { data: userRecord } = await supabase
      .from("users")
      .select("id")
      .eq("supabase_auth_id", user.id)
      .maybeSingle();

    const internalUserId = userRecord?.id;
    if (!internalUserId) {
      return NextResponse.json({ orgId: null, org: null }, { status: 200 });
    }

    // Query memberships → organization_id
    const { data: membership, error: memberErr } = await supabase
      .from("memberships")
      .select("organization_id, role")
      .eq("user_id", internalUserId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (memberErr) {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // If no membership, check if user has an org directly by creating one
    if (!membership) {
      return NextResponse.json({ orgId: null, org: null }, { status: 200 });
    }

    // Fetch org details
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id, name, slug, onboarding_completed")
      .eq("id", membership.organization_id)
      .maybeSingle();

    if (orgErr || !org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    return NextResponse.json({
      orgId: org.id,
      org: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        onboardingCompleted: org.onboarding_completed ?? false,
      },
    });
  } catch (err) {
    console.error("[/api/org]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
