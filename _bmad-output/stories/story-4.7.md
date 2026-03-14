---
id: story-4.7
title: "RUMEUR + Chantiers API runtime cache in service worker (E4-M2)"
epic: "Epic 4: Progressive Web App & Offline"
status: ready-for-dev
depends: [story-4.1, story-3.1, story-3.4]
priority: medium
storyPoints: 1
reviewFindings: [E4-M2]
---

# Story 4.7: RUMEUR + Chantiers API runtime cache in service worker

## User Story

As a user,
I want the RUMEUR and Chantiers data to be available from cache when I'm offline or when the upstream API is down,
So that the app continues to show the last known sensor readings and worksites (story 4.2 AC).

## Acceptance Criteria

**Given** the RUMEUR layer has been loaded at least once while online
**When** the user is offline and the RUMEUR layer is active
**Then** the SW serves the last cached `/api/rumeur` response (NetworkFirst with fallback)
**And** `RumeurStatusBar` shows `fallback: true` message as expected

**Given** the Chantiers layer has been loaded at least once while online
**When** the user is offline and the Chantiers layer is active
**Then** the SW serves the last cached `/api/chantiers` response

## Technical Context

- `tacet/src/app/sw.ts`: add `NetworkFirst` runtime caching for `/api/rumeur` and `/api/chantiers`. Use `networkTimeoutSeconds: 5` to fall back to cache quickly. Cache name: `"api-routes-cache"`. Add `CacheableResponsePlugin({ statuses: [200] })` to only cache successful responses.
- Pattern: `{ matcher: /\/api\/(rumeur|chantiers)$/, handler: new NetworkFirst({ ... }) }`
- Import `NetworkFirst` and `CacheableResponsePlugin` from `serwist`.
- The server-side in-memory cache on the API route already handles freshness when online; this SW cache handles the offline fallback layer.

## Affected Files

- `tacet/src/app/sw.ts` (add NetworkFirst runtime cache entries)

## Testing Notes

- Manual: enable RUMEUR layer; DevTools offline; reload → RUMEUR status bar shows fallback message with cached data.
- Unit: not applicable (SW tested via build/e2e).

## Tasks/Subtasks

- [ ] Import `NetworkFirst` and `CacheableResponsePlugin` from `serwist` in `sw.ts`
- [ ] Add runtime cache entries for `/api/rumeur` and `/api/chantiers`
- [ ] Verify import compatibility with `@serwist/next/worker` setup
- [ ] Manual smoke-test: offline RUMEUR shows cached data

## Change Log

- 2026-03-14: Story created from epic-4 exhaustive review finding E4-M2
