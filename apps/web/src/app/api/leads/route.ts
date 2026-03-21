import { NextRequest, NextResponse } from "next/server";
import { ok, err } from "@umbra/shared";

/**
 * GET /api/leads
 * Returns paginated, filtered leads for an org.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const status         = searchParams.get("status");
    const agentId        = searchParams.get("agentId");
    const assignedTo     = searchParams.get("assignedTo");
    const search         = searchParams.get("q");
    const page           = parseInt(searchParams.get("page")  ?? "1");
    const limit          = parseInt(searchParams.get("limit") ?? "20");
    const sortBy         = searchParams.get("sortBy")  ?? "createdAt";
    const sortDir        = searchParams.get("sortDir") ?? "desc";

    if (!organizationId) {
      return NextResponse.json(err("organizationId required"), { status: 400 });
    }

    // TODO: Auth — verify session user belongs to org
    // const user = await requireAuth();
    // await assertOrgMembership(user.id, organizationId);

    // TODO: Real query
    // const db = getDb();
    // const conditions = [
    //   eq(schema.leads.organizationId, organizationId),
    //   isNull(schema.leads.deletedAt),
    //   status    ? eq(schema.submissions.status, status as any) : undefined,
    //   agentId   ? eq(schema.leads.agentId, agentId)           : undefined,
    //   assignedTo ? eq(schema.leads.assignedToUserId, assignedTo) : undefined,
    //   search    ? or(
    //     ilike(schema.leads.name,  `%${search}%`),
    //     ilike(schema.leads.email, `%${search}%`),
    //   ) : undefined,
    // ].filter(Boolean);
    //
    // const [leads, [{ count }]] = await Promise.all([
    //   db.select().from(schema.leads)
    //     .where(and(...conditions))
    //     .orderBy(sortDir === "asc" ? asc(schema.leads[sortBy]) : desc(schema.leads[sortBy]))
    //     .limit(limit).offset((page - 1) * limit),
    //   db.select({ count: count() }).from(schema.leads).where(and(...conditions)),
    // ]);

    return NextResponse.json(ok({
      items: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }));
  } catch (error) {
    console.error("[GET /api/leads]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

/**
 * PATCH /api/leads
 * Bulk update leads (e.g. bulk status change, bulk assign)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadIds, updates, organizationId } = body;

    if (!leadIds?.length || !updates || !organizationId) {
      return NextResponse.json(err("leadIds, updates, and organizationId required"), { status: 400 });
    }

    // TODO: Auth check
    // TODO: Validate update fields (status, assignedToUserId, currentStageId)
    // TODO: Apply DB update

    return NextResponse.json(ok({ updated: leadIds.length }));
  } catch (error) {
    console.error("[PATCH /api/leads]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
