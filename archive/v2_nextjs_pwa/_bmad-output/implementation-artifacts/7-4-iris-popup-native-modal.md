# Story 7.4: IrisPopup as Native Modal and Zone Detail UX

Status: done

## Story

As a user,
I want the zone detail popup to open as a native iOS bottom sheet when I tap a zone,
so that the acoustic score, RUMEUR data, chantiers, and enrichment summary are all visible with native iOS interaction patterns.

## Acceptance Criteria

1. **Bottom sheet on zone tap:** Tapping an IRIS zone slides up a bottom sheet from the bottom edge.
2. **Sheet content:** Displays zone name, arrondissement, Score Sérénité (SerenityBar), TierBadge, day/night dB levels (time-aware via time-context), RUMEUR sensor leq, active chantiers count, enrichment summary (confidence="high" only).
3. **Swipe to close:** Swiping down on the sheet handle (or past 100px) dismisses it and clears `selectedZone`.
4. **SearchBar:** A Photon geocoding search bar is visible at the top of the map. Selecting a suggestion flies the Camera to that location.
5. **Tests pass:** `npm test -- --watchAll=false` passes.
6. **Committed to repo.**

## Tasks / Subtasks

- [x] **Task 1 — Port lib/time-context.ts + SerenityBar + TierBadge** (AC: 2)
- [x] **Task 2 — Build ZoneSheet** (AC: 1, 2, 3)
- [x] **Task 3 — Build SearchBar** (AC: 4)
- [x] **Task 4 — Wire into MapScreen** (AC: 1, 4)
- [x] **Task 5 — Smoke tests + commit** (AC: 5, 6)

## Dev Notes

### Bottom sheet approach: Animated.View + PanResponder
No additional native deps needed. Uses built-in RN `Animated` + `PanResponder`.
- Sheet height: 420px (60% of typical iPhone screen)
- Always rendered, controlled by `translateY` (0 = visible, SHEET_HEIGHT = hidden)
- Spring animation on show/hide; PanResponder on handle bar for swipe-to-dismiss

### Camera flyTo via Camera ref
```tsx
const cameraRef = useRef<MapLibreGL.Camera>(null);
// flyTo callback passed to SearchBar:
const flyTo = useCallback((coords: [number, number]) => {
  cameraRef.current?.setCamera({
    centerCoordinate: coords,
    zoomLevel: 14,
    animationDuration: 800,
  });
}, []);
```

### Photon geocoding (no API key)
```
GET https://photon.komoot.io/api/?q={query}&limit=5&lang=fr
Response features[].properties: { name, city, country, type }
Response features[].geometry.coordinates: [lng, lat]
```

### time-context.ts port note
Direct copy — `Intl.RelativeTimeFormat` is supported in Hermes (RN 0.73+). Remove `import { formatRelativeTime }` and inline the implementation to avoid cross-project dependency.

### Score color logic (from IrisPopup.tsx)
```ts
score >= 70 → #4ade80
score >= 45 → #fbbf24
score >= 15 → #f87171
else        → #c084fc
```

### ZoneSheet data flow
- `selectedZone` from `useMapStore()` — drives visibility
- `useRumeur(!!selectedZone)` — enabled only when zone selected
- `useChantiers(!!selectedZone)` — enabled only when zone selected
- `useEnrichment(enrichmentRequest)` — request built from zone properties

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- ZoneSheet uses built-in `Animated.Value` + `PanResponder` — no extra native deps (avoids react-native-gesture-handler)
- `chantiersData?.data` (not `chantiersData?.data?.data`) — ChantiersResponse wraps array in `{ data: ChantierRecord[] | null }`
- TierBadge uses StyleSheet (not NativeWind className) for dynamic `color` prop — className can't accept runtime values
- SearchBar uses `onBlur={() => setTimeout(() => setFocused(false), 150)}` to allow tap on FlatList results before blur fires
- `SearchBar` signature updated to `onSelectLocation: (coords, label)` — index.tsx `flyTo` callback ignores `label`
- `isNightTime` boundary: hour 20 and above = night; hour < 6 = night; hour 6 = day
- 21 smoke tests passing (up from 14 in Story 7.3)

### File List

- tacet-mobile/lib/time-context.ts (new)
- tacet-mobile/components/SerenityBar.tsx (new)
- tacet-mobile/components/TierBadge.tsx (new)
- tacet-mobile/components/ZoneSheet.tsx (new)
- tacet-mobile/components/SearchBar.tsx (new)
- tacet-mobile/app/(tabs)/index.tsx (updated — SearchBar + ZoneSheet wired, Camera ref + flyTo)
- tacet-mobile/__tests__/smoke.test.ts (updated — 7 new time-context tests)
- _bmad-output/implementation-artifacts/7-4-iris-popup-native-modal.md (this file)
