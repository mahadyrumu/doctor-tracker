"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface ConditionItem {
  condition: string;
  count: number;
}

interface ConditionDistributionChartProps {
  data: ConditionItem[];
  isLoading?: boolean;
}

const PALETTE = [
  "#0d9488", // Teal
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#64748b", // Slate
];

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-800 text-xs">
        <span className="font-semibold block text-white">{item.name}</span>
        <span className="text-teal-400 font-bold">{item.value} patients</span>
      </div>
    );
  }
  return null;
}

export function ConditionDistributionChart({
  data,
  isLoading,
}: ConditionDistributionChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44 mb-1" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: d.condition,
    value: d.count,
  }));

  return (
    <Card className="hover:border-slate-300 transition-all duration-200">
      <CardHeader>
        <CardTitle>Medical Conditions</CardTitle>
        <CardDescription>
          Primary diagnoses distribution across admitted patients
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No diagnostic data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PALETTE[index % PALETTE.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={45}
                  iconType="circle"
                  formatter={(value: string) => (
                    <span className="text-[11px] text-slate-600 font-medium mr-2">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

