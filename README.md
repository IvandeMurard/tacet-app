# Tacet

**Visualize noise pollution in Paris.**

Tacet is a mobile-first Progressive Web App that transforms technical noise data from [Bruitparif](https://www.bruitparif.fr/) into an intuitive choropleth map. Decibel measurements are converted into 4 simple categories — Quiet, Moderate, Noisy, Very Noisy — presented on a soothing interface.

> *Tacet* (from Latin "he falls silent") is a musical indication signifying silence.

---

## Features

* 🗺️ **Choropleth Map** — Noise levels by district and IRIS zone on a Mapbox background
* 🔍 **Address Search** — Geocoding with a serenity score
* 📊 **Silence Barometer** — Ranking of the quietest districts
* 📱 **PWA** — Installable on mobile, works offline
* 🎨 **Glassmorphism Design** — Calm and accessible interface

## Tech Stack

| Component | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Map | Mapbox GL JS v3 / react-map-gl |
| Language | TypeScript |
| Style | Tailwind CSS + shadcn/ui |
| Geo Data | GeoJSON (districts + IRIS) |
| Noise Data | Bruitparif (Lden, 9 air-noise classes) |
| Admin Data | IGN/INSEE (IRIS Boundaries), OpenData Paris |

## Quick Start

### Prerequisites

* Node.js ≥ 18
* A [Mapbox](https://account.mapbox.com/access-tokens/) token

### Installation

```bash
git clone https://github.com/<your-username>/tacet.git
cd tacet
npm install

```

### Configuration

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here

```

### Launch

```bash
npm run dev

```

The application is accessible at `http://localhost:3000`.

## Data

### Structure

```
data/
├── README.md                          # Source guide and pipeline
├── sources/                           # Raw files (gitignored)
│   ├── paris_iris.geojson             # Paris IRIS boundaries (~992 zones)
│   └── bruitparif_2024_9classes.geojson  # Bruitparif 9-class noise data
├── paris-noise-iris.geojson           # Build script output
public/
└── data/
    └── paris-noise-arrondissements.geojson  # 20 districts + noise
scripts/
├── build-paris-noise-iris.js          # Data pipeline
└── fixtures/
    └── paris_iris_minimal.geojson     # 4 minimal IRIS for dev
docs/
└── data-bruitparif.md                 # Spatial join documentation

```

### Data Pipeline

The build script supports 3 fallback levels:

1. **Bruitparif 9-classes + IRIS** — Spatial join (Turf.js intersect + dominant area)
2. **IRIS only** — IRIS Centroids → inheriting district noise level
3. **Fixtures** — 4 minimal IRIS zones for development

```bash
npm run build:data

```

### Retrieving Source Data

| Data | Source | Format |
| --- | --- | --- |
| Paris IRIS Boundaries | [data.iledefrance.fr](https://data.iledefrance.fr/explore/dataset/iris/) | GeoJSON (filter `depcom` on `751*`) |
| 9-class Noise 2024 | [bruitparif.fr/opendata-air-bruit](https://www.bruitparif.fr/opendata-air-bruit/) | Shapefile → convert via `ogr2ogr` |
| Symbology | Same Bruitparif page | XLSX (9 class codes) |

Bruitparif Shapefile Conversion:

```bash
unzip "Couches SIG air-bruit 2024_9_classes.zip" -d bruitparif_raw
ogr2ogr -f GeoJSON -t_srs EPSG:4326 -cliprect 2.22 48.81 2.47 48.91 \
  data/sources/bruitparif_2024_9classes.geojson bruitparif_raw/*.shp

```

### Tacet Categories

| Level | Label | Lden Threshold | Color |
| --- | --- | --- | --- |
| 1 | Quiet | < 55 dB | `#2ecc71` |
| 2 | Moderate | 55–65 dB | `#f39c12` |
| 3 | Noisy | 65–70 dB | `#e74c3c` |
| 4 | Very Noisy | > 70 dB | `#8e44ad` |

## Roadmap

Detailed tracking is available on [Linear](https://linear.app/ivanportfolio/project/tacet-8a0e70262193).

**Phase 0 — Data (In Progress)**

* [x] GeoJSON districts + estimated noise data
* [x] 3-level Build script (Bruitparif 9-classes → IRIS fallback → fixtures)
* [ ] Retrieve real IRIS data (Île-de-France portal)
* [ ] Retrieve + convert Bruitparif 2024 9-classes (SHP → GeoJSON)
* [ ] Validate Symbology.xlsx mapping → Tacet categories
* [ ] Run `npm run build:data` with real data

**Phase 1 — Map MVP (Next)**

* [ ] Mapbox Choropleth: noise visualization by IRIS/district
* [ ] Tacet 4-category legend
* [ ] Popup detail on tap (name, level, category)
* [ ] Glassmorphism UI, mobile-first
* [ ] Address search (Mapbox geocoding)
* [ ] PWA manifest + basic service worker

**Phase 2 — Content & Launch**

* [ ] Silence Barometer (district ranking)
* [ ] Educational page: effects of noise pollution
* [ ] Address diagnostic ("Serenity Score")
* [ ] 2026 Elections angle: editorial content
* [ ] Landing page / Tacet branding

**Phase 3 — Real-time & Routes**

* [ ] Real-time event overlay (City of Paris APIs: construction, events)
* [ ] Quiet pedestrian/bike routes (routing engine weighted by noise)
* [ ] Thematic options (art, nature)
* [ ] Hourly prediction (day/night model based on Lden/Ln)

**Phase 4 — Intelligence (Backlog)**

* [ ] ML Interpolation (virtual sensor, OSM proxies)
* [ ] Automatic Bruitparif data sync
* [ ] Expansion outside Paris (Île-de-France)

## Sources and Attribution

> "Data source: Air-noise mapping established by Airparif and Bruitparif – http://carto.airparif.bruitparif.fr"

* [Bruitparif](https://www.bruitparif.fr/) — Noise pollution data
* [IGN / INSEE](https://geoservices.ign.fr/contoursiris) — IRIS Boundaries
* [OpenData Paris](https://opendata.paris.fr/) — District boundaries
* [OpenData Île-de-France](https://data.iledefrance.fr/) — Regional IRIS boundaries

## License

MIT
