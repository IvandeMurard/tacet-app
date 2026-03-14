---
id: story-4.8
title: "Unit tests for OfflineBanner and PWAInstallPrompt (E4-M3)"
epic: "Epic 4: Progressive Web App & Offline"
status: ready-for-dev
depends: [story-4.2, story-4.3]
priority: medium
storyPoints: 1
reviewFindings: [E4-M3]
---

# Story 4.8: Unit tests for OfflineBanner and PWAInstallPrompt

## User Story

As a developer,
I want unit tests for OfflineBanner and PWAInstallPrompt,
So that offline UX regressions are caught in CI (NFR-M1: Vitest >= 80%).

## Acceptance Criteria

**Given** the test suite runs
**When** OfflineBanner and PWAInstallPrompt tests are included
**Then** all tests pass and coverage increases for Epic 4 components

## Technical Context

### OfflineBanner tests
- Renders null when `navigator.onLine = true`
- Renders banner when `offline` event fires
- Shows fallback text "données de votre dernière session" when no localStorage zone
- Shows zone name when localStorage contains `{ name: "Quartier X" }`
- Returns to null when `online` event fires after being offline

### PWAInstallPrompt tests
- Renders nothing when `beforeinstallprompt` has not fired
- Renders nothing when `sessionStorage` PROMPT_SHOWN_KEY is already set
- Shows dialog when `beforeinstallprompt` fires
- "Installer" button calls `deferredPrompt.prompt()` and sets sessionStorage
- "Plus tard" button sets sessionStorage and hides prompt

## Affected Files

- `tacet/src/components/tacet/OfflineBanner.test.tsx` (new)
- `tacet/src/components/tacet/PWAInstallPrompt.test.tsx` (new)

## Testing Notes

- Mock `navigator.onLine` and `window.addEventListener` for offline/online events.
- Mock `beforeinstallprompt` event with a fake `prompt()` function.
- Use `fireEvent` to trigger online/offline events on `window`.

## Tasks/Subtasks

- [ ] Write `OfflineBanner.test.tsx` (5 tests)
- [ ] Write `PWAInstallPrompt.test.tsx` (5 tests)
- [ ] Run full test suite — all green, no regressions

## Change Log

- 2026-03-14: Story created from epic-4 exhaustive review finding E4-M3
