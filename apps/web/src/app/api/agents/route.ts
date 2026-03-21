import { NextRequest, NextResponse } from "next/server";
import { ok, err, slugify } from "@umbra/shared";

/**
 * GET /api/agents
 * Lists all agents for an organization
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(err("organizationId required"), { status: 400 });
    }

    // TODO: Auth check
    // const db = getDb();
    // const agents = await db.query.agents.findMany({
    //   where: and(
    //     eq(schema.agents.organizationId, organizationId),
    //     isNull(schema.agents.deletedAt),
    //   ),
    //   orderBy: [asc(schema.agents.createdAt)],
    // });

    return NextResponse.json(ok({ items: [] }));
  } catch (error) {
    console.error("[GET /api/agents]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

/**
 * POST /api/agents
 * Creates a new agent with default configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, type, description, industry } = body;

    if (!organizationId || !name || !type) {
      return NextResponse.json(
        err("organizationId, name, and type are required"),
        { status: 400 }
      );
    }

    const validTypes = ["quote", "intake", "follow_up", "buyer_search", "match", "alert"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(err(`Invalid agent type. Must be one of: ${validTypes.join(", ")}`), { status: 400 });
    }

    // Build default AI config based on type
    const defaultSystemPrompt = buildDefaultSystemPrompt(type, industry);

    // TODO: Check plan limits (maxAgents)
    // TODO: Insert agent record
    // const [agent] = await db.insert(schema.agents).values({
    //   organizationId,
    //   name,
    //   slug: slugify(name),
    //   type,
    //   description,
    //   isActive: true,
    //   aiConfig: {
    //     provider: "anthropic",
    //     model: "claude-sonnet-4-20250514",
    //     systemPromptTemplate: defaultSystemPrompt,
    //     temperature: 0.1,
    //     maxTokens: 1024,
    //   },
    //   intakeConfig: buildDefaultIntakeConfig(type),
    //   followUpConfig: {
    //     enableAutoFollowUp: true,
    //     followUpIntervalHours: 24,
    //     maxFollowUps: 3,
    //   },
    // }).returning();
    //
    // Track analytics
    // await db.insert(schema.analyticsEvents).values({
    //   organizationId,
    //   eventName: ANALYTICS_EVENTS.AGENT_CREATED,
    //   entityType: "agent",
    //   entityId: agent.id,
    // });

    return NextResponse.json(ok({
      id: "stub-agent-id",
      name,
      slug: slugify(name),
      type,
      intakeUrl: `/submit/${slugify(name)}`,
    }), { status: 201 });
  } catch (error) {
    console.error("[POST /api/agents]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function buildDefaultSystemPrompt(type: string, industry?: string): string {
  const industryCtx = industry ? ` for a ${industry} business` : "";

  switch (type) {
    case "quote":
      return `You are an intelligent intake specialist${industryCtx}. Extract structured information from inbound quote requests. Score quote-readiness 0-100 based on completeness and specificity. Always identify timeline, budget signals, scope of work, and contact completeness. Respond only in the JSON format specified.`;
    case "intake":
      return `You are an intake assistant${industryCtx}. Carefully process inbound service requests, extract all relevant details, and identify what information is missing. Respond only in the JSON format specified.`;
    case "follow_up":
      return `You are a professional follow-up specialist${industryCtx}. Write warm, personalized follow-up messages that reference the specific request and create gentle urgency without being pushy. Keep messages concise and actionable.`;
    default:
      return `You are an AI assistant${industryCtx}. Process incoming requests carefully and extract structured information. Respond only in the JSON format specified.`;
  }
}
export const dynamic = 'force-dynamic';
