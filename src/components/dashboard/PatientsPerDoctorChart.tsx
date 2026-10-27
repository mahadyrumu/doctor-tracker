"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface PatientPerDoctorItem {
  doctorId: string;
  doctorName: string;
  specialization: string;
  patientCount: number;
}

interface PatientsPerDoctorChartProps {
  data: PatientPerDoctorItem[];
  isLoading?: boolean;
}

function CustomBarTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const item = payload[0].payload as PatientPerDoctorItem;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-800 text-xs">
        <p className="font-bold text-white text-sm">{item.doctorName}</p>
        <p className="text-teal-400 font-medium mb-1.5">{item.specialization}</p>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
          <span>Assigned Patients: </span>
          <span className="font-bold text-white text-xs">{item.patientCount}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function PatientsPerDoctorChart({ data, isLoading }: PatientsPerDoctorChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Format doctor names for chart X-axis (shortened name)
  const chartData = data.map((d) => ({
    ...d,
    shortName: d.doctorName.replace(/^Dr\.\s*/, "").split(" ")[0],
  }));

  return (
    <Card className="hover:border-slate-300 transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Patients per Doctor</CardTitle>
            <CardDescription>
              Patient distribution across top attending medical practitioners
            </CardDescription>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full">
            Top {chartData.length} Doctors
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No doctor assignments recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="shortName"
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f1f5f9" }} />
                <Bar
                  dataKey="patientCount"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

