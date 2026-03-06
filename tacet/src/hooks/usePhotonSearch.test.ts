import { describe, it, expect } from "vitest";
import { photonFeatureToDisplay, photonFeatureToCoords, type PhotonFeature } from "./usePhotonSearch";

const makeFeature = (overrides: Partial<PhotonFeature["properties"]> = {}): PhotonFeature => ({
  type: "feature",
  geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
  properties: {
    name: "Tour Eiffel",
    street: "Avenue Anatole France",
    housenumber: "5",
    city: "Paris",
    district: "7e Arrondissement",
    ...overrides,
  },
});

describe("photonFeatureToDisplay", () => {
  it("formats street + housenumber + district", () => {
    const f = makeFeature();
    const display = photonFeatureToDisplay(f);
    expect(display).toBe("Avenue Anatole France, 5, 7e Arrondissement");
  });

  it("falls back to name when no street", () => {
    const f = makeFeature({ street: undefined });
    const display = photonFeatureToDisplay(f);
    expect(display).toBe("Tour Eiffel, 5, 7e Arrondissement");
  });

  it("falls back to city when no district", () => {
    const f = makeFeature({ district: undefined });
    const display = photonFeatureToDisplay(f);
    expect(display).toBe("Avenue Anatole France, 5, Paris");
  });

  it("handles minimal properties", () => {
    const f = makeFeature({
      name: undefined,
      street: undefined,
      housenumber: undefined,
      city: undefined,
      district: undefined,
      state: "Île-de-France",
    });
    const display = photonFeatureToDisplay(f);
    expect(display).toBe("Île-de-France");
  });
});

describe("photonFeatureToCoords", () => {
  it("returns geometry coordinates", () => {
    const f = makeFeature();
    expect(photonFeatureToCoords(f)).toEqual([2.3522, 48.8566]);
  });
});
