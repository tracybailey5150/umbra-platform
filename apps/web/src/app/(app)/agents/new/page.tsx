"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, Zap, MessageSquare, CheckCircle2, Copy, Check, ExternalLink } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";
import { createClient } from "@supabase/supabase-js";

const AGENT_TYPES = [
  {
    id: "quote",
    label: "Quote Agent",
    icon: Bot,
    desc: "Capture and structure inbound quote requests. AI extracts key details and scores lead quality.",
    examples: ["Roofing quotes", "HVAC estimates", "Remodel bids"],
  },
  {
    id: "intake",
    label: "Intake Agent",
    icon: Zap,
    desc: "General purpose intake form with AI-powered information extraction and pipeline tracking.",
    examples: ["Service requests", "Consultation bookings", "Project intake"],
  },
  {
    id: "follow_up",
    label: "Follow-Up Agent",
    icon: MessageSquare,
    desc: "Re-engage leads that haven't responded. AI drafts personalized follow-ups on schedule.",
    examples: ["3-day follow-up", "Abandoned quote recovery", "Re-engagement"],
  },
];

const INDUSTRIES = [
  "Home Services", "HVAC", "Roofing", "Remodeling", "Landscaping", "Real Estate", "Other",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

type Step = "type" | "details" | "launch";

// ─── Input style helper ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  background: "#070C18", border: "1px solid rgba(255,255,255,0.1)",
  color: "#F1F5F9", fontSize: "13px", outline: "none",
  boxSizing: "border-box",
};

export default function NewAgentPage() {
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<string>("");
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");
  const [industry, setIndustry] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [autoRespond, setAutoRespond] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setIsCreating(true);
    setError(null);

    try {
      const authSupabase = getBrowserClient();
      const { data: { user } } = await authSupabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data: { session } } = await authSupabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No session token");

      // Get org
      const res = await fetch("/api/org", { headers: { Authorization: `Bearer ${token}` } });
      const orgData = await res.json();
      if (!orgData.orgId) throw new Error("No organization found");

      const slug = slugify(agentName);

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: agent, error: insertError } = await supabase
        .from("agents")
        .insert({
          organization_id: orgData.orgId,
          name: agentName.trim(),
          slug,
          type: selectedType,
          description: agentDesc.trim() || null,
          is_active: true,
          intake_config: {
            welcomeMessage: welcomeMessage.trim() || null,
            autoRespond,
            industry: industry || null,
          },
        })
        .select("id, slug")
        .single();

      if (insertError) {
        // Slug conflict — append timestamp
        if (insertError.code === "23505") {
          const slugWithTs = `${slug}-${Date.now().toString().slice(-4)}`;
          const { data: agent2, error: err2 } = await supabase
            .from("agents")
            .insert({
              organization_id: orgData.orgId,
              name: agentName.trim(),
              slug: slugWithTs,
              type: selectedType,
              description: agentDesc.trim() || null,
              is_active: true,
              intake_config: {
                welcomeMessage: welcomeMessage.trim() || null,
                autoRespond,
                industry: industry || null,
              },
            })
            .select("id, slug")
            .single();
          if (err2) throw new Error(err2.message);
          setCreatedSlug(agent2!.slug);
          setCreatedId(agent2!.id);
        } else {
          throw new Error(insertError.message);
        }
      } else {
        setCreatedSlug(agent!.slug);
        setCreatedId(agent!.id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create agent");
    } finally {
      setIsCreating(false);
    }
  }

  // Success screen
  if (createdSlug) {
    const intakeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/submit/${createdSlug}`;
    return (
      <div style={{ maxWidth: "520px", margin: "0 auto", paddingTop: "48px", textAlign: "center" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <CheckCircle2 size={28} color="#10B981" />
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Agent created!
        </h1>
        <p style={{ fontSize: "14px", color: "#475569", marginBottom: "28px" }}>
          <strong style={{ color: "#CBD5E1" }}>{agentName}</strong> is ready to receive leads.
        </p>

        {/* Intake URL card */}
        <div style={{
          background: "#0C1220", borderRadius: "12px", padding: "20px",
          border: "1px solid rgba(255,255,255,0.07)", marginBottom: "20px",
          textAlign: "left",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
            Your intake form URL
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#070C18", borderRadius: "8px", padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
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
                background: "none", border: "none", cursor: "pointer",
                color: copied ? "#34D399" : "#475569",
                display: "flex", alignItems: "center", gap: "4px",
                fontSize: "12px", fontWeight: 600,
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <a href={intakeUrl} target="_blank" rel="noreferrer" style={{ color: "#475569", display: "flex" }}>
              <ExternalLink size={13} />
            </a>
          </div>
          <p style={{ fontSize: "11px", color: "#334155", marginTop: "10px", margin: "10px 0 0" }}>
            Share this link with your customers to start collecting leads.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <Link href="/agents" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 20px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            textDecoration: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}>
            View agents →
          </Link>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 16px", borderRadius: "8px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94A3B8", fontSize: "13px", fontWeight: 600, textDecoration: "none",
          }}>
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <Link href="/agents" style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B",
          textDecoration: "none",
        }}>
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#F1F5F9", margin: 0, letterSpacing: "-0.02em" }}>New Agent</h1>
          <p style={{ fontSize: "12px", color: "#475569", margin: "3px 0 0" }}>Configure a new AI agent for your workspace</p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
        {(["type", "details", "launch"] as Step[]).map((s, i) => {
          const stepIndex = ["type", "details", "launch"].indexOf(step);
          const isActive = s === step;
          const isDone = i < stepIndex;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700,
                  background: isDone ? "rgba(16,185,129,0.12)" : isActive ? "#6366F1" : "rgba(255,255,255,0.05)",
                  color: isDone ? "#10B981" : isActive ? "#fff" : "#334155",
                  border: isDone ? "1px solid rgba(16,185,129,0.3)" : isActive ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: isActive ? "#F1F5F9" : isDone ? "#10B981" : "#334155", textTransform: "capitalize" }}>
                  {s}
                </span>
              </div>
              {i < 2 && <div style={{ width: "24px", height: "1px", background: "rgba(255,255,255,0.08)" }} />}
            </div>
          );
        })}
      </div>

      {/* Step: Choose type */}
      {step === "type" && (
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px", letterSpacing: "-0.01em" }}>Choose agent type</h2>
          <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 20px" }}>Select the type of agent that fits your workflow.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {AGENT_TYPES.map(({ id, label, icon: Icon, desc, examples }) => (
              <button
                key={id}
                onClick={() => setSelectedType(id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "14px",
                  padding: "16px", borderRadius: "12px", textAlign: "left",
                  background: selectedType === id ? "rgba(99,102,241,0.08)" : "#0C1220",
                  border: `1px solid ${selectedType === id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
                  cursor: "pointer", width: "100%", transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
                  background: selectedType === id ? "#6366F1" : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={18} color={selectedType === id ? "#fff" : "#475569"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#475569", marginBottom: "8px", lineHeight: 1.5 }}>{desc}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {examples.map((e) => (
                      <span key={e} style={{
                        fontSize: "10px", padding: "2px 8px", borderRadius: "99px",
                        background: "rgba(255,255,255,0.05)", color: "#64748B",
                      }}>{e}</span>
                    ))}
                  </div>
                </div>
                {selectedType === id && (
                  <CheckCircle2 size={16} color="#818CF8" style={{ flexShrink: 0, marginTop: "2px" }} />
                )}
              </button>
            ))}
          </div>
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button
              disabled={!selectedType}
              onClick={() => setStep("details")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "8px",
                background: selectedType ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "rgba(255,255,255,0.05)",
                color: selectedType ? "#fff" : "#334155", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: selectedType ? "pointer" : "not-allowed",
                opacity: selectedType ? 1 : 0.5,
              }}
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Details */}
      {step === "details" && (
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px", letterSpacing: "-0.01em" }}>Agent details</h2>
          <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 20px" }}>Give your agent a name and business context.</p>

          <div style={{ background: "#0C1220", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Agent name */}
            <div>
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
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: "6px" }}>Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: "6px" }}>Description</label>
              <textarea
                rows={3}
                value={agentDesc}
                onChange={(e) => setAgentDesc(e.target.value)}
                placeholder="Briefly describe what this agent will handle. AI uses this for better extraction."
                style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
              />
            </div>

            {/* Welcome message */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: "6px" }}>
                Welcome message <span style={{ fontSize: "11px", color: "#334155", fontWeight: 400 }}>optional — shown on intake form</span>
              </label>
              <textarea
                rows={2}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="e.g. Hi! Tell us about your project and we'll get back to you within 2 hours."
                style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
              />
            </div>

            {/* Auto-respond toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>Auto-respond</div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>AI automatically sends a draft response to new leads</div>
              </div>
              <div
                onClick={() => setAutoRespond(!autoRespond)}
                style={{ cursor: "pointer" }}
              >
                <div style={{
                  width: "40px", height: "22px", borderRadius: "99px",
                  background: autoRespond ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)",
                  border: autoRespond ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", padding: "2px", transition: "all 0.2s",
                }}>
                  <div style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    background: autoRespond ? "#818CF8" : "#475569",
                    transform: autoRespond ? "translateX(18px)" : "translateX(0)",
                    transition: "all 0.2s",
                  }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => setStep("type")} style={{
              padding: "9px 16px", borderRadius: "8px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#64748B", fontSize: "13px", cursor: "pointer",
            }}>
              ← Back
            </button>
            <button
              disabled={!agentName.trim()}
              onClick={() => setStep("launch")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "8px",
                background: agentName.trim() ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "rgba(255,255,255,0.05)",
                color: agentName.trim() ? "#fff" : "#334155", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: agentName.trim() ? "pointer" : "not-allowed",
                opacity: agentName.trim() ? 1 : 0.5,
              }}
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Review & Launch */}
      {step === "launch" && (
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px", letterSpacing: "-0.01em" }}>Review & launch</h2>
          <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 20px" }}>Confirm your agent settings before creating.</p>

          <div style={{ background: "#0C1220", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "16px" }}>
            {[
              { label: "Agent type",      value: AGENT_TYPES.find((t) => t.id === selectedType)?.label ?? selectedType },
              { label: "Name",            value: agentName },
              { label: "Industry",        value: industry || "—" },
              { label: "Description",     value: agentDesc || "—" },
              { label: "Welcome message", value: welcomeMessage || "—" },
              { label: "Auto-respond",    value: autoRespond ? "Enabled" : "Disabled" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "12px", color: "#475569", flexShrink: 0, width: "130px" }}>{label}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#CBD5E1", textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Slug preview */}
          <div style={{
            background: "rgba(99,102,241,0.06)", borderRadius: "10px", padding: "14px",
            border: "1px solid rgba(99,102,241,0.15)", marginBottom: "20px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              Intake form URL preview
            </div>
            <div style={{ fontSize: "12px", color: "#818CF8" }}>
              {typeof window !== "undefined" ? window.location.origin : ""}/submit/<strong>{slugify(agentName)}</strong>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", padding: "12px 14px", marginBottom: "16px",
              fontSize: "13px", color: "#F87171",
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => setStep("details")} style={{
              padding: "9px 16px", borderRadius: "8px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#64748B", fontSize: "13px", cursor: "pointer",
            }}>
              ← Back
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "10px 24px", borderRadius: "8px",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: isCreating ? "not-allowed" : "pointer",
                opacity: isCreating ? 0.7 : 1,
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              {isCreating ? (
                <>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                  Creating…
                </>
              ) : (
                <>
                  <Bot size={14} /> Create agent
                </>
              )}
            </button>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
