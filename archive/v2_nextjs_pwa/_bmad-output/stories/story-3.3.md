---
id: story-3.3
tac: TAC-35
title: "RUMEUR timestamp and stale/unavailable indicator"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: done
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

## Tasks/Subtasks

- [x] Create `tacet/src/lib/format-date.ts` — `formatRelativeTime(isoString)` using `Intl.RelativeTimeFormat("fr", { numeric: "always", style: "short" })` for "il y a X min." style output
- [x] Write unit tests: `tacet/src/lib/format-date.test.ts` (null, < 1 min, minutes, hours, days)
- [x] Create `tacet/src/components/tacet/RumeurStatusBar.tsx` — pure presentational component (props: `cachedAt`, `error`, `fallback`); manages its own online/offline state; shows: live timestamp, fallback/cache message (amber), unavailable message (amber), nothing while loading
- [x] Write component tests: `tacet/src/components/tacet/RumeurStatusBar.test.tsx` (loading/null, normal, error no-fallback, fallback, offline)
- [x] Update `tacet/src/app/MapPageClient.tsx` — add `RumeurStatus` connector function (calls `useMapContext` + `useRumeurData`) and render `<RumeurStatus />` behind `NEXT_PUBLIC_ENABLE_RUMEUR` flag
- [x] Run full test suite — all green, no regressions

## File List

- `tacet/src/lib/format-date.ts` (created)
- `tacet/src/lib/format-date.test.ts` (created)
- `tacet/src/components/tacet/RumeurStatusBar.tsx` (created)
- `tacet/src/components/tacet/RumeurStatusBar.test.tsx` (created)
- `tacet/src/app/MapPageClient.tsx` (modified — RumeurStatus connector)
- `tacet/src/components/map/MapContainer.tsx` (modified — TS2345 void-return fix on RUMEUR load-listener cleanup)

## Dev Agent Record

### Implementation Plan

- `formatRelativeTime(isoString)`: computes `diffMs = now - Date.parse(isoString)`, returns "à l'instant" for < 1 min, delegates to `Intl.RelativeTimeFormat("fr", {numeric:"always",style:"short"})` for minutes/hours/days. Returns `""` for null/undefined.
- `RumeurStatusBar`: self-contained client component; `useEffect` mirrors `OfflineBanner` pattern for online/offline events. Renders a floating pill above the AppNav nav bar (`absolute bottom-[3.75rem] left-1/2 -translate-x-1/2 z-20`). Three visual states: white/muted (live), amber (error/cache/offline), null (loading). Key invariant: reads `data.error` not SWR error (per story 3.2 review L1).
- `RumeurStatus` connector in MapPageClient: calls `useMapContext()` + `useRumeurData(rumeurEnabled)`, returns null when layer is off. Mounted only when `NEXT_PUBLIC_ENABLE_RUMEUR === "true"` for consistent feature-flag gating.

### Completion Notes

- `format-date.ts`: `formatRelativeTime()` uses `Intl.RelativeTimeFormat("fr", { numeric: "always", style: "short" })` with thresholds: < 1 min → "à l'instant", < 60 min → minutes, < 24 h → hours, else days. Future timestamps (clock drift) handled gracefully via same `diffMs < 60_000` guard.
- `RumeurStatusBar.tsx`: floating pill, `absolute bottom-[3.75rem] left-1/2 z-20 -translate-x-1/2`. Five priority-ordered states (offline > error/no-fallback > error+fallback > live > loading/null). Manages own online/offline via `window` event listeners with SSR guard. `role="status" aria-live="polite"`.
- `MapPageClient.tsx`: `RumeurStatus` connector function pattern (consistent with `AppNav`). Returns `null` when layer off — no SWR polling. Mounted only when `NEXT_PUBLIC_ENABLE_RUMEUR === "true"`. L1 invariant honoured: reads `rumeurResponse?.error` before `swrError`.
- `MapContainer.tsx` M1 bug (from story 3.2 review) also fixed: `return () => { map.off("load", onLoad); }` with block body to satisfy `void` return type (arrow-expression form returned `Map$1`, TS2345).
- Tests: 57/57 green. TypeScript: clean. ESLint: clean.

## Change Log

- 2026-03-13: Story 3.3 implementation started; Tasks/Subtasks + File List + Dev Agent Record added
- 2026-03-13: Implementation complete — format-date.ts, RumeurStatusBar.tsx, MapPageClient.tsx (RumeurStatus connector); M1 TS2345 fix in MapContainer.tsx; 57/57 green, TS clean, lint clean; status → review
- 2026-03-13: Code review pass — fixed M1 (MapContainer.tsx added to File List), M2 (silent null for error+fallback+!cachedAt → now shows amber); added M2 test; 58/58 green, TS clean
