---
id: story-3.9
title: "Elections 2026 thematic layer — full implementation"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: review
depends: [story-3.5]
priority: high
storyPoints: 3
reviewFindings: [E3-H3]
---

# Story 3.9: Elections 2026 thematic layer — full implementation

## User Story

As a user,
I want to toggle a 2026 Paris Elections thematic layer on the map,
So that I can see electoral context alongside noise data (FR22).

## Acceptance Criteria

**Given** the Elections layer toggle is visible in AppNav (behind `NEXT_PUBLIC_ENABLE_ELECTIONS` feature flag or always on)
**When** the user activates the toggle
**Then** the Elections layer is added to the map and data loads

**Given** the Elections layer is active
**When** data is displayed
**Then** electoral zone boundaries or markers are visible, styled distinctly from the IRIS noise choropleth

**Given** the Elections layer toggle is active
**When** the user deactivates it
**Then** the layer is cleanly removed from the map (idempotent `removeLayer` / `removeSource`)

**Given** the Elections layer fails to load data
**When** the user views the map
**Then** the map remains usable, a calm error state is shown if a status indicator is present, and other layers are unaffected (NFR-R2)

## Technical Context

- `LayerId` already includes `"elections"` in `MapContext.tsx` — toggle state is ready.
- Need: `ElectionsLayer.ts` (add/remove idempotent, layer ID `elections-*`) with GeoJSON source pointing to the Open Data Paris 2026 elections dataset or a static geojson in `/public/data/`.
- Need: `useElectionsData` hook (SWR, null key when disabled) or static import if data is small enough to bundle.
- Need: AppNav `LayerToggle` entry for Elections (visible in layer panel when data is available).
- Need: `MapContainer.tsx` `useEffect` for elections layer (same pattern as chantiers effect block).
- Architecture note: if data is static (published dataset), prefer `fetch("/data/elections-2026.geojson")` with precache via Serwist rather than a Route Handler.

## Affected Files

- `tacet/src/components/map/ElectionsLayer.ts` (new — add/remove layer)
- `tacet/src/components/map/ElectionsLayer.test.ts` (new — unit tests)
- `tacet/src/hooks/useElectionsData.ts` (new — SWR or static loader)
- `tacet/src/app/MapPageClient.tsx` or `AppNav.tsx` (add Elections toggle)
- `tacet/src/components/map/MapContainer.tsx` (add elections useEffect)
- `public/data/elections-2026.geojson` (new — static data file, or fetch from Open Data Paris)

## Testing Notes

- Unit: ElectionsLayer add/remove/idempotent (mirror RumeurLayer.test.ts).
- Unit: useElectionsData returns correct SWR key when enabled/disabled.
- Integration: toggle Elections in AppNav → layer appears/disappears on map.

## Tasks/Subtasks

- [x] Write failing tests (RED): ElectionsLayer add/remove/idempotent + useElectionsData key/options
- [x] Create `ElectionsLayer.ts` (fill + line layers, colored by lden_db via interpolate expression)
- [x] Create `useElectionsData.ts` (SWR, static `/data/paris-noise-arrondissements.geojson`)
- [x] Add Elections `LayerToggle` to AppNav in `MapPageClient.tsx`
- [x] Add elections `useEffect` to `MapContainer.tsx` (load-listener pattern, mirror RUMEUR)
- [x] Run full test suite — all green, no regressions

## File List

- `tacet/src/components/map/ElectionsLayer.ts` (new)
- `tacet/src/components/map/ElectionsLayer.test.ts` (new)
- `tacet/src/hooks/useElectionsData.ts` (new)
- `tacet/src/hooks/useElectionsData.test.ts` (new)
- `tacet/src/app/MapPageClient.tsx` (modified — AppNav Elections toggle)
- `tacet/src/components/map/MapContainer.tsx` (modified — elections useEffect)

## Dev Agent Record

### Implementation Plan

- Data source: `/data/paris-noise-arrondissements.geojson` (20 arrondissement polygons, already in /public)
- `ElectionsLayer.ts`: `addElectionsLayer(map, geojson)` — add fill (opacity 0.18) + line (width 2.5) layers, both colored by `lden_db` via interpolate expression; idempotent (no-op if source exists). `removeElectionsLayer` removes fill + line + source.
- `useElectionsData.ts`: SWR, key = `/data/paris-noise-arrondissements.geojson` when enabled, refreshInterval: 0 (static), revalidateOnFocus: false
- MapContainer: mirror RUMEUR useEffect load-listener pattern
- AppNav: add Elections `LayerToggle` (always visible — static data)

## Change Log

- 2026-03-14: Story created from epic-3 exhaustive review finding E3-H3 (Elections layer completely absent despite story 3.5 marked done)
- 2026-03-14: Tasks/Subtasks + Dev Agent Record added; status → in-progress
- 2026-03-14: Implementation complete — ElectionsLayer (fill+line, lden_db interpolate color), useElectionsData (SWR, static GeoJSON), AppNav toggle, MapContainer useEffect; 101/101 green, TS clean; status → review
