# Story 6.1: Time-Aware Signal Weighting

Status: ready-for-dev

## Story

As a user browsing Tacet at night,
I want the zone popup to automatically show the most relevant acoustic information for the current time of day — night levels in the evening, day levels during the day —
so that I understand what this zone actually sounds like right now without configuring anything (FR40).

## Acceptance Criteria

1. **Night mode — primary level (20:00–06:00):** When current hour is ≥ 20 or < 6, `night_level` (Ln dB) is displayed as the primary dB value in IrisPopup. Label reads "Nuit · Ln". Secondary `day_level` remains visible but visually de-emphasised (smaller, dimmer).
2. **Day mode — primary level (06:00–20:00):** When current hour is ≥ 6 and < 20, `day_level` (Lden dB) is the primary dB shown. Label reads "Jour · Lden". Existing behaviour preserved.
3. **Both values always rendered** when present — primary is larger/foreground, secondary is smaller/muted. Existing test "displays day and night levels" must still pass (both values remain in DOM).
4. **RUMEUR sensor time label:** Replace the hardcoded "en ce moment" (IrisPopup.tsx line 233) with a computed label: "maintenant" if the reading timestamp is < 10 min old, else `formatRelativeTime(timestamp)` (e.g. "il y a 2 h."). Only apply the relative label when current hour ≥ 18:00 (evening context); outside that window always show "maintenant".
5. **Chantier stale filtering:** `nearbyChantiers` prop entries with a `date_fin` date in the past are silently filtered before rendering. The chantier count and display only reflect currently-active chantiers.
6. **No toggle, no setting, no side-effects** — all time logic is computed at render time via `new Date()`. The display silently updates on each mount; no polling, no state, no `setInterval`.
7. **New utility: `@/lib/time-context.ts`** — exports `isNightTime()`, `getSensorTimeLabel()`, `isChantierExpired()` (see Tasks for signatures). All functions accept an optional `now?: Date` injection parameter for testability.
8. **Unit tests for `time-context.ts`:** Minimum 6 tests — day/night boundary at 20:00, 06:00, and a midday case; sensor label for fresh reading, stale reading, and evening context; chantier expired vs active.
9. **Updated IrisPopup tests:** Add tests for night-primary rendering (mock `new Date()` via `vi.useFakeTimers()`), expired chantier filtered, and sensor label. All existing 10 IrisPopup tests continue to pass.

## Tasks / Subtasks

- [ ] **Task 1 — Create `@/lib/time-context.ts`** (AC: 6, 7)
  - [ ] Export `NIGHT_START_HOUR = 20` and `NIGHT_END_HOUR = 6` as named constants
  - [ ] `isNightTime(now?: Date): boolean` — `h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR`
  - [ ] `getSensorTimeLabel(timestamp: string, now?: Date): string` — < 10 min → "maintenant", else `formatRelativeTime(timestamp)` from `@/lib/format-date`
  - [ ] `isChantierExpired(date_fin: string | undefined, now?: Date): boolean` — returns `false` if undefined, `new Date(date_fin) < now` otherwise

- [ ] **Task 2 — Unit tests `@/lib/time-context.test.ts`** (AC: 8)
  - [ ] `isNightTime` — 19:59 → false, 20:00 → true, 05:59 → true, 06:00 → false, 12:00 → false
  - [ ] `getSensorTimeLabel` — fresh timestamp (< 10 min) → "maintenant"; stale timestamp (> 10 min) → "il y a N min." / "il y a N h."
  - [ ] `isChantierExpired` — past date → true; future date → false; undefined → false

- [ ] **Task 3 — Modify `IrisPopup.tsx`** (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Add import: `import { isNightTime, getSensorTimeLabel, isChantierExpired } from "@/lib/time-context";`
  - [ ] Add import: `formatRelativeTime` NOT needed directly — getSensorTimeLabel handles it
  - [ ] In component body: `const isNight = isNightTime();`
  - [ ] Compute `const activeChantiers = nearbyChantiers.filter(c => !isChantierExpired(c.date_fin));` — use `activeChantiers` everywhere in JSX instead of `nearbyChantiers`
  - [ ] Replace the day/night `<div className="mb-4 flex gap-4">` block: render primary level large (existing bold style), secondary level small (text-white/30, smaller font). Night: primary=night_level, secondary=day_level. Day: primary=day_level, secondary=night_level.
  - [ ] In sensor row: replace `en ce moment` with `{getSensorTimeLabel(nearestSensor.measurement.timestamp)}`
  - [ ] Verify contextual signals section condition uses `activeChantiers.length` (not `nearbyChantiers.length`)

- [ ] **Task 4 — Update `IrisPopup.test.tsx`** (AC: 9)
  - [ ] Add `vi.useFakeTimers()` / `vi.setSystemTime()` setup/teardown pattern (see Dev Notes)
  - [ ] Test: at 21:00 → night_level (45) is primary, day_level (52) still in DOM
  - [ ] Test: at 10:00 → day_level (52) is primary, night_level (45) still in DOM
  - [ ] Test: chantier with past `date_fin` → not rendered in active count
  - [ ] Test: sensor with old timestamp at 19:00 → shows relative time label (not "maintenant")
  - [ ] Confirm all 10 existing tests still pass

- [ ] **Task 5 — Regression check** (AC: 3, 9)
  - [ ] Run `cd tacet && npm test -- --run` — all tests green
  - [ ] Visually verify: open popup in day mode (both levels visible, day prominent); open in night mode (night prominent)

## Dev Notes

### Architecture Constraints (MUST follow)

- **`@/` aliases only** — never `../../` relative imports. `@/lib/time-context` not `../../lib/time-context`.
- **Tests co-located** — `time-context.test.ts` lives at `tacet/src/lib/time-context.test.ts` next to the source file.
- **`"use client"` not needed** for `time-context.ts` — it's a pure utility with no browser APIs (the `now` param makes it server/test-safe). No directive needed.
- **IrisPopup is `"use client"`** — already marked; no change needed.
- **No new npm packages** — this story uses only native `Date` and existing `formatRelativeTime`. Do NOT add `date-fns`, `moment`, `dayjs`, or `luxon`.

### Vitest Fake Timer Pattern (for IrisPopup tests)

```typescript
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

it("shows night_level as primary at 21:00", () => {
  vi.setSystemTime(new Date("2026-03-19T21:00:00"));
  render(<IrisPopup properties={baseProps} onClose={vi.fn()} />);
  // ...assertions
});
```

> ⚠️ `vi.useFakeTimers()` replaces `Date` globally — remember `afterEach(() => vi.useRealTimers())` to prevent test pollution.

### Primary/Secondary Visual Treatment

Keep implementation minimal — NO new components, NO redesign. Extend the existing `div.mb-4.flex.gap-4` block:

```tsx
// Existing pattern — replace the two equal-weight divs with primary/secondary split:
{(day_level != null || night_level != null) && (() => {
  const primaryLevel = isNight ? night_level : day_level;
  const primaryIcon = isNight ? <Moon .../> : <Sun .../>;
  const primaryLabel = isNight ? "Nuit · Ln" : "Jour · Lden";
  const secondaryLevel = isNight ? day_level : night_level;
  const secondaryIcon = isNight ? <Sun .../> : <Moon .../>;
  const secondaryLabel = isNight ? "Jour · Lden" : "Nuit · Ln";
  return (
    <div className="mb-4 flex gap-4">
      {primaryLevel != null && (
        <div className="flex items-center gap-1.5 text-xs text-white/60">
          {primaryIcon}
          <span>{primaryLabel} : <strong className="text-white/80">{primaryLevel} dB</strong></span>
        </div>
      )}
      {secondaryLevel != null && (
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          {secondaryIcon}
          <span>{secondaryLabel} : <span className="text-white/40">{secondaryLevel} dB</span></span>
        </div>
      )}
    </div>
  );
})()}
```

> **Regression guard:** Both dB values stay in DOM — the existing test `expect(screen.getByText(/52 dB/))` still passes. Only the visual weight changes.

### Sensor Time Label Behaviour

`RumeurMeasurement.timestamp` is an ISO 8601 string (e.g. `"2026-03-19T18:42:00Z"`). The logic:

```typescript
// @/lib/time-context.ts
export function getSensorTimeLabel(timestamp: string, now?: Date): string {
  const t = now ?? new Date();
  const diff = t.getTime() - new Date(timestamp).getTime();
  if (diff < 10 * 60 * 1000) return "maintenant"; // < 10 min
  return formatRelativeTime(timestamp); // "il y a 2 h.", "il y a 35 min.", etc.
}
```

The "only apply relative label when current hour ≥ 18:00" AC is handled in IrisPopup itself — not in the utility — to keep the utility pure:

```tsx
// In IrisPopup render (sensor row):
const sensorLabel = (isNight || new Date().getHours() >= 18)
  ? getSensorTimeLabel(nearestSensor.measurement.timestamp)
  : "maintenant";
```

### Chantier date_fin Format

`date_fin` is a string from the Chantiers API — typically `"2026-04-30"` (ISO date, no time). `new Date("2026-04-30")` parses as midnight UTC. This is acceptable precision for "is this still active?". No timezone conversion required.

### Project Structure Notes

- Files to **create**: `tacet/src/lib/time-context.ts`, `tacet/src/lib/time-context.test.ts`
- Files to **modify**: `tacet/src/components/IrisPopup.tsx`, `tacet/src/components/IrisPopup.test.tsx`
- Files to **NOT touch**: All other files. No changes to MapPageClient.tsx, MapContext.tsx, hooks, types, or any other component.
- `tacet/src/lib/constants.ts` — currently only exports `DATA_YEAR`. Do NOT add time constants here; they belong in `time-context.ts` (single responsibility).

### References

- Story spec source: `_bmad-output/planning-artifacts/epics.md#Story-6.1`
- Full Epic 6 vision: `docs/planning/ambient-agentic-vision.md`
- IrisPopup current state: `tacet/src/components/IrisPopup.tsx` (311 lines)
- Existing date utility: `tacet/src/lib/format-date.ts` — `formatRelativeTime()` already handles French relative time
- RUMEUR types: `tacet/src/types/rumeur.ts` — `RumeurMeasurement.timestamp: string` (ISO 8601)
- NearbyChantier interface: defined inline in `IrisPopup.tsx` lines 17-22, `date_fin?: string`
- Test patterns: `tacet/src/lib/format-date.test.ts` and `tacet/src/components/IrisPopup.test.tsx` for conventions

## Dev Agent Record

### Agent Model Used

_to be filled by dev agent_

### Debug Log References

### Completion Notes List

### File List
