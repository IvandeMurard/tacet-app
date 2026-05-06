"use client";

import { useState, useEffect } from "react";
import { formatRelativeTime } from "@/lib/format-date";

interface RumeurStatusBarProps {
  /** ISO 8601 timestamp of last successful RUMEUR fetch (`cachedAt` from response envelope). */
  cachedAt: string | null;
  /** Error string from the response envelope (`data.error`), not from SWR's network-level error. */
  error: string | null;
  /** Whether the API is currently serving stale fallback data. */
  fallback: boolean;
}

/**
 * Floating status pill shown above the AppNav when the RUMEUR layer is active.
 *
 * States (in priority order):
 *   1. Offline             → amber "Capteurs — données en cache · <age>" (or without age)
 *   2. Error, no fallback  → amber "Capteurs — données indisponibles"
 *   3. Error + fallback    → amber "Capteurs — cache · <age>" (or without age if cachedAt absent)
 *   4. Live data           → muted "Capteurs · mis à jour <age>"
 *   5. Loading (no data)   → renders nothing
 */
export function RumeurStatusBar({ cachedAt, error, fallback }: RumeurStatusBarProps) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Still loading — nothing to show yet
  if (!cachedAt && !error && isOnline) return null;

  let message: string;
  let isAmber: boolean;

  if (!isOnline) {
    // Offline: distinguish cached from live
    isAmber = true;
    message = cachedAt
      ? `Capteurs — données en cache · ${formatRelativeTime(cachedAt)}`
      : "Capteurs — données en cache";
  } else if (error && !fallback) {
    // Upstream down, no stale data to show
    isAmber = true;
    message = "Capteurs — données indisponibles";
  } else if (error && fallback) {
    // Serving stale fallback — show age when available so user understands data freshness.
    // cachedAt may theoretically be null if the API contract is violated; still show amber.
    isAmber = true;
    message = cachedAt
      ? `Capteurs — cache · ${formatRelativeTime(cachedAt)}`
      : "Capteurs — données en cache";
  } else if (cachedAt) {
    // Normal live state
    isAmber = false;
    message = `Capteurs · mis à jour ${formatRelativeTime(cachedAt)}`;
  } else {
    return null;
  }

  return (
    <div
      className={`absolute bottom-[3.75rem] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-black/50 px-3 py-1 text-xs backdrop-blur-sm ${
        isAmber
          ? "border-amber-500/20 text-amber-300/80"
          : "border-white/10 text-white/55"
      }`}
      role="status"
      aria-live="polite"
      aria-label="État des capteurs RUMEUR"
    >
      {message}
    </div>
  );
}
