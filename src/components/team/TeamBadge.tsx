"use client";

interface TeamBadgeProps {
  teamId: string;
  name: string;
  className?: string;
}

export function TeamBadge({ teamId, name, className }: TeamBadgeProps) {
  void teamId; // Reserved for future link to team page
  return (
    <span
      className={
        "font-medium truncate flex-1 min-w-0" + className
      }
    >
      {name}
    </span>
  );
}
