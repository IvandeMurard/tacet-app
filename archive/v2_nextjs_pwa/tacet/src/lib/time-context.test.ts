import { describe, it, expect } from "vitest";
import { isNightTime, getSensorTimeLabel, isChantierExpired } from "./time-context";

describe("isNightTime", () => {
  it("returns false at 19:59 (just before night start)", () => {
    expect(isNightTime(new Date("2026-03-19T19:59:00"))).toBe(false);
  });

  it("returns true at 20:00 (night start boundary)", () => {
    expect(isNightTime(new Date("2026-03-19T20:00:00"))).toBe(true);
  });

  it("returns true at 05:59 (before day start)", () => {
    expect(isNightTime(new Date("2026-03-19T05:59:00"))).toBe(true);
  });

  it("returns false at 06:00 (day start boundary)", () => {
    expect(isNightTime(new Date("2026-03-19T06:00:00"))).toBe(false);
  });

  it("returns false at 12:00 (midday)", () => {
    expect(isNightTime(new Date("2026-03-19T12:00:00"))).toBe(false);
  });
});

describe("getSensorTimeLabel", () => {
  it("returns 'maintenant' for a fresh reading (< 10 min ago)", () => {
    const now = new Date("2026-03-19T18:10:00");
    const timestamp = new Date(now.getTime() - 5 * 60 * 1000).toISOString(); // 18:05
    expect(getSensorTimeLabel(timestamp, now)).toBe("maintenant");
  });

  it("returns relative time string for a stale reading (> 10 min ago)", () => {
    const now = new Date("2026-03-19T20:00:00");
    const timestamp = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 18:00
    const label = getSensorTimeLabel(timestamp, now);
    expect(label).not.toBe("maintenant");
    expect(label.length).toBeGreaterThan(0);
  });

  it("returns relative time at exactly 10-min boundary (boundary is exclusive)", () => {
    const now = new Date("2026-03-19T18:10:00");
    const timestamp = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // exactly 18:00
    const label = getSensorTimeLabel(timestamp, now);
    // diff === 600_000ms is NOT < 600_000ms → falls through to relative time
    expect(label).not.toBe("maintenant");
  });

  it("returns 'maintenant' even in evening context when reading is fresh", () => {
    const now = new Date("2026-03-19T20:30:00");
    const timestamp = new Date(now.getTime() - 3 * 60 * 1000).toISOString(); // 20:27
    expect(getSensorTimeLabel(timestamp, now)).toBe("maintenant");
  });
});

describe("isChantierExpired", () => {
  it("returns true for a past date_fin", () => {
    expect(isChantierExpired("2024-01-01", new Date("2026-03-19"))).toBe(true);
  });

  it("returns false for a future date_fin", () => {
    expect(isChantierExpired("2027-01-01", new Date("2026-03-19"))).toBe(false);
  });

  it("returns false when date_fin is undefined", () => {
    expect(isChantierExpired(undefined, new Date("2026-03-19"))).toBe(false);
  });
});
