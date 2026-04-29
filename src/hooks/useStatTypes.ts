"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

export function useStatTypes() {
  return useQuery({
    queryKey: ["statTypes"],
    queryFn: () => repositories.statType.getAll(),
    staleTime: 10 * 60 * 1000,
  });
}
