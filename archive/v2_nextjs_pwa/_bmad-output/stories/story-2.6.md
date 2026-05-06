---
id: story-2.6
tac: TAC-42
title: "SerenityBar, TierBadge, and DataProvenance in IrisPopup"
epic: "Epic 2: Address Discovery & Acoustic Score"
status: ready
blockedBy: null
depends: [story-2.2]
priority: should
storyPoints: 2
---

# Story 2.6: SerenityBar, TierBadge, and DataProvenance in IrisPopup

## User Story

As a user,
I want the zone panel to show a small serenity bar, a tier badge, and data source attribution,
So that I quickly understand the score band and data origin (FR6, FR27).

## Acceptance Criteria

**Given** the IrisPopup is open
**When** the zone has a valid Score
**Then** a SerenityBar (e.g. 4px height, tier-colored) is visible alongside or below the score
**And** TierBadge shows the tier label with tier styling (e.g. rounded-full, 5-tier colors)
**And** DataProvenance shows at least "Bruitparif · PPBE [year]" in small, muted text
**And** annual update cycle disclosure (PPBE-derived data) is present in or near the panel (FR27)
**When** the user toggles expert mode (if implemented)
**Then** raw dB (Lden/Ln) can be shown in addition to Score, per UX spec

## Technical Context

- SerenityBar: 4px height, tier color (from noise-categories). Visual band for score level.
- TierBadge: tier label (Calme, Modéré, etc.), rounded-full, 5-tier colors from UX/architecture.
- DataProvenance: "Bruitparif · PPBE [year]" + annual update disclosure. Small, muted.
- Expert mode: optional toggle in MapContext; when on, show raw Lden/Ln in IrisPopup (UX spec).

## Affected Files

- `tacet/src/components/tacet/SerenityBar.tsx`
- `tacet/src/components/tacet/TierBadge.tsx`
- `tacet/src/components/tacet/DataProvenance.tsx`
- `tacet/src/components/tacet/IrisPopup.tsx` (compose above; expert mode optional)
- `tacet/src/lib/noise-categories.ts` (tier colors)

## Dependencies

- Story 2.2 (IrisPopup with score and tier).

## Testing Notes

- Unit: SerenityBar/TierBadge/DataProvenance render with tier and year.
- E2E: open zone → see bar, badge, and "Bruitparif · PPBE" text.
