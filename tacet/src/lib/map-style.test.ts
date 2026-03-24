import { describe, it, expect } from "vitest";
import { getBaseMapStyle } from "./map-style";

describe("getBaseMapStyle", () => {
  const style = getBaseMapStyle();

  it("returns valid MapLibre style version 8", () => {
    expect(style.version).toBe(8);
  });

  it("includes protomaps vector source", () => {
    expect(style.sources).toHaveProperty("protomaps");
    const source = style.sources.protomaps as { type: string; url: string };
    expect(source.type).toBe("vector");
    expect(source.url).toContain("pmtiles://");
  });

  it("includes expected layers", () => {
    const layerIds = style.layers.map((l) => l.id);
    expect(layerIds).toContain("background");
    expect(layerIds).toContain("earth");
    expect(layerIds).toContain("water");
    expect(layerIds).toContain("roads");
  });

  it("has dark background color", () => {
    const bg = style.layers.find((l) => l.id === "background");
    expect(bg).toBeDefined();
    expect((bg as { paint: Record<string, string> }).paint["background-color"]).toBe("#1a1a1a");
  });

  it("includes OSM attribution", () => {
    const source = style.sources.protomaps as { attribution: string };
    expect(source.attribution).toContain("OpenStreetMap");
  });
});
