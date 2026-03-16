# Tacet — Ambient Agentic Vision

**Status:** Active reference — source of truth for ongoing and next building steps
**Last updated:** 2026-03-16
**Author:** IVAN + Claude

---

## What "Ambient Agentic" Means for Tacet

The user's intuition is exactly right. Ambient agentic breaks into three interlocking ideas:

**1. Reading and anticipating needs**
The app infers context — time of day, browsing behavior, zone history — and surfaces the right signal without being asked. A user looking at zones at 11pm on a Friday gets night-weighted scores and live Rumeur readings foregrounded. A user who has compared 4 zones in the same arrondissement is probably apartment hunting and should see the comparative lens by default.

**2. Personalisation**
Not account-based personalisation, but session-inferred personalisation. Tacet doesn't need a login to know whether you're a tourist passing through or someone stress-testing addresses before signing a lease. Behavioral signals (number of zones viewed, time spent, comparison activity) and optional one-tap intent setting are enough.

**3. Feedback loop**
The micro-report system (built 2026-03-16) is the seed of this. User signals — even anonymous, even low-volume — feed back into the experience. A zone with 5 recent noise reports should feel different from a zone with 0, regardless of its annual PPBE score. Over time, the gap between the static score and lived experience becomes visible and useful.

The pattern across all three: **pull becomes push**. The current app answers questions you ask. The agentic version notices things and tells you before you ask.

---

## Inspiration References

### Her Way (Sze Wai Law-Lis)
The closest reference. Core insight: the same place means something different depending on who you are and when. Her Way routes around risk for women at night without asking the user to configure anything — the framing is built in. For Tacet: a quiet zone at 10am is not the same as a quiet zone at midnight. The app knows what time it is. It should act on that.

**What to steal:**
- Route-level serenity, not just point-level (quiet path between A and B)
- Time of day as a first-class silent signal
- Proactive alternatives ("this zone is noisy right now — quieter option 300m away")

### Dark Sky (acquired by Apple 2020)
"It will rain in 12 minutes at your location." The genius: hyperlocal + proactive + no dashboard. The equivalent for Tacet is "a zone you compared last week has 3 new noise reports this week" — surfaced via the service worker already installed, not requiring the user to reopen the app.

**What to steal:**
- Proactive push via service worker for zones you've shown interest in
- The "usually vs. right now" distinction made explicit and beautiful

### Foursquare / ambient location products
The distinction between what a place *is* (historic data) and what it *feels like today* (current signals). Tacet has both (PPBE annual vs Rumeur live) but currently presents them as equivalent. They're not — and framing them differently is product work.

**What to steal:**
- "Usually calm · Busier than usual right now" framing
- Ambient context that updates without user action

### Citymapper
Not ambient, but instructive: the quiet route. Citymapper added a "quieter streets" routing option. Simple premise, high value for specific users (anxiety, health). Tacet has the data to do this properly at the acoustic level, not just traffic level.

**What to steal:**
- Route as the primary product primitive, not zone
- Intent-based routing (I want to walk somewhere quiet, not just see a map)

---

## Current State (as of 2026-03-16)

### Built
- **Always-on contextual layers**: Rumeur and Chantiers no longer toggled — always fetched, always rendered. Surfaced in the zone popup when relevant (within 1km / 400m respectively).
- **Proximity signals in IrisPopup**: Nearest sensor reading with distance, active chantier count, crowd-report count — shown only when present, no noise when absent.
- **Micro-report system** (`useNoiseReports`): One-tap "Signaler bruit inhabituel" per zone. localStorage-backed, 1-hour window, 5-min cooldown. Seed of the feedback loop.
- **Click coordinates in context** (`selectedZoneLngLat`): Enables all proximity calculations without needing precomputed centroids.

### Not yet built (ambient agentic backlog)
See Epic 6 below.

---

## Epic 6: Ambient Intelligence

*This epic does not exist in the original BMAD epics.md. It is appended here as the next phase of the product.*

The goal of Epic 6 is to move Tacet from a **map you consult** to an **environment that notices things for you**.

---

### Story 6.1: Time-aware signal weighting

**The idea:** The app knows what time it is. Night scores should silently weight `night_level` dB more heavily than the annual Lden. Rumeur readings should be more prominent in the evening. Chantiers should be contextualised ("this ends at 18h") rather than always-present.

**Acceptance criteria (draft):**
- When current hour is between 20:00–06:00, `night_level` is the primary dB shown in IrisPopup (replacing day_level as default)
- Rumeur readings shown with time context ("now" vs "from this morning")
- Chantiers with `date_fin` in the past are filtered out of contextual display
- No toggle, no setting — happens automatically based on system time

**Dependencies:** Existing `day_level`, `night_level` in IrisProperties; existing Rumeur `timestamp`

---

### Story 6.2: Intent layer (light personalisation)

**The idea:** A single, optional, one-tap question on first meaningful interaction (first zone popup): *"Je cherche..."* — three options: **un logement** / **un endroit calme maintenant** / **à m'informer**. Stored in localStorage. Shapes which signals are emphasised throughout the session.

| Intent | Effect |
|--------|--------|
| Un logement | Day/night split prominent; comparison tray surfaced early; "other quiet zones nearby" shown |
| Un endroit calme maintenant | Live Rumeur reading dominates; micro-report count shown; time-of-day context foregrounded |
| À m'informer | Current default experience — scores and sources, no additional weighting |

**Acceptance criteria (draft):**
- Shown once after first zone selection, not on load
- Dismissable (defaults to "À m'informer")
- Persisted in localStorage; reset-able (small link in zone popup footer)
- No backend, no account

**Dependencies:** IrisPopup; localStorage pattern from useNoiseReports

---

### Story 6.3: Proactive zone alternatives

**The idea:** When a selected zone scores below a threshold (e.g. Score < 40), proactively show the nearest quieter zone within 500m. "Quartier bruyant — zone calme à 380m" with a tap-to-navigate action. No toggle. Only shown when the contrast is meaningful.

**Acceptance criteria (draft):**
- Computed from IRIS centroid data already available
- Shown inline in IrisPopup below the score, only when Score < 40 and a quieter alternative exists within 500m
- Tap navigates the map to that zone and opens its popup

**Dependencies:** `iris-centroids.geojson` (already loaded); `selectedZoneLngLat`

---

### Story 6.4: Service worker push for watched zones

**The idea:** If a user has pinned or compared a zone, Tacet can notify them of significant changes (new noise reports, Rumeur spike) via the service worker already installed. Opt-in only, single permission request, calm tone.

**Acceptance criteria (draft):**
- Notification permission requested only after user has pinned at least 2 zones (clear value moment)
- Triggers: zone accumulates 3+ micro-reports in 1 hour; Rumeur reading > 75 dB in a pinned zone
- Notification copy: calm, specific ("Bruit signalé dans votre zone épinglée — Marais")
- Tapping notification opens the app at that zone

**Dependencies:** Serwist service worker (already configured); pinnedZones in context; useNoiseReports

---

### Story 6.5: Route serenity (quiet path)

**The idea:** The most natural evolution of the product. Given two addresses, find the quietest walking route through Paris using IRIS zone scores. Not traffic-quiet — acoustically quiet. The product Citymapper doesn't have.

**Acceptance criteria (draft):**
- Entry point: "Itinéraire calme" button in SearchBar or AppNav
- Input: origin + destination (reuses Photon geocoding)
- Output: a route displayed on the map that maximises average serenity score across IRIS zones traversed
- Routing algorithm: graph traversal over IRIS zone adjacency, weighted by Score Sérénité
- No external routing API required for walking distances (turf.js + IRIS adjacency graph)

**Dependencies:** `paris-noise-iris.geojson` (adjacency computation); turf.js (not yet installed); Photon geocoding (already working)

**Notes:** This is the most complex story in Epic 6. Recommend breaking into sub-stories when the time comes: (a) adjacency graph generation script, (b) routing algorithm, (c) route display on map, (d) UI.

---

## The Information Presentation Challenge

> *"The issue remains: finding a good way to present the information in a nice way. We'll address this later."*

**This is flagged as a BMAD design sprint item, not an implementation task.**

### The problem statement

Tacet now has multiple signal types in the zone popup:
- Static annual score (PPBE)
- Live sensor reading (Rumeur)
- Active construction (Chantiers)
- Crowd reports (micro-reports)
- Day/night levels
- Intent-weighted signals (Epic 6)

Adding signals without a visual hierarchy creates noise (ironic). The current IrisPopup was designed for 1–2 data points. It does not scale gracefully to 5+.

### What this is not

This is not a "add more cards" problem. It's an **information architecture** problem: what is the single most important thing a user needs in this moment, and how do everything else serve or stay out of the way of that thing.

The current score-first hierarchy (`text-5xl` number) is correct. The question is how secondary and tertiary signals nest beneath it without competing.

### Reference approaches to explore in the design sprint

| Approach | What it looks like | Risk |
|----------|-------------------|------|
| **Layered disclosure** | Score first, "more context" expands below | Requires a tap; buries live signals |
| **Ambient badges** | Small icons on the score itself (sensor dot, construction icon, report count) | Can feel cluttered at small sizes |
| **Contextual substitution** | Only the most relevant secondary signal shown at a time, not all of them | Requires clear priority logic |
| **Temporal framing** | Score split into "usually" vs "right now" — two numbers, not five signals | Conceptually clean; requires design exploration |
| **Card anatomy redesign** | Separate card sections with clear visual hierarchy | More space required; popup height constraints |

### Recommendation for the BMAD sprint

Before any implementation of Epic 6 UI, run a design sprint with these inputs:
1. This document as briefing
2. Her Way UI as reference (minimal, contextual, non-dashboard)
3. Dark Sky's alert card as reference (single signal, maximum clarity)
4. Constraint: IrisPopup must still work on 375px with thumb navigation

**Output expected from sprint:** A single revised IrisPopup anatomy (wireframe or annotated screenshot) that can accommodate up to 4 signal types without hierarchy loss. This becomes the spec for Stories 6.1–6.4 UI implementation.

---

## Priority Order for Next Steps

| Priority | Story | Rationale |
|----------|-------|-----------|
| 1 | 6.1 Time-aware weighting | Zero new UI, immediate value, uses existing data |
| 2 | Design sprint (IrisPopup) | Unblocks all visual Epic 6 work |
| 3 | 6.2 Intent layer | Highest leverage personalisation with minimal complexity |
| 4 | 6.3 Proactive alternatives | Natural extension of existing proximity logic |
| 5 | 6.4 Service worker push | High value but requires UX care on permission request |
| 6 | 6.5 Route serenity | Highest complexity, highest differentiation |

---

## Agent Instructions

When implementing any story from Epic 6:
1. Read this document first
2. Check `_bmad-output/planning-artifacts/project-context.md` for technical constraints
3. Time-aware logic must use `new Date()` — never hardcode hour thresholds
4. Intent layer must degrade gracefully (dismissed = default experience, no broken state)
5. All new signals in IrisPopup must be **conditionally rendered** — shown only when present and relevant, never as empty placeholders
6. Do not build the IrisPopup redesign until the design sprint output exists
