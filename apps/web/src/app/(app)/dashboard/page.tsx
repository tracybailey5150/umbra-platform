"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, ArrowDownRight,
  Inbox, Zap, Clock, DollarSign,
  AlertCircle, ChevronRight, MoreHorizontal,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { getBrowserClient } from "@umbra/auth";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "New Submissions",
    value: "24",
    delta: "+8 today",
    trend: "up",
    icon: Inbox,
    color: "#6366F1",
    glow: "rgba(99,102,241,0.15)",
    sparkline: [4,6,5,8,7,9,8,11,10,13,12,16],
  },
  {
    label: "Quote Ready",
    value: "11",
    delta: "45% of total",
    trend: "up",
    icon: Zap,
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.15)",
    sparkline: [2,3,4,3,5,4,6,5,7,6,8,7],
  },
  {
    label: "Avg Response",
    value: "2.4h",
    delta: "↓ 18% vs last week",
    trend: "up",
    icon: Clock,
    color: "#10B981",
    glow: "rgba(16,185,129,0.15)",
    sparkline: [8,7,7,6,6,5,5,4,4,3,3,2],
  },
  {
    label: "Pipeline Value",
    value: "$84k",
    delta: "+$12k this week",
    trend: "up",
    icon: DollarSign,
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.15)",
    sparkline: [20,28,25,35,30,42,38,52,48,62,70,84],
  },
];

const SUBMISSIONS = [
  { id: "s1", initials: "MT", name: "Marcus T.", email: "marcus@example.com", request: "Roof replacement, 2,400 sqft, asphalt shingles preferred", score: 87, status: "quoted",    agent: "Roofing Agent",    time: "12m ago", color: "#6366F1" },
  { id: "s2", initials: "SK", name: "Sarah K.",  email: "sarah@example.com",  request: "HVAC installation, 3-bedroom home, full system upgrade",   score: 72, status: "reviewing", agent: "HVAC Agent",       time: "1h ago",  color: "#F59E0B" },
  { id: "s3", initials: "JR", name: "James R.",  email: "james@example.com",  request: "Kitchen remodel, semi-custom cabinets, granite counters",   score: 91, status: "new",       agent: "Remodel Agent",    time: "2h ago",  color: "#10B981" },
  { id: "s4", initials: "PM", name: "Priya M.",  email: "priya@example.com",  request: "Landscaping design, 0.5 acre backyard, full install",       score: 64, status: "new",       agent: "Landscape Agent",  time: "3h ago",  color: "#8B5CF6" },
  { id: "s5", initials: "TW", name: "Tom W.",    email: "tom@example.com",    request: "Commercial painting, 4,000 sqft office, 2 coats required",  score: 78, status: "reviewing", agent: "Painting Agent",   time: "5h ago",  color: "#EC4899" },
];

const FOLLOW_UPS = [
  { name: "Elena V.",   daysAgo: 3, status: "No response",  note: "AI draft ready to send",       urgency: "high"   },
  { name: "Robert C.",  daysAgo: 5, status: "No response",  note: "2nd follow-up recommended",    urgency: "high"   },
  { name: "Nancy P.",   daysAgo: 2, status: "Opened email", note: "Opened 3× but no reply",       urgency: "medium" },
];

const WEEK_STATS = [
  { label: "Submissions",   value: "31" },
  { label: "Quotes sent",   value: "14" },
  { label: "Leads won",     value: "3"  },
  { label: "Conversion",    value: "21%"},
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={d} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg-${color.replace('#','')})`} dot={false} />
        <Tooltip contentStyle={{ display: 'none' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const r = 10, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
      <svg width="26" height="26" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="13" cy="13" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
        <circle cx="13" cy="13" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: '12px', fontWeight: 700, color, minWidth: '22px' }}>{score}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string, string]> = {
    new:       ['rgba(99,102,241,0.12)',  '#818CF8', 'New'],
    reviewing: ['rgba(245,158,11,0.12)',  '#FCD34D', 'Reviewing'],
    quoted:    ['rgba(139,92,246,0.12)',  '#A78BFA', 'Quoted'],
    accepted:  ['rgba(16,185,129,0.12)', '#34D399',  'Accepted'],
    declined:  ['rgba(239,68,68,0.12)',  '#F87171',  'Declined'],
    closed:    ['rgba(71,85,105,0.2)',   '#64748B',  'Closed'],
  };
  const [bg, color, label] = map[status] ?? ['rgba(71,85,105,0.2)', '#64748B', status];
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '99px',
      background: bg, color, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();

    // Use getUser() — makes a network call to validate token, more reliable than getSession()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = "/login";
      } else {
        setAuthChecked(true);
      }
    });
  }, []);

  if (!authChecked) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080C14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          border: "3px solid rgba(59,130,246,0.2)",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.02em' }}>Dashboard</h1>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>Welcome back — here's what needs your attention today.</p>
          </div>
          <Link href="/leads" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', fontSize: '13px', fontWeight: 600,
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}>
            View all leads <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{
              background: '#0C1220', borderRadius: '14px', padding: '20px',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${s.color}18`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={s.color} strokeWidth={2} />
                </div>
                <ArrowUpRight size={14} color="#10B981" strokeWidth={2} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '14px' }}>{s.label}</div>
              <Sparkline data={s.sparkline} color={s.color} />
              <div style={{ fontSize: '11px', color: s.color, opacity: 0.8, marginTop: '6px' }}>{s.delta}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

        {/* Submissions Table */}
        <div style={{ background: '#0C1220', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F1F5F9' }}>Recent Submissions</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>AI-processed · sorted by recency</div>
            </div>
            <Link href="/leads" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6366F1', fontWeight: 600 }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 70px 30px', gap: '12px', padding: '8px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {['Lead', 'Agent', 'Status', 'Score', ''].map((h, i) => (
              <div key={i} style={{ fontSize: '10px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {SUBMISSIONS.map((sub) => (
            <Link key={sub.id} href={`/leads/${sub.id}`} style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 90px 70px 30px', gap: '12px',
              padding: '13px 22px', alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              transition: 'background 0.15s',
              cursor: 'pointer',
            }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Lead info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: `${sub.color}20`, border: `1px solid ${sub.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: sub.color,
                }}>{sub.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '2px' }}>{sub.name}</div>
                  <div style={{ fontSize: '11px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.request}</div>
                </div>
              </div>
              {/* Agent */}
              <div style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.agent}</div>
              {/* Status */}
              <StatusBadge status={sub.status} />
              {/* Score */}
              <ScoreRing score={sub.score} />
              {/* More */}
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}>
                <MoreHorizontal size={15} />
              </button>
            </Link>
          ))}

          {/* Footer */}
          <div style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#334155' }}>Showing 5 of 24 submissions</span>
            <Link href="/leads" style={{ fontSize: '11px', color: '#6366F1', fontWeight: 600 }}>View all →</Link>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Follow-ups */}
          <div style={{ background: '#0C1220', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', animation: 'pulseDot 2s infinite' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>Follow-ups Due</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'rgba(245,158,11,0.12)', color: '#FCD34D' }}>
                {FOLLOW_UPS.length}
              </span>
            </div>
            {FOLLOW_UPS.map((fu, i) => (
              <div key={fu.name} style={{
                padding: '13px 18px',
                borderBottom: i < FOLLOW_UPS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1' }}>{fu.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: fu.urgency === 'high' ? '#EF4444' : '#F59E0B' }} />
                    <span style={{ fontSize: '10px', color: fu.urgency === 'high' ? '#F87171' : '#FCD34D', fontWeight: 600 }}>
                      {fu.daysAgo}d ago
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#334155', marginBottom: '6px' }}>{fu.status}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6366F1' }}>
                  <Zap size={10} />
                  {fu.note}
                </div>
              </div>
            ))}
            <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button style={{
                width: '100%', padding: '9px', borderRadius: '8px',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                color: '#818CF8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                Review & Send Follow-ups
              </button>
            </div>
          </div>

          {/* This Week */}
          <div style={{ background: '#0C1220', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', padding: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9', marginBottom: '16px' }}>This Week</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {WEEK_STATS.map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#475569' }}>{item.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#CBD5E1' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Link href="/analytics" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6366F1', fontWeight: 600 }}>
                Full analytics report <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Quick agents */}
          <div style={{ background: '#0C1220', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>Active Agents</span>
              <Link href="/agents" style={{ fontSize: '11px', color: '#475569' }}>Manage →</Link>
            </div>
            {['Roofing Quote Agent', 'HVAC Quote Agent', 'Remodel Agent'].map((a, i) => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', flexShrink: 0, boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
                <span style={{ fontSize: '12px', color: '#64748B' }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
