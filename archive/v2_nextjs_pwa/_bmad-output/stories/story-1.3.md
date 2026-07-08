---
id: story-1.3
tac: TAC-29
title: "IRIS Score Dots layer and zone selection"
epic: "Epic 1: Open-Source Map Foundation"
status: ready
blockedBy: null
depends: [story-1.1, story-1.2]
priority: must
storyPoints: 5
---

# Story 1.3: IRIS Score Dots layer and zone selection

## User Story

As a user,
I want to see Score Sérénité as colored dots at zone centroids and select a zone by tapping a dot,
So that I can explore Paris noise at a glance and open zone details (FR1, FR3, FR4).

## Acceptance Criteria

**Given** IRIS centroid GeoJSON (or derived from paris-noise-iris.geojson) is available
**When** the map is at neighborhood zoom (e.g. ≥ 13)
**Then** a MapLibre circle layer displays one dot per IRIS at centroid, colored by tier (noise-categories)
**And** dot size scales with zoom (e.g. 8px at 13, 12px at 16)
**When** the user taps or clicks a dot
**Then** that IRIS zone is selected (state in MapContext)
**And** the selected zone is visually emphasized (e.g. larger dot, pulse, or boundary)
**And** no second tap is required to open the zone panel (panel opens automatically—see Epic 2)

**Given** zoom is below neighborhood level (e.g. < 13)
**When** clustering is enabled
**Then** dots cluster with arrondissement-level or cluster count; tapping cluster zooms in or expands

## Technical Context

- ScoreDotLayer: MapLibre circle layer, source from iris centroids GeoJSON. Color from `getNoiseCategory()` / tier in noise-categories.ts.
- Layer IDs: `score-dots-circles` (architecture: {source}-{type}). Add/remove idempotent.
- MapContext.setSelectedZone() on click. Selected zone drives IrisPopup (Epic 2) and ZoneHighlight (Story 1.4).
- Centroids: from paris-noise-iris.geojson or generated iris-centroids.geojson in public/data/.

## Affected Files

- `tacet/src/components/map/ScoreDotLayer.ts`
- `tacet/src/components/map/MapContainer.tsx` (add layer, click handler)
- `tacet/src/contexts/MapContext.tsx`
- `tacet/public/data/iris-centroids.geojson` (or generation in data pipeline)
- `tacet/src/lib/noise-categories.ts` (tier colors)

## Dependencies

- Story 1.1 (MapLibre), 1.2 (PMTiles). IrisPopup auto-reveal is Epic 2.

## Testing Notes

- Unit: getNoiseCategory/getSereniteScore for tier; ScoreDotLayer add/remove.
- E2E: tap dot → selection state; zone panel opens (when 2.2 done).
