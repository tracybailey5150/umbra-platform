import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#070C18",
      color: "#F1F5F9",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflowX: "hidden",
    }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: 0, left: "25%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", bottom: "33%", right: "25%",
          width: "500px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      {/* Nav */}
      <nav style={{
        position: "relative", zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px", maxWidth: "1200px", margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(99,102,241,0.4)",
          }}>
            <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>U</span>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.5px" }}>AgentPilot</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a href="#features" style={{ fontSize: "14px", color: "#64748B", textDecoration: "none" }}>Features</a>
          <a href="#how" style={{ fontSize: "14px", color: "#64748B", textDecoration: "none" }}>How it works</a>
          <a href="#pricing" style={{ fontSize: "14px", color: "#64748B", textDecoration: "none" }}>Pricing</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/login" style={{ fontSize: "14px", color: "#64748B", textDecoration: "none", padding: "8px 12px" }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            fontSize: "14px", fontWeight: 600, color: "#fff",
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            padding: "9px 20px", borderRadius: "8px", textDecoration: "none",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}>
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative", zIndex: 10,
        textAlign: "center", padding: "80px 24px 120px",
        maxWidth: "900px", margin: "0 auto",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          fontSize: "12px", fontWeight: 600, color: "#A5B4FC",
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
          padding: "6px 14px", borderRadius: "99px", marginBottom: "32px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818CF8", display: "inline-block" }} />
          AI-powered lead intake &amp; agent automation
        </div>

        <h1 style={{
          fontSize: "72px", fontWeight: 800, color: "#F1F5F9",
          lineHeight: 1.05, letterSpacing: "-0.04em", margin: "0 0 24px",
        }}>
          Stop losing leads.{" "}
          <span style={{
            background: "linear-gradient(135deg, #818CF8, #6366F1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Your AI agent works 24/7.
          </span>
        </h1>

        <p style={{
          fontSize: "20px", color: "#64748B", lineHeight: 1.6,
          maxWidth: "600px", margin: "0 auto 48px",
        }}>
          One platform. AI agents that capture, qualify, and follow up on every lead — automatically.
          Built for serious service businesses.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            color: "#fff", padding: "14px 28px", borderRadius: "12px",
            fontWeight: 700, fontSize: "16px", textDecoration: "none",
            boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
          }}>
            Start free →
          </Link>
          <a href="#how" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "#64748B", padding: "14px 24px", borderRadius: "12px",
            fontSize: "15px", textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            See how it works
          </a>
        </div>
      </section>

      {/* Dashboard preview */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 48px 96px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          borderRadius: "20px", border: "1px solid rgba(255,255,255,0.07)",
          background: "#0C1220", overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {["#EF4444", "#F59E0B", "#10B981"].map((c) => (
                <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, opacity: 0.5 }} />
              ))}
            </div>
            <div style={{ flex: 1, maxWidth: "200px", margin: "0 auto", background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "4px 12px", fontSize: "11px", color: "#334155", textAlign: "center" }}>
              app.agentpilot.ai/dashboard
            </div>
          </div>
          <div style={{ padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "New Submissions", value: "24", sub: "+8 today", color: "#6366F1" },
                { label: "Quote Ready",     value: "11", sub: "45% of total", color: "#F59E0B" },
                { label: "Avg Response",    value: "2.4h", sub: "↓ 18% faster", color: "#10B981" },
                { label: "Pipeline Value",  value: "$84k", sub: "+$12k this week", color: "#8B5CF6" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.02)", borderRadius: "12px",
                  padding: "16px", border: "1px solid rgba(255,255,255,0.05)",
                  borderTop: `2px solid ${s.color}30`,
                }}>
                  <div style={{ fontSize: "11px", color: "#475569", marginBottom: "4px" }}>{s.label}</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#F1F5F9", marginBottom: "2px" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#334155" }}>{s.sub}</div>
                </div>
              ))}
            </div>
            {[
              { name: "Marcus T.", req: "Roof replacement — 2,400 sqft, asphalt shingles", score: 87, status: "Quote Ready", color: "#10B981" },
              { name: "Sarah K.", req: "HVAC installation — 3-bed, full system upgrade", score: 72, status: "Reviewing", color: "#F59E0B" },
              { name: "James R.", req: "Kitchen remodel — semi-custom cabinets, granite", score: 91, status: "New", color: "#6366F1" },
            ].map((r, i) => (
              <div key={r.name} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 0",
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "rgba(99,102,241,0.15)", color: "#818CF8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "13px", flexShrink: 0,
                }}>{r.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#F1F5F9" }}>{r.name}</div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>{r.req}</div>
                </div>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>Score: {r.score}</div>
                <div style={{
                  fontSize: "11px", fontWeight: 700, color: r.color,
                  background: `${r.color}15`, padding: "3px 10px", borderRadius: "99px",
                }}>{r.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ position: "relative", zIndex: 10, padding: "80px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "48px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Everything in one platform
          </h2>
          <p style={{ fontSize: "18px", color: "#475569", maxWidth: "500px", margin: "0 auto" }}>
            One backend. Many focused agent products. Built to scale.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            {
              icon: "🤖",
              title: "AI Qualification",
              desc: "Every submission is scored 0–100 by AI, with urgency, estimated value, and missing info flagged automatically. Surface your best leads instantly.",
              color: "#6366F1",
            },
            {
              icon: "⚡",
              title: "Instant Follow-up",
              desc: "AI-written, personalized follow-ups go out within minutes of a submission — not days. Never lose a lead to slow response time again.",
              color: "#10B981",
            },
            {
              icon: "📊",
              title: "Full CRM",
              desc: "Track every lead from intake to closed deal. See pipeline value, conversion rates, and agent performance across your entire business.",
              color: "#F59E0B",
            },
          ].map((f) => (
            <div key={f.title} style={{
              background: "#0C1220", borderRadius: "16px", padding: "28px",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: `${f.color}15`, border: `1px solid ${f.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", marginBottom: "20px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 10px" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ position: "relative", zIndex: 10, padding: "80px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "48px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Live in minutes
          </h2>
          <p style={{ fontSize: "18px", color: "#475569", maxWidth: "500px", margin: "0 auto" }}>
            Three steps to your first AI-powered lead.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {[
            { step: "1", title: "Create your agent", desc: "Name your agent, describe your service, and set your intake questions in under 5 minutes." },
            { step: "2", title: "Embed your form", desc: "Share a link or embed the intake form on your website. Your branded URL is ready instantly." },
            { step: "3", title: "Get leads", desc: "Every submission is AI-processed, scored, and added to your pipeline. You get notified immediately." },
          ].map((s) => (
            <div key={s.step} style={{
              background: "#0C1220", borderRadius: "16px", padding: "28px",
              border: "1px solid rgba(255,255,255,0.07)",
              position: "relative",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: 800, color: "#fff",
                marginBottom: "20px",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}>
                {s.step}
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ position: "relative", zIndex: 10, padding: "80px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "48px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Simple pricing
          </h2>
          <p style={{ fontSize: "18px", color: "#475569", maxWidth: "500px", margin: "0 auto" }}>
            Start free. Scale as you grow.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "900px", margin: "0 auto" }}>
          {[
            {
              name: "Basic",
              price: "$29",
              period: "/mo",
              desc: "Perfect for solo operators and small businesses just getting started.",
              features: ["1 AI agent", "Up to 100 submissions/mo", "AI scoring", "Basic analytics", "7-day free trial"],
              featured: false,
            },
            {
              name: "Pro",
              price: "$79",
              period: "/mo",
              desc: "For growing businesses that need multiple agents and advanced automation.",
              features: ["Up to 5 AI agents", "Unlimited submissions", "AI follow-up automation", "Advanced analytics", "7-day free trial"],
              featured: true,
            },
            {
              name: "Team",
              price: "$199",
              period: "/mo",
              desc: "For agencies and multi-location businesses managing multiple brands.",
              features: ["Unlimited agents", "Team members", "White-label", "Priority support", "7-day free trial"],
              featured: false,
            },
          ].map((p) => (
            <div key={p.name} style={{
              background: p.featured ? "linear-gradient(135deg, #4F46E5, #6366F1)" : "#0C1220",
              borderRadius: "16px", padding: "28px",
              border: p.featured ? "none" : "1px solid rgba(255,255,255,0.07)",
              boxShadow: p.featured ? "0 20px 60px rgba(99,102,241,0.4)" : "0 4px 24px rgba(0,0,0,0.3)",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: p.featured ? "rgba(199,210,254,0.7)" : "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                {p.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em" }}>{p.price}</span>
                <span style={{ fontSize: "14px", color: p.featured ? "rgba(199,210,254,0.7)" : "#475569" }}>{p.period}</span>
              </div>
              <p style={{ fontSize: "13px", color: p.featured ? "rgba(199,210,254,0.8)" : "#475569", lineHeight: 1.6, margin: "0 0 24px" }}>{p.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", flex: 1 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: p.featured ? "rgba(199,210,254,0.9)" : "#94A3B8" }}>
                    <span style={{ color: p.featured ? "#A5B4FC" : "#6366F1", fontSize: "16px", lineHeight: 1 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{
                display: "block", textAlign: "center", padding: "11px",
                borderRadius: "8px", fontWeight: 700, fontSize: "14px",
                textDecoration: "none",
                background: p.featured ? "#fff" : "rgba(99,102,241,0.15)",
                color: p.featured ? "#4F46E5" : "#818CF8",
                border: p.featured ? "none" : "1px solid rgba(99,102,241,0.3)",
              }}>
                Start free
              </Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href="/pricing" style={{ fontSize: "14px", color: "#475569", textDecoration: "none" }}>
            View full pricing details →
          </Link>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "80px 24px 100px", maxWidth: "700px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "52px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.04em", margin: "0 0 20px", lineHeight: 1.1 }}>
          Ready to deploy<br />your first agent?
        </h2>
        <p style={{ fontSize: "18px", color: "#475569", marginBottom: "40px" }}>
          Start capturing, qualifying, and following up on leads automatically.
        </p>
        <Link href="/signup" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "linear-gradient(135deg, #4F46E5, #6366F1)",
          color: "#fff", padding: "16px 36px", borderRadius: "12px",
          fontWeight: 700, fontSize: "17px", textDecoration: "none",
          boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
        }}>
          Start free →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "32px 48px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: "1200px", margin: "0 auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "6px",
              background: "linear-gradient(135deg, #4F46E5, #6366F1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>U</span>
            </div>
            <span style={{ color: "#F1F5F9", fontWeight: 600 }}>AgentPilot</span>
          </div>
          <div style={{ fontSize: "13px", color: "#334155" }}>
            © {new Date().getFullYear()} AgentPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
