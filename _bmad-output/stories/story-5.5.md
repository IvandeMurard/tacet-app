---
id: story-5.5
tac: TAC-49
title: "RGPD compliance and zero third-party tracking"
epic: "Epic 5: Accessibility, Compliance & End-to-End Quality"
status: ready
blockedBy: null
depends: [story-5.3]
priority: must
storyPoints: 2
---

# Story 5.5: RGPD compliance and zero third-party tracking

## User Story

As a product owner,
I want the app to collect no personal data without consent and to load no third-party tracking scripts in V2,
So that we meet RGPD and user trust (FR37, NFR-PP1, NFR-S5).

## Acceptance Criteria

**Given** the production build is deployed
**When** any page is loaded
**Then** no third-party cookies or tracking scripts (e.g. GA4) are present in the page
**And** geocoding (Photon) requests are not logged by Tacet; addresses are not persisted server-side (NFR-PP2)
**Given** the privacy policy is linked from the footer
**When** the user reads it
**Then** it clearly states what data is processed (e.g. Vercel server logs), retention, and how to request deletion
**When** contact or feedback form is used
**Then** a privacy notice is shown at the point of submission and submission is HTTPS-only

## Technical Context

- Zero third-party scripts: no GA, no analytics SDK in V2. CSP in next.config restricts script-src. No cookies set by Tacet.
- Photon: client-direct; no proxy so Tacet does not log addresses. No server-side persistence of geocoding input.
- Privacy policy (Story 5.3): data processed (Vercel logs), retention, deletion request. Form submission: privacy notice at point of submit; HTTPS only.

## Affected Files

- `tacet/next.config.mjs` (CSP, security headers)
- Privacy policy content (in 5.3)
- Contact/feedback forms (privacy notice, HTTPS — 5.4)
- No new tracking or cookies anywhere

## Dependencies

- Story 5.3 (privacy policy). 5.4 (forms) for privacy notice and HTTPS.

## Testing Notes

- Manual: no third-party scripts in Network/DOM; no cookies. Privacy policy content audit.
- E2E or audit: assert no analytics/tracking script loads.
