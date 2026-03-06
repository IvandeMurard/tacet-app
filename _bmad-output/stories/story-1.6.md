---
id: story-1.6
tac: TAC-32
title: "Lighthouse CI budget guards (Performance and Accessibility)"
epic: "Epic 1: Open-Source Map Foundation"
status: ready
blockedBy: null
depends: [story-1.5]
priority: must
storyPoints: 3
---

# Story 1.6: Lighthouse CI budget guards (Performance and Accessibility)

## User Story

As a developer,
I want Lighthouse CI to run on the built app and enforce Performance ≥ 85 and Accessibility ≥ 95,
So that regressions in performance or a11y block merge (TAC-32, NFR-P3, NFR-A1).

## Acceptance Criteria

**Given** a successful build exists (e.g. in CI or locally)
**When** Lighthouse CI runs (e.g. lhci autorun or GitHub Action)
**Then** Performance score ≥ 85 and Accessibility score ≥ 95 are asserted (budget or threshold)
**And** CI fails the job if either budget is not met
**And** report is available (artifact or URL) for inspection
**Given** bundle size budget exists (e.g. 300 KB gzipped)
**When** the budget is configured in Lighthouse or a separate check
**Then** initial JS bundle size is asserted (NFR-P8)

## Technical Context

- LHCI: @lhci/cli, lighthouserc.js with assertions for performance and accessibility.
- Add Lighthouse CI job to .github/workflows/ci.yml (after build). Run against built app (e.g. next start or static server).
- Bundle budget: 300 KB gzipped initial JS — enforce via Lighthouse or separate size check.

## Affected Files

- `tacet/lighthouserc.js`
- `tacet/.github/workflows/ci.yml` (lighthouse job)
- `tacet/package.json` (@lhci/cli devDep)

## Dependencies

- Story 1.5 (CI pipeline) must exist so LHCI can be added as a job.

## Testing Notes

- Run lhci autorun locally; CI job runs after build and fails if budgets not met.
- Report artifact or upload to temporary public URL for inspection.
