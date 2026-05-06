---
id: story-5.2
tac: TAC-46
title: "Full keyboard navigation and focus management"
epic: "Epic 5: Accessibility, Compliance & End-to-End Quality"
status: ready
blockedBy: null
depends: [story-2.2]
priority: must
storyPoints: 5
---

# Story 5.2: Full keyboard navigation and focus management

## User Story

As a keyboard user,
I want to reach every interactive element (search, map controls, layer toggles, zone panel, share, pin) in a logical tab order and operate them with Enter/Space/Escape,
So that I don't need a mouse or touch (FR33, NFR-A3).

## Acceptance Criteria

**Given** the user is on the map page
**When** they press Tab repeatedly
**Then** focus moves through: skip link (if any), SearchBar, map (or "focus map" control), AppNav buttons (layers, pins, settings), then into IrisPopup when open
**And** focus is visible (e.g. outline-2 outline-teal-500)
**When** IrisPopup is open
**Then** focus is trapped inside the panel until Escape or explicit close
**And** Escape closes the panel and returns focus to the trigger (dot or search)
**Given** layer toggles and buttons are focusable
**When** focused and activated with Enter or Space
**Then** the corresponding action runs (toggle layer, open tray, etc.)
**And** all icon-only buttons have aria-label

## Technical Context

- Tab order: skip link → SearchBar → map/focus map control → AppNav (layers, pins, settings) → IrisPopup when open. Use tabIndex and DOM order; avoid positive tabIndex.
- Focus visible: outline-2 outline-teal-500 or focus-visible ring (Tailwind). No outline: none without visible alternative.
- IrisPopup: focus trap (e.g. focus-trap-react or manual); Escape closes and returns focus to trigger (MapContext selectedZone setter clears and focus move).
- Icon-only buttons: aria-label on every icon button (AppNav, IrisPopup share/pin, etc.).

## Affected Files

- `tacet/src/components/tacet/SearchBar.tsx` (focusable)
- `tacet/src/components/tacet/AppNav.tsx` (focusable buttons, aria-labels)
- `tacet/src/components/tacet/IrisPopup.tsx` (focus trap, Escape, aria-labels)
- Map page (skip link, "focus map" control if needed)
- Global CSS or Tailwind (focus-visible styles)

## Dependencies

- Story 2.2 (IrisPopup). AppNav and SearchBar from Epic 2 and 3.

## Testing Notes

- Manual: Tab through all controls; Enter/Space activate; Escape in popup. All icon buttons have aria-label.
- E2E: keyboard-only flow. Lighthouse a11y: focus order, focus visible, button labels.
