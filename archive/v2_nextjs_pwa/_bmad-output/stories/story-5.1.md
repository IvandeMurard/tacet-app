---
id: story-5.1
tac: TAC-45
title: "TextAlternativeView (keyboard-navigable zone table)"
epic: "Epic 5: Accessibility, Compliance & End-to-End Quality"
status: ready
blockedBy: null
depends: [story-1.3]
priority: must
storyPoints: 5
---

# Story 5.1: TextAlternativeView (keyboard-navigable zone table)

## User Story

As a user with a screen reader or keyboard-only navigation,
I want a complete text alternative to the map that lists IRIS zones and scores in a table,
So that I can access the same acoustic information without the map canvas (FR32, NFR-A4).

## Acceptance Criteria

**Given** the app has an accessible route (e.g. /accessible or linked from footer "Vue accessible")
**When** the user navigates to the text alternative view
**Then** a data table (or list) displays IRIS zones with at least: zone name/ID, arrondissement, Score Sérénité, tier
**And** the table is keyboard-navigable (Tab through rows/cells, Enter to select)
**And** selecting a zone (e.g. row) focuses the map on that zone and/or opens IrisPopup when returning to map (if implemented)
**Given** the map page has a skip or link to this view
**When** the user activates it (e.g. Alt+T or "Vue accessible" link)
**Then** the text alternative view is reachable and announced (e.g. aria-label, landmark)
**And** the view is first-class (same design tokens, not a hidden fallback)

## Technical Context

- Route: app/accessible/page.tsx. TextAlternativeView: data table with zone name/ID, arrondissement, Score, tier. Data from same GeoJSON or API as map. SSR or client fetch.
- Keyboard: Tab through rows/cells; Enter to select zone (optional: store selection and on "return to map" focus zone / open IrisPopup). Skip link or "Vue accessible" in footer; Alt+T optional shortcut.
- First-class: same design tokens (Tailwind, theme); not a minimal fallback. ARIA: table role, headers, aria-label on landmark.

## Affected Files

- `tacet/src/app/accessible/page.tsx`
- `tacet/src/components/tacet/TextAlternativeView.tsx`
- Footer (link "Vue accessible") and/or skip link on map page

## Dependencies

- Story 1.3 (zone data, score computation). Optional: link back to map with focus (requires map + IrisPopup).

## Testing Notes

- Unit: TextAlternativeView renders table from zone data; keyboard nav.
- E2E: accessibility.spec.ts — navigate to /accessible, Tab through table, Enter select. Lighthouse a11y ≥ 95.
