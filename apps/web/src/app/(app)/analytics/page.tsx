"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Zap, Users, DollarSign } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeeklyPoint {
  week: string;
  submissions: number;
  quoted: number;
  won: number;
}

interface ScoreDist {
  range: string;
  count: number;
}

interface AgentPerf {
  name: string;
  submissions: number;
  avgScore: number;
  convRate: string;
}

interface SummaryStats {
  totalSubmissions: number;
  avgScore: number;
  byStatus: Record<string, number>;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={d} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg-${color.replace("#", "")})`} dot={false} />
        <Tooltip contentStyle={{ display: "none" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
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
  const supabase = getBrowserClient();

  const [summary, setSummary] = useState<SummaryStats>({ totalSubmissions: 0, avgScore: 0, byStatus: {} });
  const [weeklyData, setWeeklyData] = useState<WeeklyPoint[]>([]);
  const [scoreDist, setScoreDist] = useState<ScoreDist[]>([]);
  const [agentPerf, setAgentPerf] = useState<AgentPerf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Get current user's org
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const orgRes = await fetch("/api/org", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const orgData = await orgRes.json();
        const orgId: string | null = orgData?.org?.id ?? null;

        if (!orgId) {
          setLoading(false);
          return;
        }

        // 1. Total submissions & avg score & by status
        const { data: submissions } = await supabase
          .from("submissions")
          .select("id, status, ai_structured_data, created_at")
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false });

        const allSubs = submissions ?? [];
        const total = allSubs.length;

        const scores = allSubs
          .map((s) => (s.ai_structured_data as { score?: number } | null)?.score)
          .filter((v): v is number => typeof v === "number");
        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        const byStatus: Record<string, number> = {};
        for (const s of allSubs) {
          const st = s.status ?? "new";
          byStatus[st] = (byStatus[st] ?? 0) + 1;
        }

        setSummary({ totalSubmissions: total, avgScore, byStatus });

        // 2. Weekly trend — last 5 weeks
        const now = new Date();
        const weeks: WeeklyPoint[] = [];
        for (let i = 4; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - i * 7 - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);

          const weekSubs = allSubs.filter((s) => {
            const d = new Date(s.created_at);
            return d >= weekStart && d < weekEnd;
          });
          const quoted = weekSubs.filter((s) => s.status === "quoted" || s.status === "accepted").length;
          const won = weekSubs.filter((s) => s.status === "accepted").length;

          const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          weeks.push({ week: label, submissions: weekSubs.length, quoted, won });
        }
        setWeeklyData(weeks);

        // 3. Score distribution
        const ranges = [
          { range: "0–20",   min: 0,  max: 20  },
          { range: "21–40",  min: 21, max: 40  },
          { range: "41–60",  min: 41, max: 60  },
          { range: "61–80",  min: 61, max: 80  },
          { range: "81–100", min: 81, max: 100 },
        ];
        const dist = ranges.map(({ range, min, max }) => ({
          range,
          count: scores.filter((v) => v >= min && v <= max).length,
        }));
        setScoreDist(dist);

        // 4. Agent performance
        const { data: agentsRaw } = await supabase
          .from("agents")
          .select("id, name")
          .eq("organization_id", orgId);

        const agentList = (agentsRaw ?? []) as { id: string; name: string }[];
        const perfRows: AgentPerf[] = agentList.map((a) => {
          const agentSubs = allSubs.filter((s) => {
            // submissions don't have agent_id directly in this select — we need to refetch or skip
            return false; // handled below
          });
          void agentSubs; // suppress unused warning
          return { name: a.name, submissions: 0, avgScore: 0, convRate: "0%" };
        });

        // Refetch with agent_id
        if (agentList.length > 0) {
          const { data: subsWithAgent } = await supabase
            .from("submissions")
            .select("agent_id, status, ai_structured_data")
            .eq("organization_id", orgId);

          const subsA = subsWithAgent ?? [];
          const refined = agentList.map((a) => {
            const aSubs = subsA.filter((s) => s.agent_id === a.id);
            const aScores = aSubs
              .map((s) => (s.ai_structured_data as { score?: number } | null)?.score)
              .filter((v): v is number => typeof v === "number");
            const aAvg = aScores.length > 0
              ? Math.round(aScores.reduce((x, y) => x + y, 0) / aScores.length)
              : 0;
            const aWon = aSubs.filter((s) => s.status === "accepted").length;
            const convRateNum = aSubs.length > 0 ? Math.round((aWon / aSubs.length) * 100) : 0;
            return {
              name: a.name,
              submissions: aSubs.length,
              avgScore: aAvg,
              convRate: `${convRateNum}%`,
            };
          }).filter((a) => a.submissions > 0);
          setAgentPerf(refined.length > 0 ? refined : perfRows);
        } else {
          setAgentPerf([]);
        }

      } catch (e) {
        console.error("Analytics load error:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  const statCards = [
    {
      label: "Total Submissions", value: String(summary.totalSubmissions), delta: "all time", up: true,
      icon: Zap, color: "#6366F1", glow: "rgba(99,102,241,0.18)",
      sparkline: weeklyData.map((w) => w.submissions),
    },
    {
      label: "New Leads",   value: String(summary.byStatus["new"] ?? 0), delta: "unreviewed", up: true,
      icon: TrendingUp, color: "#10B981", glow: "rgba(16,185,129,0.18)",
      sparkline: weeklyData.map((w) => w.submissions),
    },
    {
      label: "Avg Lead Score", value: String(summary.avgScore), delta: "AI scored", up: summary.avgScore >= 60,
      icon: Users, color: "#F59E0B", glow: "rgba(245,158,11,0.18)",
      sparkline: Array(5).fill(summary.avgScore),
    },
    {
      label: "Accepted Leads", value: String(summary.byStatus["accepted"] ?? 0), delta: "converted", up: true,
      icon: DollarSign, color: "#8B5CF6", glow: "rgba(139,92,246,0.18)",
      sparkline: weeklyData.map((w) => w.won),
    },
  ];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Analytics
          </h1>
          <p style={{ fontSize: "13px", color: "#475569", margin: "4px 0 0" }}>
            {loading ? "Loading data…" : "Performance across all agents — real data"}
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

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            border: "2px solid rgba(99,102,241,0.2)", borderTopColor: "#6366F1",
            animation: "spin 0.7s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
            {statCards.map((s) => {
              const Icon = s.icon;
              const sparkData = s.sparkline.length >= 2 ? s.sparkline : [0, s.sparkline[0] ?? 0];
              return (
                <div key={s.label} style={{
                  background: "#0C1220", borderRadius: "14px", padding: "20px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: "-20px", right: "-20px",
                    width: "100px", height: "100px", borderRadius: "50%",
                    background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }} />
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "8px",
                      background: `${s.color}18`, border: `1px solid ${s.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={15} color={s.color} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: s.up ? "#34D399" : "#F87171", display: "flex", alignItems: "center", gap: "2px" }}>
                      {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {s.delta}
                    </span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "4px" }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "#475569", marginBottom: "14px" }}>{s.label}</div>
                  <Sparkline data={sparkData} color={s.color} />
                </div>
              );
            })}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            {/* Weekly volume */}
            <div style={{
              background: "#0C1220", borderRadius: "14px", padding: "20px",
              border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px" }}>
                Weekly Submission Volume
              </h2>
              <p style={{ fontSize: "11px", color: "#334155", margin: "0 0 18px" }}>
                Submissions, quotes sent, and deals won by week
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData.length > 0 ? weeklyData : [{ week: "–", submissions: 0, quoted: 0, won: 0 }]} barSize={10} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="submissions" fill="#6366F1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="quoted"      fill="#A5B4FC" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="won"         fill="#10B981" radius={[3, 3, 0, 0]} />
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
              border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px" }}>
                Lead Score Distribution
              </h2>
              <p style={{ fontSize: "11px", color: "#334155", margin: "0 0 18px" }}>
                How AI-scored leads break down by quality range
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreDist.length > 0 ? scoreDist : [{ range: "No data", count: 0 }]} barSize={28}>
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
                {summary.totalSubmissions === 0
                  ? "No submissions yet — data will appear after leads come in"
                  : `Avg score: ${summary.avgScore}/100`}
              </div>
            </div>
          </div>

          {/* Status breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
            {["new", "reviewing", "quoted", "accepted"].map((status) => {
              const count = summary.byStatus[status] ?? 0;
              const colors: Record<string, string> = { new: "#6366F1", reviewing: "#F59E0B", quoted: "#3B82F6", accepted: "#10B981" };
              const color = colors[status] ?? "#64748B";
              return (
                <div key={status} style={{
                  background: "#0C1220", borderRadius: "10px", padding: "14px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${color}`,
                }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#F1F5F9" }}>{count}</div>
                  <div style={{ fontSize: "11px", color: "#475569", textTransform: "capitalize", marginTop: "2px" }}>{status}</div>
                </div>
              );
            })}
          </div>

          {/* Agent performance table */}
          {agentPerf.length > 0 && (
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

              <div style={{
                display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr",
                gap: "12px", padding: "10px 22px",
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                {["Agent", "Submissions", "Avg Score", "Conv. Rate"].map((h) => (
                  <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {h}
                  </div>
                ))}
              </div>

              {agentPerf.map((a, idx) => (
                <div
                  key={a.name}
                  style={{
                    display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr",
                    gap: "12px", padding: "13px 22px", alignItems: "center",
                    borderBottom: idx < agentPerf.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>{a.name}</div>
                  <div style={{ fontSize: "13px", color: "#94A3B8" }}>{a.submissions}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "60px", height: "5px", borderRadius: "99px",
                      background: "rgba(255,255,255,0.06)", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: `${a.avgScore}%`, borderRadius: "99px",
                        background: a.avgScore >= 80 ? "#10B981" : a.avgScore >= 60 ? "#F59E0B" : "#EF4444",
                      }} />
                    </div>
                    <span style={{ fontSize: "13px", color: "#94A3B8" }}>{a.avgScore}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#34D399" }}>{a.convRate}</div>
                </div>
              ))}
            </div>
          )}

          {agentPerf.length === 0 && (
            <div style={{
              background: "#0C1220", borderRadius: "14px", padding: "40px",
              border: "1px solid rgba(255,255,255,0.07)", textAlign: "center",
            }}>
              <div style={{ fontSize: "13px", color: "#475569" }}>
                No agent data yet. Create agents and start receiving submissions to see performance metrics.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
