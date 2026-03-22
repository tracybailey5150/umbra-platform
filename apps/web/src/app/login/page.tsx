"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [eyeHovered, setEyeHovered] = useState(false);
  const [forgotHovered, setForgotHovered] = useState(false);
  const [signupHovered, setSignupHovered] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = getBrowserClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (data?.session) {
      // Small delay to ensure localStorage is written before navigation
      await new Promise((r) => setTimeout(r, 300));
      window.location.href = "/dashboard";
    } else {
      setError("Login succeeded but no session returned. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33% { transform: translate(30px, -20px) scale(1.05); opacity: 0.65; }
          66% { transform: translate(-15px, 15px) scale(0.97); opacity: 0.45; }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          33% { transform: translate(-25px, 20px) scale(1.08); opacity: 0.55; }
          66% { transform: translate(20px, -10px) scale(0.95); opacity: 0.35; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
        <div style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}>
          <div style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "520px",
            height: "420px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.10) 50%, transparent 70%)",
            filter: "blur(60px)",
            animation: "blob-drift-1 12s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute",
            bottom: "-100px",
            left: "-80px",
            width: "480px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.14) 0%, rgba(59,130,246,0.08) 50%, transparent 70%)",
            filter: "blur(70px)",
            animation: "blob-drift-2 15s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(37,99,235,0.05) 0%, transparent 70%)",
            filter: "blur(80px)",
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
            <h1 style={{
              color: "#F8FAFC",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              marginBottom: "6px",
              marginTop: 0,
            }}>Welcome back</h1>
            <p style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "24px", marginTop: 0 }}>
              Sign in to your workspace.
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
              <div>
                <label style={{
                  display: "block",
                  color: "#94A3B8",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}>Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)",
                    border: emailFocused ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#F8FAFC",
                    fontSize: "14px",
                    outline: "none",
                    boxShadow: emailFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{
                    color: "#94A3B8",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}>Password</label>
                  <Link
                    href="/forgot-password"
                    style={{
                      fontSize: "12px",
                      color: forgotHovered ? "#60a5fa" : "#3b82f6",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={() => setForgotHovered(true)}
                    onMouseLeave={() => setForgotHovered(false)}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255,255,255,0.04)",
                      border: passwordFocused ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.10)",
                      borderRadius: "8px",
                      padding: "10px 40px 10px 14px",
                      color: "#F8FAFC",
                      fontSize: "14px",
                      outline: "none",
                      boxShadow: passwordFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
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
                    <span>Sign in</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p style={{ fontSize: "13px", textAlign: "center", color: "#475569", marginTop: "20px", marginBottom: 0 }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                style={{
                  color: signupHovered ? "#60a5fa" : "#3b82f6",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "color 0.15s",
                }}
                onMouseEnter={() => setSignupHovered(true)}
                onMouseLeave={() => setSignupHovered(false)}
              >
                Get started free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
