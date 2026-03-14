import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "./format-date";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fix "now" to a known point in time
    vi.setSystemTime(new Date("2026-03-13T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty string for null", () => {
    expect(formatRelativeTime(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(formatRelativeTime(undefined)).toBe("");
  });

  it("returns 'à l\\'instant' for timestamps less than 1 minute ago", () => {
    const thirtySecondsAgo = new Date("2026-03-13T11:59:30.000Z").toISOString();
    expect(formatRelativeTime(thirtySecondsAgo)).toBe("à l'instant");
  });

  it("returns 'à l\\'instant' for timestamps in the future (clock drift)", () => {
    const futureTs = new Date("2026-03-13T12:00:05.000Z").toISOString();
    expect(formatRelativeTime(futureTs)).toBe("à l'instant");
  });

  it("returns relative minutes for timestamps 1-59 minutes ago", () => {
    const twoMinAgo = new Date("2026-03-13T11:58:00.000Z").toISOString();
    const result = formatRelativeTime(twoMinAgo);
    // Intl.RelativeTimeFormat("fr", { numeric: "always", style: "short" }) for -2 minutes
    expect(result).toMatch(/2.+min/);
  });

  it("returns relative hours for timestamps 1-23 hours ago", () => {
    const twoHoursAgo = new Date("2026-03-13T10:00:00.000Z").toISOString();
    const result = formatRelativeTime(twoHoursAgo);
    expect(result).toMatch(/2.+h/);
  });

  it("returns relative days for timestamps 24+ hours ago", () => {
    const twoDaysAgo = new Date("2026-03-11T12:00:00.000Z").toISOString();
    const result = formatRelativeTime(twoDaysAgo);
    expect(result).toMatch(/2.+j/);
  });

  it("returns exactly 1 minute for 60 second timestamps", () => {
    const oneMinAgo = new Date("2026-03-13T11:59:00.000Z").toISOString();
    const result = formatRelativeTime(oneMinAgo);
    expect(result).toMatch(/1.+min/);
  });
});
