import { describe, it, expect } from "vitest";
import {
  NOISE_CATEGORIES,
  SERENITE_SCORES,
  PARIS_CENTER,
  DEFAULT_ZOOM,
  getNoiseCategory,
  getSereniteScore,
  getSereniteScoreFromDb,
  getNoiseCategoryFromDb,
  arLabel,
} from "./noise-categories";

describe("noise-categories", () => {
  describe("NOISE_CATEGORIES", () => {
    it("has 4 levels (1–4)", () => {
      expect(NOISE_CATEGORIES).toHaveLength(4);
      expect(NOISE_CATEGORIES.map((c) => c.level)).toEqual([1, 2, 3, 4]);
    });

    it("each category has label, color, description", () => {
      NOISE_CATEGORIES.forEach((cat) => {
        expect(cat.label).toBeTruthy();
        expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(cat.description).toBeTruthy();
      });
    });
  });

  describe("SERENITE_SCORES", () => {
    it("maps level 1–4 to scores in 0–100", () => {
      expect(SERENITE_SCORES[1]).toBe(85);
      expect(SERENITE_SCORES[2]).toBe(58);
      expect(SERENITE_SCORES[3]).toBe(28);
      expect(SERENITE_SCORES[4]).toBe(8);
      Object.values(SERENITE_SCORES).forEach((s) => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("getNoiseCategory", () => {
    it("returns category for level 1–4", () => {
      expect(getNoiseCategory(1)?.label).toBe("Calme");
      expect(getNoiseCategory(2)?.label).toBe("Modéré");
      expect(getNoiseCategory(3)?.label).toBe("Bruyant");
      expect(getNoiseCategory(4)?.label).toBe("Très Bruyant");
    });

    it("returns undefined for unknown level", () => {
      expect(getNoiseCategory(0)).toBeUndefined();
      expect(getNoiseCategory(5)).toBeUndefined();
    });
  });

  describe("getSereniteScore", () => {
    it("returns score for level 1–4", () => {
      expect(getSereniteScore(1)).toBe(85);
      expect(getSereniteScore(2)).toBe(58);
      expect(getSereniteScore(3)).toBe(28);
      expect(getSereniteScore(4)).toBe(8);
    });

    it("returns 0 for unknown level", () => {
      expect(getSereniteScore(0)).toBe(0);
      expect(getSereniteScore(99)).toBe(0);
    });
  });

  describe("getSereniteScoreFromDb", () => {
    it("50 dB → 100", () => {
      expect(getSereniteScoreFromDb(50)).toBe(100);
    });

    it("75 dB → 0", () => {
      expect(getSereniteScoreFromDb(75)).toBe(0);
    });

    it("clamps to 0–100", () => {
      expect(getSereniteScoreFromDb(30)).toBe(100);
      expect(getSereniteScoreFromDb(100)).toBe(0);
    });
  });

  describe("getNoiseCategoryFromDb", () => {
    it("lden < 55 → Calme", () => {
      expect(getNoiseCategoryFromDb(50).label).toBe("Calme");
      expect(getNoiseCategoryFromDb(54).label).toBe("Calme");
    });

    it("55 ≤ lden < 65 → Modéré", () => {
      expect(getNoiseCategoryFromDb(55).label).toBe("Modéré");
      expect(getNoiseCategoryFromDb(60).label).toBe("Modéré");
      expect(getNoiseCategoryFromDb(64).label).toBe("Modéré");
    });

    it("65 ≤ lden < 70 → Bruyant", () => {
      expect(getNoiseCategoryFromDb(65).label).toBe("Bruyant");
      expect(getNoiseCategoryFromDb(69).label).toBe("Bruyant");
    });

    it("lden ≥ 70 → Très Bruyant", () => {
      expect(getNoiseCategoryFromDb(70).label).toBe("Très Bruyant");
      expect(getNoiseCategoryFromDb(80).label).toBe("Très Bruyant");
    });
  });

  describe("arLabel", () => {
    it("1 → 1er", () => {
      expect(arLabel(1)).toBe("1er");
    });

    it("2–20 → 2e … 20e", () => {
      expect(arLabel(2)).toBe("2e");
      expect(arLabel(11)).toBe("11e");
      expect(arLabel(20)).toBe("20e");
    });
  });

  describe("constants", () => {
    it("PARIS_CENTER is [lng, lat]", () => {
      expect(PARIS_CENTER).toHaveLength(2);
      expect(PARIS_CENTER[0]).toBeGreaterThan(2);
      expect(PARIS_CENTER[0]).toBeLessThan(3);
      expect(PARIS_CENTER[1]).toBeGreaterThan(48);
      expect(PARIS_CENTER[1]).toBeLessThan(49);
    });

    it("DEFAULT_ZOOM is number", () => {
      expect(typeof DEFAULT_ZOOM).toBe("number");
      expect(DEFAULT_ZOOM).toBeGreaterThan(0);
    });
  });
});
