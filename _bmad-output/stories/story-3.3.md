---
id: story-3.3
tac: TAC-35
title: "RUMEUR timestamp and stale/unavailable indicator"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: blocked
blockedBy: TAC-28
depends: [story-3.2]
priority: must
storyPoints: 2
---

# Story 3.3: RUMEUR timestamp and stale/unavailable indicator

## User Story

As a user,
I want to see when RUMEUR data was last updated and whether it is currently unavailable,
So that I know if I'm looking at live or stale data (FR18, FR25, FR26).

## Acceptance Criteria

**Given** the RUMEUR layer is active
**When** data has been successfully fetched
**Then** the UI shows the timestamp of the most recent RUMEUR refresh (e.g. "Mis à jour il y a 2 min" or ISO in UI)
**Given** RUMEUR fetch fails or is stale
**When** the user views the map or a zone with RUMEUR context
**Then** a calm visual indicator is shown (e.g. "Données temps réel indisponibles" or amber message)
**And** static PPBE data and app remain usable (NFR-R2)
**When** the user is offline
**Then** cached RUMEUR data (if any) is distinguishable from live (e.g. "données en cache" or offline banner)

## Technical Context

- cachedAt from /api/rumeur response. Display relative time ("il y a 2 min") via format-date or Intl.
- Error/stale: useRumeurData error state → show calm message (amber, not red). OfflineBanner variant or inline.
- Offline: show "données en cache" when displaying cached RUMEUR; distinguish from live (e.g. label or banner).
- **Blocked by TAC-28**: implement UI patterns with mock data; full flow when RUMEUR available.

## Affected Files

- `tacet/src/lib/format-date.ts` (relative time helper)
- RUMEUR UI (layer legend, AppNav, or IrisPopup context): timestamp + error/stale + offline state
- `tacet/src/components/tacet/OfflineBanner.tsx` (variant for RUMEUR cache vs live)

## Dependencies

- Story 3.2 (useRumeurData, RUMEUR layer). **Blocked by TAC-28.**

## Testing Notes

- Unit: format-date relative time; component shows timestamp when data present, calm message on error.
- E2E: when RUMEUR enabled, timestamp visible; on failure, message shown and map still usable.
