# Tacet

**Discover your quiet Paris. Coming to iOS.**

[🌐 Landing Page](https://listen-to-paris.lovable.app) · [📍 V1 Web App](https://tacet.vercel.app)

Know if a neighborhood is calm enough before you sign a lease — one score, one tap. Compare addresses, follow quiet routes on foot or by bike, get real-time noise briefings. **V2 (iOS)** adds thematic routes and voice-guided discovery; the current **V1** web app is at the link below.

> *Tacet* (from Latin "he falls silent") is a musical indication signifying silence.

---

## Features

* **See calm at a glance** — One map, 992 Paris zones by serenity (no decibels to interpret).
* **Get a score for any address** — Search an address, see its calm score instantly.
* **Compare the quietest districts** — Rank districts by calm so you can narrow your search.
* **Trust the source** — Bruitparif official data, 992 IRIS zones; same data as institutional portals, human-readable.
* **Calm, readable interface** — Designed for quick decisions, not dashboards.

## Tech Stack

V1 (web) and V2 (iOS) share the same data and scoring logic; V2 is the product direction.

| Component | V1 (current) | V2 (in progress) |
| --- | --- | --- |
| Framework | Next.js 14 (App Router) | Next.js 15 |
| Map | Mapbox GL JS v3 / react-map-gl | **MapLibre GL JS** (MIT, $0) |
| Tiles | GeoJSON static | **PMTiles** (Protomaps, Vercel Blob) |
| Geocoding | Mapbox Geocoding v6 | **Photon Komoot** (free, no key) |
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
## Roadmap

Detailed tracking hosted on [Linear] (https://linear.app/ivanportfolio/project/tacet-8a0e70262193).

### ✅ V1 — Delivered

You can already search any Paris address and see its serenity score on the web.

* [x] 992 IRIS zones choropleth map (Bruitparif PPBE 2024 data)
* [x] Serenity Score (0–100 composite score, human-readable)
* [x] Silence Barometer (district ranking by noise level)
* [x] Address geocoding with per-IRIS score
* [x] 2026 Paris Elections thematic layer
* [x] Responsive web app (Next.js + Mapbox GL JS)

### 🔄 V2 — Finishing (TAC-28→37)

* [] **Working on UX/UI, open-source, and free infrastructure migration**

### V3 — Planned

* [] **I will work on real-time data integration and B2B features**

### V4+ — Vision

* [] **I will work on natural language queries and expand to other large cities**

## Sources and Attribution

> "Data source: Air-noise mapping established by Airparif and Bruitparif – http://carto.airparif.bruitparif.fr"

* [Bruitparif](https://www.bruitparif.fr/) — Noise pollution data
* [IGN / INSEE](https://geoservices.ign.fr/contoursiris) — IRIS Boundaries
* [OpenData Paris](https://opendata.paris.fr/) — District boundaries
* [OpenData Île-de-France](https://data.iledefrance.fr/) — Regional IRIS boundaries

## License

MIT
