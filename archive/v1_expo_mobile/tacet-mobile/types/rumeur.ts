// Ported from tacet/src/types/rumeur.ts — keep in sync with server types.

export interface RumeurMeasurement {
  stationId: string;
  timestamp: string;
  leq?: number;
  lmin?: number;
  lmax?: number;
  lat?: number;
  lon?: number;
}

export interface RumeurData {
  measurements: RumeurMeasurement[];
}

export interface RumeurResponse {
  data: RumeurData | null;
  error: string | null;
  fallback: boolean;
  cachedAt: string | null;
}
