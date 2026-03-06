---
id: story-3.1
tac: TAC-35
title: "RUMEUR API proxy and server-side cache"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: blocked
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
