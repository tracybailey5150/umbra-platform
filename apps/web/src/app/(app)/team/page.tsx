"use client";
import { useState } from "react";
import { Plus, Mail, MoreHorizontal, Shield, User, UserCheck, Clock } from "lucide-react";

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

const ROLE_TABS = [
  { label: "All",     value: "all" },
  { label: "Owners",  value: "org_owner" },
  { label: "Admins",  value: "org_admin" },
  { label: "Members", value: "team_member" },
];

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("team_member");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = MEMBERS.filter(m => roleFilter === "all" || m.role === roleFilter);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Team Members
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", marginTop: "4px", margin: "4px 0 0" }}>
            {MEMBERS.length} members on your workspace
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          <Plus size={15} />
          Invite Member
        </button>
      </div>

      {/* Invite form — collapsible */}
      {showInvite && (
        <div style={{
          background: "#0B1120", borderRadius: "14px", padding: "20px",
          border: "1px solid rgba(255,255,255,0.06)", marginBottom: "20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 14px" }}>
            Invite a team member
          </h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: "8px",
                  background: "#070C18", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#F1F5F9", fontSize: "13px", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ minWidth: "160px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: "8px",
                  background: "#070C18", border: "1px solid rgba(255,255,255,0.08)",
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
      )}

      {/* Role filter tabs */}
      <div style={{
        display: "flex", gap: "2px", background: "rgba(255,255,255,0.04)",
        borderRadius: "10px", padding: "4px", marginBottom: "20px", width: "fit-content",
      }}>
        {ROLE_TABS.map((tab) => {
          const count = tab.value === "all" ? MEMBERS.length : MEMBERS.filter(m => m.role === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              style={{
                padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                background: roleFilter === tab.value ? "#0B1120" : "transparent",
                color: roleFilter === tab.value ? "#F1F5F9" : "#64748B",
                boxShadow: roleFilter === tab.value ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: "6px", padding: "1px 6px", borderRadius: "99px", fontSize: "11px",
                background: roleFilter === tab.value ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
                color: roleFilter === tab.value ? "#A5B4FC" : "#475569",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Members as cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((m, idx) => {
          const cfg = ROLE_CONFIG[m.role] ?? ROLE_CONFIG.team_member;
          const RoleIcon = cfg.icon;
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

          return (
            <div
              key={m.id}
              style={{
                background: "#0B1120", borderRadius: "14px", padding: "16px 20px",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "14px",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(11,17,32,0.8)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#0B1120")}
            >
              {/* Avatar */}
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                background: m.status === "invited" ? "rgba(255,255,255,0.05)" : `${avatarColor}20`,
                border: `1px solid ${m.status === "invited" ? "rgba(255,255,255,0.08)" : `${avatarColor}40`}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700,
                color: m.status === "invited" ? "#475569" : avatarColor,
              }}>
                {m.avatar}
              </div>

              {/* Name + email */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#F1F5F9" }}>{m.name}</span>
                  {m.status === "invited" && (
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                      background: "rgba(245,158,11,0.12)", color: "#FCD34D",
                    }}>
                      Pending
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>{m.email}</div>
              </div>

              {/* Role badge */}
              <div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "99px",
                  background: cfg.bg, color: cfg.color,
                }}>
                  <RoleIcon size={11} />
                  {cfg.label}
                </span>
              </div>

              {/* Last seen */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#475569", fontSize: "12px", minWidth: "70px" }}>
                <Clock size={11} />
                {m.lastSeen}
              </div>

              {/* Actions menu */}
              <button style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#475569", display: "flex", alignItems: "center", padding: "4px",
                borderRadius: "6px",
              }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#94A3B8"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#475569"; }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
