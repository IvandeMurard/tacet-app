---
id: story-5.3
tac: TAC-47
title: "Legal notice, attributions, and privacy policy"
epic: "Epic 5: Accessibility, Compliance & End-to-End Quality"
status: ready
blockedBy: null
depends: []
priority: must
storyPoints: 3
---

# Story 5.3: Legal notice, attributions, and privacy policy

## User Story

As a user,
I want to open the legal notice, data attributions (Bruitparif ODbL, Open Data Paris Etalab), and privacy policy from any page,
So that I can verify compliance and data usage (FR34, NFR-PP3).

## Acceptance Criteria

**Given** the app has a footer (or global nav) on all main pages
**When** the user opens the footer links
**Then** a "Mentions légales" (or Legal notice) page/section is linked and contains: ODbL/Etalab attribution, Lden → Score methodology, disclaimer on indicativity
**And** a "Politique de confidentialité" (Privacy policy) is linked and states: data processed (e.g. Vercel logs only), retention (≤ 30 days), deletion request contact
**When** the user is on the legal or privacy page
**Then** content is readable and in French (lang="fr")
**And** links open in the same tab or clearly (no deceptive new tab)

## Technical Context

- Footer on all main pages: link "Mentions légales" → /mentions-legales or #mentions; link "Politique de confidentialité" → /confidentialite or equivalent.
- Legal page: ODbL (Bruitparif), Etalab (Open Data Paris), Lden → Score methodology, Score indicatif disclaimer.
- Privacy page: data processed (Vercel logs), retention ≤ 30 days, how to request deletion, contact. lang="fr" on page or layout.

## Affected Files

- Footer component (layout or shared): links to legal and privacy
- `tacet/src/app/mentions-legales/page.tsx` (or single legal page with sections)
- `tacet/src/app/confidentialite/page.tsx` (or section on same page)

## Dependencies

- None. Story 2.3 may link to same legal content for methodology.

## Testing Notes

- Manual: footer links work; content in French; methodology and attributions present; privacy states processing and retention.
- E2E: click footer links, assert content and lang.
