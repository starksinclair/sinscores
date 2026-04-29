"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useManageAccess } from "@/hooks/useManageAccess";
import { useLeague } from "@/hooks/useLeagues";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";
import { SeasonSelector } from "@/components/league/SeasonSelector";
import { Tabs } from "@/components/ui/Tabs";
import { ManageGamesTabContent } from "@/components/manage/ManageGamesTab";
import { ManagePlayersTabContent } from "@/components/manage/ManagePlayersTab";
import { ManageSettingsTabContent } from "@/components/manage/ManageSettingsTab";
import { cn } from "@/lib/utils";

export default function ManagePage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const { isUnlocked, unlock, lock } = useManageAccess(leagueId);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [manageTab, setManageTab] = useState<string>("games");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => {
        setCode(Array(6).fill(""));
        setError(false);
        inputRefs.current[0]?.focus();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 300);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleCodeChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (!/^[A-Z0-9]$/.test(char) && char !== "") return;

    const next = [...code];
    next[index] = char;
    setCode(next);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = next.join("");
    if (fullCode.length === 6) {
      unlock(fullCode).then((ok) => {
        if (ok) {
          setSuccess(true);
        } else {
          setError(true);
        }
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setCode(next);
      setError(false);
      inputRefs.current[5]?.focus();
      unlock(pasted).then((ok) => {
        if (ok) setSuccess(true);
        else setError(true);
      });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-card p-6 shadow-sm">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-center mb-2">
            Manage League
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Enter your 6-character code to manage this league
          </p>
          <div
            className={cn(
              "flex gap-2 justify-center mb-4",
              error && "animate-shake",
            )}
          >
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="text"
                maxLength={1}
                value={c}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={cn(
                  "w-12 h-14 text-center text-xl font-bold border-2 rounded-lg bg-background focus:outline-none transition-colors",
                  error && "border-red-500",
                  success && "border-green-500",
                  !error && !success && "border-gray-200 dark:border-gray-700 focus:border-accent",
                )}
              />
            ))}
          </div>
          {error && (
            <p className="text-center text-red-500 text-sm mb-2">Invalid code</p>
          )}
          {success && (
            <p className="text-center text-green-600 dark:text-green-400 text-sm mb-2">
              Access granted
            </p>
          )}
          <Link
            href={`/${leagueId}`}
            className="block text-center text-sm text-accent hover:underline mt-4"
          >
            ← Back to league
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ManageDashboard
      leagueId={leagueId}
      manageTab={manageTab}
      onManageTabChange={setManageTab}
      onLock={lock}
    />
  );
}

function ManageDashboard({
  leagueId,
  manageTab,
  onManageTabChange,
  onLock,
}: {
  leagueId: string;
  manageTab: string;
  onManageTabChange: (id: string) => void;
  onLock: () => void;
}) {
  const { data: league } = useLeague(leagueId);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <span className="font-semibold block">Manage League</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {league?.name}
          </span>
        </div>
        <button
          type="button"
          onClick={onLock}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-foreground"
        >
          <Lock className="h-4 w-4" />
          Lock
        </button>
      </div>
      <ManageSeasonBar leagueId={leagueId} />
      <Tabs
        tabs={[
          { id: "games", label: "Games" },
          { id: "players", label: "Players" },
          { id: "settings", label: "Settings" },
        ]}
        activeId={manageTab}
        onChange={onManageTabChange}
      />
      <div className="p-4">
        {manageTab === "games" && <ManageGamesTab leagueId={leagueId} />}
        {manageTab === "players" && <ManagePlayersTab leagueId={leagueId} />}
        {manageTab === "settings" && <ManageSettingsTab leagueId={leagueId} />}
      </div>
    </div>
  );
}

function ManageSeasonBar({ leagueId }: { leagueId: string }) {
  const { season, setSeason, seasons, isLoading } = useLeagueSeasonContext();
  return (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
      <SeasonSelector
        leagueId={leagueId}
        selectedSeason={season}
        onSeasonChange={setSeason}
        seasons={seasons}
        isLoading={isLoading}
      />
    </div>
  );
}

function ManageGamesTab({ leagueId }: { leagueId: string }) {
  return <ManageGamesTabContent leagueId={leagueId} />;
}

function ManagePlayersTab({ leagueId }: { leagueId: string }) {
  return <ManagePlayersTabContent leagueId={leagueId} />;
}

function ManageSettingsTab({ leagueId }: { leagueId: string }) {
  return <ManageSettingsTabContent leagueId={leagueId} />;
}
