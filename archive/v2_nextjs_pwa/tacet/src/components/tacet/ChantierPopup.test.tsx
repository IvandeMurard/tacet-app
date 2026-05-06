import { vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChantierPopup } from "./ChantierPopup";

const FULL_PROPS = {
  properties: {
    adresse: "12 Rue de Rivoli",
    date_fin: "2026-06-30",
    type_chantier: "Travaux de voirie",
  },
  onClose: vi.fn(),
};

describe("ChantierPopup", () => {
  it("renders the address from properties", () => {
    render(<ChantierPopup {...FULL_PROPS} />);
    expect(screen.getByText("12 Rue de Rivoli")).toBeDefined();
  });

  it("renders the work type from properties", () => {
    render(<ChantierPopup {...FULL_PROPS} />);
    expect(screen.getByText("Travaux de voirie")).toBeDefined();
  });

  it("renders a formatted date — not the raw ISO string", () => {
    render(<ChantierPopup {...FULL_PROPS} />);
    // Raw ISO string must NOT appear verbatim
    expect(screen.queryByText("2026-06-30")).toBeNull();
    // Fallback text must NOT appear when date_fin is valid
    expect(screen.queryByText("Date non précisée")).toBeNull();
  });

  it("shows fallback text when adresse is empty", () => {
    render(
      <ChantierPopup
        properties={{ adresse: "", date_fin: "2026-06-30", type_chantier: "Voirie" }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Adresse inconnue")).toBeDefined();
  });

  it("shows fallback text when date_fin is empty", () => {
    render(
      <ChantierPopup
        properties={{ adresse: "Rue Test", date_fin: "", type_chantier: "Voirie" }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Date non précisée")).toBeDefined();
  });

  it("shows fallback text when type_chantier is empty", () => {
    render(
      <ChantierPopup
        properties={{ adresse: "Rue Test", date_fin: "2026-06-30", type_chantier: "" }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Type non précisé")).toBeDefined();
  });

  it("close button calls onClose", () => {
    const onClose = vi.fn();
    render(<ChantierPopup properties={FULL_PROPS.properties} onClose={onClose} />);
    const closeBtn = screen.getByRole("button", { name: /fermer/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape key on the popup calls onClose", () => {
    const onClose = vi.fn();
    render(<ChantierPopup properties={FULL_PROPS.properties} onClose={onClose} />);
    // keydown is attached to the dialog element; fire on close button (it bubbles)
    const closeBtn = screen.getByRole("button", { name: /fermer/i });
    fireEvent.keyDown(closeBtn, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has role='dialog' and aria-label for accessibility", () => {
    render(<ChantierPopup {...FULL_PROPS} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-label")).toBeTruthy();
  });

  it("shows the 'Rayon' limitation note", () => {
    render(<ChantierPopup {...FULL_PROPS} />);
    expect(screen.getByText(/rayon/i)).toBeDefined();
  });
});
