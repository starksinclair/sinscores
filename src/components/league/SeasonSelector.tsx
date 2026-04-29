"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeasonSelectorProps {
  leagueId: string;
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
  seasons: string[];
  isLoading?: boolean;
}

export function SeasonSelector({
  selectedSeason,
  onSeasonChange,
  seasons,
  isLoading,
}: SeasonSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isLoading || seasons.length === 0}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2.5 rounded-lg",
          "border border-gray-200 dark:border-gray-700 bg-background",
          "text-sm font-medium text-foreground",
          "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <span>
          Season: {selectedSeason || (isLoading ? "..." : "—")}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-gray-500 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && seasons.length > 0 && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-1 z-50",
            "rounded-lg border border-gray-200 dark:border-gray-700",
            "bg-card shadow-lg py-1 max-h-48 overflow-auto",
          )}
        >
          {seasons.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onSeasonChange(s);
                setOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2 text-left text-sm",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                s === selectedSeason && "bg-accent/10 text-accent font-medium",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
