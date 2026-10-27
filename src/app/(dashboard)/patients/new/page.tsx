"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  User,
  Stethoscope,
  Phone,
  Calendar,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface DoctorOption {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
}

const MEDICAL_CONDITIONS = ["Critical", "Serious", "Stable", "Discharged"];

function NewPatientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDoctorId = searchParams.get("doctorId") || "";

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    condition: "Stable",
    phone: "",
    doctorId: preselectedDoctorId,
    admissionDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch doctors for selector
  useEffect(() => {
    async function loadDoctors() {
      try {
        setIsLoadingDoctors(true);
        const res = await fetch("/api/doctors?limit=50");
        const data = await res.json();
        if (data.success && data.data?.doctors) {
          setDoctors(data.data.doctors);
          // If no doctor selected yet and preselected is not available, default to first doctor
          if (!preselectedDoctorId && data.data.doctors.length > 0) {
            setFormData((prev) => ({
              ...prev,
              doctorId: prev.doctorId || data.data.doctors[0]._id,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setIsLoadingDoctors(false);
      }
    }
    loadDoctors();
  }, [preselectedDoctorId]);

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

      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to register patient");
      }

      toast.success(`Patient record for ${data.data.name} created successfully!`);
      // Navigate to patient's new profile
      router.push(`/patients/${data.data._id}`);
      router.refresh();
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/patients"
          className="hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Patients
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Register Patient</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Register New Patient
              </h1>
              <p className="text-sm text-slate-500">
                Create a patient admission record and assign an attending clinician
              </p>
            </div>
          </div>
        </div>

        <Link href="/patients">
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
            <p className="font-semibold">Unable to register patient</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Patient Registration Form */}
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
                      : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"
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
                    : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"
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
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
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
                      : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"
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
                  disabled={isLoadingDoctors || isSubmitting}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.doctorId
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"
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
              {errors.doctorId ? (
                <p className="text-xs text-rose-600">{errors.doctorId}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Select the physician responsible for this patient&apos;s treatment plan
                </p>
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
                      : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.admissionDate && (
                <p className="text-xs text-rose-600">{errors.admissionDate}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link href="/patients">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="gap-2 min-w-[170px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Register Patient
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function NewPatientPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Loading registration form...
        </div>
      }
    >
      <NewPatientForm />
    </Suspense>
  );
}
