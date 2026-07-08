import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RumeurPopup } from "./RumeurPopup";
import type { RumeurFeatureProperties } from "@/types/rumeur";

// Fix the clock so formatRelativeTime returns predictable output
const MOCK_NOW = new Date("2026-03-14T12:00:00Z").getTime();
const TIMESTAMP_2MIN_AGO = new Date(MOCK_NOW - 2 * 60 * 1000).toISOString();

beforeEach(() => {
  vi.setSystemTime(MOCK_NOW);
});

function makeProps(overrides: Partial<RumeurFeatureProperties> = {}): RumeurFeatureProperties {
  return {
    stationId: "FR17_001",
    timestamp: TIMESTAMP_2MIN_AGO,
    leq: 55.3,
    lmin: 48.0,
    lmax: 62.7,
    ...overrides,
  };
}

describe("RumeurPopup", () => {
  it("renders the station ID", () => {
    render(<RumeurPopup properties={makeProps()} onClose={vi.fn()} />);
    expect(screen.getByText(/FR17_001/)).toBeDefined();
  });

  it("renders leq rounded to integer with dB unit", () => {
    render(<RumeurPopup properties={makeProps({ leq: 55.3 })} onClose={vi.fn()} />);
    // Math.round(55.3) = 55; displayed as "55 dB"
    expect(screen.getByText(/55 dB/)).toBeDefined();
  });

  it("renders lmin and lmax range when both are non-null", () => {
    render(<RumeurPopup properties={makeProps({ lmin: 48, lmax: 63 })} onClose={vi.fn()} />);
    expect(screen.getByText(/48 dB/)).toBeDefined();
    expect(screen.getByText(/63 dB/)).toBeDefined();
  });

  it("does not render Min/Max section when lmin and lmax are null", () => {
    render(<RumeurPopup properties={makeProps({ lmin: null, lmax: null })} onClose={vi.fn()} />);
    expect(screen.queryByText(/^Min$/i)).toBeNull();
    expect(screen.queryByText(/^Max$/i)).toBeNull();
  });

  it("renders a formatted relative timestamp — not the raw ISO string", () => {
    render(<RumeurPopup properties={makeProps({ timestamp: TIMESTAMP_2MIN_AGO })} onClose={vi.fn()} />);
    // formatRelativeTime should produce something like "il y a 2 min."
    expect(screen.getByText(/il y a/i)).toBeDefined();
    // The raw ISO string must NOT appear
    expect(screen.queryByText(TIMESTAMP_2MIN_AGO)).toBeNull();
  });

  it("renders 'Niveau non disponible' when leq is null", () => {
    render(<RumeurPopup properties={makeProps({ leq: null })} onClose={vi.fn()} />);
    expect(screen.getByText(/non disponible/i)).toBeDefined();
  });

  it("close button calls onClose", () => {
    const onClose = vi.fn();
    render(<RumeurPopup properties={makeProps()} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape key on the popup calls onClose", () => {
    const onClose = vi.fn();
    render(<RumeurPopup properties={makeProps()} onClose={onClose} />);
    // keydown is attached to the dialog element and bubbles from focusables
    const closeBtn = screen.getByRole("button", { name: /fermer/i });
    fireEvent.keyDown(closeBtn, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has role='dialog', aria-modal and accessible label", () => {
    render(<RumeurPopup properties={makeProps()} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const label = dialog.getAttribute("aria-label") ?? "";
    expect(/capteur|rumeur/i.test(label)).toBe(true);
  });
});
