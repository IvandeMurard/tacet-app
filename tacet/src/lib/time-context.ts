import { formatRelativeTime } from "@/lib/format-date";

export const NIGHT_START_HOUR = 20;
export const NIGHT_END_HOUR = 6;
/** Hour at which sensor readings shift from "maintenant" to relative time labels. */
export const SENSOR_EVENING_START_HOUR = 18;

/**
 * Returns true when the current hour falls in night window (20:00–05:59).
 * Accepts optional `now` for testability.
 */
export function isNightTime(now?: Date): boolean {
  const h = (now ?? new Date()).getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

/**
 * Returns "maintenant" if the sensor reading is less than 10 minutes old,
 * otherwise returns a French relative time string (e.g. "il y a 2 h.").
 * Accepts optional `now` for testability.
 */
export function getSensorTimeLabel(timestamp: string, now?: Date): string {
  const t = now ?? new Date();
  const diff = t.getTime() - new Date(timestamp).getTime();
  if (diff < 10 * 60 * 1000) return "maintenant";
  return formatRelativeTime(timestamp);
}

/**
 * Returns true when a chantier's end date is in the past.
 * Returns false if date_fin is undefined (no expiry known).
 * Accepts optional `now` for testability.
 *
 * Note: ISO date strings like "2026-04-30" parse as midnight UTC.
 * In Paris (UTC+2), a chantier ending "today" will not expire until
 * 02:00 local time — acceptable precision for active/stale display.
 */
export function isChantierExpired(date_fin: string | undefined, now?: Date): boolean {
  if (!date_fin) return false;
  return new Date(date_fin) < (now ?? new Date());
}
