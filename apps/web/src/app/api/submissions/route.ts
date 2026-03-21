import { NextRequest, NextResponse } from "next/server";
import { createQuoteAgent } from "@umbra/agents";
import { ok, err } from "@umbra/shared";
import { getDb, schema } from "@umbra/db";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, organizationId, formData, submitterMeta } = body;

    if (!agentId || !organizationId || !formData) {
      return NextResponse.json(err("Missing required fields: agentId, organizationId, formData"), { status: 400 });
    }

    const db = getDb();

    // Verify agent exists
    const agent = await db.query.agents.findFirst({
      where: eq(schema.agents.id, agentId),
    });
    if (!agent) return NextResponse.json(err("Agent not found"), { status: 404 });

    // Store raw submission
    const [submission] = await db.insert(schema.submissions).values({
      agentId,
      organizationId,
      submitterName: formData.name ?? null,
      submitterEmail: formData.email ?? null,
      submitterPhone: formData.phone ?? null,
      rawData: formData,
      status: "new",
      sourceUrl: submitterMeta?.sourceUrl ?? null,
      ipAddress: request.headers.get("x-forwarded-for") ?? null,
      userAgent: request.headers.get("user-agent") ?? null,
    }).returning();

    // AI processing (inline for MVP; move to background job for scale)
    let aiResult;
    try {
      const aiAgent = createQuoteAgent({
        provider: "anthropic",
        businessContext: "General services business",
      });
      aiResult = await aiAgent.processSubmission(formData);
    } catch (aiError) {
      console.error("[AI] Failed to process submission:", aiError);
    }

    // Update submission with AI output
    if (aiResult) {
      await db.update(schema.submissions)
        .set({
          aiSummary: aiResult.summary,
          aiStructuredData: aiResult,
          aiMissingFields: aiResult.missingFields,
          aiSuggestedNextSteps: aiResult.suggestedNextSteps,
          aiProcessedAt: new Date(),
          status: "reviewing",
        })
        .where(eq(schema.submissions.id, submission.id));
    }

    // Create lead
    await db.insert(schema.leads).values({
      submissionId: submission.id,
      organizationId,
      agentId,
      name: formData.name ?? null,
      email: formData.email ?? null,
      phone: formData.phone ?? null,
      score: aiResult?.quoteReadyScore ?? 0,
      estimatedValue: aiResult?.estimatedValue ? String(aiResult.estimatedValue) : null,
    });

    // Track analytics
    await db.insert(schema.analyticsEvents).values({
      organizationId,
      agentId,
      eventName: "agent.form.submitted",
      entityType: "submission",
      entityId: submission.id,
    });

    return NextResponse.json(
      ok({
        submissionId: submission.id,
        message: "Submission received and being processed.",
        aiScore: aiResult?.quoteReadyScore,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/submissions] Error:", error);
    return NextResponse.json(err("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}

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

    const db = getDb();
    const conditions = [
      eq(schema.submissions.organizationId, organizationId),
      isNull(schema.submissions.deletedAt),
      ...(status ? [eq(schema.submissions.status, status as typeof schema.submissions.$inferSelect.status)] : []),
    ];

    const items = await db.query.submissions.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.submissions.createdAt)],
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json(ok({ items, total: items.length, page, limit }));
  } catch (error) {
    console.error("[GET /api/submissions] Error:", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
