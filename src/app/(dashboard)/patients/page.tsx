"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Calendar,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Phone,
  Clock,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PatientFilterBar } from "@/components/patients/PatientFilterBar";
import { EditPatientModal } from "@/components/patients/EditPatientModal";
import { DeletePatientDialog } from "@/components/patients/DeletePatientDialog";
import { AddPatientModal } from "@/components/patients/AddPatientModal";
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

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<PatientWithDoctor | null>(null);
  const [deletingPatient, setDeletingPatient] =
    useState<PatientWithDoctor | null>(null);

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
      router.push(`/patients?${current.toString()}`);
    },
    [router, searchParams]
  );

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/patients", window.location.origin);
      url.searchParams.set("page", String(pageParam));
      url.searchParams.set("limit", "10");
      if (searchParam) url.searchParams.set("search", searchParam);
      if (conditionParam) url.searchParams.set("condition", conditionParam);
      if (startParam) url.searchParams.set("startDate", startParam);
      if (endParam) url.searchParams.set("endDate", endParam);

      const res = await fetch(url.toString());
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load patients list");
      }

      setPatients(json.data);
      setPagination(json.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load patients");
      toast.error(err.message || "Error retrieving patients");
    } finally {
      setLoading(false);
    }
  }, [pageParam, searchParam, conditionParam, startParam, endParam]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Add Patient Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Patients Clinical Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated patient management with condition filtering, timeline search, and practitioner assignment.
          </p>
        </div>

        <Button
          onClick={() => setIsAddPatientOpen(true)}
          className="text-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          <span>Register New Patient</span>
        </Button>
      </div>

      {/* Multi-criteria Filter Bar */}
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
        onEndDateChange={(endDate) => updateUrlParams({ endDate, page: 1 })}
        onReset={() => router.push("/patients")}
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
            onClick={fetchPatients}
            className="text-xs h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center">
            <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              No patients found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No patient records match the specified filters. Try adjusting your
              search criteria or register a new patient.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Diagnosis Condition</th>
                  <th className="py-3 px-4">Attending Doctor</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Admission Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {patients.map((patient) => (
                  <tr
                    key={patient._id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block group-hover:text-teal-600 transition-colors">
                            {patient.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {patient.gender}, {patient.age} yrs old
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="teal">{patient.condition}</Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {patient.doctorName}
                      </span>
                      <span className="text-[11px] text-teal-600 font-medium">
                        {patient.doctorSpecialization}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
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

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingPatient(patient)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                          title="Edit Patient Information"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingPatient(patient)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Patient Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Modal: Add Patient */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onSuccess={fetchPatients}
      />

      {/* Modal: Edit Patient */}
      <EditPatientModal
        patient={editingPatient}
        isOpen={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        onSuccess={fetchPatients}
      />

      {/* Dialog: Delete Patient */}
      <DeletePatientDialog
        patient={deletingPatient}
        isOpen={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        onSuccess={fetchPatients}
      />
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
