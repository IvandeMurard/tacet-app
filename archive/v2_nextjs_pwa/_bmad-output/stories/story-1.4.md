---
id: story-1.4
tac: TAC-29
title: "Zone highlight and boundary on selection"
epic: "Epic 1: Open-Source Map Foundation"
status: ready
blockedBy: null
depends: [story-1.1, story-1.3]
priority: must
storyPoints: 2
---

# Story 1.4: Zone highlight and boundary on selection

## User Story

As a user,
I want the selected IRIS zone boundary to be visible (e.g. dashed outline and light fill),
So that I know exactly which area the Score refers to (FR3).

## Acceptance Criteria

**Given** an IRIS zone is selected and its geometry is available
**When** the map is rendered
**Then** a line layer (dashed) and optional fill layer (e.g. 3% opacity) show the IRIS polygon
**And** layer IDs follow architecture convention (e.g. zone-highlight-line, zone-highlight-fill)
**When** selection is cleared
**Then** highlight layers are removed or updated

## Technical Context

- ZoneHighlight: line layer (dashed) + fill layer (low opacity) for selected zone geometry. Source: zone-highlight; layer IDs: zone-highlight-line, zone-highlight-fill.
- Idempotent add/remove: check getSource/getLayer before add; clear on selection clear.
- Geometry from selectedZone (MapContext) — feature from GeoJSON or stored geometry.

## Affected Files

- `tacet/src/components/map/ZoneHighlight.ts` (or equivalent)
- `tacet/src/components/map/MapContainer.tsx` (subscribe to selectedZone, add/update/remove highlight)

## Dependencies

- Story 1.1 (MapLibre), 1.3 (zone selection in MapContext).

## Testing Notes

- Unit: ZoneHighlight add/remove with mock map and feature.
- E2E: select zone → boundary visible; clear selection → boundary gone.
