export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { ok, err } from "@umbra/shared";

type Params = { params: { id: string } };

/**
 * GET /api/leads/[id]
 * Full lead detail with submission, notes, files, follow-ups, and timeline
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json(err("Lead ID required"), { status: 400 });

    // TODO: Auth check — verify user has access to this lead's org
    // TODO: Fetch lead with all relations:
    // const db = getDb();
    // const lead = await db.query.leads.findFirst({
    //   where: and(eq(schema.leads.id, id), isNull(schema.leads.deletedAt)),
    //   with: {
    //     submission: { with: { files: true } },
    //     notes: { orderBy: [desc(schema.notes.createdAt)] },
    //     followUps: { orderBy: [asc(schema.followUps.scheduledFor)] },
    //   },
    // });
    // if (!lead) return NextResponse.json(err("Lead not found"), { status: 404 });

    return NextResponse.json(ok({ id, message: "Lead detail endpoint — implement DB fetch" }));
  } catch (error) {
    console.error("[GET /api/leads/[id]]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

/**
 * PATCH /api/leads/[id]
 * Update a lead — status, stage, assignment, score, estimated value
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();

    const allowedFields = ["status", "currentStageId", "assignedToUserId", "score", "estimatedValue", "closedAt"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(err("No valid update fields provided"), { status: 400 });
    }

    // TODO: Auth check
    // TODO: DB update with audit trail
    // await db.update(schema.leads).set({ ...updates, updatedAt: new Date() }).where(eq(schema.leads.id, id));
    // Track analytics event for status changes
    // if (updates.status) {
    //   await db.insert(schema.analyticsEvents).values({
    //     organizationId: lead.organizationId,
    //     eventName: ANALYTICS_EVENTS.SUBMISSION_STATUS_CHANGED,
    //     entityType: "lead",
    //     entityId: id,
    //     properties: { oldStatus: lead.status, newStatus: updates.status },
    //   });
    // }

    return NextResponse.json(ok({ id, updated: updates }));
  } catch (error) {
    console.error("[PATCH /api/leads/[id]]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

/**
 * DELETE /api/leads/[id]
 * Soft-delete a lead
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    // TODO: Auth check — only org admin/owner can delete
    // await db.update(schema.leads).set({ deletedAt: new Date() }).where(eq(schema.leads.id, id));
    return NextResponse.json(ok({ id, deleted: true }));
  } catch (error) {
    console.error("[DELETE /api/leads/[id]]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}
