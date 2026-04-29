import { PageShell } from "@/components/layout/PageShell";
import { LeagueSeasonProvider } from "@/contexts/LeagueSeasonContext";

export default function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { leagueId: string };
}) {
  return (
    <PageShell leagueId={params.leagueId}>
      <LeagueSeasonProvider leagueId={params.leagueId}>
        {children}
      </LeagueSeasonProvider>
    </PageShell>
  );
}
