---
id: story-4.2
tac: TAC-33
title: "Offline last-visited zone and runtime caching"
epic: "Epic 4: Progressive Web App & Offline"
status: ready
blockedBy: null
depends: [story-4.1, story-2.2]
priority: must
storyPoints: 3
---

# Story 4.2: Offline last-visited zone and runtime caching

## User Story

As a user,
I want my last visited zone's data to be available when I'm offline,
So that I can still see that zone's Score without the network (FR29, NFR-R4).

## Acceptance Criteria

**Given** the user has selected and viewed at least one IRIS zone while online
**When** the user goes offline (or network is unavailable)
**Then** the last visited zone's Score and zone info are available (e.g. from Cache API + localStorage metadata)
**And** the app displays that zone's data when the user opens the app or navigates to the map
**And** a clear "Mode hors ligne" (or equivalent) indicator is shown (FR30)
**Given** runtime caching for tiles and RUMEUR is configured (Serwist)
**When** the user was online and had loaded tiles or RUMEUR
**Then** stale-while-revalidate (or cache-first where appropriate) is used per architecture
**And** offline fallback for RUMEUR shows cached data with a calm "données en cache" message

## Technical Context

- Last zone: on zone select, persist zone id + score + tier + name to localStorage. On load (offline), read and show in IrisPopup or dedicated view.
- Serwist runtime: tiles stale-while-revalidate; RUMEUR network-first, fallback cached + "données en cache" message.
- Offline indicator: OfflineBanner or equivalent when navigator.onLine false or fetch failure; "Mode hors ligne" / "Vous êtes hors ligne".

## Affected Files

- `tacet/src/contexts/MapContext.tsx` or dedicated hook (persist last zone to localStorage)
- `tacet/src/components/tacet/OfflineBanner.tsx`
- `tacet/src/sw.ts` (runtime cache strategies for tiles, RUMEUR)

## Dependencies

- Story 4.1 (Serwist). Story 2.2 (IrisPopup) for displaying last zone.

## Testing Notes

- Manual/E2E: select zone online, go offline, reload → last zone data and offline banner. RUMEUR cached + message.
- E2E: offline-mode.spec.ts — last zone available, banner visible.
