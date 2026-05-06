// PMTiles style JSON for MapLibre Native's built-in PMTiles reader.
// The pmtiles:// URL MUST be inside the style JSON object — NOT passed directly
// as a MapView prop. This is the fix for the iOS NSUrl crash (issue #618, PR #625).

export const PMTILES_STYLE = {
  version: 8,
  glyphs:
    "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/dark",
  sources: {
    protomaps: {
      type: "vector",
      url: "pmtiles://https://build.protomaps.com/20240828.pmtiles",
      attribution: "© Protomaps, © OpenStreetMap",
    },
  },
  layers: [
    // Background
    { id: "background", type: "background", paint: { "background-color": "#0a0a0a" } },
    // Earth / landcover
    {
      id: "earth",
      type: "fill",
      source: "protomaps",
      "source-layer": "earth",
      paint: { "fill-color": "#1a1a1a" },
    },
    // Water
    {
      id: "water",
      type: "fill",
      source: "protomaps",
      "source-layer": "water",
      paint: { "fill-color": "#0d1b2a" },
    },
    // Natural (parks, green spaces)
    {
      id: "natural_wood",
      type: "fill",
      source: "protomaps",
      "source-layer": "natural",
      paint: { "fill-color": "#141f14" },
    },
    // Buildings
    {
      id: "buildings",
      type: "fill",
      source: "protomaps",
      "source-layer": "buildings",
      paint: { "fill-color": "#2a2a2a", "fill-outline-color": "#333" },
    },
    // Roads — minor
    {
      id: "roads_minor",
      type: "line",
      source: "protomaps",
      "source-layer": "roads",
      filter: ["in", ["get", "pmap:kind"], ["literal", ["minor_road", "service"]]],
      paint: { "line-color": "#333", "line-width": 1 },
    },
    // Roads — major
    {
      id: "roads_major",
      type: "line",
      source: "protomaps",
      "source-layer": "roads",
      filter: ["in", ["get", "pmap:kind"], ["literal", ["highway", "major_road", "medium_road"]]],
      paint: { "line-color": "#444", "line-width": 2 },
    },
    // Place labels
    {
      id: "places",
      type: "symbol",
      source: "protomaps",
      "source-layer": "places",
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 12,
        "text-max-width": 10,
      },
      paint: { "text-color": "#aaa", "text-halo-color": "#0a0a0a", "text-halo-width": 1 },
    },
  ],
};
