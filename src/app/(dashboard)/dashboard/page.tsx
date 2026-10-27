"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  RotateCcw,
  PlusCircle,
  Users,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { StatCards } from "@/components/dashboard/StatCards";
import { PatientsPerDoctorChart } from "@/components/dashboard/PatientsPerDoctorChart";
import { ConditionDistributionChart } from "@/components/dashboard/ConditionDistributionChart";
import { AdmissionsTrendChart } from "@/components/dashboard/AdmissionsTrendChart";
import { RecentAdmissionsTable } from "@/components/dashboard/RecentAdmissionsTable";
import type { AnalyticsData } from "@/lib/services/analytics.service";

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchMetrics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load dashboard metrics");
      }

      setData(json.data);
      setLastUpdated(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      if (isManualRefresh) {
        toast.success("Dashboard metrics refreshed");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "Failed to load dashboard analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Administrative Overview
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>Real-Time Pipeline</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            {lastUpdated && (
              <>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last updated at {lastUpdated}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMetrics(true)}
            isLoading={refreshing}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Link href="/doctors">
            <Button variant="outline" size="sm" className="text-xs">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              <span>Doctors Directory</span>
            </Button>
          </Link>

          <Link href="/patients">
            <Button size="sm" className="text-xs">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              <span>Patients Roster</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMetrics(true)}
            className="text-xs h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 1. KPI Summary Cards */}
      <StatCards
        totalDoctors={data?.totalDoctors || 0}
        totalPatients={data?.totalPatients || 0}
        avgPatientsPerDoctor={data?.avgPatientsPerDoctor || 0}
        recentCount={data?.admissionsTrend?.reduce((acc, cur) => acc + cur.admissions, 0) || 0}
        isLoading={loading}
      />

      {/* 2. Visual Charts Row (Patients per Doctor & Condition Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientsPerDoctorChart
            data={data?.patientsPerDoctor || []}
            isLoading={loading}
          />
        </div>
        <div>
          <ConditionDistributionChart
            data={data?.conditionBreakdown || []}
            isLoading={loading}
          />
        </div>
      </div>

      {/* 3. Timeline Analytics Chart */}
      <AdmissionsTrendChart
        data={data?.admissionsTrend || []}
        isLoading={loading}
      />

      {/* 4. Recent Admissions Feed Table */}
      <RecentAdmissionsTable
        admissions={data?.recentAdmissions || []}
        isLoading={loading}
      />
    </div>
  );
}
