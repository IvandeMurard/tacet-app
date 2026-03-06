---
id: story-3.2
tac: TAC-35
title: "useRumeurData hook and RUMEUR layer on map"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: blocked
blockedBy: TAC-28
depends: [story-3.1, story-1.1]
priority: must
storyPoints: 5
---

# Story 3.2: useRumeurData hook and RUMEUR layer on map

## User Story

As a user,
I want to turn on the RUMEUR layer and see real-time sensor points on the map, with automatic refresh every 3 minutes,
So that I can see current noise near a zone (FR16, FR17, FR24).

## Acceptance Criteria

**Given** the RUMEUR layer is enabled in AppNav (or layer controls)
**When** the map is displayed
**Then** useRumeurData (SWR, key /api/rumeur, refreshInterval 180000) fetches data
**And** a MapLibre layer (e.g. circle or symbol) displays RUMEUR sensor locations with current dB or color
**And** the layer is idempotent (add/update/remove per architecture layer pattern)
**When** new data arrives (after 3 min or on mount)
**Then** the layer updates within 1s of data receipt (NFR-P7)
**When** the layer is toggled off
**Then** the RUMEUR layer is removed from the map and polling can pause (SWR key null)

## Technical Context

- useRumeurData(enabled): SWR key /api/rumeur when enabled, null when disabled. refreshInterval: 180_000. Fetcher for { data, error, fallback, cachedAt }.
- RumeurLayer: MapLibre circle/symbol layer, source 'rumeur', layer id 'rumeur-circles'. Add/remove idempotent; setData on update.
- AppNav: layer toggle for RUMEUR; activeLayers in MapContext. Feature flag NEXT_PUBLIC_ENABLE_RUMEUR.
- **Blocked by TAC-28**: implement with mock or stub until Bruitparif API available.

## Affected Files

- `tacet/src/hooks/useRumeurData.ts`
- `tacet/src/components/map/RumeurLayer.ts`
- `tacet/src/components/tacet/AppNav.tsx` (RUMEUR toggle)
- `tacet/src/contexts/MapContext.tsx` (activeLayers)

## Dependencies

- Story 3.1 (API proxy). Story 1.1 (MapLibre). **Blocked by TAC-28.**

## Testing Notes

- Unit: useRumeurData with mock /api/rumeur; RumeurLayer add/remove/setData.
- E2E: toggle RUMEUR on → layer appears (with mock); toggle off → layer removed. Full E2E when TAC-28 resolved.
