// Re-exported from component — see src/components/app-sidebar.tsx
import { AppSidebar, AppTopBar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <AppTopBar />
      <main className="pl-60 pt-14 min-h-screen">
        <div className="p-6 lg:p-8 max-w-[1280px]">
          {children}
        </div>
      </main>
    </div>
  );
}

/* Legacy inline version kept below for reference — delete after migrating */
// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Bot,
  BarChart3,
  Settings,
  Users,
  Bell,
  ChevronDown,
  LogOut,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads & Requests", icon: Inbox },
  { href: "/agents", label: "Agent Settings", icon: Bot },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/team", label: "Team Members", icon: Users },
  { href: "/settings", label: "Settings & Billing", icon: Settings },
];

function AppSidebar() {
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

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Quick action */}
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
              <div className="text-xs text-slate-400">Admin</div>
            </div>
          </div>
          <LogOut size={14} className="text-slate-400 group-hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </div>
    </aside>
  );
}

function AppTopBar() {
  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-semibold text-white">
          JD
        </div>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <AppTopBar />
      <main className="pl-60 pt-14 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
