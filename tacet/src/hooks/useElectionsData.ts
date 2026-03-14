"use client";

import useSWR from "swr";

const ELECTIONS_GEOJSON_URL = "/data/paris-noise-arrondissements.geojson";

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<GeoJSON.FeatureCollection>);

/**
 * Loads the Elections 2026 arrondissement GeoJSON for the map layer.
 *
 * Uses the static `/data/paris-noise-arrondissements.geojson` file
 * (20 arrondissement polygons with lden_db and noise_category properties).
 *
 * @param enabled - Pass `true` when the Elections layer is toggled on.
 *   Setting to `false` nulls the SWR key, suppressing the fetch.
 *
 * No refresh interval needed — the data is static.
 */
export function useElectionsData(enabled: boolean) {
  return useSWR<GeoJSON.FeatureCollection>(
    enabled ? ELECTIONS_GEOJSON_URL : null,
    fetcher,
    {
      refreshInterval: 0, // static data — no refresh needed
      revalidateOnFocus: false,
    },
  );
}
