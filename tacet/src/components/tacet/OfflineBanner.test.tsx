import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { OfflineBanner } from "./OfflineBanner";

describe("OfflineBanner", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Mock navigator to make it configurable
    Object.defineProperty(global, "navigator", {
      value: { ...originalNavigator, onLine: true },
      writable: true,
      configurable: true,
    });

    // Clear localStorage
    localStorage.clear();

    // Clear all mocks
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  const setOnline = (online: boolean) => {
    Object.defineProperty(global, "navigator", {
      value: { ...global.navigator, onLine: online },
      writable: true,
      configurable: true,
    });
    act(() => {
      window.dispatchEvent(new Event(online ? "online" : "offline"));
    });
  };

  it("renders nothing when online", () => {
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders default offline message when offline and localStorage is empty", () => {
    render(<OfflineBanner />);

    setOnline(false);

    expect(screen.getByText(/Vous êtes hors ligne/)).toBeInTheDocument();
    expect(screen.getByText(/données de votre dernière session disponibles/)).toBeInTheDocument();
  });

  it("renders zone name when offline and localStorage has valid data", () => {
    localStorage.setItem("tacet-last-zone", JSON.stringify({ name: "Zone 1" }));
    render(<OfflineBanner />);

    setOnline(false);

    expect(screen.getByText(/Vous êtes hors ligne/)).toBeInTheDocument();
    expect(screen.getByText(/dernière zone consultée : Zone 1/)).toBeInTheDocument();
  });

  it("handles invalid JSON gracefully", () => {
    localStorage.setItem("tacet-last-zone", "invalid json");
    render(<OfflineBanner />);

    setOnline(false);

    expect(screen.getByText(/Vous êtes hors ligne/)).toBeInTheDocument();
    expect(screen.getByText(/données de votre dernière session disponibles/)).toBeInTheDocument();
  });

  it("handles localStorage error gracefully", () => {
    // Mock localStorage.getItem to throw an error
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Access Denied");
    });

    render(<OfflineBanner />);

    setOnline(false);

    expect(screen.getByText(/Vous êtes hors ligne/)).toBeInTheDocument();
    expect(screen.getByText(/données de votre dernière session disponibles/)).toBeInTheDocument();
  });
});
