---
id: story-3.1
tac: TAC-35
title: "RUMEUR API proxy and server-side cache"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: done
blockedBy: TAC-28
depends: []
priority: must
storyPoints: 3
---

# Story 3.1: RUMEUR API proxy and server-side cache

## User Story

As a developer/product,
I want a Next.js Route Handler that fetches Bruitparif RUMEUR data and caches it for 3 minutes,
So that the client never exposes the API key and we minimize upstream calls (TAC-35, NFR-SC2).

## Acceptance Criteria

**Given** BRUITPARIF_API_KEY is set in Vercel (or env)
**When** GET /api/rumeur is called
**Then** the handler fetches RUMEUR data from Bruitparif (server-side only)
**And** the response is cached in memory (or equivalent) for 3 minutes
**And** the response shape is consistent: e.g. { data, error, fallback, cachedAt }
**When** the upstream request fails
**Then** the handler returns a structured error and optionally last cached data (fallback: true)
**And** no API key is present in client bundle or response

## Technical Context

- Route Handler: app/api/rumeur/route.ts. Fetch Bruitparif RUMEUR API server-side. BRUITPARIF_API_KEY from env (Vercel). In-memory cache 3 min.
- Response: { data, error, fallback, cachedAt } per architecture. On upstream failure: fallback: true + last cached if available.
- TAC-28 (Bruitparif API access) is an external blocker; implement handler and mock when key unavailable; graceful degradation in prod.

## Affected Files

- `tacet/src/app/api/rumeur/route.ts`
- `tacet/.env.example` (BRUITPARIF_API_KEY documented)

## Dependencies

- **Blocked by TAC-28** (Bruitparif API access). Can implement route shape and cache logic with mock data until API available.

## Testing Notes

- Unit: handler returns correct shape; cache TTL; on failure returns fallback when cached data exists.
- No E2E against live RUMEUR until TAC-28 resolved.

## Tasks/Subtasks

- [x] Create `tacet/src/app/api/rumeur/route.ts` — GET handler with 3-min in-memory cache
- [x] Return `{ data, error, fallback, cachedAt }` response shape for all paths
- [x] Return mock data when `BRUITPARIF_API_KEY` is absent (dev/CI)
- [x] Return last cached data with `fallback: true` on upstream failure
- [x] Return 502 when upstream fails and no cache exists
- [x] Document `BRUITPARIF_API_KEY` and `NEXT_PUBLIC_ENABLE_RUMEUR` in `tacet/.env.example`
- [x] Write unit tests: mock-key path, fetch path, TTL, fallback, 502

## File List

- `tacet/src/app/api/rumeur/route.ts` (created)
- `tacet/src/app/api/rumeur/route.test.ts` (created)
- `tacet/.env.example` (created)

## Dev Agent Record

### Completion Notes

Implemented `GET /api/rumeur` Next.js Route Handler with:
- **Module-level in-memory cache** (3-min TTL via `Date.now()` comparison) — preserves last-good data across requests
- **Three execution paths:**
  1. Cache hit → serve cached data, `fallback: false`
  2. No API key → serve `MOCK_DATA`, `fallback: false` (dev/CI while TAC-28 pending)
  3. API key present → fetch Bruitparif; on success update cache; on failure serve last cache with `fallback: true` or 502 if no cache
- **API key security:** `BRUITPARIF_API_KEY` only read in server-side Route Handler, never exposed in response or client bundle
- **`BRUITPARIF_API_URL`** is also configurable via env (for future staging/testing environments)
- 7 unit tests covering all paths; 25/25 total suite passes; lint clean
- Actual Bruitparif endpoint URL will be finalized when TAC-28 is resolved (TODO comment in code)

## Senior Developer Review

**Reviewer:** Senior Dev Agent
**Date:** 2026-03-13
**Outcome:** ✅ APPROVED — all findings resolved, 29/29 tests green

### Findings Summary

| ID | Sev | Finding | Resolution |
|----|-----|---------|------------|
| H1 | HIGH | No shape validation on upstream response — malformed JSON cached silently | **Fixed:** `isValidRumeurData()` runtime guard added; invalid shapes throw → 502 |
| H2 | HIGH | Mock data used module-level constant with epoch timestamp (`new Date(0)`) — false "stale" state in story 3.3 | **Fixed:** Replaced with `getMockData()` function returning `new Date().toISOString()` per call |
| M1 | MED | No in-flight deduplication — concurrent cache-miss requests each triggered a separate upstream fetch (violated NFR-SC2) | **Fixed:** `inflightFetch: Promise<RumeurData> \| null` coalesces concurrent requests; `.finally()` resets after settle |
| M2 | MED | Cache-hit test only asserted `fetchMock` call count, not data equality | **Fixed:** Cache-hit test now asserts `cachedBody.data` equals `mockData` |
| M3 | MED | `AGENTS.md` and `README.md` have unrelated modifications in git working tree | **Process note:** Cannot be auto-fixed in code. Must be committed/stashed separately before story-3.1 PR. ⚠️ Manual action required. |
| M4 | MED | Auth header uses `Bearer` scheme without confirmation from Bruitparif | **Fixed:** `TODO(TAC-28)` comment on Authorization header; format to be confirmed before production activation |
| L1 | LOW | No test for `BRUITPARIF_API_URL` env override | **Fixed:** Test added verifying `fetchMock` is called with the custom URL |
| L2 | LOW | `cachedAt` semantics undocumented — downstream consumers could misread as "now" | **Fixed:** Inline comment in GET handler clarifies `cachedAt` reflects fetch time, not current time |
| L3 | LOW | No `Cache-Control: no-store` header — responses could be cached by CDN/proxy | **Fixed:** `NO_STORE` constant applied to all response paths |

### Post-Fix Verification

- Route handler rewritten: shape validation, fresh mock timestamps, in-flight deduplication, `Cache-Control: no-store`
- Test suite expanded: 7 → 11 tests, covering all new behaviors
- Full suite: **29/29 pass** (11 route + 18 noise-categories)
- Lint: clean

## Change Log

- 2026-03-13: Implemented route handler, in-memory cache, mock fallback, and unit tests (story-3.1, TAC-35)
- 2026-03-13: Code review pass — resolved H1/H2/M1–M4/L1–L3; expanded tests to 11; 29/29 green; status → done
