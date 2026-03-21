"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Inbox, Bot, BarChart3,
  Settings, Users, Bell, ChevronDown,
  LogOut, Plus, MessageSquare, Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",         icon: LayoutDashboard },
  { href: "/leads",       label: "Leads & Requests",  icon: Inbox,          badge: 24 },
  { href: "/follow-ups",  label: "Follow-Ups",        icon: MessageSquare,  badge: 3  },
  { href: "/agents",      label: "Agent Settings",    icon: Bot },
  { href: "/analytics",   label: "Analytics",         icon: BarChart3 },
  { href: "/team",        label: "Team Members",      icon: Users },
  { href: "/settings",    label: "Settings & Billing",icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px', zIndex: 30,
      background: 'linear-gradient(180deg, #0C1220 0%, #080E1A 100%)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.02em' }}>Umbra</div>
            <div style={{ fontSize: '9px', color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>AI Agent Platform</div>
          </div>
        </div>
      </div>

      {/* Org Switcher */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#fff',
            }}>A</div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Acme Services</span>
          </div>
          <ChevronDown size={13} color="#475569" />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
          WORKSPACE
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '10px', padding: '8px 10px', borderRadius: '8px',
              background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
              border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
              color: active ? '#818CF8' : '#475569',
              fontSize: '13px', fontWeight: active ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </span>
              {badge !== undefined && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '99px',
                  background: active ? 'rgba(99,102,241,0.25)' : 'rgba(71,85,105,0.3)',
                  color: active ? '#818CF8' : '#64748B',
                }}>{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* New Agent CTA */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/agents/new" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          padding: '9px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          color: '#fff', fontSize: '12px', fontWeight: 600,
          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          transition: 'all 0.15s',
        }}>
          <Plus size={14} strokeWidth={2.5} />
          New Agent
        </Link>
      </div>

      {/* User */}
      <div style={{ padding: '10px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #334155, #1E293B)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600, color: '#94A3B8',
            }}>JD</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', lineHeight: 1.2 }}>John Doe</div>
              <div style={{ fontSize: '10px', color: '#334155', marginTop: '1px' }}>Owner</div>
            </div>
          </div>
          <LogOut size={13} color="#334155" />
        </div>
      </div>
    </aside>
  );
}

export function AppTopBar() {
  return (
    <header style={{
      position: 'fixed', top: 0, left: '240px', right: 0, height: '56px', zIndex: 20,
      background: 'rgba(7,12,24,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulseDot 2s infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>All systems operational</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={{
          position: 'relative', width: '34px', height: '34px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Bell size={16} color="#475569" />
          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', border: '1.5px solid #070C18' }} />
        </button>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer',
          boxShadow: '0 0 12px rgba(99,102,241,0.3)',
        }}>JD</div>
      </div>
    </header>
  );
}
