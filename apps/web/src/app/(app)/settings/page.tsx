import { CreditCard, Building2, Users, Bell, Shield, ChevronRight, CheckCircle2 } from "lucide-react";
import { PLANS } from "@umbra/billing";

const CURRENT_PLAN = PLANS.quote_agent_pro;

const SETTINGS_SECTIONS = [
  { icon: Building2, label: "Organization", desc: "Name, logo, brand settings" },
  { icon: Users, label: "Team & Permissions", desc: "Manage members and roles" },
  { icon: Bell, label: "Notifications", desc: "Alerts, emails, and digests" },
  { icon: Shield, label: "Security", desc: "Password, 2FA, sessions" },
];

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings & Billing</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your organization and subscription</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings nav + content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Organization settings */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Organization name</label>
                <input type="text" className="input" defaultValue="Acme Services" />
              </div>
              <div>
                <label className="label">Slug (used in URLs)</label>
                <div className="flex items-center">
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">
                    umbra.ai/org/
                  </span>
                  <input type="text" className="input rounded-l-none" defaultValue="acme-services" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Industry</label>
                  <select className="input">
                    <option>Home Services</option>
                    <option>Construction</option>
                    <option>Real Estate</option>
                    <option>Automotive</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Timezone</label>
                  <select className="input">
                    <option>America/Chicago</option>
                    <option>America/New_York</option>
                    <option>America/Los_Angeles</option>
                    <option>America/Denver</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button className="btn-primary py-2 text-sm">Save changes</button>
            </div>
          </div>

          {/* Quick nav */}
          <div className="card divide-y divide-slate-100 overflow-hidden">
            {SETTINGS_SECTIONS.map(({ icon: Icon, label, desc }) => (
              <button key={label} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <Icon size={16} />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-medium text-slate-800">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
                <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Billing sidebar */}
        <div className="space-y-5">
          {/* Current plan */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Current Plan</div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-lg font-semibold text-slate-900">{CURRENT_PLAN.name}</div>
                <div className="text-2xl font-semibold text-brand-600 mt-0.5">{CURRENT_PLAN.displayPrice}</div>
              </div>
              <span className="badge bg-emerald-50 text-emerald-700">Active</span>
            </div>
            <div className="text-xs text-slate-500 mb-5">Next billing: April 1, 2026</div>

            <div className="space-y-2 mb-5">
              {CURRENT_PLAN.highlights.map((h) => (
                <div key={h} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                  {h}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <button className="btn-secondary w-full text-xs py-2 justify-center">
                <CreditCard size={13} />
                Manage billing
              </button>
              <button className="btn-ghost w-full text-xs py-2 justify-center text-slate-500">
                View invoices
              </button>
            </div>
          </div>

          {/* Upgrade nudge */}
          <div className="bg-brand-600 rounded-xl p-5 text-white">
            <div className="text-xs font-semibold text-brand-200 uppercase tracking-wide mb-2">Upgrade Available</div>
            <div className="text-sm font-semibold mb-1">White-Label Install</div>
            <p className="text-xs text-brand-200 leading-relaxed mb-4">
              Custom domain, unlimited agents, full white-label branding.
            </p>
            <button className="w-full bg-white text-brand-700 text-xs font-semibold py-2 rounded-lg hover:bg-brand-50 transition-colors">
              View plan details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
