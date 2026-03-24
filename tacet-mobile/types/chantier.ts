// Ported from tacet/src/app/api/chantiers/route.ts — keep in sync with server types.

export interface ChantierRecord {
  geo_point_2d?: { lon: number; lat: number };
  adresse?: string;
  date_fin?: string;
  type_chantier?: string;
  [key: string]: unknown;
}

export interface ChantiersResponse {
  data: ChantierRecord[] | null;
  error: string | null;
  fallback: boolean;
  cachedAt: string | null;
}
