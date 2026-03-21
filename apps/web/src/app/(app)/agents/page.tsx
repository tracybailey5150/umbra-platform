import Link from "next/link";
import { Plus, Bot, ExternalLink, Settings, Copy, ToggleLeft, ToggleRight, Zap } from "lucide-react";

const AGENTS = [
  {
    id: "a1", name: "Roofing Quote Agent", type: "quote", isActive: true,
    submissions: 34, convRate: "24%", lastActivity: "2h ago",
    intakeUrl: "https://app.umbra.ai/submit/acme-roofing",
    description: "Handles inbound roofing quote requests for residential and light commercial.",
  },
  {
    id: "a2", name: "HVAC Quote Agent", type: "quote", isActive: true,
    submissions: 28, convRate: "18%", lastActivity: "4h ago",
    intakeUrl: "https://app.umbra.ai/submit/acme-hvac",
    description: "Captures and qualifies HVAC installation and replacement requests.",
  },
  {
    id: "a3", name: "Remodel Quote Agent", type: "intake", isActive: true,
    submissions: 22, convRate: "27%", lastActivity: "1d ago",
    intakeUrl: "https://app.umbra.ai/submit/acme-remodel",
    description: "Kitchen and bath remodel intake — collects scope, budget, and timeline.",
  },
  {
    id: "a4", name: "Follow-Up Agent", type: "follow_up", isActive: false,
    submissions: 0, convRate: "—", lastActivity: "Never",
    intakeUrl: null,
    description: "Re-engages leads that haven't responded after 3+ days. Draft only.",
  },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  quote:     { label: "Quote Agent",   color: "bg-brand-50 text-brand-700" },
  intake:    { label: "Intake Agent",  color: "bg-violet-50 text-violet-700" },
  follow_up: { label: "Follow-Up",     color: "bg-amber-50 text-amber-700" },
};

export default function AgentsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Agent Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure and manage your active agents</p>
        </div>
        <Link href="/agents/new" className="btn-primary">
          <Plus size={15} />
          New Agent
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="card p-5 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  agent.isActive ? "bg-brand-100 text-brand-600" : "bg-slate-100 text-slate-400"
                }`}>
                  <Bot size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{agent.name}</div>
                  <span className={`badge mt-0.5 ${TYPE_LABELS[agent.type]?.color}`}>
                    {TYPE_LABELS[agent.type]?.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {agent.isActive
                  ? <ToggleRight size={22} className="text-brand-600 cursor-pointer" />
                  : <ToggleLeft size={22} className="text-slate-300 cursor-pointer" />
                }
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">{agent.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Submissions", value: agent.submissions },
                { label: "Conv. Rate", value: agent.convRate },
                { label: "Last Activity", value: agent.lastActivity },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-2.5">
                  <div className="text-sm font-semibold text-slate-800">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Intake URL */}
            {agent.intakeUrl && (
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 mb-4">
                <span className="text-xs text-slate-500 truncate flex-1">{agent.intakeUrl}</span>
                <button className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                  <Copy size={13} />
                </button>
                <a
                  href={agent.intakeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-brand-600 transition-colors flex-shrink-0"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/agents/${agent.id}`} className="btn-secondary flex-1 py-2 text-xs justify-center">
                <Settings size={13} />
                Configure
              </Link>
              <Link href={`/agents/${agent.id}/preview`} className="btn-ghost flex-1 py-2 text-xs justify-center">
                <ExternalLink size={13} />
                Preview form
              </Link>
            </div>
          </div>
        ))}

        {/* Create new agent CTA */}
        <Link
          href="/agents/new"
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-colors min-h-[200px] group"
        >
          <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:border-brand-400 transition-colors">
            <Plus size={20} />
          </div>
          <div className="text-sm font-medium">Create a new agent</div>
          <div className="text-xs text-center max-w-[160px] text-slate-400">
            Quote, intake, or follow-up agents for any workflow
          </div>
        </Link>
      </div>

      {/* Future agents notice */}
      <div className="mt-8 bg-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Zap size={16} className="text-amber-400" />
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Coming Soon — Phase 2</div>
        </div>
        <h3 className="font-display text-2xl mb-2">Persistent Buyer Agents</h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
          Buyer agents that run continuously — searching, scoring, monitoring, and alerting — until the right match is found.
          Car, property, land, equipment, jewelry, and more.
        </p>
      </div>
    </div>
  );
}
