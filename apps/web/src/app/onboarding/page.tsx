"use client";

import { useState } from "react";
import { ArrowRight, Building2, Globe, Palette, CheckCircle2, Zap } from "lucide-react";

type Step = "basics" | "brand" | "agent" | "done";

const INDUSTRIES = [
  "Home Services", "Construction & Remodeling", "Real Estate",
  "Automotive", "Equipment & Machinery", "Landscaping",
  "Electrical & Plumbing", "Cleaning Services", "Other",
];

export default function CreateOrgPage() {
  const [step, setStep]             = useState<Step>("basics");
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [orgName, setOrgName]       = useState("");
  const [orgSlug, setOrgSlug]       = useState("");
  const [industry, setIndustry]     = useState("");
  const [website, setWebsite]       = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b5ce6");
  const [agentType, setAgentType]   = useState("quote");
  const [agentName, setAgentName]   = useState("");

  function handleOrgNameChange(val: string) {
    setOrgName(val);
    setOrgSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function handleFinish() {
    setIsCreating(true);
    // TODO: POST /api/organizations + POST /api/agents
    await new Promise((r) => setTimeout(r, 1600));
    setIsCreating(false);
    setStep("done");
  }

  // ── Done state ───────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-brand-600" />
          </div>
          <h1 className="font-display text-4xl text-slate-900 mb-3">
            Your workspace is ready.
          </h1>
          <p className="text-slate-500 text-base mb-10 leading-relaxed">
            <strong>{orgName}</strong> is set up. Your first agent is configured and your
            intake form is live.
          </p>

          <div className="card p-6 text-left mb-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Your intake form URL
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
              <Globe size={15} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 font-mono truncate">
                {typeof window !== "undefined" ? window.location.origin : "https://app.umbra.ai"}
                /submit/{orgSlug}/{agentName.toLowerCase().replace(/\s+/g, "-") || "quote-agent"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a href="/dashboard" className="btn-primary w-full justify-center py-3 text-base">
              Go to dashboard <ArrowRight size={17} />
            </a>
            <a href="/agents" className="btn-secondary w-full justify-center py-3 text-base">
              Configure your agent
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Step indicator ───────────────────────────────────────────────────────
  const steps: Array<{ id: Step; label: string }> = [
    { id: "basics", label: "Basics" },
    { id: "brand",  label: "Brand" },
    { id: "agent",  label: "First agent" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <span className="font-display text-white text-base">U</span>
          </div>
          <h1 className="font-display text-3xl text-slate-900">Set up your workspace</h1>
          <p className="text-slate-500 text-sm mt-1">This takes about 2 minutes.</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${
                i < currentIdx ? "text-emerald-600" :
                i === currentIdx ? "text-brand-600" : "text-slate-400"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  i < currentIdx ? "bg-emerald-500 text-white" :
                  i === currentIdx ? "bg-brand-600 text-white" :
                  "bg-slate-200 text-slate-500"
                }`}>
                  {i < currentIdx ? "✓" : i + 1}
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px ${i < currentIdx ? "bg-emerald-300" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {/* ── STEP 1: Basics ──────────────────────────────────────── */}
          {step === "basics" && (
            <div className="animate-slide-up space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-brand-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Organization basics</h2>
                </div>
              </div>
              <div>
                <label className="label">Organization name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  className="input"
                  placeholder="Acme Services LLC"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Workspace URL</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500 whitespace-nowrap">
                    umbra.ai/org/
                  </span>
                  <input
                    type="text"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="input rounded-l-none"
                    placeholder="acme-services"
                  />
                </div>
              </div>
              <div>
                <label className="label">Industry <span className="text-red-500">*</span></label>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input">
                  <option value="">Select your industry...</option>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Website <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input"
                  placeholder="https://yourcompany.com"
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  disabled={!orgName.trim() || !industry}
                  onClick={() => setStep("brand")}
                  className="btn-primary disabled:opacity-50"
                >
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Brand ───────────────────────────────────────── */}
          {step === "brand" && (
            <div className="animate-slide-up space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Palette size={18} className="text-brand-600" />
                <h2 className="text-lg font-semibold text-slate-800">Brand settings</h2>
              </div>
              <p className="text-sm text-slate-500">
                Your brand colors will be applied to your intake forms. You can always update these later.
              </p>

              <div>
                <label className="label">Primary brand color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="input w-32 font-mono text-sm"
                    maxLength={7}
                  />
                  <div
                    className="flex-1 h-10 rounded-lg border border-slate-200"
                    style={{ background: primaryColor }}
                  />
                </div>
              </div>

              {/* Color presets */}
              <div>
                <div className="text-xs text-slate-500 mb-2">Quick presets</div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "#3b5ce6", "#0f766e", "#7c3aed", "#dc2626",
                    "#d97706", "#0369a1", "#1d4ed8", "#0f172a",
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        primaryColor === c ? "border-slate-700 scale-110" : "border-transparent"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-500 mb-3 font-medium">Form preview</div>
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <div
                    className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: primaryColor }}
                  >
                    {orgName.charAt(0) || "A"}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mb-1">
                    {orgName || "Your Company"} — Quote Request
                  </div>
                  <div className="h-2 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-slate-100 rounded w-1/2 mb-4" />
                  <div
                    className="text-xs text-white text-center py-2 rounded-lg font-semibold"
                    style={{ background: primaryColor }}
                  >
                    Submit Request
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep("basics")} className="btn-secondary">← Back</button>
                <button onClick={() => setStep("agent")} className="btn-primary">
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: First Agent ─────────────────────────────────── */}
          {step === "agent" && (
            <div className="animate-slide-up space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-brand-600" />
                <h2 className="text-lg font-semibold text-slate-800">Create your first agent</h2>
              </div>
              <p className="text-sm text-slate-500">
                You can add more agents anytime. This gets you started.
              </p>

              <div>
                <label className="label">Agent name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="input"
                  placeholder={`${orgName ? orgName + " " : ""}Quote Agent`}
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Agent type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "quote",   label: "Quote Agent",  desc: "Capture & structure quotes" },
                    { id: "intake",  label: "Intake Agent", desc: "General intake & triage" },
                    { id: "follow_up", label: "Follow-Up",   desc: "Re-engage cold leads" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAgentType(t.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        agentType === t.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-700 mb-0.5">{t.label}</div>
                      <div className="text-xs text-slate-400 leading-tight">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-2">
                  <CheckCircle2 size={15} />
                  What you'll get instantly
                </div>
                <ul className="space-y-1.5">
                  {[
                    "A shareable intake form URL",
                    "Default form fields for your industry",
                    "AI system prompt pre-configured",
                    "Lead pipeline ready to go",
                  ].map((item) => (
                    <li key={item} className="text-xs text-emerald-700 flex items-center gap-2">
                      <ArrowRight size={11} className="flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep("brand")} className="btn-secondary">← Back</button>
                <button
                  disabled={!agentName.trim() || isCreating}
                  onClick={handleFinish}
                  className="btn-primary disabled:opacity-60"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating workspace...
                    </>
                  ) : (
                    <>Launch workspace <ArrowRight size={15} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
