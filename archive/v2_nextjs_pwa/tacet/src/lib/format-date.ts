/**
 * Formats an ISO 8601 timestamp as a French relative time string.
 *
 * Examples:
 *   "à l'instant"      — less than 1 minute ago (or future/clock drift)
 *   "il y a 2 min."    — 2 minutes ago
 *   "il y a 1 h."      — 1 hour ago
 *   "il y a 3 j."      — 3 days ago
 *
 * Returns "" when isoString is null or undefined.
 */
export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return "";

  const diffMs = Date.now() - new Date(isoString).getTime();

  // Treat future timestamps (clock drift) and sub-minute deltas the same way
  if (diffMs < 60_000) return "à l'instant";

  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "always", style: "short" });

  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return rtf.format(-diffHour, "hour");

  const diffDay = Math.floor(diffHour / 24);
  return rtf.format(-diffDay, "day");
}
