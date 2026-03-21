"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, Zap, MessageSquare, CheckCircle2 } from "lucide-react";

const AGENT_TYPES = [
  {
    id: "quote",
    label: "Quote Agent",
    icon: Bot,
    desc: "Capture and structure inbound quote requests. AI extracts key details and scores lead quality.",
    examples: ["Roofing quotes", "HVAC estimates", "Remodel bids"],
  },
  {
    id: "intake",
    label: "Intake Agent",
    icon: Zap,
    desc: "General purpose intake form with AI-powered information extraction and pipeline tracking.",
    examples: ["Service requests", "Consultation bookings", "Project intake"],
  },
  {
    id: "follow_up",
    label: "Follow-Up Agent",
    icon: MessageSquare,
    desc: "Re-engage leads that haven't responded. AI drafts personalized follow-ups on schedule.",
    examples: ["3-day follow-up", "Abandoned quote recovery", "Re-engagement"],
  },
];

type Step = "type" | "details" | "launch";

export default function NewAgentPage() {
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<string>("");
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");
  const [industry, setIndustry] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);

  async function handleCreate() {
    setIsCreating(true);
    await new Promise((r) => setTimeout(r, 1400));
    setIsCreating(false);
    setCreated(true);
  }

  if (created) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h1 className="font-display text-3xl text-slate-900 mb-2">Agent created!</h1>
        <p className="text-slate-500 mb-8">
          <strong>{agentName}</strong> is ready to configure and deploy.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/agents/new-agent-id" className="btn-primary">
            Configure agent →
          </Link>
          <Link href="/agents" className="btn-secondary">
            Back to agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/agents" className="btn-ghost p-2"><ArrowLeft size={16} /></Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">New Agent</h1>
          <p className="text-sm text-slate-500">Configure a new AI agent for your workspace</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {(["type", "details", "launch"] as Step[]).map((s, i) => {
          const stepIndex = ["type", "details", "launch"].indexOf(step);
          const isActive = s === step;
          const isDone = i < stepIndex;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                isDone ? "text-emerald-600" : isActive ? "text-brand-600" : "text-slate-400"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isDone ? "bg-emerald-100" :
                  isActive ? "bg-brand-600 text-white" : "bg-slate-100"
                }`}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span className="capitalize">{s}</span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step: Choose type */}
      {step === "type" && (
        <div className="animate-slide-up">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Choose agent type</h2>
          <p className="text-sm text-slate-500 mb-5">Select the type of agent that fits your workflow.</p>
          <div className="space-y-3">
            {AGENT_TYPES.map(({ id, label, icon: Icon, desc, examples }) => (
              <button
                key={id}
                onClick={() => setSelectedType(id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selectedType === id
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedType === id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 mb-1">{label}</div>
                  <div className="text-sm text-slate-500 mb-2">{desc}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {examples.map((e) => (
                      <span key={e} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                </div>
                {selectedType === id && (
                  <CheckCircle2 size={18} className="text-brand-600 flex-shrink-0 mt-1" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              disabled={!selectedType}
              onClick={() => setStep("details")}
              className="btn-primary disabled:opacity-50"
            >
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Details */}
      {step === "details" && (
        <div className="animate-slide-up space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Agent details</h2>
            <p className="text-sm text-slate-500 mb-5">Give your agent a name and business context.</p>
          </div>
          <div className="card p-5 space-y-4">
            <div>
              <label className="label">Agent name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="input"
                placeholder="e.g. Roofing Quote Agent"
              />
            </div>
            <div>
              <label className="label">Business context</label>
              <textarea
                rows={3}
                value={agentDesc}
                onChange={(e) => setAgentDesc(e.target.value)}
                className="input resize-none"
                placeholder="Briefly describe your business and what this agent will handle. The AI uses this to improve extraction accuracy."
              />
            </div>
            <div>
              <label className="label">Industry</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input">
                <option value="">Select industry...</option>
                <option>Home Services</option>
                <option>Construction & Remodeling</option>
                <option>Real Estate</option>
                <option>Automotive</option>
                <option>Equipment & Machinery</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep("type")} className="btn-secondary">← Back</button>
            <button
              disabled={!agentName.trim()}
              onClick={() => setStep("launch")}
              className="btn-primary disabled:opacity-50"
            >
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Review & Launch */}
      {step === "launch" && (
        <div className="animate-slide-up">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Review & launch</h2>
          <p className="text-sm text-slate-500 mb-5">Confirm your agent settings before creating.</p>

          <div className="card p-5 space-y-4 mb-6">
            {[
              { label: "Agent type", value: AGENT_TYPES.find((t) => t.id === selectedType)?.label ?? selectedType },
              { label: "Name", value: agentName },
              { label: "Industry", value: industry || "—" },
              { label: "Context", value: agentDesc || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500 flex-shrink-0 w-28">{label}</span>
                <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 mb-2">
              <Zap size={13} /> What happens next
            </div>
            <ul className="space-y-1.5 text-xs text-brand-600">
              {[
                "Agent is created with default intake form fields",
                "AI system prompt is pre-configured for your industry",
                "You can customize the form, AI config, and follow-up settings",
                "Share the intake URL to start capturing leads",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <ArrowRight size={11} className="mt-0.5 flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setStep("details")} className="btn-secondary">← Back</button>
            <button onClick={handleCreate} disabled={isCreating} className="btn-primary">
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Bot size={15} />}
              {isCreating ? "Creating..." : "Create agent"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
