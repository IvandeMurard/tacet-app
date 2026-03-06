---
id: story-3.4
tac: TAC-36
title: "Chantiers API proxy and Chantiers layer"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: ready
blockedBy: null
depends: [story-1.1]
priority: must
storyPoints: 5
---

# Story 3.4: Chantiers API proxy and Chantiers layer

## User Story

As a user,
I want to turn on the Construction Sites layer and see active chantiers with location and end date,
So that I can factor temporary noise into my decision (FR19, FR20).

## Acceptance Criteria

**Given** the Chantiers layer is enabled
**When** the map is displayed
**Then** the app fetches Chantiers from GET /api/chantiers (Route Handler to Open Data Paris API v2.1)
**And** the handler caches the response (e.g. 1 hour) and returns { data, error, fallback, cachedAt }
**And** a MapLibre layer displays construction sites (e.g. symbols or circles) with location
**When** the user taps or hovers a chantier (if supported)
**Then** affected radius and expected end date are visible (tooltip or popup)
**When** the Chantiers API is unavailable
**Then** the layer fails gracefully with an informative message; rest of app unaffected (NFR-R3)

## Technical Context

- Route Handler: app/api/chantiers/route.ts. Fetch Open Data Paris API v2.1. Cache 1 hour. Response { data, error, fallback, cachedAt }.
- useChantiersData(enabled): SWR key /api/chantiers when layer enabled; lazy load on toggle. No refreshInterval.
- ChantiersLayer: MapLibre layer (symbols or circles), source 'chantiers', id e.g. 'chantiers-symbols'. Add/remove idempotent. Tooltip/popup: radius, end date.

## Affected Files

- `tacet/src/app/api/chantiers/route.ts`
- `tacet/src/hooks/useChantiersData.ts`
- `tacet/src/components/map/ChantiersLayer.ts`
- `tacet/src/components/tacet/AppNav.tsx` (Chantiers toggle)
- `tacet/src/types/chantiers.ts`

## Dependencies

- Story 1.1 (MapLibre). No dependency on TAC-28.

## Testing Notes

- Unit: handler returns shape and caches; useChantiersData fetches when enabled; ChantiersLayer add/remove.
- E2E: layer-toggle.spec.ts — enable Chantiers → layer appears; tap chantier → tooltip with end date; API failure → graceful message.
