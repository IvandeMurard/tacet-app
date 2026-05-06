# Données Tacet — Carte du bruit à Paris

Ce dossier contient les données GeoJSON utilisées pour la couche choroplèthe bruit (niveaux par IRIS et par arrondissement).

## Fichiers générés (à commiter)

- **`paris-noise-iris.geojson`** — Polygones IRIS de Paris avec propriétés : `noise_level` (1–4), `primary_sources`, `day_level`, `night_level`, `description`, identifiants de zone. Généré par le script `scripts/build-paris-noise-iris.js`.

## Sources à télécharger (ne pas commiter)

Placez les fichiers suivants dans **`data/sources/`** avant d’exécuter le script de construction. Ces fichiers sont ignorés par git (voir `.gitignore`).

### 1. Bruitparif — Cartographie air-bruit 9 classes

- **Page** : [bruitparif.fr/opendata-air-bruit](https://www.bruitparif.fr/opendata-air-bruit/)
- **Fichiers** :
  - Couche SIG **« Couches SIG air-bruit 2024_9_classes »** (ou 2022)
  - **« Symbologie »** — `data/sources/Symbologie.xlsx` (référence pour les codes 9 classes)
- **Format** : Les couches sont en Shapefile. Le script `convert:bruitparif` (pure Node.js, sans GDAL) les convertit en GeoJSON WGS84 clippé sur Paris :
  - `data/sources/bruitparif_paris.geojson`
- **Conversion** : `npm run convert:bruitparif` — utilise `shapefile`, `proj4`, `adm-zip`. Aucune dépendance système.
- **Codage** : 9 classes = 11, 12, 13, 21, 22, 23, 31, 32, 33 (1er chiffre = air, 2e = bruit). Le script n’utilise que la **composante bruit** (2e chiffre).

### 2. Contours IRIS — Paris

- **Source recommandée** : [data.iledefrance.fr — iris](https://data.iledefrance.fr/explore/dataset/iris/) — exporter en GeoJSON avec filtre `depcom=75156`. L’URL directe :
  ```
  https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/iris/exports/geojson?limit=-1&refine=depcom%3A75156
  ```
- **Alternative** : [Contours IRIS® (data.gouv.fr)](https://www.data.gouv.fr/fr/datasets/contours-iris-r-2/) — filtrer sur Paris, exporter en GeoJSON.
- **Enregistrer sous** : `data/sources/paris_iris.geojson` (ou `datasourcesparis_iris.geojson` — le script `prep:data` le copiera automatiquement)
- **Propriétés attendues** : au minimum un identifiant IRIS (`code_iris`, `CODE_IRIS`, `DCOMIRIS`) et si possible le nom (`nom_iris`, `NOM_IRIS`).

## Préparer et régénérer les données

### Tout préparer d’un coup : `npm run prep:data`

```bash
# Télécharge paris_iris.geojson (ou copie datasourcesparis_iris.geojson si présent),
# convertit Bruitparif SHP → GeoJSON via ogr2ogr,
# puis lance le build
npm run prep:data
```

Options : `--skip-download` (sauter la partie IRIS), `--skip-ogr` (sauter la conversion Bruitparif), `--force-download` (retélécharger l’IRIS même si un fichier existe).

### Build seul : `npm run build:data`

```bash
node scripts/build-paris-noise-iris.js
```

Le script lit les fichiers dans `data/sources/` et écrit `data/paris-noise-iris.geojson`.  
Si les sources Bruitparif sont absentes, le script utilise les données d’arrondissement (voir `docs/data-bruitparif.md`).

## Citation

Pour toute utilisation ou publication des données dérivées, merci de citer :

> Source des données : Cartographie air-bruit établie par Airparif et Bruitparif – http://carto.airparif.bruitparif.fr

Voir aussi `docs/data-bruitparif.md` pour la méthodologie et les sources.
