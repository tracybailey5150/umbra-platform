"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, ArrowRight, Bot } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";
import { createClient } from "@supabase/supabase-js";

const INDUSTRIES = [
  "Home Services", "HVAC", "Roofing", "Remodeling", "Landscaping", "Real Estate", "Other",
];

const AGENT_TYPES = [
  { id: "quote",    label: "Quote Agent",    desc: "Capture and qualify inbound quote requests" },
  { id: "intake",   label: "Intake Agent",   desc: "General intake with AI-powered extraction" },
  { id: "follow_up", label: "Follow-Up Agent", desc: "Re-engage cold leads automatically" },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  background: "#070C18", border: "1px solid rgba(255,255,255,0.1)",
  color: "#F1F5F9", fontSize: "14px", outline: "none",
  boxSizing: "border-box",
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Step 1
  const [orgName, setOrgName] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);

  // Step 2
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState("quote");
  const [agentIndustry, setAgentIndustry] = useState("");
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Step 3
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/login"; return; }
      setUserId(user.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);

        // Get org
        const res = await fetch("/api/org", { headers: { Authorization: `Bearer ${session.access_token}` } });
        const orgData = await res.json();
        if (orgData.orgId) {
          setOrgId(orgData.orgId);
          setOrgName(orgData.org?.name ?? "");

          // If already onboarded, skip to dashboard
          if (orgData.org?.onboardingCompleted) {
            window.location.href = "/dashboard";
          }
        }
      }
    });
  }, []);

  async function handleSaveOrg() {
    if (!orgName.trim() || !orgId) return;
    setSavingOrg(true);
    setOrgError(null);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("organizations")
      .update({ name: orgName.trim(), updated_at: new Date().toISOString() })
      .eq("id", orgId);

    setSavingOrg(false);
    if (error) { setOrgError(error.message); return; }
    setStep(2);
  }

  async function handleCreateAgent() {
    if (!agentName.trim() || !orgId) return;
    setCreatingAgent(true);
    setAgentError(null);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const slug = slugify(agentName);

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        organization_id: orgId,
        name: agentName.trim(),
        slug,
        type: agentType,
        description: null,
        is_active: true,
        intake_config: { industry: agentIndustry || null },
      })
      .select("id, slug")
      .single();

    if (error) {
      // Slug conflict
      if (error.code === "23505") {
        const slug2 = `${slug}-${Date.now().toString().slice(-4)}`;
        const { data: a2, error: e2 } = await supabase
          .from("agents")
          .insert({
            organization_id: orgId,
            name: agentName.trim(),
            slug: slug2,
            type: agentType,
            is_active: true,
          })
          .select("id, slug")
          .single();
        if (e2) { setAgentError(e2.message); setCreatingAgent(false); return; }
        setCreatedSlug(a2!.slug);
      } else {
        setAgentError(error.message);
        setCreatingAgent(false);
        return;
      }
    } else {
      setCreatedSlug(agent!.slug);
    }

    // Mark onboarding complete
    await supabase
      .from("organizations")
      .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
      .eq("id", orgId);

    setCreatingAgent(false);
    setStep(3);
  }

  const intakeUrl = createdSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/submit/${createdSlug}`
    : "";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", minHeight: "70vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
          }}>
            <Bot size={22} color="#fff" />
          </div>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700,
                  background: step > s ? "rgba(16,185,129,0.12)" : step === s ? "#6366F1" : "rgba(255,255,255,0.05)",
                  color: step > s ? "#10B981" : step === s ? "#fff" : "#334155",
                  border: step > s ? "1px solid rgba(16,185,129,0.3)" : step === s ? "none" : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.3s",
                }}>
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && <div style={{ width: "32px", height: "1px", background: step > s ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Welcome — set org name */}
        {step === 1 && (
          <div style={{
            background: "#0C1220", borderRadius: "16px", padding: "32px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Welcome to Umbra 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 28px", lineHeight: 1.6 }}>
              Let's get your workspace set up. First, what's your business name?
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: "6px" }}>
                Business / Organization name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Roofing & HVAC"
                style={inputStyle}
                onKeyDown={(e) => e.key === "Enter" && orgName.trim() && handleSaveOrg()}
              />
            </div>

            {orgError && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#F87171" }}>
                {orgError}
              </div>
            )}

            <button
              onClick={handleSaveOrg}
              disabled={!orgName.trim() || savingOrg}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                background: orgName.trim() ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "rgba(255,255,255,0.05)",
                color: orgName.trim() ? "#fff" : "#334155", fontSize: "14px", fontWeight: 700,
                border: "none", cursor: orgName.trim() ? "pointer" : "not-allowed",
                boxShadow: orgName.trim() ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {savingOrg ? (
                <>
                  <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Saving…
                </>
              ) : (
                <>Continue <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Create first agent */}
        {step === 2 && (
          <div style={{
            background: "#0C1220", borderRadius: "16px", padding: "32px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Create your first agent
            </h1>
            <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 24px", lineHeight: 1.6 }}>
              An agent is your AI-powered intake form that captures and qualifies leads.
            </p>

            {/* Agent type pills */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: "8px" }}>Agent type</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {AGENT_TYPES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setAgentType(id)}
                    style={{
                      padding: "7px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                      background: agentType === id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                      color: agentType === id ? "#818CF8" : "#475569",
                      border: agentType === id ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.07)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Agent name */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: "6px" }}>
                Agent name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. Roofing Quote Agent"
                style={inputStyle}
              />
            </div>

            {/* Industry */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: "6px" }}>Industry</label>
              <select
                value={agentIndustry}
                onChange={(e) => setAgentIndustry(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            {agentError && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#F87171" }}>
                {agentError}
              </div>
            )}

            <button
              onClick={handleCreateAgent}
              disabled={!agentName.trim() || creatingAgent}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                background: agentName.trim() ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "rgba(255,255,255,0.05)",
                color: agentName.trim() ? "#fff" : "#334155", fontSize: "14px", fontWeight: 700,
                border: "none", cursor: agentName.trim() ? "pointer" : "not-allowed",
                boxShadow: agentName.trim() ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {creatingAgent ? (
                <>
                  <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Creating agent…
                </>
              ) : (
                <>Create agent <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        )}

        {/* Step 3: You're live! */}
        {step === 3 && (
          <div style={{
            background: "#0C1220", borderRadius: "16px", padding: "32px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            textAlign: "center",
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <CheckCircle2 size={28} color="#10B981" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              You're live! 🎉
            </h1>
            <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 28px", lineHeight: 1.6 }}>
              Your AI agent is ready. Share the intake form link with your customers to start capturing leads.
            </p>

            {/* Intake URL */}
            <div style={{
              background: "#070C18", borderRadius: "10px", padding: "14px",
              border: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px",
              textAlign: "left",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                Your intake form URL
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#818CF8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {intakeUrl}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(intakeUrl).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2500);
                    });
                  }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "6px 12px", borderRadius: "6px",
                    background: copied ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
                    border: `1px solid ${copied ? "rgba(16,185,129,0.25)" : "rgba(99,102,241,0.25)"}`,
                    color: copied ? "#34D399" : "#818CF8",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff", fontSize: "14px", fontWeight: 700,
              textDecoration: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}>
              Go to Dashboard <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
