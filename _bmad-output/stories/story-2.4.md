---
id: story-2.4
tac: TAC-40
title: "Native share and ShareCard"
epic: "Epic 2: Address Discovery & Acoustic Score"
status: ready
blockedBy: null
depends: [story-2.2]
priority: must
storyPoints: 3
---

# Story 2.4: Native share and ShareCard

## User Story

As a user,
I want to share the current zone's Score and map view via my device's native share (e.g. WhatsApp),
So that I can send the result to someone else without creating an account (FR11).

## Acceptance Criteria

**Given** the IrisPopup is open with a valid zone and Score
**When** the user taps the Share button
**Then** the native share sheet (Web Share API) is invoked when available
**And** shared content includes at least: zone name, Score Sérénité, tier label, and optional link (e.g. deep link to zone)
**Given** ShareCard or screenshot-style content is implemented
**When** share is triggered
**Then** the shared payload is suitable for preview (e.g. title/text or image) per UX "share as acquisition" goal
**When** Web Share API is not available (e.g. desktop)
**Then** a fallback (copy link or open share dialog) is provided

## Technical Context

- Web Share API: navigator.share({ title, text, url }). Title/text: zone name, Score, tier. URL: deep link e.g. /?zone=IRIS_CODE or current URL.
- ShareCard: optional component for screenshot-style content (dom-to-image or similar) for share image. Per UX "share as acquisition."
- Fallback: copy-to-clipboard (link or text) or open mailto/share dialog when navigator.share undefined.

## Affected Files

- `tacet/src/components/tacet/IrisPopup.tsx` (Share button, share handler)
- `tacet/src/components/tacet/ShareCard.tsx` (optional screenshot payload)

## Dependencies

- Story 2.2 (IrisPopup with zone and score).

## Testing Notes

- Unit: share handler builds title/text/url; fallback when navigator.share false.
- E2E: tap Share → share sheet or fallback; shared content contains zone and score.
