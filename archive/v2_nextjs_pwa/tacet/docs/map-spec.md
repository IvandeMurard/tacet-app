# Spec carte bruit Paris (Tacet)

Ce document enregistre les choix techniques pour la carte choroplèthe du bruit à Paris.

## Stack

- **react-map-gl v7+** : wrapper React pour mapbox-gl (carte Mapbox).
- **Données** : GeoJSON chargé via **fetch** depuis `/data/paris-noise-arrondissements.geojson` (fichier dans `public/data/`).

## Carte

- **Centre** : `[2.3522, 48.8566]` (Paris).
- **Zoom initial** : ~11.5.

## Couche choroplèthe

- **Type** : fill layer (Mapbox fill).
- **Propriété de style** : `noise_category` (valeurs : `Calme`, `Modéré`, `Bruyant`, `Très Bruyant`).
- **fill-color** : selon `noise_category` avec la palette ci-dessous.

### Palette de couleurs

| Catégorie     | Couleur  | Hex       |
|---------------|----------|-----------|
| Calme         | Vert     | `#2ecc71` |
| Modéré        | Orange   | `#f39c12` |
| Bruyant       | Rouge    | `#e74c3c` |
| Très Bruyant  | Violet   | `#8e44ad` |

## GeoJSON

- **Propriété de jointure** : **`c_ar`** (numéro d’arrondissement, 1–20).
- Propriétés utilisées : `c_ar`, `nom`, `lden_db`, `noise_category`.

## Fichiers concernés

- `src/lib/noise-categories.ts` : seuils, couleurs, labels.
- `src/components/Map.tsx` : carte, fetch GeoJSON, couche fill.
- `src/components/Legend.tsx` : légende 4 catégories.
- `src/components/ArrondissementPopup.tsx` : popup au clic (c_ar, nom, lden_db).
