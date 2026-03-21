import {
  TrendingUp,
  Inbox,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
  Zap,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ─── Mock Data (replace with real DB queries) ─────────────────────────────────

const STATS = [
  {
    label: "New Submissions",
    value: "24",
    delta: "+8 today",
    trend: "up",
    icon: Inbox,
    color: "brand",
  },
  {
    label: "Quote Ready",
    value: "11",
    delta: "45% of total",
    trend: "up",
    icon: Zap,
    color: "amber",
  },
  {
    label: "Avg Response",
    value: "2.4h",
    delta: "↓ 18% vs last week",
    trend: "up",
    icon: Clock,
    color: "emerald",
  },
  {
    label: "Pipeline Value",
    value: "$84k",
    delta: "+$12k this week",
    trend: "up",
    icon: DollarSign,
    color: "violet",
  },
];

const RECENT_SUBMISSIONS = [
  {
    id: "s1",
    name: "Marcus T.",
    email: "marcus@example.com",
    request: "Roof replacement, 2,400 sqft, asphalt shingles preferred",
    score: 87,
    status: "quoted",
    agent: "Roofing Quote Agent",
    time: "12m ago",
  },
  {
    id: "s2",
    name: "Sarah K.",
    email: "sarah@example.com",
    request: "HVAC installation, 3-bedroom home, system upgrade needed",
    score: 72,
    status: "reviewing",
    agent: "HVAC Quote Agent",
    time: "1h ago",
  },
  {
    id: "s3",
    name: "James R.",
    email: "james@example.com",
    request: "Kitchen remodel quote, semi-custom cabinets, granite counters",
    score: 91,
    status: "new",
    agent: "Remodel Quote Agent",
    time: "2h ago",
  },
  {
    id: "s4",
    name: "Priya M.",
    email: "priya@example.com",
    request: "Landscaping design and install, approx 0.5 acre backyard",
    score: 64,
    status: "new",
    agent: "Landscaping Agent",
    time: "3h ago",
  },
  {
    id: "s5",
    name: "Tom W.",
    email: "tom@example.com",
    request: "Commercial painting, 4,000 sqft office space, 2 coats",
    score: 78,
    status: "reviewing",
    agent: "Painting Quote Agent",
    time: "5h ago",
  },
];

const FOLLOW_UPS_DUE = [
  { name: "Elena V.", daysAgo: 3, status: "No response", agentNote: "AI follow-up ready to send" },
  { name: "Robert C.", daysAgo: 5, status: "No response", agentNote: "2nd follow-up recommended" },
  { name: "Nancy P.", daysAgo: 2, status: "Opened email", agentNote: "Opened but no reply" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  stat,
}: {
  stat: (typeof STATS)[0];
}) {
  const Icon = stat.icon;
  const colorMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
          <Icon size={18} />
        </div>
        {stat.trend === "up" && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight size={13} />
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold text-slate-900 mb-0.5">{stat.value}</div>
      <div className="text-sm text-slate-500 mb-1">{stat.label}</div>
      <div className="text-xs text-slate-400">{stat.delta}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "badge-new",
    reviewing: "badge-reviewing",
    quoted: "badge-quoted",
    accepted: "badge-accepted",
    declined: "badge-declined",
    closed: "badge-closed",
  };
  const labels: Record<string, string> = {
    new: "New",
    reviewing: "Reviewing",
    quoted: "Quoted",
    accepted: "Accepted",
    declined: "Declined",
    closed: "Closed",
  };
  return <span className={map[status] ?? "badge"}>{labels[status] ?? status}</span>;
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-700 bg-emerald-50" :
    score >= 60 ? "text-amber-700 bg-amber-50" :
    "text-red-700 bg-red-50";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back — here's what needs your attention.
          </p>
        </div>
        <Link href="/leads" className="btn-primary">
          View all leads
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent submissions — spans 2 cols */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Recent Submissions</h2>
            <Link href="/leads" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {RECENT_SUBMISSIONS.map((sub) => (
              <Link
                key={sub.id}
                href={`/leads/${sub.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {sub.name.charAt(0)}
                </div>
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-slate-800">{sub.name}</span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{sub.request}</p>
                </div>
                {/* Score */}
                <ScorePill score={sub.score} />
                {/* Time */}
                <span className="text-xs text-slate-400 hidden sm:block flex-shrink-0">{sub.time}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Follow-ups due */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-500" />
                <h2 className="text-sm font-semibold text-slate-800">Follow-ups Due</h2>
              </div>
              <span className="badge bg-amber-50 text-amber-700">{FOLLOW_UPS_DUE.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {FOLLOW_UPS_DUE.map((fu) => (
                <div key={fu.name} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{fu.name}</span>
                    <span className="text-xs text-slate-400">{fu.daysAgo}d ago</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{fu.status}</div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-600">
                    <Zap size={11} />
                    {fu.agentNote}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-slate-100">
              <button className="btn-secondary w-full text-xs py-2">
                Review & Send Follow-ups
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">This Week</h2>
            <div className="space-y-3">
              {[
                { label: "Submissions received", value: "31" },
                { label: "Quotes sent", value: "14" },
                { label: "Leads won", value: "3" },
                { label: "Conversion rate", value: "21%" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/analytics" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Full analytics report <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
