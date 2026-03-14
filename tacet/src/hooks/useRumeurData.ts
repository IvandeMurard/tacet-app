"use client";

import useSWR from "swr";
import type { RumeurResponse } from "@/types/rumeur";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Fetches RUMEUR sensor data from /api/rumeur via SWR.
 *
 * @param enabled - Pass `true` when the RUMEUR layer is toggled on.
 *   Setting to `false` nulls the SWR key, pausing polling (AC: "polling can pause").
 *
 * Refresh interval mirrors the server-side 3-min cache (NFR-SC2): no benefit in
 * fetching more often than the server refreshes.
 */
export function useRumeurData(enabled: boolean) {
  return useSWR<RumeurResponse>(
    enabled ? "/api/rumeur" : null,
    fetcher,
    {
      refreshInterval: 180_000, // 3 minutes — mirrors server-side cache TTL
      revalidateOnFocus: false,  // avoid spurious upstream requests on tab focus
    },
  );
}
