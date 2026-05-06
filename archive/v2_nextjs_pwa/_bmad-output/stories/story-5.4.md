---
id: story-5.4
tac: TAC-48
title: "Feedback and B2B contact forms"
epic: "Epic 5: Accessibility, Compliance & End-to-End Quality"
status: ready
blockedBy: null
depends: []
priority: should
storyPoints: 3
---

# Story 5.4: Feedback and B2B contact forms

## User Story

As a user or B2B prospect,
I want to send feedback about the product or express interest in data access via a form,
So that the team can respond without exposing personal data unnecessarily (FR35, FR36).

## Acceptance Criteria

**Given** the app has a contact or feedback entry point (e.g. footer "Nous contacter" or "Feedback")
**When** the user opens the feedback form
**Then** they can submit a message (and optionally email) with a privacy notice at submission
**And** data is sent over HTTPS only (NFR-S4); no server-side persistence beyond email transit
**Given** a B2B expression-of-interest flow exists
**When** the prospect submits the form
**Then** the submission is delivered to the configured recipient (e.g. IVAN) and a confirmation is shown
**And** the form does not require login and complies with RGPD (privacy notice, minimal data)
**When** the user has not consented to data collection
**Then** no third-party tracking scripts are loaded (FR37, NFR-S5)

## Technical Context

- Feedback form: message + optional email. Privacy notice at submit. Submit via Route Handler or external service (e.g. Formspree, Tally) over HTTPS. No server-side DB; email delivery only.
- B2B form: expression of interest, minimal fields. Same pattern: HTTPS, privacy notice, confirmation. Recipient config (env or hardcoded).
- No login. No third-party scripts (FR37, NFR-S5).

## Affected Files

- Footer or nav: "Nous contacter" / "Feedback" link
- Feedback form component + route or external action
- B2B form (separate or same page with toggle)
- Privacy notice copy at submission

## Dependencies

- None. Can use mailto or simple POST to serverless function that sends email.

## Testing Notes

- Unit: form validation; submit calls correct endpoint. E2E: submit feedback → confirmation; submit B2B → confirmation. No tracking scripts (manual or E2E assert).
