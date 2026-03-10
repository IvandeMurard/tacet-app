import { describe, it, expect } from "vitest";
import { photonFeatureToDisplay, photonFeatureToCoords, PhotonFeature } from "./usePhotonSearch";

describe("usePhotonSearch utility functions", () => {
  describe("photonFeatureToDisplay", () => {
    const baseFeature: PhotonFeature = {
      type: "feature",
      geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
      properties: {},
    };

    it("formats a full address with street, housenumber, and district", () => {
      const feature: PhotonFeature = {
        ...baseFeature,
        properties: {
          street: "Rue de Rivoli",
          housenumber: "10",
          district: "1er Arrondissement",
          city: "Paris",
          state: "Île-de-France",
        },
      };
      expect(photonFeatureToDisplay(feature)).toBe("Rue de Rivoli, 10, 1er Arrondissement");
    });

    it("falls back to name if street is missing", () => {
      const feature: PhotonFeature = {
        ...baseFeature,
        properties: {
          name: "Tour Eiffel",
          housenumber: "5",
          district: "7e Arrondissement",
        },
      };
      expect(photonFeatureToDisplay(feature)).toBe("Tour Eiffel, 5, 7e Arrondissement");
    });

    it("falls back to city if district is missing", () => {
      const feature: PhotonFeature = {
        ...baseFeature,
        properties: {
          street: "Avenue des Champs-Élysées",
          city: "Paris",
        },
      };
      expect(photonFeatureToDisplay(feature)).toBe("Avenue des Champs-Élysées, Paris");
    });

    it("falls back to state if district and city are missing", () => {
      const feature: PhotonFeature = {
        ...baseFeature,
        properties: {
          street: "Route de la Forêt",
          state: "Île-de-France",
        },
      };
      expect(photonFeatureToDisplay(feature)).toBe("Route de la Forêt, Île-de-France");
    });

    it("handles missing housenumber gracefully", () => {
      const feature: PhotonFeature = {
        ...baseFeature,
        properties: {
          street: "Boulevard Haussmann",
          district: "8e Arrondissement",
        },
      };
      expect(photonFeatureToDisplay(feature)).toBe("Boulevard Haussmann, 8e Arrondissement");
    });

    it("handles an empty properties object", () => {
      const feature: PhotonFeature = {
        ...baseFeature,
        properties: {},
      };
      // street ?? name ?? "" gives "", district ?? city ?? state gives undefined. filter(Boolean) removes empty strings and undefined.
      expect(photonFeatureToDisplay(feature)).toBe("");
    });

    it("handles only housenumber", () => {
      const feature: PhotonFeature = {
        ...baseFeature,
        properties: {
          housenumber: "42",
        },
      };
      expect(photonFeatureToDisplay(feature)).toBe("42");
    });
  });

  describe("photonFeatureToCoords", () => {
    it("extracts coordinates correctly", () => {
      const feature: PhotonFeature = {
        type: "feature",
        geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
        properties: {},
      };
      expect(photonFeatureToCoords(feature)).toEqual([2.3522, 48.8566]);
    });
  });
});
