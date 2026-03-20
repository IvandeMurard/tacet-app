import { vi, describe, it, expect, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

const VALID_BODY = {
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

function makeRequest(body: unknown = VALID_BODY, apiKey: string | undefined = "test-key") {
  if (apiKey !== undefined) {
    vi.stubEnv("ANTHROPIC_API_KEY", apiKey);
  } else {
    vi.unstubAllEnvs();
  }
  return new Request("http://localhost/api/enrich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/enrich", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mockCreate.mockReset();
  });

  it("returns 200 with confidence: low when ANTHROPIC_API_KEY is absent (no crash)", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.confidence).toBe("low");
  });

  it("returns parsed summary with confidence: high on valid request", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            summary: "Zone calme, données cohérentes.",
            primary_signal: "score",
            confidence: "high",
          }),
        },
      ],
    });

    const { POST } = await import("./route");
    const req = makeRequest();
    const res = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.confidence).toBe("high");
    expect(body.summary).toBe("Zone calme, données cohérentes.");
    expect(body.primary_signal).toBe("score");
    expect(body.cachedAt).not.toBeNull();
  });

  it("returns confidence: low when Claude returns unparseable JSON", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "not json at all" }],
    });

    const { POST } = await import("./route");
    const req = makeRequest();
    const res = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.confidence).toBe("low");
    expect(body.summary).toBe("");
  });

  it("returns confidence: low when Claude call exceeds TIMEOUT_MS", async () => {
    vi.useFakeTimers();
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");

    // Claude call never resolves
    mockCreate.mockImplementation(
      () => new Promise<never>(() => { /* hangs */ })
    );

    const { POST } = await import("./route");
    const req = makeRequest();

    const resPromise = POST(req as never);
    // advanceTimersByTimeAsync flushes both timers and microtasks
    await vi.advanceTimersByTimeAsync(2000); // past TIMEOUT_MS=1500
    const res = await resPromise;
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.confidence).toBe("low");

    vi.useRealTimers();
  });

  it("returns 400 when zone_code is missing from request body", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...VALID_BODY, zone_code: "" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns cached result on second request for same zone+hour (mock called only once)", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            summary: "Zone bruyante le matin.",
            primary_signal: "chantier",
            confidence: "high",
          }),
        },
      ],
    });

    const { POST } = await import("./route");

    const req1 = makeRequest();
    const req2 = makeRequest();

    const res1 = await POST(req1 as never);
    const b1 = await res1.json();

    const res2 = await POST(req2 as never);
    const b2 = await res2.json();

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(b2.summary).toBe(b1.summary);
    expect(b2.cachedAt).toBe(b1.cachedAt);
  });
});
