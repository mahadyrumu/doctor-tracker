import React from "react";
import { UserCheck, Users, Activity, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatCardsProps {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  recentCount: number;
  isLoading?: boolean;
}

export function StatCards({
  totalDoctors,
  totalPatients,
  avgPatientsPerDoctor,
  recentCount,
  isLoading,
}: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-36" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Doctors",
      value: totalDoctors.toLocaleString(),
      subtitle: "Active Medical Practitioners",
      icon: UserCheck,
      iconBg: "bg-teal-500/10 text-teal-600 border border-teal-500/20",
    },
    {
      title: "Total Patients",
      value: totalPatients.toLocaleString(),
      subtitle: "Registered Clinical Patients",
      icon: Users,
      iconBg: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
    },
    {
      title: "Patients per Doctor",
      value: avgPatientsPerDoctor.toString(),
      subtitle: "Clinical Caseload Average",
      icon: Activity,
      iconBg: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    },
    {
      title: "Recent Admissions",
      value: recentCount.toLocaleString(),
      subtitle: "30-Day Window Intake",
      icon: Calendar,
      iconBg: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="hover:border-slate-300 transition-all duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  {stat.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>{stat.subtitle}</span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

