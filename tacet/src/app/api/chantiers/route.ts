import { NextResponse } from "next/server";

const CACHE_SECONDS = 3600; // 1 hour
// Paris open data — chantiers / travaux. Dataset ID may vary; adjust if 404.
const OPENDATA_URL =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/chantiers-voirie/exports/json?limit=200";

export interface ChantierRecord {
  geo_point_2d?: { lon: number; lat: number };
  adresse?: string;
  date_fin?: string;
  type_chantier?: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const res = await fetch(OPENDATA_URL, {
      next: { revalidate: CACHE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Open Data Paris: ${res.status}`);
    }
    const raw: unknown = await res.json();
    if (!Array.isArray(raw)) {
      throw new Error("Open Data Paris: unexpected response shape (not an array)");
    }
    const data = (raw as Record<string, unknown>[]).filter(
      (r): r is ChantierRecord =>
        r != null &&
        typeof r === "object" &&
        (r.geo_point_2d == null ||
          (typeof r.geo_point_2d === "object" &&
            typeof (r.geo_point_2d as Record<string, unknown>).lon === "number" &&
            typeof (r.geo_point_2d as Record<string, unknown>).lat === "number"))
    );
    const cachedAt = new Date().toISOString();
    return NextResponse.json({
      data,
      error: null,
      fallback: false,
      cachedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chantiers indisponibles";
    return NextResponse.json(
      {
        data: null,
        error: message,
        fallback: false,
        cachedAt: null,
      },
      { status: 502 }
    );
  }
}
