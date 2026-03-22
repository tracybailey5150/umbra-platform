"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Zap, Mail, Phone, Clock, Bot,
  CheckCircle2, Send, Plus, ChevronDown,
} from "lucide-react";
import { getBrowserClient } from "@umbra/auth";
import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Submission {
  id: string;
  status: string;
  submitter_name: string | null;
  submitter_email: string | null;
  submitter_phone: string | null;
  raw_data: Record<string, unknown> | null;
  ai_summary: string | null;
  ai_structured_data: {
    summary?: string;
    draftResponse?: string;
    quoteReadyScore?: number;
    extractedData?: Record<string, unknown>;
    missingFields?: string[];
    suggestedNextSteps?: string[];
  } | null;
  created_at: string;
  agents: { id: string; name: string; slug: string } | null;
  leads: { id: string; score: number | null; estimated_value: string | null } | null;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  is_ai_generated: boolean;
}

const STATUSES = ["new", "reviewing", "quoted", "accepted", "declined", "closed"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string, string]> = {
    new:       ["rgba(99,102,241,0.12)",  "#818CF8", "New"],
    reviewing: ["rgba(245,158,11,0.12)",  "#FCD34D", "Reviewing"],
    quoted:    ["rgba(139,92,246,0.12)",  "#A78BFA", "Quoted"],
    accepted:  ["rgba(16,185,129,0.12)",  "#34D399", "Accepted"],
    declined:  ["rgba(239,68,68,0.12)",   "#F87171", "Declined"],
    closed:    ["rgba(71,85,105,0.2)",    "#64748B", "Closed"],
    archived:  ["rgba(71,85,105,0.2)",    "#64748B", "Archived"],
  };
  const [bg, color, label] = map[status] ?? ["rgba(71,85,105,0.2)", "#64748B", status];
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "99px",
      background: bg, color, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function BigScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div style={{ position: "relative", width: "88px", height: "88px" }}>
        <svg width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "22px", fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: "9px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>score</span>
        </div>
      </div>
      <span style={{ fontSize: "11px", fontWeight: 600, color }}>
        {score >= 80 ? "High quality lead" : score >= 60 ? "Good lead" : "Needs more info"}
      </span>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params.id;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [draftResponse, setDraftResponse] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);
  const [responseSent, setResponseSent] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [status, setStatus] = useState("new");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const authSupabase = getBrowserClient();
    authSupabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/login"; return; }
      setUserId(user.id);

      const { data: { session } } = await authSupabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/org", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const orgData = await res.json();
      if (orgData.orgId) {
        setOrgId(orgData.orgId);
        fetchSubmission(orgData.orgId);
      }
    });
  }, [submissionId]);

  async function fetchSubmission(oid: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("submissions")
      .select(`
        id, status, submitter_name, submitter_email, submitter_phone,
        raw_data, ai_summary, ai_structured_data, created_at,
        agents(id, name, slug),
        leads(id, score, estimated_value)
      `)
      .eq("id", submissionId)
      .eq("organization_id", oid)
      .maybeSingle();

    if (!error && data) {
      const sub = data as any;
      setSubmission({
        ...sub,
        agents: Array.isArray(sub.agents) ? sub.agents[0] : sub.agents,
        leads: Array.isArray(sub.leads) ? sub.leads[0] : sub.leads,
      });
      setStatus(sub.status ?? "new");
      setDraftResponse(sub.ai_structured_data?.draftResponse ?? "");

      // Fetch notes
      if (sub.leads?.[0]?.id || sub.leads?.id) {
        const leadId = Array.isArray(sub.leads) ? sub.leads[0]?.id : sub.leads?.id;
        const { data: notesData } = await supabase
          .from("notes")
          .select("id, content, created_at, is_ai_generated")
          .eq("submission_id", submissionId)
          .order("created_at", { ascending: false });
        setNotes(notesData ?? []);
      } else {
        // Try by submission_id
        const { data: notesData } = await supabase
          .from("notes")
          .select("id, content, created_at, is_ai_generated")
          .eq("submission_id", submissionId)
          .order("created_at", { ascending: false });
        setNotes(notesData ?? []);
      }
    }
    setLoading(false);
  }

  async function handleSendResponse() {
    if (!submission) return;
    setSendingResponse(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase
      .from("submissions")
      .update({ status: "quoted", updated_at: new Date().toISOString() })
      .eq("id", submissionId);

    setStatus("quoted");
    setSubmission(prev => prev ? { ...prev, status: "quoted" } : null);
    setSendingResponse(false);
    setResponseSent(true);
    setTimeout(() => setResponseSent(false), 3000);
  }

  async function handleStatusChange(newStatus: string) {
    setStatusDropdownOpen(false);
    setUpdatingStatus(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("submissions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", submissionId);

    if (!error) {
      setStatus(newStatus);
      setSubmission(prev => prev ? { ...prev, status: newStatus } : null);
    }
    setUpdatingStatus(false);
  }

  async function handleSaveNote() {
    if (!noteText.trim() || !userId || !orgId) return;
    setSavingNote(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // We need author_user_id — need to find the users table id from supabase_auth_id
    // The notes table references users.id (not auth.uid directly)
    // For simplicity, query the users table
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("supabase_auth_id", userId)
      .maybeSingle();

    if (!userRow) {
      // Try direct insert with userId as fallback
      setSavingNote(false);
      return;
    }

    const { data: newNote, error } = await supabase
      .from("notes")
      .insert({
        organization_id: orgId,
        submission_id: submissionId,
        author_user_id: userRow.id,
        content: noteText.trim(),
        is_ai_generated: false,
      })
      .select("id, content, created_at, is_ai_generated")
      .single();

    if (!error && newNote) {
      setNotes(prev => [newNote, ...prev]);
      setNoteText("");
    }
    setSavingNote(false);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div style={{
          width: "28px", height: "28px",
          border: "3px solid rgba(59,130,246,0.15)", borderTopColor: "#3b82f6",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!submission) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 12px" }}>Lead not found</h2>
        <Link href="/leads" style={{ color: "#6366F1", fontSize: "14px", textDecoration: "none", fontWeight: 600 }}>← Back to leads</Link>
      </div>
    );
  }

  const name = submission.submitter_name ?? "Unknown";
  const email = submission.submitter_email ?? "—";
  const phone = submission.submitter_phone ?? "—";
  const rawDesc = typeof submission.raw_data === "object" && submission.raw_data !== null
    ? (submission.raw_data as any).description ?? null
    : null;
  const score = submission.leads?.score ?? submission.ai_structured_data?.quoteReadyScore ?? 0;
  const aiSummary = submission.ai_summary ?? submission.ai_structured_data?.summary ?? null;
  const extractedData = submission.ai_structured_data?.extractedData ?? {};
  const missingFields = submission.ai_structured_data?.missingFields ?? [];
  const suggestedSteps = submission.ai_structured_data?.suggestedNextSteps ?? [];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Back nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <Link href="/leads" style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#64748B", textDecoration: "none",
        }}>
          <ArrowLeft size={15} />
        </Link>
        <div style={{ fontSize: "13px", color: "#475569" }}>
          <Link href="/leads" style={{ color: "#475569", textDecoration: "none" }}>Leads</Link>
          <span style={{ margin: "0 6px" }}>·</span>
          <span style={{ color: "#CBD5E1" }}>{name}</span>
        </div>
      </div>

      {/* Lead header card */}
      <div style={{
        background: "#0C1220", borderRadius: "14px", padding: "22px",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: 800, color: "#818CF8",
            }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.01em" }}>{name}</h1>
                <StatusBadge status={status} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
                {email !== "—" && (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#475569" }}>
                    <Mail size={12} /> {email}
                  </span>
                )}
                {phone !== "—" && (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#475569" }}>
                    <Phone size={12} /> {phone}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#475569" }}>
                  <Clock size={12} /> {timeAgo(submission.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Status change */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              disabled={updatingStatus}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#94A3B8", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              }}
            >
              Change status <ChevronDown size={13} />
            </button>
            {statusDropdownOpen && (
              <div style={{
                position: "absolute", right: 0, top: "100%", marginTop: "4px",
                background: "#0C1220", borderRadius: "10px", padding: "6px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                zIndex: 50, minWidth: "140px",
              }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    style={{
                      display: "block", width: "100%", padding: "8px 10px", borderRadius: "6px",
                      background: s === status ? "rgba(99,102,241,0.1)" : "none",
                      border: "none", cursor: "pointer", textAlign: "left",
                      fontSize: "12px", fontWeight: 600, color: s === status ? "#818CF8" : "#64748B",
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "14px", marginTop: "20px", paddingTop: "18px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {[
            { label: "Agent",      value: submission.agents?.name ?? "Unknown", icon: Bot },
            { label: "Submitted",  value: new Date(submission.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }), icon: Clock },
            { label: "Est. Value", value: submission.leads?.estimated_value ? `$${parseFloat(submission.leads.estimated_value).toLocaleString()}` : "—", icon: null },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <div style={{ fontSize: "10px", color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 600, color: "#CBD5E1" }}>
                {Icon && <Icon size={12} color="#475569" />}
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* AI Summary */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={13} color="#818CF8" />
              </div>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>AI Summary</h2>
              <span style={{ fontSize: "11px", color: "#334155", marginLeft: "auto" }}>Processed instantly</span>
            </div>

            {aiSummary ? (
              <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.7, margin: "0 0 16px" }}>{aiSummary}</p>
            ) : (
              <p style={{ fontSize: "12px", color: "#334155", fontStyle: "italic", margin: "0 0 16px" }}>No AI summary available yet.</p>
            )}

            {/* Extracted fields */}
            {Object.keys(extractedData).length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px",
                marginBottom: "14px", border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                  Extracted Information
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <CheckCircle2 size={11} color="#10B981" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: "11px", color: "#334155" }}>{key}: </span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#94A3B8" }}>{String(value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing fields */}
            {missingFields.length > 0 && (
              <div style={{
                background: "rgba(245,158,11,0.06)", borderRadius: "10px", padding: "12px",
                marginBottom: "14px", border: "1px solid rgba(245,158,11,0.15)",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#FCD34D", marginBottom: "8px" }}>
                  Missing info ({missingFields.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {missingFields.map((f) => (
                    <span key={f} style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "99px",
                      background: "rgba(245,158,11,0.1)", color: "#FCD34D",
                    }}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested next steps */}
            {suggestedSteps.length > 0 && (
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                  Suggested Next Steps
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {suggestedSteps.map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "#64748B" }}>
                      <span style={{ fontSize: "10px", color: "#334155", fontWeight: 700, marginTop: "1px", minWidth: "16px" }}>{i + 1}.</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Original submission */}
          {rawDesc && (
            <div style={{
              background: "#0C1220", borderRadius: "14px", padding: "20px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 12px" }}>Original Submission</h2>
              <p style={{
                fontSize: "13px", color: "#64748B", lineHeight: 1.7,
                background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "14px",
                border: "1px solid rgba(255,255,255,0.04)", fontStyle: "italic", margin: 0,
              }}>
                "{rawDesc}"
              </p>
            </div>
          )}

          {/* AI Draft Response */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 12px" }}>
              Draft Response
              {draftResponse && (
                <span style={{ fontSize: "10px", fontWeight: 600, marginLeft: "8px", color: "#6366F1", background: "rgba(99,102,241,0.1)", padding: "2px 6px", borderRadius: "4px" }}>AI generated</span>
              )}
            </h2>
            <textarea
              value={draftResponse}
              onChange={(e) => setDraftResponse(e.target.value)}
              placeholder="No AI draft available. Write a response manually…"
              rows={5}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                background: "#070C18", border: "1px solid rgba(255,255,255,0.08)",
                color: "#F1F5F9", fontSize: "13px", lineHeight: 1.7,
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
            />
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleSendResponse}
                disabled={sendingResponse || responseSent}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "9px 18px", borderRadius: "8px",
                  background: responseSent ? "rgba(16,185,129,0.1)" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  border: responseSent ? "1px solid rgba(16,185,129,0.3)" : "none",
                  color: responseSent ? "#34D399" : "#fff",
                  fontSize: "13px", fontWeight: 600,
                  cursor: sendingResponse || responseSent ? "not-allowed" : "pointer",
                  boxShadow: responseSent ? "none" : "0 4px 12px rgba(99,102,241,0.25)",
                }}
              >
                {responseSent ? (
                  <><CheckCircle2 size={13} /> Marked as Quoted</>
                ) : sendingResponse ? (
                  <><div style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Sending…</>
                ) : (
                  <><Send size={13} /> Send Response</>
                )}
              </button>
              <span style={{ fontSize: "11px", color: "#334155" }}>Marks status as "quoted"</span>
            </div>
          </div>

          {/* Notes */}
          <div style={{
            background: "#0C1220", borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Notes</h2>
              <span style={{ fontSize: "11px", color: "#334155" }}>{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Existing notes */}
            {notes.map((note) => (
              <div key={note.id} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "9px", fontWeight: 700, color: "#818CF8",
                  }}>
                    {note.is_ai_generated ? "AI" : "U"}
                  </div>
                  <span style={{ fontSize: "11px", color: "#475569" }}>
                    {new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>{note.content}</p>
              </div>
            ))}

            {/* Add note */}
            <div style={{ padding: "14px 20px" }}>
              <div style={{ position: "relative" }}>
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note…"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "8px",
                    background: "#070C18", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#F1F5F9", fontSize: "12px", resize: "none",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={!noteText.trim() || savingNote}
                  style={{
                    position: "absolute", bottom: "8px", right: "8px",
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "5px 10px", borderRadius: "6px",
                    background: noteText.trim() ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "rgba(255,255,255,0.05)",
                    border: "none", color: noteText.trim() ? "#fff" : "#334155",
                    fontSize: "11px", fontWeight: 600, cursor: noteText.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  <Plus size={11} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Score ring */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px", alignSelf: "flex-start" }}>
              Quote-Ready Score
            </div>
            <BigScoreRing score={score} />
            <div style={{ fontSize: "11px", color: "#334155", marginTop: "10px", textAlign: "center" }}>AI confidence score</div>
          </div>

          {/* Pipeline stage */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "18px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
              Pipeline Stage
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {STATUSES.map((s) => (
                <div key={s} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 10px", borderRadius: "8px",
                  background: s === status ? "rgba(99,102,241,0.08)" : "none",
                  border: s === status ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
                }}>
                  <div style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: s === status ? "#6366F1" : "rgba(255,255,255,0.1)",
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "12px", fontWeight: s === status ? 700 : 500, color: s === status ? "#818CF8" : "#334155" }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead info */}
          <div style={{
            background: "#0C1220", borderRadius: "14px", padding: "18px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
              Contact Info
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Name",     value: name },
                { label: "Email",    value: email },
                { label: "Phone",    value: phone },
                { label: "Agent",    value: submission.agents?.name ?? "Unknown" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "10px", color: "#334155", fontWeight: 600, marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
