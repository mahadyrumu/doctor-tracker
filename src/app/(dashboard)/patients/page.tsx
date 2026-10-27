"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  User,
  Clock,
  Phone,
  Stethoscope,
  HeartPulse,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PatientFilterBar } from "@/components/patients/PatientFilterBar";
import type { PatientWithDoctor } from "@/lib/services/patient.service";

function PatientsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL Query Params for bookmarkable & refresh-safe filter states
  const pageParam = Number(searchParams.get("page")) || 1;
  const searchParam = searchParams.get("search") || "";
  const conditionParam = searchParams.get("condition") || "";
  const startParam = searchParams.get("startDate") || "";
  const endParam = searchParams.get("endDate") || "";

  const [patients, setPatients] = useState<PatientWithDoctor[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline delete confirmation state (Zero Popups)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      router.replace(`/patients?${current.toString()}`);
    },
    [router, searchParams]
  );

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({
        page: String(pageParam),
        limit: "10",
        search: searchParam,
        condition: conditionParam,
        startDate: startParam,
        endDate: endParam,
      });

      const res = await fetch(`/api/patients?${query.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load patients list");
      }

      const patientsList = Array.isArray(data.data) ? data.data : data.data?.patients || [];
      setPatients(patientsList);
      setPagination(
        data.pagination || data.data?.pagination || {
          page: 1,
          totalPages: 1,
          totalDocs: 0,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch patients");
      toast.error(err.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  }, [pageParam, searchParam, conditionParam, startParam, endParam]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async (patientId: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete patient");
      }
      toast.success("Patient record permanently deleted");
      setConfirmDeleteId(null);
      fetchPatients();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete patient");
    } finally {
      setIsDeleting(false);
    }
  };

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "critical":
        return "destructive";
      case "serious":
        return "amber";
      case "stable":
        return "green";
      case "discharged":
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-teal-600" />
            <span>Dedicated Patient Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor clinical admissions, medical condition statuses, and assigned clinicians
          </p>
        </div>

        {/* Action: Dedicated Register Patient Page */}
        <Link href="/patients/new">
          <Button variant="default" className="shadow-sm gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </Button>
        </Link>
      </div>

      {/* Filter Bar with Search, Condition & Date Range */}
      <PatientFilterBar
        search={searchParam}
        condition={conditionParam}
        startDate={startParam}
        endDate={endParam}
        onSearchChange={(search) => updateUrlParams({ search, page: 1 })}
        onConditionChange={(condition) =>
          updateUrlParams({ condition, page: 1 })
        }
        onStartDateChange={(startDate) =>
          updateUrlParams({ startDate, page: 1 })
        }
        onEndDateChange={(endDate) =>
          updateUrlParams({ endDate, page: 1 })
        }
        onReset={() => router.replace("/patients")}
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
              Failed to load patient records
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPatients}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No patients found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchParam || conditionParam || startParam || endParam
                ? "No patient records match the applied criteria. Try modifying your filter parameters."
                : "No patients have been admitted to the directory yet."}
            </p>
            <Link href="/patients/new">
              <Button variant="outline" size="sm" className="mt-2 gap-1.5">
                <UserPlus className="w-4 h-4" />
                Register New Patient
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Age &amp; Gender</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Attending Doctor</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Admission Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr
                    key={patient._id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/patients/${patient._id}`}
                        className="flex items-center gap-2.5 group/link"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block group-hover/link:text-indigo-600 transition-colors">
                            {patient.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ID: {patient._id.slice(-6)}
                          </span>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 font-medium text-xs">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {patient.age} yrs • {patient.gender}
                        </span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={getConditionBadgeVariant(patient.condition) as any}
                      >
                        {patient.condition}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/doctors/${patient.doctorId}`}
                        className="group/doc block"
                      >
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs group-hover/doc:text-teal-600 transition-colors">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span>{patient.doctorName}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover/doc:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[11px] text-slate-400 block pl-5">
                          {patient.doctorSpecialization}
                        </span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{patient.phone}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{patient.admissionDate}</span>
                      </span>
                    </td>

                    {/* Actions: Dedicated Profile, Edit, and Inline Delete (Zero Popups) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === patient._id ? (
                        <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-1">
                          <span className="text-xs text-rose-700 font-semibold px-1">
                            Delete?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(patient._id)}
                            disabled={isDeleting}
                            className="px-2 py-0.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
                          >
                            {isDeleting ? "..." : "Yes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={isDeleting}
                            className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/patients/${patient._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 px-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                              title="View Professional Profile"
                            >
                              Profile
                            </Button>
                          </Link>

                          <Link href={`/patients/${patient._id}/edit`}>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                              title="Edit Patient Information"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(patient._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Patient Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
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
              of <strong>{pagination.totalDocs}</strong> patients
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

export default function PatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      }
    >
      <PatientsContent />
    </Suspense>
  );
}
