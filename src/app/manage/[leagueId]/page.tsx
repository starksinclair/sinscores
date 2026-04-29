"use client";

import Link from "next/link";
import { Calendar, Users, BarChart3 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { useLeague } from "@/hooks/useLeagues";

export default function ManageDashboardPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const { data: league } = useLeague(leagueId);

  const actions = [
    {
      href: `/manage/${leagueId}/games`,
      label: "Manage Games",
      description: "Add, edit games and update scores",
      icon: Calendar,
    },
    {
      href: `/manage/${leagueId}/players`,
      label: "Manage Players",
      description: "Assign or remove players from teams",
      icon: Users,
    },
    {
      href: `/manage/${leagueId}/stats`,
      label: "Manage Stats",
      description: "Add goals, assists and other statistics",
      icon: BarChart3,
    },
  ];

  if (!league) {
    return (
      <PageShell title="Admin" hideNav>
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={`${league.name} - Admin`} hideNav>
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="hover:opacity-90 transition-opacity">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{action.label}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
