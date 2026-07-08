// Ported from tacet/src/lib/time-context.ts
// Intl.RelativeTimeFormat is supported in Hermes (React Native 0.73+).

export const NIGHT_START_HOUR = 20;
export const NIGHT_END_HOUR = 6;
export const SENSOR_EVENING_START_HOUR = 18;

export function isNightTime(now?: Date): boolean {
  const h = (now ?? new Date()).getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (diffMs < 60_000) return "à l'instant";
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "always", style: "short" });
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return rtf.format(-diffHour, "hour");
  return rtf.format(-Math.floor(diffHour / 24), "day");
}

export function getSensorTimeLabel(timestamp: string, now?: Date): string {
  const t = now ?? new Date();
  const diff = t.getTime() - new Date(timestamp).getTime();
  if (diff < 10 * 60 * 1000) return "maintenant";
  return formatRelativeTime(timestamp);
}

export function isChantierExpired(date_fin: string | undefined, now?: Date): boolean {
  if (!date_fin) return false;
  return new Date(date_fin) < (now ?? new Date());
}
