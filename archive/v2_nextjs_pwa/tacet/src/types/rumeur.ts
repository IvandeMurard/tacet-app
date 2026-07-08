/**
 * Properties extracted from a GeoJSON feature rendered in the rumeur-circles layer.
 * Mirrors the properties object built in RumeurLayer.ts#toGeoJSON.
 */
export interface RumeurFeatureProperties {
  stationId: string;
  /** ISO 8601 timestamp of the measurement; may be null if unavailable. */
  timestamp: string | null;
  /** Equivalent continuous sound level in dB; null when sensor has no reading. */
  leq: number | null;
  lmin: number | null;
  lmax: number | null;
}

/** Represents a single Bruitparif RUMEUR noise measurement from a fixed monitoring station. */
export interface RumeurMeasurement {
  stationId: string;
  /** ISO 8601 timestamp of the measurement. */
  timestamp: string;
  /** Equivalent continuous sound level (dB) — primary display metric. */
  leq?: number;
  lmin?: number;
  lmax?: number;
  /** WGS-84 latitude of the monitoring station. Present in real API response; included in mock. */
  lat?: number;
  /** WGS-84 longitude of the monitoring station. Present in real API response; included in mock. */
  lon?: number;
  [key: string]: unknown;
}

export interface RumeurData {
  measurements: RumeurMeasurement[];
  [key: string]: unknown;
}

/** Standard `{ data, error, fallback, cachedAt }` envelope returned by GET /api/rumeur. */
export interface RumeurResponse {
  data: RumeurData | null;
  error: string | null;
  fallback: boolean;
  cachedAt: string | null;
}
