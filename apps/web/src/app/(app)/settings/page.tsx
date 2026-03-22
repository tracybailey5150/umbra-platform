"use client";
import { useState, useEffect, useRef } from "react";
import { CreditCard, Building2, Bell, Shield, CheckCircle2, Save } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";

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

// ── Toast ─────────────────────────────────────────────────────────────────────

function SaveToast({ show, error }: { show: boolean; error?: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      fontSize: "12px", fontWeight: 600,
      color: error ? "#F87171" : "#34D399",
      opacity: show ? 1 : 0,
      transition: "opacity 0.3s",
      pointerEvents: "none",
    }}>
      <CheckCircle2 size={13} />
      {error ?? "Saved ✓"}
    </div>
  );
}

// ── Notification toggle (controlled) ─────────────────────────────────────────

function NotifToggle({
  label, desc, storageKey, defaultChecked,
}: { label: string; desc: string; storageKey: string; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(() => {
    if (typeof window === "undefined") return defaultChecked;
    const stored = localStorage.getItem(`notif_${storageKey}`);
    return stored !== null ? stored === "true" : defaultChecked;
  });

  function toggle() {
    const next = !checked;
    setChecked(next);
    localStorage.setItem(`notif_${storageKey}`, String(next));
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 14px", borderRadius: "10px",
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#F1F5F9" }}>{label}</div>
        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{desc}</div>
      </div>
      <button
        onClick={toggle}
        style={{
          width: "36px", height: "20px", borderRadius: "99px", cursor: "pointer",
          background: checked ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)",
          border: checked ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
          position: "relative", display: "flex", alignItems: "center", padding: "2px",
          transition: "all 0.2s",
        }}
      >
        <div style={{
          width: "14px", height: "14px", borderRadius: "50%",
          background: checked ? "#818CF8" : "#475569",
          transform: checked ? "translateX(16px)" : "translateX(0)",
          transition: "all 0.2s",
        }} />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"org" | "notifs" | "security">("org");
  const supabase = getBrowserClient();

  // Org tab
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);
  const [orgError, setOrgError] = useState<string | undefined>();
  const orgIdRef = useRef<string | null>(null);

  // Security tab
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | undefined>();

  // Notifs tab
  const [notifSaved, setNotifSaved] = useState(false);

  // Load org on mount
  useEffect(() => {
    async function loadOrg() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/org", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.org) {
        orgIdRef.current = data.org.id;
        setOrgName(data.org.name ?? "");
        setOrgSlug(data.org.slug ?? "");
      }
    }
    loadOrg();
  }, [supabase]);

  async function saveOrg() {
    if (!orgIdRef.current) return;
    setOrgSaving(true);
    setOrgSaved(false);
    setOrgError(undefined);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ name: orgName, slug: orgSlug })
        .eq("id", orgIdRef.current);
      if (error) throw error;
      setOrgSaved(true);
      setTimeout(() => setOrgSaved(false), 2500);
    } catch (e: unknown) {
      setOrgError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setOrgSaving(false);
    }
  }

  async function savePassword() {
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    setPwSaved(false);
    setPwError(undefined);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : "Password update failed");
    } finally {
      setPwSaving(false);
    }
  }

  function saveNotifs() {
    // Prefs already saved to localStorage in each toggle
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  }

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "8px 18px", borderRadius: "8px",
    background: "linear-gradient(135deg, #4F46E5, #6366F1)",
    color: "#fff", fontSize: "13px", fontWeight: 600,
    border: "none", cursor: "pointer",
    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
    opacity: orgSaving || pwSaving ? 0.7 : 1,
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
          Settings & Billing
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0" }}>
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
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    style={inputStyle}
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
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
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
              <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                <SaveToast show={orgSaved} error={orgError} />
                <button onClick={saveOrg} disabled={orgSaving} style={btnPrimary}>
                  {orgSaving
                    ? <div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    : <Save size={13} />}
                  Save changes
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
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <NotifToggle label="Email on new lead"     desc="Get notified when a new submission arrives" storageKey="new_lead"       defaultChecked={true} />
                <NotifToggle label="Daily digest"          desc="Summary email of leads and follow-up activity" storageKey="daily_digest" defaultChecked={true} />
                <NotifToggle label="Follow-up reminders"   desc="Alerts when follow-ups are due"           storageKey="followup"         defaultChecked={false} />
                <NotifToggle label="Team mentions"         desc="When someone mentions you in a comment"   storageKey="mentions"          defaultChecked={true} />
              </div>
              <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                <SaveToast show={notifSaved} />
                <button onClick={saveNotifs} style={btnPrimary}>
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
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>New password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm new password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                {pwError && (
                  <div style={{ fontSize: "12px", color: "#F87171", padding: "8px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {pwError}
                  </div>
                )}
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
              <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                <SaveToast show={pwSaved} error={pwError ? undefined : undefined} />
                {pwSaved && <SaveToast show={pwSaved} />}
                <button onClick={savePassword} disabled={pwSaving} style={btnPrimary}>
                  {pwSaving
                    ? <div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    : <Save size={13} />}
                  Update password
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
