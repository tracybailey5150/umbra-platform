'use client';
import { AppSidebar, AppTopBar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#070C18' }}>
      <AppTopBar />
      <AppSidebar />
      <main style={{ paddingTop: '52px', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
