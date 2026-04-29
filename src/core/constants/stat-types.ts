import type { IStatType } from "@/core/interfaces";

export const STAT_TYPES: Record<string, IStatType> = {
  goal: { statType: "goal", label: "Goals", icon: "⚽" },
  own_goal: { statType: "own_goal", label: "Own Goals", icon: "🥅" },
  assist: { statType: "assist", label: "Assists", icon: "🅰️" },
  yellow: { statType: "yellow", label: "Yellow Cards", icon: "🟨" },
  red: { statType: "red", label: "Red Cards", icon: "🟥" },
};

export function getStatType(statType: string): IStatType {
  return (
    STAT_TYPES[statType] ?? {
      statType,
      label: statType.charAt(0).toUpperCase() + statType.slice(1),
      icon: "•",
    }
  );
}
