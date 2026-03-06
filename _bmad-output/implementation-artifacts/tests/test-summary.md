# Test Automation Summary

**Generated**: 2026-03-06
**Project**: Tacet — Paris Urban Noise Map
**Frameworks**: Vitest (unit/component) · Playwright (E2E)

## Generated Tests

### Unit Tests (Vitest)

- [x] `src/lib/utils.test.ts` — `cn()` class merge utility (5 tests)
- [x] `src/lib/map-style.test.ts` — `getBaseMapStyle()` map config (5 tests)
- [x] `src/hooks/usePhotonSearch.test.ts` — `photonFeatureToDisplay()`, `photonFeatureToCoords()` (5 tests)
- [x] `src/hooks/useChantiersData.test.ts` — SWR hook enable/disable, fetch verification (2 tests)
- [x] `src/app/api/chantiers/route.test.ts` — GET handler success, non-array, 502 errors (4 tests)

### Component Tests (Vitest + Testing Library)

- [x] `src/components/tacet/SerenityBar.test.tsx` — Progressbar ARIA, width, color (4 tests)
- [x] `src/components/tacet/TierBadge.test.tsx` — Label display, color styling (3 tests)
- [x] `src/components/tacet/ShareCard.test.tsx` — Zone name, score, category badge (5 tests)
- [x] `src/components/tacet/ComparisonTray.test.tsx` — Dialog, pinned zones, unpin, close (6 tests)
- [x] `src/components/IrisPopup.test.tsx` — Dialog role, zone info, day/night levels, close/pin/share buttons (10 tests)

### E2E Tests (Playwright)

- [x] `e2e/contact-form.spec.ts` — Form fields, fill, submit confirmation, back link (4 tests)
- [x] `e2e/barometre-chart.spec.ts` — Page heading, ranking list (20 items), scores, share/map links (5 tests)

## Coverage

### Before (existing)

| Type | Files | Tests |
|------|-------|-------|
| Unit | 1 | 18 |
| E2E  | 8 | 21 |
| **Total** | **9** | **39** |

### After (with new tests)

| Type | Files | Tests |
|------|-------|-------|
| Unit | 6 (+5) | 39 (+21) |
| Component | 5 (+5) | 28 (+28) |
| E2E  | 10 (+2) | 30 (+9) |
| **Total** | **21 (+12)** | **97 (+58)** |

### Feature Coverage

| Feature | Unit | Component | E2E |
|---------|------|-----------|-----|
| noise-categories | ✅ | — | — |
| utils (cn) | ✅ | — | — |
| map-style | ✅ | — | — |
| usePhotonSearch | ✅ | — | — |
| useChantiersData | ✅ | — | — |
| /api/chantiers | ✅ | — | — |
| ComparisonTray | — | ✅ | — |
| SerenityBar | — | ✅ | — |
| TierBadge | — | ✅ | — |
| ShareCard | — | ✅ | — |
| IrisPopup | — | ✅ | — |
| ContactForm | — | — | ✅ |
| BarometreChart | — | — | ✅ |
| Navigation | — | — | ✅ |
| Legal pages | — | — | ✅ |
| Accessibility view | — | — | ✅ |
| Address search | — | — | ✅ |
| Layer toggle | — | — | ✅ |
| Offline mode | — | — | ✅ |
| Zone selection | — | — | ✅ |
| Score display | — | — | ✅ |

## Run Commands

```bash
# Unit + Component tests
cd tacet && npm test

# E2E tests (requires build)
cd tacet && npm run build && npm run e2e
```

## Next Steps

- Run tests in CI pipeline
- Add more edge cases as needed
- Consider integration tests for MapContext + map interaction flows
