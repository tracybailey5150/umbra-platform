import { NextRequest, NextResponse } from "next/server";
import { ok, err, slugify } from "@umbra/shared";

/**
 * POST /api/organizations
 * Creates a new organization and initial membership for the authenticated user.
 * Called during onboarding after account creation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, industry, websiteUrl, primaryColor } = body;

    if (!name?.trim()) {
      return NextResponse.json(err("Organization name is required"), { status: 400 });
    }

    // TODO: Auth — get user from session
    // const user = await requireAuth();

    const slug = slugify(name);

    // TODO: Check slug uniqueness
    // const existing = await db.query.organizations.findFirst({
    //   where: eq(schema.organizations.slug, slug),
    // });
    // if (existing) {
    //   return NextResponse.json(err("This organization name is already taken"), { status: 409 });
    // }

    // TODO: Create org + owner membership in a transaction
    // const [org] = await db.transaction(async (tx) => {
    //   const [newOrg] = await tx.insert(schema.organizations).values({
    //     name,
    //     slug,
    //     industry,
    //     websiteUrl,
    //     brandConfig: primaryColor ? { primaryColor } : undefined,
    //   }).returning();
    //
    //   await tx.insert(schema.memberships).values({
    //     userId: user.id,
    //     organizationId: newOrg.id,
    //     role: "org_owner",
    //     status: "active",
    //     acceptedAt: new Date(),
    //   });
    //
    //   // Track analytics
    //   await tx.insert(schema.analyticsEvents).values({
    //     organizationId: newOrg.id,
    //     userId: user.id,
    //     eventName: ANALYTICS_EVENTS.ORG_CREATED,
    //     entityType: "organization",
    //     entityId: newOrg.id,
    //   });
    //
    //   return [newOrg];
    // });

    return NextResponse.json(
      ok({
        id: "stub-org-id",
        name,
        slug,
        message: "Organization created successfully",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/organizations]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

/**
 * GET /api/organizations/[id]/members
 * Lists org members — separate route, see /api/organizations/[id]/members/route.ts
 */

/**
 * POST /api/organizations/[id]/invite
 * Sends a member invitation — see /api/organizations/[id]/invite/route.ts
 */
