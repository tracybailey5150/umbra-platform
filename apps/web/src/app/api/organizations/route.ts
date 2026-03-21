import { NextRequest, NextResponse } from "next/server";
import { ok, err, slugify } from "@umbra/shared";
import { getDb, schema } from "@umbra/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, industry, websiteUrl, primaryColor, userId } = body;

    if (!name?.trim()) {
      return NextResponse.json(err("Organization name is required"), { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(err("userId is required"), { status: 400 });
    }

    const db = getDb();
    const slug = slugify(name);

    // Check slug uniqueness
    const [existing] = await db
      .select({ id: schema.organizations.id })
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);
    if (existing) {
      return NextResponse.json(err("This organization name is already taken"), { status: 409 });
    }

    // Create org + owner membership in a transaction
    const org = await db.transaction(async (tx) => {
      const [newOrg] = await tx.insert(schema.organizations).values({
        name,
        slug,
        industry: industry ?? null,
      websiteUrl: websiteUrl ?? null,
      brandConfig: primaryColor ? { primaryColor } : null,
      }).returning();

      await tx.insert(schema.memberships).values({
        userId,
        organizationId: newOrg.id,
        role: "org_owner",
        status: "active",
      });

      await tx.insert(schema.analyticsEvents).values({
        organizationId: newOrg.id,
        userId,
        eventName: "org.created",
        entityType: "organization",
        entityId: newOrg.id,
      });

      return newOrg;
    });

    return NextResponse.json(
      ok({ id: org.id, name: org.name, slug: org.slug, message: "Organization created successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/organizations]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
