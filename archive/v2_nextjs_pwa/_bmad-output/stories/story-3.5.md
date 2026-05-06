---
id: story-3.5
tac: TAC-43
title: "Chantiers limitation disclosure and Elections layer"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: ready
blockedBy: null
depends: [story-3.4]
priority: should
storyPoints: 3
---

# Story 3.5: Chantiers limitation disclosure and Elections layer

## User Story

As a user,
I want to understand that the static Score does not include temporary construction noise, and I want to toggle the 2026 Elections thematic layer,
So that I interpret the data correctly and can use the elections context (FR21, FR22).

## Acceptance Criteria

**Given** the Chantiers layer is on and the user views zone info or legend
**When** relevant
**Then** a short, calm disclosure is visible (e.g. "Le Score annuel ne reflète pas les chantiers en cours")
**Given** the Elections layer exists in the app (V1 or V2)
**When** the user toggles the 2026 Elections layer in AppNav
**Then** the thematic layer is shown or hidden on the map
**And** it contextualizes noise data for the municipal campaign per PRD

## Technical Context

- Chantiers disclosure: copy in zone info panel, legend, or layer control. Calm tone. One line.
- Elections layer: ElectionsLayer.ts, add/remove from map. Toggle in AppNav (activeLayers). Data from existing V1 or new source; contextualizes noise for 2026 municipal campaign per PRD.

## Affected Files

- Zone info or Legend component (disclosure copy)
- `tacet/src/components/map/ElectionsLayer.ts`
- `tacet/src/components/tacet/AppNav.tsx` (Elections toggle)
- `tacet/src/contexts/MapContext.tsx` (activeLayers: elections)

## Dependencies

- Story 3.4 (Chantiers layer) for disclosure context. Elections can be implemented in parallel if layer pattern exists.

## Testing Notes

- Unit: disclosure visible when Chantiers on; Elections layer add/remove.
- E2E: enable Chantiers → see disclosure; toggle Elections → layer on/off.
