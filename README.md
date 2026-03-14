# Tacet

**Find your quiet Paris — a serenity map for people who actually live here.**

[🌐 Live app](https://tacet.vercel.app) · [Landing page](https://listen-to-paris.lovable.app)

Know if a neighborhood is calm enough before you sign a lease — one score, one tap. Search any Paris address, compare districts, track real-time sensor data, explore the silence barometer.

> *Tacet* (from Latin "he falls silent") — a musical notation for silence.

---

## What it does

| Feature | Description |
|---|---|
| **Serenity Score** | 0–100 composite score across 992 IRIS zones, from official Bruitparif PPBE 2024 data |
| **Address search** | Photon/Komoot geocoding — no API key, no rate limit |
| **Zone comparison** | Pin up to 5 zones, compare side-by-side in a drawer |
| **Baromètre du Silence** | District ranking by noise level (20 arrondissements) |
| **RUMEUR sensor layer** | Real-time Bruitparif sensor readings, refreshed every 3 min via proxy API |
| **Chantiers layer** | Active Paris construction sites from OpenData Paris API |
| **Offline support** | PWA — last-visited zone cached, works without network |
| **Accessibility** | Full keyboard navigation, ARIA, TextAlternativeView, WCAG-aligned |

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components, API routes, edge-ready |
| Map | MapLibre GL JS + PMTiles | MIT license, zero map tile cost |
| Geocoding | Photon Komoot | Free, no API key required |
| Noise data | Bruitparif PPBE 2024 (static) + RUMEUR API (real-time) | Official source |
| Admin data | OpenData Paris API v2.1 + IGN/INSEE IRIS | Official source |
| Tests | Vitest + Playwright + Lighthouse CI | Unit, component, E2E, performance |
| Styling | Tailwind CSS + shadcn/ui | |
| PWA | Serwist | Service worker, offline cache, install prompt |
| Language | TypeScript (strict) | |

---

## Repository layout

```
/
├── tacet/                     # The app (Next.js 15)
│   ├── src/app/               # Pages: /, /barometre, /elections, /accessible
│   │                          #   /contact, /mentions-legales, /confidentialite
│   │                          #   /api/rumeur, /api/chantiers
│   ├── src/components/        # Map, IrisPopup, SearchBar, Legend, BarometreChart
│   ├── src/components/tacet/  # SerenityBar, TierBadge, ComparisonTray, ShareCard,
│   │                          #   RumeurStatusBar, DataProvenance, OfflineBanner
│   ├── src/hooks/             # useRumeurData, useChantiersData, usePhotonSearch
│   ├── src/lib/               # noise-categories (score logic), map-style, format-date
│   ├── src/types/             # iris.ts, rumeur.ts
│   ├── e2e/                   # Playwright end-to-end specs
│   └── .github/workflows/ci.yml  # lint → Vitest → Playwright → Lighthouse CI
├── scripts/                   # Data pipeline: build-paris-noise-iris.js, convert-bruitparif-shp.js
├── data/                      # paris-noise-iris.geojson (built) + raw sources (gitignored)
└── _bmad-output/              # Product specs, UX design, BMAD stories (1.1–5.6), sprint status
```

---

## Getting started

```bash
cd tacet
cp ../.env.example .env.local   # add RUMEUR_API_KEY if you have Bruitparif access
npm install
npm run dev                     # http://localhost:3000
npm test                        # Vitest unit + component tests
npm run test:e2e                # Playwright E2E (needs: npm run build && npm start)
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `RUMEUR_API_KEY` | No | Bruitparif RUMEUR API key. Without it, the sensor layer is hidden. |
| `NEXT_PUBLIC_ENABLE_RUMEUR` | No | Set `"true"` to show the sensor toggle in the UI. |

---

## Roadmap

### ✅ V1 — Live at tacet.vercel.app

- 992 IRIS zone choropleth map (Bruitparif PPBE 2024)
- Serenity Score 0–100, human-readable tiers
- Baromètre du Silence (district ranking)
- Address search with per-zone score popup
- Responsive web app (Next.js + Mapbox GL JS)

### ✅ V2 — Shipped

- Open-source map stack: MapLibre GL JS + PMTiles + Photon (zero licensing cost)
- Real-time RUMEUR sensor layer with 3-min server-side cache
- Active construction sites overlay (OpenData Paris)
- Zone pinning + side-by-side comparison tray
- Native share + ShareCard
- PWA: offline support, install prompt, Serwist service worker
- Full accessibility: keyboard nav, ARIA, TextAlternativeView
- Legal & compliance pages (RGPD, mentions légales, privacy)
- Full test suite: Vitest unit/component + Playwright E2E + Lighthouse CI

### V3 — Planned

- Quiet route planner (foot + bike)
- Natural language address queries
- B2B API: real estate, urban planning

---

## Data sources

> "Data source: Air-noise mapping established by Airparif and Bruitparif — http://carto.airparif.bruitparif.fr"

- [Bruitparif](https://www.bruitparif.fr/) — Noise data (PPBE 2024 static + RUMEUR real-time sensors)
- [IGN / INSEE](https://geoservices.ign.fr/contoursiris) — IRIS boundaries
- [OpenData Paris](https://opendata.paris.fr/) — District boundaries, construction sites
- [Photon / Komoot](https://photon.komoot.io/) — Geocoding

## License

MIT
