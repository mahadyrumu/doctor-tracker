"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  User,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SPECIALIZATION_SUGGESTIONS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Oncology",
  "Dermatology",
  "General Surgery",
  "Internal Medicine",
  "Psychiatry",
  "Endocrinology",
  "Radiology",
  "Emergency Medicine",
];

export default function NewDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    hospital: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Doctor's name must be at least 2 characters";
    }
    if (!formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }
    if (!formData.hospital.trim()) {
      newErrors.hospital = "Hospital or clinic name is required";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      newErrors.phone = "Valid contact phone number is required";
    }
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Valid professional email address is required";
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
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create doctor");
      }

      toast.success(`Doctor profile for ${data.data.name} created successfully!`);
      router.push(`/doctors/${data.data._id}`);
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
          href="/doctors"
          className="hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Doctors
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">New Doctor</span>
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
                Register New Doctor
              </h1>
              <p className="text-sm text-slate-500">
                Add a licensed medical clinician to the hospital registry
              </p>
            </div>
          </div>
        </div>

        <Link href="/doctors">
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
            <p className="font-semibold">Unable to register doctor</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Doctor Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Jennifer Lawrence, MD"
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
              {errors.name ? (
                <p className="text-xs text-rose-600">{errors.name}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Include professional title (e.g. Dr., MD, DO)
                </p>
              )}
            </div>

            {/* Specialization */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Medical Specialization <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  list="specialties-list"
                  placeholder="e.g. Cardiology"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.specialization
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"
                  }`}
                  disabled={isSubmitting}
                />
                <datalist id="specialties-list">
                  {SPECIALIZATION_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              {errors.specialization ? (
                <p className="text-xs text-rose-600">{errors.specialization}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Primary clinical specialty or department
                </p>
              )}
            </div>

            {/* Hospital */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Hospital / Medical Center <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Massachusetts General Hospital"
                  value={formData.hospital}
                  onChange={(e) =>
                    setFormData({ ...formData, hospital: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.hospital
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.hospital && (
                <p className="text-xs text-rose-600">{errors.hospital}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 432-8901"
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

            {/* Professional Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Professional Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. j.lawrence@massgeneral.org"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email ? (
                <p className="text-xs text-rose-600">{errors.email}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Must be unique across all clinicians
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link href="/doctors">
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
                  Register Doctor
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
