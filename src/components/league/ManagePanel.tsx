"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useManageAccess } from "@/hooks/useManageAccess";
import { Tabs } from "@/components/ui/Tabs";
import { useLeague } from "@/hooks/useLeagues";
import { useGamesByLeague } from "@/hooks/useGames";

interface ManagePanelProps {
  leagueId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ManagePanel({ leagueId, isOpen, onClose }: ManagePanelProps) {
  const { isUnlocked, unlock, lock } = useManageAccess(leagueId);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { data: league } = useLeague(leagueId);
  const { data: games } = useGamesByLeague(leagueId);
  const [manageTab, setManageTab] = useState("games");

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => {
        setCode(Array(6).fill(""));
        setError(false);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [error]);

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
        if (!ok) {
          setError(true);
        }
      });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-background rounded-t-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {!isUnlocked ? (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Enter League Code</h3>
              <div
                className={`flex gap-2 justify-center mb-4 ${error ? "animate-shake" : ""}`}
              >
                {code.map((c, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={c}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg bg-background border-gray-200 dark:border-gray-700 focus:border-accent focus:outline-none"
                  />
                ))}
              </div>
              {error && (
                <p className="text-center text-red-500 text-sm">Invalid code</p>
              )}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Auto-submits when 6 chars entered
              </p>
            </div>
          ) : (
            <div>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold">Manage {league?.name}</h3>
                <button
                  type="button"
                  onClick={() => { lock(); onClose(); }}
                  className="text-sm text-gray-500 hover:text-foreground"
                >
                  Lock
                </button>
              </div>
              <Tabs
                tabs={[
                  { id: "games", label: "Games" },
                  { id: "players", label: "Players" },
                  { id: "stats", label: "Stats" },
                  { id: "settings", label: "Settings" },
                ]}
                activeId={manageTab}
                onChange={setManageTab}
              />
              <div className="p-4 max-h-[50vh] overflow-auto">
                {manageTab === "games" && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {games?.length ?? 0} games
                    </p>
                    <p className="text-sm">Add Game, Edit Score — coming soon</p>
                  </div>
                )}
                {manageTab === "players" && (
                  <div>
                    <p className="text-sm">Search, Assign, Unassigned — coming soon</p>
                  </div>
                )}
                {manageTab === "stats" && (
                  <div>
                    <p className="text-sm">Select game, Add stat — coming soon</p>
                  </div>
                )}
                {manageTab === "settings" && (
                  <div>
                    <p className="text-sm">Add Season, Regenerate Code — coming soon</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
