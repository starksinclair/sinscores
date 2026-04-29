/**
 * Generate a pre-filled Google Form URL for player registration.
 * Uses NEXT_PUBLIC_FORM_URL and field IDs from env.
 */
export function generateFormUrl(leagueId: string, seasonId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_FORM_URL;
  const leagueField = process.env.NEXT_PUBLIC_FORM_FIELD_LEAGUE_ID;
  const seasonField = process.env.NEXT_PUBLIC_FORM_FIELD_SEASON_ID;

  if (!baseUrl) {
    return "";
  }

  const params = new URLSearchParams();
  if (leagueField) params.set(leagueField, leagueId);
  if (seasonField) params.set(seasonField, seasonId);

  const query = params.toString();
  const separator = baseUrl.includes("?") ? "&" : "?";
  return query ? `${baseUrl}${separator}${query}` : baseUrl;
}
