# Données Bruitparif et méthodologie Tacet

Ce document décrit les sources de données, la méthodologie de construction du fichier `paris-noise-iris.geojson` et les obligations de citation.

## Sources

### Cartographie air-bruit Bruitparif (prioritaire)

- **Page** : [bruitparif.fr/opendata-air-bruit](https://www.bruitparif.fr/opendata-air-bruit/)
- **Contenu** : Couches SIG en 9 classes (symbologie 3×3 : 3 niveaux air × 3 niveaux bruit), années 2022 et 2024.
- **Codage** : Les classes sont numérotées 11, 12, 13, 21, 22, 23, 31, 32, 33. Le **premier chiffre** = niveau bruit (1 = favorable, 2 = moyen, 3 = dégradé), le **second** = qualité air. Pour Tacet, seule la **composante bruit** (1er chiffre) est utilisée.
- **Granularité** : À vérifier selon le jeu téléchargé (grille / polygones fins ou communal). Si la couche est en grille ou polygones fins, le script effectue une jointure spatiale avec les contours IRIS et attribue à chaque IRIS la classe **dominante** (surface d’intersection la plus grande).

### Contours IRIS Paris

- **Jeux recommandés** :
  - [Contours... IRIS® (data.gouv.fr)](https://www.data.gouv.fr/fr/datasets/contours-iris-r-2/) — IGN/INSEE
  - [Contours IRIS Île-de-France](https://www.data.gouv.fr/datasets/contours-iris-r/) — permet de ne télécharger que la région
- **Filtre** : Conserver uniquement les IRIS de Paris (code commune 75156 ou codes 75101–75120 selon le jeu).
- **Format attendu** : GeoJSON (WGS84), avec au minimum un identifiant IRIS (`CODE_IRIS`, `DCOMIRIS` ou équivalent).

### Données d’arrondissement (fallback)

En l’absence de couche Bruitparif 9 classes, le script utilise le fichier `tacet/public/data/paris-noise-arrondissements.geojson` (niveaux Lden par arrondissement). Pour chaque IRIS, le **centroïde** est calculé et on attribue le niveau de bruit de l’arrondissement qui contient ce point.

## Mapping des niveaux Tacet

Les données Bruitparif 9-classes ne produisent que **3 niveaux de bruit** (pas 4) :

| Niveau Tacet | Label        | Couleur (light) | 1er chiffre Bruitparif (codes 1x, 2x, 3x) |
|--------------|--------------|-----------------|-------------------------------------------|
| 1            | Calme        | #0D9488         | 1 (11, 12, 13) — favorable                |
| 2            | Modéré       | #F59E0B         | 2 (21, 22, 23) — moyen                    |
| 3            | Bruyant      | #F97316         | 3 (31, 32, 33) — dégradé                  |
| 4            | Très bruyant | #EF4444         | — (non alimenté par Bruitparif 9-classes)|

**Distribution attendue** avec source Bruitparif : uniquement niveaux 1, 2 et 3. Le niveau 4 sera alimenté par de futures sources plus granulaires (cartes stratégiques Lden, capteurs temps réel).

**Paris intramuros** : les trois niveaux 1 (Calme), 2 (Modéré) et 3 (Bruyant) sont présents. Les zones favorables (parcs, quartiers résidentiels peu exposés au trafic) sont classées niveau 1.

## Méthode de jointure spatiale

1. Pour chaque IRIS : calcul du **centroïde**, recherche des polygones Bruitparif englobants (R-tree).
2. Attribution de la **classe** du polygone contenant le centroïde.
3. Conversion du **1er chiffre** (composante bruit) en `noise_level` Tacet (1–3) selon le tableau ci-dessus.

## Propriétés produites

Chaque feature du GeoJSON `paris-noise-iris.geojson` contient notamment :

- `noise_level` : 1 (Calme) à 4 (Très bruyant) — Bruitparif 9-classes alimente uniquement 1, 2, 3
- `source_type` : `"bruitparif"` ou `"arrondissement_fallback"`
- `primary_sources` : tableau (ex. `["Circulation"]`), à enrichir depuis OpenData Paris si disponible
- `day_level` / `night_level` : même valeur que `noise_level` en V1 si non fourni par la source
- `description` : phrase type selon le niveau
- `code_iris`, `name`, `c_ar` : identifiant et nom de la zone, numéro d’arrondissement (1–20)

## Citation obligatoire

Pour toute utilisation ou publication des données dérivées, la source doit être citée comme suit :

> **Source des données :** Cartographie air-bruit établie par Airparif et Bruitparif – http://carto.airparif.bruitparif.fr

## Régénération du fichier

```bash
node scripts/build-paris-noise-iris.js
```

Voir aussi [data/README.md](../data/README.md) pour l’emplacement des fichiers sources (`data/sources/`).
