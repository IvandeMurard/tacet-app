---
id: story-2.1
tac: TAC-34
title: "Photon Komoot geocoding and SearchBar"
epic: "Epic 2: Address Discovery & Acoustic Score"
status: ready
blockedBy: null
depends: []
priority: must
storyPoints: 5
---

# Story 2.1: Photon Komoot geocoding and SearchBar

## User Story

As a user,
I want to type a Paris address and get autocomplete suggestions, then select one to move the map to that zone,
So that I can find the Score for any address without knowing the IRIS code (FR12, FR13, FR14).

## Acceptance Criteria

**Given** the user is on the map page and the SearchBar is visible
**When** the user types at least 2 characters (Paris-bounded query)
**Then** after 350ms debounce, a request is sent to Photon Komoot API (client-direct, no API key)
**And** up to 5 suggestions are shown in a dropdown (street + arrondissement or landmark)
**When** the user selects a suggestion
**Then** the map flies to the corresponding coordinates (flyTo, ~1200ms)
**And** the IRIS zone containing that point is resolved and set as selected (MapContext)
**And** the SearchBar collapses or closes; focus/UX per UX spec

**Given** the user clears the search or selects "clear"
**When** the action is triggered
**Then** the map returns to default view and selection is cleared (FR15)

## Technical Context

- Photon Komoot: client-direct to https://photon.komoot.io/api/?q={query}&bbox=2.22,48.81,2.47,48.90&limit=5&lang=fr. No proxy, no API key. Debounce 350ms.
- usePhotonSearch hook (SWR or fetch with dedupe). Paris bbox in request.
- SearchBar: input, dropdown, on select → mapRef.current?.flyTo(), point-in-polygon to resolve IRIS from paris-noise-iris.geojson, setSelectedZone(). Clear → default view + setSelectedZone(null).

## Affected Files

- `tacet/src/hooks/usePhotonSearch.ts`
- `tacet/src/components/tacet/SearchBar.tsx`
- `tacet/src/contexts/MapContext.tsx` (setSelectedZone, mapRef)

## Dependencies

None for geocoding. Map flyTo and zone resolution require map with GeoJSON (Story 1.1/1.3).

## Testing Notes

- Unit: usePhotonSearch returns suggestions; debounce 350ms. Point-in-polygon for IRIS resolution.
- E2E: address-search.spec.ts — type, select suggestion, map moves and zone selected; clear resets.
