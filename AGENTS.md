# AGENTS.md

This file provides guidance to AI agents (Cursor, Claude Code, WARP, etc.) when working with code in this repository.

## Project Overview

Tacet is a **Paris acoustic companion** that translates Bruitparif noise data into a human-readable **Score Sérénité** (0–100). **V1** is a Next.js 14 PWA live at [tacet.vercel.app](https://tacet.vercel.app). **V2 is a native iOS app** (in active development) — landing page at [listen-to-paris.lovable.app](https://listen-to-paris.lovable.app).

The app lives in the **`tacet/`** subfolder. The repository root also contains **data pipeline scripts** and **planning artifacts** (PRD, UX spec, BMAD outputs).

## Repository Structure

```
/ (root)
├── AGENTS.md
├── .env.example                 # See "Environment" below; app uses tacet/.env.local
├── package.json                 # Data pipeline scripts only (Node 18+)
├── scripts/                     # build-paris-noise-iris.js, convert-bruitparif-shp.js, prep-data-sources.js
├── data/                        # paris-noise-iris.geojson + Bruitparif shapefiles (sources/)
├── docs/planning/               # prd.md, product-brief.md, research/
├── _bmad-output/
│   ├── planning-artifacts/      # UX spec, architecture, epics, project-context, PRD validation
│   └── stories/                 # story-1.1.md … story-5.6.md (BMAD story spec files)
└── tacet/                       # THE ACTUAL APP (Next.js 14)
    ├── src/app/                 # page.tsx, layout.tsx, barometre/page.tsx, elections/page.tsx
    ├── src/components/          # Map, IrisPopup, SearchBar, Legend, BarometreChart
    ├── src/lib/                 # noise-categories.ts (Score Sérénité), utils.ts (cn)
    └── public/data/             # paris-noise-iris.geojson (served statically)
```

**Leftover files (not part of the active app):** Root-level `components/MapView.tsx` and `config/mapbox.ts` are Expo/React Native artifacts. The active map is `tacet/src/components/Map.tsx` (react-map-gl + mapbox-gl).

## Architecture

### App and routing

- **Framework:** Next.js 14 App Router, React 18, TypeScript (strict).
- **Path alias:** `@/*` resolves to `tacet/src/*` (configured in `tacet/tsconfig.json`).
- **Routes:**
  - `/` — Main map page (choropleth IRIS zones, click → popup, address search).
  - `/barometre` — Silence barometer view.
  - `/elections` — 2026 Elections thematic layer.
- **Layout:** `tacet/src/app/layout.tsx` — Inter font, `lang="fr"`, dark-only HTML, metadata and PWA manifest for tacet.vercel.app.

### Components (`tacet/src/components/`)

| Component       | Purpose |
|----------------|--------|
| `Map.tsx`      | Mapbox map, GeoJSON IRIS fill layer, click/hover, address flyTo, NavigationControl, FullscreenControl. Loads `/data/paris-noise-iris.geojson`. |
| `IrisPopup.tsx`| Popup for selected IRIS zone (Score Sérénité, noise level, zone info). |
| `SearchBar.tsx`| Address geocoding (Mapbox); on select, flies to coords and selects IRIS at that point. |
| `Legend.tsx`   | Map legend for noise categories. |
| `BarometreChart.tsx` | Barometer chart on `/barometre`. |

The map is loaded with `dynamic(..., { ssr: false })` in `app/page.tsx` to avoid SSR issues with mapbox-gl.

### Domain logic (`tacet/src/lib/`)

- **`noise-categories.ts`** — Source of truth for Score Sérénité: `NOISE_CATEGORIES`, `SERENITE_SCORES`, `getNoiseCategory`, `getSereniteScore`, `getNoiseCategoryFromDb`, `getSereniteScoreFromDb`. Also `PARIS_CENTER`, `DEFAULT_ZOOM`, brand colors (`BRAND_COLOR`, etc.), `arLabel()` for arrondissement labels.
- **`utils.ts`** — `cn()` (clsx + tailwind-merge) for class names.

## Stack

- **Next.js** 14.2, **React** 18, **TypeScript** 5 (strict).
- **Styling:** Tailwind CSS 3, `tailwindcss-animate`; theme uses shadcn/ui-style CSS variables (e.g. `--background`, `--foreground`, `--brand`).
- **Map:** `mapbox-gl` 3, `react-map-gl` 8 (Mapbox style `dark-v11`).
- **UI:** `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`.

## Environment

The **Next.js app** reads env from **`tacet/.env.local`** (create from `tacet/.env.example` if present, or add the variable below).

**Required variable:**

- **`NEXT_PUBLIC_MAPBOX_TOKEN`** — Mapbox public token (starts with `pk.`). Get it at [account.mapbox.com](https://account.mapbox.com/). Used by `Map.tsx` and SearchBar geocoding.

**CRITICAL:** Do not commit `tacet/.env.local`. The repo ignores `.env*` except `.env.example`.

## Development Commands

**Run the app (from repo root):**

```bash
cd tacet && npm install
cd tacet && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

**Build / start / lint:**

```bash
cd tacet && npm run build
cd tacet && npm run start
cd tacet && npm run lint
```

**Data pipeline (root):**

```bash
npm run build:data      # build-paris-noise-iris.js
npm run prep:data       # prep-data-sources.js
npm run convert:bruitparif   # convert-bruitparif-shp.js
```

Outputs go to `data/` and can be copied to `tacet/public/data/` for the app.

## Planning and BMAD

- **PRD:** `docs/planning/prd.md`
- **UX design (V2):** `_bmad-output/planning-artifacts/ux-design-specification.md`
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md`
- **Epics (list):** `_bmad-output/planning-artifacts/epics.md`
- **Project context:** `_bmad-output/planning-artifacts/project-context.md`
- **Story spec files:** `_bmad-output/stories/story-X.Y.md` (e.g. story-1.1.md, story-2.1.md)
- **PRD validation:** `_bmad-output/planning-artifacts/prd-validation-report.md` (5/5 Pass)

BMAD agent commands live in **`.claude/commands/`** (e.g. `bmad-agent-bmm-dev.md`, `bmad-bmm-create-story.md`). These are Claude Code slash commands. **Cursor is configured to use BMAD** via `.cursor/rules/bmad-methodology.mdc`: the AI routes planning/sprint/story/PRD requests to the appropriate command file and follows it, with fallback when the `_bmad/` framework folder is absent. In Cursor, you can say e.g. "run sprint planning" or "create a story" and the AI will read the right command and execute the workflow intent.

## V2 Roadmap (context only)

V2 is a **native iOS app**. Landing page: [listen-to-paris.lovable.app](https://listen-to-paris.lovable.app). Targets: calm-route navigation, real-time Bruitparif RUMEUR alerts, thematic routes (nature, history, art, food), voice guide, noise-pollution education. Implementation follows the UX spec and PRD.
