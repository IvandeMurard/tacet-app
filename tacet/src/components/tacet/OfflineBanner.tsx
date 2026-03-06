"use client";

import { useState, useEffect } from "react";

const LAST_ZONE_KEY = "tacet-last-zone";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastZoneName, setLastZoneName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => {
      setIsOnline(false);
      try {
        const raw = localStorage.getItem(LAST_ZONE_KEY);
        if (raw) {
          const zone = JSON.parse(raw);
          if (zone?.name) setLastZoneName(zone.name);
        }
      } catch { /* ignore */ }
    };
    if (!navigator.onLine) onOffline();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      Vous êtes hors ligne
      {lastZoneName
        ? ` — dernière zone consultée : ${lastZoneName}`
        : " — données de votre dernière session disponibles"}
      .
    </div>
  );
}
