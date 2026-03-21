import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { agentSlug, name, email, phone, description } = await req.json();

    if (!agentSlug || !name || !email || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Look up agent by slug
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, organization_id, name, type")
      .eq("slug", agentSlug)
      .eq("is_active", true)
      .single();

    if (agentError || !agent) {
      // Use a fallback org if agent not found — still capture the lead
      const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
      if (!org) return NextResponse.json({ error: "No organization found" }, { status: 404 });

      // Create a default agent for demo purposes
      const { data: newAgent } = await supabase.from("agents").insert({
        organization_id: org.id,
        name: "General Intake Agent",
        slug: agentSlug,
        type: "intake",
        is_active: true,
        description: "Auto-created intake agent",
      }).select().single();

      if (!newAgent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

      return handleSubmission(newAgent.id, org.id, name, email, phone, description);
    }

    return handleSubmission(agent.id, agent.organization_id, name, email, phone, description);
  } catch (err: any) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleSubmission(
  agentId: string,
  orgId: string,
  name: string,
  email: string,
  phone: string,
  description: string
) {
  // 2. Insert submission
  const { data: submission, error: subError } = await supabase
    .from("submissions")
    .insert({
      agent_id: agentId,
      organization_id: orgId,
      submitter_name: name,
      submitter_email: email,
      submitter_phone: phone,
      raw_data: { name, email, phone, description },
      status: "new",
    })
    .select()
    .single();

  if (subError || !submission) {
    console.error("Submission insert error:", subError);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  // 3. AI processing (non-blocking — fire and update)
  processWithAI(submission.id, agentId, orgId, name, email, phone, description);

  return NextResponse.json({ success: true, submissionId: submission.id });
}

async function processWithAI(
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
- score: number 0-100 (lead quality based on urgency, budget signals, detail level, project size)
- category: string (e.g. "Roof Replacement", "HVAC Installation", "Kitchen Remodel")
- estimatedValue: string (e.g. "$8,000–$12,000" or "Unknown — need more info")
- summary: string (1-2 sentence summary of the request)
- draftResponse: string (a professional, warm response to send to this lead — 3-4 sentences, acknowledge their request, mention you'll follow up shortly)
- missingInfo: array of strings (what info would help qualify this lead better)
- urgency: "high" | "medium" | "low"`,
        },
        {
          role: "user",
          content: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "not provided"}\nRequest: ${description}`,
        },
      ],
    });

    const ai = JSON.parse(completion.choices[0].message.content || "{}");

    // Update submission with AI results
    await supabase
      .from("submissions")
      .update({
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
      })
      .eq("id", submissionId);

    // 4. Create lead record
    await supabase.from("leads").insert({
      submission_id: submissionId,
      organization_id: orgId,
      agent_id: agentId,
      name,
      email,
      phone,
      score: ai.score || 0,
      estimated_value: parseEstimatedValue(ai.estimatedValue),
      status: "new",
    });

  } catch (err) {
    console.error("AI processing error:", err);
    // Still create lead even if AI fails
    await supabase.from("leads").insert({
      submission_id: submissionId,
      organization_id: orgId,
      agent_id: agentId,
      name, email, phone,
      score: 0,
      status: "new",
    });
  }
}

function parseEstimatedValue(val: string): number | null {
  if (!val) return null;
  const match = val.match(/\$?([\d,]+)/);
  if (!match) return null;
  return parseInt(match[1].replace(/,/g, ""), 10);
}
