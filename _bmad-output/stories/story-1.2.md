---
id: story-1.2
tac: TAC-30
title: "PMTiles protocol and base map tiles"
epic: "Epic 1: Open-Source Map Foundation"
status: ready
blockedBy: null
depends: [story-1.1]
priority: must
storyPoints: 3
---

# Story 1.2: PMTiles protocol and base map tiles

## User Story

As a user,
I want the base map tiles to load from a PMTiles source (e.g. Vercel Blob CDN),
So that tile delivery has no variable cost and stays fast on 3G (NFR-P6).

## Acceptance Criteria

**Given** MapLibre is initialized
**When** the PMTiles protocol is registered via maplibregl.addProtocol('pmtiles', ...)
**Then** the map style uses a pmtiles:// or equivalent source for the base layer
**And** tiles load and render without CORS or mixed-content issues
**And** first tile visible within 1s on 3G (or documented constraint)

**Given** the app is built for production
**When** PMTiles asset is configured (next.config or env)
**Then** no API key for base tiles is required client-side

## Technical Context

- PMTiles via `pmtiles@^4.4.0`. Register: `let protocol = new pmtiles.Protocol(); maplibregl.addProtocol('pmtiles', protocol.tile);`
- Base map style uses pmtiles:// source (e.g. Vercel Blob CDN URL). No client-side API key.
- next.config or env for PMTiles asset URL. Architecture: base map tiles from Vercel Blob CDN.

## Affected Files

- `tacet/src/components/map/MapContainer.tsx` (protocol registration, style source)
- `tacet/next.config.mjs` (env or asset config)
- `tacet/package.json` (pmtiles ^4.4.0)

## Dependencies

- Story 1.1 (MapLibre migration) must be done first.

## Testing Notes

- Unit: protocol registered; style contains pmtiles source.
- E2E or manual: tiles render; no CORS errors in console.
- NFR-P6: first tile &lt; 1s on 3G (document or throttle test).
