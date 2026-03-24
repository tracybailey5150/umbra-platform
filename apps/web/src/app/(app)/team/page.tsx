"use client";
import { useState, useEffect } from "react";
import { Plus, Mail, Shield, User, UserCheck, Clock, Trash2 } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastSeen: string;
  avatar: string;
}

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
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("team_member");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.access_token) { setLoading(false); return; }
      try {
        const res = await fetch('/api/org', { headers: { Authorization: `Bearer ${session.access_token}` } });
        const { org } = await res.json();
        if (!org?.id) { setLoading(false); return; }

        const { data } = await supabase
          .from('memberships')
          .select('id, role, user_id, users(email, name)')
          .eq('organization_id', org.id);

        const mapped: Member[] = (data ?? []).map((m: any) => {
          const email = m.users?.email ?? '';
          const name = m.users?.name ?? email.split('@')[0] ?? 'Unknown';
          const initials = name.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
          return {
            id: m.id,
            name,
            email,
            role: m.role ?? 'team_member',
            status: 'active',
            lastSeen: '—',
            avatar: initials || '?',
          };
        });
        setMembers(mapped);
      } catch {}
      setLoading(false);
    });
  }, []);

  async function deleteMember(membershipId: string) {
    setDeletingId(membershipId);
    const supabase = getBrowserClient();
    const { error } = await supabase.from('memberships').delete().eq('id', membershipId);
    if (!error) setMembers(prev => prev.filter(m => m.id !== membershipId));
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  const filtered = members.filter(m => roleFilter === "all" || m.role === roleFilter);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", margin: 0 }}>
            Team Members
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", marginTop: "4px", margin: "4px 0 0" }}>
            {loading ? "Loading…" : `${members.length} member${members.length !== 1 ? "s" : ""} on your workspace`}
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
          background: "#0C1220", borderRadius: "14px", padding: "22px",
          border: "1px solid rgba(255,255,255,0.07)", marginBottom: "20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#F1F5F9", margin: "0 0 16px" }}>
            Invite a team member
          </h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.boxShadow = "none"; }}
                style={{
                  width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                  color: "#F1F5F9", fontSize: "13px", outline: "none",
                  boxSizing: "border-box", transition: "border 0.15s, box-shadow 0.15s",
                }}
              />
            </div>
            <div style={{ minWidth: "160px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                  color: "#F1F5F9", fontSize: "13px", outline: "none",
                }}
              >
                <option value="team_member">Team Member</option>
                <option value="org_admin">Admin</option>
              </select>
            </div>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 18px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              border: "none", whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}>
              <Mail size={14} />
              Send invite
            </button>
          </div>
        </div>
      )}

      {/* Role filter tabs */}
      <div style={{
        display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)",
        borderRadius: "12px", padding: "5px", marginBottom: "20px", width: "fit-content",
      }}>
        {ROLE_TABS.map((tab) => {
          const count = tab.value === "all" ? members.length : members.filter(m => m.role === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              style={{
                padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                background: roleFilter === tab.value ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
                color: roleFilter === tab.value ? "#fff" : "#64748B",
                boxShadow: roleFilter === tab.value ? "0 2px 8px rgba(99,102,241,0.35)" : "none",
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: "6px", padding: "1px 6px", borderRadius: "99px", fontSize: "11px",
                background: roleFilter === tab.value ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                color: roleFilter === tab.value ? "#fff" : "#475569",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Members list */}
      {loading ? (
        <div style={{ color: "#475569", fontSize: "14px", padding: "40px 0", textAlign: "center" }}>Loading members…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "#475569", fontSize: "14px", padding: "40px 0", textAlign: "center" }}>No members yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((m, idx) => {
            const cfg = ROLE_CONFIG[m.role] ?? ROLE_CONFIG.team_member;
            const RoleIcon = cfg.icon;
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <div
                key={m.id}
                style={{
                  background: "#0C1220", borderRadius: "14px", padding: "16px 20px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", gap: "14px",
                  transition: "background 0.15s, box-shadow 0.15s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(14,20,38,0.9)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#0C1220"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)"; }}
              >
                <div style={{
                  width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${avatarColor}30, ${avatarColor}10)`,
                  border: `1.5px solid ${avatarColor}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: avatarColor,
                  boxShadow: `0 0 12px ${avatarColor}20`,
                }}>
                  {m.avatar}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#F1F5F9" }}>{m.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>{m.email}</div>
                </div>

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

                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#475569", fontSize: "12px", minWidth: "70px" }}>
                  <Clock size={11} />
                  {m.lastSeen}
                </div>

                {confirmDeleteId === m.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      onClick={() => deleteMember(m.id)}
                      disabled={deletingId === m.id}
                      style={{
                        padding: "5px 12px", borderRadius: "7px", fontSize: "11px", fontWeight: 600,
                        background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                        color: "#EF4444", cursor: deletingId === m.id ? "not-allowed" : "pointer",
                        opacity: deletingId === m.id ? 0.6 : 1,
                      }}
                    >
                      {deletingId === m.id ? "…" : "Remove"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      style={{
                        padding: "5px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 600,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94A3B8", cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(m.id)}
                    title="Remove member"
                    style={{
                      background: "none", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer",
                      color: "#475569", display: "flex", alignItems: "center", padding: "6px 8px",
                      borderRadius: "7px", transition: "all 0.15s",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
