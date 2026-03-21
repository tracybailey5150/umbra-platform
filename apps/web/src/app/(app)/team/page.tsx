import { Plus, Mail, MoreHorizontal, Shield, User, UserCheck } from "lucide-react";

const MEMBERS = [
  { id: "u1", name: "John Doe (You)", email: "john@acme.com", role: "org_owner", status: "active", lastSeen: "Now", avatar: "JD" },
  { id: "u2", name: "Sarah Martinez", email: "sarah@acme.com", role: "team_member", status: "active", lastSeen: "2h ago", avatar: "SM" },
  { id: "u3", name: "Tom Blake", email: "tom@acme.com", role: "team_member", status: "active", lastSeen: "1d ago", avatar: "TB" },
  { id: "u4", name: "Lisa Park", email: "lisa@acme.com", role: "org_admin", status: "active", lastSeen: "3d ago", avatar: "LP" },
  { id: "u5", name: "pending invite", email: "alex@partner.com", role: "team_member", status: "invited", lastSeen: "—", avatar: "?" },
];

const ROLE_CONFIG: Record<string, { label: string; icon: typeof User; color: string }> = {
  org_owner: { label: "Owner", icon: Shield, color: "text-violet-600 bg-violet-50" },
  org_admin:  { label: "Admin", icon: UserCheck, color: "text-brand-600 bg-brand-50" },
  team_member:{ label: "Member", icon: User, color: "text-slate-600 bg-slate-100" },
};

export default function TeamPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Team Members</h1>
          <p className="text-sm text-slate-500 mt-0.5">{MEMBERS.length} members on your workspace</p>
        </div>
        <button className="btn-primary">
          <Plus size={15} />
          Invite member
        </button>
      </div>

      {/* Invite form */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Invite a team member</h2>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Email address</label>
            <input type="email" placeholder="colleague@company.com" className="input" />
          </div>
          <div className="min-w-[160px]">
            <label className="label">Role</label>
            <select className="input">
              <option value="team_member">Team Member</option>
              <option value="org_admin">Admin</option>
            </select>
          </div>
          <button className="btn-primary py-2.5">
            <Mail size={14} />
            Send invite
          </button>
        </div>
      </div>

      {/* Members table */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] px-5 py-3 bg-slate-50/60 border-b border-slate-100">
          {["Member", "Email", "Role", "Last Active", ""].map((h) => (
            <div key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</div>
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {MEMBERS.map((m) => {
            const RoleIcon = ROLE_CONFIG[m.role]?.icon ?? User;
            const roleLabel = ROLE_CONFIG[m.role]?.label ?? m.role;
            const roleColor = ROLE_CONFIG[m.role]?.color ?? "text-slate-600 bg-slate-100";
            return (
              <div key={m.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] items-center px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    m.status === "invited" ? "bg-slate-100 text-slate-400" : "bg-brand-100 text-brand-700"
                  }`}>
                    {m.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{m.name}</div>
                    {m.status === "invited" && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-slate-500">{m.email}</div>
                <div>
                  <span className={`badge ${roleColor}`}>
                    <RoleIcon size={11} className="mr-1" />
                    {roleLabel}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{m.lastSeen}</div>
                <button className="btn-ghost p-1.5 text-slate-400">
                  <MoreHorizontal size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
