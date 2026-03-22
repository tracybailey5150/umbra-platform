"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send, Clock, CheckCircle2, XCircle, Zap,
  Calendar, ArrowRight, Filter,
} from "lucide-react";
import { getBrowserClient } from "@umbra/auth";
import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

type FollowUpStatus = "pending" | "sent" | "responded" | "skipped" | "failed";

interface FollowUp {
  id: string;
  status: FollowUpStatus;
  subject: string | null;
  body: string | null;
  is_ai_generated: boolean;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
  // joined
  leadName: string;
  leadId: string | null;
  submissionId: string | null;
  requestSummary: string;
  color: string;
}

const STATUS_CONFIG: Record<FollowUpStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:   { label: "Pending",   icon: Clock,        color: "#FCD34D", bg: "rgba(245,158,11,0.12)" },
  sent:      { label: "Sent",      icon: Send,         color: "#60A5FA", bg: "rgba(59,130,246,0.12)" },
  responded: { label: "Responded", icon: CheckCircle2, color: "#34D399", bg: "rgba(16,185,129,0.12)" },
  skipped:   { label: "Skipped",   icon: XCircle,      color: "#64748B", bg: "rgba(71,85,105,0.12)" },
  failed:    { label: "Failed",    icon: XCircle,      color: "#F87171", bg: "rgba(239,68,68,0.12)" },
};

const AVATAR_COLORS = ["#14B8A6", "#F97316", "#8B5CF6", "#EC4899", "#6366F1", "#10B981"];

function avatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FollowUpStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 8px", borderRadius: "99px",
      fontSize: "11px", fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function FollowUpCard({
  fu, showActions, onSend, onSkip, sending,
}: {
  fu: FollowUp;
  showActions?: boolean;
  onSend?: () => void;
  onSkip?: () => void;
  sending?: boolean;
}) {
  const daysSinceScheduled = daysSince(fu.scheduled_for);
  return (
    <div style={{
      background: "#0C1220", borderRadius: "12px", padding: "16px",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
            background: `${fu.color}20`, border: `1px solid ${fu.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: fu.color,
          }}>
            {fu.leadName.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {fu.submissionId ? (
                <Link href={`/leads/${fu.submissionId}`} style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1", textDecoration: "none" }}>
                  {fu.leadName}
                </Link>
              ) : (
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>{fu.leadName}</span>
              )}
              <StatusBadge status={fu.status} />
            </div>
            <div style={{ fontSize: "11px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
              {fu.requestSummary}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#334155", fontSize: "11px", flexShrink: 0 }}>
          <Calendar size={11} />
          {daysSinceScheduled === 0 ? "Today" : `${daysSinceScheduled}d ago`}
        </div>
      </div>

      {/* Message preview */}
      <div style={{
        background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "12px",
        marginBottom: showActions && fu.status === "pending" ? "12px" : 0,
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        {fu.subject && (
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "4px" }}>
            Subject: {fu.subject}
          </div>
        )}
        <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
          {fu.body ?? "No message body."}
        </p>
        {fu.is_ai_generated && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px", fontSize: "11px", color: "#6366F1" }}>
            <Zap size={10} />
            AI-generated · ready to send
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && fu.status === "pending" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onSend}
            disabled={sending}
            style={{
              flex: 1, padding: "8px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff", fontSize: "12px", fontWeight: 600,
              border: "none", cursor: sending ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? (
              <div style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            ) : <Send size={12} />}
            {sending ? "Sending…" : "Send now"}
          </button>
          <button
            onClick={onSkip}
            style={{
              padding: "8px 14px", borderRadius: "8px",
              background: "none", border: "1px solid rgba(255,255,255,0.08)",
              color: "#475569", fontSize: "12px", cursor: "pointer",
            }}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "sent" | "all">("pending");

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/login"; return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/org", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const orgData = await res.json();
      if (orgData.orgId) {
        setOrgId(orgData.orgId);
        fetchFollowUps(orgData.orgId);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function fetchFollowUps(oid: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("follow_ups")
      .select(`
        id, status, subject, body, is_ai_generated, scheduled_for, sent_at, created_at,
        lead_id, submission_id,
        leads(id, name, email),
        submissions(id, submitter_name, submitter_email, raw_data)
      `)
      .eq("organization_id", oid)
      .order("scheduled_for", { ascending: true });

    if (!error && data) {
      const rows: FollowUp[] = (data as any[]).map((row) => {
        const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
        const sub = Array.isArray(row.submissions) ? row.submissions[0] : row.submissions;
        const name = lead?.name ?? sub?.submitter_name ?? "Unknown Lead";
        const rawDesc = typeof sub?.raw_data === "object" && sub?.raw_data !== null
          ? (sub.raw_data as any).description ?? ""
          : "";
        return {
          id: row.id,
          status: row.status as FollowUpStatus,
          subject: row.subject,
          body: row.body,
          is_ai_generated: row.is_ai_generated ?? false,
          scheduled_for: row.scheduled_for,
          sent_at: row.sent_at,
          created_at: row.created_at,
          leadName: name,
          leadId: row.lead_id,
          submissionId: row.submission_id,
          requestSummary: rawDesc || "No description",
          color: avatarColor(name),
        };
      });
      setFollowUps(rows);
    }
    setLoading(false);
  }

  async function handleSend(id: string) {
    setSendingId(id);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("follow_ups")
      .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: "sent" as FollowUpStatus } : f));
    }
    setSendingId(null);
  }

  async function handleSkip(id: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("follow_ups")
      .update({ status: "skipped", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: "skipped" as FollowUpStatus } : f));
    }
  }

  const pending   = followUps.filter(f => f.status === "pending");
  const sent      = followUps.filter(f => f.status === "sent");
  const completed = followUps.filter(f => ["responded","skipped","failed"].includes(f.status));
  const respondedCount = followUps.filter(f => f.status === "responded").length;
  const sentThisWeek = followUps.filter(f => {
    if (f.status !== "sent" || !f.sent_at) return false;
    const diff = Date.now() - new Date(f.sent_at).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const responseRate = sent.length > 0 ? Math.round((respondedCount / sent.length) * 100) : 0;

  const tabItems = activeTab === "pending" ? pending : activeTab === "sent" ? sent : followUps;

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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Follow-Ups
          </h1>
          <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px", margin: "4px 0 0" }}>
            {loading ? "Loading…" : `${pending.length} pending · ${sent.length} sent · ${completed.length} completed`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 14px", borderRadius: "8px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94A3B8", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}>
            <Filter size={14} /> Filter
          </button>
          {pending.length > 0 && (
            <button
              onClick={() => pending.forEach(f => handleSend(f.id))}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", borderRadius: "8px",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              <Send size={14} /> Send all pending
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Pending",        value: pending.length,   color: "#FCD34D", bg: "rgba(245,158,11,0.1)" },
          { label: "Sent This Week", value: sentThisWeek,     color: "#60A5FA", bg: "rgba(59,130,246,0.1)" },
          { label: "Response Rate",  value: `${responseRate}%`, color: "#34D399", bg: "rgba(16,185,129,0.1)" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#0B1120", borderRadius: "14px", padding: "18px 20px",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "2px", background: "rgba(255,255,255,0.04)",
        borderRadius: "10px", padding: "4px", marginBottom: "20px", width: "fit-content",
      }}>
        {(["pending", "sent", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "6px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all 0.15s",
              background: activeTab === tab ? "#0B1120" : "transparent",
              color: activeTab === tab ? "#F1F5F9" : "#64748B",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span style={{
              marginLeft: "6px", padding: "1px 6px", borderRadius: "99px", fontSize: "11px",
              background: activeTab === tab ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
              color: activeTab === tab ? "#A5B4FC" : "#475569",
            }}>
              {tab === "pending" ? pending.length : tab === "sent" ? sent.length : followUps.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        {/* Main column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {tabItems.length === 0 ? (
            <div style={{
              background: "#0B1120", borderRadius: "14px", padding: "64px 24px",
              border: "1px solid rgba(255,255,255,0.06)", textAlign: "center",
            }}>
              <CheckCircle2 size={32} color="#34D399" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#94A3B8", marginBottom: "8px" }}>
                {activeTab === "pending" ? "All caught up!" : activeTab === "sent" ? "Nothing sent yet" : "No follow-ups"}
              </div>
              <div style={{ fontSize: "13px", color: "#475569" }}>
                {activeTab === "pending"
                  ? "No pending follow-ups right now. Check back when leads go cold."
                  : activeTab === "sent"
                  ? "Sent follow-ups will appear here."
                  : "Follow-ups are generated automatically when leads go cold."}
              </div>
            </div>
          ) : (
            tabItems.map(fu => (
              <FollowUpCard
                key={fu.id} fu={fu}
                showActions={fu.status === "pending"}
                onSend={() => handleSend(fu.id)}
                onSkip={() => handleSkip(fu.id)}
                sending={sendingId === fu.id}
              />
            ))
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Completed */}
          {completed.length > 0 && (
            <div style={{
              background: "#0B1120", borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
            }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Completed</h2>
              </div>
              {completed.map((fu, idx) => (
                <div key={fu.id} style={{
                  padding: "12px 18px",
                  borderBottom: idx < completed.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>{fu.leadName}</span>
                    <StatusBadge status={fu.status} />
                  </div>
                  <p style={{ fontSize: "11px", color: "#334155", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fu.requestSummary}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Automation settings */}
          <div style={{
            background: "#0B1120", borderRadius: "14px", padding: "18px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Zap size={15} color="#6366F1" />
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Automation</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Auto follow-up",     value: "Enabled" },
                { label: "First follow-up",    value: "24h after submission" },
                { label: "Max follow-ups",     value: "3 per lead" },
                { label: "AI personalization", value: "On" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#475569" }}>{s.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <Link href="/agents" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6366F1", fontWeight: 600, textDecoration: "none" }}>
                Edit automation settings <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
