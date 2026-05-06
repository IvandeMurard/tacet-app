import { useCallback, useEffect, useState } from "react";
import type { RumeurResponse } from "@/types/rumeur";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://tacet.vercel.app";
const POLL_INTERVAL_MS = 180_000; // 3 min — mirrors server-side cache TTL

interface UseRumeurResult {
  data: RumeurResponse | null;
  loading: boolean;
  error: string | null;
}

export function useRumeur(enabled: boolean): UseRumeurResult {
  const [data, setData] = useState<RumeurResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRumeur = useCallback(async (cancelled: { value: boolean }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/rumeur`);
      if (!res.ok) throw new Error(`RUMEUR: ${res.status}`);
      const json = (await res.json()) as RumeurResponse;
      if (!cancelled.value) {
        setData(json);
        setError(null);
      }
    } catch (err) {
      if (!cancelled.value) {
        setError(err instanceof Error ? err.message : "RUMEUR indisponible");
      }
    } finally {
      if (!cancelled.value) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const cancelled = { value: false };
    fetchRumeur(cancelled);
    const interval = setInterval(() => fetchRumeur(cancelled), POLL_INTERVAL_MS);
    return () => {
      cancelled.value = true;
      clearInterval(interval);
    };
  }, [enabled, fetchRumeur]);

  return { data, loading, error };
}
