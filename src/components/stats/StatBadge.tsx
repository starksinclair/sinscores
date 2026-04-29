"use client";

import { cn } from "@/lib/utils";

interface StatBadgeProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatBadge({ label, value, icon, className }: StatBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800",
        className
      )}
    >
      {icon}
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
