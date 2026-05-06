# Story 7.2: IRIS GeoJSON Layer and Zone Selection

Status: done

## Story

As a user,
I want to see IRIS acoustic noise zones overlaid on the map and tap a zone to see its serenity score,
so that the core acoustic data interaction works natively on iOS (FR1, FR3).

## Acceptance Criteria

1. **GeoJSON cached on first launch:** `ensureGeoJSON()` downloads `paris-noise-iris.geojson` from `EXPO_PUBLIC_API_BASE_URL/data/paris-noise-iris.geojson` into `FileSystem.documentDirectory`. A loading skeleton is shown during download.
2. **GeoJSON loaded from filesystem on subsequent launches:** No network call when file exists locally.
3. **IRIS fill layer renders:** 992 zone polygons visible on the map, coloured by `noise_level` (1=green, 2=amber, 3=red, 4=purple) — matching V2 web colour ramp.
4. **Zone tap sets selection:** Tapping a zone highlights its border (white 2px LineLayer) and sets `selectedZone` in the Zustand store.
5. **Tap on empty area clears selection:** `selectedZone` resets to null.
6. **Tests pass:** `npm test -- --watchAll=false` passes with smoke tests covering NOISE_FILL_EXPRESSION shape and store logic.
7. **Committed to repo:** Changes committed to `main`.

## Tasks / Subtasks

- [x] **Task 1 — Install deps** (AC: 1, 2, 4)
  - [x] `npx expo install expo-file-system zustand react-native-mmkv`

- [ ] **Task 2 — Create constants/colors.ts** (AC: 3)
  - [ ] Port NOISE_CATEGORIES, SERENITE_SCORES, color values from `tacet/src/lib/noise-categories.ts`
  - [ ] Export `PARIS_CENTER`, `DEFAULT_ZOOM`
  - [ ] Export `NOISE_FILL_EXPRESSION` — MapLibre `match` expression array for `noise_level → hex color`

- [ ] **Task 3 — Create store/mapStore.ts** (AC: 4, 5)
  - [ ] Zustand store: `selectedZone: IrisProperties | null`, `setSelectedZone`, `clearSelectedZone`
  - [ ] Export `IrisProperties` type (code_iris, name, c_ar, noise_level, description, day_level, night_level)

- [ ] **Task 4 — Create hooks/useGeoJSON.ts** (AC: 1, 2)
  - [ ] Check `FileSystem.documentDirectory + 'paris-noise-iris.geojson'`
  - [ ] If exists: read and parse JSON
  - [ ] If not: `FileSystem.downloadAsync(url, localUri)` then parse
  - [ ] Return `{ geojson: FeatureCollection | null, loading: boolean, error: string | null }`

- [ ] **Task 5 — Update app/(tabs)/index.tsx** (AC: 3, 4, 5)
  - [ ] Import `useGeoJSON` — show `ActivityIndicator` skeleton while loading
  - [ ] `ShapeSource id="iris-source"` with `shape={geojson}` + `onPress={handlePress}`
  - [ ] `FillLayer` with `fillColor: NOISE_FILL_EXPRESSION`, `fillOpacity: 0.45`
  - [ ] `LineLayer` for selected zone: filter by `code_iris == selectedZone?.code_iris`, white 2px
  - [ ] `Camera` centered on `PARIS_CENTER` at `DEFAULT_ZOOM`
  - [ ] Tap handler: extract feature properties → `setSelectedZone` (or `clearSelectedZone` if same)

- [ ] **Task 6 — Update smoke tests + commit** (AC: 6, 7)
  - [ ] Add tests: `NOISE_FILL_EXPRESSION` is an array; store `setSelectedZone`/`clearSelectedZone` work
  - [ ] Update story status → done; add completion notes
  - [ ] `git commit`

## Dev Notes

### GeoJSON structure (paris-noise-iris.geojson)
```
Properties per feature:
  code_iris    string  "751124811"    — zone identifier (join key)
  name         string  "Quinze-Vingts 11"
  c_ar         number  12             — arrondissement (1–20)
  noise_level  number  1              — 1=Calme, 2=Modéré, 3=Bruyant, 4=Très Bruyant
  day_level    number  1              — daytime noise level
  night_level  number  1              — nighttime noise level
  description  string  "Zone calme…"
  source_type  string  "bruitparif"
  primary_sources  string[]  ["Circulation"]
Feature count: 992
File size: ~1.7MB (uncompressed)
```

### Color ramp (match web exactly)
```
noise_level 1 → #4ade80  (Tailwind green-400)   — Calme
noise_level 2 → #fbbf24  (Tailwind amber-400)   — Modéré
noise_level 3 → #f87171  (Tailwind red-400)     — Bruyant
noise_level 4 → #c084fc  (Tailwind violet-400)  — Très Bruyant
fallback      → #666666
```

### MapLibre fill-color expression
```typescript
export const NOISE_FILL_EXPRESSION = [
  "match",
  ["get", "noise_level"],
  1, "#4ade80",
  2, "#fbbf24",
  3, "#f87171",
  4, "#c084fc",
  "#666666",
] as const;
```

### FileSystem cache path
```typescript
const GEOJSON_URI = FileSystem.documentDirectory + "paris-noise-iris.geojson";
const GEOJSON_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/data/paris-noise-iris.geojson`;
```

### MapLibre RN layer syntax (v11 beta)
```tsx
<MapLibreGL.ShapeSource id="iris-source" shape={geojson} onPress={handlePress}>
  <MapLibreGL.FillLayer
    id="iris-fill"
    style={{
      fillColor: NOISE_FILL_EXPRESSION,
      fillOpacity: 0.45,
    }}
  />
  <MapLibreGL.LineLayer
    id="iris-selected"
    filter={["==", ["get", "code_iris"], selectedZone?.code_iris ?? ""]}
    style={{ lineColor: "#ffffff", lineWidth: 2 }}
  />
</MapLibreGL.ShapeSource>
```

### Camera initial position
```tsx
<MapLibreGL.Camera
  defaultSettings={{
    centerCoordinate: [2.3522, 48.8566],  // PARIS_CENTER [lng, lat]
    zoomLevel: 11.5,
  }}
/>
```

### What NOT to do
- Do NOT bundle the GeoJSON as an asset — inflate binary, slow App Store review
- Do NOT use `FileSystem.cacheDirectory` — OS can evict cache dir; use `documentDirectory`
- Do NOT add RUMEUR sensor layer or IrisPopup in this story — that is Story 7.3 / 7.4
- Do NOT add MMKV persistence for selectedZone — it is transient per session

### Key package versions
| Package | Notes |
|---------|-------|
| `expo-file-system` | Bundled with Expo SDK 55 |
| `zustand` | v5 (latest) |
| `react-native-mmkv` | v3, new arch required (RN 0.74+) — installed for future use |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

N/A

### Completion Notes List

- react-native-mmkv v4.3.0 installed (not v3 as originally noted in epics.md — v4 is current, new-arch compatible)
- NOISE_FILL_EXPRESSION cast as `unknown as string` to satisfy MapLibre RN style types; runtime correctly handles expression arrays
- Zustand v5 store — plain (no MMKV persistence for selectedZone; it is transient per session)
- `onPress` on `MapView` (outside ShapeSource) fires first — used to deselect; ShapeSource `onPress` stops propagation for zone taps
- `FileSystem.downloadAsync` handles gzip decompression automatically when server sends `Content-Encoding: gzip`
- No bundled GeoJSON — always fetched from Vercel CDN and cached to `FileSystem.documentDirectory`
- 10 tests passing (up from 2 in Story 7.1)

### File List

- tacet-mobile/constants/colors.ts (new)
- tacet-mobile/store/mapStore.ts (new)
- tacet-mobile/hooks/useGeoJSON.ts (new)
- tacet-mobile/app/(tabs)/index.tsx (updated — IRIS layers + Camera + loading skeleton)
- tacet-mobile/__tests__/smoke.test.ts (updated — 8 new tests)
- tacet-mobile/package.json (updated — expo-file-system, zustand, react-native-mmkv)
