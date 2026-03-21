"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentInfo {
  id: string;
  name: string;
  type: string;
  description: string | null;
  organization_id: string;
}

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

// ─── Smart fields by agent type ───────────────────────────────────────────────

function getSmartFields(agentType: string): FormField[] {
  switch (agentType) {
    case "quote":
      return [
        {
          id: "service_type",
          label: "Type of service needed",
          type: "select",
          required: true,
          options: ["Full replacement", "Repair / partial", "New installation", "Inspection only", "Other"],
        },
        {
          id: "property_size",
          label: "Approximate size / scope",
          type: "text",
          placeholder: "e.g. 2,000 sq ft, 3-bedroom home, 500 ft² deck…",
        },
        {
          id: "timeline",
          label: "Your target timeline",
          type: "select",
          options: ["ASAP (within 1 week)", "This month", "1–3 months", "Just planning ahead"],
        },
      ];
    case "intake":
      return [
        {
          id: "urgency",
          label: "How urgent is this?",
          type: "select",
          options: ["Emergency / same day", "Within 48 hours", "This week", "Flexible"],
        },
        {
          id: "budget",
          label: "Approximate budget",
          type: "text",
          placeholder: "e.g. $5,000 – $10,000 or flexible",
        },
      ];
    case "follow_up":
      return [
        {
          id: "previous_contact",
          label: "Have we worked together before?",
          type: "select",
          options: ["Yes — returning customer", "No — first time", "Not sure"],
        },
      ];
    default:
      return [
        {
          id: "project_type",
          label: "What type of project is this?",
          type: "text",
          placeholder: "Describe the work needed…",
        },
        {
          id: "timeline",
          label: "Desired timeline",
          type: "select",
          options: ["ASAP", "Within 1 month", "1–3 months", "Flexible"],
        },
      ];
  }
}

// ─── Checkmark animation ──────────────────────────────────────────────────────

function AnimatedCheck() {
  return (
    <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 28px" }}>
      <style>{`
        @keyframes scaleIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes drawCheck { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
        .check-circle { animation: scaleIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .check-path { stroke-dasharray: 50; stroke-dashoffset: 50; animation: drawCheck 0.4s 0.3s ease-out forwards; }
      `}</style>
      <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="check-circle" cx="36" cy="36" r="36" fill="rgba(16,185,129,0.15)" />
        <circle cx="36" cy="36" r="28" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" />
        <path
          className="check-path"
          d="M22 37l10 10 18-20"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubmitPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [agentLoaded, setAgentLoaded] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch agent info on mount (anon read — agents are public-facing)
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("agents")
      .select("id, name, type, description, organization_id")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        setAgent(data as AgentInfo | null);
        setAgentLoaded(true);
      });
  }, [slug]);

  const agentType = agent?.type ?? "quote";
  const smartFields = getSmartFields(agentType);

  // Core fields always present
  const coreFields: FormField[] = [
    { id: "name", label: "Full name", type: "text", placeholder: "Jane Smith", required: true },
    { id: "email", label: "Email address", type: "email", placeholder: "jane@example.com", required: true },
    { id: "phone", label: "Phone number", type: "tel", placeholder: "(555) 000-0000" },
    {
      id: "description",
      label: "Tell us about your request",
      type: "textarea",
      placeholder: "Describe what you need, any important details, and your goals…",
      required: true,
    },
  ];

  const allFields = [...coreFields, ...smartFields];

  function handleChange(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
    if (submitError) setSubmitError(null);
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    allFields.forEach((field) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      // Build metadata from smart fields
      const metadata: Record<string, string> = {};
      smartFields.forEach((f) => {
        if (formData[f.id]) metadata[f.id] = formData[f.id];
      });

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          description: formData.description,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Success State ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080C14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}>
        <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div style={{
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          animation: "fadeSlideUp 0.5s ease-out forwards",
        }}>
          <AnimatedCheck />
          <h1 style={{
            fontSize: "26px",
            fontWeight: 800,
            color: "#F1F5F9",
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
          }}>
            We got your request!
          </h1>
          <p style={{ fontSize: "15px", color: "#64748B", lineHeight: "1.6", margin: "0 0 8px" }}>
            Thanks, <strong style={{ color: "#CBD5E1" }}>{formData.name}</strong>. Your submission has been received and our team is on it.
          </p>
          <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 32px" }}>
            Expect a response within <strong style={{ color: "#94A3B8" }}>2 hours</strong> at <strong style={{ color: "#94A3B8" }}>{formData.email}</strong>.
          </p>

          {/* What's next panel */}
          <div style={{
            background: "#0D1525",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                What happens next
              </span>
            </div>
            {[
              "Your request is being reviewed by our AI system",
              "A specialist will be assigned within the hour",
              "We'll reach out to confirm details and next steps",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "7px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "10px", fontWeight: 700, color: "#60A5FA",
                }}>{i + 1}</div>
                <span style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.5" }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading state (fetching agent) ────────────────────────────────────────
  if (!agentLoaded) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080C14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "28px",
          height: "28px",
          border: "3px solid rgba(59,130,246,0.15)",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Resolved display name ──────────────────────────────────────────────────
  const displayName = agent?.name ?? "Umbra";
  const displayDesc = agent?.description ?? "Fill out the form below and we'll get back to you within 2 hours.";
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  // ─── Form ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C14",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .umbra-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .umbra-submit:hover:not(:disabled) { background: linear-gradient(135deg, #2563eb, #1d4ed8) !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59,130,246,0.4) !important; }
        .umbra-submit:active:not(:disabled) { transform: translateY(0); }
        @media (max-width: 600px) { .umbra-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#0D1525",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#F1F5F9" }}>{displayName}</div>
            {agent && (
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent · Powered by Umbra
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* Hero */}
        <div style={{ marginBottom: "32px", animation: "fadeSlideUp 0.4s ease-out" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#F1F5F9",
            letterSpacing: "-0.02em",
            margin: "0 0 10px",
            lineHeight: "1.2",
          }}>
            Get a free quote — fast.
          </h1>
          <p style={{ fontSize: "15px", color: "#64748B", lineHeight: "1.6", margin: 0 }}>
            {displayDesc}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ animation: "fadeSlideUp 0.5s 0.05s ease-out both" }}>
          <div style={{
            background: "#0D1525",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "28px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
          }}>
            {/* Two-column grid for name/email */}
            <div className="umbra-grid" style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94A3B8", marginBottom: "6px", letterSpacing: "0.03em" }}>
                  Full name <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={formData.name ?? ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="umbra-input"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#070C18",
                    border: `1px solid ${errors.name ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
                    color: "#F1F5F9",
                    fontSize: "14px",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box",
                  }}
                />
                {errors.name && <p style={{ fontSize: "11px", color: "#F87171", marginTop: "4px" }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94A3B8", marginBottom: "6px", letterSpacing: "0.03em" }}>
                  Email address <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.email ?? ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="umbra-input"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#070C18",
                    border: `1px solid ${errors.email ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
                    color: "#F1F5F9",
                    fontSize: "14px",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box",
                  }}
                />
                {errors.email && <p style={{ fontSize: "11px", color: "#F87171", marginTop: "4px" }}>{errors.email}</p>}
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94A3B8", marginBottom: "6px", letterSpacing: "0.03em" }}>
                Phone number <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="(555) 000-0000"
                value={formData.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="umbra-input"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#070C18",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#F1F5F9",
                  fontSize: "14px",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94A3B8", marginBottom: "6px", letterSpacing: "0.03em" }}>
                Tell us about your request <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe what you need, your timeline, budget range, and any important details…"
                value={formData.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="umbra-input"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#070C18",
                  border: `1px solid ${errors.description ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
                  color: "#F1F5F9",
                  fontSize: "14px",
                  resize: "vertical",
                  lineHeight: "1.55",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              {errors.description && <p style={{ fontSize: "11px", color: "#F87171", marginTop: "4px" }}>{errors.description}</p>}
            </div>

            {/* Smart follow-up fields */}
            {smartFields.length > 0 && (
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  A few more details
                </div>
                {smartFields.map((field) => (
                  <div key={field.id}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94A3B8", marginBottom: "6px", letterSpacing: "0.03em" }}>
                      {field.label}
                      {field.required && <span style={{ color: "#EF4444", marginLeft: "4px" }}>*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select
                        value={formData[field.id] ?? ""}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="umbra-input"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: "#070C18",
                          border: `1px solid ${errors[field.id] ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
                          color: formData[field.id] ? "#F1F5F9" : "#475569",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">Select an option…</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id] ?? ""}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="umbra-input"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: "#070C18",
                          border: `1px solid ${errors[field.id] ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
                          color: "#F1F5F9",
                          fontSize: "14px",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                          boxSizing: "border-box",
                        }}
                      />
                    )}
                    {errors[field.id] && <p style={{ fontSize: "11px", color: "#F87171", marginTop: "4px" }}>{errors[field.id]}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div style={{
              marginTop: "14px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#F87171",
              fontSize: "13px",
            }}>
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="umbra-submit"
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "14px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              border: "none",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
              transition: "all 0.2s",
              letterSpacing: "-0.01em",
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2.5px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  flexShrink: 0,
                }} />
                Submitting your request…
              </>
            ) : (
              <>
                Submit Request
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#334155", marginTop: "12px" }}>
            Your info is private and will only be used to prepare your quote.
          </p>
        </form>

        {/* Powered by */}
        <div style={{ textAlign: "center", marginTop: "36px", fontSize: "12px", color: "#1E293B" }}>
          Powered by{" "}
          <span style={{ fontWeight: 700, color: "#334155", letterSpacing: "-0.01em" }}>Umbra</span>
        </div>
      </div>
    </div>
  );
}
