"use client";

interface StatRowProps {
  label: string;
  value: string | number;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
