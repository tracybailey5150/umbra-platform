'use client';
import { AppSidebar, AppTopBar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#070C18' }}>
      <AppSidebar />
      <AppTopBar />
      <main style={{ paddingLeft: '240px', paddingTop: '56px', minHeight: '100vh' }}>
        <div style={{ padding: '32px', maxWidth: '1280px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
