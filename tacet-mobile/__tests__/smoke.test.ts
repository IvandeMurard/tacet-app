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
