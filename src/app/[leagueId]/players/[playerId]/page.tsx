"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function LegacyPlayerRedirect() {
  const router = useRouter();
  const params = useParams();
  const playerId = params?.playerId as string | undefined;

  useEffect(() => {
    if (playerId) {
      router.replace(`/players/${playerId}`);
    }
  }, [playerId, router]);

  return (
    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
      Redirecting...
    </div>
  );
}
