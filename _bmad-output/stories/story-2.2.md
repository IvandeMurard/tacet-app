---
id: story-2.2
tac: TAC-38
title: "IrisPopup auto-reveal and Score display"
epic: "Epic 2: Address Discovery & Acoustic Score"
status: ready
blockedBy: null
depends: [story-1.3]
priority: must
storyPoints: 3
---

# Story 2.2: IrisPopup auto-reveal and Score display

## User Story

As a user,
I want the zone panel (IrisPopup) to open automatically when I select a zone (by search or tap) and show the Score Sérénité prominently,
So that I see the answer in one gesture without an extra tap (FR6, FR7).

## Acceptance Criteria

**Given** an IRIS zone is selected (from search or map tap)
**When** the selection is set in MapContext
**Then** IrisPopup opens automatically (slide-up 300ms, no second tap)
**And** the Score Sérénité (0–100) is displayed as the primary element (e.g. text-5xl font-bold, tier-colored)
**And** the tier label (e.g. "Calme", "Modéré") is shown next to or below the score
**And** a human-readable description (character note) is shown when available (FR7), in italic, muted
**When** no zone is selected
**Then** IrisPopup is closed or hidden

**Given** the zone has no PPBE data
**When** the popup is shown
**Then** Score is displayed as "—" or equivalent with a short explanation (calm tone)

## Technical Context

- IrisPopup visibility tied to MapContext.selectedZone. When selectedZone is set, show popup (no second tap). Slide-up 300ms per UX spec.
- Score from getSereniteScore(zone.lden_db), tier from getNoiseCategory(). Primary: text-5xl font-bold, tier-colored; tier label below/next.
- Character note: human-readable description when available (editorial or from data). Italic, muted.
- No data: show "—" and short calm explanation.

## Affected Files

- `tacet/src/components/tacet/IrisPopup.tsx`
- `tacet/src/contexts/MapContext.tsx` (selectedZone)
- `tacet/src/lib/noise-categories.ts` (getSereniteScore, getNoiseCategory)

## Dependencies

- Story 1.3 (zone selection in MapContext). Map tap or search sets selectedZone.

## Testing Notes

- Unit: IrisPopup renders score and tier when zone has lden_db; shows "—" when no data.
- E2E: zone-selection.spec.ts — tap zone → popup opens with score and tier.
