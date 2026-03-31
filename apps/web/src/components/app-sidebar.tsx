"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@umbra/auth";
import {
  LayoutDashboard, Inbox, GitPullRequest, Cpu, BarChart3,
  Settings, Users, Bell, ChevronRight,
  Plus, Zap, Shield, Menu, X,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { href: "/dashboard",   label: "Overview",    icon: LayoutDashboard },
      { href: "/leads",       label: "Leads",       icon: Inbox           },
      { href: "/follow-ups",  label: "Follow-Ups",  icon: GitPullRequest  },
      { href: "/analytics",   label: "Analytics",   icon: BarChart3       },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/agents",   label: "Agents",   icon: Cpu      },
      { href: "/team",     label: "Team",     icon: Users    },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [orgName, setOrgName] = useState<string>('My Workspace');

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.access_token) return;
      try {
        const res = await fetch('/api/org', { headers: { Authorization: `Bearer ${session.access_token}` } });
        const d = await res.json();
        if (d.org?.name) setOrgName(d.org.name);
      } catch {}
    });
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Backdrop ── */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 98 }}
        />
      )}

      {/* ── Drawer ── */}
      <div style={{
        position: 'fixed', top: '52px', left: 0, right: 0, bottom: 0,
        zIndex: 99,
        background: '#080D18',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        {/* Org name */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: '#fff',
            }}>A</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{orgName}</div>
          </div>
        </div>

        {/* Nav Sections */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: '#1E3A5F',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '8px 20px 4px',
              }}>
                {section.label}
              </div>
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link key={href} href={href} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 20px',
                    fontSize: '15px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#A5B4FC' : '#475569',
                    background: active ? 'rgba(79,70,229,0.12)' : 'transparent',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: active ? '3px solid #4F46E5' : '3px solid transparent',
                  }}>
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Security badge */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 12px', borderRadius: '7px',
            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)',
          }}>
            <Shield size={11} color="#10B981" />
            <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>SOC 2 Ready · Encrypted</span>
          </div>
        </div>

        {/* New Agent CTA */}
        <div style={{ padding: '0 16px 12px' }}>
          <Link href="/agents/new" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '12px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: '#fff', fontSize: '14px', fontWeight: 600,
            textDecoration: 'none',
          }}>
            <Plus size={14} strokeWidth={2.5} />
            New Agent
          </Link>
        </div>
      </div>
    </>
  );
}

export function AppTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep hamburger state in sync with sidebar
  useEffect(() => {
    const handler = (e: CustomEvent) => setMenuOpen(e.detail);
    window.addEventListener('agentpilot-menu' as any, handler);
    return () => window.removeEventListener('agentpilot-menu' as any, handler);
  }, []);

  function toggleMenu() {
    const next = !menuOpen;
    setMenuOpen(next);
    window.dispatchEvent(new CustomEvent('agentpilot-menu', { detail: next }));
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '52px', zIndex: 100,
      background: 'rgba(8,13,24,0.97)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Logo + Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', color: '#94A3B8' }}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>AgentPilot</span>
        </Link>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '6px',
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.12)',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>Operational</span>
        </div>

        <button style={{
          position: 'relative', width: '32px', height: '32px', borderRadius: '7px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Bell size={14} color="#334155" />
        </button>

        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, color: '#fff', cursor: 'pointer',
        }}>TB</div>
      </div>
    </header>
  );
}
