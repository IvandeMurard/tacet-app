---
id: story-5.6
tac: TAC-37
title: "E2E Playwright scenarios (geospatial and critical flows)"
epic: "Epic 5: Accessibility, Compliance & End-to-End Quality"
status: ready
blockedBy: null
depends: [story-1.5]
priority: must
storyPoints: 5
---

# Story 5.6: E2E Playwright scenarios (geospatial and critical flows)

## User Story

As a developer,
I want at least 10 E2E scenarios covering address search, zone selection, layer toggles, and offline behavior,
So that critical user journeys are regression-tested (TAC-37, NFR-M2).

## Acceptance Criteria

**Given** Playwright is configured for the project (e.g. e2e/playwright.config.ts)
**When** E2E tests run (e.g. against build or dev server)
**Then** the following are covered: address search and map flyTo; zone selection (tap/click) and IrisPopup open; at least one layer toggle (RUMEUR or Chantiers); offline mode (e.g. last zone available or offline banner)
**And** at least 10 distinct scenarios (or scenarios with multiple assertions) exist as per NFR-M2
**When** CI runs (e.g. GitHub Actions)
**Then** E2E job runs after build and fails the pipeline if any scenario fails
**Given** tests are stable (no flaky selectors)
**When** tests run repeatedly
**Then** they pass consistently or flakiness is documented and minimized

## Technical Context

- Playwright: e2e/playwright.config.ts, baseURL to build or dev. Scenarios: address-search.spec.ts, zone-selection.spec.ts, layer-toggle.spec.ts, offline-mode.spec.ts, score-display.spec.ts, accessibility.spec.ts (see architecture).
- CI: E2E job after build in .github/workflows/ci.yml; fail pipeline on test failure. Use stable selectors (data-testid or role); avoid brittle class/text where possible.

## Affected Files

- `tacet/e2e/playwright.config.ts`
- `tacet/e2e/address-search.spec.ts`
- `tacet/e2e/zone-selection.spec.ts`
- `tacet/e2e/layer-toggle.spec.ts`
- `tacet/e2e/offline-mode.spec.ts`
- `tacet/e2e/score-display.spec.ts`
- `tacet/e2e/accessibility.spec.ts`
- `tacet/.github/workflows/ci.yml` (e2e job)

## Dependencies

- Story 1.5 (CI pipeline). E2E job added after build. Scenarios depend on implemented features (search, zone, layers, offline).

## Testing Notes

- Run playwright test; ≥10 scenarios pass. CI: e2e job runs and fails pipeline on failure. Flakiness: use waitForSelector or resilient assertions; document known flaky cases if any.
