import type { Map as MapLibreMap } from "maplibre-gl";

const SOURCE_ID = "elections";
const LAYER_FILL_ID = "elections-fill";
const LAYER_LINE_ID = "elections-line";

/**
 * Color expression: interpolate arrondissement color from Lden noise level (dB).
 * Uses the same visual scale as the IRIS choropleth but applied at arrondissement granularity.
 *
 * 61 dB (quietest in Paris) → green  (#4ade80)
 * 65 dB                     → amber  (#fbbf24)
 * 68 dB                     → red    (#f87171)
 * 71 dB (loudest in Paris)  → purple (#c084fc)
 */
const colorByDb: unknown = [
  "interpolate",
  ["linear"],
  ["get", "lden_db"],
  61, "#4ade80",
  65, "#fbbf24",
  68, "#f87171",
  71, "#c084fc",
];

/**
 * Adds the Elections 2026 thematic layer to the map.
 *
 * Shows 20 arrondissement polygons colored by noise level (Lden dB),
 * providing macro-level electoral context overlaid on the IRIS choropleth.
 *
 * Idempotent: no-op if the source already exists.
 * @param map - The MapLibre map instance
 * @param data - The arrondissements GeoJSON FeatureCollection
 */
export function addElectionsLayer(map: MapLibreMap, data: GeoJSON.FeatureCollection) {
  // Already added — no-op (static data never changes)
  if (map.getSource(SOURCE_ID)) return;

  map.addSource(SOURCE_ID, { type: "geojson", data });

  // Semi-transparent fill — IRIS layer stays visible underneath
  map.addLayer({
    id: LAYER_FILL_ID,
    type: "fill",
    source: SOURCE_ID,
    paint: {
      "fill-color": colorByDb as string,
      "fill-opacity": 0.18,
    },
  });

  // Colored border for clear arrondissement boundaries
  map.addLayer({
    id: LAYER_LINE_ID,
    type: "line",
    source: SOURCE_ID,
    paint: {
      "line-color": colorByDb as string,
      "line-width": 2.5,
      "line-opacity": 0.8,
    },
  });
}

/**
 * Removes the Elections layer and source from the map.
 * Idempotent: safe to call even if the layers were never added.
 */
export function removeElectionsLayer(map: MapLibreMap) {
  if (map.getLayer(LAYER_FILL_ID)) map.removeLayer(LAYER_FILL_ID);
  if (map.getLayer(LAYER_LINE_ID)) map.removeLayer(LAYER_LINE_ID);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}
