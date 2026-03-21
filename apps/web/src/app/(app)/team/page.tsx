"use client";
import { useState } from "react";
import { Plus, Mail, MoreHorizontal, Shield, User, UserCheck } from "lucide-react";

const MEMBERS = [
  { id: "u1", name: "John Doe (You)", email: "john@acme.com", role: "org_owner", status: "active", lastSeen: "Now", avatar: "JD" },
  { id: "u2", name: "Sarah Martinez", email: "sarah@acme.com", role: "team_member", status: "active", lastSeen: "2h ago", avatar: "SM" },
  { id: "u3", name: "Tom Blake", email: "tom@acme.com", role: "team_member", status: "active", lastSeen: "1d ago", avatar: "TB" },
  { id: "u4", name: "Lisa Park", email: "lisa@acme.com", role: "org_admin", status: "active", lastSeen: "3d ago", avatar: "LP" },
  { id: "u5", name: "pending invite", email: "alex@partner.com", role: "team_member", status: "invited", lastSeen: "—", avatar: "?" },
];

const ROLE_CONFIG: Record<string, { label: string; icon: typeof User; color: string; bg: string }> = {
  org_owner:   { label: "Owner",  icon: Shield,    color: "#A78BFA", bg: "rgba(139,92,246,0.12)" },
  org_admin:   { label: "Admin",  icon: UserCheck, color: "#60A5FA", bg: "rgba(59,130,246,0.12)" },
  team_member: { label: "Member", icon: User,      color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
};

const AVATAR_COLORS = ["#6366F1", "#3b82f6", "#10B981", "#8B5CF6", "#F59E0B"];

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("team_member");

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Team Members
          </h1>
          <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px", margin: "4px 0 0" }}>
            {MEMBERS.length} members on your workspace
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          <Plus size={15} />
          Invite member
        </button>
      </div>

      {/* Invite form */}
      <div style={{
        background: "#0C1220", borderRadius: "14px", padding: "20px",
        border: "1px solid rgba(255,255,255,0.07)", marginBottom: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}>
        <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", marginBottom: "14px", margin: "0 0 14px" }}>
          Invite a team member
        </h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: "8px",
                background: "#070C18", border: "1px solid rgba(255,255,255,0.1)",
                color: "#F1F5F9", fontSize: "13px", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ minWidth: "160px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: "8px",
                background: "#070C18", border: "1px solid rgba(255,255,255,0.1)",
                color: "#F1F5F9", fontSize: "13px", outline: "none",
              }}
            >
              <option value="team_member">Team Member</option>
              <option value="org_admin">Admin</option>
            </select>
          </div>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            color: "#818CF8", fontSize: "13px", fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            <Mail size={14} />
            Send invite
          </button>
        </div>
      </div>

      {/* Members table */}
      <div style={{
        background: "#0C1220", borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 40px",
          gap: "12px", padding: "10px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}>
          {["Member", "Email", "Role", "Last Active", ""].map((h) => (
            <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {MEMBERS.map((m, idx) => {
          const cfg = ROLE_CONFIG[m.role] ?? ROLE_CONFIG.team_member;
          const RoleIcon = cfg.icon;
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

          return (
            <div
              key={m.id}
              style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 40px",
                gap: "12px", padding: "13px 22px", alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Member */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                  background: m.status === "invited" ? "rgba(255,255,255,0.05)" : `${avatarColor}20`,
                  border: `1px solid ${m.status === "invited" ? "rgba(255,255,255,0.08)" : `${avatarColor}30`}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700,
                  color: m.status === "invited" ? "#475569" : avatarColor,
                }}>
                  {m.avatar}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>{m.name}</div>
                  {m.status === "invited" && (
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "99px",
                      background: "rgba(245,158,11,0.12)", color: "#FCD34D",
                    }}>
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: "12px", color: "#475569" }}>{m.email}</div>

              {/* Role */}
              <div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "99px",
                  background: cfg.bg, color: cfg.color,
                }}>
                  <RoleIcon size={11} />
                  {cfg.label}
                </span>
              </div>

              {/* Last active */}
              <div style={{ fontSize: "12px", color: "#334155" }}>{m.lastSeen}</div>

              {/* Actions */}
              <button style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#334155", display: "flex", alignItems: "center", padding: "4px",
              }}>
                <MoreHorizontal size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
