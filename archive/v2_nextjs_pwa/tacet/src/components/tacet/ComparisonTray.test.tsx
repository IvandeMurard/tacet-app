import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComparisonTray } from "./ComparisonTray";
import type { IrisProperties } from "@/types/iris";

const mockUnpinZone = vi.fn();

const mockZones: IrisProperties[] = [
  { code_iris: "751010101", name: "Les Halles", c_ar: 1, noise_level: 2 },
  { code_iris: "751160501", name: "Auteuil", c_ar: 16, noise_level: 1 },
];

vi.mock("@/contexts/MapContext", () => ({
  useMapContext: () => ({
    pinnedZones: mockZones,
    unpinZone: mockUnpinZone,
  }),
}));

describe("ComparisonTray", () => {
  it("returns null when closed", () => {
    const { container } = render(<ComparisonTray isOpen={false} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders dialog when open", () => {
    render(<ComparisonTray isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("displays pinned zone count", () => {
    render(<ComparisonTray isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/2\/3/)).toBeDefined();
  });

  it("lists pinned zone names and scores", () => {
    render(<ComparisonTray isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Les Halles")).toBeDefined();
    expect(screen.getByText("Auteuil")).toBeDefined();
    // noise_level 2 → 58, noise_level 1 → 85
    expect(screen.getByText("58")).toBeDefined();
    expect(screen.getByText("85")).toBeDefined();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<ComparisonTray isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Fermer"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls unpinZone when remove button clicked", () => {
    render(<ComparisonTray isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Retirer Les Halles des favoris"));
    expect(mockUnpinZone).toHaveBeenCalledWith("751010101");
  });
});
