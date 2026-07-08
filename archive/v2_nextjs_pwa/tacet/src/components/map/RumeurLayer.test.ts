import { describe, it, expect, vi, beforeEach } from "vitest";
import { addRumeurLayer, removeRumeurLayer } from "./RumeurLayer";
import type { RumeurMeasurement } from "@/types/rumeur";

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

const WITH_COORDS: RumeurMeasurement[] = [
  { stationId: "s1", timestamp: "2026-01-01T00:00:00Z", leq: 55.2, lat: 48.8566, lon: 2.3522 },
  { stationId: "s2", timestamp: "2026-01-01T00:00:00Z", leq: 62.1, lat: 48.8600, lon: 2.3600 },
];

const MIXED: RumeurMeasurement[] = [
  ...WITH_COORDS,
  // No lat/lon — should be filtered out
  { stationId: "s3", timestamp: "2026-01-01T00:00:00Z", leq: 48.0 },
];

describe("addRumeurLayer", () => {
  let map: ReturnType<typeof makeMapMock>;

  beforeEach(() => {
    map = makeMapMock();
  });

  it("adds geojson source and circle layer when source does not yet exist", () => {
    map.getSource.mockReturnValue(null);
    addRumeurLayer(map as never, WITH_COORDS);
    expect(map.addSource).toHaveBeenCalledWith(
      "rumeur",
      expect.objectContaining({ type: "geojson" }),
    );
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "rumeur-circles", type: "circle" }),
    );
  });

  it("configures circle-color as a leq-based interpolation expression", () => {
    map.getSource.mockReturnValue(null);
    addRumeurLayer(map as never, WITH_COORDS);
    const layerConfig = map.addLayer.mock.calls[0][0] as {
      paint?: Record<string, unknown>;
    };
    expect(layerConfig.paint).toBeDefined();
    const color = layerConfig.paint?.["circle-color"];
    expect(Array.isArray(color)).toBe(true);
    // First elements of the expression should be ["interpolate", ["linear"], ["coalesce", ["get", "leq"], 0], ...]
    const expr = color as unknown[];
    expect(expr[0]).toBe("interpolate");
    expect(expr[1]).toEqual(["linear"]);
    expect(expr[2]).toEqual(["coalesce", ["get", "leq"], 0]);
  });

  it("calls setData instead of addSource when source already exists (idempotent update)", () => {
    const setData = vi.fn();
    map.getSource.mockReturnValue({ setData });
    addRumeurLayer(map as never, WITH_COORDS);
    expect(setData).toHaveBeenCalled();
    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.addLayer).not.toHaveBeenCalled();
  });

  it("filters out measurements without lat/lon before building GeoJSON", () => {
    map.getSource.mockReturnValue(null);
    addRumeurLayer(map as never, MIXED);
    const geojson = map.addSource.mock.calls[0][1].data as GeoJSON.FeatureCollection;
    expect(geojson.features).toHaveLength(2); // s3 has no coords → excluded
  });

  it("includes stationId, leq, timestamp in feature properties", () => {
    map.getSource.mockReturnValue(null);
    addRumeurLayer(map as never, WITH_COORDS);
    const geojson = map.addSource.mock.calls[0][1].data as GeoJSON.FeatureCollection;
    expect(geojson.features[0].properties).toMatchObject({
      stationId: "s1",
      leq: 55.2,
      timestamp: "2026-01-01T00:00:00Z",
    });
  });

  it("uses [lon, lat] coordinate order in GeoJSON features", () => {
    map.getSource.mockReturnValue(null);
    addRumeurLayer(map as never, WITH_COORDS);
    const geojson = map.addSource.mock.calls[0][1].data as GeoJSON.FeatureCollection;
    const coords = (geojson.features[0].geometry as GeoJSON.Point).coordinates;
    expect(coords).toEqual([2.3522, 48.8566]); // [lon, lat]
  });
});

describe("removeRumeurLayer", () => {
  let map: ReturnType<typeof makeMapMock>;

  beforeEach(() => {
    map = makeMapMock();
  });

  it("removes layer then source when both exist", () => {
    map.getLayer.mockReturnValue({});
    map.getSource.mockReturnValue({});
    removeRumeurLayer(map as never);
    expect(map.removeLayer).toHaveBeenCalledWith("rumeur-circles");
    expect(map.removeSource).toHaveBeenCalledWith("rumeur");
  });

  it("is idempotent — no-op when layer and source do not exist", () => {
    map.getLayer.mockReturnValue(null);
    map.getSource.mockReturnValue(null);
    removeRumeurLayer(map as never);
    expect(map.removeLayer).not.toHaveBeenCalled();
    expect(map.removeSource).not.toHaveBeenCalled();
  });

  it("removes source even if layer was already absent", () => {
    map.getLayer.mockReturnValue(null);
    map.getSource.mockReturnValue({});
    removeRumeurLayer(map as never);
    expect(map.removeLayer).not.toHaveBeenCalled();
    expect(map.removeSource).toHaveBeenCalledWith("rumeur");
  });
});
