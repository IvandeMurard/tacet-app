"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Chantiers fetch failed: ${res.status}`);
  return res.json();
};

export interface ChantiersResponse {
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
