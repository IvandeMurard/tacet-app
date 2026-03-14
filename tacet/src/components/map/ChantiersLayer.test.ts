import { describe, it, expect, vi, beforeEach } from "vitest";
import { addChantiersLayer, removeChantiersLayer } from "./ChantiersLayer";

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

const RECORDS = [
  { geo_point_2d: { lon: 2.3522, lat: 48.8566 }, adresse: "1 Rue de Rivoli", date_fin: "2026-06-01", type_chantier: "Voirie" },
  { geo_point_2d: { lon: 2.3600, lat: 48.8600 }, adresse: "5 Av. de l'Opéra", date_fin: "2026-09-30", type_chantier: "Réseaux" },
];

const MIXED_RECORDS = [
  ...RECORDS,
  // No geo_point_2d — should be filtered out
  { adresse: "No coords", date_fin: "2026-01-01", type_chantier: "Unknown" },
  // Partial geo_point_2d (zero lon) — should be filtered out
  { geo_point_2d: { lon: 0, lat: 0 }, adresse: "Zero island", date_fin: "", type_chantier: "" },
];

describe("addChantiersLayer", () => {
  let map: ReturnType<typeof makeMapMock>;

  beforeEach(() => {
    map = makeMapMock();
  });

  it("adds geojson source and circle layer when source does not yet exist", () => {
    map.getSource.mockReturnValue(null);
    addChantiersLayer(map as never, RECORDS);

    expect(map.addSource).toHaveBeenCalledWith(
      "chantiers",
      expect.objectContaining({ type: "geojson" })
    );
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "chantiers-circles", type: "circle" })
    );
  });

  it("calls setData instead of addSource when source already exists (idempotent update)", () => {
    const setData = vi.fn();
    map.getSource.mockReturnValue({ setData });
    addChantiersLayer(map as never, RECORDS);

    expect(setData).toHaveBeenCalled();
    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.addLayer).not.toHaveBeenCalled();
  });

  it("filters out records without valid geo_point_2d", () => {
    map.getSource.mockReturnValue(null);
    addChantiersLayer(map as never, MIXED_RECORDS);
    const geojson = map.addSource.mock.calls[0][1].data as GeoJSON.FeatureCollection;
    // Only the 2 records with valid coords should be included
    expect(geojson.features).toHaveLength(2);
  });

  it("includes adresse, date_fin, type_chantier in feature properties", () => {
    map.getSource.mockReturnValue(null);
    addChantiersLayer(map as never, RECORDS);
    const geojson = map.addSource.mock.calls[0][1].data as GeoJSON.FeatureCollection;
    expect(geojson.features[0].properties).toMatchObject({
      adresse: "1 Rue de Rivoli",
      date_fin: "2026-06-01",
      type_chantier: "Voirie",
    });
  });

  it("uses [lon, lat] coordinate order in GeoJSON features", () => {
    map.getSource.mockReturnValue(null);
    addChantiersLayer(map as never, RECORDS);
    const geojson = map.addSource.mock.calls[0][1].data as GeoJSON.FeatureCollection;
    const coords = (geojson.features[0].geometry as GeoJSON.Point).coordinates;
    expect(coords).toEqual([2.3522, 48.8566]); // [lon, lat]
  });

  it("produces a valid GeoJSON FeatureCollection", () => {
    map.getSource.mockReturnValue(null);
    addChantiersLayer(map as never, RECORDS);
    const geojson = map.addSource.mock.calls[0][1].data as GeoJSON.FeatureCollection;
    expect(geojson.type).toBe("FeatureCollection");
    expect(geojson.features[0].type).toBe("Feature");
    expect(geojson.features[0].geometry.type).toBe("Point");
  });

  it("handles empty records array without throwing", () => {
    map.getSource.mockReturnValue(null);
    expect(() => addChantiersLayer(map as never, [])).not.toThrow();
    const geojson = map.addSource.mock.calls[0][1].data as GeoJSON.FeatureCollection;
    expect(geojson.features).toHaveLength(0);
  });
});

describe("removeChantiersLayer", () => {
  let map: ReturnType<typeof makeMapMock>;

  beforeEach(() => {
    map = makeMapMock();
  });

  it("removes layer then source when both exist", () => {
    map.getLayer.mockReturnValue({});
    map.getSource.mockReturnValue({});
    removeChantiersLayer(map as never);

    expect(map.removeLayer).toHaveBeenCalledWith("chantiers-circles");
    expect(map.removeSource).toHaveBeenCalledWith("chantiers");
  });

  it("is idempotent — no-op when layer and source do not exist", () => {
    map.getLayer.mockReturnValue(null);
    map.getSource.mockReturnValue(null);
    removeChantiersLayer(map as never);

    expect(map.removeLayer).not.toHaveBeenCalled();
    expect(map.removeSource).not.toHaveBeenCalled();
  });

  it("removes source even if layer was already absent", () => {
    map.getLayer.mockReturnValue(null);
    map.getSource.mockReturnValue({});
    removeChantiersLayer(map as never);

    expect(map.removeLayer).not.toHaveBeenCalled();
    expect(map.removeSource).toHaveBeenCalledWith("chantiers");
  });
});
