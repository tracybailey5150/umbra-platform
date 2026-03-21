import { NextRequest, NextResponse } from "next/server";
import { ok, err, slugify } from "@umbra/shared";
import { getDb, schema } from "@umbra/db";
import { eq, and, isNull, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(err("organizationId required"), { status: 400 });
    }

    const db = getDb();
    const items = await db.query.agents.findMany({
      where: and(
        eq(schema.agents.organizationId, organizationId),
        isNull(schema.agents.deletedAt),
      ),
      orderBy: [asc(schema.agents.createdAt)],
    });

    return NextResponse.json(ok({ items }));
  } catch (error) {
    console.error("[GET /api/agents]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, type, description, industry } = body;

    if (!organizationId || !name || !type) {
      return NextResponse.json(err("organizationId, name, and type are required"), { status: 400 });
    }

    const validTypes = ["quote", "intake", "follow_up", "buyer_search", "match", "alert"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(err(`Invalid agent type. Must be one of: ${validTypes.join(", ")}`), { status: 400 });
    }

    const db = getDb();
    const slug = slugify(name);

    const [agent] = await db.insert(schema.agents).values({
      organizationId,
      name,
      slug,
      type,
      description,
      isActive: true,
      aiConfig: {
        provider: "anthropic",
        model: "claude-sonnet-4-20250514",
        systemPromptTemplate: buildDefaultSystemPrompt(type, industry),
        temperature: 0.1,
        maxTokens: 1024,
      },
    }).returning();

    await db.insert(schema.analyticsEvents).values({
      organizationId,
      eventName: "agent.created",
      entityType: "agent",
      entityId: agent.id,
    });

    return NextResponse.json(ok({
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      type: agent.type,
      intakeUrl: `/submit/${agent.slug}`,
    }), { status: 201 });
  } catch (error) {
    console.error("[POST /api/agents]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

function buildDefaultSystemPrompt(type: string, industry?: string): string {
  const industryCtx = industry ? ` for a ${industry} business` : "";
  switch (type) {
    case "quote":
      return `You are an intelligent intake specialist${industryCtx}. Extract structured information from inbound quote requests. Score quote-readiness 0-100. Identify timeline, budget, scope, and contact completeness. Respond only in the JSON format specified.`;
    case "intake":
      return `You are an intake assistant${industryCtx}. Process inbound service requests, extract all relevant details, and identify missing information. Respond only in the JSON format specified.`;
    case "follow_up":
      return `You are a professional follow-up specialist${industryCtx}. Write warm, personalized follow-up messages that reference the specific request. Keep messages concise and actionable.`;
    default:
      return `You are an AI assistant${industryCtx}. Process incoming requests carefully and extract structured information. Respond only in the JSON format specified.`;
  }
}

export const dynamic = 'force-dynamic';
