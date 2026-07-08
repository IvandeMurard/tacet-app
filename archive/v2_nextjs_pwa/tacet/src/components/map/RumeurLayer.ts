import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import type { RumeurMeasurement } from "@/types/rumeur";

const SOURCE_ID = "rumeur";
const LAYER_ID = "rumeur-circles";

function toGeoJSON(measurements: RumeurMeasurement[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: measurements
      .filter((m) => typeof m.lat === "number" && typeof m.lon === "number")
      .map((m, i) => ({
        type: "Feature" as const,
        id: i,
        geometry: {
          type: "Point" as const,
          coordinates: [m.lon as number, m.lat as number],
        },
        properties: {
          stationId: m.stationId,
          timestamp: m.timestamp,
          leq: m.leq ?? null,
          lmin: m.lmin ?? null,
          lmax: m.lmax ?? null,
        },
      })),
  };
}

/**
 * Adds or updates the RUMEUR sensor layer on the map.
 * Idempotent: if source already exists, calls setData instead of re-adding.
 */
export function addRumeurLayer(map: MapLibreMap, measurements: RumeurMeasurement[]) {
  const data = toGeoJSON(measurements);

  if (map.getSource(SOURCE_ID)) {
    (map.getSource(SOURCE_ID) as GeoJSONSource).setData(data);
    return;
  }

  map.addSource(SOURCE_ID, { type: "geojson", data });

  map.addLayer({
    id: LAYER_ID,
    type: "circle",
    source: SOURCE_ID,
    paint: {
      // Encode current noise level (leq) as color so users can
      // visually distinguish quieter vs louder sensors at a glance.
      "circle-color": [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "leq"], 0],
        40,
        "#22c55e", // ~calm
        55,
        "#eab308", // moderate
        70,
        "#f97316", // loud
        85,
        "#ef4444", // very loud
      ],
      "circle-radius": 9,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.9,
    },
  });
}

/**
 * Removes the RUMEUR sensor layer and source from the map.
 * Idempotent: safe to call even if layer/source were never added.
 */
export function removeRumeurLayer(map: MapLibreMap) {
  if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}
