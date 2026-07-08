import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("swr", () => ({ default: vi.fn() }));

import useSWR from "swr";
import { useElectionsData } from "./useElectionsData";

const ELECTIONS_URL = "/data/paris-noise-arrondissements.geojson";

describe("useElectionsData", () => {
  const mockUseSWR = vi.mocked(useSWR);

  beforeEach(() => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true } as never);
  });

  it("passes the static geojson URL as SWR key when enabled=true", () => {
    renderHook(() => useElectionsData(true));
    expect(mockUseSWR).toHaveBeenCalledWith(
      ELECTIONS_URL,
      expect.any(Function),
      expect.any(Object),
    );
  });

  it("passes null as SWR key when enabled=false — disabling the fetch", () => {
    renderHook(() => useElectionsData(false));
    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object),
    );
  });

  it("disables revalidateOnFocus (static data — no need to refetch on tab focus)", () => {
    renderHook(() => useElectionsData(true));
    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false }),
    );
  });

  it("returns the SWR result transparently", () => {
    const mockGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [],
    };
    mockUseSWR.mockReturnValue({ data: mockGeoJSON, error: undefined, isLoading: false } as never);
    const { result } = renderHook(() => useElectionsData(true));
    expect(result.current.data).toEqual(mockGeoJSON);
  });
});
