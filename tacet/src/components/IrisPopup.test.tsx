import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IrisPopup } from "./IrisPopup";
import type { IrisProperties } from "@/types/iris";

const baseProps: IrisProperties = {
  code_iris: "751160501",
  name: "Quartier d'Auteuil",
  c_ar: 16,
  noise_level: 1,
  day_level: 52,
  night_level: 45,
  primary_sources: ["Bruitparif"],
  description: "Zone résidentielle calme",
};

describe("IrisPopup", () => {
  it("renders zone name and arrondissement", () => {
    render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
    expect(screen.getByText("Quartier d'Auteuil")).toBeDefined();
    expect(screen.getByText(/16e arrondissement/)).toBeDefined();
  });

  it("displays serenity score", () => {
    render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
    // noise_level 1 → score 85
    expect(screen.getByText("85")).toBeDefined();
  });

  it("displays noise category badge", () => {
    render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
    expect(screen.getByText("Calme")).toBeDefined();
  });

  it("displays day and night levels", () => {
    render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
    expect(screen.getByText(/52 dB/)).toBeDefined();
    expect(screen.getByText(/45 dB/)).toBeDefined();
  });

  it("displays description when provided", () => {
    render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
    expect(screen.getByText("Zone résidentielle calme")).toBeDefined();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<IrisPopup properties={baseProps} onClose={onClose} />);
    const closeBtn = screen.getByLabelText("Fermer");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("has dialog role with accessible label", () => {
    render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-label")).toContain("Quartier d'Auteuil");
  });

  it("shows share button", () => {
    render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
    expect(screen.getByText("Partager ce score")).toBeDefined();
  });

  it("shows pin button when onPin is provided", () => {
    render(<IrisPopup properties={baseProps} onClose={vi.fn()} onPin={vi.fn()} />);
    expect(screen.getByLabelText("Épingler pour comparer")).toBeDefined();
  });

  it("hides day/night when not provided", () => {
    const props = { ...baseProps, day_level: undefined, night_level: undefined };
    const { container } = render(<IrisPopup properties={props} onClose={vi.fn()} />);
    expect(container.textContent).not.toContain("dB");
  });
});
