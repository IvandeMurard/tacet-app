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
  // Niveau 4 défini mais non utilisé par la source Bruitparif actuelle
  // {
  //   level: 4,
  //   label: "Très Bruyant",
  //   color: "#c084fc",
  //   description: "Environnement sonore très dégradé",
  // },
];

// Couleurs plus douces que les classiques rouge/vert vifs — cohérent avec le design apaisant de Tacet
// green-400, amber-400, red-400 de Tailwind

export const ACTIVE_LEVELS = [1, 2, 3]; // Niveaux présents dans les données actuelles

export const PARIS_CENTER: [number, number] = [2.3522, 48.8566];
export const DEFAULT_ZOOM = 11.5;
