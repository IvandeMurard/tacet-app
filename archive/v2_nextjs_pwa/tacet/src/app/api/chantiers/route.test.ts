import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_RECORDS = [
  { geo_point_2d: { lon: 2.3522, lat: 48.8566 }, adresse: "1 Rue de Rivoli", date_fin: "2026-06-01", type_chantier: "Voirie" },
  { geo_point_2d: { lon: 2.3600, lat: 48.8600 }, adresse: "5 Av. de l'Opéra", date_fin: "2026-09-30", type_chantier: "Réseaux" },
];

describe("GET /api/chantiers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns valid envelope with array data on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: true, json: async () => MOCK_RECORDS })
    );
    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.fallback).toBe(false);
    expect(body.cachedAt).not.toBeNull();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].adresse).toBe("1 Rue de Rivoli");
  });

  it("sets Cache-Control: no-store on success response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: true, json: async () => MOCK_RECORDS })
    );
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 502 with calm error message when upstream returns non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: false, status: 503 })
    );
    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.data).toBeNull();
    expect(body.error).toMatch(/503/);
    expect(body.fallback).toBe(false);
    expect(body.cachedAt).toBeNull();
  });

  it("sets Cache-Control: no-store on error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("Network timeout"))
    );
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 502 when fetch throws (network error)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("Network timeout"))
    );
    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toMatch(/timeout/i);
    expect(body.data).toBeNull();
  });

  it("returns 502 when upstream returns non-array JSON (E3-M3 shape validation)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notAnArray: true }),
      })
    );
    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toMatch(/invalide|shape/i);
    expect(body.data).toBeNull();
  });

  it("returns 502 when upstream returns a string instead of array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: true, json: async () => "oops" })
    );
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(502);
  });

  it("returns empty data array when upstream returns empty array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [] })
    );
    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.error).toBeNull();
  });

  // --- In-memory cache behaviour (story 3.7) ---

  it("serves identical cached data without a second upstream fetch within TTL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RECORDS });
    vi.stubGlobal("fetch", fetchMock);
    const { GET } = await import("./route");

    const r1 = await GET();
    const b1 = await r1.json();
    const r2 = await GET();
    const b2 = await r2.json();

    expect(fetchMock).toHaveBeenCalledTimes(1); // only one upstream hit
    expect(b2.data).toEqual(b1.data);
    expect(b2.cachedAt).toBe(b1.cachedAt); // same timestamp → served from cache
    expect(b2.fallback).toBe(false);
  });

  it("returns fallback with last cached data (HTTP 200) when upstream fails after cache expires", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => MOCK_RECORDS }) // first call succeeds
        .mockRejectedValueOnce(new Error("Upstream down"))                   // second call fails
    );
    const { GET } = await import("./route");

    await GET(); // populate cache
    vi.advanceTimersByTime(60 * 60 * 1000 + 1); // expire the 1-hour TTL
    const response = await GET(); // cache stale → re-fetch fails → fallback
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.fallback).toBe(true);
    expect(body.error).toMatch(/upstream/i);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.cachedAt).not.toBeNull();

    vi.useRealTimers();
  });

  it("re-fetches after TTL expires", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RECORDS });
    vi.stubGlobal("fetch", fetchMock);
    const { GET } = await import("./route");

    await GET(); // populate cache
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60 * 60 * 1000 + 1); // advance past 1-hour TTL

    await GET(); // should trigger re-fetch
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
