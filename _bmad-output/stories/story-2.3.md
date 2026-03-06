---
id: story-2.3
tac: TAC-39
title: "Data vintage, disclaimer, and methodology link"
epic: "Epic 2: Address Discovery & Acoustic Score"
status: ready
blockedBy: null
depends: [story-2.2]
priority: must
storyPoints: 2
---

# Story 2.3: Data vintage, disclaimer, and methodology link

## User Story

As a user,
I want to see the data vintage year and a short disclaimer that the Score is indicative, and a link to the full methodology,
So that I trust the data and understand its limitations (FR8, FR9, FR10).

## Acceptance Criteria

**Given** the IrisPopup is open for a zone with PPBE data
**When** the user views the panel
**Then** the data vintage year (e.g. "Données 2024") is visible in the zone panel (footer or subtitle)
**And** a one-line disclaimer is visible (e.g. Score indicatif, non certifié usage réglementaire)
**And** a link to the legal notice (or anchor) is present where the Lden → Score methodology is documented
**When** the user follows the link
**Then** the legal notice page (or section) loads with methodology and attributions (ODbL/Etalab)

## Technical Context

- Data vintage: from PPBE/year in data or constant. Display "Données {year}" in IrisPopup footer or subtitle.
- Disclaimer: one line in panel. Link to /mentions-legales or #methodologie (or legal page with methodology + ODbL/Etalab).
- Legal notice page/section: Lden → Score methodology, Bruitparif ODbL, Open Data Paris Etalab attribution.

## Affected Files

- `tacet/src/components/tacet/IrisPopup.tsx` (vintage, disclaimer, link)
- Legal notice page or section (e.g. app/mentions-legales/page.tsx or footer modal)

## Dependencies

- Story 2.2 (IrisPopup). Legal content can be minimal for this story; TAC-47 expands.

## Testing Notes

- Unit: IrisPopup shows vintage and disclaimer text; link present and navigates.
- E2E: open zone → see vintage and link; click link → legal/methodology content.
