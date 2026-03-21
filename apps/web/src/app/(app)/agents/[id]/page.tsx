"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Bot, Save, ExternalLink, Copy, Trash2,
  Plus, GripVertical, Settings, Zap, MessageSquare, BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = "text" | "textarea" | "email" | "phone" | "number" | "select" | "file" | "date";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

// ─── Mock agent ───────────────────────────────────────────────────────────────

const AGENT = {
  id: "a1",
  name: "Roofing Quote Agent",
  type: "quote",
  isActive: true,
  description: "Handles inbound roofing quote requests for residential and light commercial.",
  intakeUrl: "https://app.umbra.ai/submit/acme-roofing",
  aiConfig: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    systemPrompt:
      "You are an intake specialist for a roofing company. Your job is to extract structured information from customer roofing requests. Be professional and thorough. Always identify the roof size, material preferences, timeline, and any active issues.",
  },
  followUpConfig: {
    enableAutoFollowUp: true,
    followUpIntervalHours: 24,
    maxFollowUps: 3,
    followUpTemplate:
      "Hi {{name}}, just following up on your roofing project inquiry. We'd love to schedule a free on-site estimate at your convenience.",
  },
};

const INITIAL_FIELDS: FormField[] = [
  { id: "f1", type: "text",     label: "Full name",             placeholder: "John Smith",            required: true  },
  { id: "f2", type: "email",    label: "Email address",         placeholder: "john@example.com",      required: true  },
  { id: "f3", type: "phone",    label: "Phone number",          placeholder: "(555) 000-0000",        required: false },
  { id: "f4", type: "select",   label: "Service type",          placeholder: "Select...",             required: true,
    options: ["Full replacement", "Repair", "Inspection", "New construction"] },
  { id: "f5", type: "text",     label: "Approximate roof size", placeholder: "e.g. 2,000 sq ft",     required: false },
  { id: "f6", type: "textarea", label: "Describe your project", placeholder: "Tell us more...",       required: true  },
  { id: "f7", type: "file",     label: "Upload photos",         placeholder: "Add photos",            required: false },
];

const FIELD_TYPES: Array<{ value: FieldType; label: string }> = [
  { value: "text",     label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "email",    label: "Email" },
  { value: "phone",    label: "Phone" },
  { value: "number",   label: "Number" },
  { value: "select",   label: "Dropdown" },
  { value: "date",     label: "Date" },
  { value: "file",     label: "File upload" },
];

// ─── Sub-tabs ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "form",     label: "Intake Form",  icon: Settings },
  { id: "ai",       label: "AI Config",   icon: Zap },
  { id: "followup", label: "Follow-Up",   icon: MessageSquare },
  { id: "analytics",label: "Analytics",   icon: BarChart3 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentConfigPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("form");
  const [fields, setFields]       = useState<FormField[]>(INITIAL_FIELDS);
  const [agentName, setAgentName] = useState(AGENT.name);
  const [systemPrompt, setSystemPrompt] = useState(AGENT.aiConfig.systemPrompt);
  const [followUpEnabled, setFollowUpEnabled] = useState(AGENT.followUpConfig.enableAutoFollowUp);
  const [followUpInterval, setFollowUpInterval] = useState(AGENT.followUpConfig.followUpIntervalHours);
  const [maxFollowUps, setMaxFollowUps] = useState(AGENT.followUpConfig.maxFollowUps);
  const [followUpTemplate, setFollowUpTemplate] = useState(AGENT.followUpConfig.followUpTemplate);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  function addField() {
    const newField: FormField = {
      id: `f${Date.now()}`,
      type: "text",
      label: "New field",
      placeholder: "",
      required: false,
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  }

  function updateField(id: string, updates: Partial<FormField>) {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, ...updates } : f));
  }

  async function handleSave() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/agents" className="btn-ghost p-2"><ArrowLeft size={16} /></Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="text-xl font-semibold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-brand-400 focus:outline-none transition-colors"
              />
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-400">Active</span>
                <span className="text-slate-300 mx-1">·</span>
                <a href={AGENT.intakeUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  <ExternalLink size={11} /> Preview form
                </a>
                <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <Copy size={11} /> Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Save size={15} />}
          Save changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── FORM BUILDER TAB ───────────────────────────────────────── */}
      {activeTab === "form" && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Field list */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Form Fields</h2>
              <span className="text-xs text-slate-400">{fields.length} fields</span>
            </div>
            {fields.map((field, idx) => (
              <div
                key={field.id}
                onClick={() => setSelectedFieldId(field.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedFieldId === field.id
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <GripVertical size={16} className="text-slate-300 flex-shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 truncate">{field.label}</span>
                    {field.required && <span className="text-xs text-red-500">*</span>}
                  </div>
                  <div className="text-xs text-slate-400 capitalize">{field.type}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                  className="p-1.5 text-slate-300 hover:text-red-400 transition-colors rounded"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={addField}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
            >
              <Plus size={15} /> Add field
            </button>
          </div>

          {/* Field editor */}
          <div className="lg:col-span-2">
            {selectedField ? (
              <div className="card p-5 space-y-4 sticky top-6">
                <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                  Edit Field
                </h3>
                <div>
                  <label className="label">Label</label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Field type</label>
                  <select
                    value={selectedField.type}
                    onChange={(e) => updateField(selectedField.id, { type: e.target.value as FieldType })}
                    className="input"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Placeholder text</label>
                  <input
                    type="text"
                    value={selectedField.placeholder}
                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                    className="input"
                  />
                </div>
                {selectedField.type === "select" && (
                  <div>
                    <label className="label">Options (one per line)</label>
                    <textarea
                      rows={4}
                      value={(selectedField.options ?? []).join("\n")}
                      onChange={(e) => updateField(selectedField.id, { options: e.target.value.split("\n").filter(Boolean) })}
                      className="input resize-none"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm text-slate-600">Required field</span>
                  <button
                    onClick={() => updateField(selectedField.id, { required: !selectedField.required })}
                    className={`relative w-10 h-5.5 rounded-full transition-colors ${
                      selectedField.required ? "bg-brand-600" : "bg-slate-200"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      selectedField.required ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Settings size={18} className="text-slate-400" />
                </div>
                <div className="text-sm text-slate-500">Click a field to edit its settings</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI CONFIG TAB ──────────────────────────────────────────── */}
      {activeTab === "ai" && (
        <div className="max-w-2xl space-y-5">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">AI Model</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Provider</label>
                <select className="input" defaultValue="anthropic">
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai" disabled>OpenAI (coming soon)</option>
                </select>
              </div>
              <div>
                <label className="label">Model</label>
                <select className="input" defaultValue="claude-sonnet-4-20250514">
                  <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                  <option value="claude-opus-4-6">Claude Opus 4</option>
                  <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">System Prompt</h2>
            <p className="text-xs text-slate-500 mb-3">
              Customize how the AI understands and processes incoming submissions for this agent.
            </p>
            <textarea
              rows={8}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="input resize-none font-mono text-xs leading-relaxed"
            />
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> Mention your business type, the service you quote, and any specific fields you want extracted. The more context, the better the AI performs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FOLLOW-UP TAB ──────────────────────────────────────────── */}
      {activeTab === "followup" && (
        <div className="max-w-2xl space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Auto Follow-Up</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically send follow-ups to leads that haven't responded
                </p>
              </div>
              <button
                onClick={() => setFollowUpEnabled((p) => !p)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  followUpEnabled ? "bg-brand-600" : "bg-slate-200"
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  followUpEnabled ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>

            {followUpEnabled && (
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="label">First follow-up after</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={followUpInterval}
                      onChange={(e) => setFollowUpInterval(Number(e.target.value))}
                      className="input w-24"
                      min={1}
                    />
                    <span className="text-sm text-slate-500">hours</span>
                  </div>
                </div>
                <div>
                  <label className="label">Max follow-ups</label>
                  <input
                    type="number"
                    value={maxFollowUps}
                    onChange={(e) => setMaxFollowUps(Number(e.target.value))}
                    className="input"
                    min={1}
                    max={10}
                  />
                </div>
              </div>
            )}
          </div>

          {followUpEnabled && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Message Template</h2>
              <p className="text-xs text-slate-500 mb-3">
                Use <code className="bg-slate-100 px-1 rounded">{"{{name}}"}</code> and{" "}
                <code className="bg-slate-100 px-1 rounded">{"{{service}}"}</code> as dynamic placeholders.
              </p>
              <textarea
                rows={5}
                value={followUpTemplate}
                onChange={(e) => setFollowUpTemplate(e.target.value)}
                className="input resize-none"
              />
              <div className="flex items-center gap-2 mt-3">
                <Zap size={13} className="text-brand-500" />
                <span className="text-xs text-slate-500">
                  AI will personalize this template based on the submission details
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ──────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div className="card p-8 text-center">
          <BarChart3 size={32} className="text-slate-300 mx-auto mb-3" />
          <div className="text-sm font-medium text-slate-600 mb-1">Agent Analytics</div>
          <div className="text-xs text-slate-400 mb-4">
            View full performance metrics in the Analytics section
          </div>
          <Link href="/analytics" className="btn-primary inline-flex">
            Go to Analytics →
          </Link>
        </div>
      )}
    </div>
  );
}
