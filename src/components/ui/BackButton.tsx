"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  fallback?: string;
}

export function BackButton({ fallback }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => (fallback ? router.push(fallback) : router.back())}
      className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Go back"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
  );
}
