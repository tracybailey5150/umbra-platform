import { NextRequest, NextResponse } from "next/server";
import { ok, err } from "@umbra/shared";
import { createQuoteAgent } from "@umbra/agents";

/**
 * GET /api/follow-ups
 * Returns follow-ups for an org, filterable by status and agent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const status         = searchParams.get("status");
    const leadId         = searchParams.get("leadId");
    const limit          = parseInt(searchParams.get("limit") ?? "20");

    if (!organizationId) {
      return NextResponse.json(err("organizationId required"), { status: 400 });
    }

    // TODO: DB query
    // const followUps = await db.query.followUps.findMany({
    //   where: and(
    //     eq(schema.followUps.organizationId, organizationId),
    //     status ? eq(schema.followUps.status, status as any) : undefined,
    //     leadId ? eq(schema.followUps.leadId, leadId) : undefined,
    //   ),
    //   orderBy: [asc(schema.followUps.scheduledFor)],
    //   limit,
    // });

    return NextResponse.json(ok({ items: [] }));
  } catch (error) {
    console.error("[GET /api/follow-ups]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

/**
 * POST /api/follow-ups/generate
 * Generates an AI draft follow-up for a lead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, organizationId, followUpNumber = 1, tone = "professional" } = body;

    if (!leadId || !organizationId) {
      return NextResponse.json(err("leadId and organizationId required"), { status: 400 });
    }

    // TODO: Fetch lead + submission summary from DB
    // const lead = await db.query.leads.findFirst({
    //   where: eq(schema.leads.id, leadId),
    //   with: { submission: true },
    // });
    // if (!lead) return NextResponse.json(err("Lead not found"), { status: 404 });

    // Generate follow-up with AI
    const agentService = createQuoteAgent({ provider: "anthropic" });

    const draft = await agentService.generateFollowUpMessage({
      leadName: "Marcus T.", // Replace with lead.name
      submissionSummary: "Roof replacement, 2,400 sqft, asphalt shingles preferred", // Replace with lead.submission.aiSummary
      followUpNumber,
      businessName: "Acme Services", // Replace with org.name
      tone: tone as "professional" | "friendly" | "urgent",
    });

    // Optionally persist the draft as a pending follow-up
    // await db.insert(schema.followUps).values({
    //   organizationId,
    //   leadId,
    //   scheduledFor: new Date(),
    //   channel: "email",
    //   status: "pending",
    //   subject: draft.subject,
    //   body: draft.body,
    //   isAiGenerated: true,
    // });

    return NextResponse.json(ok({
      subject: draft.subject,
      body: draft.body,
      isAiGenerated: true,
    }));
  } catch (error) {
    console.error("[POST /api/follow-ups]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

/**
 * PATCH /api/follow-ups/[id]/send
 * Marks a follow-up as sent (and triggers actual send via email provider)
 * See /api/follow-ups/[id]/route.ts
 */
