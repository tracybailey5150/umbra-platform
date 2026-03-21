import { NextRequest, NextResponse } from "next/server";
import { ok, err } from "@umbra/shared";

/**
 * GET /api/analytics/summary
 * Returns aggregated metrics for an org over a time range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const range          = searchParams.get("range") ?? "30d"; // "7d" | "30d" | "90d" | "1y"
    const agentId        = searchParams.get("agentId");

    if (!organizationId) {
      return NextResponse.json(err("organizationId required"), { status: 400 });
    }

    // ── Date range calculation ────────────────────────────────────────────────
    const now  = new Date();
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // TODO: Real queries — replace stubs below with DB aggregations
    //
    // const db = getDb();
    //
    // const [submissionCount] = await db
    //   .select({ count: count() })
    //   .from(schema.submissions)
    //   .where(and(
    //     eq(schema.submissions.organizationId, organizationId),
    //     gte(schema.submissions.createdAt, from),
    //     agentId ? eq(schema.submissions.agentId, agentId) : undefined,
    //   ));
    //
    // const wonLeads = await db
    //   .select({ count: count(), totalValue: sum(schema.leads.estimatedValue) })
    //   .from(schema.leads)
    //   .where(and(
    //     eq(schema.leads.organizationId, organizationId),
    //     gte(schema.leads.closedAt, from),
    //     // join to stage type = "won"
    //   ));
    //
    // const avgScore = await db
    //   .select({ avg: avg(schema.leads.score) })
    //   .from(schema.leads)
    //   .where(and(
    //     eq(schema.leads.organizationId, organizationId),
    //     gte(schema.leads.createdAt, from),
    //   ));

    // Stub response
    return NextResponse.json(ok({
      range,
      from: from.toISOString(),
      to: now.toISOString(),
      summary: {
        totalSubmissions:   118,
        totalLeads:         112,
        quotedLeads:         38,
        wonLeads:            22,
        lostLeads:            8,
        conversionRate:    "21.2%",
        avgLeadScore:        76,
        estimatedPipelineValue: 354000,
        avgResponseTimeHours: 2.4,
      },
      byWeek: [
        { week: "Feb 17", submissions: 18, quoted: 9, won: 2 },
        { week: "Feb 24", submissions: 23, quoted: 12, won: 4 },
        { week: "Mar 3",  submissions: 19, quoted: 8, won: 3 },
        { week: "Mar 10", submissions: 31, quoted: 16, won: 5 },
        { week: "Mar 15", submissions: 24, quoted: 11, won: 3 },
      ],
      scoreDistribution: [
        { range: "0–20", count: 2 }, { range: "21–40", count: 5 },
        { range: "41–60", count: 8 }, { range: "61–80", count: 14 },
        { range: "81–100", count: 9 },
      ],
      topAgents: [
        { name: "Remodel Agent",  submissions: 22, avgScore: 88, convRate: 27 },
        { name: "Roofing Quote",  submissions: 34, avgScore: 82, convRate: 24 },
        { name: "Painting Agent", submissions: 19, avgScore: 77, convRate: 21 },
      ],
    }));
  } catch (error) {
    console.error("[GET /api/analytics/summary]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}
