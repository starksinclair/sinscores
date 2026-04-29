"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-card scrollbar-hide",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
            activeId === tab.id
              ? "border-accent text-accent"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
