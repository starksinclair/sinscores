"use client";

import { Avatar } from "@/components/ui/Avatar";
import type { IPlayer } from "@/core/interfaces";
import type { IPlayerStatSummary } from "@/core/interfaces";

interface PlayerAvatarProps {
  player: IPlayer | IPlayerStatSummary;
  size?: "sm" | "md" | "lg";
}

export function PlayerAvatar({ player, size = "md" }: PlayerAvatarProps) {
  const name = "name" in player ? player.name : player.playerName;
  const pictureUrl = player.pictureUrl;

  return <Avatar src={pictureUrl || undefined} alt={name} fallback={name} size={size} />;
}
