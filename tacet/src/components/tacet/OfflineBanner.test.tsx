import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { OfflineBanner } from "./OfflineBanner";

describe("OfflineBanner", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    Object.defineProperty(global, "navigator", {
      value: { ...originalNavigator, onLine: true },
      writable: true,
      configurable: true,
    });
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
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
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Access Denied");
    });
    render(<OfflineBanner />);
    setOnline(false);
    expect(screen.getByText(/Vous êtes hors ligne/)).toBeInTheDocument();
    expect(screen.getByText(/données de votre dernière session disponibles/)).toBeInTheDocument();
  });

  it("hides the banner again when the online event fires", () => {
    render(<OfflineBanner />);
    setOnline(false);
    expect(screen.getByRole("status")).toBeInTheDocument();
    setOnline(true);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
