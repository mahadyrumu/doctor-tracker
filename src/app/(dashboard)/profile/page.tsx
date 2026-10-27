"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Calendar,
  ChevronLeft,
  LogOut,
  Shield,
  Activity,
  CheckCircle2,
  Lock,
  Server,
  Stethoscope,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        toast.error("Could not fetch user session");
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed. Please try again.");
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/dashboard"
          className="hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Administrator Profile</span>
      </nav>

      {/* User Hero Profile Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50/70 to-transparent pointer-events-none rounded-bl-full" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-700 text-blue-300 font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md ring-4 ring-blue-500/10 flex-shrink-0">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                : "AD"}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {user?.name || "Administrator"}
                </h1>
                <Badge variant="blue" className="gap-1 px-2.5 py-0.5 text-xs font-semibold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user?.role || "admin"}
                </Badge>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Session
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user?.email || "admin@doctortracker.com"}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <KeyRound className="w-3.5 h-3.5" />
                  ID: {user?.id ? user.id.slice(-8) : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Two Column Grid: Security & Privileges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Security Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Session & Security
            </h2>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Encrypted
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> Token Scheme
              </span>
              <span className="font-semibold text-slate-800">Stateless JWT (HMAC-SHA256)</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" /> Storage Mechanism
              </span>
              <span className="font-semibold text-slate-800">HttpOnly, SameSite=Lax Cookie</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Session Lifetime
              </span>
              <span className="font-semibold text-slate-800">24 Hours Rolling</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Route Protection
              </span>
              <span className="font-semibold text-blue-700">Next.js Edge Middleware</span>
            </div>
          </div>
        </Card>

        {/* Administrative Privileges Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Administrative Capabilities
            </h2>
            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              Full Access
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Clinician Roster Management</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Create, search, filter, and inspect detailed profiles of medical practitioners.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <Users className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Patient Directory & Admission Records</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Admit patients, track condition tiers, and reassign attending physicians.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <Activity className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Hospital Analytics & Aggregations</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Single-pass MongoDB $facet analytics computing department caseloads.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
