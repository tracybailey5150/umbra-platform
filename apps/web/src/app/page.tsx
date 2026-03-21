import Link from "next/link";
import { ArrowRight, Zap, RefreshCw, Target, BarChart3, ChevronRight } from "lucide-react";
import { PLANS, PUBLIC_PLANS } from "@umbra/billing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* ── Ambient background ────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] bg-amber-500/8 rounded-full blur-[100px]" />
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="font-display text-white text-sm font-normal">U</span>
          </div>
          <span className="font-display text-xl text-white tracking-tight">Umbra</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#agents" className="hover:text-white transition-colors">Agent Types</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative z-10 text-center px-6 pt-24 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
          AI Agent Platform — Phase 1 Now Available
        </div>

        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-8">
          Agents that work
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300">
            until the job's done.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          One platform. Intelligent agents for quote capture, intake, lead qualification, 
          follow-up automation, and persistent buyer matching. Built for serious businesses.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-brand-600/25"
          >
            Start building your agent
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#agents"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white px-6 py-3.5 rounded-xl font-medium text-base border border-slate-800 hover:border-slate-600 transition-all"
          >
            See agent types
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Dashboard Preview ──────────────────────────────────── */}
      <section className="relative z-10 px-6 mb-32 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
          {/* Mock browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            <div className="flex-1 mx-4 bg-slate-800 rounded-md px-3 py-1 text-xs text-slate-500 text-center max-w-xs mx-auto">
              app.umbra.ai/dashboard
            </div>
          </div>
          {/* Mock dashboard content */}
          <div className="p-6 bg-slate-50/5">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "New Submissions", value: "24", delta: "+8 today", color: "brand" },
                { label: "Quote Ready", value: "11", delta: "45% of total", color: "amber" },
                { label: "Avg Response Time", value: "2.4h", delta: "↓ 18%", color: "emerald" },
                { label: "Est. Pipeline Value", value: "$84k", delta: "+$12k this week", color: "violet" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
                  <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                  <div className="text-2xl font-semibold text-white mb-0.5">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.delta}</div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-white">Recent Submissions</span>
                <span className="text-xs text-slate-500">View all →</span>
              </div>
              {[
                { name: "Marcus T.", request: "Roof replacement, 2,400 sqft, asphalt shingles", score: 87, status: "Quote Ready", time: "12m ago" },
                { name: "Sarah K.", request: "HVAC installation, 3-bedroom home, system upgrade", score: 72, status: "Reviewing", time: "1h ago" },
                { name: "James R.", request: "Kitchen remodel quote, semi-custom cabinets, granite", score: 91, status: "New", time: "2h ago" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-4 px-4 py-3 border-b border-slate-800/60 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {item.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    <div className="text-xs text-slate-500 truncate">{item.request}</div>
                  </div>
                  <div className="text-xs text-slate-500 hidden sm:block">{item.time}</div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">Score: {item.score}</span>
                  </div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.status === "New" ? "bg-blue-500/10 text-blue-400" :
                    item.status === "Quote Ready" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-white mb-4">Everything in one platform</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            One backend. Many focused agent products. Built to scale.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: <Zap size={22} />,
              title: "Intelligent Intake",
              desc: "AI captures messy requests and structures them into quote-ready summaries instantly.",
              accent: "brand",
            },
            {
              icon: <Target size={22} />,
              title: "Lead Qualification",
              desc: "Auto-score every submission and surface the most valuable opportunities first.",
              accent: "amber",
            },
            {
              icon: <RefreshCw size={22} />,
              title: "Follow-Up Automation",
              desc: "Personalized AI-written follow-ups sent at the right moment, automatically.",
              accent: "emerald",
            },
            {
              icon: <BarChart3 size={22} />,
              title: "Pipeline Analytics",
              desc: "Track conversion rates, response times, and revenue trends across every agent.",
              accent: "violet",
            },
          ].map((f) => (
            <div key={f.title} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                f.accent === "brand" ? "bg-brand-600/20 text-brand-400" :
                f.accent === "amber" ? "bg-amber-500/20 text-amber-400" :
                f.accent === "emerald" ? "bg-emerald-500/20 text-emerald-400" :
                "bg-violet-500/20 text-violet-400"
              }`}>
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Agent Types ───────────────────────────────────────── */}
      <section id="agents" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-semibold text-brand-400 tracking-widest uppercase mb-4">Phase 1</div>
            <h2 className="font-display text-5xl text-white mb-6">
              Quote &<br />Intake Agents
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Deploy an AI agent that captures service requests, extracts structured information,
              and generates quote-ready summaries — automatically. Works for any service business.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Branded intake form on your own URL",
                "AI processes submissions in seconds",
                "Missing info flagged automatically",
                "Lead enters your CRM pipeline",
                "Follow-up triggered on schedule",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                    <ChevronRight size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Launch your Quote Agent
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Coming in Phase 2</div>
              <h3 className="font-display text-2xl text-white mb-2">Persistent Buyer Agents</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                A user tells the agent what they want once. The agent searches, scores, monitors,
                and alerts — until the right match is found.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Car Agent", "Property Agent", "Land Agent", "Equipment Agent", "Jewelry Agent"].map((t) => (
                  <span key={t} className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-500 mb-3 uppercase tracking-widest">White-Label Ready</div>
              <h3 className="font-display text-2xl text-white mb-2">Your Brand, Your Domain</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every agent product can be white-labeled with your branding, custom domain,
                and custom theme. Build a fleet of focused agent URLs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-white mb-4">Simple, outcome-based pricing</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            One-time setup includes full configuration and onboarding. Monthly fee keeps your agents running.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PUBLIC_PLANS.map((plan, i) => (
            <div
              key={plan.slug}
              className={`rounded-2xl border p-6 flex flex-col ${
                i === 1
                  ? "bg-brand-600 border-brand-500 shadow-xl shadow-brand-600/25"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              } transition-colors`}
            >
              <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${i === 1 ? "text-brand-200" : "text-slate-500"}`}>
                {plan.name}
              </div>
              <div className={`font-display text-3xl mb-1 ${i === 1 ? "text-white" : "text-white"}`}>
                {plan.displayPrice}
              </div>
              <div className={`text-sm mb-6 ${i === 1 ? "text-brand-200" : "text-slate-500"}`}>
                {plan.displaySetup}
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.highlights.map((h) => (
                  <li key={h} className={`flex items-start gap-2 text-sm ${i === 1 ? "text-brand-100" : "text-slate-400"}`}>
                    <ChevronRight size={14} className={`mt-0.5 flex-shrink-0 ${i === 1 ? "text-brand-200" : "text-slate-600"}`} />
                    {h}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  i === 1
                    ? "bg-white text-brand-700 hover:bg-brand-50"
                    : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl px-8 py-5">
            <div>
              <div className="text-white font-semibold">Enterprise Custom Agent Build</div>
              <div className="text-slate-400 text-sm">Starting at $15,000 setup · Custom monthly</div>
            </div>
            <Link href="/contact" className="flex-shrink-0 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Contact us →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-32 text-center max-w-3xl mx-auto">
        <h2 className="font-display text-5xl md:text-6xl text-white mb-6">
          Ready to deploy your first agent?
        </h2>
        <p className="text-slate-400 text-lg mb-10">
          Start capturing, qualifying, and following up on leads automatically — in days, not months.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-brand-600/25"
        >
          Build your agent
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
              <span className="font-display text-white text-xs">U</span>
            </div>
            <span className="font-display text-white">Umbra</span>
          </div>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Umbra Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
