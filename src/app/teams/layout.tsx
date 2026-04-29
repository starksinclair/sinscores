"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { useTeam } from "@/hooks/useTeams";

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const teamId = params?.teamId as string | undefined;
  const { data: team } = useTeam(teamId ?? "");

  return (
    <PageShell title={team?.name} leagueId={undefined}>
      {children}
    </PageShell>
  );
}
