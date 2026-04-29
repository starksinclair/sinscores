"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

function getBackFallback(pathname: string): string | undefined {
  if (pathname === "/create") return "/";
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && parts[0] !== "manage" && parts[0] !== "create" && parts[0] !== "teams" && parts[0] !== "players") {
    const leagueId = parts[0];
    if (pathname === `/${leagueId}`) return "/";
    if (pathname.startsWith(`/${leagueId}/games/`) && parts[2]) return `/${leagueId}/matches`;
    if (pathname.startsWith(`/${leagueId}/manage`)) return `/${leagueId}`;
  }
  return undefined; // /teams/[id] and /players/[id] use router.back()
}

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  leagueId?: string;
  hideNav?: boolean;
  showBack?: boolean;
  backFallback?: string;
}

export function PageShell({ children, title, leagueId, hideNav, showBack, backFallback }: PageShellProps) {
  const pathname = usePathname();
  const shouldShowBack = showBack ?? (pathname !== "/");
  const resolvedBackFallback = backFallback ?? getBackFallback(pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-phone mx-auto">
      <Header
        title={title}
        leagueId={leagueId}
        showBack={shouldShowBack}
        backFallback={resolvedBackFallback}
      />
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`flex-1 overflow-auto ${hideNav ? "pb-4" : "pb-20"}`}
      >
        {children}
      </motion.main>
      {!hideNav && <BottomNav leagueId={leagueId} />}
    </div>
  );
}
