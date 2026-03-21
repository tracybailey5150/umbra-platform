import { NextRequest, NextResponse } from "next/server";
import { ok, err } from "@umbra/shared";
import { getDb, schema } from "@umbra/db";
import { eq, and, isNull, desc, ilike, or, inArray, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const agentId = searchParams.get("agentId");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("q");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    if (!organizationId) {
      return NextResponse.json(err("organizationId required"), { status: 400 });
    }

    const db = getDb();
    const conditions: any[] = [
      eq(schema.leads.organizationId, organizationId),
      isNull(schema.leads.deletedAt),
    ];
    if (agentId) conditions.push(eq(schema.leads.agentId, agentId));
    if (assignedTo) conditions.push(eq(schema.leads.assignedToUserId, assignedTo));
    if (search) {
      conditions.push(
        or(
          ilike(schema.leads.name, `%${search}%`),
          ilike(schema.leads.email, `%${search}%`),
        )
      );
    }

    const items = await db
      .select()
      .from(schema.leads)
      .where(and(...conditions))
      .orderBy(desc(schema.leads.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(schema.leads)
      .where(and(...conditions));

    return NextResponse.json(ok({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    }));
  } catch (error) {
    console.error("[GET /api/leads]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadIds, updates, organizationId } = body;

    if (!leadIds?.length || !updates || !organizationId) {
      return NextResponse.json(err("leadIds, updates, and organizationId required"), { status: 400 });
    }

    const db = getDb();
    const allowedFields = ["score", "assignedToUserId", "currentStageId"];
    const safeUpdates: Record<string, any> = { updatedAt: new Date() };
    for (const key of allowedFields) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }

    await db.update(schema.leads)
      .set(safeUpdates)
      .where(
        and(
          inArray(schema.leads.id, leadIds),
          eq(schema.leads.organizationId, organizationId),
        )
      );

    return NextResponse.json(ok({ updated: leadIds.length }));
  } catch (error) {
    console.error("[PATCH /api/leads]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
