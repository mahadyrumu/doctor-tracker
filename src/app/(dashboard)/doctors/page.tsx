"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Building2,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Stethoscope,
  ExternalLink,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DoctorFilterBar } from "@/components/doctors/DoctorFilterBar";
import type { DoctorWithStats } from "@/lib/services/doctor.service";

function DoctorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL Search Params for bookmarkable & refresh-safe states
  const pageParam = Number(searchParams.get("page")) || 1;
  const searchParam = searchParams.get("search") || "";
  const specParam = searchParams.get("specialization") || "";
  const startParam = searchParams.get("startDate") || "";
  const endParam = searchParams.get("endDate") || "";

  const [doctors, setDoctors] = useState<DoctorWithStats[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to sync state to URL
  const updateUrlParams = useCallback(
    (params: Record<string, string | number>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, val]) => {
        if (val) {
          current.set(key, String(val));
        } else {
          current.delete(key);
        }
      });
      router.replace(`/doctors?${current.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch doctors based on active URL parameters
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({
        page: String(pageParam),
        limit: "10",
        search: searchParam,
        specialization: specParam,
        startDate: startParam,
        endDate: endParam,
      });

      const res = await fetch(`/api/doctors?${query.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load doctors list");
      }

      setDoctors(data.data.doctors || []);
      setPagination(
        data.data.pagination || {
          page: 1,
          totalPages: 1,
          totalDocs: 0,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch doctors");
      toast.error(err.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  }, [pageParam, searchParam, specParam, startParam, endParam]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            <span>Doctor Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage clinical staff, track patient caseloads, and view professional profiles
          </p>
        </div>

        {/* Action: Dedicated Create Doctor Page */}
        <Link href="/doctors/new">
          <Button variant="default" className="shadow-sm gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Add Doctor</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <DoctorFilterBar
        search={searchParam}
        specialization={specParam}
        startDate={startParam}
        endDate={endParam}
        onSearchChange={(search) => updateUrlParams({ search, page: 1 })}
        onSpecializationChange={(specialization) =>
          updateUrlParams({ specialization, page: 1 })
        }
        onStartDateChange={(startDate) =>
          updateUrlParams({ startDate, page: 1 })
        }
        onEndDateChange={(endDate) =>
          updateUrlParams({ endDate, page: 1 })
        }
        onReset={() => router.replace("/doctors")}
      />

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-semibold text-slate-900">
              Failed to load doctors
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDoctors}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No doctors found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchParam || specParam || startParam || endParam
                ? "No doctors matched your filtering criteria. Try clearing search filters."
                : "No doctors have been registered in the system yet."}
            </p>
            <Link href="/doctors/new">
              <Button variant="outline" size="sm" className="mt-2 gap-1.5">
                <UserPlus className="w-4 h-4" />
                Register New Doctor
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Doctor Name</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Hospital / Clinic</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-center">Caseload</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="flex items-center gap-2.5 group/link"
                      >
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {doctor.name.replace(/^Dr\.\s*/, "").charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block group-hover/link:text-teal-600 transition-colors">
                            {doctor.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ID: {doctor._id.slice(-6)}
                          </span>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="teal">{doctor.specialization}</Badge>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{doctor.hospital}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{doctor.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{doctor.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold text-xs transition-colors"
                        title="View assigned patient roster"
                      >
                        <Users className="w-3 h-3 text-teal-600" />
                        <span>{doctor.patientCount}</span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{doctor.createdAt}</span>
                      </span>
                    </td>

                    {/* Actions: View Professional Profile & Roster (Zero Popups) */}
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/doctors/${doctor._id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 px-2.5 text-teal-700 border-teal-200 hover:bg-teal-50 gap-1"
                        >
                          <User className="w-3.5 h-3.5 text-teal-600" />
                          <span>View Profile</span>
                          <ExternalLink className="w-3 h-3 text-teal-400 ml-0.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && pagination.totalDocs > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing{" "}
              <strong>{(pagination.page - 1) * 10 + 1}</strong> to{" "}
              <strong>
                {Math.min(pagination.page * 10, pagination.totalDocs)}
              </strong>{" "}
              of <strong>{pagination.totalDocs}</strong> doctors
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateUrlParams({ page: pagination.page - 1 })
                }
                disabled={!pagination.hasPrevPage}
                className="text-xs h-8 px-2.5"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>Previous</span>
              </Button>

              <span className="px-2 font-medium text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateUrlParams({ page: pagination.page + 1 })
                }
                disabled={!pagination.hasNextPage}
                className="text-xs h-8 px-2.5"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      }
    >
      <DoctorsContent />
    </Suspense>
  );
}
