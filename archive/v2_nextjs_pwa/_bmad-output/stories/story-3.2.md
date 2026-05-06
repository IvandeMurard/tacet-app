---
id: story-3.2
tac: TAC-35
title: "useRumeurData hook and RUMEUR layer on map"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: done
blockedBy: TAC-28
depends: [story-3.1, story-1.1]
priority: must
storyPoints: 5
---

# Story 3.2: useRumeurData hook and RUMEUR layer on map

## User Story

As a user,
I want to turn on the RUMEUR layer and see real-time sensor points on the map, with automatic refresh every 3 minutes,
So that I can see current noise near a zone (FR16, FR17, FR24).

## Acceptance Criteria

**Given** the RUMEUR layer is enabled in AppNav (or layer controls)
**When** the map is displayed
**Then** useRumeurData (SWR, key /api/rumeur, refreshInterval 180000) fetches data
**And** a MapLibre layer (e.g. circle or symbol) displays RUMEUR sensor locations with current dB or color
**And** the layer is idempotent (add/update/remove per architecture layer pattern)
**When** new data arrives (after 3 min or on mount)
**Then** the layer updates within 1s of data receipt (NFR-P7)
**When** the layer is toggled off
**Then** the RUMEUR layer is removed from the map and polling can pause (SWR key null)

## Technical Context

- useRumeurData(enabled): SWR key /api/rumeur when enabled, null when disabled. refreshInterval: 180_000. Fetcher for { data, error, fallback, cachedAt }.
- RumeurLayer: MapLibre circle/symbol layer, source 'rumeur', layer id 'rumeur-circles'. Add/remove idempotent; setData on update.
- AppNav: layer toggle for RUMEUR; activeLayers in MapContext. Feature flag NEXT_PUBLIC_ENABLE_RUMEUR.
- **Blocked by TAC-28**: implement with mock or stub until Bruitparif API available.

## Tasks/Subtasks

- [x] Patch `route.ts`: add `lat?/lon?` to `RumeurMeasurement`, update mock to 3 Paris stations
- [x] Create `tacet/src/hooks/useRumeurData.ts` — SWR hook (key, refreshInterval, response shape)
- [x] Create `tacet/src/components/map/RumeurLayer.ts` — add/remove/setData idempotent layer
- [x] Update `MapContext.tsx` — add `"rumeur"` to `LayerId` union
- [x] Update `MapContainer.tsx` — wire `useRumeurData` + RUMEUR layer `useEffect`
- [x] Update `MapPageClient.tsx` — add RUMEUR toggle in AppNav behind `NEXT_PUBLIC_ENABLE_RUMEUR`
- [x] Write unit tests: `useRumeurData.test.ts`, `RumeurLayer.test.ts`
- [x] Run full test suite — all green, no regressions

## Affected Files

- `tacet/src/hooks/useRumeurData.ts`
- `tacet/src/components/map/RumeurLayer.ts`
- `tacet/src/components/tacet/AppNav.tsx` (RUMEUR toggle)
- `tacet/src/contexts/MapContext.tsx` (activeLayers)

## Dependencies

- Story 3.1 (API proxy). Story 1.1 (MapLibre). **Blocked by TAC-28.**

## Testing Notes

- Unit: useRumeurData with mock /api/rumeur; RumeurLayer add/remove/setData.
- E2E: toggle RUMEUR on → layer appears (with mock); toggle off → layer removed. Full E2E when TAC-28 resolved.

## File List

- `tacet/src/app/api/rumeur/route.ts` (modified — RumeurMeasurement lat/lon, mock coords)
- `tacet/src/hooks/useRumeurData.ts` (created)
- `tacet/src/components/map/RumeurLayer.ts` (created)
- `tacet/src/contexts/MapContext.tsx` (modified — LayerId union)
- `tacet/src/components/map/MapContainer.tsx` (modified — RUMEUR layer wiring)
- `tacet/src/app/MapPageClient.tsx` (modified — AppNav RUMEUR toggle)
- `tacet/src/types/rumeur.ts` (created — shared RUMEUR types)
- `tacet/src/hooks/useRumeurData.test.ts` (created)
- `tacet/src/components/map/RumeurLayer.test.ts` (created)

## Dev Agent Record

### Completion Notes

Implemented `useRumeurData` hook and `RumeurLayer` for the RUMEUR sensor layer on map:

- **`tacet/src/types/rumeur.ts`** (new) — Shared `RumeurMeasurement`, `RumeurData`, `RumeurResponse` types. `RumeurMeasurement` now includes optional `lat`/`lon` fields to support map rendering; will be populated by real Bruitparif API once TAC-28 is resolved.
- **`route.ts` patch** — Imports types from `@/types/rumeur`; re-exports for backward compatibility. `getMockData()` returns 3 Paris monitoring stations with coordinates for map layer dev/test.
- **`useRumeurData(enabled)`** — SWR hook: key `/api/rumeur` when enabled, `null` when disabled (pauses polling per AC). `refreshInterval: 180_000` mirrors server cache TTL. `revalidateOnFocus: false` prevents spurious hits.
- **`RumeurLayer.ts`** — `addRumeurLayer` / `removeRumeurLayer` following idempotent ChantiersLayer pattern. Source `rumeur`, layer `rumeur-circles` (sky-500 circles, visually distinct from chantiers amber). Filters measurements without coords; all three mock stations render correctly.
- **`MapContext.tsx`** — `LayerId` union extended to `"chantiers" | "elections" | "rumeur"`.
- **`MapContainer.tsx`** — `rumeurEnabled = activeLayers.has("rumeur")`, `useRumeurData(rumeurEnabled)`, and a `useEffect` that adds/removes the RUMEUR layer on toggle + data change.
- **`MapPageClient.tsx`** — RUMEUR toggle in AppNav (`LayerToggle`, label "Capteurs") rendered only when `NEXT_PUBLIC_ENABLE_RUMEUR === "true"`.
- **Tests**: 8 new unit tests (4 hook, 8 layer); 41/41 total pass; 0 lint issues; 0 TS errors.

## Senior Developer Review

**Reviewer:** Claude (adversarial code review) | **Date:** 2026-03-13 | **Result:** PASS with fixes

### Findings

| ID | Severity | File | Finding | Resolution |
|----|----------|------|---------|------------|
| M1 | Medium | `MapContainer.tsx:278` | RUMEUR `useEffect` registered `load` listener but returned `undefined` instead of a cleanup function. If `rumeurEnabled` toggled before map loaded, multiple stale listeners accumulated — correctness only preserved by listener-firing order. | **Fixed**: `return () => map.off("load", onLoad)` |
| L1 | Low | `useRumeurData.ts:6` | Fetcher doesn't check `r.ok` before `r.json()`. Non-2xx responses with JSON body resolve successfully, so HTTP errors surface only in `data.error`, not in `swr.error`. Consistent with `useChantiersData` — document for Story 3.3. | Action item: Story 3.3 stale indicator must read `data.error`, not `swr.error` |
| L2 | Low | `route.ts:28` | `getMockData` JSDoc said "returns fresh mock data on every call" — inaccurate after Cursor's caching change; mock data is now frozen for 3-min cache window like the real path. | **Fixed**: JSDoc updated to reflect actual behaviour |
| L3 | Low | `RumeurLayer.ts:1` | `setData` cast used `maplibregl.GeoJSONSource` global namespace rather than the named ESM import established in the file header. | **Fixed**: `import type { ..., GeoJSONSource } from "maplibre-gl"` |
| L4 | Low | `useRumeurData.test.ts:21` | Fetcher tested only as `expect.any(Function)`; a broken no-op would pass. | Acceptable for unit scope; integration test covers full round-trip in `route.test.ts` |
| L5 | Low | Architecture | FR17 ("view the current noise level (dB) from RUMEUR sensors") partially met by leq-color encoding. Numeric dB value is not visible to the user. | Track in Story 3.3: popup or tooltip for RUMEUR circles should expose the `leq` property |

**Issues fixed automatically:** M1, L2, L3 (3 fixes applied)
**Action items:** L1, L5 (noted for Story 3.3)
**Tests after fixes:** 42/42 pass

## Change Log

- 2026-03-13: Story 3.2 implementation started
- 2026-03-13: useRumeurData hook, RumeurLayer, MapContext/MapContainer/AppNav wiring; types/rumeur.ts; 41/41 tests; status → review
- 2026-03-13: Code review pass — resolved M1/L2/L3; noted L1/L5 for Story 3.3; 42/42 green; status → done
