"use client";

import { useEffect, useRef } from "react";
import { useMapContext } from "@/contexts/MapContext";
import type { IrisProperties } from "@/types/iris";

const GEOJSON_URL = "/data/paris-noise-iris.geojson";

/**
 * Reads a `?zone=CODE_IRIS` deep-link URL parameter on first mount.
 * If present, fetches the GeoJSON data, finds the matching IRIS feature,
 * and opens its IrisPopup via setSelectedZone.
 *
 * Implements Story 2.4: shareable zone deep-link URLs.
 * Takes priority over useRestoreLastZone (which checks for this param and skips).
 */
export function useZoneDeepLink(): void {
  const { setSelectedZone } = useMapContext();
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (resolvedRef.current) return;
    const code = new URLSearchParams(window.location.search).get("zone");
    if (!code) return;

    resolvedRef.current = true;

    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((geojson: GeoJSON.FeatureCollection) => {
        const feature = geojson.features.find(
          (f) => f.properties?.code_iris === code
        );
        if (feature?.properties) {
          setSelectedZone(feature.properties as IrisProperties);
        }
      })
      .catch(() => {
        // Deep-link silently no-ops if GeoJSON is unavailable (e.g. fully offline)
      });
  }, [setSelectedZone]);
}
