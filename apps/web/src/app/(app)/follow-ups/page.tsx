import Link from "next/link";
import {
  Send, Clock, CheckCircle2, XCircle, Zap,
  Calendar, ArrowRight, RefreshCw, Filter,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

type FollowUpStatus = "pending" | "sent" | "responded" | "skipped" | "failed";

interface FollowUp {
  id: string;
  leadName: string;
  leadEmail: string;
  leadId: string;
  requestSummary: string;
  channel: "email" | "sms";
  status: FollowUpStatus;
  scheduledFor: string;
  sentAt?: string;
  followUpNumber: number;
  isAiGenerated: boolean;
  subject?: string;
  preview: string;
  agent: string;
}

const FOLLOW_UPS: FollowUp[] = [
  {
    id: "fu1", leadName: "Elena V.", leadEmail: "elena@example.com", leadId: "l6",
    requestSummary: "Deck build, 400 sqft composite with pergola",
    channel: "email", status: "pending",
    scheduledFor: "Due now", followUpNumber: 1, isAiGenerated: true,
    subject: "Following up on your deck project",
    preview: "Hi Elena, just checking in on your deck and pergola project — we'd love to schedule a free on-site estimate...",
    agent: "Carpentry Agent",
  },
  {
    id: "fu2", leadName: "Robert C.", leadEmail: "robert@example.com", leadId: "l7",
    requestSummary: "Concrete driveway replacement, 800 sqft",
    channel: "email", status: "pending",
    scheduledFor: "Due in 2h", followUpNumber: 2, isAiGenerated: true,
    subject: "Still interested in a driveway quote?",
    preview: "Hi Robert, this is our second follow-up on your concrete driveway request. We have availability next week...",
    agent: "Concrete Agent",
  },
  {
    id: "fu3", leadName: "Priya M.", leadEmail: "priya@example.com", leadId: "l4",
    requestSummary: "Landscaping design, 0.5 acre backyard",
    channel: "email", status: "pending",
    scheduledFor: "Due in 4h", followUpNumber: 1, isAiGenerated: true,
    subject: "Your landscaping quote — let's talk",
    preview: "Hi Priya, we received your landscaping request and our team is excited about your backyard project...",
    agent: "Landscaping Agent",
  },
  {
    id: "fu4", leadName: "Tom W.", leadEmail: "tom@example.com", leadId: "l5",
    requestSummary: "Commercial painting, 4,000 sqft office",
    channel: "email", status: "sent",
    scheduledFor: "Yesterday", sentAt: "Mar 15, 9:04 AM", followUpNumber: 1, isAiGenerated: true,
    subject: "Your commercial painting quote",
    preview: "Hi Tom, following up on the commercial painting project for your office space...",
    agent: "Painting Agent",
  },
  {
    id: "fu5", leadName: "James R.", leadEmail: "james@example.com", leadId: "l3",
    requestSummary: "Kitchen remodel, semi-custom cabinets, granite",
    channel: "email", status: "responded",
    scheduledFor: "Mar 14", sentAt: "Mar 14, 10:30 AM", followUpNumber: 1, isAiGenerated: true,
    subject: "Kitchen remodel follow-up",
    preview: "Hi James, just following up on your kitchen remodel inquiry...",
    agent: "Remodel Agent",
  },
  {
    id: "fu6", leadName: "Nancy P.", leadEmail: "nancy@example.com", leadId: "l8",
    requestSummary: "Master bath remodel, freestanding tub",
    channel: "email", status: "skipped",
    scheduledFor: "Mar 13", followUpNumber: 3, isAiGenerated: true,
    subject: "Final follow-up on your bathroom remodel",
    preview: "Hi Nancy, this will be our last follow-up...",
    agent: "Remodel Agent",
  },
];

const STATUS_CONFIG: Record<FollowUpStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:   { label: "Pending",   icon: Clock,        color: "text-amber-700",  bg: "bg-amber-50" },
  sent:      { label: "Sent",      icon: Send,         color: "text-blue-700",   bg: "bg-blue-50" },
  responded: { label: "Responded", icon: CheckCircle2, color: "text-emerald-700",bg: "bg-emerald-50" },
  skipped:   { label: "Skipped",   icon: XCircle,      color: "text-slate-600",  bg: "bg-slate-100" },
  failed:    { label: "Failed",    icon: XCircle,      color: "text-red-700",    bg: "bg-red-50" },
};

const PENDING   = FOLLOW_UPS.filter((f) => f.status === "pending");
const SENT      = FOLLOW_UPS.filter((f) => f.status === "sent");
const COMPLETED = FOLLOW_UPS.filter((f) => ["responded", "skipped", "failed"].includes(f.status));

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FollowUpStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function FollowUpCard({ fu, showActions = false }: { fu: FollowUp; showActions?: boolean }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {fu.leadName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/leads/${fu.leadId}`} className="text-sm font-semibold text-slate-800 hover:text-brand-600 transition-colors">
                {fu.leadName}
              </Link>
              <StatusBadge status={fu.status} />
              <span className="text-xs text-slate-400">Follow-up #{fu.followUpNumber}</span>
            </div>
            <div className="text-xs text-slate-500 truncate">{fu.requestSummary}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
          <Calendar size={11} />
          {fu.scheduledFor}
        </div>
      </div>

      {/* Email preview */}
      <div className="bg-slate-50 rounded-lg p-3 mb-3">
        {fu.subject && (
          <div className="text-xs font-semibold text-slate-700 mb-1">
            Subject: {fu.subject}
          </div>
        )}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{fu.preview}</p>
        {fu.isAiGenerated && (
          <div className="flex items-center gap-1 mt-2 text-xs text-brand-600">
            <Zap size={10} />
            AI-generated · ready to send
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && fu.status === "pending" && (
        <div className="flex items-center gap-2">
          <button className="btn-primary flex-1 py-2 text-xs justify-center">
            <Send size={12} />
            Send now
          </button>
          <button className="btn-secondary py-2 text-xs px-3">
            Edit
          </button>
          <button className="btn-ghost py-2 text-xs px-3 text-slate-400">
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FollowUpsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Follow-Ups</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {PENDING.length} pending · {SENT.length} sent · {COMPLETED.length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <Filter size={15} /> Filter
          </button>
          <button className="btn-primary">
            <Send size={15} /> Send all pending
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pending",    value: PENDING.length,              color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Sent today", value: SENT.length,                 color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Responded",  value: COMPLETED.filter((f) => f.status === "responded").length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Response rate", value: "31%",                    color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <div className={`text-2xl font-semibold mb-0.5 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending — primary action column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Due Now · {PENDING.length} pending
            </h2>
            <button className="btn-ghost text-xs py-1.5">
              <RefreshCw size={12} /> Regenerate all
            </button>
          </div>

          {PENDING.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-3" />
              <div className="text-sm font-medium text-slate-600">All caught up!</div>
              <div className="text-xs text-slate-400 mt-1">No pending follow-ups right now.</div>
            </div>
          ) : (
            PENDING.map((fu) => <FollowUpCard key={fu.id} fu={fu} showActions />)
          )}

          {/* Sent section */}
          {SENT.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-slate-700 pt-2">
                Sent Recently · {SENT.length}
              </h2>
              {SENT.map((fu) => <FollowUpCard key={fu.id} fu={fu} />)}
            </>
          )}
        </div>

        {/* Right: completed + tips */}
        <div className="space-y-5">
          {/* Completed */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Completed</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {COMPLETED.map((fu) => (
                <div key={fu.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-slate-700">{fu.leadName}</span>
                    <StatusBadge status={fu.status} />
                  </div>
                  <p className="text-xs text-slate-400 truncate">{fu.requestSummary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Automation settings card */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={15} className="text-brand-600" />
              <h2 className="text-sm font-semibold text-slate-700">Automation</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Auto follow-up",     value: "Enabled" },
                { label: "First follow-up",    value: "24h after submission" },
                { label: "Max follow-ups",     value: "3 per lead" },
                { label: "AI personalization", value: "On" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="font-medium text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/agents" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Edit automation settings <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
