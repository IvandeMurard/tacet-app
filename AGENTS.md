# AGENTS.md

Guidance for AI agents (Claude Code, Cursor, WARP, etc.) working in this repository.

## Project Overview

Tacet is a **Paris acoustic companion** — translates Bruitparif noise data into a human-readable **Score Sérénité** (0–100). The app is a Next.js 15 PWA live at [tacet.vercel.app](https://tacet.vercel.app). V2 (all 5 epics) is shipped.

The app lives in **`tacet/`**. The repo root holds data pipeline scripts and planning artifacts.

## Repository Structure

```
/ (root)
├── AGENTS.md
├── .env.example                 # Root-level env template (see Environment section)
├── package.json                 # Data pipeline scripts only (Node 18+)
├── scripts/                     # build-paris-noise-iris.js, convert-bruitparif-shp.js
├── data/                        # paris-noise-iris.geojson + raw sources/ (gitignored)
├── docs/                        # Planning docs (prd.md, product-brief, research)
├── _bmad-output/
│   ├── planning-artifacts/      # UX spec, architecture, epics, project-context
│   ├── stories/                 # story-1.1.md … story-5.6.md (all done)
│   └── implementation-artifacts/  # sprint-status.yaml, test-summary.md
└── tacet/                       # THE APP (Next.js 15)
    ├── src/app/                 # Routes (see below)
    ├── src/components/          # Map, IrisPopup, SearchBar, Legend, BarometreChart
    ├── src/components/tacet/    # Feature components (see below)
    ├── src/hooks/               # useRumeurData, useChantiersData, usePhotonSearch
    ├── src/lib/                 # noise-categories, map-style, format-date, utils, constants
    ├── src/types/               # iris.ts, rumeur.ts
    ├── src/contexts/            # MapContext (map ref, selected zone, pinned zones, layer toggles)
    ├── e2e/                     # Playwright specs
    ├── public/data/             # paris-noise-iris.geojson, iris-centroids.geojson (static)
    └── .github/workflows/ci.yml # lint → Vitest → Playwright → Lighthouse CI
```

## Architecture

### App routes (`tacet/src/app/`)

| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` + `MapPageClient.tsx` | Main map (IRIS zones, search, popups, layers) |
| `/barometre` | `barometre/page.tsx` | District ranking by noise level |
| `/elections` | `elections/page.tsx` | 2026 Paris elections thematic layer |
| `/accessible` | `accessible/page.tsx` | TextAlternativeView (keyboard/screen reader) |
| `/contact` | `contact/page.tsx` | Feedback + B2B contact form |
| `/mentions-legales` | `mentions-legales/page.tsx` | Legal notice |
| `/confidentialite` | `confidentialite/page.tsx` | Privacy policy |
| `/api/rumeur` | `api/rumeur/route.ts` | RUMEUR proxy with 3-min server cache |
| `/api/chantiers` | `api/chantiers/route.ts` | OpenData Paris construction sites proxy |

- **Framework:** Next.js 15 App Router, React 18, TypeScript (strict).
- **Path alias:** `@/*` → `tacet/src/*` (configured in `tacet/tsconfig.json`).
- **Map client component:** `MapPageClient.tsx` is `"use client"`. `MapContainer` is loaded with `dynamic(..., { ssr: false })`.

### Key components

| Component | Purpose |
|---|---|
| `map/MapContainer.tsx` | MapLibre GL JS map, IRIS fill layer, PMTiles, click/hover, zone highlight |
| `map/RumeurLayer.ts` | Adds/removes RUMEUR sensor dot layer |
| `map/ChantiersLayer.ts` | Adds/removes Chantiers overlay |
| `IrisPopup.tsx` | Selected zone popup: Score Sérénité, tier, pin, share |
| `SearchBar.tsx` | Photon/Komoot geocoding with keyboard-accessible listbox |
| `tacet/SerenityBar.tsx` | Score pill + tier badge |
| `tacet/TierBadge.tsx` | Tier label (Très calme → Très bruyant) |
| `tacet/ComparisonTray.tsx` | Side-by-side zone comparison drawer |
| `tacet/ShareCard.tsx` | Native share card |
| `tacet/RumeurStatusBar.tsx` | RUMEUR freshness / error indicator |
| `tacet/DataProvenance.tsx` | Data source attribution |
| `tacet/OfflineBanner.tsx` | Offline state banner |
| `tacet/PWAInstallPrompt.tsx` | PWA install prompt |
| `tacet/TextAlternativeView.tsx` | Full keyboard/screen-reader zone table |

### Domain logic (`tacet/src/lib/`)

- **`noise-categories.ts`** — Score Sérénité source of truth: `NOISE_CATEGORIES`, `SERENITE_SCORES`, `getNoiseCategory`, `getSereniteScore`, `PARIS_CENTER`, `DEFAULT_ZOOM`, `BRAND_COLOR`, `arLabel()`.
- **`map-style.ts`** — `getBaseMapStyle()` returns the MapLibre style object (PMTiles-based, no Mapbox token).
- **`format-date.ts`** — Date formatting for RUMEUR timestamps.
- **`utils.ts`** — `cn()` (clsx + tailwind-merge).
- **`constants.ts`** — `DATA_YEAR`, shared app constants.

### State management

`MapContext` (`src/contexts/MapContext.tsx`) holds:
- `mapRef` — MapLibre Map instance
- `selectedZone` / `setSelectedZone` — currently selected IRIS zone
- `pinnedZones` / `pinZone` — up to `MAX_PINNED` (5) pinned zones
- `activeLayers` / `toggleLayer` — Set of active layer IDs (`"chantiers"`, `"rumeur"`)
- `flyToAndSelectZone` — fly map to coords and select IRIS zone at that point

## Stack

- **Next.js** 15, **React** 18, **TypeScript** 5 (strict).
- **Map:** MapLibre GL JS (MIT) + PMTiles (Protomaps). No Mapbox token required.
- **Geocoding:** Photon Komoot — no API key needed.
- **Styling:** Tailwind CSS 3, shadcn/ui CSS variables, `tailwindcss-animate`.
- **UI:** `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`.
- **PWA:** Serwist service worker, precache, runtime caching.
- **Data fetching:** SWR (hooks layer).
- **Tests:** Vitest + @testing-library/react, Playwright, @lhci/cli.

## Environment

The app reads from **`tacet/.env.local`** (create from root `.env.example`).

| Variable | Required | Description |
|---|---|---|
| `RUMEUR_API_KEY` | No | Bruitparif RUMEUR API key. Without it, sensor layer is hidden. |
| `NEXT_PUBLIC_ENABLE_RUMEUR` | No | Set `"true"` to show the sensor toggle in the UI. |

**No Mapbox token needed.** Map and geocoding are fully open-source.

**CRITICAL:** Never commit `tacet/.env.local`. The repo ignores `.env*` except `.env.example`.

## Development Commands

```bash
# App
cd tacet
npm install
npm run dev          # http://localhost:3000
npm run build
npm run start
npm run lint
npm test             # Vitest unit + component
npm run test:e2e     # Playwright (requires build + start first)

# Data pipeline (from repo root)
npm run build:data          # build-paris-noise-iris.js
npm run convert:bruitparif  # convert-bruitparif-shp.js
```

## Planning and BMAD

All 5 epics are **done** (see `_bmad-output/implementation-artifacts/sprint-status.yaml`).

- **PRD:** `docs/planning/prd.md`
- **UX design:** `_bmad-output/planning-artifacts/ux-design-specification.md`
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md`
- **Epics:** `_bmad-output/planning-artifacts/epics.md`
- **Stories:** `_bmad-output/stories/story-X.Y.md` (story-1.1 through story-5.6, all done)
- **Test summary:** `_bmad-output/implementation-artifacts/tests/test-summary.md`

BMAD agent commands live in **`.claude/commands/`**. Claude Code slash commands route planning/sprint/story requests to the right command file.
