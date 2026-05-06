import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("GET /api/rumeur", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Mock path (no API key) ---

  it("returns mock data with valid structure and a fresh timestamp when BRUITPARIF_API_KEY is not set", async () => {
    vi.stubEnv("BRUITPARIF_API_KEY", "");
    const before = Date.now();
    const { GET } = await import("./route");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.fallback).toBe(false);
    expect(body.cachedAt).not.toBeNull();
    // Shape validation: must have a measurements array
    expect(body.data.measurements).toBeInstanceOf(Array);
    expect(body.data.measurements[0].stationId).toBe("mock-paris-1");
    // Timestamp must NOT be epoch (1970) — it should be recent
    expect(new Date(body.data.measurements[0].timestamp).getTime()).toBeGreaterThanOrEqual(before);
  });

  // --- Fetch path (API key present) ---

  it("fetches from Bruitparif API when key is set and cache is empty", async () => {
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    const mockData = {
      measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z", leq: 55 }],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })
    );

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockData);
    expect(body.error).toBeNull();
    expect(body.fallback).toBe(false);
    expect(body.cachedAt).not.toBeNull();
  });

  // --- Cache hit ---

  it("returns identical cached data body without a second fetch within TTL", async () => {
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    const mockData = {
      measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z", leq: 55 }],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("./route");
    await GET(); // populate cache
    const cachedResponse = await GET(); // should hit cache
    const cachedBody = await cachedResponse.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cachedBody.data).toEqual(mockData); // data equality, not just fetch count
    expect(cachedBody.fallback).toBe(false);
    expect(cachedBody.error).toBeNull();
  });

  // --- TTL expiry ---

  it("re-fetches after TTL expires", async () => {
    vi.useFakeTimers();
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    const mockData = {
      measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z", leq: 55 }],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("./route");
    await GET(); // populate cache

    vi.advanceTimersByTime(4 * 60 * 1000); // advance 4 minutes → cache expired

    await GET(); // should re-fetch

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // --- Concurrent request coalescing (NFR-SC2) ---

  it("coalesces concurrent cache-miss requests into a single upstream fetch (NFR-SC2)", async () => {
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    const mockData = {
      measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z", leq: 55 }],
    };
    let resolveFetch!: (value: unknown) => void;
    const fetchMock = vi.fn().mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("./route");

    // Launch 3 concurrent requests before the upstream fetch resolves
    const [p1, p2, p3] = [GET(), GET(), GET()];

    // Resolve the single upstream fetch
    resolveFetch({ ok: true, json: async () => mockData });

    const results = await Promise.all([p1, p2, p3]);
    const bodies = await Promise.all(results.map((r) => r.json()));

    expect(fetchMock).toHaveBeenCalledTimes(1); // single upstream call
    bodies.forEach((body) => {
      expect(body.data).toEqual(mockData); // all responses return the same data
      expect(body.error).toBeNull();
      expect(body.fallback).toBe(false);
    });
  });

  // --- Fallback path ---

  it("returns fallback with last cached data when upstream fails after cache expires", async () => {
    vi.useFakeTimers();
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    const cachedData = {
      measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z", leq: 55 }],
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => cachedData })
      .mockRejectedValueOnce(new Error("Network error"));
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("./route");
    await GET(); // populate cache

    vi.advanceTimersByTime(4 * 60 * 1000); // expire cache

    const response = await GET(); // fails, uses fallback
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(cachedData);
    expect(body.fallback).toBe(true);
    expect(body.error).not.toBeNull();
  });

  // --- 502 paths ---

  it("returns 502 when upstream fails and no cache exists", async () => {
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("Network error")));

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.data).toBeNull();
    expect(body.error).not.toBeNull();
    expect(body.fallback).toBe(false);
    expect(body.cachedAt).toBeNull();
  });

  it("returns 502 when upstream returns non-ok status and no cache exists", async () => {
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
      })
    );

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.data).toBeNull();
    expect(body.error).toContain("503");
  });

  // --- H1: Response shape validation ---

  it("returns 502 when upstream returns valid JSON with wrong shape (not RumeurData)", async () => {
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "rate limited", code: 429 }), // valid JSON, wrong shape
      })
    );

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.data).toBeNull();
    expect(body.error).not.toBeNull();
  });

  it("caches and returns a valid API response that passes shape validation", async () => {
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    const validData = { measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z" }] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: true, json: async () => validData })
    );

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(validData);
  });

  // --- L1: BRUITPARIF_API_URL env override ---

  it("uses BRUITPARIF_API_URL env override when fetching", async () => {
    const customUrl = "http://mock-bruitparif.local/api/rumeur";
    vi.stubEnv("BRUITPARIF_API_KEY", "test-key");
    vi.stubEnv("BRUITPARIF_API_URL", customUrl);
    const mockData = { measurements: [{ stationId: "s1", timestamp: "2026-01-01T00:00:00Z" }] };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockData });
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("./route");
    await GET();

    expect(fetchMock).toHaveBeenCalledWith(
      customUrl,
      expect.objectContaining({ cache: "no-store" })
    );
  });
});
