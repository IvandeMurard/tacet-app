import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BarometrePage from "./page";
import { DATA_YEAR } from "@/lib/constants";

// Mock the GeoJSON data import
vi.mock("../../../public/data/paris-noise-arrondissements.geojson", () => ({
  default: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { c_ar: 8, nom: "8e", l_ar: "8e", lden_db: 71 },
      },
      {
        type: "Feature",
        properties: { c_ar: 16, nom: "16e", l_ar: "16e", lden_db: 61 },
      },
      {
        type: "Feature",
        properties: { c_ar: 14, nom: "14e", l_ar: "14e", lden_db: 62 },
      },
    ],
  },
}));

// Mock the BarometreChart component to verify props
vi.mock("@/components/BarometreChart", () => ({
  BarometreChart: vi.fn(({ arrondissements }) => (
    <div data-testid="barometre-chart">
      {arrondissements.map((a: any) => (
        <div key={a.c_ar} data-testid="arr-item">
          {a.c_ar}: {a.lden_db}
        </div>
      ))}
    </div>
  )),
}));

describe("BarometrePage", () => {
  it("renders the page title and description", () => {
    render(<BarometrePage />);
    expect(screen.getByText("Baromètre du Silence")).toBeDefined();
    expect(
      screen.getByText(/Les 20 arrondissements de Paris classés/i)
    ).toBeDefined();
  });

  it("renders data provenance with correct year", () => {
    render(<BarometrePage />);
    expect(screen.getAllByText(new RegExp(`Bruitparif ${DATA_YEAR}`, "i"))).toBeDefined();
  });

  it("sorts arrondissements from quietest to noisiest before passing to chart", () => {
    render(<BarometrePage />);

    const items = screen.getAllByTestId("arr-item");
    expect(items).toHaveLength(3);

    // Sorted: 16e (61), 14e (62), 8e (71)
    expect(items[0].textContent).toContain("16: 61");
    expect(items[1].textContent).toContain("14: 62");
    expect(items[2].textContent).toContain("8: 71");
  });

  it("renders the header with a link back to the map", () => {
    render(<BarometrePage />);
    const link = screen.getByRole("link", { name: /retour à la carte/i });
    expect(link.getAttribute("href")).toBe("/");
  });

  it("renders the electoral context section", () => {
    render(<BarometrePage />);
    expect(screen.getByText(/Élections municipales/i)).toBeDefined();
  });
});
