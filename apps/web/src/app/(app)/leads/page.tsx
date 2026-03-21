import Link from "next/link";
import { Search, Filter, ArrowRight, Download, Plus } from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const LEADS = [
  {
    id: "l1", name: "Marcus T.", email: "marcus@example.com", phone: "(555) 012-3456",
    request: "Roof replacement, 2,400 sqft, asphalt shingles",
    agent: "Roofing Quote Agent", score: 87, status: "quoted",
    estimatedValue: 18500, assignedTo: "Sarah M.", submittedAt: "2h ago", stage: "Quoted",
  },
  {
    id: "l2", name: "Sarah K.", email: "sarah@example.com", phone: "(555) 234-5678",
    request: "HVAC installation, 3-bedroom home, full system replacement",
    agent: "HVAC Quote Agent", score: 72, status: "reviewing",
    estimatedValue: 9200, assignedTo: "Tom B.", submittedAt: "3h ago", stage: "Qualifying",
  },
  {
    id: "l3", name: "James R.", email: "james@example.com", phone: "(555) 345-6789",
    request: "Kitchen remodel, semi-custom cabinets, granite counters, approx $80k budget",
    agent: "Remodel Quote Agent", score: 91, status: "new",
    estimatedValue: 78000, assignedTo: null, submittedAt: "4h ago", stage: "Intake",
  },
  {
    id: "l4", name: "Priya M.", email: "priya@example.com", phone: "(555) 456-7890",
    request: "Landscaping design and install, 0.5 acre backyard, full design + labor",
    agent: "Landscaping Agent", score: 64, status: "new",
    estimatedValue: null, assignedTo: null, submittedAt: "6h ago", stage: "Intake",
  },
  {
    id: "l5", name: "Tom W.", email: "tom@example.com", phone: "(555) 567-8901",
    request: "Commercial painting, 4,000 sqft office, 2 coats, need done in 3 weeks",
    agent: "Painting Quote Agent", score: 78, status: "reviewing",
    estimatedValue: 22000, assignedTo: "Lisa P.", submittedAt: "8h ago", stage: "Qualifying",
  },
  {
    id: "l6", name: "Elena V.", email: "elena@example.com", phone: "(555) 678-9012",
    request: "Deck build, 400 sqft composite, pergola add-on, permit required",
    agent: "Carpentry Agent", score: 83, status: "quoted",
    estimatedValue: 34000, assignedTo: "Tom B.", submittedAt: "1d ago", stage: "Quoted",
  },
  {
    id: "l7", name: "Robert C.", email: "robert@example.com", phone: "(555) 789-0123",
    request: "Concrete driveway replacement, 2-car width, approx 800 sqft",
    agent: "Concrete Agent", score: 55, status: "new",
    estimatedValue: null, assignedTo: null, submittedAt: "1d ago", stage: "Intake",
  },
  {
    id: "l8", name: "Nancy P.", email: "nancy@example.com", phone: "(555) 890-1234",
    request: "Bathroom remodel, master bath, freestanding tub, custom tile",
    agent: "Remodel Quote Agent", score: 88, status: "accepted",
    estimatedValue: 42000, assignedTo: "Sarah M.", submittedAt: "2d ago", stage: "Won",
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

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600">{score}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Leads & Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {LEADS.length} total submissions across all agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download size={15} />
            Export
          </button>
          <Link href="/leads/new" className="btn-primary">
            <Plus size={15} />
            Add manually
          </Link>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="card mb-5 p-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, request..."
              className="input pl-9 py-2"
            />
          </div>
          {/* Filter button */}
          <button className="btn-secondary py-2">
            <Filter size={15} />
            Filters
          </button>
          {/* Status tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab.value === "all"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  tab.value === "all" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          {["Lead", "Request", "Agent", "Score", "Value", "Status", ""].map((col) => (
            <div key={col} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {LEADS.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_40px] gap-4 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group"
            >
              {/* Lead */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {lead.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{lead.name}</div>
                  <div className="text-xs text-slate-400 truncate">{lead.email}</div>
                </div>
              </div>

              {/* Request */}
              <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {lead.request}
              </div>

              {/* Agent */}
              <div className="text-xs text-slate-600 truncate">{lead.agent}</div>

              {/* Score */}
              <ScoreBar score={lead.score} />

              {/* Value */}
              <div className="text-sm font-medium text-slate-700">
                {lead.estimatedValue
                  ? `$${(lead.estimatedValue / 1000).toFixed(0)}k`
                  : <span className="text-slate-400 text-xs">—</span>
                }
              </div>

              {/* Status */}
              <StatusBadge status={lead.status} />

              {/* Arrow */}
              <div className="text-slate-300 group-hover:text-brand-500 transition-colors">
                <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-500">Showing {LEADS.length} of {LEADS.length} leads</span>
          <div className="flex items-center gap-2">
            <button className="btn-ghost py-1.5 text-xs" disabled>← Prev</button>
            <span className="text-xs text-slate-500">Page 1 of 1</span>
            <button className="btn-ghost py-1.5 text-xs" disabled>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
