"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ChantiersResponse {
  data: Array<{
    geo_point_2d?: { lon: number; lat: number };
    adresse?: string;
    date_fin?: string;
    type_chantier?: string;
  }> | null;
  error: string | null;
  fallback: boolean;
  cachedAt: string | null;
}

export function useChantiersData(enabled: boolean) {
  return useSWR<ChantiersResponse>(
    enabled ? "/api/chantiers" : null,
    fetcher,
    { revalidateOnFocus: false }
  );
}
