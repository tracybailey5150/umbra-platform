"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    if (!code) {
      setStatus("invalid");
      return;
    }
    fetch(`/api/validate-invite?code=${encodeURIComponent(code)}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data?.valid ? "valid" : "invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [code]);

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #060B14 0%, #0C1220 50%, #0A0F1C 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "24px",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(12,18,32,0.95)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
    padding: "48px 40px",
    maxWidth: "460px",
    width: "100%",
    textAlign: "center",
  };

  const logoStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
  };

  const logoDotStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  };

  if (status === "loading") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={logoStyle}>
            <div style={logoDotStyle}>🤖</div>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#F1F5F9" }}>AgentPilot</span>
          </div>
          <div style={{ color: "#64748B", fontSize: "14px" }}>Verifying invite link…</div>
          <div style={{
            marginTop: "24px",
            width: "40px",
            height: "40px",
            border: "3px solid rgba(99,102,241,0.2)",
            borderTopColor: "#6366F1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "24px auto 0",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={logoStyle}>
            <div style={logoDotStyle}>🤖</div>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#F1F5F9" }}>AgentPilot</span>
          </div>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: "28px",
          }}>
            ❌
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 12px" }}>
            Invite Link Expired
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "0 0 32px", lineHeight: 1.6 }}>
            This invite link is no longer valid. It may have already been used or has expired.
          </p>
          <Link
            href="/signup"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: "10px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818CF8",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign up anyway →
          </Link>
        </div>
      </div>
    );
  }

  // Valid invite
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>
          <div style={logoDotStyle}>🤖</div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#F1F5F9" }}>AgentPilot</span>
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "6px 14px", borderRadius: "20px",
          background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)",
          color: "#34D399", fontSize: "12px", fontWeight: 600,
          marginBottom: "28px",
        }}>
          🎟️ Personal Invite
        </div>

        {/* Hero icon */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(129,140,248,0.1) 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px", fontSize: "32px",
        }}>
          🚀
        </div>

        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#F1F5F9", margin: "0 0 14px", lineHeight: 1.2 }}>
          You've been invited to try<br />
          <span style={{ background: "linear-gradient(90deg, #6366F1, #818CF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AgentPilot
          </span>{" "}free for 30 days!
        </h1>

        <p style={{ fontSize: "14px", color: "#64748B", margin: "0 0 32px", lineHeight: 1.7 }}>
          Build AI-powered intake forms and agents for your business — no credit card required for your first 30 days.
        </p>

        {/* Features list */}
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", textAlign: "left",
        }}>
          {[
            "✅ Unlimited AI agents for 30 days",
            "✅ Custom intake forms & workflows",
            "✅ Lead capture & follow-up automation",
            "✅ No credit card required",
          ].map((item) => (
            <div key={item} style={{ fontSize: "13px", color: "#94A3B8", padding: "5px 0", lineHeight: 1.5 }}>
              {item}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href={`/signup?invite=${encodeURIComponent(code)}`}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            display: "block",
            padding: "15px 28px",
            borderRadius: "12px",
            background: btnHovered
              ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
              : "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: 700,
            textDecoration: "none",
            textAlign: "center",
            boxShadow: btnHovered ? "0 8px 24px rgba(99,102,241,0.4)" : "0 4px 14px rgba(99,102,241,0.25)",
            transition: "all 0.2s ease",
            letterSpacing: "0.01em",
          }}
        >
          Claim Your Free Trial →
        </Link>

        <p style={{ fontSize: "11px", color: "#334155", marginTop: "20px" }}>
          Invite code: <code style={{ color: "#4B5563", fontFamily: "monospace" }}>{code}</code>
        </p>
      </div>
    </div>
  );
}
