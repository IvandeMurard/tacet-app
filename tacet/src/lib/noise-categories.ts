/**
 * Catégories de bruit pour la carte Paris (choroplèthe).
 * Propriété de jointure dans le GeoJSON : c_ar (1-20).
 * fill-color basée sur noise_category (valeurs : Calme, Modéré, Bruyant, Très Bruyant).
 *
 * Niveau 4 (Très Bruyant) : défini ici mais non alimenté par Bruitparif 9-classes.
 * Réservé pour de futures sources (cartes Lden, capteurs temps réel).
 */

export const NOISE_CATEGORIES = [
  { id: "Calme", label: "Calme", color: "#2ecc71" },
  { id: "Modéré", label: "Modéré", color: "#f39c12" },
  { id: "Bruyant", label: "Bruyant", color: "#e74c3c" },
  { id: "Très Bruyant", label: "Très Bruyant", color: "#8e44ad" },
] as const;

export type NoiseCategoryId = (typeof NOISE_CATEGORIES)[number]["id"];

/** Retourne la catégorie par son id (ex: "Bruyant"). */
export function getNoiseCategoryById(
  id: string
): (typeof NOISE_CATEGORIES)[number] | null {
  return NOISE_CATEGORIES.find((c) => c.id === id) ?? null;
}
