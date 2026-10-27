import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

interface RecentAdmissionItem {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  admissionDate: string;
  doctorName: string;
}

interface RecentAdmissionsTableProps {
  admissions: RecentAdmissionItem[];
  isLoading?: boolean;
}

export function RecentAdmissionsTable({
  admissions,
  isLoading,
}: RecentAdmissionsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-slate-300 transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Patient Admissions</CardTitle>
            <CardDescription>
              Latest intake records with medical condition and attending practitioner
            </CardDescription>
          </div>
          <Link
            href="/patients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All Patients</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {admissions.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No patient admissions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-1">Patient Name</th>
                  <th className="pb-3">Attending Doctor</th>
                  <th className="pb-3">Diagnosis</th>
                  <th className="pb-3 text-right pr-1">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {admissions.map((patient) => (
                  <tr
                    key={patient._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 pl-1">
                      <span className="font-semibold text-slate-900 block group-hover:text-blue-600 transition-colors">
                        {patient.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {patient.gender}, {patient.age} yrs
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-700">
                      {patient.doctorName}
                    </td>
                    <td className="py-3">
                      <Badge variant="blue">{patient.condition}</Badge>
                    </td>
                    <td className="py-3 text-right pr-1 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{patient.admissionDate}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

