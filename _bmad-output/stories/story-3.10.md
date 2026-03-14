---
id: story-3.10
title: "Baromètre du Silence server-side data fetch and ISR"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: review
depends: [story-3.6]
priority: medium
storyPoints: 1
reviewFindings: [E3-M4]
---

# Story 3.10: Baromètre du Silence server-side data fetch and ISR

## User Story

As a user,
I want the Baromètre du Silence page to load its ranking data on the server,
So that the initial HTML contains the ranking (better LCP, SEO, and offline resilience via Serwist precache).

## Acceptance Criteria

**Given** I navigate to `/barometre`
**When** the page loads
**Then** the ranking data is present in the initial server-rendered HTML (no client-side fetch waterfall)

**Given** the arrondissement GeoJSON data is static (updated with each deployment)
**When** the page is rendered
**Then** ISR or static generation is used (not dynamic SSR on every request) — `revalidate` set appropriately or `export const dynamic = "force-static"`

**Given** the data is loaded on the server
**When** the `BarometreChart` component renders
**Then** it receives pre-computed ranked data as props (not fetching via `fetch("/data/...")` in client-side effect)

## Technical Context

- `tacet/src/app/barometre/page.tsx`: convert to async Server Component; read the GeoJSON with `import` or `fs.readFileSync` at build time, or use `fetch("…/paris-noise-arrondissements.geojson", { cache: "force-cache" })`.
- `BarometreChart.tsx`: remove `useEffect` + `fetch` pattern; accept `data` prop instead of fetching internally.
- Since the GeoJSON lives in `/public/data/`, prefer a static `import` in the page (webpack will inline it at build time) for the simplest approach.
- Add `export const dynamic = "force-static"` or `export const revalidate = 86400` to the page if needed.

## Affected Files

- `tacet/src/app/barometre/page.tsx` (convert to async Server Component with static data import)
- `tacet/src/components/tacet/BarometreChart.tsx` (remove internal fetch; accept props)

## Testing Notes

- Verify rendered HTML contains ranking data (no empty skeleton on first load).
- No client-side fetch to `/data/paris-noise-arrondissements.geojson` in the network waterfall.

## Tasks/Subtasks

- [x] Write failing test (RED): BarometreChart renders items from `arrondissements` prop (not from fetch)
- [x] Refactor `BarometreChart.tsx`: accept `arrondissements: ArrProperties[]` prop; remove useEffect + fetch; keep share button
- [x] Refactor `barometre/page.tsx`: static import GeoJSON, sort, pass as props; add `export const dynamic = "force-static"`
- [x] Run full test suite — all green, no regressions

## File List

- `tacet/src/components/BarometreChart.tsx` (modified — accepts props, no internal fetch)
- `tacet/src/components/BarometreChart.test.tsx` (new)
- `tacet/src/app/barometre/page.tsx` (modified — static import + props)

## Dev Agent Record

### Implementation Plan

- `BarometreChart.tsx`: remove `useState(arrondissements)` + `useEffect(fetch)` + `isLoading`; add `{ arrondissements: ArrProperties[] }` prop; keep `copied` state + `handleShare`; export `ArrProperties` type
- `barometre/page.tsx`: `import arrData from "public/data/paris-noise-arrondissements.geojson"`; sort `.features.map(f => f.properties)` by lden_db ascending; pass as `arrondissements` prop; `export const dynamic = "force-static"`

## Change Log

- 2026-03-14: Story created from epic-3 exhaustive review finding E3-M4
- 2026-03-14: Tasks/Subtasks + Dev Agent Record added; status → in-progress
- 2026-03-14: Implementation complete — BarometreChart accepts arrondissements prop (no fetch), barometre/page.tsx statically imports GeoJSON + dynamic="force-static", geojson.d.ts type declaration added; 106/106 green, TS clean; status → review
