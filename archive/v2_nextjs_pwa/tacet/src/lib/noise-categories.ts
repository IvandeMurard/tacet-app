/**
 * Catégories de bruit pour la carte Paris (choroplèthe).
 * Propriété de jointure dans le GeoJSON : noise_level (1, 2, 3).
 * fill-color basée sur noise_level (valeurs numériques : 1=Calme, 2=Modéré, 3=Bruyant).
 *
 * Niveau 4 (Très Bruyant) : défini ici mais non alimenté par Bruitparif 9-classes.
 * Réservé pour de futures sources (cartes Lden, capteurs temps réel).
 */

export interface NoiseCategory {
  level: number;
  label: string;
  color: string;
  description: string;
}

export const NOISE_CATEGORIES: NoiseCategory[] = [
  {
    level: 1,
    label: "Calme",
    color: "#4ade80",
    description: "Environnement sonore favorable",
  },
  {
    level: 2,
    label: "Modéré",
    color: "#fbbf24",
    description: "Environnement sonore moyen",
  },
  {
    level: 3,
    label: "Bruyant",
    color: "#f87171",
    description: "Environnement sonore dégradé",
  },
  // Niveau 4 activé pour le Baromètre arrondissements (ex: 8e = 71 dB)
  {
    level: 4,
    label: "Très Bruyant",
    color: "#c084fc",
    description: "Environnement sonore très dégradé",
  },
];

// Couleurs plus douces que les classiques rouge/vert vifs — cohérent avec le design apaisant de Tacet
// green-400, amber-400, red-400, violet-400 de Tailwind

export const ACTIVE_LEVELS = [1, 2, 3]; // Niveaux présents dans les données actuelles

export const PARIS_CENTER: [number, number] = [2.3522, 48.8566];
export const DEFAULT_ZOOM = 11.5;

// Brand identity — single source of truth for Tacet teal
export const BRAND_COLOR = "#0D9488" as const;
export const BRAND_COLOR_DARK = "#0F766E" as const;
export const BRAND_COLOR_LIGHT = "#2DD4BF" as const;
export const BRAND_COLOR_MUTED = "#0D948833" as const;

// ---------------------------------------------------------------------------
// Score de Sérénité — TAC-15
// Traduction du noise_level numérique (1–4) en score humain 0–100.
// Framing positif : plus le score est haut, plus la zone est agréable.
// ---------------------------------------------------------------------------

/** Score fixe par niveau de bruit (1=Calme → 4=Très Bruyant) */
export const SERENITE_SCORES: Record<number, number> = {
  1: 85, // Calme       → 75–100 range, mid-point 85
  2: 58, // Modéré      → 45–74 range, mid-point 58
  3: 28, // Bruyant     → 15–44 range, mid-point 28
  4: 8,  // Très Bruyant → 0–14 range, mid-point 8
};

/**
 * Retourne la catégorie de bruit correspondant à un noise_level (1–4).
 * Retourne undefined si le niveau est inconnu.
 */
export function getNoiseCategory(level: number): NoiseCategory | undefined {
  return NOISE_CATEGORIES.find((c) => c.level === level);
}

/**
 * Score de Sérénité (0–100) depuis un noise_level IRIS (1–4).
 * Utilisé dans IrisPopup (TAC-9/TAC-15).
 */
export function getSereniteScore(level: number): number {
  return SERENITE_SCORES[level] ?? 0;
}

/**
 * Score de Sérénité (0–100) depuis un niveau Lden en dB.
 * Utilisé dans le Baromètre arrondissements (TAC-13).
 * Échelle : 50 dB → 100 pts · 75 dB → 0 pts (linéaire).
 */
export function getSereniteScoreFromDb(lden_db: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - ((lden_db - 50) / 25) * 100)));
}

/**
 * Catégorie de bruit depuis un niveau Lden en dB.
 * Cohérent avec les seuils Bruitparif.
 */
export function getNoiseCategoryFromDb(lden_db: number): NoiseCategory {
  if (lden_db < 55) return NOISE_CATEGORIES[0]; // Calme
  if (lden_db < 65) return NOISE_CATEGORIES[1]; // Modéré
  if (lden_db < 70) return NOISE_CATEGORIES[2]; // Bruyant
  return NOISE_CATEGORIES[3] ?? NOISE_CATEGORIES[2]; // Très Bruyant (niveau 4 si activé)
}

/** Libellé court d'un arrondissement parisien (1er, 2e, …, 20e) */
export function arLabel(c_ar: number): string {
  return c_ar === 1 ? "1er" : `${c_ar}e`;
}
