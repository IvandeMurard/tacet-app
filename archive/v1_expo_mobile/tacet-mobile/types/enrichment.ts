// Ported from tacet/src/types/enrichment.ts — keep in sync with server types.

export type PrimarySignal = "rumeur" | "chantier" | "reports" | "score" | "night";

export interface EnrichmentRequest {
  zone_code: string;
  zone_name: string;
  arrondissement: number;
  noise_level: number;
  day_level: number | null;
  night_level: number | null;
  score_serenite: number;
  current_iso_timestamp: string;
  intent?: string | null;
  rumeur_sensor?: { leq: number; distanceM: number } | null;
  nearby_chantiers?: { count: number; nearestDistanceM: number } | null;
  recent_reports?: number | null;
}

export interface EnrichmentResult {
  summary: string;
  primary_signal: PrimarySignal;
  secondary_signal?: PrimarySignal;
  confidence: "high" | "low";
  cachedAt: string | null;
  error?: string;
}
