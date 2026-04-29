"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, X } from "lucide-react";
import { useGame } from "@/hooks/useGames";
import type { IGame, ITeam } from "@/core/interfaces";

interface TVScoreboardProps {
  game: IGame;
  homeTeam: ITeam;
  awayTeam: ITeam;
  onClose: () => void;
}

export function TVScoreboard({
  game: initialGame,
  homeTeam,
  awayTeam,
  onClose,
}: TVScoreboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: liveGame } = useGame(initialGame.gameId);
  const game = liveGame ?? initialGame;
  const isLive = game.status === "live";

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
      if (e.key === "f" || e.key === "F") void toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake lock not available; ignore
      }
    };
    void requestWakeLock();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      void wakeLock?.release();
    };
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Fullscreen denied; ignore
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col select-none overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 sm:p-5">
        {isLive ? (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
              Live
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
            {game.status === "completed" ? "Full Time" : "Scheduled"}
          </span>
        )}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 sm:p-3 rounded-lg hover:bg-white/10 transition"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Maximize className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-3 rounded-lg hover:bg-white/10 transition"
            aria-label="Close TV mode"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)]" />

      <div className="flex-1 flex flex-col landscape:flex-row items-center justify-center gap-6 landscape:gap-8 px-4 py-16 sm:py-20 relative">
        <TeamSide name={homeTeam.name} score={game.homeScore} />
        <div className="font-thin text-white/15 leading-none text-[14vw] landscape:text-[18vh]">
          :
        </div>
        <TeamSide name={awayTeam.name} score={game.awayScore} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 sm:pb-5 z-10 text-center text-white/40 text-xs sm:text-sm tracking-widest uppercase">
        Press F for fullscreen · Esc to close
      </div>
    </div>
  );
}

function TeamSide({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 landscape:gap-6 min-w-0 max-w-full">
      <h2 className="font-bold uppercase tracking-tight text-center px-2 text-[clamp(1.75rem,7vw,4.5rem)] landscape:text-[clamp(2rem,5vw,6rem)] line-clamp-2 max-w-full">
        {name}
      </h2>
      <div className="font-black tabular-nums leading-none text-[clamp(6rem,32vw,18rem)] landscape:text-[clamp(8rem,32vh,28rem)]">
        {score}
      </div>
    </div>
  );
}
