import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useChantiersData } from "./useChantiersData";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("useChantiersData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when disabled", () => {
    renderHook(() => useChantiersData(false));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches /api/chantiers when enabled", async () => {
    const mockResponse = {
      data: [{ adresse: "Rue de Rivoli" }],
      error: null,
      fallback: false,
      cachedAt: "2026-01-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useChantiersData(true));

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/chantiers");
    expect(result.current.data).toEqual(mockResponse);
  });
});
