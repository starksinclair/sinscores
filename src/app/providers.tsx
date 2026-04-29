"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { SeedOnMount } from "@/components/SeedOnMount";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );
  // Per-query stale times are set in individual hooks:
  // leagues, seasons, teams: 5min | players, leaguePlayers: 2min
  // games, stats: 1min | statTypes: 10min
  // Live games: refetchInterval 30s when visible

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ToastProvider>
          <SeedOnMount />
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
