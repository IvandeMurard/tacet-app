---
id: story-1.5
tac: TAC-31
title: "CI/CD pipeline and unit tests"
epic: "Epic 1: Open-Source Map Foundation"
status: ready
blockedBy: null
depends: []
priority: must
storyPoints: 5
---

# Story 1.5: CI/CD pipeline and unit tests

## User Story

As a developer,
I want a GitHub Actions pipeline that runs lint, unit tests, build, and blocks merge on failure,
So that quality and build stability are enforced before deployment (TAC-31, NFR-M3).

## Acceptance Criteria

**Given** the repo has a `.github/workflows` directory
**When** a push or PR targets main (or default branch)
**Then** a workflow runs: lint (e.g. next lint), unit tests (Vitest), build (next build)
**And** merge is blocked if any job fails (or configurable branch protection)
**Given** critical domain logic (e.g. noise-categories: Lden → Score, getSereniteScore)
**When** unit tests run
**Then** Vitest tests exist and pass for those functions (coverage target per NFR-M1 can be stepwise)

**Given** Vitest is configured
**When** tests run in CI
**Then** path aliases (@/) resolve correctly (e.g. via vitest.config.ts)

## Technical Context

- GitHub Actions: .github/workflows/ci.yml. Jobs: lint, unit-tests, build. Fail blocks merge.
- Vitest: vitest.config.ts with React plugin, jsdom, path alias @/ → src.
- Co-locate tests: e.g. noise-categories.test.ts next to noise-categories.ts.
- Critical: getSereniteScore, getNoiseCategory, getNoiseCategoryFromDb, getSereniteScoreFromDb.

## Affected Files

- `tacet/.github/workflows/ci.yml`
- `tacet/vitest.config.ts`
- `tacet/src/lib/noise-categories.test.ts` (or equivalent)
- `tacet/package.json` (vitest, @vitejs/plugin-react, @testing-library/react, jsdom)

## Dependencies

None. Can run in parallel with map migration.

## Testing Notes

- CI run: all jobs pass. Branch protection or workflow config ensures merge block on failure.
- Vitest path alias: import from `@/lib/noise-categories` in tests resolves.
