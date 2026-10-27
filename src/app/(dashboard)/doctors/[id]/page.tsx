"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Stethoscope,
  Building2,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  UserPlus,
  Users,
  AlertTriangle,
  HeartPulse,
  Activity,
  Trash2,
  ExternalLink,
  Search,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

interface DoctorProfile {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  patientCount: number;
  criticalCount: number;
  seriousCount: number;
  stableCount: number;
  dischargedCount: number;
  averageAge: number;
}

interface AssignedPatient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  admissionDate: string;
}

interface PaginationMeta {
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function DoctorProfileContent() {
  const params = useParams();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  // Inline delete confirmation state (Zero Popups)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Doctor Details
  const fetchDoctor = useCallback(async () => {
    if (!doctorId) return;
    try {
      setIsLoadingDoctor(true);
      const res = await fetch(`/api/doctors/${doctorId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load doctor profile");
      }
      setDoctor(data.data);
    } catch (err: any) {
      toast.error(err.message || "Could not fetch doctor details");
    } finally {
      setIsLoadingDoctor(false);
    }
  }, [doctorId]);

  // Load Assigned Patients
  const fetchPatients = useCallback(async () => {
    if (!doctorId) return;
    try {
      setIsLoadingPatients(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm,
      });
      const res = await fetch(`/api/doctors/${doctorId}/patients?${query}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load assigned patients");
      }
      const patientsList = Array.isArray(data.data) ? data.data : data.data?.patients || [];
      setPatients(patientsList);
      setPagination(data.pagination || data.data?.pagination || null);
    } catch (err: any) {
      toast.error(err.message || "Could not fetch patients roster");
    } finally {
      setIsLoadingPatients(false);
    }
  }, [doctorId, page, searchTerm]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle Remove Patient from Doctor's Roster (Inline Action)
  const handleRemovePatient = async (patientId: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/doctors/${doctorId}/patients/${patientId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove patient");
      }
      toast.success("Patient removed from doctor's roster");
      setConfirmDeleteId(null);
      // Refresh both patients list and doctor stats
      fetchPatients();
      fetchDoctor();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove patient");
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

  if (isLoadingDoctor) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Doctor Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          The requested clinician profile does not exist or has been removed from the registry.
        </p>
        <Link href="/doctors">
          <Button variant="outline" className="mt-4 gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Doctors Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/doctors"
          className="hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Doctors Directory
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{doctor.name}</span>
      </nav>

      {/* Doctor Hero Profile Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50/60 to-transparent pointer-events-none rounded-bl-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Credentials */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
              {doctor.name
                .replace(/^(Dr\.|Doctor)\s*/i, "")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {doctor.name}
                </h1>
                <Badge variant="blue" className="gap-1 px-2.5 py-0.5 text-xs font-semibold">
                  <Stethoscope className="w-3.5 h-3.5" />
                  {doctor.specialization}
                </Badge>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Clinician
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {doctor.hospital}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {doctor.email}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {doctor.phone}
                </span>
                {doctor.createdAt && (
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    Registered {doctor.createdAt}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <Link href={`/patients/new?doctorId=${doctor._id}`}>
              <Button variant="default" className="gap-2 shadow-sm">
                <UserPlus className="w-4 h-4" />
                Assign Patient
              </Button>
            </Link>
            <Link href="/doctors">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                All Doctors
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Caseload Performance Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <Card className="p-5 bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Caseload
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {doctor.patientCount}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Avg Patient Age: {doctor.averageAge > 0 ? `${doctor.averageAge} yrs` : "N/A"}
            </p>
          </div>
        </Card>

        {/* Critical Cases */}
        <Card className="p-5 bg-white border border-rose-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Critical Cases
            </p>
            <p className="text-2xl font-bold text-rose-700 mt-0.5">
              {doctor.criticalCount}
            </p>
            <p className="text-xs text-rose-500 mt-0.5">Immediate attention</p>
          </div>
        </Card>

        {/* Serious Cases */}
        <Card className="p-5 bg-white border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Serious Cases
            </p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5">
              {doctor.seriousCount}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Active monitoring</p>
          </div>
        </Card>

        {/* Stable / Recovering */}
        <Card className="p-5 bg-white border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Stable & Discharged
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              {doctor.stableCount + doctor.dischargedCount}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">Regular follow-ups</p>
          </div>
        </Card>
      </div>

      {/* Assigned Patient Roster Section */}
      <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Assigned Patient Roster
              {pagination && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {pagination.totalDocs} patients
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients currently admitted or assigned under {doctor.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Filter Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roster..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>

            <Link href={`/patients/new?doctorId=${doctor._id}`}>
              <Button size="sm" variant="default" className="gap-1.5 text-xs whitespace-nowrap">
                <UserPlus className="w-3.5 h-3.5" />
                Assign Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* Patients Table */}
        {isLoadingPatients ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No patients assigned yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? "No assigned patients match your search criteria."
                : "Assign a patient to Dr. " + doctor.name + " to begin monitoring their clinical progress."}
            </p>
            <Link href={`/patients/new?doctorId=${doctor._id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs mt-2">
                <UserPlus className="w-3.5 h-3.5" />
                Assign First Patient
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Patient Name</th>
                  <th className="py-3 px-6">Age & Gender</th>
                  <th className="py-3 px-6">Medical Condition</th>
                  <th className="py-3 px-6">Admission Date</th>
                  <th className="py-3 px-6">Contact Phone</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Patient Name */}
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <Link
                        href={`/patients/${p._id}`}
                        className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
                      >
                        {p.name}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>

                    {/* Age & Gender */}
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      {p.age} yrs • {p.gender}
                    </td>

                    {/* Condition Badge */}
                    <td className="py-4 px-6">
                      <Badge variant={getConditionBadgeVariant(p.condition) as any}>
                        {p.condition}
                      </Badge>
                    </td>

                    {/* Admission Date */}
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {p.admissionDate}
                    </td>

                    {/* Contact Phone */}
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {p.phone}
                    </td>

                    {/* Actions (Zero Popups) */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {confirmDeleteId === p._id ? (
                        <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-1">
                          <span className="text-xs text-rose-700 font-medium px-1">
                            Remove?
                          </span>
                          <button
                            onClick={() => handleRemovePatient(p._id)}
                            disabled={isDeleting}
                            className="px-2 py-0.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
                          >
                            {isDeleting ? "..." : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={isDeleting}
                            className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <Link href={`/patients/${p._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 px-2.5"
                            >
                              Profile
                            </Button>
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteId(p._id)}
                            title="Remove from roster"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalDocs} total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage(page - 1)}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(page + 1)}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
      }
    >
      <DoctorProfileContent />
    </Suspense>
  );
}
