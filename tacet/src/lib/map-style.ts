import type { StyleSpecification } from "maplibre-gl";

/**
 * Minimal dark base style using PMTiles (Protomaps) — no API key.
 * Used by MapContainer for Story 1.2.
 */
const PMTILES_BASE_URL = "https://build.protomaps.com/20231028.pmtiles";

export function getBaseMapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${PMTILES_BASE_URL}`,
        attribution:
          '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#1a1a1a" },
      },
      {
        id: "earth",
        type: "fill",
        source: "protomaps",
        "source-layer": "earth",
        paint: { "fill-color": "#2d2d2d" },
      },
      {
        id: "water",
        type: "fill",
        source: "protomaps",
        "source-layer": "water",
        paint: { "fill-color": "#1e3a5f" },
      },
      {
        id: "landuse",
        type: "fill",
        source: "protomaps",
        "source-layer": "landuse",
        paint: { "fill-color": "#252525", "fill-opacity": 0.6 },
      },
      {
        id: "roads",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        paint: {
          "line-color": "#404040",
          "line-width": 1,
        },
      },
    ],
  };
}
