import { NextRequest, NextResponse } from "next/server";
import { createQuoteAgent } from "@umbra/agents";
import { ok, err } from "@umbra/shared";

/**
 * POST /api/submissions
 * 
 * Handles intake form submissions from the public-facing form.
 * Flow:
 *   1. Validate payload
 *   2. Store raw submission in DB
 *   3. Trigger async AI processing
 *   4. Return success + submission ID
 * 
 * In production, step 3 would be dispatched to a background job queue
 * (e.g. Supabase Edge Functions, Inngest, or similar) so the HTTP response
 * is immediate and AI processing happens asynchronously.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { agentId, organizationId, formData, submitterMeta } = body;

    if (!agentId || !organizationId || !formData) {
      return NextResponse.json(err("Missing required fields: agentId, organizationId, formData"), { status: 400 });
    }

    // ── In production: fetch agent config from DB ──────────────────────────
    // const db = getDb();
    // const agent = await db.query.agents.findFirst({ where: eq(schema.agents.id, agentId) });
    // if (!agent) return NextResponse.json(err("Agent not found"), { status: 404 });

    // ── Store raw submission ───────────────────────────────────────────────
    // const [submission] = await db.insert(schema.submissions).values({
    //   agentId,
    //   organizationId,
    //   submitterName: formData.name,
    //   submitterEmail: formData.email,
    //   submitterPhone: formData.phone,
    //   rawData: formData,
    //   status: "new",
    //   sourceUrl: submitterMeta?.sourceUrl,
    //   ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    //   userAgent: request.headers.get("user-agent") ?? undefined,
    // }).returning();

    // ── AI processing (in production: dispatch to background job) ──────────
    // For MVP, we process inline and update the submission record
    const agent = createQuoteAgent({
      provider: "anthropic",
      businessContext: "Home services business — roofing, HVAC, remodeling",
    });

    // NOTE: In production this runs in a background job, not inline
    let aiResult;
    try {
      aiResult = await agent.processSubmission(formData);
    } catch (aiError) {
      // AI failure is non-blocking — submission is still stored
      console.error("[AI] Failed to process submission:", aiError);
    }

    // ── Update submission with AI output ──────────────────────────────────
    // if (aiResult) {
    //   await db.update(schema.submissions)
    //     .set({
    //       aiSummary: aiResult.summary,
    //       aiStructuredData: aiResult,
    //       aiMissingFields: aiResult.missingFields,
    //       aiSuggestedNextSteps: aiResult.suggestedNextSteps,
    //       aiProcessedAt: new Date(),
    //     })
    //     .where(eq(schema.submissions.id, submission.id));
    // }

    // ── Create lead record from submission ────────────────────────────────
    // await db.insert(schema.leads).values({
    //   submissionId: submission.id,
    //   organizationId,
    //   agentId,
    //   name: formData.name,
    //   email: formData.email,
    //   phone: formData.phone,
    //   score: aiResult?.quoteReadyScore ?? 0,
    //   estimatedValue: aiResult?.estimatedValue,
    // });

    // ── Track analytics event ─────────────────────────────────────────────
    // await db.insert(schema.analyticsEvents).values({
    //   organizationId,
    //   agentId,
    //   eventName: ANALYTICS_EVENTS.AGENT_FORM_SUBMITTED,
    //   entityType: "submission",
    //   entityId: submission.id,
    // });

    return NextResponse.json(
      ok({
        submissionId: "stub-submission-id", // Replace with submission.id
        message: "Submission received and being processed.",
        aiScore: aiResult?.quoteReadyScore,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/submissions] Error:", error);
    return NextResponse.json(
      err("Internal server error", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

/**
 * GET /api/submissions
 * Returns paginated submissions for an org (authenticated)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    if (!organizationId) {
      return NextResponse.json(err("organizationId is required"), { status: 400 });
    }

    // TODO: Auth check — verify user belongs to org

    // const db = getDb();
    // const submissions = await db.query.submissions.findMany({
    //   where: and(
    //     eq(schema.submissions.organizationId, organizationId),
    //     status ? eq(schema.submissions.status, status as any) : undefined,
    //     isNull(schema.submissions.deletedAt),
    //   ),
    //   orderBy: [desc(schema.submissions.createdAt)],
    //   limit,
    //   offset: (page - 1) * limit,
    // });

    // Stub response for MVP scaffolding
    return NextResponse.json(ok({ items: [], total: 0, page, limit }));
  } catch (error) {
    console.error("[GET /api/submissions] Error:", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}
