"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Inbox, Bot, BarChart3,
  Settings, Users, Bell, ChevronDown,
  LogOut, Plus, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { href: "/leads",       label: "Leads & Requests",  icon: Inbox, badge: 24 },
  { href: "/follow-ups",  label: "Follow-Ups",        icon: MessageSquare, badge: 3 },
  { href: "/agents",      label: "Agent Settings",    icon: Bot },
  { href: "/analytics",   label: "Analytics",         icon: BarChart3 },
  { href: "/team",        label: "Team Members",      icon: Users },
  { href: "/settings",    label: "Settings & Billing",icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-200 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-white text-sm">U</span>
        </div>
        <span className="font-display text-slate-900 text-lg tracking-tight">Umbra</span>
      </div>

      {/* Org selector */}
      <div className="px-3 py-3 border-b border-slate-100">
        <button className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors group">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs flex items-center justify-center font-semibold">
              A
            </div>
            <span className="text-sm font-medium text-slate-700">Acme Services</span>
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-item justify-between", isActive && "sidebar-item-active")}
            >
              <span className="flex items-center gap-3">
                <Icon size={17} />
                {label}
              </span>
              {badge !== undefined && (
                <span className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-brand-200 text-brand-700"
                    : "bg-slate-200 text-slate-600"
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* New agent CTA */}
      <div className="px-3 pb-3 pt-2 border-t border-slate-100">
        <Link
          href="/agents/new"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={15} />
          New Agent
        </Link>
      </div>

      {/* User footer */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
              JD
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700 leading-tight">John Doe</div>
              <div className="text-xs text-slate-400">Owner</div>
            </div>
          </div>
          <LogOut size={14} className="text-slate-400 group-hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </div>
    </aside>
  );
}

export function AppTopBar() {
  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-semibold text-white cursor-pointer">
          JD
        </div>
      </div>
    </header>
  );
}
