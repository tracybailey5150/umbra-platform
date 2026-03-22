"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Inbox, GitPullRequest, Cpu, BarChart3,
  Settings, Users, Bell, ChevronDown, ChevronRight,
  LogOut, Plus, Zap, Shield, HelpCircle,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { href: "/dashboard",   label: "Overview",       icon: LayoutDashboard, badge: null },
      { href: "/leads",       label: "Leads",          icon: Inbox,           badge: 24   },
      { href: "/follow-ups",  label: "Follow-Ups",     icon: GitPullRequest,  badge: 3    },
      { href: "/analytics",   label: "Analytics",      icon: BarChart3,       badge: null },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/agents",      label: "Agents",         icon: Cpu,             badge: null },
      { href: "/team",        label: "Team",           icon: Users,           badge: null },
      { href: "/settings",    label: "Settings",       icon: Settings,        badge: null },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '248px', zIndex: 30,
      background: '#080D18',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>

      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 4px 16px rgba(99,102,241,0.25)',
          }}>
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.03em' }}>Umbra</div>
            <div style={{ fontSize: '10px', color: '#1E3A5F', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>AI Platform</div>
          </div>
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 10px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: '#fff',
            }}>A</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', lineHeight: 1.2 }}>Acme Services</div>
              <div style={{ fontSize: '10px', color: '#1E3A5F', marginTop: '1px' }}>Pro Plan</div>
            </div>
          </div>
          <ChevronDown size={12} color="#334155" />
        </button>
      </div>

      {/* Nav Sections */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {/* Section label */}
            <div style={{
              fontSize: '10px', fontWeight: 700, color: '#1E3A5F',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0 8px 6px',
            }}>
              {section.label}
            </div>
            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {section.items.map(({ href, label, icon: Icon, badge }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link key={href} href={href} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: '7px',
                    background: active ? 'rgba(79,70,229,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(79,70,229,0.18)' : '1px solid transparent',
                    color: active ? '#A5B4FC' : '#475569',
                    fontSize: '13px', fontWeight: active ? 600 : 400,
                    textDecoration: 'none', transition: 'all 0.12s',
                    cursor: 'pointer',
                  }}
                    onMouseOver={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; } }}
                    onMouseOut={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; } }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '20px', height: '20px',
                      }}>
                        <Icon size={14} strokeWidth={active ? 2.5 : 1.8} />
                      </span>
                      {label}
                    </span>
                    {badge !== null && badge !== undefined && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '99px',
                        background: active ? 'rgba(99,102,241,0.2)' : 'rgba(30,42,74,0.6)',
                        color: active ? '#A5B4FC' : '#334155',
                        minWidth: '18px', textAlign: 'center',
                      }}>{badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Security badge */}
      <div style={{ padding: '0 12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 10px', borderRadius: '7px',
          background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)',
        }}>
          <Shield size={11} color="#10B981" />
          <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>SOC 2 Ready · Encrypted</span>
        </div>
      </div>

      {/* New Agent CTA */}
      <div style={{ padding: '0 12px 10px' }}>
        <Link href="/agents/new" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '9px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          color: '#fff', fontSize: '12px', fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 4px 16px rgba(79,70,229,0.3)',
          transition: 'all 0.15s',
          letterSpacing: '0.01em',
        }}>
          <Plus size={13} strokeWidth={2.5} />
          New Agent
        </Link>
      </div>

      {/* User footer */}
      <div style={{ padding: '8px 12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #1E293B, #0F172A)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: '#64748B',
              letterSpacing: '0.02em',
            }}>TB</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', lineHeight: 1.3 }}>Tracy Bailey</div>
              <div style={{ fontSize: '10px', color: '#1E3A5F', marginTop: '1px' }}>Owner</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HelpCircle size={13} color="#1E3A5F" />
            <LogOut size={13} color="#1E3A5F" />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AppTopBar() {
  return (
    <header style={{
      position: 'fixed', top: 0, left: '248px', right: 0, height: '52px', zIndex: 20,
      background: 'rgba(8,13,24,0.92)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Breadcrumb / context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#1E3A5F', fontWeight: 500 }}>Acme Services</span>
        <ChevronRight size={11} color="#1E293B" />
        <span style={{ fontSize: '11px', color: '#334155', fontWeight: 500 }}>Workspace</span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '6px',
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.12)',
        }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%', background: '#10B981',
            display: 'inline-block', boxShadow: '0 0 6px rgba(16,185,129,0.6)',
          }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', letterSpacing: '0.02em' }}>Operational</span>
        </div>

        {/* Notifications */}
        <button style={{
          position: 'relative', width: '32px', height: '32px', borderRadius: '7px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Bell size={14} color="#334155" />
          <span style={{
            position: 'absolute', top: '7px', right: '7px',
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#EF4444', border: '1.5px solid #080D18',
          }} />
        </button>

        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, color: '#fff', cursor: 'pointer',
          boxShadow: '0 0 0 2px rgba(79,70,229,0.2)',
          letterSpacing: '0.02em',
        }}>TB</div>
      </div>
    </header>
  );
}
