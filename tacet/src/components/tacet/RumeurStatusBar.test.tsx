import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { RumeurStatusBar } from "./RumeurStatusBar";

// Fix "now" for deterministic relative-time output
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-13T12:00:00.000Z"));
  // Default: online
  Object.defineProperty(navigator, "onLine", { value: true, writable: true, configurable: true });
});

afterEach(() => {
  vi.useRealTimers();
});

const CACHED_AT_2MIN = new Date("2026-03-13T11:58:00.000Z").toISOString();

describe("RumeurStatusBar", () => {
  it("renders nothing while loading (no cachedAt, no error)", () => {
    const { container } = render(
      <RumeurStatusBar cachedAt={null} error={null} fallback={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows live timestamp message when data is available", () => {
    render(<RumeurStatusBar cachedAt={CACHED_AT_2MIN} error={null} fallback={false} />);
    const el = screen.getByRole("status");
    expect(el.textContent).toMatch(/Capteurs/);
    expect(el.textContent).toMatch(/mis à jour/);
    expect(el.textContent).toMatch(/2.+min/);
  });

  it("shows 'indisponibles' message on error with no fallback data", () => {
    render(
      <RumeurStatusBar cachedAt={null} error="Bruitparif API: 502" fallback={false} />
    );
    const el = screen.getByRole("status");
    expect(el.textContent).toMatch(/indisponibles/i);
  });

  it("shows amber fallback message on error with fallback data", () => {
    render(
      <RumeurStatusBar cachedAt={CACHED_AT_2MIN} error="Bruitparif API: 502" fallback={true} />
    );
    const el = screen.getByRole("status");
    expect(el.textContent).toMatch(/cache/i);
    expect(el.textContent).toMatch(/2.+min/);
  });

  it("shows 'données en cache' when offline and cachedAt is present", async () => {
    Object.defineProperty(navigator, "onLine", { value: false, writable: true, configurable: true });
    render(<RumeurStatusBar cachedAt={CACHED_AT_2MIN} error={null} fallback={false} />);

    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });

    const el = screen.getByRole("status");
    expect(el.textContent).toMatch(/cache/i);
  });

  it("shows 'données en cache' without timestamp when offline and no cachedAt", async () => {
    Object.defineProperty(navigator, "onLine", { value: false, writable: true, configurable: true });
    render(<RumeurStatusBar cachedAt={null} error={null} fallback={false} />);

    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });

    // Should show something about cache/offline even without timestamp
    const el = screen.getByRole("status");
    expect(el.textContent).toMatch(/cache/i);
  });

  it("shows amber fallback message on error with fallback=true but no cachedAt (M2 edge case)", () => {
    render(
      <RumeurStatusBar cachedAt={null} error="Bruitparif API: 502" fallback={true} />
    );
    const el = screen.getByRole("status");
    // Must show amber indicator — not silently render nothing
    expect(el.textContent).toMatch(/cache/i);
    // No timestamp since cachedAt is absent
    expect(el.textContent).not.toMatch(/min|h\.|j\./);
  });

  it("has aria-live='polite' for accessibility", () => {
    render(<RumeurStatusBar cachedAt={CACHED_AT_2MIN} error={null} fallback={false} />);
    const el = screen.getByRole("status");
    expect(el.getAttribute("aria-live")).toBe("polite");
  });
});
