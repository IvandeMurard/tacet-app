---
id: story-2.5
tac: TAC-41
title: "Zone pin and ComparisonTray (max 3)"
epic: "Epic 2: Address Discovery & Acoustic Score"
status: ready
blockedBy: null
depends: [story-2.2]
priority: must
storyPoints: 5
---

# Story 2.5: Zone pin and ComparisonTray (max 3)

## User Story

As a user,
I want to pin the current zone to a shortlist and compare up to 3 zones side by side,
So that I can decide between addresses (e.g. Maria comparing two apartments, Sophie comparing schools) (FR6 context, UX pin → compare).

## Acceptance Criteria

**Given** the IrisPopup is open and the user has not yet pinned 3 zones
**When** the user taps Pin (or equivalent)
**Then** the current zone is added to pinned zones (MapContext + sessionStorage, max 3)
**And** the pin button state reflects "pinned" for this zone
**Given** one or more zones are pinned
**When** the user opens the comparison tray (e.g. from AppNav or pinned count)
**Then** pinned zones are listed with zone name, arrondissement, Score, and tier
**And** the user can unpin a zone from the tray
**And** the tray is accessible without leaving the map (e.g. overlay or slide-out)
**When** the user pins a fourth zone
**Then** the oldest pin is dropped (FIFO) or the UI prevents adding beyond 3; behavior is clear

## Technical Context

- MapContext: pinnedZones (array, max 3), pinZone(zone), unpinZone(zoneId). Sync to sessionStorage on change.
- IrisPopup: Pin button; when pinned, show "pinned" state; call pinZone(selectedZone).
- ComparisonTray: list pinned zones (name, arrondissement, Score, tier); unpin from tray. Opened from AppNav or pinned count. Overlay or slide-out, no route change.
- Fourth pin: FIFO drop oldest or disable add when length === 3; document behavior.

## Affected Files

- `tacet/src/contexts/MapContext.tsx` (pinnedZones, pinZone, unpinZone, sessionStorage)
- `tacet/src/components/tacet/IrisPopup.tsx` (Pin button)
- `tacet/src/components/tacet/ComparisonTray.tsx`
- `tacet/src/components/tacet/AppNav.tsx` (entry to tray, pinned count)

## Dependencies

- Story 2.2 (IrisPopup, selectedZone). MapContext already has selectedZone; add pinnedZones.

## Testing Notes

- Unit: pinZone/unpinZone; max 3; sessionStorage sync. ComparisonTray renders list and unpin.
- E2E: pin two zones, open tray, see both; unpin one; pin fourth → FIFO or blocked.
