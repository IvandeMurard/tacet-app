---
id: story-1.1
tac: TAC-29
title: "MapLibre GL JS migration and map container"
epic: "Epic 1: Open-Source Map Foundation"
status: ready
blockedBy: null
depends: []
priority: must
storyPoints: 5
---

# Story 1.1: MapLibre GL JS migration and map container

## User Story

As a user,
I want the Paris map to load using an open-source map engine (MapLibre) with no variable API cost,
So that I can browse neighborhoods reliably without dependency on paid tile/geocoding services.

## Acceptance Criteria

**Given** the existing Next.js 14 app with Mapbox-based map
**When** the app loads the main map page
**Then** the map uses MapLibre GL JS (dynamic import, ssr: false) instead of Mapbox
**And** the map initializes with Paris center and default zoom from existing constants
**And** pan and zoom controls (and fullscreen if present) work correctly
**And** no Mapbox or react-map-gl packages remain in dependencies

**Given** the map container is mounted
**When** the viewport resizes
**Then** the map canvas resizes appropriately (resize observer or map.resize())

## Technical Context

- MapLibre direct integration: no react-map-gl wrapper. Direct `maplibregl.Map` via `useRef` + `useEffect`.
- Loaded via `next/dynamic(() => import('./MapContainer'), { ssr: false })`.
- Map instance shared via MapContext. Paris center and default zoom from `lib/noise-categories.ts` (PARIS_CENTER, DEFAULT_ZOOM).
- Remove mapbox-gl, react-map-gl, @types/mapbox-gl; add maplibre-gl ^5.19.0.

## Affected Files

- `tacet/src/components/map/MapContainer.tsx`
- `tacet/src/app/page.tsx` (dynamic import)
- `tacet/package.json` (deps)
- `tacet/src/contexts/MapContext.tsx` (mapRef)

## Dependencies

None (first story in map migration).

## Testing Notes

- MapContainer unit test: map initializes with correct center/zoom; resize triggers map.resize().
- E2E: map loads, pan/zoom work (zone-selection.spec.ts or equivalent).
