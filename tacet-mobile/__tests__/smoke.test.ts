// Smoke test — confirms jest-expo is wired and the test harness runs.
// No native modules exercised here; native rendering is validated via EAS build.
describe("tacet-mobile scaffold", () => {
  it("test harness runs", () => {
    expect(true).toBe(true);
  });

  it("PMTILES_STYLE exports a valid style object", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PMTILES_STYLE } = require("../constants/mapStyle");
    expect(PMTILES_STYLE.version).toBe(8);
    expect(PMTILES_STYLE.sources.protomaps.url).toMatch(/^pmtiles:\/\//);
    expect(Array.isArray(PMTILES_STYLE.layers)).toBe(true);
    expect(PMTILES_STYLE.layers.length).toBeGreaterThan(0);
  });
});
