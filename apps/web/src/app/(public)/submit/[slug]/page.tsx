"use client";

import { useState } from "react";
import { CheckCircle2, Upload, ChevronRight, Zap } from "lucide-react";

// ─── Mock agent config (would come from DB in production) ─────────────────────

const AGENT = {
  orgName: "Acme Roofing Co.",
  agentName: "Roofing Quote Agent",
  welcomeMessage: "Get a free roofing estimate in minutes.",
  description: "Tell us about your project and we'll prepare a detailed quote, usually within 24 hours.",
  primaryColor: "#3b5ce6",
  fields: [
    { id: "name",    type: "text",     label: "Your full name",             required: true,  placeholder: "John Smith" },
    { id: "email",   type: "email",    label: "Email address",              required: true,  placeholder: "john@example.com" },
    { id: "phone",   type: "phone",    label: "Phone number",               required: false, placeholder: "(555) 000-0000" },
    { id: "service", type: "select",   label: "Type of service needed",     required: true,
      options: ["Full replacement", "Repair / partial", "Inspection only", "New construction", "Other"] },
    { id: "size",    type: "text",     label: "Approximate roof size (sq ft)", required: false, placeholder: "e.g. 2,000 sq ft" },
    { id: "details", type: "textarea", label: "Describe your project",      required: true,
      placeholder: "Tell us about your roof, what issues you're experiencing, any preferences on materials, and your target timeline..." },
    { id: "photos",  type: "file",     label: "Upload photos (optional)",   required: false, placeholder: "Add photos of your roof" },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubmitPage({ params }: { params: { slug: string } }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    AGENT.fields.forEach((field) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setSubmitted(true);
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h1 className="font-display text-3xl text-slate-900 mb-3">We got your request!</h1>
          <p className="text-slate-500 text-base leading-relaxed mb-2">
            Thanks, <strong>{formData.name}</strong>. Your submission has been received and our team will review it shortly.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            You'll hear from us at <strong>{formData.email}</strong> — typically within 24 hours.
          </p>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 mb-2">
              <Zap size={12} />
              What happens next
            </div>
            <ul className="space-y-1.5">
              {[
                "Our AI is reviewing your request now",
                "A team member will be assigned within the hour",
                "We'll reach out to confirm details and schedule an estimate",
              ].map((step) => (
                <li key={step} className="flex items-start gap-2 text-xs text-brand-600">
                  <ChevronRight size={12} className="mt-0.5 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-display text-base">
            A
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{AGENT.orgName}</div>
            <div className="text-xs text-slate-400">{AGENT.agentName}</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display text-4xl text-slate-900 mb-3">{AGENT.welcomeMessage}</h1>
          <p className="text-slate-500 text-base leading-relaxed">{AGENT.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="animate-fade-in">
          <div className="card p-6 space-y-5">
            {AGENT.fields.map((field) => (
              <div key={field.id}>
                <label className="label">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    placeholder={field.placeholder}
                    value={formData[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`input resize-none ${errors[field.id] ? "border-red-300 focus:ring-red-200 focus:border-red-400" : ""}`}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={formData[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`input ${errors[field.id] ? "border-red-300" : ""}`}
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "file" ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-brand-300 transition-colors cursor-pointer group">
                    <Upload size={20} className="text-slate-300 group-hover:text-brand-400 mx-auto mb-2 transition-colors" />
                    <div className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                      Drop photos here or <span className="text-brand-600 font-medium">browse</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">JPG, PNG, HEIC up to 10MB each</div>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`input ${errors[field.id] ? "border-red-300 focus:ring-red-200 focus:border-red-400" : ""}`}
                  />
                )}

                {errors[field.id] && (
                  <p className="text-xs text-red-500 mt-1.5">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="mt-5">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-base justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <ChevronRight size={18} />
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-400 mt-3">
              Your info is kept private and will only be used to prepare your quote.
            </p>
          </div>
        </form>

        {/* Powered by */}
        <div className="text-center mt-8 text-xs text-slate-400">
          Powered by{" "}
          <span className="font-semibold text-slate-500">Umbra</span>
        </div>
      </div>
    </div>
  );
}
