"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ManagePlayersPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;

  return (
    <PageShell title="Manage Players" hideNav>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href={`/manage/${leagueId}`}
            className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h2 className="font-semibold">Manage Players</h2>
        </div>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Assign players to teams or remove them from the league. This
              feature will be connected to Google Sheets in production.
            </p>
            <Button disabled>Assign Player (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
