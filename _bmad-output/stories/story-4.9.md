---
id: story-4.9
title: "PWA polish: maskable icon, deferred install prompt, reloadOnOnline fix (E4-L1, L2, L3)"
epic: "Epic 4: Progressive Web App & Offline"
status: ready-for-dev
depends: [story-4.3, story-4.4]
priority: low
storyPoints: 1
reviewFindings: [E4-L1, E4-L2, E4-L3]
---

# Story 4.9: PWA polish — maskable icon, deferred install prompt, reloadOnOnline fix

## User Story

As a product owner,
I want the PWA to pass Lighthouse PWA audit cleanly and the install prompt to appear at the right moment,
So that users get a polished install experience and Lighthouse CI stays green.

## Acceptance Criteria

**Given** the manifest is validated by Lighthouse
**When** the PWA audit runs
**Then** "Manifest has a maskable icon" passes (icon-512 or a dedicated maskable icon)

**Given** the user has just opened the app for the first time
**When** `beforeinstallprompt` fires
**Then** the install dialog does NOT appear immediately — it waits until the user has tapped a zone

**Given** the user's device reconnects after being offline
**When** the network comes back
**Then** the page does NOT auto-reload (preserving any open popup state)

## Technical Context

- **E4-L2 (maskable icon)**: Add `"purpose": "maskable"` to the 512px icon entry in `manifest.json`. Simplest fix: change `"purpose": "any"` to `"purpose": "any maskable"` for the 512 entry. This covers both purposes with one file if the icon design is safe-zone compliant (i.e., no important content within the outer ~20% of the canvas). Alternatively, add a second entry with a dedicated masked variant.
- **E4-L1 (deferred install prompt)**: Refactor `PWAInstallPrompt` to accept a `triggered: boolean` prop (or read from context). `MapPageClient` passes `triggered={selectedZone !== null}`. `showPrompt(true)` is only called when both `deferredPrompt !== null` AND `triggered === true`. This preserves the one-time sessionStorage de-duplication.
- **E4-L3 (reloadOnOnline)**: Change `reloadOnOnline: true` → `reloadOnOnline: false` in `next.config.mjs`. The RUMEUR SWR polling (when re-enabled after coming online) handles data freshness without a disruptive full-page reload.

## Affected Files

- `tacet/public/manifest.json` (add maskable purpose to 512 icon)
- `tacet/src/components/tacet/PWAInstallPrompt.tsx` (accept `triggered` prop)
- `tacet/src/app/MapPageClient.tsx` (pass `triggered={selectedZone !== null}` to PWAInstallPrompt)
- `tacet/next.config.mjs` (`reloadOnOnline: false`)

## Testing Notes

- Manifest: Lighthouse PWA audit — "Manifest has a maskable icon" passes.
- PWAInstallPrompt: unit test (from story 4.8) should verify `triggered=false` → no prompt even when event fires.
- Manual: verify reload no longer happens on reconnect.

## Tasks/Subtasks

- [ ] Update `manifest.json`: 512 icon → `"purpose": "any maskable"`
- [ ] Refactor `PWAInstallPrompt`: accept `triggered` prop; gate `setShowPrompt(true)` on `triggered`
- [ ] Update `MapPageClient`: pass `triggered={selectedZone !== null}` prop
- [ ] Update `next.config.mjs`: `reloadOnOnline: false`
- [ ] Run full test suite — all green, no regressions

## Change Log

- 2026-03-14: Story created from epic-4 exhaustive review findings E4-L1, E4-L2, E4-L3
