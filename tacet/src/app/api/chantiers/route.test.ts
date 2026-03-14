import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("GET /api/chantiers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns chantier data on success", async () => {
    const mockData = [
      { geo_point_2d: { lon: 2.35, lat: 48.85 }, adresse: "Rue de Rivoli" },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const response = await GET();
    const body = await response.json();

    expect(body.data).toEqual(mockData);
    expect(body.error).toBeNull();
    expect(body.fallback).toBe(false);
    expect(body.cachedAt).toBeTruthy();
  });

  it("returns 502 when API returns non-array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ unexpected: "format" }),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.data).toBeNull();
    expect(body.error).toContain("unexpected response shape");
  });

  it("returns 502 with error message on fetch failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.data).toBeNull();
    expect(body.error).toContain("404");
    expect(body.fallback).toBe(false);
  });

  it("returns 502 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.data).toBeNull();
    expect(body.error).toBe("Network error");
  });
});
