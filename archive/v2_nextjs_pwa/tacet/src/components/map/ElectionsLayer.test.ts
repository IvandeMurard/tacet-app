import { describe, it, expect, vi, beforeEach } from "vitest";
import { addElectionsLayer, removeElectionsLayer } from "./ElectionsLayer";

type MapMock = {
  getSource: ReturnType<typeof vi.fn>;
  addSource: ReturnType<typeof vi.fn>;
  addLayer: ReturnType<typeof vi.fn>;
  getLayer: ReturnType<typeof vi.fn>;
  removeLayer: ReturnType<typeof vi.fn>;
  removeSource: ReturnType<typeof vi.fn>;
};

function makeMapMock(): MapMock {
  return {
    getSource: vi.fn().mockReturnValue(null),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getLayer: vi.fn().mockReturnValue(null),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
  };
}

const MOCK_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[2.3, 48.8], [2.4, 48.8], [2.4, 48.9], [2.3, 48.8]]] },
      properties: { c_ar: 8, lden_db: 71, noise_category: "Très bruyant" },
    },
    {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[2.1, 48.8], [2.2, 48.8], [2.2, 48.9], [2.1, 48.8]]] },
      properties: { c_ar: 16, lden_db: 61, noise_category: "Calme" },
    },
  ],
};

describe("addElectionsLayer", () => {
  let map: ReturnType<typeof makeMapMock>;

  beforeEach(() => {
    map = makeMapMock();
  });

  it("adds geojson source, fill layer, and line layer when source does not exist", () => {
    map.getSource.mockReturnValue(null);
    addElectionsLayer(map as never, MOCK_GEOJSON);
    expect(map.addSource).toHaveBeenCalledWith(
      "elections",
      expect.objectContaining({ type: "geojson", data: MOCK_GEOJSON }),
    );
    expect(map.addLayer).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calls = map.addLayer.mock.calls as any[][];
    const layerIds = calls.map((c) => c[0].id as string);
    expect(layerIds).toContain("elections-fill");
    expect(layerIds).toContain("elections-line");
  });

  it("adds a fill layer with type 'fill'", () => {
    map.getSource.mockReturnValue(null);
    addElectionsLayer(map as never, MOCK_GEOJSON);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fillCall = (map.addLayer.mock.calls as any[][]).find((c) => c[0].id === "elections-fill") as any[];
    expect(fillCall).toBeDefined();
    expect(fillCall[0].type).toBe("fill");
    expect(fillCall[0].source).toBe("elections");
  });

  it("adds a line layer with type 'line'", () => {
    map.getSource.mockReturnValue(null);
    addElectionsLayer(map as never, MOCK_GEOJSON);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lineCall = (map.addLayer.mock.calls as any[][]).find((c) => c[0].id === "elections-line") as any[];
    expect(lineCall).toBeDefined();
    expect(lineCall[0].type).toBe("line");
    expect(lineCall[0].source).toBe("elections");
  });

  it("colors layers by lden_db via an interpolate expression", () => {
    map.getSource.mockReturnValue(null);
    addElectionsLayer(map as never, MOCK_GEOJSON);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fillCall = (map.addLayer.mock.calls as any[][]).find((c) => c[0].id === "elections-fill") as any[];
    const fillColor = fillCall[0].paint?.["fill-color"];
    // Must be an interpolate expression referencing lden_db
    expect(Array.isArray(fillColor)).toBe(true);
    const expr = fillColor as unknown[];
    expect(expr[0]).toBe("interpolate");
    // Should reference lden_db property
    expect(JSON.stringify(expr)).toContain("lden_db");
  });

  it("is idempotent — no-op when source already exists", () => {
    map.getSource.mockReturnValue({}); // source already present
    addElectionsLayer(map as never, MOCK_GEOJSON);
    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.addLayer).not.toHaveBeenCalled();
  });
});

describe("removeElectionsLayer", () => {
  let map: ReturnType<typeof makeMapMock>;

  beforeEach(() => {
    map = makeMapMock();
  });

  it("removes fill layer, line layer, and source when all exist", () => {
    map.getLayer.mockReturnValue({});
    map.getSource.mockReturnValue({});
    removeElectionsLayer(map as never);
    expect(map.removeLayer).toHaveBeenCalledWith("elections-fill");
    expect(map.removeLayer).toHaveBeenCalledWith("elections-line");
    expect(map.removeSource).toHaveBeenCalledWith("elections");
  });

  it("is idempotent — no-op when nothing exists", () => {
    map.getLayer.mockReturnValue(null);
    map.getSource.mockReturnValue(null);
    removeElectionsLayer(map as never);
    expect(map.removeLayer).not.toHaveBeenCalled();
    expect(map.removeSource).not.toHaveBeenCalled();
  });

  it("removes source even if layers were already absent", () => {
    map.getLayer.mockReturnValue(null);
    map.getSource.mockReturnValue({});
    removeElectionsLayer(map as never);
    expect(map.removeLayer).not.toHaveBeenCalled();
    expect(map.removeSource).toHaveBeenCalledWith("elections");
  });
});
