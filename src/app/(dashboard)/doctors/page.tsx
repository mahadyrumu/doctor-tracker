"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus,
  Users,
  Building2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DoctorModal } from "@/components/doctors/DoctorModal";
import { DoctorPatientsModal } from "@/components/doctors/DoctorPatientsModal";
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

  // Modals state
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [selectedDoctorForPatients, setSelectedDoctorForPatients] =
    useState<DoctorWithStats | null>(null);

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
      router.push(`/doctors?${current.toString()}`);
    },
    [router, searchParams]
  );

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/doctors", window.location.origin);
      url.searchParams.set("page", String(pageParam));
      url.searchParams.set("limit", "10");
      if (searchParam) url.searchParams.set("search", searchParam);
      if (specParam) url.searchParams.set("specialization", specParam);
      if (startParam) url.searchParams.set("startDate", startParam);
      if (endParam) url.searchParams.set("endDate", endParam);

      const res = await fetch(url.toString());
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load doctors");
      }

      setDoctors(json.data);
      setPagination(json.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve doctors list");
      toast.error(err.message || "Error loading doctors");
    } finally {
      setLoading(false);
    }
  }, [pageParam, searchParam, specParam, startParam, endParam]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Add Doctor Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Medical Practitioners Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered practitioners, medical credentials, and corresponding patient rosters.
          </p>
        </div>

        <Button
          onClick={() => setIsAddDoctorOpen(true)}
          className="text-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          <span>Add New Doctor</span>
        </Button>
      </div>

      {/* Filter Bar */}
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
        onEndDateChange={(endDate) => updateUrlParams({ endDate, page: 1 })}
        onReset={() =>
          router.push("/doctors")
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDoctors}
            className="text-xs h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Doctors Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-16 text-center">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              No doctors found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No medical practitioners match your filter criteria. Try adjusting
              your search filters or add a new doctor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Hospital Affiliation</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Assigned Patients</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {doctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {doctor.name.replace(/^Dr\.\s*/, "").charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block group-hover:text-teal-600 transition-colors">
                            {doctor.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ID: {doctor._id.slice(-6)}
                          </span>
                        </div>
                      </div>
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        <Users className="w-3 h-3 text-teal-600" />
                        <span>{doctor.patientCount}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{doctor.createdAt}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDoctorForPatients(doctor)}
                        className="text-xs h-8 px-2.5 text-teal-700 border-teal-200 hover:bg-teal-50"
                      >
                        <Users className="w-3.5 h-3.5 mr-1 text-teal-600" />
                        <span>View Patients</span>
                      </Button>
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

      {/* Modal: Create Doctor */}
      <DoctorModal
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        onSuccess={fetchDoctors}
      />

      {/* Modal: View & Manage Doctor's Patients */}
      <DoctorPatientsModal
        doctor={selectedDoctorForPatients}
        isOpen={Boolean(selectedDoctorForPatients)}
        onClose={() => setSelectedDoctorForPatients(null)}
        onPatientCountChanged={fetchDoctors}
      />
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

