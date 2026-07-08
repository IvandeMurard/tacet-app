import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TierBadge } from "./TierBadge";

describe("TierBadge", () => {
  it("renders the label text", () => {
    render(<TierBadge label="Calme" color="#4ade80" />);
    expect(screen.getByText("Calme")).toBeDefined();
  });

  it("applies color as text color", () => {
    const { container } = render(<TierBadge label="Bruyant" color="#f87171" />);
    const badge = container.querySelector("span") as HTMLElement;
    // jsdom normalizes hex to rgb
    expect(badge.style.color).toBe("rgb(248, 113, 113)");
  });

  it("applies custom className", () => {
    const { container } = render(<TierBadge label="Modéré" color="#fbbf24" className="ml-2" />);
    const badge = container.querySelector("span") as HTMLElement;
    expect(badge.className).toContain("ml-2");
  });
});
