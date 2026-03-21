"use client";
import { CreditCard, Building2, Users, Bell, Shield, ChevronRight, CheckCircle2 } from "lucide-react";

const PLAN = {
  name: "Pro Plan",
  price: "$29/mo",
  nextBilling: "April 1, 2026",
  highlights: [
    "Up to 5 AI agents",
    "Unlimited lead submissions",
    "AI-generated follow-ups",
    "Email & SMS notifications",
    "Analytics dashboard",
  ],
};

const SETTINGS_SECTIONS = [
  { icon: Building2, label: "Organization", desc: "Name, logo, brand settings" },
  { icon: Users,     label: "Team & Permissions", desc: "Manage members and roles" },
  { icon: Bell,      label: "Notifications", desc: "Alerts, emails, and digests" },
  { icon: Shield,    label: "Security", desc: "Password, 2FA, sessions" },
];

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  background: "#070C18", border: "1px solid rgba(255,255,255,0.1)",
  color: "#F1F5F9", fontSize: "13px", outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block", fontSize: "11px", fontWeight: 600, color: "#64748B",
  textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px",
};

export default function SettingsPage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
          Settings & Billing
        </h1>
        <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px", margin: "4px 0 0" }}>
          Manage your organization and subscription
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Organization form */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "22px",
            border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#F1F5F9", marginBottom: "18px", margin: "0 0 18px" }}>
              Organization
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Org name */}
              <div>
                <label style={labelStyle}>Organization name</label>
                <input type="text" defaultValue="Acme Services" style={inputStyle} />
              </div>

              {/* Slug */}
              <div>
                <label style={labelStyle}>Slug (used in URLs)</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{
                    padding: "9px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRight: "none",
                    borderRadius: "8px 0 0 8px",
                    fontSize: "12px", color: "#475569",
                    whiteSpace: "nowrap",
                  }}>
                    umbra.ai/org/
                  </span>
                  <input
                    type="text"
                    defaultValue="acme-services"
                    style={{
                      ...inputStyle,
                      borderRadius: "0 8px 8px 0",
                      borderLeft: "none",
                      flex: 1,
                    }}
                  />
                </div>
              </div>

              {/* Industry + Timezone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Industry</label>
                  <select style={inputStyle}>
                    <option>Home Services</option>
                    <option>Construction</option>
                    <option>Real Estate</option>
                    <option>Automotive</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Timezone</label>
                  <select style={inputStyle}>
                    <option>America/Chicago</option>
                    <option>America/New_York</option>
                    <option>America/Los_Angeles</option>
                    <option>America/Denver</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: "18px", paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", justifyContent: "flex-end",
            }}>
              <button style={{
                padding: "8px 18px", borderRadius: "8px",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}>
                Save changes
              </button>
            </div>
          </div>

          {/* Settings nav */}
          <div style={{
            background: "#0C1220", borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            {SETTINGS_SECTIONS.map(({ icon: Icon, label, desc }, idx) => (
              <button
                key={label}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px 20px",
                  borderBottom: idx < SETTINGS_SECTIONS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={16} color="#64748B" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>{label}</div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{desc}</div>
                </div>
                <ChevronRight size={15} color="#334155" />
              </button>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Current plan */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "20px",
            border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
              Current Plan
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#F1F5F9" }}>{PLAN.name}</div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#6366F1", marginTop: "2px" }}>{PLAN.price}</div>
              </div>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "99px",
                background: "rgba(16,185,129,0.12)", color: "#34D399",
              }}>
                Active
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#475569", marginBottom: "16px" }}>
              Next billing: {PLAN.nextBilling}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {PLAN.highlights.map((h) => (
                <div key={h} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94A3B8" }}>
                  <CheckCircle2 size={13} color="#34D399" />
                  {h}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button style={{
                width: "100%", padding: "8px", borderRadius: "8px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#94A3B8", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                <CreditCard size={13} />
                Manage billing
              </button>
              <button style={{
                width: "100%", padding: "8px", borderRadius: "8px",
                background: "none", border: "none",
                color: "#475569", fontSize: "12px", cursor: "pointer",
              }}>
                View invoices
              </button>
            </div>
          </div>

          {/* Upgrade nudge */}
          <div style={{
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            borderRadius: "14px", padding: "20px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(199,210,254,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Upgrade Available
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              White-Label Install
            </div>
            <p style={{ fontSize: "12px", color: "rgba(199,210,254,0.8)", lineHeight: 1.6, marginBottom: "14px", margin: "0 0 14px" }}>
              Custom domain, unlimited agents, full white-label branding.
            </p>
            <button style={{
              width: "100%", padding: "9px", borderRadius: "8px",
              background: "#fff", color: "#4F46E5",
              fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "none",
            }}>
              View plan details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
