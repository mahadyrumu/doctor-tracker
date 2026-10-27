"use client";

import { useState, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Suspense fallback={<div className="w-64 bg-slate-900 min-h-screen" />}>
          <Sidebar />
        </Suspense>
      </div>

      {/* Mobile Drawer */}
      <Suspense fallback={null}>
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
          <Header onMenuToggle={() => setMobileNavOpen(true)} />
        </Suspense>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Suspense fallback={<div className="p-8 text-slate-400">Loading view...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

