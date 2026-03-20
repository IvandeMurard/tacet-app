import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const VALID_REQUEST = {
  zone_code: "751160501",
  zone_name: "Quartier d'Auteuil",
  arrondissement: 16,
  noise_level: 1,
  day_level: 52,
  night_level: 45,
  score_serenite: 85,
  current_iso_timestamp: "2026-03-20T10:00:00.000Z",
  intent: null,
};

describe("useEnrichment", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns { enrichment: null, isLoading: false } immediately when feature flag is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ENRICHMENT", "false");
    const { useEnrichment } = await import("./useEnrichment");
    const { result } = renderHook(() => useEnrichment(VALID_REQUEST));

    expect(result.current.enrichment).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("returns enrichment with summary when flag is on and response is success", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ENRICHMENT", "true");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        json: async () => ({
          summary: "Zone calme, peu de trafic.",
          primary_signal: "score",
          confidence: "high",
          cachedAt: "2026-03-20T10:00:00.000Z",
        }),
      })
    );

    const { useEnrichment } = await import("./useEnrichment");
    const { result } = renderHook(() => useEnrichment(VALID_REQUEST));

    await waitFor(() => {
      expect(result.current.enrichment).not.toBeNull();
    });

    expect(result.current.enrichment?.summary).toBe("Zone calme, peu de trafic.");
    expect(result.current.enrichment?.confidence).toBe("high");
    expect(result.current.isLoading).toBe(false);
  });

  it("returns { enrichment: null } when response has confidence: low", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ENRICHMENT", "true");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        json: async () => ({
          summary: "",
          primary_signal: "score",
          confidence: "low",
          cachedAt: null,
        }),
      })
    );

    const { useEnrichment } = await import("./useEnrichment");
    const { result } = renderHook(() => useEnrichment(VALID_REQUEST));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.enrichment).toBeNull();
  });

  it("resets isLoading to false when request becomes null (H1/M2 fix)", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ENRICHMENT", "true");
    vi.stubGlobal("fetch", vi.fn()); // fetch should never be called

    const { useEnrichment } = await import("./useEnrichment");
    const { result } = renderHook(() => useEnrichment(null));

    // isLoading must stay false when request is null — not stuck at true
    expect(result.current.isLoading).toBe(false);
    expect(result.current.enrichment).toBeNull();
  });
});
