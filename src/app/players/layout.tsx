"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { usePlayer } from "@/hooks/usePlayers";

export default function PlayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const playerId = params?.playerId as string | undefined;
  const { data: player } = usePlayer(playerId ?? "");

  return (
    <PageShell title={player?.name} leagueId={undefined}>
      {children}
    </PageShell>
  );
}
