---
id: story-4.3
tac: TAC-33
title: "PWA install prompt and offline banner"
epic: "Epic 4: Progressive Web App & Offline"
status: ready
blockedBy: null
depends: [story-4.1]
priority: should
storyPoints: 2
---

# Story 4.3: PWA install prompt and offline banner

## User Story

As a user,
I want to be prompted to install the app after I've seen value (e.g. first zone tap), and to see a clear offline banner when disconnected,
So that I can install for quick access and know when I'm offline (FR28, FR30).

## Acceptance Criteria

**Given** the user has not yet installed the PWA and has performed a meaningful action (e.g. first zone tap)
**When** the installability criteria are met (beforeinstallprompt or equivalent)
**Then** an install prompt (e.g. PWAInstallPrompt component, shadcn Dialog) is shown with one primary CTA "Installer"
**And** the prompt is not shown again in the same session (e.g. sessionStorage flag) to avoid annoyance
**Given** the user is offline (navigator.onLine false or fetch failure)
**When** the app is displayed
**Then** OfflineBanner (or equivalent) is visible with a calm message (e.g. "Vous êtes hors ligne — données de votre dernière session")
**And** the banner does not block use of cached content

## Technical Context

- PWAInstallPrompt: listen for beforeinstallprompt; show Dialog with "Installer" CTA; on dismiss or install, set sessionStorage so not shown again in session.
- Trigger after meaningful action (e.g. first zone tap) per UX. OfflineBanner: visible when !navigator.onLine or network error; calm message; non-blocking (dismissible or compact).

## Affected Files

- `tacet/src/components/tacet/PWAInstallPrompt.tsx`
- `tacet/src/components/tacet/OfflineBanner.tsx`
- Map page or layout (conditionally show install prompt after first zone tap)

## Dependencies

- Story 4.1 (PWA installable). Offline banner can align with 4.2.

## Testing Notes

- Manual: first zone tap → install prompt (if beforeinstallprompt); dismiss → not shown again in session. Offline → banner.
- E2E: simulate offline → OfflineBanner visible; cached content still usable.
