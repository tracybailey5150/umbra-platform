import Link from "next/link";
import {
  ArrowLeft, Zap, Mail, Phone, Clock, User, Bot,
  CheckCircle2, AlertCircle, MessageSquare, Send, Plus, Edit2,
} from "lucide-react";

// ─── Mock lead data ───────────────────────────────────────────────────────────

const LEAD = {
  id: "l1",
  name: "Marcus T.",
  email: "marcus@example.com",
  phone: "(555) 012-3456",
  company: null,
  status: "quoted",
  score: 87,
  estimatedValue: 18500,
  stage: "Quoted",
  assignedTo: "Sarah M.",
  submittedAt: "March 14, 2026 at 10:32 AM",
  agent: "Roofing Quote Agent",
  rawRequest: "Hi, I need a quote for a full roof replacement on my house. It's about 2,400 square feet, I'd prefer asphalt shingles if possible. The current roof is about 18 years old and has been leaking in two spots after heavy rain. I'd like to get this done before summer if possible. Budget is flexible but looking for good value.",
  aiSummary: "Homeowner requesting a full roof replacement on a 2,400 sq ft residential property. Current roof is 18 years old with active leak issues. Client prefers asphalt shingles and wants to complete work before summer. Budget is flexible, indicating value-focused rather than lowest-cost buyer.",
  aiStructuredData: {
    "Service Type": "Full Roof Replacement",
    "Property Size": "2,400 sq ft",
    "Material Preference": "Asphalt shingles",
    "Current Roof Age": "18 years",
    "Urgency": "Before summer",
    "Issue": "Active leaks in 2 spots",
    "Budget Sensitivity": "Flexible / value-focused",
  },
  aiMissingFields: ["Exact address / location", "Number of stories", "Current roofing material", "Preferred timeline within summer"],
  aiNextSteps: [
    "Schedule on-site measurement and inspection",
    "Send material options (3-tab, architectural, premium)",
    "Request photos of current leak areas",
    "Provide preliminary estimate range",
  ],
  quoteReadyScore: 87,
  timeline: [
    { type: "submission", label: "Submission received", time: "March 14, 10:32 AM", icon: "inbox" },
    { type: "ai", label: "AI processed submission — score 87/100", time: "March 14, 10:32 AM", icon: "zap" },
    { type: "status", label: "Status changed to Reviewing", time: "March 14, 11:05 AM", icon: "user" },
    { type: "note", label: "Note added by Sarah M.", time: "March 14, 11:20 AM", icon: "note", content: "Called and left voicemail. Will follow up tomorrow morning." },
    { type: "status", label: "Quote sent — $18,500 estimate", time: "March 14, 2:14 PM", icon: "check" },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "badge-new", reviewing: "badge-reviewing",
    quoted: "badge-quoted", accepted: "badge-accepted",
    declined: "badge-declined", closed: "badge-closed",
  };
  const labels: Record<string, string> = {
    new: "New", reviewing: "Reviewing", quoted: "Quoted",
    accepted: "Accepted", declined: "Declined", closed: "Closed",
  };
  return <span className={map[status] ?? "badge"}>{labels[status] ?? status}</span>;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-semibold text-slate-800">{score}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="animate-fade-in">
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leads" className="btn-ghost p-2">
          <ArrowLeft size={16} />
        </Link>
        <div className="text-sm text-slate-500">
          <Link href="/leads" className="hover:text-brand-600">Leads</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-700">{LEAD.name}</span>
        </div>
      </div>

      {/* Lead header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-bold">
              {LEAD.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-slate-900">{LEAD.name}</h1>
                <StatusBadge status={LEAD.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Mail size={13} />{LEAD.email}</span>
                <span className="flex items-center gap-1.5"><Phone size={13} />{LEAD.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary"><Mail size={15} /> Send email</button>
            <button className="btn-primary"><Edit2 size={15} /> Update status</button>
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
          {[
            { label: "Agent", value: LEAD.agent, icon: Bot },
            { label: "Submitted", value: LEAD.submittedAt, icon: Clock },
            { label: "Assigned to", value: LEAD.assignedTo ?? "Unassigned", icon: User },
            { label: "Est. Value", value: `$${LEAD.estimatedValue?.toLocaleString() ?? "—"}`, icon: null },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <div className="text-xs text-slate-400 mb-0.5">{label}</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                {Icon && <Icon size={13} className="text-slate-400" />}
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: AI analysis + raw request */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Summary */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                <Zap size={14} className="text-brand-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">AI Summary</h2>
              <span className="ml-auto text-xs text-slate-400">Processed instantly</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-5">{LEAD.aiSummary}</p>

            {/* Extracted fields */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Extracted Information
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {Object.entries(LEAD.aiStructuredData).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-slate-500">{key}: </span>
                      <span className="text-xs font-medium text-slate-700">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing fields */}
            {LEAD.aiMissingFields.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-2">
                  <AlertCircle size={13} />
                  Missing Information ({LEAD.aiMissingFields.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {LEAD.aiMissingFields.map((f) => (
                    <span key={f} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested next steps */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Suggested Next Steps
              </div>
              <ul className="space-y-1.5">
                {LEAD.aiNextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-xs text-slate-400 mt-0.5 font-mono w-4 flex-shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Raw submission */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Original Submission</h2>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4 italic">
              "{LEAD.rawRequest}"
            </p>
          </div>

          {/* Notes */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Notes</h2>
              <button className="btn-ghost py-1.5 text-xs">
                <Plus size={13} /> Add note
              </button>
            </div>
            <div className="p-5">
              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-semibold">S</div>
                  <span className="text-xs font-medium text-slate-700">Sarah M.</span>
                  <span className="text-xs text-slate-400 ml-auto">Mar 14, 11:20 AM</span>
                </div>
                <p className="text-sm text-slate-600">Called and left voicemail. Will follow up tomorrow morning.</p>
              </div>
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="Add a note..."
                  className="input resize-none"
                />
                <button className="absolute bottom-2.5 right-2.5 btn-primary py-1.5 text-xs">
                  <Send size={12} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: score, stage, timeline, follow-up */}
        <div className="space-y-5">
          {/* Quote-ready score */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Quote-Ready Score</div>
            <div className="flex items-center gap-4">
              <ScoreRing score={LEAD.quoteReadyScore} />
              <div>
                <div className="text-sm font-semibold text-slate-800 mb-0.5">
                  {LEAD.quoteReadyScore >= 80 ? "High quality lead" : LEAD.quoteReadyScore >= 60 ? "Good lead" : "Needs more info"}
                </div>
                <div className="text-xs text-slate-500">AI confidence score</div>
              </div>
            </div>
          </div>

          {/* Pipeline stage */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Pipeline Stage</div>
            <div className="space-y-2">
              {["Intake", "Qualifying", "Quoted", "Negotiating", "Won / Lost"].map((stage) => (
                <div key={stage} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  stage === LEAD.stage
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-slate-500"
                }`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    stage === LEAD.stage ? "bg-brand-500" : "bg-slate-200"
                  }`} />
                  {stage}
                </div>
              ))}
            </div>
            <button className="btn-secondary w-full mt-3 text-xs py-2">Move to next stage</button>
          </div>

          {/* Follow-up */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={14} className="text-brand-600" />
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Follow-Up</div>
            </div>
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 mb-3">
              <div className="text-xs font-medium text-brand-700 mb-1">AI draft ready</div>
              <p className="text-xs text-brand-600 leading-relaxed">
                "Hi Marcus, just wanted to follow up on your roofing project — we'd love to schedule a free on-site estimate..."
              </p>
            </div>
            <button className="btn-primary w-full text-xs py-2">
              <Send size={12} /> Send AI follow-up
            </button>
          </div>

          {/* Activity timeline */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Activity</div>
            <div className="space-y-4">
              {LEAD.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    event.type === "ai" ? "bg-brand-100 text-brand-600" :
                    event.type === "status" ? "bg-slate-100 text-slate-600" :
                    event.type === "note" ? "bg-amber-100 text-amber-600" :
                    "bg-emerald-100 text-emerald-600"
                  }`}>
                    {event.type === "ai" ? <Zap size={11} /> :
                     event.type === "check" ? <CheckCircle2 size={11} /> :
                     event.type === "note" ? <MessageSquare size={11} /> :
                     <Clock size={11} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700">{event.label}</div>
                    {event.content && (
                      <div className="text-xs text-slate-500 mt-0.5">{event.content}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-0.5">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
