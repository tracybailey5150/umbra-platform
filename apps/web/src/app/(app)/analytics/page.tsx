"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Zap, Users, DollarSign } from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const WEEKLY_SUBMISSIONS = [
  { week: "Feb 17", submissions: 18, quoted: 9, won: 2 },
  { week: "Feb 24", submissions: 23, quoted: 12, won: 4 },
  { week: "Mar 3",  submissions: 19, quoted: 8,  won: 3 },
  { week: "Mar 10", submissions: 31, quoted: 16, won: 5 },
  { week: "Mar 15", submissions: 24, quoted: 11, won: 3 },
];

const SCORE_DIST = [
  { range: "0–20",  count: 2 },
  { range: "21–40", count: 5 },
  { range: "41–60", count: 8 },
  { range: "61–80", count: 14 },
  { range: "81–100",count: 9 },
];

const AGENT_PERF = [
  { name: "Roofing Quote", submissions: 34, avgScore: 82, convRate: "24%", revenue: "$92k" },
  { name: "HVAC Quote",    submissions: 28, avgScore: 74, convRate: "18%", revenue: "$48k" },
  { name: "Remodel Agent", submissions: 22, avgScore: 88, convRate: "27%", revenue: "$156k" },
  { name: "Landscaping",   submissions: 15, avgScore: 61, convRate: "13%", revenue: "$22k" },
  { name: "Painting Agent",submissions: 19, avgScore: 77, convRate: "21%", revenue: "$36k" },
];

const SUMMARY_STATS = [
  { label: "Total Submissions",  value: "118",   delta: "+14%", up: true,  icon: Zap },
  { label: "Conversion Rate",    value: "21.2%", delta: "+3.1%",up: true,  icon: TrendingUp },
  { label: "Avg Lead Score",     value: "76",    delta: "+4pts",up: true,  icon: Users },
  { label: "Pipeline Value",     value: "$354k", delta: "+22%", up: true,  icon: DollarSign },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card p-3 text-xs">
      <div className="font-semibold text-slate-700 mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-medium text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Performance across all agents — last 30 days</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <select className="input py-2 w-auto">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SUMMARY_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Icon size={16} className="text-brand-600" />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                  {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {s.delta}
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 mb-0.5">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly volume */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Weekly Submission Volume</h2>
          <p className="text-xs text-slate-400 mb-5">Submissions, quotes sent, and deals won by week</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WEEKLY_SUBMISSIONS} barSize={10} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="submissions" fill="#3b5ce6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="quoted" fill="#a5b4fc" radius={[3, 3, 0, 0]} />
              <Bar dataKey="won" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3">
            {[
              { label: "Submitted", color: "#3b5ce6" },
              { label: "Quoted", color: "#a5b4fc" },
              { label: "Won", color: "#10b981" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score distribution */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Lead Score Distribution</h2>
          <p className="text-xs text-slate-400 mb-5">How AI-scored leads break down by quality range</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SCORE_DIST} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}
                fill="url(#scoreGrad)"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b5ce6" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 text-xs text-slate-500 text-center">
            62% of leads score above 60 — strong intake quality
          </div>
        </div>
      </div>

      {/* Agent performance table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Agent Performance</h2>
          <p className="text-xs text-slate-400 mt-0.5">Breakdown by agent — submissions, scoring, and conversion</p>
        </div>
        <div className="divide-y divide-slate-100">
          {/* Header */}
          <div className="grid grid-cols-5 px-5 py-3 bg-slate-50/60">
            {["Agent", "Submissions", "Avg Score", "Conv. Rate", "Est. Revenue"].map((h) => (
              <div key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</div>
            ))}
          </div>
          {AGENT_PERF.map((a) => (
            <div key={a.name} className="grid grid-cols-5 px-5 py-3.5 hover:bg-slate-50 transition-colors items-center">
              <div className="text-sm font-medium text-slate-800">{a.name}</div>
              <div className="text-sm text-slate-600">{a.submissions}</div>
              <div className="flex items-center gap-2">
                <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${a.avgScore}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600">{a.avgScore}</span>
              </div>
              <div className="text-sm font-medium text-emerald-600">{a.convRate}</div>
              <div className="text-sm font-semibold text-slate-800">{a.revenue}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
