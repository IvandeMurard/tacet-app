import { NextResponse } from "next/server";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — matches `revalidate: 3600` we removed
const OPENDATA_URL =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/chantiers-voirie/exports/json?limit=200";

const NO_STORE = { "Cache-Control": "no-store" };

export interface ChantierRecord {
  geo_point_2d?: { lon: number; lat: number };
  adresse?: string;
  date_fin?: string;
  type_chantier?: string;
  [key: string]: unknown;
}

interface ChantiersCache {
  data: ChantierRecord[];
  cachedAt: string;
  fetchedAt: number;
}

let cache: ChantiersCache | null = null;

function isValidChantiersData(v: unknown): v is ChantierRecord[] {
  return Array.isArray(v);
}

export async function GET() {
  // Serve from cache if within TTL
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(
      { data: cache.data, error: null, fallback: false, cachedAt: cache.cachedAt },
      { headers: NO_STORE }
    );
  }

  try {
    const res = await fetch(OPENDATA_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`Open Data Paris: ${res.status}`);
    }
    const raw = await res.json();
    if (!isValidChantiersData(raw)) {
      throw new Error("Open Data Paris: réponse invalide (shape inattendue)");
    }
    const cachedAt = new Date().toISOString();
    cache = { data: raw, cachedAt, fetchedAt: Date.now() };
    return NextResponse.json(
      { data: raw, error: null, fallback: false, cachedAt },
    const raw: unknown = await res.json();
    if (!isValidChantiersData(raw)) {
      throw new Error("Open Data Paris: réponse invalide (shape inattendue)");
    }
    const data = raw.filter(
      (r): r is ChantierRecord =>
        r != null &&
        typeof r === "object" &&
        (r.geo_point_2d == null ||
          (typeof r.geo_point_2d === "object" &&
            typeof (r.geo_point_2d as Record<string, unknown>).lon === "number" &&
            typeof (r.geo_point_2d as Record<string, unknown>).lat === "number"))
    );
    const cachedAt = new Date().toISOString();
    cache = { data, cachedAt, fetchedAt: Date.now() };
    return NextResponse.json(
      { data, error: null, fallback: false, cachedAt },
      { headers: NO_STORE }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chantiers indisponibles";
    // Serve stale cached data with fallback flag if available
    if (cache) {
      return NextResponse.json(
        { data: cache.data, error: message, fallback: true, cachedAt: cache.cachedAt },
        { headers: NO_STORE }
      );
    }
    return NextResponse.json(
      { data: null, error: message, fallback: false, cachedAt: null },
      { status: 502, headers: NO_STORE }
    );
  }
}
