---
id: story-4.5
title: "GeoJSON runtime cache for offline map rendering (E4-H1)"
epic: "Epic 4: Progressive Web App & Offline"
status: review
depends: [story-4.1]
priority: high
storyPoints: 1
reviewFindings: [E4-H1]
---

# Story 4.5: GeoJSON runtime cache for offline map rendering

## User Story

As a user,
I want the noise map to render even when I have no network connection,
So that I can consult zone scores offline after visiting the app once (FR29).

## Acceptance Criteria

**Given** the user has visited the app at least once while online (IRIS GeoJSON was fetched)
**When** the user opens the app offline
**Then** the map renders with IRIS zone colours (paris-noise-iris.geojson served from SW cache)
**And** the zone centroid dots render (iris-centroids.geojson served from SW cache)

**Given** the GeoJSON files are static between deployments
**When** the service worker processes a fetch for `/data/paris-noise-iris.geojson` or `/data/iris-centroids.geojson`
**Then** a CacheFirst strategy is used (serve from cache; update cache on network success)

## Technical Context

- `tacet/src/app/sw.ts`: add a custom `runtimeCaching` entry for `/data/*.geojson` using Serwist's `CacheFirst` strategy with a `CacheableResponsePlugin` (status 200). Match URL pattern `({ url }) => url.pathname.startsWith("/data/") && url.pathname.endsWith(".geojson")`.
- Alternatively, add to `next.config.mjs` as `additionalPrecacheEntries` — but runtime caching is preferred since the GeoJSON files are large (~several MB) and may not need to be precached at install time.
- Cache name: `"geojson-cache"`.

## Affected Files

- `tacet/src/app/sw.ts` (add runtimeCaching entry for GeoJSON)

## Testing Notes

- Manual: load app online; DevTools → Application → Service Worker → Offline; reload → map renders.
- Unit: not applicable (SW tested via build/e2e).

## Tasks/Subtasks

- [ ] Add CacheFirst runtime cache entry in `sw.ts` for `/data/*.geojson`
- [ ] Verify `defaultCache` is not already handling this (check Serwist defaultCache scope)
- [ ] Manual smoke-test: offline map render after first online visit

## Change Log

- 2026-03-14: Story created from epic-4 exhaustive review finding E4-H1
