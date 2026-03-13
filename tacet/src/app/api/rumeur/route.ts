import { NextResponse } from "next/server";

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

// TODO(TAC-28): Replace with actual Bruitparif RUMEUR endpoint once API access is granted.
// TODO(TAC-28): Verify auth scheme with Bruitparif — may be X-Api-Key, Basic, or other rather than Bearer.
// Set BRUITPARIF_API_URL in environment to override (e.g. for staging or local mocks).
const DEFAULT_API_URL =
  process.env.BRUITPARIF_API_URL ?? "https://api.bruitparif.fr/rumeur/v1/data";

export interface RumeurMeasurement {
  stationId: string;
  timestamp: string;
  leq?: number;
  lmin?: number;
  lmax?: number;
  [key: string]: unknown;
}

export interface RumeurData {
  measurements: RumeurMeasurement[];
  [key: string]: unknown;
}

interface InternalCache {
  data: RumeurData;
  cachedAt: string;
  expiresAt: number;
}

// Module-level in-memory cache — persists across requests within the same serverless instance.
let cache: InternalCache | null = null;

// In-flight deduplication: coalesces concurrent upstream requests into one (NFR-SC2: 1 request / 3-min window).
let inflightFetch: Promise<RumeurData> | null = null;

/**
 * Returns fresh mock data on every call.
 * Using a function (not a constant) ensures `timestamp` is current, preventing a false "stale"
 * indicator in story 3.3 during dev while TAC-28 is pending.
 */
function getMockData(): RumeurData {
  return {
    measurements: [
      {
        stationId: "mock-paris-1",
        timestamp: new Date().toISOString(),
        leq: 55.2,
        lmin: 42.1,
        lmax: 68.5,
      },
    ],
  };
}

/** Runtime guard: ensures the Bruitparif response is shaped as RumeurData before caching. */
function isValidRumeurData(value: unknown): value is RumeurData {
  return (
    typeof value === "object" &&
    value !== null &&
    "measurements" in value &&
    Array.isArray((value as { measurements: unknown }).measurements)
  );
}

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET() {
  // Serve from cache if still fresh.
  // NOTE: `cachedAt` reflects when data was originally fetched (up to 3 min ago), not "now".
  // Downstream consumers (story 3.3 stale indicator) should compute age as `now - cachedAt`.
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(
      { data: cache.data, error: null, fallback: false, cachedAt: cache.cachedAt },
      { headers: NO_STORE }
    );
  }

  // No API key → return mock (dev/CI, TAC-28 pending).
  const apiKey = process.env.BRUITPARIF_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { data: getMockData(), error: null, fallback: false, cachedAt: new Date().toISOString() },
      { headers: NO_STORE }
    );
  }

  // Coalesce concurrent cache-miss requests into a single upstream fetch (NFR-SC2).
  if (!inflightFetch) {
    inflightFetch = fetch(DEFAULT_API_URL, {
      cache: "no-store",
      headers: {
        // TODO(TAC-28): Verify auth scheme with Bruitparif before production activation.
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Bruitparif API: ${res.status}`);
        const raw: unknown = await res.json();
        if (!isValidRumeurData(raw)) {
          throw new Error("Bruitparif API: réponse inattendue");
        }
        return raw;
      })
      .finally(() => {
        inflightFetch = null;
      });
  }

  try {
    const data = await inflightFetch;
    const cachedAt = new Date().toISOString();
    cache = { data, cachedAt, expiresAt: Date.now() + CACHE_TTL_MS };

    return NextResponse.json(
      { data, error: null, fallback: false, cachedAt },
      { headers: NO_STORE }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "RUMEUR indisponible";

    // Return last cached data as fallback when available.
    if (cache) {
      return NextResponse.json(
        { data: cache.data, error: message, fallback: true, cachedAt: cache.cachedAt },
        { headers: NO_STORE }
      );
    }

    // No cache, no data — upstream is down and we have nothing to serve.
    return NextResponse.json(
      { data: null, error: message, fallback: false, cachedAt: null },
      { status: 502, headers: NO_STORE }
    );
  }
}
