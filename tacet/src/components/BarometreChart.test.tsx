import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BarometreChart, type ArrProperties } from "./BarometreChart";

// Mock navigator.share so share button test doesn't throw in jsdom
beforeEach(() => {
  Object.defineProperty(navigator, "share", {
    value: undefined,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
});

const SAMPLE: ArrProperties[] = [
  { c_ar: 16, nom: "Paris 16e Arrondissement", l_ar: "16e Ardt", lden_db: 61, noise_category: "Calme" },
  { c_ar: 8,  nom: "Paris 8e Arrondissement",  l_ar: "8e Ardt",  lden_db: 71, noise_category: "Très bruyant" },
  { c_ar: 14, nom: "Paris 14e Arrondissement", l_ar: "14e Ardt", lden_db: 62, noise_category: "Calme" },
];

describe("BarometreChart", () => {
  it("renders arrondissement labels from props without a loading spinner", () => {
    render(<BarometreChart arrondissements={SAMPLE} />);
    // No loading spinner — data is already available
    expect(screen.queryByRole("status")).toBeNull(); // aria-busy loading div
    // At least one arrondissement label is visible
    expect(screen.getByText(/16e arr\./i)).toBeDefined();
  });

  it("renders all items from the arrondissements prop", () => {
    render(<BarometreChart arrondissements={SAMPLE} />);
    // Each arrondissement label should appear
    expect(screen.getByText(/8e arr\./i)).toBeDefined();
    expect(screen.getByText(/14e arr\./i)).toBeDefined();
  });

  it("shows empty state message when arrondissements prop is empty", () => {
    render(<BarometreChart arrondissements={[]} />);
    expect(screen.getByText(/Données non disponibles/i)).toBeDefined();
  });

  it("renders Lden values from props", () => {
    render(<BarometreChart arrondissements={SAMPLE} />);
    expect(screen.getByText(/61 dB/)).toBeDefined();
    expect(screen.getByText(/71 dB/)).toBeDefined();
  });

  it("renders an ordered list with the correct number of items", () => {
    render(<BarometreChart arrondissements={SAMPLE} />);
    const list = screen.getByRole("list");
    const items = list.querySelectorAll("li");
    expect(items).toHaveLength(SAMPLE.length);
  });
});
