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

| Component | V1 (current) | V2 (in progress) |
| --- | --- | --- |
| Framework | Next.js 14 (App Router) | Next.js 15 |
| Map | Mapbox GL JS v3 / react-map-gl | **MapLibre GL JS** (MIT, $0) |
| Tiles | GeoJSON static | **PMTiles** (Protomaps, Vercel Blob) |
| Geocoding | Mapbox Geocoding v6 | **Photon Komoot** (free, no key) |
| PWA | — | **Serwist** (`@serwist/next`) |
| Tests | — | **Vitest + Playwright + LHCI** |
| Language | TypeScript | TypeScript |
| Style | Tailwind CSS + shadcn/ui | Tailwind CSS + shadcn/ui |
| Noise Data | Bruitparif PPBE 2024 (static) | Bruitparif RUMEUR (real-time, 3min) |
| Admin Data | IGN/INSEE IRIS, OpenData Paris | OpenData Paris API v2.1 |

---

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
```
```
## Roadmap

Detailed tracking hosted on [Linear] (https://linear.app/ivanportfolio/project/tacet-8a0e70262193).

### ✅ V1 — Delivered

* [x] 992 IRIS zones choropleth map (Bruitparif PPBE 2024 data)
* [x] Serenity Score (0–100 composite score, human-readable)
* [x] Silence Barometer (district ranking by noise level)
* [x] Address geocoding with per-IRIS score
* [x] 2026 Paris Elections thematic layer
* [x] Responsive web app (Next.js + Mapbox GL JS)

### 🔄 V2 — In Progress (TAC-28→37)

* [] **Working on open-source & free infrastructure migration**

### V3 — Planned

* [] **Planning to work on real-time data integration and B2B features**

### V4+ — Vision

* [] **Planning to work on natural language query and expand to other large cities**

## Sources and Attribution

> "Data source: Air-noise mapping established by Airparif and Bruitparif – http://carto.airparif.bruitparif.fr"

* [Bruitparif](https://www.bruitparif.fr/) — Noise pollution data
* [IGN / INSEE](https://geoservices.ign.fr/contoursiris) — IRIS Boundaries
* [OpenData Paris](https://opendata.paris.fr/) — District boundaries
* [OpenData Île-de-France](https://data.iledefrance.fr/) — Regional IRIS boundaries

## License

MIT
