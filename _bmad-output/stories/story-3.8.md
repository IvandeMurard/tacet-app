---
id: story-3.8
title: "Chantier location popup with address, end date, and type"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: review
depends: [story-3.4]
priority: high
storyPoints: 2
reviewFindings: [E3-H2]
---

# Story 3.8: Chantier location popup with address, end date, and type

## User Story

As a user,
I want to tap or hover a construction site circle on the map and see its address, expected end date, and work type,
So that I can understand how long and why a site near my zone will be active (FR20, AC 3.4).

## Acceptance Criteria

**Given** the Chantiers layer is active and circles are visible
**When** the user clicks (or hovers on desktop) a chantier circle
**Then** a popup or tooltip appears showing: address (`adresse`), end date (`date_fin`), and work type (`type_chantier`)

**Given** a chantier feature has no `adresse` or `date_fin`
**When** the popup is shown
**Then** graceful fallback text is displayed (e.g. "Adresse inconnue", "Date non précisée") — no blank fields

**Given** the user closes the popup or clicks elsewhere
**When** the popup was open
**Then** the popup is dismissed cleanly with no memory leak (event listeners removed)

## Technical Context

- Add a `click` event handler on the `chantiers-circles` layer in `MapContainer.tsx`, reusing the existing MapLibre popup pattern (see how IRIS zone selection works in `MapContainer`).
- Popup content: address, end date formatted as human-readable date (e.g. `new Date(date_fin).toLocaleDateString("fr-FR")`), type de chantier. Keep styling consistent with the IrisPopup aesthetic (clean, minimal).
- Use `map.on("click", "chantiers-circles", handler)` + `map.on("mouseenter"/"mouseleave", "chantiers-circles", cursor change)`.
- "Affected radius" (FR20) is not available in the Open Data Paris dataset — note this limitation in the popup ("Rayon non disponible") rather than omitting the popup entirely.
- Clean up: `map.off("click", ...)` in the `useEffect` return of the Chantiers effect block.

## Affected Files

- `tacet/src/components/map/MapContainer.tsx` (add click handler + popup for chantiers-circles)
- `tacet/src/components/tacet/ChantierPopup.tsx` (new — popup content component, or inline in MapContainer)

## Testing Notes

- Unit: click handler fires with correct feature properties; fallback text shown for missing fields.
- Popup cleanup tested via effect teardown (listener removed on unmount/layer off).

## Tasks/Subtasks

- [x] Write failing tests (RED): address/date/type render, fallback text, close button, Escape key, role="dialog", Rayon note
- [x] Create `tacet/src/types/chantier.ts` with `ChantierProperties` interface
- [x] Create `tacet/src/components/tacet/ChantierPopup.tsx` with glass-morphism styling
- [x] Add `selectedChantier`/`setSelectedChantier` to `MapContext.tsx`
- [x] Update `MapContainer.tsx`: add chantiers-circles check in handleClick + cursor in handleMouseMove + setSelectedChantier(null) when layer disabled
- [x] Update `MapPageClient.tsx`: render `<ChantierPopup>` when `selectedChantier` is non-null
- [x] Run full test suite — all green, no regressions

## File List

- `tacet/src/types/chantier.ts` (new)
- `tacet/src/components/tacet/ChantierPopup.tsx` (new)
- `tacet/src/components/tacet/ChantierPopup.test.tsx` (new)
- `tacet/src/contexts/MapContext.tsx` (modified)
- `tacet/src/components/map/MapContainer.tsx` (modified)
- `tacet/src/app/MapPageClient.tsx` (modified)

## Dev Agent Record

### Implementation Plan

- `ChantierProperties = { adresse: string; date_fin: string; type_chantier: string }` — matches GeoJSON feature properties set by `ChantiersLayer.ts`
- Global `handleClick` in `MapContainer`: query `chantiers-circles` FIRST; if hit → `setSelectedZone(null)` + return (layer-specific popup opens); else → `setSelectedChantier(null)`
- `handleMouseMove`: add `chantiers-circles` to queryRenderedFeatures layers array
- Chantiers `useEffect` else branch: `setSelectedChantier(null)` when layer is removed
- `ChantierPopup`: glass-morphism styled (`absolute bottom-8 left-1/2 z-30 ...`), same as `IrisPopup`; focus trap + Escape key; fallback text for empty fields; "Rayon d'impact non disponible" note

## Change Log

- 2026-03-14: Story created from epic-3 exhaustive review finding E3-H2
- 2026-03-14: Tasks/Subtasks + Dev Agent Record added; status → in-progress
- 2026-03-14: Implementation complete — ChantierProperties type, ChantierPopup component, MapContext + MapContainer + MapPageClient wired; 89/89 green, TS clean; status → review
