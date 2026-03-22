"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"account" | "org">("account");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", orgName: "", industry: "",
  });

  // Hover/focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const [eyeHovered, setEyeHovered] = useState(false);
  const [signinHovered, setSigninHovered] = useState(false);

  function handleChange(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (step === "account") {
      // Step 1: create Supabase account
      setIsLoading(true);
      const supabase = getBrowserClient();
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
          },
        },
      });
      setIsLoading(false);

      if (authError) {
        setError(authError.message);
        return;
      }

      setStep("org");
      return;
    }

    // Step 2: create user record + org + membership, then redirect to onboarding
    setIsLoading(true);
    try {
      const supabase = getBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session not found — please try signing in.");

      const res = await fetch("/api/signup-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName,
          orgName: form.orgName,
          industry: form.industry,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed: ${res.status}`);
      }

      router.refresh();
      router.push("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create organization.");
      setIsLoading(false);
    }
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: focusedField === field ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.10)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#F8FAFC",
    fontSize: "14px",
    outline: "none",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#94A3B8",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: "6px",
  };

  return (
    <>
      <style>{`
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33% { transform: translate(25px, -20px) scale(1.06); opacity: 0.65; }
          66% { transform: translate(-15px, 12px) scale(0.96); opacity: 0.42; }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.38; }
          33% { transform: translate(-20px, 18px) scale(1.07); opacity: 0.52; }
          66% { transform: translate(18px, -12px) scale(0.94); opacity: 0.32; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        select option {
          background: #0D1525;
          color: #F8FAFC;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080C14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}>
        {/* Animated background glow blobs */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "500px",
            height: "420px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, rgba(59,130,246,0.10) 50%, transparent 70%)",
            filter: "blur(60px)",
            animation: "blob-drift-1 14s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "480px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
            filter: "blur(70px)",
            animation: "blob-drift-2 16s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute",
            top: "50%",
            right: "25%",
            transform: "translateY(-50%)",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(37,99,235,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px" }}>
          {/* Logo */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "32px",
          }}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(59,130,246,0.4)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}>
              <span style={{ color: "#fff", fontSize: "15px", fontWeight: 700, letterSpacing: "-0.5px" }}>A</span>
            </div>
            <span style={{
              color: "#F8FAFC",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}>AgentPilot</span>
          </div>

          {/* Card */}
          <div style={{
            background: "#0D1525",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "36px",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.4), 0 0 80px rgba(59,130,246,0.04)",
            animation: "slide-up 0.35s ease-out both",
          }}>
            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
              {(["Account", "Organization"] as const).map((s, i) => {
                const isActive = (i === 0 && step === "account") || (i === 1 && step === "org");
                const isDone = i === 0 && step === "org";
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: isDone ? "#34d399" : isActive ? "#60a5fa" : "#475569",
                    }}>
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: isDone
                          ? "rgba(52,211,153,0.12)"
                          : isActive
                          ? "linear-gradient(135deg, #1d4ed8, #3b82f6)"
                          : "rgba(255,255,255,0.05)",
                        color: isDone ? "#34d399" : isActive ? "#fff" : "#475569",
                        border: isDone
                          ? "1px solid rgba(52,211,153,0.25)"
                          : isActive
                          ? "1px solid rgba(59,130,246,0.4)"
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: isActive ? "0 0 8px rgba(59,130,246,0.3)" : "none",
                      }}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      {s}
                    </div>
                    {i === 0 && (
                      <div style={{
                        width: "32px",
                        height: "1px",
                        background: step === "org"
                          ? "linear-gradient(90deg, #3b82f6, rgba(59,130,246,0.3))"
                          : "rgba(255,255,255,0.08)",
                        transition: "background 0.3s",
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            <h1 style={{
              color: "#F8FAFC",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              marginBottom: "6px",
              marginTop: 0,
            }}>
              {step === "account" ? "Create your account" : "Set up your workspace"}
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "24px", marginTop: 0 }}>
              {step === "account"
                ? "Start building your AI agent platform."
                : "Tell us about your business."}
            </p>

            {error && (
              <div style={{
                marginBottom: "16px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                padding: "10px 14px",
                fontSize: "13px",
                color: "#fca5a5",
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {step === "account" ? (
                <>
                  <div>
                    <label style={labelStyle}>Full name</label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={form.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      onFocus={() => setFocusedField("fullName")}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={inputStyle("fullName")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Work email</label>
                    <input
                      type="email"
                      placeholder="john@company.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={inputStyle("email")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={form.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        required
                        style={{ ...inputStyle("password"), paddingRight: "40px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        onMouseEnter={() => setEyeHovered(true)}
                        onMouseLeave={() => setEyeHovered(false)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: eyeHovered ? "#94A3B8" : "#475569",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.15s",
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={labelStyle}>Organization name</label>
                    <input
                      type="text"
                      placeholder="Acme Services LLC"
                      value={form.orgName}
                      onChange={(e) => handleChange("orgName", e.target.value)}
                      onFocus={() => setFocusedField("orgName")}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={inputStyle("orgName")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <select
                      value={form.industry}
                      onChange={(e) => handleChange("industry", e.target.value)}
                      onFocus={() => setFocusedField("industry")}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={{
                        ...inputStyle("industry"),
                        appearance: "none",
                        cursor: "pointer",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                        paddingRight: "36px",
                      }}
                    >
                      <option value="">Select your industry</option>
                      <option>Home Services</option>
                      <option>Construction &amp; Remodeling</option>
                      <option>Real Estate</option>
                      <option>Automotive</option>
                      <option>Equipment &amp; Machinery</option>
                      <option>Other</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "12px",
                  background: btnHovered && !isLoading
                    ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                    : "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: btnHovered && !isLoading
                    ? "0 0 24px rgba(59,130,246,0.35), 0 4px 12px rgba(0,0,0,0.3)"
                    : "0 0 12px rgba(59,130,246,0.15), 0 2px 6px rgba(0,0,0,0.2)",
                  transition: "background 0.2s, box-shadow 0.2s, opacity 0.15s",
                }}
              >
                {isLoading ? (
                  <div style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.25)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                ) : (
                  <>
                    {step === "account" ? "Continue" : "Launch workspace"}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p style={{ fontSize: "13px", textAlign: "center", color: "#475569", marginTop: "20px", marginBottom: 0 }}>
              Already have an account?{" "}
              <Link
                href="/login"
                style={{
                  color: signinHovered ? "#60a5fa" : "#3b82f6",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "color 0.15s",
                }}
                onMouseEnter={() => setSigninHovered(true)}
                onMouseLeave={() => setSigninHovered(false)}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
