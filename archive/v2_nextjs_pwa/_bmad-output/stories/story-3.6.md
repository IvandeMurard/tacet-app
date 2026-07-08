---
id: story-3.6
tac: TAC-44
title: "Baromètre du Silence page"
epic: "Epic 3: Real-Time & Contextual Data Layers"
status: ready
blockedBy: null
depends: []
priority: must
storyPoints: 3
---

# Story 3.6: Baromètre du Silence page

## User Story

As a user,
I want to open the Baromètre du Silence to see Paris arrondissements ranked by average serenity,
So that I can compare at arrondissement level (FR23).

## Acceptance Criteria

**Given** the app has a route for the Baromètre (e.g. /barometre)
**When** the user navigates to it (link in nav or footer)
**Then** a page displays the ranking of Paris arrondissements by average Score Sérénité (or equivalent metric)
**And** the page is server-rendered or ISR where appropriate (e.g. daily revalidation)
**And** data is consistent with IRIS-level PPBE and aggregation logic
**When** the user selects an arrondissement (if interactive)
**Then** the behavior is consistent with UX (e.g. link to map focused on that area)

## Technical Context

- Route: app/barometre/page.tsx. Data: aggregate IRIS scores by arrondissement (from paris-noise-iris.geojson or paris-noise-arrondissements.geojson). Ranking by average Score Sérénité.
- ISR: revalidate e.g. daily. No client-side fetch for initial list if using static/ISR.
- Link from nav/footer. Optional: click arrondissement → link to map with focus on that area (flyTo or zone filter).

## Affected Files

- `tacet/src/app/barometre/page.tsx`
- `tacet/public/data/paris-noise-arrondissements.geojson` or aggregation in lib
- Nav/footer (link to /barometre)

## Dependencies

- None. Can use existing V1 barometre if present; align with IRIS aggregation and UX.

## Testing Notes

- Unit: aggregation logic (IRIS → arrondissement average); ranking order.
- E2E: navigate to /barometre → ranking visible; click arrondissement (if implemented) → map focuses.
