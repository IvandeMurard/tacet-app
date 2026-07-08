// Noise level color ramp — ported from tacet/src/lib/noise-categories.ts
// Must stay in sync with the web app's visual identity.

export interface NoiseCategory {
  level: number;
  label: string;
  color: string;
  description: string;
}

export const NOISE_CATEGORIES: NoiseCategory[] = [
  { level: 1, label: "Calme",        color: "#4ade80", description: "Environnement sonore favorable" },
  { level: 2, label: "Modéré",       color: "#fbbf24", description: "Environnement sonore moyen" },
  { level: 3, label: "Bruyant",      color: "#f87171", description: "Environnement sonore dégradé" },
  { level: 4, label: "Très Bruyant", color: "#c084fc", description: "Environnement sonore très dégradé" },
];

export const SERENITE_SCORES: Record<number, number> = {
  1: 85,
  2: 58,
  3: 28,
  4: 8,
};

export function getNoiseCategory(level: number): NoiseCategory | undefined {
  return NOISE_CATEGORIES.find((c) => c.level === level);
}

export function getSereniteScore(level: number): number {
  return SERENITE_SCORES[level] ?? 0;
}

// MapLibre `match` expression: noise_level (integer) → hex fill color.
// Cast to unknown first because MapLibre RN style types expect string for fillColor,
// but the runtime accepts expression arrays correctly.
export const NOISE_FILL_EXPRESSION = [
  "match",
  ["get", "noise_level"],
  1, "#4ade80",
  2, "#fbbf24",
  3, "#f87171",
  4, "#c084fc",
  "#666666",
] as unknown as string;

export const PARIS_CENTER: [number, number] = [2.3522, 48.8566]; // [lng, lat]
export const DEFAULT_ZOOM = 11.5;
export const BRAND_COLOR = "#0D9488" as const;
