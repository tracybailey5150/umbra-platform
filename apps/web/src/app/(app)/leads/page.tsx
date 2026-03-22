"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Search, Filter, ArrowRight, Download, Plus, Copy, Check } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  request: string;
  agent: string;
  agentSlug: string;
  score: number;
  status: string;
  estimatedValue: number | null;
  assignedTo: string | null;
  submittedAt: string;
  initials: string;
  color: string;
}

// ─── Color palette for avatars ────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#6366F1", "#F59E0B", "#10B981", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#A78BFA",
];

function avatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const r = 10, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
      <svg width="26" height="26" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="13" cy="13" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
        <circle cx="13" cy="13" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: "12px", fontWeight: 700, color, minWidth: "22px" }}>{score}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [firstAgentSlug, setFirstAgentSlug] = useState<string>("");

  const fetchLeads = useCallback(async () => {
    const authSupabase = getBrowserClient();
    const { data: { session } } = await authSupabase.auth.getSession();
    let orgId: string | null = null;

    if (session?.access_token) {
      try {
        const res = await fetch("/api/org", { headers: { Authorization: `Bearer ${session.access_token}` } });
        const orgData = await res.json();
        orgId = orgData.orgId ?? null;
      } catch (_e) { /* ignore */ }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch submissions with related agent + lead data
    let query = supabase
      .from("submissions")
      .select(`
        id, status, submitter_name, submitter_email, submitter_phone,
        raw_data, created_at, deleted_at,
        agents!inner(id, name, slug, type),
        leads(id, score, estimated_value, name, email)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (orgId) {
      query = query.eq("organization_id", orgId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch leads:", error);
      setLoading(false);
      return;
    }

    const rows: LeadRow[] = (data ?? []).map((row: any) => {
      const agent = Array.isArray(row.agents) ? row.agents[0] : row.agents;
      const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
      const name = row.submitter_name ?? lead?.name ?? "Unknown";
      const email = row.submitter_email ?? lead?.email ?? "";
      const rawDesc = typeof row.raw_data === "object" && row.raw_data !== null
        ? (row.raw_data as any).description ?? ""
        : "";

      return {
        id: row.id,
        name,
        email,
        phone: row.submitter_phone ?? null,
        request: rawDesc,
        agent: agent?.name ?? "Unknown Agent",
        agentSlug: agent?.slug ?? "",
        score: lead?.score ?? 0,
        status: row.status ?? "new",
        estimatedValue: lead?.estimated_value ? parseFloat(lead.estimated_value) : null,
        assignedTo: null,
        submittedAt: row.created_at,
        initials: getInitials(name),
        color: avatarColor(name + email),
      };
    });

    setLeads(rows);

    // Track the first agent slug for the "Copy link" button
    if (rows.length > 0 && rows[0].agentSlug) {
      setFirstAgentSlug(rows[0].agentSlug);
    } else {
      // Fallback: fetch the first active agent
      const { data: agentData } = await supabase
        .from("agents")
        .select("slug")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (agentData?.slug) setFirstAgentSlug(agentData.slug);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ─── Filter logic ──────────────────────────────────────────────────────────
  const filtered = leads.filter((l) => {
    const matchTab = activeTab === "all" || l.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      q === "" ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.request.toLowerCase().includes(q) ||
      l.agent.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const statusCounts: Record<string, number> = { all: leads.length };
  leads.forEach((l) => {
    statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1;
  });

  const STATUS_TABS = [
    { label: "All", value: "all" },
    { label: "New", value: "new" },
    { label: "Reviewing", value: "reviewing" },
    { label: "Quoted", value: "quoted" },
    { label: "Accepted", value: "accepted" },
  ];

  // ─── Copy intake link ──────────────────────────────────────────────────────
  function copyIntakeLink() {
    const slug = firstAgentSlug || "your-agent";
    const url = `${window.location.origin}/submit/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // ─── Stat strip values ──────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = leads.filter((l) => new Date(l.submittedAt) >= today).length;
  const scoredLeads = leads.filter((l) => l.score > 0);
  const avgScore = scoredLeads.length > 0
    ? Math.round(scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length)
    : 0;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Leads & Requests
          </h1>
          <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px", margin: "4px 0 0" }}>
            {loading ? "Loading…" : `${leads.length} total submissions across all agents`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Copy intake link */}
          <button
            onClick={copyIntakeLink}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "9px 14px", borderRadius: "8px",
              background: copied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
              color: copied ? "#34D399" : "#94A3B8",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy intake link"}
          </button>

          <button style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 14px", borderRadius: "8px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94A3B8", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}>
            <Download size={14} />
            Export
          </button>
          <Link href="/agents/new" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)", textDecoration: "none",
          }}>
            <Plus size={14} />
            New Lead
          </Link>
          <Link href="/leads/new" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)", textDecoration: "none",
          }}>
            <Plus size={14} />
            Add manually
          </Link>
        </div>
      </div>

      {/* Stat Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Leads", value: loading ? "—" : leads.length, color: "#A5B4FC", bg: "rgba(99,102,241,0.1)" },
          { label: "New Today",   value: loading ? "—" : newToday,     color: "#34D399", bg: "rgba(16,185,129,0.1)" },
          { label: "Avg Score",   value: loading ? "—" : avgScore,     color: "#FCD34D", bg: "rgba(245,158,11,0.1)" },
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

      {/* Filters */}
      <div style={{
        background: "#0C1220", borderRadius: "14px", padding: "14px 16px",
        border: "1px solid rgba(255,255,255,0.07)", marginBottom: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input
              type="text"
              placeholder="Search leads by name, email, request…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 32px", borderRadius: "8px",
                background: "#070C18", border: "1px solid rgba(255,255,255,0.08)",
                color: "#F1F5F9", fontSize: "13px", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filter button */}
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "8px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748B", fontSize: "13px", cursor: "pointer",
          }}>
            <Filter size={14} /> Filters
          </button>

          {/* Status tabs */}
          <div style={{
            display: "flex", alignItems: "center", gap: "2px",
            background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "3px",
          }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 10px", borderRadius: "6px",
                  fontSize: "11px", fontWeight: 600, cursor: "pointer",
                  border: "none", transition: "all 0.15s",
                  background: activeTab === tab.value ? "rgba(99,102,241,0.15)" : "none",
                  color: activeTab === tab.value ? "#818CF8" : "#475569",
                }}
              >
                {tab.label}
                <span style={{
                  padding: "1px 5px", borderRadius: "99px", fontSize: "10px",
                  background: activeTab === tab.value ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
                  color: activeTab === tab.value ? "#A5B4FC" : "#334155",
                }}>
                  {statusCounts[tab.value] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "#0C1220", borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}>
        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{
              width: "28px", height: "28px",
              border: "3px solid rgba(59,130,246,0.15)",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: "13px", color: "#334155" }}>Loading leads…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && leads.length === 0 && (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Plus size={22} color="#6366F1" />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#CBD5E1", margin: "0 0 8px" }}>
              No leads yet
            </h3>
            <p style={{ fontSize: "13px", color: "#334155", marginBottom: "20px" }}>
              Share your intake form to get started
            </p>
            <button
              onClick={copyIntakeLink}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "10px 20px", borderRadius: "8px",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              <Copy size={14} />
              Copy intake form link
            </button>
          </div>
        )}

        {/* Column headers */}
        {!loading && filtered.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 80px 80px 90px 32px",
            gap: "12px", padding: "10px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}>
            {["Lead", "Request", "Agent", "Score", "Value", "Status", ""].map((h) => (
              <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </div>
            ))}
          </div>
        )}

        {/* No results (filtered but have leads) */}
        {!loading && leads.length > 0 && filtered.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#334155" }}>No leads match your current filters.</p>
          </div>
        )}

        {/* Rows */}
        {!loading && filtered.map((lead) => (
          <Link
            key={lead.id}
            href={`/leads/${lead.id}`}
            style={{
              display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 80px 80px 90px 32px",
              gap: "12px", padding: "13px 22px", alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              textDecoration: "none",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {/* Lead */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                background: `${lead.color}20`, border: `1px solid ${lead.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, color: lead.color,
              }}>{lead.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.name}</div>
                <div style={{ fontSize: "11px", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.email}</div>
              </div>
            </div>

            {/* Request */}
            <div style={{
              fontSize: "11px", color: "#475569",
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              lineHeight: "1.5",
            }}>
              {lead.request || <span style={{ color: "#1E293B", fontStyle: "italic" }}>No description</span>}
            </div>

            {/* Agent */}
            <div style={{ fontSize: "11px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.agent}</div>

            {/* Score */}
            <ScoreRing score={lead.score} />

            {/* Value */}
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>
              {lead.estimatedValue
                ? `$${(lead.estimatedValue / 1000).toFixed(0)}k`
                : <span style={{ color: "#334155", fontSize: "11px" }}>—</span>
              }
            </div>

            {/* Status */}
            <StatusBadge status={lead.status} />

            {/* Arrow */}
            <ArrowRight size={14} color="#334155" />
          </Link>
        ))}

        {/* Footer */}
        {!loading && leads.length > 0 && (
          <div style={{
            padding: "12px 22px", display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            <span style={{ fontSize: "11px", color: "#334155" }}>
              Showing {filtered.length} of {leads.length} leads
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button style={{ padding: "4px 10px", borderRadius: "6px", background: "none", border: "1px solid rgba(255,255,255,0.08)", color: "#334155", fontSize: "11px", cursor: "not-allowed", opacity: 0.5 }}>← Prev</button>
              <span style={{ fontSize: "11px", color: "#475569" }}>Page 1 of 1</span>
              <button style={{ padding: "4px 10px", borderRadius: "6px", background: "none", border: "1px solid rgba(255,255,255,0.08)", color: "#334155", fontSize: "11px", cursor: "not-allowed", opacity: 0.5 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
