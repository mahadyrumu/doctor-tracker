"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit3,
  User,
  Stethoscope,
  Phone,
  Calendar,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface DoctorOption {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
}

const MEDICAL_CONDITIONS = ["Critical", "Serious", "Stable", "Discharged"];

function EditPatientContent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    condition: "Stable",
    phone: "",
    doctorId: "",
    admissionDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch doctors and patient data concurrently
  const loadData = useCallback(async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      const [patientRes, doctorsRes] = await Promise.all([
        fetch(`/api/patients/${patientId}`),
        fetch("/api/doctors?limit=50"),
      ]);

      const patientData = await patientRes.json();
      const doctorsData = await doctorsRes.json();

      if (!patientRes.ok || !patientData.success) {
        throw new Error(patientData.message || "Failed to load patient record");
      }

      const docsList = Array.isArray(doctorsData.data) ? doctorsData.data : doctorsData.data?.doctors || [];
      if (doctorsData.success && docsList.length > 0) {
        setDoctors(docsList);
      }

      const p = patientData.data;
      setFormData({
        name: p.name || "",
        age: p.age?.toString() || "",
        gender: p.gender || "Male",
        condition: p.condition || "Stable",
        phone: p.phone || "",
        doctorId: p.doctorId || "",
        admissionDate: p.admissionDate || "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve patient details");
      setErrorMessage(err.message || "Could not load patient");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Patient full name is required (min 2 characters)";
    }
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 130) {
      newErrors.age = "Please enter a valid age between 0 and 130";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      newErrors.phone = "Valid contact phone number is required";
    }
    if (!formData.doctorId) {
      newErrors.doctorId = "Attending doctor assignment is required";
    }
    if (!formData.admissionDate) {
      newErrors.admissionDate = "Admission date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validate()) {
      toast.error("Please resolve the highlighted form errors");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        condition: formData.condition,
        phone: formData.phone.trim(),
        doctorId: formData.doctorId,
        admissionDate: formData.admissionDate,
      };

      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update patient record");
      }

      toast.success("Patient record updated successfully!");
      router.push(`/patients/${patientId}`);
      router.refresh();
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (errorMessage && !formData.name) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Record Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">{errorMessage}</p>
        <Link href="/patients">
          <Button variant="outline" className="mt-4 gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Patients Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
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
        <Link
          href={`/patients/${patientId}`}
          className="hover:text-slate-900 transition-colors"
        >
          {formData.name || "Patient Profile"}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Edit Record</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Edit Patient Record
              </h1>
              <p className="text-sm text-slate-500">
                Update clinical condition or reassign attending physician
              </p>
            </div>
          </div>
        </div>

        <Link href={`/patients/${patientId}`}>
          <Button variant="outline" size="sm">
            Cancel
          </Button>
        </Link>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to update patient</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Edit Form Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Robert Vance"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="130"
                placeholder="e.g. 45"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.age
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
                disabled={isSubmitting}
              />
              {errors.age && (
                <p className="text-xs text-rose-600">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                disabled={isSubmitting}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Medical Condition */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Clinical Condition <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  disabled={isSubmitting}
                >
                  {MEDICAL_CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 321-7654"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            {/* Attending Doctor */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Attending Clinician / Doctor <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.doctorId}
                  onChange={(e) =>
                    setFormData({ ...formData, doctorId: e.target.value })
                  }
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.doctorId
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                >
                  <option value="">-- Select Attending Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} — {doc.specialization} ({doc.hospital})
                    </option>
                  ))}
                </select>
              </div>
              {errors.doctorId && (
                <p className="text-xs text-rose-600">{errors.doctorId}</p>
              )}
            </div>

            {/* Admission Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Admission Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, admissionDate: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.admissionDate
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.admissionDate && (
                <p className="text-xs text-rose-600">{errors.admissionDate}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link href={`/patients/${patientId}`}>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="gap-2 min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function EditPatientPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      }
    >
      <EditPatientContent />
    </Suspense>
  );
}
