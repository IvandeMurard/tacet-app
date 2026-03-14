---
id: story-4.6
title: "Auto-restore last visited zone on load (E4-M1)"
epic: "Epic 4: Progressive Web App & Offline"
status: review
depends: [story-4.2]
priority: medium
storyPoints: 1
reviewFindings: [E4-M1]
---

# Story 4.6: Auto-restore last visited zone on load

## User Story

As a user,
I want to see my last visited zone's Score and info when I open the app (especially offline),
So that the data I previously consulted is immediately accessible without having to navigate to the zone again (FR29, FR30).

## Acceptance Criteria

**Given** the user has previously selected at least one IRIS zone
**When** the user opens the app (online or offline)
**Then** the IrisPopup auto-opens with the last visited zone's Score, tier, and zone info on first load

**Given** the user is offline and the last zone data is in localStorage
**When** the IrisPopup is rendered with the cached zone data
**Then** the Score and tier are displayed correctly (same as when online)

**Given** the user has never selected a zone
**When** the app loads
**Then** no popup auto-opens (no regression for first-time users)

## Technical Context

- `MapPageClient.tsx`: on mount, if `lastVisitedZone !== null` and `selectedZone === null`, call `setSelectedZone(lastVisitedZone)`. Use a `useEffect` with `[lastVisitedZone, selectedZone, setSelectedZone]` deps, guarded by `hasRestored` ref to run only once.
- `lastVisitedZone` is already loaded from `localStorage` in `MapContext` — no new persistence logic needed.
- The IrisPopup already renders correctly from `IrisProperties` props — no changes needed there.

## Affected Files

- `tacet/src/app/MapPageClient.tsx` (add one-time restore useEffect)

## Testing Notes

- Unit: mock `lastVisitedZone` in context; verify `setSelectedZone` is called on mount; verify NOT called when `selectedZone` already set.
- E2E: load app after selecting a zone → IrisPopup auto-opens.

## Tasks/Subtasks

- [ ] Write failing test (RED): MapPageClient auto-opens IrisPopup with lastVisitedZone on first load
- [ ] Add one-time restore `useEffect` in MapPageClient
- [ ] Verify no double-open when user navigates directly (selectedZone already set)
- [ ] Run full test suite — all green, no regressions

## Change Log

- 2026-03-14: Story created from epic-4 exhaustive review finding E4-M1
