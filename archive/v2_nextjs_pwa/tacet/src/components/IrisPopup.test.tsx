import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IrisPopup } from "./IrisPopup";
import type { IrisProperties } from "@/types/iris";
import type { RumeurMeasurement } from "@/types/rumeur";
import { useEnrichment } from "@/hooks/useEnrichment";

vi.mock("@/hooks/useEnrichment", () => ({
  useEnrichment: vi.fn(),
}));

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
  beforeEach(() => {
    (useEnrichment as ReturnType<typeof vi.fn>).mockReturnValue({ enrichment: null, isLoading: false });
  });

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

  describe("enrichment summary", () => {
    it("renders summary text when enrichment has confidence: high", () => {
      (useEnrichment as ReturnType<typeof vi.fn>).mockReturnValue({
        enrichment: {
          summary: "Zone très calme, idéale pour se concentrer.",
          primary_signal: "score",
          confidence: "high",
          cachedAt: "2026-03-20T10:00:00.000Z",
        },
        isLoading: false,
      });
      render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
      expect(screen.getByText("Zone très calme, idéale pour se concentrer.")).toBeDefined();
    });

    it("does NOT render summary when enrichment has confidence: low", () => {
      (useEnrichment as ReturnType<typeof vi.fn>).mockReturnValue({
        enrichment: {
          summary: "",
          primary_signal: "score",
          confidence: "low",
          cachedAt: null,
        },
        isLoading: false,
      });
      const { container } = render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
      expect(screen.getByText("Quartier d'Auteuil")).toBeDefined(); // existing content unaffected
      expect(container.textContent).not.toContain("Zone très calme");
    });
  });

  describe("time-aware rendering", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows night_level as primary and day_level still in DOM at 21:00", () => {
      vi.setSystemTime(new Date("2026-03-19T21:00:00"));
      const { container } = render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
      expect(container.textContent).toContain("Nuit · Ln");
      expect(container.textContent).toContain("45 dB");
      expect(container.textContent).toContain("52 dB");
    });

    it("shows day_level as primary and night_level still in DOM at 10:00", () => {
      vi.setSystemTime(new Date("2026-03-19T10:00:00"));
      const { container } = render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
      expect(container.textContent).toContain("Jour · Lden");
      expect(container.textContent).toContain("52 dB");
      expect(container.textContent).toContain("45 dB");
    });

    it("filters out chantier with past date_fin", () => {
      vi.setSystemTime(new Date("2026-03-19T12:00:00"));
      const chantiers = [
        { distanceM: 100, date_fin: "2024-01-01" }, // expired
        { distanceM: 200, date_fin: "2027-12-31" }, // active
      ];
      const { container } = render(
        <IrisPopup properties={baseProps} onClose={vi.fn()} nearbyChantiers={chantiers} />
      );
      expect(container.textContent).toContain("1 chantier actif");
      expect(container.textContent).not.toContain("2 chantiers actifs");
    });

    it("shows relative time label for stale sensor reading at 19:00", () => {
      vi.setSystemTime(new Date("2026-03-19T19:00:00"));
      const staleTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2h ago
      const sensor = {
        measurement: { stationId: "TEST-01", leq: 55, timestamp: staleTimestamp } as RumeurMeasurement,
        distanceM: 250,
      };
      const { container } = render(
        <IrisPopup properties={baseProps} onClose={vi.fn()} nearestSensor={sensor} />
      );
      expect(container.textContent).not.toContain("maintenant");
    });
  });
});
