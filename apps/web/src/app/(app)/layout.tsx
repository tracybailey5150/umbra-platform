'use client';
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
