"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith("/doctors")) return "Doctors Management";
    if (pathname.startsWith("/patients")) return "Patients Directory";
    return "Clinical Analytics Dashboard";
  };

  const getPageSubtitle = () => {
    if (pathname.startsWith("/doctors"))
      return "Manage registered practitioners, medical credentials, and assigned patient rosters.";
    if (pathname.startsWith("/patients"))
      return "Search, filter, update, and manage clinical patient admissions.";
    return "Real-time key performance indicators, patient admissions, and doctor distribution statistics.";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {getPageSubtitle()}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>MongoDB Live</span>
        </div>

        <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-300 font-semibold text-xs flex items-center justify-center ring-2 ring-teal-500/20 shadow-xs">
            A
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-semibold text-slate-900 block leading-tight">
              Admin Portal
            </span>
            <span className="text-[10px] text-slate-400 block">Verified Session</span>
          </div>
        </div>
      </div>
    </header>
  );
}

