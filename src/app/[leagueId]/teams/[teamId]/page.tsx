"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function LegacyTeamRedirect() {
  const router = useRouter();
  const params = useParams();
  const teamId = params?.teamId as string | undefined;

  useEffect(() => {
    if (teamId) {
      router.replace(`/teams/${teamId}`);
    }
  }, [teamId, router]);

  return (
    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
      Redirecting...
    </div>
  );
}
