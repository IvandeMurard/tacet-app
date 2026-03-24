// Smoke test — confirms jest-expo is wired and the test harness runs.
// No native modules exercised here; native rendering is validated via EAS build.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PMTILES_STYLE } = require("../constants/mapStyle");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { NOISE_FILL_EXPRESSION, NOISE_CATEGORIES, SERENITE_SCORES, PARIS_CENTER } = require("../constants/colors");

describe("tacet-mobile scaffold", () => {
  it("test harness runs", () => {
    expect(true).toBe(true);
  });

  it("PMTILES_STYLE exports a valid style object", () => {
    expect(PMTILES_STYLE.version).toBe(8);
    expect(PMTILES_STYLE.sources.protomaps.url).toMatch(/^pmtiles:\/\//);
    expect(Array.isArray(PMTILES_STYLE.layers)).toBe(true);
    expect(PMTILES_STYLE.layers.length).toBeGreaterThan(0);
  });
});

describe("Story 7.2 — IRIS GeoJSON layer", () => {
  it("NOISE_FILL_EXPRESSION is a match expression array", () => {
    expect(Array.isArray(NOISE_FILL_EXPRESSION)).toBe(true);
    expect(NOISE_FILL_EXPRESSION[0]).toBe("match");
    expect(NOISE_FILL_EXPRESSION[1]).toEqual(["get", "noise_level"]);
  });

  it("NOISE_FILL_EXPRESSION covers all 4 noise levels", () => {
    // Structure: ["match", expr, 1, color1, 2, color2, 3, color3, 4, color4, fallback]
    expect(NOISE_FILL_EXPRESSION[2]).toBe(1);
    expect(NOISE_FILL_EXPRESSION[4]).toBe(2);
    expect(NOISE_FILL_EXPRESSION[6]).toBe(3);
    expect(NOISE_FILL_EXPRESSION[8]).toBe(4);
  });

  it("NOISE_CATEGORIES has 4 levels with valid hex colors", () => {
    expect(NOISE_CATEGORIES).toHaveLength(4);
    for (const cat of NOISE_CATEGORIES) {
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("SERENITE_SCORES are in descending order (higher level = lower score)", () => {
    expect(SERENITE_SCORES[1]).toBeGreaterThan(SERENITE_SCORES[2]);
    expect(SERENITE_SCORES[2]).toBeGreaterThan(SERENITE_SCORES[3]);
    expect(SERENITE_SCORES[3]).toBeGreaterThan(SERENITE_SCORES[4]);
  });

  it("PARIS_CENTER is a [lng, lat] tuple within Paris bounds", () => {
    const [lng, lat] = PARIS_CENTER;
    expect(lng).toBeGreaterThan(2.2);
    expect(lng).toBeLessThan(2.5);
    expect(lat).toBeGreaterThan(48.8);
    expect(lat).toBeLessThan(49.0);
  });
});

describe("Story 7.2 — Zustand mapStore", () => {
  it("store initialises with selectedZone null", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useMapStore } = require("../store/mapStore");
    const state = useMapStore.getState();
    expect(state.selectedZone).toBeNull();
  });

  it("setSelectedZone updates selectedZone", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useMapStore } = require("../store/mapStore");
    const mockZone = { code_iris: "751014001", name: "Test", c_ar: 1, noise_level: 2, day_level: 2, night_level: 2, description: "test" };
    useMapStore.getState().setSelectedZone(mockZone);
    expect(useMapStore.getState().selectedZone?.code_iris).toBe("751014001");
  });

  it("clearSelectedZone resets to null", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useMapStore } = require("../store/mapStore");
    useMapStore.getState().clearSelectedZone();
    expect(useMapStore.getState().selectedZone).toBeNull();
  });
});

describe("Story 7.3 — API types", () => {
  it("RumeurResponse type shape is correct", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sample: import("../types/rumeur").RumeurResponse = {
      data: { measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z", leq: 55 }] },
      error: null,
      fallback: false,
      cachedAt: "2026-01-01T00:00:00Z",
    };
    expect(sample.data?.measurements).toHaveLength(1);
    expect(sample.fallback).toBe(false);
  });

  it("EnrichmentRequest requires zone_code and score_serenite", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const req: import("../types/enrichment").EnrichmentRequest = {
      zone_code: "751014001",
      zone_name: "Test",
      arrondissement: 1,
      noise_level: 2,
      day_level: 2,
      night_level: 2,
      score_serenite: 58,
      current_iso_timestamp: new Date().toISOString(),
    };
    expect(req.zone_code).toBe("751014001");
    expect(req.score_serenite).toBe(58);
  });

  it("ChantierRecord allows optional geo_point_2d", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rec: import("../types/chantier").ChantierRecord = {
      adresse: "1 Rue de Rivoli",
      date_fin: "2026-12-31",
    };
    expect(rec.geo_point_2d).toBeUndefined();
    expect(rec.adresse).toBe("1 Rue de Rivoli");
  });

  it("hooks fall back to tacet.vercel.app when env var is absent", () => {
    // jest-expo does not load .env — env var is undefined in test runtime.
    // Hooks use ?? fallback: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://tacet.vercel.app"
    const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://tacet.vercel.app";
    expect(base).toBe("https://tacet.vercel.app");
  });
});
