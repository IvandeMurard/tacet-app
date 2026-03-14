---
id: story-3.11
title: "RUMEUR sensor dB popup on circle click/hover (FR17)"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: review
depends: [story-3.2]
priority: low
storyPoints: 1
reviewFindings: [E3-L2]
---

# Story 3.11: RUMEUR sensor dB popup on circle click/hover (FR17)

## User Story

As a user,
I want to tap a RUMEUR sensor circle and see its current noise level in dB,
So that I can understand what the colour gradient means in concrete terms (FR17).

## Acceptance Criteria

**Given** the RUMEUR layer is active and circles are rendered
**When** the user clicks (or hovers on desktop) a sensor circle
**Then** a popup appears showing: station ID or a friendly label, `leq` value in dB (e.g. "55 dB"), and measurement timestamp (e.g. "Mesuré il y a 2 min")

**Given** a sensor has `lmin` and `lmax` values available
**When** the popup is shown
**Then** the min/max range is displayed alongside the `leq`

**Given** the user closes the popup or clicks elsewhere
**When** the popup was open
**Then** the popup is dismissed cleanly

## Technical Context

- Add `map.on("click", "rumeur-circles", handler)` in `MapContainer.tsx` inside the RUMEUR `useEffect` block.
- Feature properties already include `stationId`, `leq`, `timestamp`, `lmin`, `lmax` (set in `RumeurLayer.ts`).
- Format `leq` as `Math.round(leq) + " dB"`. Format `timestamp` with `formatRelativeTime()` from `tacet/src/lib/format-date.ts`.
- Reuse the MapLibre Popup API (same as any other popup in MapContainer) or a small inline React popup component.
- Clean up: `map.off("click", "rumeur-circles", handler)` in the `useEffect` cleanup return.

## Affected Files

- `tacet/src/components/map/MapContainer.tsx` (add click handler + popup for rumeur-circles)

## Testing Notes

- Unit: click handler renders popup with correct dB value and formatted timestamp.
- Verify that `formatRelativeTime` is called with the measurement timestamp (not `cachedAt`).

## Tasks/Subtasks

- [x] Write failing test (RED): RumeurPopup renders leq dB, station, timestamp, min/max range
- [x] Add `RumeurFeatureProperties` type to `tacet/src/types/rumeur.ts`
- [x] Add `selectedRumeur`/`setSelectedRumeur` to `MapContext.tsx`
- [x] Create `RumeurPopup.tsx`: glass-morphism popup with dB value, station, relative time, min/max
- [x] Update `MapContainer.tsx`: check `rumeur-circles` in `handleClick`, add `rumeur-circles` to `handleMouseMove`, clear `selectedRumeur` when RUMEUR layer disabled
- [x] Update `MapPageClient.tsx`: render `RumeurPopup` when `selectedRumeur !== null`
- [x] Run full test suite — all green, no regressions

## File List

- `tacet/src/types/rumeur.ts` (modified — adds RumeurFeatureProperties)
- `tacet/src/contexts/MapContext.tsx` (modified — adds selectedRumeur state)
- `tacet/src/components/tacet/RumeurPopup.tsx` (new)
- `tacet/src/components/tacet/RumeurPopup.test.tsx` (new)
- `tacet/src/components/map/MapContainer.tsx` (modified — rumeur click handling)
- `tacet/src/app/MapPageClient.tsx` (modified — renders RumeurPopup)

## Dev Agent Record

### Implementation Plan

- `RumeurFeatureProperties`: `{ stationId: string; timestamp: string | null; leq: number | null; lmin: number | null; lmax: number | null }` — maps GeoJSON feature properties from `RumeurLayer.ts`
- `MapContext`: add `selectedRumeur: RumeurFeatureProperties | null` + `setSelectedRumeur` state; expose in value + interface
- `RumeurPopup.tsx`: glass-morphism dialog (same class string as ChantierPopup), Radio icon header, large `leq` dB display (or "N/D"), lmin/lmax row when both non-null, `formatRelativeTime(timestamp)`, Escape/focus-trap same pattern
- `MapContainer.tsx` `handleClick`: check `rumeur-circles` FIRST (before chantier), set selectedRumeur + clear others + return; `setSelectedRumeur(null)` when clicking elsewhere; add `rumeur-circles` to `handleMouseMove` layers; add `setSelectedRumeur(null)` in rumeur useEffect else branch; deps: `[..., setSelectedRumeur]`
- `MapPageClient.tsx`: destructure `selectedRumeur, setSelectedRumeur`; render `{selectedRumeur && <RumeurPopup … />}`

## Change Log

- 2026-03-14: Story created from epic-3 exhaustive review finding E3-L2 (FR17 partial — dB not exposed in UI)
- 2026-03-14: Tasks/Subtasks + Dev Agent Record added; status → in-progress
- 2026-03-14: Implementation complete — RumeurFeatureProperties added to types/rumeur.ts, RumeurPopup component (9 tests), MapContext extended (selectedRumeur), MapContainer click/hover/cleanup wired, MapPageClient renders popup; 115/115 green, TS clean; status → review
