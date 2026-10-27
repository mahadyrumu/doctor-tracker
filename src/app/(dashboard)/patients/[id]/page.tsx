"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  Edit2,
  Trash2,
  Activity,
  HeartPulse,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

interface PatientDetails {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  admissionDate: string;
  createdAt: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorHospital: string;
  doctorEmail: string;
  doctorPhone: string;
}

function PatientProfileContent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inline delete confirmation state (Zero Popups)
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPatient = useCallback(async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/patients/${patientId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load patient profile");
      }
      setPatient(data.data);
    } catch (err: any) {
      toast.error(err.message || "Could not fetch patient details");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const handleDelete = async () => {
    if (!patient) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/patients/${patient._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete patient record");
      }
      toast.success(`Patient record for ${patient.name} deleted`);
      router.push("/patients");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete patient");
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const getDaysAdmitted = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const admission = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - admission.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };

  const getConditionStyle = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "critical":
        return {
          variant: "destructive" as const,
          bg: "bg-rose-50 border-rose-200 text-rose-800",
          icon: AlertTriangle,
          desc: "Requires continuous intensive care monitoring and acute vital checks",
          careTier: "Tier 1: Intensive Care Unit (ICU)",
        };
      case "serious":
        return {
          variant: "amber" as const,
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          icon: HeartPulse,
          desc: "Active clinical observation with scheduled physician rounds",
          careTier: "Tier 2: High Dependency Unit (HDU)",
        };
      case "stable":
        return {
          variant: "green" as const,
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          icon: Activity,
          desc: "Standard inpatient recovery; vital signs within normal parameters",
          careTier: "Tier 3: General Inpatient Ward",
        };
      case "discharged":
      default:
        return {
          variant: "default" as const,
          bg: "bg-slate-50 border-slate-200 text-slate-800",
          icon: ShieldCheck,
          desc: "Treatment cycle concluded; scheduled for outpatient follow-up",
          careTier: "Tier 4: Outpatient / Convalescent",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Patient Record Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          The requested patient profile does not exist or has been deleted from the registry.
        </p>
        <Link href="/patients">
          <Button variant="outline" className="mt-4 gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Patients Directory
          </Button>
        </Link>
      </div>
    );
  }

  const conditionInfo = getConditionStyle(patient.condition);
  const ConditionIcon = conditionInfo.icon;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/patients"
          className="hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Patients Directory
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{patient.name}</span>
      </nav>

      {/* Patient Hero Profile Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Vital Data */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {patient.name}
                </h1>
                <Badge variant={conditionInfo.variant} className="gap-1 px-3 py-1 text-xs font-semibold">
                  <ConditionIcon className="w-3.5 h-3.5" />
                  {patient.condition}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <User className="w-4 h-4 text-slate-400" />
                  {patient.age} years old • {patient.gender}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {patient.phone}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Admitted {patient.admissionDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs (Zero Popups) */}
          <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <Link href={`/patients/${patient._id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Record
              </Button>
            </Link>

            {confirmDelete ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl p-1.5">
                <span className="text-xs font-semibold text-rose-700 px-2">
                  Confirm delete?
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 h-8 text-xs font-medium"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Yes, Delete"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(true)}
                className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete Record
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Clinical Status & Attending Clinician */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clinical Care Status Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Clinical Status & Care Tier
            </h2>
            <span className="text-xs font-medium text-slate-400">
              Admission ID: {patient._id.slice(-6)}
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${conditionInfo.bg} flex items-start gap-3`}>
            <ConditionIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm">{conditionInfo.careTier}</p>
              <p className="leading-relaxed">{conditionInfo.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Length of Stay
              </p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {getDaysAdmitted(patient.admissionDate)}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Admission Date
              </p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {patient.admissionDate}
              </p>
            </div>
          </div>
        </Card>

        {/* Attending Doctor Profile Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
              Attending Clinician
            </h2>
            {patient.doctorId && (
              <Link
                href={`/doctors/${patient.doctorId}`}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Profile
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold text-xl flex items-center justify-center flex-shrink-0">
              {patient.doctorName
                .replace(/^(Dr\.|Doctor)\s*/i, "")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {patient.doctorName}
              </h3>
              <p className="text-xs text-indigo-700 font-medium">
                {patient.doctorSpecialization || "General Medicine"}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {patient.doctorHospital || "Central Hospital"}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Doctor Email
              </span>
              <span className="font-medium text-slate-800">{patient.doctorEmail}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Contact Line
              </span>
              <span className="font-medium text-slate-800">{patient.doctorPhone}</span>
            </div>
          </div>

          {patient.doctorId && (
            <Link href={`/doctors/${patient.doctorId}`}>
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2">
                <Stethoscope className="w-3.5 h-3.5" />
                View Doctor&apos;s Full Patient Roster
              </Button>
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function PatientProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      }
    >
      <PatientProfileContent />
    </Suspense>
  );
}
