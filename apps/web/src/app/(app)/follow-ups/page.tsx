"use client";
import Link from "next/link";
import {
  Send, Clock, CheckCircle2, XCircle, Zap,
  Calendar, ArrowRight, RefreshCw, Filter,
} from "lucide-react";

// ─── Types & Data ─────────────────────────────────────────────────────────────

type FollowUpStatus = "pending" | "sent" | "responded" | "skipped" | "failed";

interface FollowUp {
  id: string;
  leadName: string;
  leadEmail: string;
  leadId: string;
  requestSummary: string;
  channel: "email" | "sms";
  status: FollowUpStatus;
  scheduledFor: string;
  sentAt?: string;
  followUpNumber: number;
  isAiGenerated: boolean;
  subject?: string;
  preview: string;
  agent: string;
  color: string;
}

const FOLLOW_UPS: FollowUp[] = [
  {
    id: "fu1", leadName: "Elena V.", leadEmail: "elena@example.com", leadId: "l6",
    requestSummary: "Deck build, 400 sqft composite with pergola",
    channel: "email", status: "pending", scheduledFor: "Due now",
    followUpNumber: 1, isAiGenerated: true,
    subject: "Following up on your deck project",
    preview: "Hi Elena, just checking in on your deck and pergola project — we'd love to schedule a free on-site estimate...",
    agent: "Carpentry Agent", color: "#14B8A6",
  },
  {
    id: "fu2", leadName: "Robert C.", leadEmail: "robert@example.com", leadId: "l7",
    requestSummary: "Concrete driveway replacement, 800 sqft",
    channel: "email", status: "pending", scheduledFor: "Due in 2h",
    followUpNumber: 2, isAiGenerated: true,
    subject: "Still interested in a driveway quote?",
    preview: "Hi Robert, this is our second follow-up on your concrete driveway request. We have availability next week...",
    agent: "Concrete Agent", color: "#F97316",
  },
  {
    id: "fu3", leadName: "Priya M.", leadEmail: "priya@example.com", leadId: "l4",
    requestSummary: "Landscaping design, 0.5 acre backyard",
    channel: "email", status: "pending", scheduledFor: "Due in 4h",
    followUpNumber: 1, isAiGenerated: true,
    subject: "Your landscaping quote — let's talk",
    preview: "Hi Priya, we received your landscaping request and our team is excited about your backyard project...",
    agent: "Landscaping Agent", color: "#8B5CF6",
  },
  {
    id: "fu4", leadName: "Tom W.", leadEmail: "tom@example.com", leadId: "l5",
    requestSummary: "Commercial painting, 4,000 sqft office",
    channel: "email", status: "sent", scheduledFor: "Yesterday", sentAt: "Mar 15, 9:04 AM",
    followUpNumber: 1, isAiGenerated: true,
    subject: "Your commercial painting quote",
    preview: "Hi Tom, following up on the commercial painting project for your office space...",
    agent: "Painting Agent", color: "#EC4899",
  },
  {
    id: "fu5", leadName: "James R.", leadEmail: "james@example.com", leadId: "l3",
    requestSummary: "Kitchen remodel, semi-custom cabinets, granite",
    channel: "email", status: "responded", scheduledFor: "Mar 14", sentAt: "Mar 14, 10:30 AM",
    followUpNumber: 1, isAiGenerated: true,
    subject: "Kitchen remodel follow-up",
    preview: "Hi James, just following up on your kitchen remodel inquiry...",
    agent: "Remodel Agent", color: "#10B981",
  },
  {
    id: "fu6", leadName: "Nancy P.", leadEmail: "nancy@example.com", leadId: "l8",
    requestSummary: "Master bath remodel, freestanding tub",
    channel: "email", status: "skipped", scheduledFor: "Mar 13",
    followUpNumber: 3, isAiGenerated: true,
    subject: "Final follow-up on your bathroom remodel",
    preview: "Hi Nancy, this will be our last follow-up...",
    agent: "Remodel Agent", color: "#A78BFA",
  },
];

const STATUS_CONFIG: Record<FollowUpStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:   { label: "Pending",   icon: Clock,        color: "#FCD34D", bg: "rgba(245,158,11,0.12)" },
  sent:      { label: "Sent",      icon: Send,         color: "#60A5FA", bg: "rgba(59,130,246,0.12)" },
  responded: { label: "Responded", icon: CheckCircle2, color: "#34D399", bg: "rgba(16,185,129,0.12)" },
  skipped:   { label: "Skipped",   icon: XCircle,      color: "#64748B", bg: "rgba(71,85,105,0.12)" },
  failed:    { label: "Failed",    icon: XCircle,      color: "#F87171", bg: "rgba(239,68,68,0.12)" },
};

const PENDING   = FOLLOW_UPS.filter((f) => f.status === "pending");
const SENT      = FOLLOW_UPS.filter((f) => f.status === "sent");
const COMPLETED = FOLLOW_UPS.filter((f) => ["responded", "skipped", "failed"].includes(f.status));

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

function FollowUpCard({ fu, showActions = false }: { fu: FollowUp; showActions?: boolean }) {
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
              <Link href={`/leads/${fu.leadId}`} style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1", textDecoration: "none" }}>
                {fu.leadName}
              </Link>
              <StatusBadge status={fu.status} />
              <span style={{ fontSize: "10px", color: "#334155" }}>Follow-up #{fu.followUpNumber}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
              {fu.requestSummary}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#334155", fontSize: "11px", flexShrink: 0 }}>
          <Calendar size={11} />
          {fu.scheduledFor}
        </div>
      </div>

      {/* Email preview */}
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
        <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.6, margin: 0 }}>{fu.preview}</p>
        {fu.isAiGenerated && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px", fontSize: "11px", color: "#6366F1" }}>
            <Zap size={10} />
            AI-generated · ready to send
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && fu.status === "pending" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button style={{
            flex: 1, padding: "8px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff", fontSize: "12px", fontWeight: 600,
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
          }}>
            <Send size={12} /> Send now
          </button>
          <button style={{
            padding: "8px 14px", borderRadius: "8px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94A3B8", fontSize: "12px", cursor: "pointer",
          }}>
            Edit
          </button>
          <button style={{
            padding: "8px 14px", borderRadius: "8px",
            background: "none", border: "none",
            color: "#475569", fontSize: "12px", cursor: "pointer",
          }}>
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FollowUpsPage() {
  const respondedCount = COMPLETED.filter((f) => f.status === "responded").length;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Follow-Ups
          </h1>
          <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px", margin: "4px 0 0" }}>
            {PENDING.length} pending · {SENT.length} sent · {COMPLETED.length} completed
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
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}>
            <Send size={14} /> Send all pending
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Pending",      value: PENDING.length,   color: "#FCD34D", bg: "rgba(245,158,11,0.1)" },
          { label: "Sent today",   value: SENT.length,      color: "#60A5FA", bg: "rgba(59,130,246,0.1)" },
          { label: "Responded",    value: respondedCount,   color: "#34D399", bg: "rgba(16,185,129,0.1)" },
          { label: "Response rate",value: "31%",            color: "#A78BFA", bg: "rgba(139,92,246,0.1)" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#0C1220", borderRadius: "14px", padding: "16px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "10px",
            }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: s.color }} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        {/* Main column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", margin: 0 }}>
              Due Now · {PENDING.length} pending
            </h2>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "5px 10px", borderRadius: "6px",
              background: "none", border: "none", color: "#475569", fontSize: "12px", cursor: "pointer",
            }}>
              <RefreshCw size={12} /> Regenerate all
            </button>
          </div>

          {PENDING.length === 0 ? (
            <div style={{
              background: "#0C1220", borderRadius: "14px", padding: "48px",
              border: "1px solid rgba(255,255,255,0.07)", textAlign: "center",
            }}>
              <CheckCircle2 size={28} color="#34D399" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#94A3B8" }}>All caught up!</div>
              <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>No pending follow-ups right now.</div>
            </div>
          ) : (
            PENDING.map((fu) => <FollowUpCard key={fu.id} fu={fu} showActions />)
          )}

          {/* Sent section */}
          {SENT.length > 0 && (
            <>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", margin: "8px 0 0" }}>
                Sent Recently · {SENT.length}
              </h2>
              {SENT.map((fu) => <FollowUpCard key={fu.id} fu={fu} />)}
            </>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Completed */}
          <div style={{
            background: "#0C1220", borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Completed</h2>
            </div>
            {COMPLETED.map((fu, idx) => (
              <div key={fu.id} style={{
                padding: "12px 18px",
                borderBottom: idx < COMPLETED.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
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

          {/* Automation settings */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "18px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
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
    </div>
  );
}
