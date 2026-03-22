"use client";
import { useState } from "react";
import { CreditCard, Building2, Bell, Shield, CheckCircle2, Save } from "lucide-react";

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

const inputStyle: React.CSSProperties = {
  width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px",
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
  color: "#F1F5F9", fontSize: "13px", outline: "none",
  boxSizing: "border-box", transition: "border 0.15s, box-shadow 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 700, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px",
};

const SETTINGS_TABS = [
  { id: "org",    label: "Organization", icon: Building2 },
  { id: "notifs", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"org" | "notifs" | "security">("org");

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
          Settings & Billing
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", marginTop: "4px", margin: "4px 0 0" }}>
          Manage your organization and subscription
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Tab bar */}
          <div style={{
            display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)",
            borderRadius: "12px", padding: "5px", width: "fit-content",
          }}>
            {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  background: activeTab === id ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
                  color: activeTab === id ? "#fff" : "#64748B",
                  boxShadow: activeTab === id ? "0 2px 8px rgba(99,102,241,0.35)" : "none",
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Org tab */}
          {activeTab === "org" && (
            <div style={{
              background: "#0C1220", borderRadius: "14px", padding: "22px",
              border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 18px" }}>
                Organization
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Organization name</label>
                  <input type="text" defaultValue="Acme Services" style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Slug (used in URLs)</label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{
                      padding: "0 12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRight: "none",
                      borderRadius: "8px 0 0 8px",
                      fontSize: "12px", color: "#475569",
                      whiteSpace: "nowrap",
                      height: "40px", display: "flex", alignItems: "center",
                    }}>
                      umbra.ai/org/
                    </span>
                    <input
                      type="text"
                      defaultValue="acme-services"
                      style={{ ...inputStyle, borderRadius: "0 8px 8px 0", borderLeft: "none", flex: 1 }}
                    />
                  </div>
                </div>
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
              <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
                <button style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 18px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  color: "#fff", fontSize: "13px", fontWeight: 600,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}>
                  <Save size={13} /> Save changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {activeTab === "notifs" && (
            <div style={{
              background: "#0C1220", borderRadius: "14px", padding: "22px",
              border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 18px" }}>
                Notifications
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "Email on new lead", desc: "Get notified when a new submission arrives", defaultChecked: true },
                  { label: "Daily digest", desc: "Summary email of leads and follow-up activity", defaultChecked: true },
                  { label: "Follow-up reminders", desc: "Alerts when follow-ups are due", defaultChecked: false },
                  { label: "Team mentions", desc: "When someone mentions you in a comment", defaultChecked: true },
                ].map((n) => (
                  <div key={n.label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#F1F5F9" }}>{n.label}</div>
                      <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{n.desc}</div>
                    </div>
                    <div style={{
                      width: "36px", height: "20px", borderRadius: "99px", cursor: "pointer",
                      background: n.defaultChecked ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)",
                      border: n.defaultChecked ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
                      position: "relative", display: "flex", alignItems: "center", padding: "2px",
                    }}>
                      <div style={{
                        width: "14px", height: "14px", borderRadius: "50%",
                        background: n.defaultChecked ? "#818CF8" : "#475569",
                        transform: n.defaultChecked ? "translateX(16px)" : "translateX(0)",
                        transition: "all 0.2s",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
                <button style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 18px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  color: "#fff", fontSize: "13px", fontWeight: 600,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}>
                  <Save size={13} /> Save preferences
                </button>
              </div>
            </div>
          )}

          {/* Security tab */}
          {activeTab === "security" && (
            <div style={{
              background: "#0C1220", borderRadius: "14px", padding: "22px",
              border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 18px" }}>
                Security
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Current password</label>
                  <input type="password" placeholder="••••••••" style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>New password</label>
                  <input type="password" placeholder="••••••••" style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm new password</label>
                  <input type="password" placeholder="••••••••" style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div style={{
                  padding: "14px", borderRadius: "10px",
                  background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#F1F5F9", marginBottom: "4px" }}>
                    Two-factor authentication
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "12px" }}>
                    Add an extra layer of security to your account
                  </div>
                  <button style={{
                    padding: "7px 14px", borderRadius: "8px",
                    background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                    color: "#818CF8", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  }}>
                    Enable 2FA
                  </button>
                </div>
              </div>
              <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
                <button style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 18px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  color: "#fff", fontSize: "13px", fontWeight: 600,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}>
                  <Save size={13} /> Update password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Current plan */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "20px",
            border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            borderTop: "2px solid #6366F1",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
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
            <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "16px" }}>
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
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#94A3B8", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                <CreditCard size={13} />
                Manage Billing
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
            <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(199,210,254,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Upgrade Available
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              White-Label Install
            </div>
            <p style={{ fontSize: "12px", color: "rgba(199,210,254,0.8)", lineHeight: 1.6, margin: "0 0 14px" }}>
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
