---
workflowType: 'project-context'
project_name: 'Tacet'
date: '2026-03-05'
inputDocuments:
  - AGENTS.md
  - _bmad-output/planning-artifacts/architecture.md
---

# Project Context: Tacet

This document consolidates everything an AI agent needs to orient itself before implementing a story. Use it when loading context for sprint planning, story implementation, or code review.

## Project Identity

- **Name:** Tacet
- **Description:** Next.js 14 Progressive Web App (PWA) that visualizes Paris urban noise by IRIS zone using Bruitparif data. Raw acoustic data (Lden dB) is translated into a human-readable **Score Sérénité** (0–100) and shown on an interactive map.
- **V1:** Live at [tacet.vercel.app](https://tacet.vercel.app)
- **V2:** In progress — open-source stack migration (MapLibre, PMTiles, Photon), real-time RUMEUR layer, PWA hardening (Serwist)
- **App location:** The application lives in the **`tacet/`** subfolder. Repository root contains data pipeline scripts and planning artifacts.

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14.2 App Router, React 18, TypeScript 5 (strict) |
| Map | MapLibre GL JS ^5.19.0, PMTiles ^4.4.0 (V2); Mapbox/react-map-gl (V1 current) |
| Geocoding | Photon Komoot (V2, no API key); Mapbox Geocoding (V1) |
| PWA | Serwist ^9.5.6 (V2) |
| State | SWR (server data), React Context (UI state: selectedZone, selectedZoneLngLat, activeLayers, pinnedZones) — `chantiers`+`rumeur` always-on in activeLayers, no user toggles |
| Styling | Tailwind CSS 3.4, shadcn/ui, CSS variables (Score tiers, brand) |
| Testing | Vitest (unit), Playwright ^1.58 (E2E), Lighthouse CI (perf ≥ 85, a11y ≥ 95) |
| Hosting | Vercel (serverless/edge) |

## Environment Setup

- **App env file:** `tacet/.env.local` (create from `tacet/.env.example` if present)
- **V1 required:** `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox public token (Map.tsx, SearchBar geocoding)
- **V2 required:** `BRUITPARIF_API_KEY` — Bruitparif API key (server-side only, `/api/rumeur`); `NEXT_PUBLIC_ENABLE_RUMEUR` — feature flag for RUMEUR layer
- **CRITICAL:** Do not commit `tacet/.env.local`. Repo ignores `.env*` except `.env.example`.

## Development Commands

**From repo root:**

```bash
cd tacet && npm install
cd tacet && npm run dev          # → http://localhost:3000
cd tacet && npm run build
cd tacet && npm run start
cd tacet && npm run lint
```

**Data pipeline (root):**

```bash
npm run build:data               # build-paris-noise-iris.js
npm run prep:data                # prep-data-sources.js
npm run convert:bruitparif       # convert-bruitparif-shp.js
```

Outputs go to `data/` and can be copied to `tacet/public/data/` for the app.

## Active Codebase Structure (V2 Target)

```
tacet/
├── .github/workflows/ci.yml
├── e2e/                        # Playwright E2E (TAC-37)
├── public/data/                 # paris-noise-iris.geojson, iris-centroids.geojson
├── src/
│   ├── app/                     # page.tsx, layout.tsx, barometre/, elections/, accessible/, api/
│   ├── components/
│   │   ├── ui/                  # shadcn primitives
│   │   ├── tacet/               # IrisPopup, SearchBar, AppNav, ComparisonTray, ShareCard, etc.
│   │   └── map/                 # MapContainer, ScoreDotLayer, RumeurLayer, ChantiersLayer, ZoneHighlight
│   ├── hooks/                   # useRumeurData, useChantiersData, usePhotonSearch, useOnlineStatus
│   ├── contexts/MapContext.tsx
│   ├── lib/                     # noise-categories.ts, utils.ts, fetcher.ts, format-date.ts, constants.ts
│   ├── types/                   # iris.ts, rumeur.ts, chantiers.ts, layers.ts
│   └── sw.ts                    # Serwist service worker (TAC-33)
├── vitest.config.ts
├── lighthouserc.js
└── next.config.mjs
```

Path alias: `@/*` resolves to `tacet/src/*`.

## Key Domain Logic

- **`src/lib/noise-categories.ts`** — Source of truth for Score Sérénité: `NOISE_CATEGORIES`, `SERENITE_SCORES`, `getNoiseCategory`, `getSereniteScore`, `getNoiseCategoryFromDb`, `getSereniteScoreFromDb`. Also `PARIS_CENTER`, `DEFAULT_ZOOM`, brand colors, `arLabel()`.
- **IRIS zones:** 992 zones; data from `public/data/paris-noise-iris.geojson` (PPBE-derived). Score computed client-side from `lden_db` via `getSereniteScore()`.
- **Route Handlers:** Response shape `{ data, error, fallback, cachedAt }`. `/api/rumeur` (3-min cache), `/api/chantiers` (1-hour cache).

## Planning Artifact Index

| Artifact | Path |
|----------|------|
| PRD | `docs/planning/prd.md` |
| Product brief | `docs/planning/product-brief.md` |
| Research | `docs/planning/research/` (domain, market, technical) |
| UX design (V2) | `_bmad-output/planning-artifacts/ux-design-specification.md` |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` |
| Epics & stories list | `_bmad-output/planning-artifacts/epics.md` |
| **Project context** | `_bmad-output/planning-artifacts/project-context.md` (this file) |
| Story spec files | `_bmad-output/stories/story-X.Y.md` |
| PRD validation report | `_bmad-output/planning-artifacts/prd-validation-report.md` (5/5 Pass) |
| **Ambient agentic vision** | `docs/planning/ambient-agentic-vision.md` — Epic 6 roadmap, design sprint brief, source of truth for next phase |

## AI Agent Enforcement Rules

All AI agents implementing Tacet stories MUST:

1. Use `@/` path aliases for all cross-module imports — never relative `../../`
2. Co-locate tests next to source files with `.test.ts(x)` suffix
3. Return the standard `{ data, error, fallback, cachedAt }` format from all Route Handlers
4. Use PascalCase for components, camelCase for hooks/functions, kebab-case for utility files
5. Handle all 3 states (loading, error, success) in every data-fetching component
6. Use calm, informative language for error messages — never alarming, never red
7. Check source/layer existence before MapLibre `addSource`/`addLayer` calls
8. Use SWR for all server data fetching — no raw `fetch` in components
9. Keep all API keys in Route Handlers — never in client code
10. Use `next/dynamic` with `ssr: false` for any component that imports MapLibre

## External Blockers and Implementation Readiness

- **TAC-28 (Bruitparif API access):** External blocker. RUMEUR layer (TAC-35, Stories 3.1–3.3) is blocked until API access is resolved. Mock in dev; graceful degradation in prod.
- **TAC-29 → TAC-34, TAC-36, TAC-37** are **implementation-ready** and do not depend on TAC-28. They can be implemented in parallel while TAC-28 is resolved.
- Stories 3.1, 3.2, 3.3 (RUMEUR proxy, useRumeurData hook, RUMEUR timestamp/stale indicator) are marked **blocked** in story specs; all other stories are **ready**.

## BMAD Commands

BMAD agent commands live in `.claude/commands/` (e.g. `bmad-bmm-sprint-planning.md`, `bmad-bmm-create-story.md`, `bmad-bmm-dev-story.md`). Cursor uses `.cursor/rules/bmad-methodology.mdc` to route planning/sprint/story requests to the appropriate command. When `_bmad/` framework folder is absent, the AI follows command intent using the planning artifacts listed above.
