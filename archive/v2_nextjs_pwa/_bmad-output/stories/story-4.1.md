---
id: story-4.1
tac: TAC-33
title: "Serwist service worker and precache (app shell + GeoJSON)"
epic: "Epic 4: Progressive Web App & Offline"
status: ready
blockedBy: null
depends: [story-1.1]
priority: must
storyPoints: 5
---

# Story 4.1: Serwist service worker and precache (app shell + GeoJSON)

## User Story

As a user,
I want the app to work as a PWA with a service worker that caches the shell and critical data,
So that repeat visits load quickly and I can use the app offline (FR28, FR31, NFR-P2).

## Acceptance Criteria

**Given** the project uses Next.js and Serwist (or equivalent) is configured
**When** the app is built and deployed
**Then** a service worker is registered that precaches the app shell (HTML, JS, CSS, fonts)
**And** paris-noise-iris.geojson (or required IRIS data) is precached so the map can render offline
**When** the user visits the app a second time (or after install)
**Then** the shell loads from cache and is available in under 2 seconds (FR31)
**And** the PWA is installable (manifest.json, icons, install prompt or browser UI)

## Technical Context

- Serwist: @serwist/next, serwist (dev). next.config wraps with Serwist. sw.ts entry. Precache: app shell (HTML, JS, CSS, fonts) + paris-noise-iris.geojson from public/data/.
- Build: service worker generated and registered. Installable: manifest + icons (Story 4.4 can refine). Architecture: precache at build; runtime cache for tiles (stale-while-revalidate), RUMEUR (network-first).

## Affected Files

- `tacet/src/sw.ts` (Serwist entry)
- `tacet/next.config.mjs` (Serwist wrapper, precache list)
- `tacet/package.json` (@serwist/next, serwist)

## Dependencies

- Story 1.1 (MapLibre) so tile format is correct for caching. GeoJSON path stable (public/data/).

## Testing Notes

- Manual: build, deploy or serve; second load from cache; offline mode shows cached shell + map data.
- Lighthouse PWA: service worker registered, precache present. FR31: shell < 2s on repeat visit.
