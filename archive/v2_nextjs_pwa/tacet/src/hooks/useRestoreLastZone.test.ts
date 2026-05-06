import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRestoreLastZone } from "./useRestoreLastZone";
import type { IrisProperties } from "@/types/iris";

// Mock MapContext
const mockSetSelectedZone = vi.fn();
let mockLastVisitedZone: IrisProperties | null = null;
let mockSelectedZone: IrisProperties | null = null;

vi.mock("@/contexts/MapContext", () => ({
  useMapContext: () => ({
    lastVisitedZone: mockLastVisitedZone,
    selectedZone: mockSelectedZone,
    setSelectedZone: mockSetSelectedZone,
  }),
}));

const SAMPLE_ZONE: IrisProperties = {
  code_iris: "750101",
  name: "Quartier de la Plaine-de-Monceaux",
  c_ar: 8,
  noise_level: 3,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockLastVisitedZone = null;
  mockSelectedZone = null;
});

describe("useRestoreLastZone", () => {
  it("calls setSelectedZone with lastVisitedZone on mount when selectedZone is null", () => {
    mockLastVisitedZone = SAMPLE_ZONE;
    mockSelectedZone = null;
    renderHook(() => useRestoreLastZone());
    expect(mockSetSelectedZone).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedZone).toHaveBeenCalledWith(SAMPLE_ZONE);
  });

  it("does NOT call setSelectedZone when selectedZone is already set", () => {
    mockLastVisitedZone = SAMPLE_ZONE;
    mockSelectedZone = SAMPLE_ZONE; // already selected
    renderHook(() => useRestoreLastZone());
    expect(mockSetSelectedZone).not.toHaveBeenCalled();
  });

  it("does NOT call setSelectedZone when lastVisitedZone is null", () => {
    mockLastVisitedZone = null;
    mockSelectedZone = null;
    renderHook(() => useRestoreLastZone());
    expect(mockSetSelectedZone).not.toHaveBeenCalled();
  });

  it("calls setSelectedZone only once even if deps change after mount", () => {
    mockLastVisitedZone = SAMPLE_ZONE;
    mockSelectedZone = null;
    const { rerender } = renderHook(() => useRestoreLastZone());
    expect(mockSetSelectedZone).toHaveBeenCalledTimes(1);
    // Re-render with same props — should not call again
    rerender();
    expect(mockSetSelectedZone).toHaveBeenCalledTimes(1);
  });
});
