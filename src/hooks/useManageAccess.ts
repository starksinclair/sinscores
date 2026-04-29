"use client";

import { useCallback, useState, useEffect } from "react";
import { repositories } from "@/infrastructure/container";

const STORAGE_KEY_PREFIX = "nl_manage_";

function getStorageKey(leagueId: string): string {
  return `${STORAGE_KEY_PREFIX}${leagueId}`;
}

const isProduction = process.env.NEXT_PUBLIC_PRODCTION === "true";

export function useManageAccess(leagueId: string) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(leagueId);
    setIsUnlocked(sessionStorage.getItem(key) === "unlocked");
  }, [leagueId]);

  const unlock = useCallback(
    async (code: string): Promise<boolean> => {
      if (isProduction) {
        const res = await fetch("/api/manage/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leagueId, code }),
        });
        const data = (await res.json()) as {
          success?: boolean;
          accessCode?: string;
        };
        if (!data.success) return false;
        if (data.accessCode && typeof window !== "undefined") {
          sessionStorage.setItem(
            `${STORAGE_KEY_PREFIX}code_${leagueId}`,
            data.accessCode,
          );
        }
      } else {
        const league = await repositories.league.getById(leagueId);
        const leagueWithCode = league as { accessCode?: string } | null;
        if (!leagueWithCode || leagueWithCode.accessCode !== code) {
          return false;
        }
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem(getStorageKey(leagueId), "unlocked");
        setIsUnlocked(true);
      }
      return true;
    },
    [leagueId],
  );

  const lock = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(getStorageKey(leagueId));
      setIsUnlocked(false);
    }
  }, [leagueId]);

  const getAccessCode = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(`${STORAGE_KEY_PREFIX}code_${leagueId}`);
  }, [leagueId]);

  return { isUnlocked, unlock, lock, getAccessCode };
}
