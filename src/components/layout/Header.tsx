"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    if (pathname.startsWith("/doctors")) return "Doctors Management";
    if (pathname.startsWith("/patients")) return "Patients Directory";
    if (pathname.startsWith("/profile")) return "Administrator Profile";
    return "Clinical Analytics Dashboard";
  };

  const getPageSubtitle = () => {
    if (pathname.startsWith("/doctors"))
      return "Manage registered practitioners, medical credentials, and assigned patient rosters.";
    if (pathname.startsWith("/patients"))
      return "Search, filter, update, and manage clinical patient admissions.";
    if (pathname.startsWith("/profile"))
      return "Verified administrative session details and security settings.";
    return "Real-time key performance indicators, patient admissions, and doctor distribution statistics.";
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");

      toast.success("Signed out successfully");
      setIsDropdownOpen(false);
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
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
      <div className="flex items-center">
        {/* Profile Menu Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all select-none group"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-300 font-semibold text-xs flex items-center justify-center ring-2 ring-teal-500/20 shadow-xs group-hover:scale-105 transition-transform">
              A
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-semibold text-slate-900 block leading-tight group-hover:text-teal-700 transition-colors">
                Admin Portal
              </span>
              <span className="text-[10px] text-slate-400 block">Verified Session</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-teal-600" : ""
              }`}
            />
          </button>

          {/* Floating Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Dropdown Header */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Signed in as
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    Super Administrator
                  </p>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  admin@doctortracker.com
                </p>
              </div>

              {/* Menu Items */}
              <div className="p-1.5 space-y-0.5">
                {/* Profile Option */}
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/80 rounded-lg transition-colors group"
                >
                  <User className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  <span>Profile</span>
                </Link>

                {/* Divider */}
                <div className="my-1 border-t border-slate-100" />

                {/* Sign Out Option */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors group text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-600 transition-colors" />
                  <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
