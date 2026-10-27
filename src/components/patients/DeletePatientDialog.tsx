"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import type { PatientWithDoctor } from "@/lib/services/patient.service";

interface DeletePatientDialogProps {
  patient: PatientWithDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeletePatientDialog({
  patient,
  isOpen,
  onClose,
  onSuccess,
}: DeletePatientDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !patient) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patient._id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete patient");
      }

      toast.success(`Patient record for ${patient.name} deleted successfully`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Could not delete patient record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              Delete Patient Record
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to permanently delete the admission record
              for <strong className="text-slate-800">{patient.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-1">
              <div>
                Diagnosis: <strong>{patient.condition}</strong>
              </div>
              <div>
                Attending: <strong>{patient.doctorName}</strong>
              </div>
              <div>
                Admission: <strong>{patient.admissionDate}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            isLoading={loading}
            onClick={handleDelete}
            className="text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Confirm Deletion</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

