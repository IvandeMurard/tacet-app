import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShareCard } from "./ShareCard";
import type { IrisProperties } from "@/types/iris";

const mockProperties: IrisProperties = {
  code_iris: "751010101",
  name: "Quartier des Halles",
  c_ar: 1,
  noise_level: 2,
};

describe("ShareCard", () => {
  it("displays the zone name", () => {
    render(<ShareCard properties={mockProperties} />);
    expect(screen.getByText("Quartier des Halles")).toBeDefined();
  });

  it("displays arrondissement label", () => {
    render(<ShareCard properties={mockProperties} />);
    expect(screen.getByText(/1er arr/)).toBeDefined();
  });

  it("displays serenity score", () => {
    render(<ShareCard properties={mockProperties} />);
    // noise_level 2 → score 58
    expect(screen.getByText("58")).toBeDefined();
    expect(screen.getByText("/100")).toBeDefined();
  });

  it("displays noise category badge", () => {
    render(<ShareCard properties={mockProperties} />);
    // noise_level 2 → "Modéré"
    expect(screen.getByText("Modéré")).toBeDefined();
  });

  it("displays data provenance", () => {
    render(<ShareCard properties={mockProperties} />);
    expect(screen.getByText(/Bruitparif/)).toBeDefined();
  });
});
