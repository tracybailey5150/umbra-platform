"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Bot, ExternalLink, Settings, Copy, Zap, Check } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";
import { createClient } from "@supabase/supabase-js";

interface Agent {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  is_active: boolean;
  intake_config: Record<string, unknown> | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  quote:     { label: "Quote Agent",  color: "#60A5FA", bg: "rgba(59,130,246,0.12)" },
  intake:    { label: "Intake Agent", color: "#A78BFA", bg: "rgba(139,92,246,0.12)" },
  follow_up: { label: "Follow-Up",   color: "#FCD34D", bg: "rgba(245,158,11,0.12)" },
};

function ToggleSwitch({ isOn }: { isOn: boolean }) {
  return (
    <div style={{
      width: "36px", height: "20px", borderRadius: "99px", cursor: "pointer",
      background: isOn ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)",
      border: isOn ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
      position: "relative", transition: "all 0.2s",
      display: "flex", alignItems: "center", padding: "2px",
    }}>
      <div style={{
        width: "14px", height: "14px", borderRadius: "50%",
        background: isOn ? "#818CF8" : "#475569",
        transform: isOn ? "translateX(16px)" : "translateX(0)",
        transition: "all 0.2s",
        boxShadow: isOn ? "0 0 6px rgba(129,140,248,0.5)" : "none",
      }} />
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/login"; return; }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch("/api/org", { headers: { Authorization: `Bearer ${token}` } });
      const orgData = await res.json();
      if (orgData.orgId) {
        setOrgId(orgData.orgId);
        fetchAgents(orgData.orgId);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function fetchAgents(oid: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("organization_id", oid)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error) setAgents(data ?? []);
    setLoading(false);
  }

  async function toggleAgent(id: string, currentVal: boolean) {
    setTogglingId(id);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from("agents")
      .update({ is_active: !currentVal, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentVal } : a));
    }
    setTogglingId(null);
  }

  function copyIntakeUrl(slug: string, id: string) {
    const url = `${window.location.origin}/submit/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
        <div style={{
          width: "28px", height: "28px",
          border: "3px solid rgba(59,130,246,0.15)", borderTopColor: "#3b82f6",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Agent Settings
          </h1>
          <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px", margin: "4px 0 0" }}>
            Configure and manage your active agents
          </p>
        </div>
        <Link href="/agents/new" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "9px 16px", borderRadius: "8px",
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#fff", fontSize: "13px", fontWeight: 600,
          boxShadow: "0 4px 16px rgba(99,102,241,0.3)", textDecoration: "none",
        }}>
          <Plus size={15} /> New Agent
        </Link>
      </div>

      {/* Empty state */}
      {agents.length === 0 && (
        <div style={{
          background: "#0C1220", borderRadius: "14px", padding: "64px 24px",
          border: "1px solid rgba(255,255,255,0.07)", textAlign: "center",
          marginBottom: "20px",
        }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Bot size={22} color="#6366F1" />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#CBD5E1", margin: "0 0 8px" }}>
            No agents yet
          </h3>
          <p style={{ fontSize: "13px", color: "#334155", marginBottom: "20px" }}>
            Create your first agent to get started
          </p>
          <Link href="/agents/new" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            textDecoration: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}>
            <Plus size={14} /> Create your first agent
          </Link>
        </div>
      )}

      {/* Agent grid */}
      {agents.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {agents.map((agent) => {
            const typeCfg = TYPE_CONFIG[agent.type] ?? TYPE_CONFIG.quote;
            const intakeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/submit/${agent.slug}`;
            const isCopied = copiedId === agent.id;
            return (
              <div key={agent.id} style={{
                background: "#0C1220", borderRadius: "14px", padding: "20px",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: agent.is_active ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${agent.is_active ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Bot size={17} color={agent.is_active ? "#818CF8" : "#334155"} />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#CBD5E1" }}>{agent.name}</div>
                      <span style={{
                        fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "99px",
                        background: typeCfg.bg, color: typeCfg.color, marginTop: "3px", display: "inline-block",
                      }}>
                        {typeCfg.label}
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => !togglingId && toggleAgent(agent.id, agent.is_active)}
                    style={{ cursor: togglingId ? "not-allowed" : "pointer", opacity: togglingId === agent.id ? 0.5 : 1 }}
                  >
                    <ToggleSwitch isOn={agent.is_active} />
                  </div>
                </div>

                {agent.description && (
                  <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6, margin: "0 0 16px" }}>
                    {agent.description}
                  </p>
                )}

                {/* Intake URL */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "rgba(255,255,255,0.03)", borderRadius: "8px",
                  padding: "8px 12px", marginBottom: "14px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <span style={{ fontSize: "11px", color: "#334155", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {intakeUrl}
                  </span>
                  <button
                    onClick={() => copyIntakeUrl(agent.slug, agent.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: isCopied ? "#34D399" : "#475569", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  <a href={intakeUrl} target="_blank" rel="noreferrer" style={{ color: "#475569", display: "flex" }}>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                  <div style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: agent.is_active ? "#10B981" : "#475569",
                    boxShadow: agent.is_active ? "0 0 6px rgba(16,185,129,0.5)" : "none",
                  }} />
                  <span style={{ fontSize: "12px", color: agent.is_active ? "#34D399" : "#475569" }}>
                    {agent.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link href={`/agents/${agent.id}`} style={{
                    flex: 1, padding: "8px", borderRadius: "8px", textAlign: "center",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94A3B8", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                    textDecoration: "none",
                  }}>
                    <Settings size={12} /> Configure
                  </Link>
                  <a href={intakeUrl} target="_blank" rel="noreferrer" style={{
                    flex: 1, padding: "8px", borderRadius: "8px", textAlign: "center",
                    background: "none", border: "none",
                    color: "#475569", fontSize: "12px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                    textDecoration: "none",
                  }}>
                    <ExternalLink size={12} /> Preview form
                  </a>
                </div>
              </div>
            );
          })}

          {/* Create new agent CTA */}
          <Link href="/agents/new" style={{
            borderRadius: "14px", padding: "32px",
            border: "2px dashed rgba(255,255,255,0.08)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px",
            color: "#334155", minHeight: "200px", cursor: "pointer", textDecoration: "none",
            transition: "all 0.2s",
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
              e.currentTarget.style.color = "#6366F1";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#334155";
            }}
          >
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              border: "2px dashed currentColor",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Plus size={20} />
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "inherit" }}>Create a new agent</div>
            <div style={{ fontSize: "11px", textAlign: "center", maxWidth: "160px", color: "#475569" }}>
              Quote, intake, or follow-up agents for any workflow
            </div>
          </Link>
        </div>
      )}

      {/* Phase 2 notice */}
      <div style={{
        marginTop: "24px",
        background: "linear-gradient(135deg, #0F172A, #1E1B4B)",
        borderRadius: "14px", padding: "24px",
        border: "1px solid rgba(99,102,241,0.2)",
        boxShadow: "0 4px 32px rgba(99,102,241,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={16} color="#FCD34D" />
          </div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Coming Soon — Phase 2
          </div>
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Persistent Buyer Agents
        </h3>
        <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.65, margin: 0, maxWidth: "520px" }}>
          Buyer agents that run continuously — searching, scoring, monitoring, and alerting — until the right match is found.
        </p>
      </div>
    </div>
  );
}
