"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";
import { seedIfEmpty } from "@/infrastructure/localStorage/seed";

const isProduction = process.env.NEXT_PUBLIC_PRODUCTION === "true";

export function SeedOnMount() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isProduction) return;
    seedIfEmpty(repositories as Parameters<typeof seedIfEmpty>[0]).then((seeded) => {
      if (seeded) {
        queryClient.invalidateQueries({ queryKey: ["leagues"] });
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["games"] });
      }
    });
  }, [queryClient]);

  return null;
}
