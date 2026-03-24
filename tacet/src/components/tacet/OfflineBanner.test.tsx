import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { OfflineBanner } from "./OfflineBanner";

const LAST_ZONE_KEY = "tacet-last-zone";

beforeEach(() => {
  localStorage.clear();
  // Default: online
  Object.defineProperty(navigator, "onLine", { value: true, writable: true, configurable: true });
});

afterEach(() => {
  localStorage.clear();
});

describe("OfflineBanner", () => {
  it("renders nothing when navigator.onLine is true", () => {
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

  it("shows the offline banner when the 'offline' event fires", () => {
    render(<OfflineBanner />);
    act(() => {
      fireEvent(window, new Event("offline"));
    });
    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.getByText(/hors ligne/i)).toBeDefined();
  });

  it("shows the fallback text when no last zone is stored", () => {
    render(<OfflineBanner />);
    act(() => {
      fireEvent(window, new Event("offline"));
    });
    expect(screen.getByText(/données de votre dernière session/i)).toBeDefined();
  });

  it("shows the last zone name from localStorage when offline", () => {
    localStorage.setItem(LAST_ZONE_KEY, JSON.stringify({ name: "Montmartre" }));
    render(<OfflineBanner />);
    act(() => {
      fireEvent(window, new Event("offline"));
    });
    expect(screen.getByText(/Montmartre/)).toBeDefined();
  });

  it("hides the banner again when the 'online' event fires", () => {
    render(<OfflineBanner />);
    act(() => {
      fireEvent(window, new Event("offline"));
    });
    expect(screen.getByRole("status")).toBeDefined();
    act(() => {
      fireEvent(window, new Event("online"));
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
