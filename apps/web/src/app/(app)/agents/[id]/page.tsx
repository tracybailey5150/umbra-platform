"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Bot, Save, ExternalLink, Copy, Trash2,
  Plus, GripVertical, Settings, Zap, MessageSquare, BarChart3,
  CheckCircle2, AlertCircle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { getBrowserClient } from "@umbra/auth";

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

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string | null;
  is_active: boolean;
  slug: string;
  created_at: string;
  welcome_message: string | null;
}

// ─── Static config ────────────────────────────────────────────────────────────

const INITIAL_FIELDS: FormField[] = [
  { id: "f1", type: "text",     label: "Full name",             placeholder: "John Smith",         required: true  },
  { id: "f2", type: "email",    label: "Email address",         placeholder: "john@example.com",   required: true  },
  { id: "f3", type: "phone",    label: "Phone number",          placeholder: "(555) 000-0000",     required: false },
  { id: "f4", type: "select",   label: "Service type",          placeholder: "Select...",          required: true,
    options: ["Full replacement", "Repair", "Inspection", "New construction"] },
  { id: "f5", type: "textarea", label: "Describe your project", placeholder: "Tell us more...",    required: true  },
];

const FIELD_TYPES: Array<{ value: FieldType; label: string }> = [
  { value: "text",     label: "Short text"  },
  { value: "textarea", label: "Long text"   },
  { value: "email",    label: "Email"       },
  { value: "phone",    label: "Phone"       },
  { value: "number",   label: "Number"      },
  { value: "select",   label: "Dropdown"    },
  { value: "date",     label: "Date"        },
  { value: "file",     label: "File upload" },
];

const TABS = [
  { id: "overview",  label: "Overview",   icon: Bot },
  { id: "form",      label: "Intake Form", icon: Settings },
  { id: "ai",        label: "AI Config",  icon: Zap },
  { id: "followup",  label: "Follow-Up",  icon: MessageSquare },
  { id: "analytics", label: "Analytics",  icon: BarChart3 },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "#0C1220",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  padding: "20px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "40px",
  padding: "0 12px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#F1F5F9",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: "auto",
  padding: "10px 12px",
  resize: "vertical" as const,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 700,
  color: "#475569",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  marginBottom: "6px",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 18px",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
};

const btnDanger: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 18px",
  borderRadius: "8px",
  background: "rgba(239,68,68,0.1)",
  color: "#F87171",
  fontSize: "13px",
  fontWeight: 600,
  border: "1px solid rgba(239,68,68,0.2)",
  cursor: "pointer",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentConfigPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Agent state
  const [agent, setAgent] = useState<Agent | null>(null);
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editWelcome, setEditWelcome] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  // Form builder
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  const supabase = getBrowserClient();

  const loadAgent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: agentData, error: agentErr } = await supabase
        .from("agents")
        .select("*")
        .eq("id", params.id)
        .single();

      if (agentErr || !agentData) {
        setError("Agent not found");
        return;
      }

      setAgent(agentData);
      setEditName(agentData.name ?? "");
      setEditDescription(agentData.description ?? "");
      setEditWelcome(agentData.welcome_message ?? "");

      // Get submission count
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", params.id);

      setSubmissionCount(count ?? 0);
    } catch (e) {
      setError("Failed to load agent");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [params.id, supabase]);

  useEffect(() => {
    loadAgent();
  }, [loadAgent]);

  async function handleSave() {
    if (!agent) return;
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const { error: updateErr } = await supabase
        .from("agents")
        .update({
          name: editName,
          description: editDescription,
          welcome_message: editWelcome,
        })
        .eq("id", agent.id);

      if (updateErr) throw updateErr;
      setAgent((prev) => prev ? { ...prev, name: editName, description: editDescription, welcome_message: editWelcome } : prev);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!agent) return;
    const newVal = !agent.is_active;
    const { error: updateErr } = await supabase
      .from("agents")
      .update({ is_active: newVal })
      .eq("id", agent.id);
    if (!updateErr) {
      setAgent((prev) => prev ? { ...prev, is_active: newVal } : prev);
    }
  }

  async function handleDelete() {
    if (!agent) return;
    setIsDeleting(true);
    try {
      const { error: deleteErr } = await supabase
        .from("agents")
        .delete()
        .eq("id", agent.id);
      if (deleteErr) throw deleteErr;
      router.push("/agents");
    } catch (e) {
      console.error("Delete failed:", e);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function copyIntakeUrl() {
    if (!agent) return;
    const url = `${window.location.origin}/submit/${agent.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          border: "2px solid rgba(99,102,241,0.2)", borderTopColor: "#6366F1",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px" }}>
        <AlertCircle size={32} color="#F87171" />
        <div style={{ color: "#F87171", fontSize: "14px" }}>{error ?? "Agent not found"}</div>
        <Link href="/agents" style={{ ...btnPrimary, textDecoration: "none" }}>← Back to Agents</Link>
      </div>
    );
  }

  const intakeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/submit/${agent.slug}`;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/agents" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748B", textDecoration: "none",
          }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bot size={20} color="#818CF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>{agent.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: agent.is_active ? "#34D399" : "#64748B",
              }} />
              <span style={{ fontSize: "11px", color: agent.is_active ? "#34D399" : "#64748B" }}>
                {agent.is_active ? "Active" : "Inactive"}
              </span>
              <span style={{ color: "#334155", margin: "0 2px" }}>·</span>
              <span style={{ fontSize: "11px", color: "#475569" }}>{submissionCount} submissions</span>
              <span style={{ color: "#334155", margin: "0 2px" }}>·</span>
              <span style={{ fontSize: "11px", color: "#475569", textTransform: "capitalize" }}>{agent.type}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {saveStatus === "saved" && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#34D399" }}>
              <CheckCircle2 size={14} /> Saved
            </div>
          )}
          <button onClick={handleSave} disabled={isSaving} style={btnPrimary}>
            {isSaving
              ? <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              : <Save size={14} />}
            Save changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "24px" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px",
              fontSize: "13px", fontWeight: 600,
              border: "none", borderBottom: `2px solid ${activeTab === id ? "#6366F1" : "transparent"}`,
              cursor: "pointer", background: "transparent",
              color: activeTab === id ? "#818CF8" : "#475569",
              transition: "color 0.15s",
              marginBottom: "-1px",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ───────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
          {/* Edit form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={cardStyle}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 16px" }}>Agent Details</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Agent Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    style={textareaStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Welcome Message</label>
                  <textarea
                    value={editWelcome}
                    onChange={(e) => setEditWelcome(e.target.value)}
                    rows={3}
                    placeholder="Hi! I'm your AI intake agent. Tell me about your project..."
                    style={textareaStyle}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            </div>

            {/* Intake URL */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 12px" }}>Intake URL</h2>
              <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 12px" }}>
                Share this URL to let anyone submit to this agent.
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{
                  flex: 1, padding: "9px 12px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  fontSize: "12px", color: "#94A3B8", fontFamily: "monospace",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {intakeUrl}
                </div>
                <a
                  href={intakeUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748B", textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={copyIntakeUrl}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "8px",
                    background: copied ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
                    color: copied ? "#34D399" : "#94A3B8",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Status card */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 16px" }}>Status</h2>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#F1F5F9" }}>
                    {agent.is_active ? "Active" : "Inactive"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                    {agent.is_active ? "Accepting submissions" : "Not accepting submissions"}
                  </div>
                </div>
                <button
                  onClick={handleToggleActive}
                  style={{ background: "none", border: "none", cursor: "pointer", color: agent.is_active ? "#818CF8" : "#475569" }}
                >
                  {agent.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#475569" }}>Type</span>
                  <span style={{ color: "#94A3B8", textTransform: "capitalize", fontWeight: 600 }}>{agent.type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#475569" }}>Submissions</span>
                  <span style={{ color: "#94A3B8", fontWeight: 600 }}>{submissionCount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#475569" }}>Created</span>
                  <span style={{ color: "#94A3B8" }}>{new Date(agent.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ ...cardStyle, border: "1px solid rgba(239,68,68,0.15)" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F87171", margin: "0 0 8px" }}>Danger Zone</h2>
              <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 14px" }}>
                Deleting this agent is permanent and cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={btnDanger}>
                  <Trash2 size={13} /> Delete Agent
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "12px", color: "#F87171", fontWeight: 600 }}>
                    Are you sure? This cannot be undone.
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={{ ...btnDanger, flex: 1, justifyContent: "center" }}
                    >
                      {isDeleting ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        flex: 1, padding: "8px", borderRadius: "8px",
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#64748B", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FORM BUILDER TAB ───────────────────────────────────────────────── */}
      {activeTab === "form" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px" }}>
          {/* Field list */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Form Fields</h2>
              <span style={{ fontSize: "11px", color: "#475569" }}>{fields.length} fields</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {fields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px", borderRadius: "10px",
                    border: `1px solid ${selectedFieldId === field.id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
                    background: selectedFieldId === field.id ? "rgba(99,102,241,0.08)" : "#0C1220",
                    cursor: "pointer",
                  }}
                >
                  <GripVertical size={15} color="#334155" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>{field.label}</span>
                      {field.required && <span style={{ fontSize: "10px", color: "#F87171" }}>*</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569", textTransform: "capitalize" }}>{field.type}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#334155", display: "flex", padding: "4px" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={addField}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  padding: "12px", borderRadius: "10px",
                  border: "2px dashed rgba(255,255,255,0.08)",
                  background: "transparent", color: "#475569", fontSize: "13px", cursor: "pointer",
                }}
              >
                <Plus size={14} /> Add field
              </button>
            </div>
          </div>

          {/* Field editor */}
          <div>
            {selectedField ? (
              <div style={{ ...cardStyle, position: "sticky", top: "24px" }}>
                <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 14px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  Edit Field
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Label</label>
                    <input
                      type="text"
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Field type</label>
                    <select
                      value={selectedField.type}
                      onChange={(e) => updateField(selectedField.id, { type: e.target.value as FieldType })}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Placeholder</label>
                    <input
                      type="text"
                      value={selectedField.placeholder}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  {selectedField.type === "select" && (
                    <div>
                      <label style={labelStyle}>Options (one per line)</label>
                      <textarea
                        rows={4}
                        value={(selectedField.options ?? []).join("\n")}
                        onChange={(e) => updateField(selectedField.id, { options: e.target.value.split("\n").filter(Boolean) })}
                        style={textareaStyle}
                        placeholder={"Option 1\nOption 2\nOption 3"}
                      />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "12px", color: "#94A3B8" }}>Required</span>
                    <button
                      onClick={() => updateField(selectedField.id, { required: !selectedField.required })}
                      style={{
                        position: "relative", width: "36px", height: "20px", borderRadius: "99px",
                        background: selectedField.required ? "#6366F1" : "rgba(255,255,255,0.08)",
                        border: "none", cursor: "pointer", transition: "background 0.2s",
                      }}
                    >
                      <div style={{
                        position: "absolute", top: "3px",
                        width: "14px", height: "14px", borderRadius: "50%", background: "#fff",
                        transition: "transform 0.2s",
                        transform: selectedField.required ? "translateX(18px)" : "translateX(3px)",
                      }} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ ...cardStyle, textAlign: "center", padding: "40px 20px" }}>
                <Settings size={24} color="#334155" style={{ marginBottom: "8px" }} />
                <div style={{ fontSize: "13px", color: "#475569" }}>Click a field to edit</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI CONFIG TAB ──────────────────────────────────────────────────── */}
      {activeTab === "ai" && (
        <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 16px" }}>AI Model</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Provider</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} defaultValue="openai">
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Model</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} defaultValue="gpt-4o">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="claude-sonnet-4">Claude Sonnet 4</option>
                </select>
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 8px" }}>System Prompt</h2>
            <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 12px" }}>
              Customize how the AI processes submissions for this agent.
            </p>
            <textarea
              rows={8}
              defaultValue={`You are an intake specialist for a ${agent.type} agent. Extract structured information from customer requests and score leads on quality, urgency, and estimated value.`}
              style={{ ...textareaStyle, fontFamily: "monospace", fontSize: "12px" }}
            />
          </div>
        </div>
      )}

      {/* ── FOLLOW-UP TAB ──────────────────────────────────────────────────── */}
      {activeTab === "followup" && (
        <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 8px" }}>Auto Follow-Up</h2>
            <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 16px" }}>
              Automatically follow up with leads that haven&apos;t responded.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>First follow-up after (hours)</label>
                <input type="number" defaultValue={24} style={inputStyle} min={1} />
              </div>
              <div>
                <label style={labelStyle}>Max follow-ups</label>
                <input type="number" defaultValue={3} style={inputStyle} min={1} max={10} />
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 8px" }}>Message Template</h2>
            <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 12px" }}>
              Use <code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>{"{{name}}"}</code> as a placeholder.
            </p>
            <textarea
              rows={5}
              defaultValue={`Hi {{name}}, just following up on your recent inquiry. We'd love to help — reply here or call us and we'll get you a quote right away.`}
              style={textareaStyle}
            />
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ──────────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div style={{ ...cardStyle, textAlign: "center", padding: "60px 40px" }}>
          <BarChart3 size={36} color="#334155" style={{ marginBottom: "12px" }} />
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#94A3B8", marginBottom: "6px" }}>Agent Analytics</div>
          <div style={{ fontSize: "12px", color: "#475569", marginBottom: "20px" }}>
            This agent has received <strong style={{ color: "#F1F5F9" }}>{submissionCount}</strong> submission{submissionCount !== 1 ? "s" : ""}.<br />
            View full metrics in the Analytics dashboard.
          </div>
          <Link href="/analytics" style={{ ...btnPrimary, textDecoration: "none", display: "inline-flex" }}>
            Go to Analytics →
          </Link>
        </div>
      )}
    </div>
  );
}
