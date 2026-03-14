import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DataProvenance } from "./DataProvenance";

describe("DataProvenance", () => {
  it("renders the correct text", () => {
    render(<DataProvenance />);
    expect(screen.getByText("Bruitparif · PPBE 2024")).toBeDefined();
  });

  it("applies default class names", () => {
    render(<DataProvenance />);
    const element = screen.getByText("Bruitparif · PPBE 2024");
    expect(element.className).toContain("text-[10px]");
    expect(element.className).toContain("leading-relaxed");
    expect(element.className).toContain("text-white/25");
  });

  it("applies custom className", () => {
    render(<DataProvenance className="custom-test-class" />);
    const element = screen.getByText("Bruitparif · PPBE 2024");
    expect(element.className).toContain("custom-test-class");
  });
});
