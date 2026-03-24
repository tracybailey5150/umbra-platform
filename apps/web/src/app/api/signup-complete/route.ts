import { sendWelcomeEmail } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();

  try {
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, orgName, industry } = await req.json();

    // 1. Upsert user record
    let internalUserId: string;
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("supabase_auth_id", user.id)
      .maybeSingle();

    if (existingUser) {
      internalUserId = existingUser.id;
    } else {
      const { data: newUser, error: userErr } = await supabase
        .from("users")
        .insert({
          supabase_auth_id: user.id,
          email: user.email,
          full_name: fullName ?? user.user_metadata?.full_name ?? null,
        })
        .select("id")
        .single();

      if (userErr || !newUser) {
        console.error("User insert error:", userErr);
        return NextResponse.json({ error: "Failed to create user record" }, { status: 500 });
      }
      internalUserId = newUser.id;
    }

    // 2. Check if user already has an org
    const { data: existingMembership } = await supabase
      .from("memberships")
      .select("organization_id")
      .eq("user_id", internalUserId)
      .eq("status", "active")
      .maybeSingle();

    if (existingMembership) {
      // Already onboarded
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    // 3. Create org
    const resolvedOrgName = orgName?.trim() || `${fullName ?? "My"}'s Business`;
    let slug = slugify(resolvedOrgName);

    // Ensure slug uniqueness
    const { data: slugCheck } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugCheck) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({
        name: resolvedOrgName,
        slug,
        industry: industry ?? null,
      })
      .select("id")
      .single();

    if (orgErr || !org) {
      console.error("Org insert error:", orgErr);
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    // 4. Create membership
    const { error: memberErr } = await supabase
      .from("memberships")
      .insert({
        user_id: internalUserId,
        organization_id: org.id,
        role: "org_owner",
        status: "active",
      });

    if (memberErr) {
      console.error("Membership insert error:", memberErr);
      // Don't fail — org was created
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email ?? "", fullName ?? "").catch(() => {})

    return NextResponse.json({ success: true, orgId: org.id });

  } catch (err) {
    console.error("[/api/signup-complete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
