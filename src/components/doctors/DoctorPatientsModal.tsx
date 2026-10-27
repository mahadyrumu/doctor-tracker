"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  UserPlus,
  Trash2,
  Users,
  Search,
  Building2,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DoctorWithStats } from "@/lib/services/doctor.service";

interface DoctorPatientsModalProps {
  doctor: DoctorWithStats | null;
  isOpen: boolean;
  onClose: () => void;
  onPatientCountChanged?: () => void;
}

interface PatientRecord {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  admissionDate: string;
}

export function DoctorPatientsModal({
  doctor,
  isOpen,
  onClose,
  onPatientCountChanged,
}: DoctorPatientsModalProps) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New patient state
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState<"Male" | "Female" | "Other">("Male");
  const [newCondition, setNewCondition] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    if (!doctor) return;
    setLoading(true);
    try {
      const url = new URL(`/api/doctors/${doctor._id}/patients`, window.location.origin);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load patients");
      }

      setPatients(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve doctor's patient roster");
    } finally {
      setLoading(false);
    }
  }, [doctor, search]);

  useEffect(() => {
    if (isOpen && doctor) {
      fetchPatients();
    }
  }, [isOpen, doctor, fetchPatients]);

  if (!isOpen || !doctor) return null;

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/doctors/${doctor._id}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          age: parseInt(newAge, 10),
          gender: newGender,
          condition: newCondition.trim(),
          phone: newPhone.trim(),
          admissionDate: new Date(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to add patient");
      }

      toast.success(`Patient ${newName} added under ${doctor.name}`);
      setNewName("");
      setNewAge("");
      setNewCondition("");
      setNewPhone("");
      setShowAddForm(false);
      fetchPatients();
      onPatientCountChanged?.();
    } catch (err: any) {
      toast.error(err.message || "Could not add patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to remove patient ${patientName} from this doctor's roster?`)) {
      return;
    }

    setDeletingId(patientId);
    try {
      const res = await fetch(`/api/doctors/${doctor._id}/patients/${patientId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete patient");
      }

      toast.success(`Patient removed from ${doctor.name}'s list`);
      fetchPatients();
      onPatientCountChanged?.();
    } catch (err: any) {
      toast.error(err.message || "Could not delete patient");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {doctor.name}
                </h3>
                <Badge variant="teal">{doctor.specialization}</Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{doctor.hospital}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            <span>{showAddForm ? "Hide Form" : "Add Patient under Doctor"}</span>
          </Button>
        </div>

        {/* Collapsible Add Patient Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddPatient}
            className="p-4 bg-teal-50/50 border-b border-teal-100 space-y-3"
          >
            <div className="text-xs font-bold text-teal-900">
              New Patient Admission under {doctor.name}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Patient Name"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Age & Gender *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min={0}
                    max={130}
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="Age"
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Diagnosis / Condition *
                </label>
                <input
                  type="text"
                  required
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. Hypertension"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Phone (e.g. +1 555-0199)"
                className="w-60 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={submitting}
                  className="text-xs"
                >
                  Confirm Admission
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Patients Table Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                No patients found
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {search
                  ? "No patients match your search term."
                  : "Click 'Add Patient under Doctor' to admit a patient to this roster."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Patient Details</th>
                    <th className="pb-3">Diagnosis</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Admission Date</th>
                    <th className="pb-3 text-right pr-1">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {patients.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 pl-1">
                        <span className="font-semibold text-slate-900 block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.gender}, {p.age} yrs
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge variant="teal">{p.condition}</Badge>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">
                        {p.phone}
                      </td>
                      <td className="py-3 text-slate-500">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{p.admissionDate}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right pr-1">
                        <button
                          type="button"
                          onClick={() => handleDeletePatient(p._id, p.name)}
                          disabled={deletingId === p._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete patient from doctor"
                        >
                          {deletingId === p._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>
            Total Assigned: <strong>{patients.length} patients</strong>
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Roster
          </Button>
        </div>
      </div>
    </div>
  );
}

