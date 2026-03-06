import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SerenityBar } from "./SerenityBar";

describe("SerenityBar", () => {
  it("renders a progressbar with correct aria values", () => {
    render(<SerenityBar score={72} color="#4ade80" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeDefined();
    expect(bar.getAttribute("aria-valuenow")).toBe("72");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("sets inner bar width to score percentage", () => {
    const { container } = render(<SerenityBar score={50} color="#fbbf24" />);
    const inner = container.querySelector("[role='progressbar'] > div") as HTMLElement;
    expect(inner.style.width).toBe("50%");
  });

  it("applies the color as backgroundColor", () => {
    const { container } = render(<SerenityBar score={85} color="#4ade80" />);
    const inner = container.querySelector("[role='progressbar'] > div") as HTMLElement;
    // jsdom normalizes hex to rgb
    expect(inner.style.backgroundColor).toBe("rgb(74, 222, 128)");
  });

  it("applies custom className", () => {
    render(<SerenityBar score={30} color="#f87171" className="h-2" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("h-2");
  });
});
