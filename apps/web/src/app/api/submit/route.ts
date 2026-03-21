import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Lazy init — must be inside handler to avoid build-time env var issues
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();

  try {
    const { agentSlug, name, email, phone, description } = await req.json();

    if (!agentSlug || !name || !email || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Look up agent by slug
    const { data: agent } = await supabase
      .from("agents")
      .select("id, organization_id, name, type")
      .eq("slug", agentSlug)
      .eq("is_active", true)
      .single();

    let agentId: string;
    let orgId: string;

    if (!agent) {
      // Auto-create agent + use first org for demo purposes
      const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
      if (!org) return NextResponse.json({ error: "No organization found" }, { status: 404 });

      const { data: newAgent } = await supabase.from("agents").insert({
        organization_id: org.id,
        name: agentSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        slug: agentSlug,
        type: "intake",
        is_active: true,
        description: "Auto-created intake agent",
      }).select().single();

      if (!newAgent) return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
      agentId = newAgent.id;
      orgId = org.id;
    } else {
      agentId = agent.id;
      orgId = agent.organization_id;
    }

    // 2. Insert submission
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert({
        agent_id: agentId,
        organization_id: orgId,
        submitter_name: name,
        submitter_email: email,
        submitter_phone: phone || null,
        raw_data: { name, email, phone, description },
        status: "new",
      })
      .select()
      .single();

    if (subError || !submission) {
      console.error("Submission insert error:", subError);
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    // 3. AI processing — fire async, don't await (returns immediately to user)
    processWithAI(supabase, getOpenAI(), submission.id, agentId, orgId, name, email, phone, description);

    return NextResponse.json({ success: true, submissionId: submission.id });

  } catch (err: unknown) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function processWithAI(
  supabase: ReturnType<typeof getSupabase>,
  openai: OpenAI,
  submissionId: string,
  agentId: string,
  orgId: string,
  name: string,
  email: string,
  phone: string,
  description: string
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a lead qualification AI for a service business. Analyze inbound service requests and return a JSON object with these exact fields:
- score: number 0-100 (lead quality: urgency, budget signals, detail level, project size)
- category: string (e.g. "Roof Replacement", "HVAC Installation", "Kitchen Remodel")
- estimatedValue: string (e.g. "$8,000–$12,000" or "Unknown — need more info")
- summary: string (1-2 sentence summary)
- draftResponse: string (warm professional response, 3-4 sentences, acknowledge request, say you will follow up shortly)
- missingInfo: array of strings (what info would help qualify this lead)
- urgency: "high" | "medium" | "low"`,
        },
        {
          role: "user",
          content: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "not provided"}\nRequest: ${description}`,
        },
      ],
    });

    const ai = JSON.parse(completion.choices[0].message.content || "{}");

    await supabase.from("submissions").update({
      ai_summary: ai.summary,
      ai_structured_data: {
        score: ai.score,
        category: ai.category,
        estimatedValue: ai.estimatedValue,
        draftResponse: ai.draftResponse,
        urgency: ai.urgency,
      },
      ai_missing_fields: ai.missingInfo || [],
      ai_suggested_next_steps: [`Send draft response to ${email}`, "Schedule callback"],
      ai_processed_at: new Date().toISOString(),
    }).eq("id", submissionId);

    // Create lead record
    await supabase.from("leads").insert({
      submission_id: submissionId,
      organization_id: orgId,
      agent_id: agentId,
      name,
      email,
      phone: phone || null,
      score: ai.score || 0,
      estimated_value: parseEstimatedValue(ai.estimatedValue),
      status: "new",
    });

  } catch (err) {
    console.error("AI processing error:", err);
    // Still create lead even if AI fails
    try {
      await supabase.from("leads").insert({
        submission_id: submissionId,
        organization_id: orgId,
        agent_id: agentId,
        name, email,
        phone: phone || null,
        score: 0,
        status: "new",
      });
    } catch (e) {
      console.error("Lead insert fallback failed:", e);
    }
  }
}

function parseEstimatedValue(val: string): number | null {
  if (!val) return null;
  const match = val.match(/\$?([\d,]+)/);
  if (!match) return null;
  return parseInt(match[1].replace(/,/g, ""), 10);
}
