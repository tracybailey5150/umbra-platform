"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Zap, Users, DollarSign } from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const WEEKLY_SUBMISSIONS = [
  { week: "Feb 17", submissions: 18, quoted: 9,  won: 2 },
  { week: "Feb 24", submissions: 23, quoted: 12, won: 4 },
  { week: "Mar 3",  submissions: 19, quoted: 8,  won: 3 },
  { week: "Mar 10", submissions: 31, quoted: 16, won: 5 },
  { week: "Mar 15", submissions: 24, quoted: 11, won: 3 },
];

const SCORE_DIST = [
  { range: "0–20",   count: 2 },
  { range: "21–40",  count: 5 },
  { range: "41–60",  count: 8 },
  { range: "61–80",  count: 14 },
  { range: "81–100", count: 9 },
];

const AGENT_PERF = [
  { name: "Roofing Quote", submissions: 34, avgScore: 82, convRate: "24%", revenue: "$92k" },
  { name: "HVAC Quote",    submissions: 28, avgScore: 74, convRate: "18%", revenue: "$48k" },
  { name: "Remodel Agent", submissions: 22, avgScore: 88, convRate: "27%", revenue: "$156k" },
  { name: "Landscaping",   submissions: 15, avgScore: 61, convRate: "13%", revenue: "$22k" },
  { name: "Painting Agent",submissions: 19, avgScore: 77, convRate: "21%", revenue: "$36k" },
];

const SUMMARY_STATS = [
  { label: "Total Submissions", value: "118",   delta: "+14%", up: true,  icon: Zap,       color: "#6366F1" },
  { label: "Conversion Rate",   value: "21.2%", delta: "+3.1%",up: true,  icon: TrendingUp, color: "#10B981" },
  { label: "Avg Lead Score",    value: "76",    delta: "+4pts",up: true,  icon: Users,      color: "#F59E0B" },
  { label: "Pipeline Value",    value: "$354k", delta: "+22%", up: true,  icon: DollarSign, color: "#8B5CF6" },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0C1220", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px", padding: "10px 12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "6px" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: p.color }} />
          <span style={{ fontSize: "11px", color: "#64748B", textTransform: "capitalize" }}>{p.name}:</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#CBD5E1" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Analytics
          </h1>
          <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px", margin: "4px 0 0" }}>
            Performance across all agents — last 30 days
          </p>
        </div>
        <select style={{
          padding: "8px 12px", borderRadius: "8px",
          background: "#0C1220", border: "1px solid rgba(255,255,255,0.1)",
          color: "#94A3B8", fontSize: "13px", outline: "none",
        }}>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
        </select>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {SUMMARY_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{
              background: "#0C1220", borderRadius: "14px", padding: "20px",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: `${s.color}15`,
                  border: `1px solid ${s.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={15} color={s.color} />
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 700, color: "#34D399",
                  display: "flex", alignItems: "center", gap: "2px",
                }}>
                  {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {s.delta}
                </span>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Weekly volume */}
        <div style={{
          background: "#0C1220", borderRadius: "14px", padding: "20px",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px" }}>
            Weekly Submission Volume
          </h2>
          <p style={{ fontSize: "11px", color: "#334155", marginBottom: "18px", margin: "0 0 18px" }}>
            Submissions, quotes sent, and deals won by week
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WEEKLY_SUBMISSIONS} barSize={10} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="submissions" fill="#6366F1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="quoted" fill="#A5B4FC" radius={[3, 3, 0, 0]} />
              <Bar dataKey="won" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "10px" }}>
            {[
              { label: "Submitted", color: "#6366F1" },
              { label: "Quoted",    color: "#A5B4FC" },
              { label: "Won",       color: "#10B981" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: l.color }} />
                <span style={{ fontSize: "11px", color: "#475569" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score distribution */}
        <div style={{
          background: "#0C1220", borderRadius: "14px", padding: "20px",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px" }}>
            Lead Score Distribution
          </h2>
          <p style={{ fontSize: "11px", color: "#334155", marginBottom: "18px", margin: "0 0 18px" }}>
            How AI-scored leads break down by quality range
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SCORE_DIST} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="scoreGradDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="url(#scoreGradDark)" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: "10px", fontSize: "11px", color: "#334155", textAlign: "center" }}>
            62% of leads score above 60 — strong intake quality
          </div>
        </div>
      </div>

      {/* Agent performance table */}
      <div style={{
        background: "#0C1220", borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 2px" }}>Agent Performance</h2>
          <p style={{ fontSize: "11px", color: "#334155", margin: 0 }}>
            Breakdown by agent — submissions, scoring, and conversion
          </p>
        </div>

        {/* Header row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr 1fr",
          gap: "12px", padding: "10px 22px",
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          {["Agent", "Submissions", "Avg Score", "Conv. Rate", "Est. Revenue"].map((h) => (
            <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </div>
          ))}
        </div>

        {AGENT_PERF.map((a, idx) => (
          <div
            key={a.name}
            style={{
              display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr 1fr",
              gap: "12px", padding: "13px 22px", alignItems: "center",
              borderBottom: idx < AGENT_PERF.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>{a.name}</div>
            <div style={{ fontSize: "13px", color: "#94A3B8" }}>{a.submissions}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "60px", height: "5px", borderRadius: "99px",
                background: "rgba(255,255,255,0.06)", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: `${a.avgScore}%`,
                  borderRadius: "99px",
                  background: a.avgScore >= 80 ? "#10B981" : a.avgScore >= 60 ? "#F59E0B" : "#EF4444",
                }} />
              </div>
              <span style={{ fontSize: "13px", color: "#94A3B8" }}>{a.avgScore}</span>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#34D399" }}>{a.convRate}</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9" }}>{a.revenue}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
