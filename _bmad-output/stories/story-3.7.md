---
id: story-3.7
title: "Chantiers API in-memory cache and fallback resilience"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: review
depends: [story-3.4]
priority: high
storyPoints: 2
reviewFindings: [E3-H1, E3-M1]
---

# Story 3.7: Chantiers API in-memory cache and fallback resilience

## User Story

As a user,
I want the Chantiers layer to remain visible even when the Open Data Paris API is temporarily unavailable,
So that the map remains informative during brief upstream outages (NFR-R3).

## Acceptance Criteria

**Given** the `/api/chantiers` route has successfully fetched data at least once
**When** a subsequent request is made and the upstream API fails
**Then** the route returns the last cached data with `fallback: true`, HTTP 200, and a non-null `cachedAt`

**Given** the `/api/chantiers` route has no cached data
**When** the upstream API fails
**Then** the route returns HTTP 502 with `data: null` and a calm error message (existing behaviour)

**Given** fresh data is in cache (within 1-hour TTL)
**When** a request arrives
**Then** the cached response is served immediately without a new upstream fetch

## Technical Context

- Replace `next: { revalidate: CACHE_SECONDS }` (Next.js Data Cache) with a module-level in-memory cache — same pattern as `tacet/src/app/api/rumeur/route.ts`.
- Cache shape: `{ data: ChantierRecord[]; cachedAt: string; fetchedAt: number }`. TTL: `CACHE_TTL_MS = 60 * 60 * 1000` (1 hour).
- On upstream failure: if `cache !== null`, return `{ data: cache.data, error: message, fallback: true, cachedAt: cache.cachedAt }` with HTTP 200.
- Remove `next: { revalidate }` from the `fetch()` call (no longer needed with in-memory cache).
- `Cache-Control: no-store` already added by story 3.4 quick-fix — keep it.

## Affected Files

- `tacet/src/app/api/chantiers/route.ts` (add in-memory cache + fallback path)
- `tacet/src/app/api/chantiers/route.test.ts` (add: cache hit, fallback on error, TTL expiry)

## Testing Notes

- Unit: cache hit returns identical data; fallback served on upstream error after first successful fetch; re-fetch occurs after TTL; 502 when no cache and upstream fails.
- Mirror the RUMEUR route test suite structure for the cache/fallback tests.

## Tasks/Subtasks

- [x] Write failing tests (RED): cache hit, fallback on upstream error after first fetch, TTL re-fetch, existing 502-no-cache test still passes
- [x] Implement module-level in-memory cache (`cache` + `CACHE_TTL_MS`) and fallback path in `tacet/src/app/api/chantiers/route.ts`; remove `next: { revalidate }` from fetch call
- [x] Run full test suite — all green, no regressions

## File List

- `tacet/src/app/api/chantiers/route.ts` (modified)
- `tacet/src/app/api/chantiers/route.test.ts` (modified)

## Dev Agent Record

### Implementation Plan

Mirror the RUMEUR route pattern exactly:
- Module-level `let cache: { data: ChantierRecord[]; cachedAt: string; fetchedAt: number } | null = null`
- `CACHE_TTL_MS = 60 * 60 * 1000` (1 hour)
- On success: populate `cache`, return `{ data, error: null, fallback: false, cachedAt }`
- On failure: if `cache` non-null, return `{ data: cache.data, error: msg, fallback: true, cachedAt: cache.cachedAt }` HTTP 200; else 502
- Remove `next: { revalidate: CACHE_SECONDS }` from `fetch()` call
- `Cache-Control: no-store` header retained on all responses

### Completion Notes

- `route.ts`: Added `ChantiersCache` interface + module-level `cache` variable + `CACHE_TTL_MS = 60 * 60 * 1000`. Cache hit path returns early before any `fetch()`. On error with populated cache: `{ data: cache.data, error: msg, fallback: true, cachedAt: cache.cachedAt }` HTTP 200. Removed `next: { revalidate }` from `fetch()` call. `Cache-Control: no-store` retained.
- `route.test.ts`: Added 3 new cache tests (cache hit: 1 upstream call for 2 GETs; fallback after TTL expiry + upstream failure; re-fetch after TTL). All 11 route tests green.
- 79/79 tests · TypeScript clean.

## Change Log

- 2026-03-14: Story created from epic-3 exhaustive review finding E3-H1/M1
- 2026-03-14: Tasks/Subtasks + Dev Agent Record added; status → in-progress
- 2026-03-14: Implementation complete — in-memory cache + fallback path; 79/79 green, TS clean; status → review
