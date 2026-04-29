/**
 * Format date for display (e.g. "Mon 9 Mar", "14:30")
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Format time for display (e.g. "14:30")
 */
export function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format date and time for display (e.g. "Mon 9 Mar 14:30")
 */
export function formatDateTime(isoDate: string): string {
  return `${formatDate(isoDate)} ${formatTime(isoDate)}`;
}

/**
 * Format score for display (e.g. "2 - 1")
 */
export function formatScore(homeScore: number, awayScore: number): string {
  return `${homeScore} - ${awayScore}`;
}

/**
 * Format duration in minutes (e.g. "90'" or "45'")
 */
export function formatDuration(minutes: number): string {
  return `${minutes}'`;
}

/**
 * Get initials from a name (e.g. "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
