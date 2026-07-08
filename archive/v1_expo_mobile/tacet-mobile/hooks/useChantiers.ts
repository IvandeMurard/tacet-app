import { useEffect, useState } from "react";
import type { ChantiersResponse } from "@/types/chantier";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://tacet.vercel.app";

interface UseChantiersResult {
  data: ChantiersResponse | null;
  loading: boolean;
  error: string | null;
}

export function useChantiers(enabled: boolean): UseChantiersResult {
  const [data, setData] = useState<ChantiersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);

    fetch(`${API_BASE}/api/chantiers`)
      .then((res) => {
        if (!res.ok) throw new Error(`Chantiers: ${res.status}`);
        return res.json() as Promise<ChantiersResponse>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Chantiers indisponibles");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { data, loading, error };
}
