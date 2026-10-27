import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-800 border border-slate-200",
        teal: "bg-teal-50 text-teal-700 border border-teal-200/60",
        blue: "bg-blue-50 text-blue-700 border border-blue-200/60",
        green: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
        amber: "bg-amber-50 text-amber-700 border border-amber-200/60",
        destructive: "bg-rose-50 text-rose-700 border border-rose-200/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

