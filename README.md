# Tacet

**Rediscover the quiet Paris.**

Access reliable insights, find the noise pollution level at any Paris address, compare districts, track real-time sensor data, and explore the city by bike or foot through its quietest streets and shops.
An agentic copilot in your pocket that learns from your usage, sharing the right information at the right time.

> *Tacet* (from Latin "he falls silent"), a musical notation for silence.

---

## What it does

| Feature | Description |
|---|---|
| **Serenity Score** | 0–100 composite score from official Bruitparif data |
| **Address search** | Photon/Komoot geocoding — no API key, no rate limit |
| **Live Directions**| Real-timùe guidance through Paris's quietest streets|
| **Zone comparison** | Pin up to 3 zones, compare side-by-side |
| **RUMEUR sensor layer** | Real-time Bruitparif sensor readings, refreshed every 3 min via proxy API |
| **Live social media monitoring** | Real-time alerts on events happening around you |
| **Chantiers layer** | Active Paris construction sites from OpenData Paris API |
| **Offline support** | Last-visited zone cached via service worker, works without network |
| **Accessibility** | Full keyboard navigation, ARIA, TextAlternativeView, WCAG-aligned |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Map | MapLibre GL JS + PMTiles (MIT, zero tile cost) |
| Geocoding | Photon Komoot (free, no API key) |
| Noise data | Bruitparif PPBE 2024 (static) + RUMEUR API (real-time) |
| Admin data | OpenData Paris API v2.1 + IGN/INSEE IRIS |
| Tests | Vitest + Playwright + Lighthouse CI |
| Styling | Tailwind CSS + `class-variance-authority` |
| Offline | Serwist service worker (offline cache, install prompt) |
| Language | TypeScript (strict) |

---

## Repository layout

```
/
├── tacet/                     # The app (Next.js 14)
│   ├── src/app/               # Pages: /, /barometre, /elections, /accessible
│   │                          #   /contact, /mentions-legales, /confidentialite
│   │                          #   /api/rumeur, /api/chantiers
│   ├── src/components/        # Map, IrisPopup, SearchBar, Legend, BarometreChart
│   ├── src/components/tacet/  # SerenityBar, TierBadge, ComparisonTray, ShareCard,
│   │                          #   RumeurStatusBar, DataProvenance, OfflineBanner,
│   │                          #   PWAInstallPrompt, TextAlternativeView
│   ├── src/contexts/          # MapContext (map ref, zone selection, pinning, layers)
│   ├── src/hooks/             # useRumeurData, useChantiersData, usePhotonSearch
│   ├── src/lib/               # noise-categories (score logic), map-style, format-date,
│   │                          #   utils (cn), constants
│   ├── src/types/             # iris.ts, rumeur.ts
│   ├── e2e/                   # Playwright end-to-end specs
│   └── .github/workflows/ci.yml  # CI: lint+test → E2E → Lighthouse (parallel)
├── scripts/                   # Data pipeline: build-paris-noise-iris.js, convert-bruitparif-shp.js
├── data/                      # paris-noise-iris.geojson (built) + raw sources (gitignored)
└── _bmad-output/              # Product specs, UX design, BMAD stories (1.1–5.6), sprint status
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `BRUITPARIF_API_KEY` | No | Bruitparif RUMEUR API key. Without it, sensor layer uses mock data in dev. |
| `BRUITPARIF_API_URL` | No | Override the RUMEUR endpoint (defaults to official API URL). |
| `NEXT_PUBLIC_ENABLE_RUMEUR` | No | Set `"true"` to show the sensor toggle in the UI. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Legacy V1 token — not needed for the map or geocoding. |

---

## Roadmap

### ✅ V1 — Live at tacet.vercel.app

- Choropleth map (Bruitparif data)
- Serenity Score 0–100, human-readable tiers
- Baromètre du Silence (district ranking)
- Address search with per-zone score popup
- Responsive web app

### ✅ V2 — Shipped

- Open-source map stack: MapLibre GL JS + PMTiles + Photon (zero licensing cost)
- Real-time RUMEUR sensor layer with 3-min server-side cache
- Active construction sites overlay (OpenData Paris)
- Zone pinning + side-by-side comparison tray
- Native share + ShareCard
- Offline support: service worker, last-visited zone cached
- Full accessibility: keyboard nav, ARIA, TextAlternativeView
- Legal & compliance pages (RGPD, mentions légales, privacy)
- Full test suite: Vitest unit/component + Playwright E2E + Lighthouse CI

### V3 — Native iOS app

- Native iOS app (the primary product direction)
- **Quiet route directions** — get from A to B by foot or bike, routed through the calmest zones (score 0 → 1)
- Natural language address queries
- B2B API: real estate, urban planning
- Real-time social media sentiment alerts

---

## Data sources

> "Data source: Air-noise mapping established by Airparif and Bruitparif http://carto.airparif.bruitparif.fr"

- [Bruitparif](https://www.bruitparif.fr/) - Noise data (PPBE 2024 static + RUMEUR real-time sensors)
- [IGN / INSEE](https://geoservices.ign.fr/contoursiris) - IRIS boundaries
- [OpenData Paris](https://opendata.paris.fr/) - District boundaries, construction sites
- [Photon / Komoot](https://photon.komoot.io/) - Geocoding

## License

MIT
