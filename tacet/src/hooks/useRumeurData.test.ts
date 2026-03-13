import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("swr", () => ({ default: vi.fn() }));

import useSWR from "swr";
import { useRumeurData } from "./useRumeurData";

describe("useRumeurData", () => {
  const mockUseSWR = vi.mocked(useSWR);

  beforeEach(() => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true } as never);
  });

  it("passes /api/rumeur as SWR key when enabled=true", () => {
    renderHook(() => useRumeurData(true));
    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/rumeur",
      expect.any(Function),
      expect.objectContaining({ refreshInterval: 180_000 }),
    );
  });

  it("passes null as SWR key when enabled=false — disabling polling", () => {
    renderHook(() => useRumeurData(false));
    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.objectContaining({ refreshInterval: 180_000 }),
    );
  });

  it("disables revalidateOnFocus to prevent unnecessary upstream hits", () => {
    renderHook(() => useRumeurData(true));
    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false }),
    );
  });

  it("returns the SWR result transparently", () => {
    const mockResponse = {
      data: {
        measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z", leq: 55.2, lat: 48.8566, lon: 2.3522 }],
      },
      error: null,
      fallback: false,
      cachedAt: "2026-01-01T00:00:00Z",
    };
    mockUseSWR.mockReturnValue({ data: mockResponse, error: undefined, isLoading: false } as never);
    const { result } = renderHook(() => useRumeurData(true));
    expect(result.current.data).toEqual(mockResponse);
  });
});
