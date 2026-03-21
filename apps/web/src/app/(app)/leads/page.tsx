"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Filter, ArrowRight, Download, Plus } from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const LEADS = [
  {
    id: "l1", name: "Marcus T.", email: "marcus@example.com", phone: "(555) 012-3456",
    request: "Roof replacement, 2,400 sqft, asphalt shingles",
    agent: "Roofing Quote Agent", score: 87, status: "quoted",
    estimatedValue: 18500, assignedTo: "Sarah M.", submittedAt: "2h ago",
    initials: "MT", color: "#6366F1",
  },
  {
    id: "l2", name: "Sarah K.", email: "sarah@example.com", phone: "(555) 234-5678",
    request: "HVAC installation, 3-bedroom home, full system replacement",
    agent: "HVAC Quote Agent", score: 72, status: "reviewing",
    estimatedValue: 9200, assignedTo: "Tom B.", submittedAt: "3h ago",
    initials: "SK", color: "#F59E0B",
  },
  {
    id: "l3", name: "James R.", email: "james@example.com", phone: "(555) 345-6789",
    request: "Kitchen remodel, semi-custom cabinets, granite counters, approx $80k budget",
    agent: "Remodel Quote Agent", score: 91, status: "new",
    estimatedValue: 78000, assignedTo: null, submittedAt: "4h ago",
    initials: "JR", color: "#10B981",
  },
  {
    id: "l4", name: "Priya M.", email: "priya@example.com", phone: "(555) 456-7890",
    request: "Landscaping design and install, 0.5 acre backyard, full design + labor",
    agent: "Landscaping Agent", score: 64, status: "new",
    estimatedValue: null, assignedTo: null, submittedAt: "6h ago",
    initials: "PM", color: "#8B5CF6",
  },
  {
    id: "l5", name: "Tom W.", email: "tom@example.com", phone: "(555) 567-8901",
    request: "Commercial painting, 4,000 sqft office, 2 coats, need done in 3 weeks",
    agent: "Painting Quote Agent", score: 78, status: "reviewing",
    estimatedValue: 22000, assignedTo: "Lisa P.", submittedAt: "8h ago",
    initials: "TW", color: "#EC4899",
  },
  {
    id: "l6", name: "Elena V.", email: "elena@example.com", phone: "(555) 678-9012",
    request: "Deck build, 400 sqft composite, pergola add-on, permit required",
    agent: "Carpentry Agent", score: 83, status: "quoted",
    estimatedValue: 34000, assignedTo: "Tom B.", submittedAt: "1d ago",
    initials: "EV", color: "#14B8A6",
  },
  {
    id: "l7", name: "Robert C.", email: "robert@example.com", phone: "(555) 789-0123",
    request: "Concrete driveway replacement, 2-car width, approx 800 sqft",
    agent: "Concrete Agent", score: 55, status: "new",
    estimatedValue: null, assignedTo: null, submittedAt: "1d ago",
    initials: "RC", color: "#F97316",
  },
  {
    id: "l8", name: "Nancy P.", email: "nancy@example.com", phone: "(555) 890-1234",
    request: "Bathroom remodel, master bath, freestanding tub, custom tile",
    agent: "Remodel Quote Agent", score: 88, status: "accepted",
    estimatedValue: 42000, assignedTo: "Sarah M.", submittedAt: "2d ago",
    initials: "NP", color: "#A78BFA",
  },
];

const STATUS_TABS = [
  { label: "All", value: "all", count: 8 },
  { label: "New", value: "new", count: 3 },
  { label: "Reviewing", value: "reviewing", count: 2 },
  { label: "Quoted", value: "quoted", count: 2 },
  { label: "Accepted", value: "accepted", count: 1 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string, string]> = {
    new:       ["rgba(99,102,241,0.12)",  "#818CF8", "New"],
    reviewing: ["rgba(245,158,11,0.12)",  "#FCD34D", "Reviewing"],
    quoted:    ["rgba(139,92,246,0.12)",  "#A78BFA", "Quoted"],
    accepted:  ["rgba(16,185,129,0.12)",  "#34D399", "Accepted"],
    declined:  ["rgba(239,68,68,0.12)",   "#F87171", "Declined"],
    closed:    ["rgba(71,85,105,0.2)",    "#64748B", "Closed"],
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
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = LEADS.filter((l) => {
    const matchTab = activeTab === "all" || l.status === activeTab;
    const matchSearch = search === "" || l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.request.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Leads & Requests
          </h1>
          <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px", margin: "4px 0 0" }}>
            {LEADS.length} total submissions across all agents
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 14px", borderRadius: "8px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94A3B8", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}>
            <Download size={14} />
            Export
          </button>
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
              placeholder="Search leads by name, email, request..."
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
                  {tab.count}
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
        {/* Column headers */}
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

        {/* Rows */}
        {filtered.map((lead) => (
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
            }}>{lead.request}</div>

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
        <div style={{
          padding: "12px 22px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <span style={{ fontSize: "11px", color: "#334155" }}>Showing {filtered.length} of {LEADS.length} leads</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button style={{ padding: "4px 10px", borderRadius: "6px", background: "none", border: "1px solid rgba(255,255,255,0.08)", color: "#334155", fontSize: "11px", cursor: "not-allowed", opacity: 0.5 }}>← Prev</button>
            <span style={{ fontSize: "11px", color: "#475569" }}>Page 1 of 1</span>
            <button style={{ padding: "4px 10px", borderRadius: "6px", background: "none", border: "1px solid rgba(255,255,255,0.08)", color: "#334155", fontSize: "11px", cursor: "not-allowed", opacity: 0.5 }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
