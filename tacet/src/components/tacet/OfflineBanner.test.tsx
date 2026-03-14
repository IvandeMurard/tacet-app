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
    expect(screen.queryByRole("status")).toBeNull();
  });
});
