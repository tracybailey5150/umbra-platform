"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Bot, ExternalLink, Settings, Copy, Zap } from "lucide-react";

const AGENTS = [
  {
    id: "a1", name: "Roofing Quote Agent", type: "quote", isActive: true,
    submissions: 34, convRate: "24%", lastActivity: "2h ago",
    intakeUrl: "https://app.umbra.ai/submit/acme-roofing",
    description: "Handles inbound roofing quote requests for residential and light commercial.",
    color: "#6366F1",
  },
  {
    id: "a2", name: "HVAC Quote Agent", type: "quote", isActive: true,
    submissions: 28, convRate: "18%", lastActivity: "4h ago",
    intakeUrl: "https://app.umbra.ai/submit/acme-hvac",
    description: "Captures and qualifies HVAC installation and replacement requests.",
    color: "#F59E0B",
  },
  {
    id: "a3", name: "Remodel Quote Agent", type: "intake", isActive: true,
    submissions: 22, convRate: "27%", lastActivity: "1d ago",
    intakeUrl: "https://app.umbra.ai/submit/acme-remodel",
    description: "Kitchen and bath remodel intake — collects scope, budget, and timeline.",
    color: "#10B981",
  },
  {
    id: "a4", name: "Follow-Up Agent", type: "follow_up", isActive: false,
    submissions: 0, convRate: "—", lastActivity: "Never",
    intakeUrl: null,
    description: "Re-engages leads that haven't responded after 3+ days. Draft only.",
    color: "#8B5CF6",
  },
];

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
  const [agents, setAgents] = useState(AGENTS);

  const toggleAgent = (id: string) => {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {agents.map((agent) => {
          const typeCfg = TYPE_CONFIG[agent.type] ?? TYPE_CONFIG.quote;
          return (
            <div
              key={agent.id}
              style={{
                background: "#0C1220", borderRadius: "14px", padding: "20px",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: agent.isActive ? `${agent.color}18` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${agent.isActive ? agent.color + "30" : "rgba(255,255,255,0.06)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bot size={17} color={agent.isActive ? agent.color : "#334155"} />
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
                <div onClick={() => toggleAgent(agent.id)} style={{ cursor: "pointer" }}>
                  <ToggleSwitch isOn={agent.isActive} />
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6, marginBottom: "16px", margin: "0 0 16px" }}>
                {agent.description}
              </p>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                {[
                  { label: "Submissions",   value: agent.submissions },
                  { label: "Conv. Rate",    value: agent.convRate },
                  { label: "Last Activity", value: agent.lastActivity },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "10px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#CBD5E1" }}>{s.value}</div>
                    <div style={{ fontSize: "10px", color: "#334155", marginTop: "2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Intake URL */}
              {agent.intakeUrl && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "rgba(255,255,255,0.03)", borderRadius: "8px",
                  padding: "8px 12px", marginBottom: "14px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <span style={{ fontSize: "11px", color: "#334155", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {agent.intakeUrl}
                  </span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: "2px" }}>
                    <Copy size={12} />
                  </button>
                  <a href={agent.intakeUrl} target="_blank" rel="noreferrer" style={{ color: "#475569", display: "flex" }}>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

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
                <Link href={`/agents/${agent.id}/preview`} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", textAlign: "center",
                  background: "none", border: "none",
                  color: "#475569", fontSize: "12px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                  textDecoration: "none",
                }}>
                  <ExternalLink size={12} /> Preview form
                </Link>
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

      {/* Future agents notice */}
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
          Car, property, land, equipment, jewelry, and more.
        </p>
      </div>
    </div>
  );
}
