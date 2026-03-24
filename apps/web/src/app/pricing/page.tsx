import Link from "next/link";
import { Check, Minus, ArrowRight } from "lucide-react";
import { PLANS, PUBLIC_PLANS } from "@umbra/billing";
import { CheckoutButton } from "./CheckoutButton";

// Map plan slugs to Stripe live price IDs
const PLAN_PRICE_IDS: Record<string, string> = {
  quote_agent_starter: "price_1TEILnHW6WsrXJBUSHHgb3Tk",
  quote_agent_pro: "price_1TEILoHW6WsrXJBUpJRBIh2l",
  persistent_buyer_agent: "",
  white_label_install: "",
};

// ─── Feature comparison table rows ───────────────────────────────────────────

const FEATURES = [
  { label: "Quote / Intake Agents", category: "Agents" },
  { label: "Max agents",
    values: { quote_agent_starter: "1", quote_agent_pro: "5", persistent_buyer_agent: "1", white_label_install: "Unlimited" } },
  { label: "Monthly submissions",
    values: { quote_agent_starter: "200", quote_agent_pro: "Unlimited", persistent_buyer_agent: "Unlimited", white_label_install: "Unlimited" } },
  { label: "AI summaries & extraction",
    values: { quote_agent_starter: true, quote_agent_pro: true, persistent_buyer_agent: true, white_label_install: true } },
  { label: "AI follow-up automation",
    values: { quote_agent_starter: true, quote_agent_pro: true, persistent_buyer_agent: true, white_label_install: true } },
  { label: "Lead pipeline dashboard",
    values: { quote_agent_starter: true, quote_agent_pro: true, persistent_buyer_agent: true, white_label_install: true } },
  { label: "Team members",
    values: { quote_agent_starter: "3", quote_agent_pro: "10", persistent_buyer_agent: "5", white_label_install: "Unlimited" } },
  { label: "Analytics",
    values: { quote_agent_starter: "90 days", quote_agent_pro: "1 year", persistent_buyer_agent: "6 months", white_label_install: "2 years" } },
  { label: "Custom branding on forms",
    values: { quote_agent_starter: false, quote_agent_pro: true, persistent_buyer_agent: true, white_label_install: true } },
  { label: "API access",
    values: { quote_agent_starter: false, quote_agent_pro: true, persistent_buyer_agent: false, white_label_install: true } },
  { label: "Custom domain (white-label)",
    values: { quote_agent_starter: false, quote_agent_pro: false, persistent_buyer_agent: false, white_label_install: true } },
  { label: "Priority support",
    values: { quote_agent_starter: false, quote_agent_pro: false, persistent_buyer_agent: false, white_label_install: true } },
  { label: "Persistent buyer agents", category: "Phase 2" },
  { label: "Search & match agents",
    values: { quote_agent_starter: false, quote_agent_pro: false, persistent_buyer_agent: true, white_label_install: true } },
  { label: "Match scoring & alerts",
    values: { quote_agent_starter: false, quote_agent_pro: false, persistent_buyer_agent: true, white_label_install: true } },
  { label: "Shortlist & comparison tools",
    values: { quote_agent_starter: false, quote_agent_pro: false, persistent_buyer_agent: true, white_label_install: true } },
];

const PLAN_KEYS = ["quote_agent_starter", "quote_agent_pro", "persistent_buyer_agent", "white_label_install"] as const;
const FEATURED = "quote_agent_pro";

function FeatureValue({ value }: { value: boolean | string | undefined }) {
  if (value === true) return <Check size={16} className="text-emerald-500 mx-auto" />;
  if (value === false || value === undefined) return <Minus size={14} className="text-slate-300 mx-auto" />;
  return <span className="text-sm text-slate-600">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="font-display text-white text-xs">U</span>
          </div>
          <span className="font-display text-lg text-slate-900">Umbra</span>
        </div>
        <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Sign in →</Link>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <h1 className="font-display text-6xl text-slate-900 mb-4">Simple, honest pricing</h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          No setup fee — start in 5 minutes. 7-day free trial on all plans.
        </p>
      </section>

      {/* Cards */}
      <section className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PUBLIC_PLANS.map((plan) => {
            const isFeatured = plan.slug === FEATURED;
            return (
              <div
                key={plan.slug}
                className={`rounded-2xl border p-6 flex flex-col ${
                  isFeatured
                    ? "bg-brand-600 border-brand-500 shadow-xl shadow-brand-600/20"
                    : "bg-white border-slate-200 hover:border-slate-300 transition-colors"
                }`}
              >
                {isFeatured && (
                  <div className="text-xs font-semibold text-brand-200 uppercase tracking-widest mb-3">
                    Most popular
                  </div>
                )}
                <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isFeatured ? "text-brand-200" : "text-slate-400"}`}>
                  {plan.name}
                </div>
                <div className={`text-4xl font-semibold mb-1 ${isFeatured ? "text-white" : "text-slate-900"}`}>
                  {plan.displayPrice}
                </div>
                <div className={`text-sm mb-6 ${isFeatured ? "text-brand-200" : "text-slate-400"}`}>
                  {plan.displaySetup}
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${isFeatured ? "text-brand-100" : "text-slate-500"}`}>
                  {plan.description}
                </p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.highlights.map((h) => (
                    <li key={h} className={`flex items-start gap-2 text-sm ${isFeatured ? "text-brand-100" : "text-slate-600"}`}>
                      <Check size={14} className={`mt-0.5 flex-shrink-0 ${isFeatured ? "text-brand-200" : "text-emerald-500"}`} />
                      {h}
                    </li>
                  ))}
                </ul>
                {PLAN_PRICE_IDS[plan.slug] ? (
                  <CheckoutButton
                    priceId={PLAN_PRICE_IDS[plan.slug]}
                    label="Get Started"
                    className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors bg-gradient-to-r cursor-pointer border-0 ${
                      isFeatured
                        ? "from-indigo-500 to-indigo-400 text-white hover:from-indigo-600 hover:to-indigo-500"
                        : "from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800"
                    } disabled:opacity-60`}
                  />
                ) : (
                  <Link
                    href="/contact"
                    className={`text-center py-3 rounded-xl text-sm font-semibold transition-colors block ${
                      isFeatured
                        ? "bg-white text-brand-700 hover:bg-brand-50"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    Contact Us
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Enterprise row */}
        <div className="bg-slate-950 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Enterprise</div>
            <h3 className="font-display text-3xl text-white mb-2">Custom Agent Build</h3>
            <p className="text-slate-400 text-base max-w-xl">
              Fully custom AI agents, dedicated engineering support, SLA guarantees, private deployment, and usage-based pricing.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-semibold text-white mb-1">$15,000+</div>
            <div className="text-slate-400 text-sm mb-4">setup · custom monthly</div>
            <Link href="/contact" className="btn-primary bg-white text-slate-900 hover:bg-slate-100">
              Contact us <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Comparison table */}
        <div>
          <h2 className="font-display text-4xl text-slate-900 text-center mb-10">Compare all plans</h2>
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-5 border-b border-slate-100">
              <div className="p-4" />
              {PLAN_KEYS.map((key) => {
                const plan = PLANS[key];
                const isFeat = key === FEATURED;
                return (
                  <div key={key} className={`p-4 text-center ${isFeat ? "bg-brand-50" : ""}`}>
                    <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isFeat ? "text-brand-600" : "text-slate-400"}`}>
                      {plan.name.split(" ").slice(-1)[0]}
                    </div>
                    <div className={`text-lg font-semibold ${isFeat ? "text-brand-700" : "text-slate-900"}`}>
                      {plan.displayPrice}
                    </div>
                    <div className="text-xs text-slate-400">{plan.displaySetup}</div>
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            {FEATURES.map((feat, i) => {
              if ("category" in feat && feat.category) {
                return (
                  <div key={i} className="grid grid-cols-5 bg-slate-50 border-t border-slate-100">
                    <div className="p-3 col-span-5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        {feat.category}
                      </span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="grid grid-cols-5 border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="p-4 text-sm text-slate-600">{feat.label}</div>
                  {PLAN_KEYS.map((key) => {
                    const isFeat = key === FEATURED;
                    return (
                      <div key={key} className={`p-4 text-center ${isFeat ? "bg-brand-50/50" : ""}`}>
                        <FeatureValue value={(feat as any).values?.[key]} />
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* CTA row */}
            <div className="grid grid-cols-5 border-t border-slate-200 bg-slate-50/50">
              <div className="p-4" />
              {PLAN_KEYS.map((key) => {
                const isFeat = key === FEATURED;
                return (
                  <div key={key} className={`p-4 text-center ${isFeat ? "bg-brand-50/50" : ""}`}>
                    {PLAN_PRICE_IDS[key] ? (
                      <CheckoutButton
                        priceId={PLAN_PRICE_IDS[key]}
                        label="Start →"
                        className={`text-xs font-semibold py-2 px-3 rounded-lg inline-block transition-colors bg-gradient-to-r cursor-pointer border-0 ${
                          isFeat
                            ? "from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600"
                            : "from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800"
                        } disabled:opacity-60`}
                      />
                    ) : (
                      <Link
                        href="/contact"
                        className={`text-xs font-semibold py-2 px-3 rounded-lg inline-block transition-colors ${
                          isFeat
                            ? "bg-brand-600 text-white hover:bg-brand-700"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        Contact →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl text-slate-900 text-center mb-10">Common questions</h2>
          <div className="space-y-5">
            {[
              {
                q: "What's included in the setup fee?",
                a: "The setup fee covers full agent configuration, intake form customization, AI system prompt tuning, team onboarding, and integration support — so you're live and capturing leads quickly.",
              },
              {
                q: "Can I change plans later?",
                a: "Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades apply at the end of your current billing period.",
              },
              {
                q: "How does the AI work?",
                a: "When a lead submits your intake form, our AI (powered by Claude) reads the submission, extracts structured fields, scores quote-readiness (0–100), flags missing info, and suggests next steps — all automatically.",
              },
              {
                q: "Do you offer a trial?",
                a: "Yes. Every plan includes a 7-day free trial. No credit card required to start.",
              },
              {
                q: "What's white-label?",
                a: "White-label means the entire platform can be deployed under your brand — your domain, your logo, your color scheme. Your customers never see the Umbra name.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-2">{q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
