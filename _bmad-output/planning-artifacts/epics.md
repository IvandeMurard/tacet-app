---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/planning/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Tacet - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Tacet, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. Map Discovery**
- FR1: Users can view a choropleth map of Paris displaying noise levels for all 992 IRIS zones simultaneously.
- FR2: Users can pan and zoom the map to navigate between neighborhoods.
- FR3: Users can select an IRIS zone by tapping or clicking on it to access its noise data.
- FR4: Users can visually compare multiple zones through a continuous color gradient representing serenity levels.
- FR5: Users can access the map as a full-screen experience on mobile devices.

**2. Zone Information & Score Sérénité**
- FR6: Users can view the Score Sérénité (0–100) for any selected IRIS zone.
- FR7: Users can read a human-readable description of a zone's noise character without requiring acoustic expertise.
- FR8: Users can see the data vintage year of the PPBE noise measurements for a selected zone.
- FR9: Users can read a disclaimer clarifying that the Score Sérénité is an indicative metric not certified for regulatory use.
- FR10: Users can access the scoring methodology documentation (Lden → Score Sérénité transformation) via the legal notice.
- FR11: Users can share a zone's Score Sérénité and map view via the device's native share mechanism.

**3. Address Search & Navigation**
- FR12: Users can search for a Paris address and navigate the map to the corresponding IRIS zone.
- FR13: Users can see address autocomplete suggestions as they type, without requiring a full address entry.
- FR14: Users can search by neighborhood name or landmark in addition to a full street address.
- FR15: Users can clear an active search and return to a default map view.

**4. Data Layers**
- FR16: Users can activate or deactivate the Bruitparif RUMEUR real-time sensor overlay on the map.
- FR17: Users can view the current noise level (dB) from RUMEUR sensors near a selected zone.
- FR18: Users can see the timestamp of the most recent RUMEUR data refresh.
- FR19: Users can activate or deactivate the Construction Sites (Chantiers) layer showing active construction near any zone.
- FR20: Users can view a construction site's location, affected radius, and expected end date.
- FR21: Users can understand that an active construction site may not be reflected in the static Score Sérénité (transparent product communication of this limitation).
- FR22: Users can activate or deactivate the 2026 Elections thematic layer contextualizing noise data for the municipal campaign.
- FR23: Users can access the Baromètre du Silence ranking of Paris arrondissements by average serenity level.

**5. Real-Time Data & Freshness**
- FR24: The system automatically refreshes RUMEUR sensor data on a 3-minute cadence without requiring user action.
- FR25: Users receive a visual indicator when live RUMEUR data is unavailable or stale.
- FR26: Users can distinguish between live data and cached offline data at any point in the session.
- FR27: Users can see the annual update cycle disclosure for PPBE-derived data prominently in the zone information panel.

**6. Progressive Web App & Offline**
- FR28: Users can install the application to their device home screen as a PWA without an app store.
- FR29: Users can access the application offline, with the data of their last visited IRIS zone available.
- FR30: Users can see a clear indicator when the application is operating in offline mode.
- FR31: Users can launch the cached application shell in under 2 seconds from a subsequent visit.

**7. Accessibility, Legal & Contact**
- FR32: Users with visual impairments can access IRIS zone noise information through a keyboard-navigable text alternative to the map canvas.
- FR33: Users navigating by keyboard can reach all interactive elements in a logical tab sequence.
- FR34: Users can access the legal notice, data source attributions (Bruitparif ODbL, Open Data Paris Etalab), and privacy policy from any page.
- FR35: Users can submit feedback about a zone's noise data or the product via a contact form.
- FR36: Prospective B2B clients can submit an expression of interest in data access via a dedicated contact channel.
- FR37: The system does not collect personal data without explicit user consent, and no third-party tracking scripts are loaded.

**8. Ambient Intelligence (V3 — Epic 6)**
- FR38: The app always-on surfaces contextual signals (nearest RUMEUR sensor, active chantier count, crowd reports) in the zone popup without user toggles, shown only when relevant.
- FR39: Users can tap a one-touch button to report unusual noise in a selected zone (localStorage-backed, 1-hour window, 5-min cooldown).
- FR40: The app automatically adapts acoustic display to time of day — night levels (Ln) are foregrounded after 20:00, day levels (Lden) during daytime — with no user configuration.
- FR41: The system generates a 1–2 sentence contextual summary for a selected zone via an AI enrichment agent (Claude Haiku), synthesising score, live sensor, chantiers, and micro-reports into a mobile-readable insight. Non-blocking; IrisPopup renders immediately with default view.
- FR42: Users can optionally set a one-tap session intent ("Je cherche un logement / un endroit calme maintenant / à m'informer") that shapes which signals are emphasised throughout the session. Dismissable; defaults to informational experience.
- FR43: When a selected zone scores below 40, the app proactively surfaces the nearest quieter zone within 500m with a tap-to-navigate action, shown inline in the zone popup.
- FR44: Users who have pinned at least 2 zones can opt in to receive proactive push notifications (via service worker) when a pinned zone accumulates significant noise reports or a Rumeur spike exceeds 75 dB.
- FR45: Users can find the quietest walking route between two Paris addresses, using acoustic zone scores as the routing weight — no external routing API required.

### NonFunctional Requirements

**Performance (NFR-P1–P8):** LCP < 2.5s, app shell < 1s on return, Lighthouse Performance ≥ 85, INP < 100ms, CLS < 0.1, PMTiles first tile < 1s on 3G, RUMEUR UI update < 1s, initial JS bundle < 300 KB gzipped.

**Security (NFR-S1–S6):** HTTPS only, no client IP logging beyond platform defaults, API keys server-side only, contact form HTTPS only, zero third-party scripts in V2, CSP and security headers on Vercel.

**Scalability (NFR-SC1–SC4):** 10k concurrent users, RUMEUR proxy 1 upstream request per 3 min, PMTiles from CDN edge, graceful degradation on third-party failure.

**Accessibility (NFR-A1–A6):** Lighthouse Accessibility ≥ 95, contrast ≥ 4.5:1, full keyboard navigation, text alternative for map, prefers-reduced-motion, lang="fr".

**Reliability (NFR-R1–R5):** 99.5% availability, graceful RUMEUR/Chantiers degradation, offline last-zone cache, PPBE GeoJSON precached.

**Maintainability (NFR-M1–M5):** Vitest ≥ 80% on critical functions, Playwright ≥ 10 E2E scenarios, CI blocks merge on failure, Vercel Preview per PR, no API keys in source.

**Data Privacy (NFR-PP1–PP4):** No personal data in V2, ephemeral geocoding, privacy policy in footer, V2.1 Plausible cookieless only.

### Additional Requirements

**From Architecture:**
- Migration-in-place (brownfield); no starter template. MapLibre GL JS direct integration (no react-map-gl), dynamic import, ref-based.
- IRIS data: static GeoJSON from public/data, precached by Serwist; base map tiles via PMTiles from Vercel Blob CDN.
- RUMEUR: Next.js Route Handler `/api/rumeur` with 3-min server-side cache; client SWR polling 180s.
- Chantiers: Route Handler `/api/chantiers`, 1-hour cache, lazy-loaded when layer activated.
- Client state: SWR for server data, single MapContext for UI state (selectedZone, activeLayers, pinnedZones max 3, expertMode, mapRef).
- Serwist: precache app shell + PPBE GeoJSON; runtime stale-while-revalidate for tiles, network-first for RUMEUR; last-visited zone in localStorage.
- Component tiers: ui/ (shadcn), tacet/ (business), map/ (MapLibre layers). Naming: PascalCase components, camelCase hooks, kebab-case utils.
- Route Handler response format: `{ data, error, fallback, cachedAt }`. Error handling: calm degradation, never alarming.
- MapLibre layer pattern: add/remove idempotent; layer IDs `{source}-{type}`. Photon client-direct, debounce 350ms.
- CI/CD: GitHub Actions lint → unit → build → e2e → LHCI; blocks merge. Feature flag `NEXT_PUBLIC_ENABLE_RUMEUR`.

**From UX:**
- Mobile-first 375px; breakpoints lg 1024px (desktop), md 768px (tablet). SearchBar top-4 full-width; IrisPopup bottom sheet; AppNav bottom-4 floating.
- Score number `text-5xl font-bold` tier-colored; tier label `text-xs font-semibold tracking-widest uppercase`. Character note italic, text-muted.
- Address-to-score: zero taps after suggestion select; map flyTo 1200ms, IrisPopup slide-up 300ms auto-reveal.
- Glass: light `bg-white/80 backdrop-blur-xl`; dark `bg-white/6 backdrop-blur-[24px]`. Z-index: SearchBar 40, IrisPopup 30, AppNav 20, Map 10.
- Touch targets ≥ 44×44px (mobile). Tier colors (V2): Très calme #34D399, Calme #6EE7B7, Modéré #FCD34D, Bruyant #FCA5A5, Très bruyant #D8B4FE.
- TextAlternativeView: keyboard-navigable zone table, Alt+T or footer link; first-class screen for RGAA.
- Loading: skeleton matching component anatomy; errors calm amber tone, never red. Share card designed for screenshot/WhatsApp.

### FR Coverage Map

FR1: Epic 1 - Choropleth/Score Dots map of Paris IRIS zones
FR2: Epic 1 - Pan and zoom map navigation
FR3: Epic 1 - Select IRIS zone by tap/click
FR4: Epic 1 - Visual comparison via color gradient (Score Dots)
FR5: Epic 1 - Full-screen map on mobile
FR6: Epic 2 - View Score Sérénité 0–100 for selected zone
FR7: Epic 2 - Human-readable zone noise description (character note)
FR8: Epic 2 - Data vintage year in zone panel
FR9: Epic 2 - Disclaimer on Score indicativity
FR10: Epic 2 - Methodology via legal notice
FR11: Epic 2 - Native share zone Score and map view
FR12: Epic 2 - Search Paris address and navigate to IRIS zone
FR13: Epic 2 - Address autocomplete as user types
FR14: Epic 2 - Search by neighborhood or landmark
FR15: Epic 2 - Clear search and default map view
FR16: Epic 3 - Toggle RUMEUR real-time overlay
FR17: Epic 3 - View RUMEUR sensor dB near zone
FR18: Epic 3 - RUMEUR last refresh timestamp
FR19: Epic 3 - Toggle Chantiers layer
FR20: Epic 3 - Chantier location, radius, end date
FR21: Epic 3 - Transparent communication Chantiers vs static Score
FR22: Epic 3 - Toggle 2026 Elections layer
FR23: Epic 3 - Baromètre du Silence ranking page
FR24: Epic 3 - Auto-refresh RUMEUR 3-minute cadence
FR25: Epic 3 - Visual indicator when RUMEUR unavailable/stale
FR26: Epic 3 - Distinguish live vs cached offline data
FR27: Epic 2/3 - Annual PPBE disclosure in zone panel
FR28: Epic 4 - Install PWA to home screen
FR29: Epic 4 - Offline access to last visited zone data
FR30: Epic 4 - Offline mode indicator
FR31: Epic 4 - Cached shell launch < 2s
FR32: Epic 5 - Keyboard-navigable text alternative to map
FR33: Epic 5 - Logical tab order all interactive elements
FR34: Epic 5 - Legal notice, attributions, privacy policy from any page
FR35: Epic 5 - Feedback contact form
FR36: Epic 5 - B2B expression of interest channel
FR37: Epic 5 - No personal data without consent; no third-party tracking
FR38: Epic 6 - Always-on contextual signals in zone popup (built 2026-03-16)
FR39: Epic 6 - One-tap noise reporting per zone / micro-report (built 2026-03-16)
FR40: Epic 6 - Time-aware acoustic display (day vs night levels)
FR41: Epic 6 - AI-powered zone enrichment summary (Claude Haiku, non-blocking)
FR42: Epic 6 - Intent-based session personalisation (one-tap, localStorage)
FR43: Epic 6 - Proactive quiet zone alternative (Score < 40, within 500m)
FR44: Epic 6 - Service worker push notifications for watched zones
FR45: Epic 6 - Quiet route between two addresses (acoustic graph traversal)

## Epic List

### Epic 1: Open-Source Map Foundation
Users can view the Paris acoustic map with tier-colored Score Dots on a fast, open-source map (MapLibre + PMTiles), with quality enforced by CI/CD and Lighthouse.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Address Discovery & Acoustic Score
Users can search any Paris address, instantly see the Score Sérénité with zone details, share it, and compare up to 3 zones.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR27

### Epic 3: Real-Time & Contextual Data Layers
Users can activate RUMEUR real-time sensor data and Construction Sites (Chantiers) to complement the static noise score; Elections layer and Baromètre page available.
**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

### Epic 4: Progressive Web App & Offline
Users can install Tacet on their device and access cached noise data when offline.
**FRs covered:** FR28, FR29, FR30, FR31

### Epic 5: Accessibility, Compliance & End-to-End Quality
All users can access acoustic data (including keyboard/text alternative); legal compliance and contact/feedback are in place; quality ensured by E2E and audits.
**FRs covered:** FR32, FR33, FR34, FR35, FR36, FR37

### Epic 6: Ambient Intelligence
Tacet moves from a map you consult to an environment that notices things for you — contextual signals surface automatically, an AI agent synthesises zone context, intent-based personalisation shapes what's shown, and the most advanced users can find the quietest walking route between two addresses.
**FRs covered:** FR38, FR39, FR40, FR41, FR42, FR43, FR44, FR45

---

## Epic 1: Open-Source Map Foundation

Users can view the Paris acoustic map with tier-colored Score Dots on a fast, open-source map. Quality infrastructure (CI/CD, Lighthouse) protects all subsequent work.

### Story 1.1: MapLibre GL JS migration and map container

As a user,
I want the Paris map to load using an open-source map engine (MapLibre) with no variable API cost,
So that I can browse neighborhoods reliably without dependency on paid tile/geocoding services.

**Acceptance Criteria:**

**Given** the existing Next.js 14 app with Mapbox-based map
**When** the app loads the main map page
**Then** the map uses MapLibre GL JS (dynamic import, ssr: false) instead of Mapbox
**And** the map initializes with Paris center and default zoom from existing constants
**And** pan and zoom controls (and fullscreen if present) work correctly
**And** no Mapbox or react-map-gl packages remain in dependencies

**Given** the map container is mounted
**When** the viewport resizes
**Then** the map canvas resizes appropriately (resize observer or map.resize())

### Story 1.2: PMTiles protocol and base map tiles

As a user,
I want the base map tiles to load from a PMTiles source (e.g. Vercel Blob CDN),
So that tile delivery has no variable cost and stays fast on 3G (NFR-P6).

**Acceptance Criteria:**

**Given** MapLibre is initialized
**When** the PMTiles protocol is registered via maplibregl.addProtocol('pmtiles', ...)
**Then** the map style uses a pmtiles:// or equivalent source for the base layer
**And** tiles load and render without CORS or mixed-content issues
**And** first tile visible within 1s on 3G (or documented constraint)

**Given** the app is built for production
**When** PMTiles asset is configured (next.config or env)
**Then** no API key for base tiles is required client-side

### Story 1.3: IRIS Score Dots layer and zone selection

As a user,
I want to see Score Sérénité as colored dots at zone centroids and select a zone by tapping a dot,
So that I can explore Paris noise at a glance and open zone details (FR1, FR3, FR4).

**Acceptance Criteria:**

**Given** IRIS centroid GeoJSON (or derived from paris-noise-iris.geojson) is available
**When** the map is at neighborhood zoom (e.g. ≥ 13)
**Then** a MapLibre circle layer displays one dot per IRIS at centroid, colored by tier (noise-categories)
**And** dot size scales with zoom (e.g. 8px at 13, 12px at 16)
**When** the user taps or clicks a dot
**Then** that IRIS zone is selected (state in MapContext)
**And** the selected zone is visually emphasized (e.g. larger dot, pulse, or boundary)
**And** no second tap is required to open the zone panel (panel opens automatically—see Epic 2)

**Given** zoom is below neighborhood level (e.g. < 13)
**When** clustering is enabled
**Then** dots cluster with arrondissement-level or cluster count; tapping cluster zooms in or expands

### Story 1.4: Zone highlight and boundary on selection

As a user,
I want the selected IRIS zone boundary to be visible (e.g. dashed outline and light fill),
So that I know exactly which area the Score refers to (FR3).

**Acceptance Criteria:**

**Given** an IRIS zone is selected and its geometry is available
**When** the map is rendered
**Then** a line layer (dashed) and optional fill layer (e.g. 3% opacity) show the IRIS polygon
**And** layer IDs follow architecture convention (e.g. zone-highlight-line, zone-highlight-fill)
**When** selection is cleared
**Then** highlight layers are removed or updated

### Story 1.5: CI/CD pipeline and unit tests

As a developer,
I want a GitHub Actions pipeline that runs lint, unit tests, build, and blocks merge on failure,
So that quality and build stability are enforced before deployment (TAC-31, NFR-M3).

**Acceptance Criteria:**

**Given** the repo has a `.github/workflows` directory
**When** a push or PR targets main (or default branch)
**Then** a workflow runs: lint (e.g. next lint), unit tests (Vitest), build (next build)
**And** merge is blocked if any job fails (or configurable branch protection)
**Given** critical domain logic (e.g. noise-categories: Lden → Score, getSereniteScore)
**When** unit tests run
**Then** Vitest tests exist and pass for those functions (coverage target per NFR-M1 can be stepwise)

**Given** Vitest is configured
**When** tests run in CI
**Then** path aliases (@/) resolve correctly (e.g. via vitest.config.ts)

### Story 1.6: Lighthouse CI budget guards (Performance and Accessibility)

As a developer,
I want Lighthouse CI to run on the built app and enforce Performance ≥ 85 and Accessibility ≥ 95,
So that regressions in performance or a11y block merge (TAC-32, NFR-P3, NFR-A1).

**Acceptance Criteria:**

**Given** a successful build exists (e.g. in CI or locally)
**When** Lighthouse CI runs (e.g. lhci autorun or GitHub Action)
**Then** Performance score ≥ 85 and Accessibility score ≥ 95 are asserted (budget or threshold)
**And** CI fails the job if either budget is not met
**And** report is available (artifact or URL) for inspection
**Given** bundle size budget exists (e.g. 300 KB gzipped)
**When** the budget is configured in Lighthouse or a separate check
**Then** initial JS bundle size is asserted (NFR-P8)

---

## Epic 2: Address Discovery & Acoustic Score

Users can search any Paris address, instantly see the Score Sérénité with zone details, share it, and compare up to 3 zones. Core product loop (Maria J1).

### Story 2.1: Photon Komoot geocoding and SearchBar

As a user,
I want to type a Paris address and get autocomplete suggestions, then select one to move the map to that zone,
So that I can find the Score for any address without knowing the IRIS code (FR12, FR13, FR14).

**Acceptance Criteria:**

**Given** the user is on the map page and the SearchBar is visible
**When** the user types at least 2 characters (Paris-bounded query)
**Then** after 350ms debounce, a request is sent to Photon Komoot API (client-direct, no API key)
**And** up to 5 suggestions are shown in a dropdown (street + arrondissement or landmark)
**When** the user selects a suggestion
**Then** the map flies to the corresponding coordinates (flyTo, ~1200ms)
**And** the IRIS zone containing that point is resolved and set as selected (MapContext)
**And** the SearchBar collapses or closes; focus/UX per UX spec

**Given** the user clears the search or selects "clear"
**When** the action is triggered
**Then** the map returns to default view and selection is cleared (FR15)

### Story 2.2: IrisPopup auto-reveal and Score display

As a user,
I want the zone panel (IrisPopup) to open automatically when I select a zone (by search or tap) and show the Score Sérénité prominently,
So that I see the answer in one gesture without an extra tap (FR6, FR7).

**Acceptance Criteria:**

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

### Story 2.3: Data vintage, disclaimer, and methodology link

As a user,
I want to see the data vintage year and a short disclaimer that the Score is indicative, and a link to the full methodology,
So that I trust the data and understand its limitations (FR8, FR9, FR10).

**Acceptance Criteria:**

**Given** the IrisPopup is open for a zone with PPBE data
**When** the user views the panel
**Then** the data vintage year (e.g. "Données 2024") is visible in the zone panel (footer or subtitle)
**And** a one-line disclaimer is visible (e.g. Score indicatif, non certifié usage réglementaire)
**And** a link to the legal notice (or anchor) is present where the Lden → Score methodology is documented
**When** the user follows the link
**Then** the legal notice page (or section) loads with methodology and attributions (ODbL/Etalab)

### Story 2.4: Native share and ShareCard

As a user,
I want to share the current zone's Score and map view via my device's native share (e.g. WhatsApp),
So that I can send the result to someone else without creating an account (FR11).

**Acceptance Criteria:**

**Given** the IrisPopup is open with a valid zone and Score
**When** the user taps the Share button
**Then** the native share sheet (Web Share API) is invoked when available
**And** shared content includes at least: zone name, Score Sérénité, tier label, and optional link (e.g. deep link to zone)
**Given** ShareCard or screenshot-style content is implemented
**When** share is triggered
**Then** the shared payload is suitable for preview (e.g. title/text or image) per UX "share as acquisition" goal
**When** Web Share API is not available (e.g. desktop)
**Then** a fallback (copy link or open share dialog) is provided

### Story 2.5: Zone pin and ComparisonTray (max 3)

As a user,
I want to pin the current zone to a shortlist and compare up to 3 zones side by side,
So that I can decide between addresses (e.g. Maria comparing two apartments, Sophie comparing schools) (FR6 context, UX pin → compare).

**Acceptance Criteria:**

**Given** the IrisPopup is open and the user has not yet pinned 3 zones
**When** the user taps Pin (or equivalent)
**Then** the current zone is added to pinned zones (MapContext + sessionStorage, max 3)
**And** the pin button state reflects "pinned" for this zone
**Given** one or more zones are pinned
**When** the user opens the comparison tray (e.g. from AppNav or pinned count)
**Then** pinned zones are listed with zone name, arrondissement, Score, and tier
**And** the user can unpin a zone from the tray
**And** the tray is accessible without leaving the map (e.g. overlay or slide-out)
**When** the user pins a fourth zone
**Then** the oldest pin is dropped (FIFO) or the UI prevents adding beyond 3; behavior is clear

### Story 2.6: SerenityBar, TierBadge, and DataProvenance in IrisPopup

As a user,
I want the zone panel to show a small serenity bar, a tier badge, and data source attribution,
So that I quickly understand the score band and data origin (FR6, FR27).

**Acceptance Criteria:**

**Given** the IrisPopup is open
**When** the zone has a valid Score
**Then** a SerenityBar (e.g. 4px height, tier-colored) is visible alongside or below the score
**And** TierBadge shows the tier label with tier styling (e.g. rounded-full, 5-tier colors)
**And** DataProvenance shows at least "Bruitparif · PPBE [year]" in small, muted text
**And** annual update cycle disclosure (PPBE-derived data) is present in or near the panel (FR27)
**When** the user toggles expert mode (if implemented)
**Then** raw dB (Lden/Ln) can be shown in addition to Score, per UX spec

---

## Epic 3: Real-Time & Contextual Data Layers

Users can activate RUMEUR real-time sensor data and Construction Sites (Chantiers) to complement the static score; Elections layer and Baromètre page available.

### Story 3.1: RUMEUR API proxy and server-side cache

As a developer/product,
I want a Next.js Route Handler that fetches Bruitparif RUMEUR data and caches it for 3 minutes,
So that the client never exposes the API key and we minimize upstream calls (TAC-35, NFR-SC2).

**Acceptance Criteria:**

**Given** BRUITPARIF_API_KEY is set in Vercel (or env)
**When** GET /api/rumeur is called
**Then** the handler fetches RUMEUR data from Bruitparif (server-side only)
**And** the response is cached in memory (or equivalent) for 3 minutes
**And** the response shape is consistent: e.g. { data, error, fallback, cachedAt }
**When** the upstream request fails
**Then** the handler returns a structured error and optionally last cached data (fallback: true)
**And** no API key is present in client bundle or response

### Story 3.2: useRumeurData hook and RUMEUR layer on map

As a user,
I want to turn on the RUMEUR layer and see real-time sensor points on the map, with automatic refresh every 3 minutes,
So that I can see current noise near a zone (FR16, FR17, FR24).

**Acceptance Criteria:**

**Given** the RUMEUR layer is enabled in AppNav (or layer controls)
**When** the map is displayed
**Then** useRumeurData (SWR, key /api/rumeur, refreshInterval 180000) fetches data
**And** a MapLibre layer (e.g. circle or symbol) displays RUMEUR sensor locations with current dB or color
**And** the layer is idempotent (add/update/remove per architecture layer pattern)
**When** new data arrives (after 3 min or on mount)
**Then** the layer updates within 1s of data receipt (NFR-P7)
**When** the layer is toggled off
**Then** the RUMEUR layer is removed from the map and polling can pause (SWR key null)

### Story 3.3: RUMEUR timestamp and stale/unavailable indicator

As a user,
I want to see when RUMEUR data was last updated and whether it is currently unavailable,
So that I know if I'm looking at live or stale data (FR18, FR25, FR26).

**Acceptance Criteria:**

**Given** the RUMEUR layer is active
**When** data has been successfully fetched
**Then** the UI shows the timestamp of the most recent RUMEUR refresh (e.g. "Mis à jour il y a 2 min" or ISO in UI)
**Given** RUMEUR fetch fails or is stale
**When** the user views the map or a zone with RUMEUR context
**Then** a calm visual indicator is shown (e.g. "Données temps réel indisponibles" or amber message)
**And** static PPBE data and app remain usable (NFR-R2)
**When** the user is offline
**Then** cached RUMEUR data (if any) is distinguishable from live (e.g. "données en cache" or offline banner)

### Story 3.4: Chantiers API proxy and Chantiers layer

As a user,
I want to turn on the Construction Sites layer and see active chantiers with location and end date,
So that I can factor temporary noise into my decision (FR19, FR20).

**Acceptance Criteria:**

**Given** the Chantiers layer is enabled
**When** the map is displayed
**Then** the app fetches Chantiers from GET /api/chantiers (Route Handler to Open Data Paris API v2.1)
**And** the handler caches the response (e.g. 1 hour) and returns { data, error, fallback, cachedAt }
**And** a MapLibre layer displays construction sites (e.g. symbols or circles) with location
**When** the user taps or hovers a chantier (if supported)
**Then** affected radius and expected end date are visible (tooltip or popup)
**When** the Chantiers API is unavailable
**Then** the layer fails gracefully with an informative message; rest of app unaffected (NFR-R3)

### Story 3.5: Chantiers limitation disclosure and Elections layer

As a user,
I want to understand that the static Score does not include temporary construction noise, and I want to toggle the 2026 Elections thematic layer,
So that I interpret the data correctly and can use the elections context (FR21, FR22).

**Acceptance Criteria:**

**Given** the Chantiers layer is on and the user views zone info or legend
**When** relevant
**Then** a short, calm disclosure is visible (e.g. "Le Score annuel ne reflète pas les chantiers en cours")
**Given** the Elections layer exists in the app (V1 or V2)
**When** the user toggles the 2026 Elections layer in AppNav
**Then** the thematic layer is shown or hidden on the map
**And** it contextualizes noise data for the municipal campaign per PRD

### Story 3.6: Baromètre du Silence page

As a user,
I want to open the Baromètre du Silence to see Paris arrondissements ranked by average serenity,
So that I can compare at arrondissement level (FR23).

**Acceptance Criteria:**

**Given** the app has a route for the Baromètre (e.g. /barometre)
**When** the user navigates to it (link in nav or footer)
**Then** a page displays the ranking of Paris arrondissements by average Score Sérénité (or equivalent metric)
**And** the page is server-rendered or ISR where appropriate (e.g. daily revalidation)
**And** data is consistent with IRIS-level PPBE and aggregation logic
**When** the user selects an arrondissement (if interactive)
**Then** the behavior is consistent with UX (e.g. link to map focused on that area)

---

## Epic 4: Progressive Web App & Offline

Users can install Tacet on their device and access cached noise data when offline.

### Story 4.1: Serwist service worker and precache (app shell + GeoJSON)

As a user,
I want the app to work as a PWA with a service worker that caches the shell and critical data,
So that repeat visits load quickly and I can use the app offline (FR28, FR31, NFR-P2).

**Acceptance Criteria:**

**Given** the project uses Next.js and Serwist (or equivalent) is configured
**When** the app is built and deployed
**Then** a service worker is registered that precaches the app shell (HTML, JS, CSS, fonts)
**And** paris-noise-iris.geojson (or required IRIS data) is precached so the map can render offline
**When** the user visits the app a second time (or after install)
**Then** the shell loads from cache and is available in under 2 seconds (FR31)
**And** the PWA is installable (manifest.json, icons, install prompt or browser UI)

### Story 4.2: Offline last-visited zone and runtime caching

As a user,
I want my last visited zone's data to be available when I'm offline,
So that I can still see that zone's Score without the network (FR29, NFR-R4).

**Acceptance Criteria:**

**Given** the user has selected and viewed at least one IRIS zone while online
**When** the user goes offline (or network is unavailable)
**Then** the last visited zone's Score and zone info are available (e.g. from Cache API + localStorage metadata)
**And** the app displays that zone's data when the user opens the app or navigates to the map
**And** a clear "Mode hors ligne" (or equivalent) indicator is shown (FR30)
**Given** runtime caching for tiles and RUMEUR is configured (Serwist)
**When** the user was online and had loaded tiles or RUMEUR
**Then** stale-while-revalidate (or cache-first where appropriate) is used per architecture
**And** offline fallback for RUMEUR shows cached data with a calm "données en cache" message

### Story 4.3: PWA install prompt and offline banner

As a user,
I want to be prompted to install the app after I've seen value (e.g. first zone tap), and to see a clear offline banner when disconnected,
So that I can install for quick access and know when I'm offline (FR28, FR30).

**Acceptance Criteria:**

**Given** the user has not yet installed the PWA and has performed a meaningful action (e.g. first zone tap)
**When** the installability criteria are met (beforeinstallprompt or equivalent)
**Then** an install prompt (e.g. PWAInstallPrompt component, shadcn Dialog) is shown with one primary CTA "Installer"
**And** the prompt is not shown again in the same session (e.g. sessionStorage flag) to avoid annoyance
**Given** the user is offline (navigator.onLine false or fetch failure)
**When** the app is displayed
**Then** OfflineBanner (or equivalent) is visible with a calm message (e.g. "Vous êtes hors ligne — données de votre dernière session")
**And** the banner does not block use of cached content

### Story 4.4: Manifest, icons, and installability

As a product owner,
I want the PWA manifest and icons to be correct so that "Add to Home Screen" works on mobile and desktop,
So that users can install Tacet without an app store (FR28).

**Acceptance Criteria:**

**Given** the app has a manifest (e.g. public/manifest.json or generated)
**When** the manifest is validated (e.g. Lighthouse PWA or browser devtools)
**Then** name, short_name, start_url, display (standalone or minimal-ui), and lang (fr) are set
**And** icons include at least 192px and 512px (and maskable if required)
**When** the user visits the app on a supporting device/browser
**Then** the install option appears (browser UI or custom prompt)
**And** after install, launch shows the app shell and map as expected

---

## Epic 5: Accessibility, Compliance & End-to-End Quality

All users can access acoustic data; legal compliance and contact/feedback are in place; quality ensured by E2E and audits.

### Story 5.1: TextAlternativeView (keyboard-navigable zone table)

As a user with a screen reader or keyboard-only navigation,
I want a complete text alternative to the map that lists IRIS zones and scores in a table,
So that I can access the same acoustic information without the map canvas (FR32, NFR-A4).

**Acceptance Criteria:**

**Given** the app has an accessible route (e.g. /accessible or linked from footer "Vue accessible")
**When** the user navigates to the text alternative view
**Then** a data table (or list) displays IRIS zones with at least: zone name/ID, arrondissement, Score Sérénité, tier
**And** the table is keyboard-navigable (Tab through rows/cells, Enter to select)
**And** selecting a zone (e.g. row) focuses the map on that zone and/or opens IrisPopup when returning to map (if implemented)
**Given** the map page has a skip or link to this view
**When** the user activates it (e.g. Alt+T or "Vue accessible" link)
**Then** the text alternative view is reachable and announced (e.g. aria-label, landmark)
**And** the view is first-class (same design tokens, not a hidden fallback)

### Story 5.2: Full keyboard navigation and focus management

As a keyboard user,
I want to reach every interactive element (search, map controls, layer toggles, zone panel, share, pin) in a logical tab order and operate them with Enter/Space/Escape,
So that I don't need a mouse or touch (FR33, NFR-A3).

**Acceptance Criteria:**

**Given** the user is on the map page
**When** they press Tab repeatedly
**Then** focus moves through: skip link (if any), SearchBar, map (or "focus map" control), AppNav buttons (layers, pins, settings), then into IrisPopup when open
**And** focus is visible (e.g. outline-2 outline-teal-500)
**When** IrisPopup is open
**Then** focus is trapped inside the panel until Escape or explicit close
**And** Escape closes the panel and returns focus to the trigger (dot or search)
**Given** layer toggles and buttons are focusable
**When** focused and activated with Enter or Space
**Then** the corresponding action runs (toggle layer, open tray, etc.)
**And** all icon-only buttons have aria-label

### Story 5.3: Legal notice, attributions, and privacy policy

As a user,
I want to open the legal notice, data attributions (Bruitparif ODbL, Open Data Paris Etalab), and privacy policy from any page,
So that I can verify compliance and data usage (FR34, NFR-PP3).

**Acceptance Criteria:**

**Given** the app has a footer (or global nav) on all main pages
**When** the user opens the footer links
**Then** a "Mentions légales" (or Legal notice) page/section is linked and contains: ODbL/Etalab attribution, Lden → Score methodology, disclaimer on indicativity
**And** a "Politique de confidentialité" (Privacy policy) is linked and states: data processed (e.g. Vercel logs only), retention (≤ 30 days), deletion request contact
**When** the user is on the legal or privacy page
**Then** content is readable and in French (lang="fr")
**And** links open in the same tab or clearly (no deceptive new tab)

### Story 5.4: Feedback and B2B contact forms

As a user or B2B prospect,
I want to send feedback about the product or express interest in data access via a form,
So that the team can respond without exposing personal data unnecessarily (FR35, FR36).

**Acceptance Criteria:**

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

### Story 5.5: RGPD compliance and zero third-party tracking

As a product owner,
I want the app to collect no personal data without consent and to load no third-party tracking scripts in V2,
So that we meet RGPD and user trust (FR37, NFR-PP1, NFR-S5).

**Acceptance Criteria:**

**Given** the production build is deployed
**When** any page is loaded
**Then** no third-party cookies or tracking scripts (e.g. GA4) are present in the page
**And** geocoding (Photon) requests are not logged by Tacet; addresses are not persisted server-side (NFR-PP2)
**Given** the privacy policy is linked from the footer
**When** the user reads it
**Then** it clearly states what data is processed (e.g. Vercel server logs), retention, and how to request deletion
**When** contact or feedback form is used
**Then** a privacy notice is shown at the point of submission and submission is HTTPS-only

### Story 5.6: E2E Playwright scenarios (geospatial and critical flows)

As a developer,
I want at least 10 E2E scenarios covering address search, zone selection, layer toggles, and offline behavior,
So that critical user journeys are regression-tested (TAC-37, NFR-M2).

**Acceptance Criteria:**

**Given** Playwright is configured for the project (e.g. e2e/playwright.config.ts)
**When** E2E tests run (e.g. against build or dev server)
**Then** the following are covered: address search and map flyTo; zone selection (tap/click) and IrisPopup open; at least one layer toggle (RUMEUR or Chantiers); offline mode (e.g. last zone available or offline banner)
**And** at least 10 distinct scenarios (or scenarios with multiple assertions) exist as per NFR-M2
**When** CI runs (e.g. GitHub Actions)
**Then** E2E job runs after build and fails the pipeline if any scenario fails
**Given** tests are stable (no flaky selectors)
**When** tests run repeatedly
**Then** they pass consistently or flakiness is documented and minimized

---

## Epic 6: Ambient Intelligence

Tacet moves from a map you consult to an environment that notices things for you. The goal is to surface the right signal at the right moment without asking the user to configure anything. Three interlocking principles govern this epic: **reading and anticipating needs** (time-of-day, behaviour, zone history), **session personalisation** (intent-inferred, no account required), and **feedback loop** (crowd micro-reports feed back into the experience).

**V3 foundation already shipped (2026-03-16, untracked):**
- Always-on contextual layers: RUMEUR and Chantiers always fetched and rendered; proximity shown in IrisPopup only when relevant (within 1km / 400m).
- Micro-report system (`useNoiseReports`): one-tap noise reporting, localStorage-backed, 1-hour window, 5-min cooldown.
- `selectedZoneLngLat` in MapContext: enables all proximity calculations.

**Implementation priority order (from vision doc):**
1. Story 6.1 (time-aware weighting) — zero new UI, immediate proof of ambient behaviour
2. Story 6.0 (zone enrichment agent) — solves information architecture problem; unblocks IrisPopup design sprint
3. IrisPopup design sprint — must precede any 6.x UI implementation (see `docs/planning/ambient-agentic-vision.md`)
4. Story 6.2 (intent layer) → 6.3 (proactive alternatives) → 6.4 (SW push) → 6.5 (route serenity)

**Agent instructions:** Before implementing any story in this epic, read `docs/planning/ambient-agentic-vision.md` in full.

---

### Story 6.0: Zone enrichment agent

As a user,
I want the zone popup to show a concise, contextually relevant 1–2 sentence summary of what this zone sounds like right now,
So that I understand its acoustic character instantly without having to parse multiple individual data points (FR41).

**Acceptance Criteria:**

**Given** a zone is selected and the enrichment feature flag is enabled (`NEXT_PUBLIC_ENABLE_ENRICHMENT=true`)
**When** the IrisPopup opens
**Then** IrisPopup renders immediately with the default Score/tier/signals view (no blocking)
**And** a `POST /api/enrich` call fires in parallel with body: `{ zone_code, zone_name, arrondissement, noise_level, day_level, night_level, score_serenite, current_iso_timestamp, intent?, rumeur_sensor?, nearby_chantiers?, recent_reports? }`
**When** the enrichment response arrives
**Then** IrisPopup updates to show `summary` (1–2 sentences, French, mobile-readable) below the score
**And** the `primary_signal` and optional `secondary_signal` fields determine which contextual blocks are rendered (not a fixed template)

**Given** the enrichment call returns `confidence: "low"` or fails or exceeds 1.5s timeout
**When** IrisPopup renders
**Then** it falls back to the default rendering — no regression, no empty placeholder

**Given** the same zone is requested within the same 15-minute bucket and same intent
**When** `/api/enrich` is called
**Then** the cached response is returned (cache key: `enrich-${zone_code}-${Math.floor(Date.now() / 900_000)}-${intent ?? 'none'}`)

**Given** the feature flag is off (`NEXT_PUBLIC_ENABLE_ENRICHMENT` unset or false)
**When** any zone is selected
**Then** IrisPopup renders identically to the pre-Epic-6 default — zero visible difference

**Technical constraints:**
- Claude API key in `ANTHROPIC_API_KEY` server-side env var — never client-side
- Model: `claude-haiku-4-5-20251001` — do not upgrade without explicit cost review
- System prompt: French, ≤ 150 tokens, calm and factual tone
- Response shape: `{ summary, primary_signal, secondary_signal?, confidence, cachedAt }`
- The enrichment call is always non-blocking — default UI must be pixel-identical to pre-Epic-6

**Dependencies:** `@anthropic-ai/sdk` npm package; `ANTHROPIC_API_KEY` env var; existing `/api/rumeur` and `/api/chantiers` data shapes; `useNoiseReports` for `recent_reports`

---

### Story 6.1: Time-aware signal weighting

As a user,
I want the zone popup to automatically show the most relevant acoustic information for the current time of day — night levels in the evening, day levels during the day —
So that I understand what this zone actually sounds like right now without configuring anything (FR40).

**Acceptance Criteria:**

**Given** a zone is selected and current hour is between 20:00 and 06:00 (inclusive)
**When** IrisPopup renders
**Then** `night_level` (Ln dB) is the primary dB value shown (replacing `day_level` as the default display)
**And** the label indicates night context (e.g. "Nuit · Ln")

**Given** current hour is between 06:00 and 20:00
**When** IrisPopup renders
**Then** `day_level` (Lden dB) is the primary dB shown (existing behaviour preserved)

**Given** a RUMEUR sensor reading is available and current hour ≥ 18:00
**When** the reading is displayed in IrisPopup
**Then** time context is shown alongside the reading (e.g. "maintenant" vs "ce matin")

**Given** a chantier has a `date_fin` in the past
**When** chantier context is displayed
**Then** that chantier is filtered out of the contextual display

**Technical constraints:**
- All time logic uses `new Date()` — never hardcode hour thresholds as magic numbers
- No user-facing toggle, no setting — time-awareness is silent and automatic
- Logic lives server-side in `/api/enrich` context payload AND client-side in IrisPopup display layer

**Dependencies:** Existing `day_level`, `night_level` in `IrisProperties`; existing RUMEUR `cachedAt` timestamp; chantier `date_fin` field

---

### Story 6.2: Intent layer

As a user,
I want to optionally tell the app what I'm looking for in a single tap — apartment hunting, a quiet spot right now, or just browsing —
So that the zone information I see is weighted toward what actually matters to me, without requiring an account (FR42).

**Acceptance Criteria:**

**Given** the user has selected their first zone in the session and has not previously set an intent
**When** IrisPopup opens for the first time
**Then** a one-tap intent prompt is shown below the score: "Je cherche…" with three options: **Un logement** / **Un endroit calme maintenant** / **À m'informer**
**And** the prompt is dismissable with a single tap on "×" or outside the prompt
**And** dismissing defaults to "À m'informer" (no behaviour change)

**Given** the user selects an intent
**When** subsequent zone popups open during the session
**Then** `intent` is passed to `/api/enrich` in the request body
**And** the IrisPopup surfaces the intent-appropriate signals (logement → day/night split + comparison tray; calme maintenant → live Rumeur + reports; informer → default experience)

**Given** an intent has been set
**When** the user views the zone popup footer
**Then** a small "Changer" link is visible that resets the intent prompt

**Technical constraints:**
- No backend, no account — intent stored in `localStorage` key `tacet_intent`
- Intent must degrade gracefully: if localStorage is unavailable, default experience is shown
- The prompt is shown at most once per session (sessionStorage flag prevents re-show after dismiss)
- Intent values: `"logement"` | `"calme_maintenant"` | `null` (informer/default)

**Dependencies:** IrisPopup; `localStorage` pattern from `useNoiseReports`; `/api/enrich` (Story 6.0)

---

### Story 6.3: Proactive quiet zone alternatives

As a user,
I want the app to proactively show me a quieter nearby zone when the one I've selected is noisy,
So that I can discover better options without having to explore the map manually (FR43).

**Acceptance Criteria:**

**Given** a zone is selected with Score Sérénité < 40
**And** at least one IRIS zone centroid exists within 500m with a Score ≥ 20 points higher
**When** IrisPopup renders
**Then** an inline suggestion is shown below the score: e.g. "Zone bruyante — quartier plus calme à 380m" with a tap-to-navigate CTA

**Given** the user taps the suggestion
**When** the action fires
**Then** the map flies to the suggested zone and its IrisPopup opens (same behaviour as zone selection from search)

**Given** no qualifying quieter zone exists within 500m OR the selected zone scores ≥ 40
**When** IrisPopup renders
**Then** no suggestion is shown — no empty state, no placeholder

**Technical constraints:**
- Distance computed from `selectedZoneLngLat` to IRIS centroids already loaded in memory — no new API call
- Score threshold (< 40) and distance threshold (500m) are constants, not configurable per session
- Suggestion is shown at most once per zone selection (not re-shown on each re-render)
- The suggestion must not displace the score or primary signal — it is a tertiary element

**Dependencies:** `iris-centroids.geojson` (already in memory); `selectedZoneLngLat` in MapContext; `MapContext.setSelectedZone` for tap-to-navigate

---

### Story 6.4: Service worker push for watched zones

As a user who has pinned zones I care about,
I want to receive a calm, opt-in notification when significant noise activity is detected in one of my pinned zones,
So that the app can proactively inform me without requiring me to re-open it (FR44).

**Acceptance Criteria:**

**Given** the user has pinned at least 2 zones (clear value moment established)
**When** the service worker is active
**Then** a notification permission request is shown with a calm, specific rationale (e.g. "Recevoir une alerte si du bruit est signalé dans vos zones épinglées")

**Given** permission is granted and a pinned zone accumulates ≥ 3 micro-reports in 1 hour
**When** the service worker detects the threshold (polled or event-driven)
**Then** a push notification is shown: e.g. "Bruit signalé dans votre zone épinglée — Marais"

**Given** a RUMEUR reading in a pinned zone exceeds 75 dB
**When** the threshold is crossed
**Then** a push notification is shown: e.g. "Niveau sonore élevé détecté — Oberkampf (76 dB)"

**Given** the user taps a notification
**When** the app opens (or is already open)
**Then** the map navigates to the relevant zone and its IrisPopup opens

**Given** the user denies the permission request
**When** the app is used subsequently
**Then** the permission request is never shown again; all other functionality is unaffected

**Technical constraints:**
- Permission request shown at most once (persisted in localStorage)
- Notification copy: calm and specific — never alarming (follows Tacet calm tone)
- Do not request permission before the 2-pin threshold — premature requests damage trust
- Service worker polling cadence must not increase upstream API calls beyond existing budgets

**Dependencies:** Serwist service worker (already configured and installed); `pinnedZones` in MapContext; `useNoiseReports` for report counts; existing `/api/rumeur` for dB readings

---

### Story 6.5: Route serenity (quiet path)

As a user,
I want to find the quietest walking route between two Paris addresses using acoustic zone scores,
So that I can choose a path that minimises noise exposure — the kind of routing Citymapper doesn't offer (FR45).

**Acceptance Criteria:**

**Given** the user activates "Itinéraire calme" (entry point: button in SearchBar or AppNav)
**When** the UI is shown
**Then** two address inputs are displayed (origin + destination), each using Photon geocoding (reusing existing hook)

**Given** origin and destination are set
**When** the user confirms
**Then** a routing algorithm traverses the IRIS zone adjacency graph, weighting each zone by its Score Sérénité
**And** the route that maximises average serenity score across traversed zones is selected
**And** the route is displayed on the MapLibre map as a line layer

**Given** the route is displayed
**When** the user views the map
**Then** the average serenity score for the route is shown (e.g. "Itinéraire calme — Score moyen 74")
**And** individual zone scores are visible on hover/tap of the route

**Given** no route can be found (disconnected zones, out-of-bounds addresses)
**When** the algorithm fails
**Then** a calm error message is shown and the map returns to normal state

**Technical constraints:**
- No external routing API — algorithm uses turf.js (not yet installed) + IRIS adjacency graph
- Adjacency graph is precomputed by a build-time script from `paris-noise-iris.geojson` and stored as a static JSON asset
- This is the most complex story in Epic 6 — **recommend breaking into sub-stories when creating the story file**: (a) adjacency graph generation script, (b) routing algorithm, (c) route display on map, (d) UI entry point
- turf.js must be added to dependencies (`npm install @turf/turf`)

**Dependencies:** `paris-noise-iris.geojson` (adjacency computation); `@turf/turf` (to be installed); Photon geocoding hook (already working); MapLibre line layer pattern (established in Epic 1)

---

## Epic 7: iOS Native App — React Native/Expo Migration

**Goal:** Migrate Tacet from the Next.js web app to a native iOS app using Expo SDK 53 + React Native. The Next.js API backend on Vercel is kept unchanged — the Expo app is a new frontend consumer. Each story is a deployable TestFlight build.

**Research foundation:** `_bmad-output/planning-artifacts/research/technical-maplibre-rn-pmtiles-expo-research-2026-03-20.md` — all stack choices are pre-validated.

**Architecture decision:** `tacet-mobile/` is a new standalone Expo project (not a monorepo) in the same repository root. It calls the existing Next.js API routes (`/api/rumeur`, `/api/chantiers`, `/api/enrich`) over HTTPS.

**Functional requirements:** FR1–FR45 (all existing) apply to the native app. Epic 6.2–6.5 stories are deferred — they will be re-designed as native-first features after Epic 7 ships.

**Epic completion criteria:** The iOS app reaches feature parity with the V2 web app (Epics 1–5) and is submitted to TestFlight.

---

### Story 7.1: Expo foundation — map rendering on device

As a developer,
I want a new `tacet-mobile/` Expo SDK 53 project with MapLibre RN v11 + NativeWind + PMTiles base map rendering on a physical iOS device,
So that the native app scaffold is established and the map tile stack is confirmed working end-to-end before any feature work begins.

**Acceptance Criteria:**

**Given** a fresh `tacet-mobile/` Expo SDK 53 project
**When** `eas build --profile development` completes and the dev client is installed on device
**Then** the app launches and a full-screen MapLibre map renders with the Protomaps PMTiles base map (Paris region) visible

**Given** the app is running
**When** the user pans and pinches
**Then** the map responds smoothly with native iOS gestures (no white tiles, no crashes)

**Given** the map renders
**When** the style JSON is inspected
**Then** the PMTiles source is defined via a style JSON object (not a raw `pmtiles://` URL string passed to MapView)

**Given** NativeWind v4 is installed
**When** a test component uses `className="bg-black text-white"`
**Then** the styles are correctly applied (confirms NativeWind babel/metro integration)

**Given** jest-expo is configured
**When** `npm test` is run in `tacet-mobile/`
**Then** at least one smoke test passes (confirms test harness works)

**Technical constraints:**
- Expo SDK: 53 (latest)
- MapLibre RN: v11 beta (full new-arch support) — if unstable, fallback to v10 stable with interop layer
- NativeWind: v4 (production-stable)
- Expo Router: v4 (default in SDK 53)
- PMTiles: use style JSON approach — embed `pmtiles://https://...` URL inside a style JSON object passed to `<MapView style={mapStyle}>`
- No feature code in this story — map scaffold only
- `app.json` must include MapLibre config plugin: `"@maplibre/maplibre-react-native"`
- Commit `tacet-mobile/` folder to the Tacet repo root (alongside `tacet/`)

**Dependencies:** None — this is the foundation story

---

### Story 7.2: IRIS GeoJSON layer and zone selection

As a user,
I want to see the IRIS acoustic noise zones overlaid on the map and tap a zone to see its serenity score,
So that the core acoustic data interaction works natively (FR1, FR3).

**Acceptance Criteria:**

**Given** the app launches
**When** `ensureGeoJSON()` runs on first launch
**Then** `paris-noise-iris.geojson` is downloaded from Vercel CDN and cached in `FileSystem.documentDirectory`; a loading skeleton is shown during download

**Given** the GeoJSON is cached locally
**When** subsequent app launches occur
**Then** the GeoJSON loads from the document directory without a network call

**Given** the GeoJSON is loaded
**When** the map renders
**Then** IRIS zone polygons are displayed as a fill layer using serenity score colour ramp (matching V2 web design)

**Given** a zone is visible on the map
**When** the user taps it
**Then** the zone is highlighted (boundary layer) and `selectedZoneCode` is set in the Zustand store

**Technical constraints:**
- Use `expo-file-system` (document directory, not cache dir — OS does not evict document dir)
- Serve GeoJSON with `Content-Encoding: gzip` from Vercel; `FileSystem.downloadAsync` handles decompression
- Zustand store with `react-native-mmkv` via `zustand-mmkv-storage` adapter (replaces localStorage)
- Zone colour ramp: same Score Sérénité thresholds as web (0–100 scale)

**Dependencies:** Story 7.1 (map foundation)

---

### Story 7.3: API integration — RUMEUR, Chantiers, enrichment (+ CORS config)

As a user,
I want to see live RUMEUR sensor readings, active construction sites, and the Claude Haiku zone summary in the native app,
So that all real-time data layers from the web app are available on iOS (FR12, FR19, FR26, FR37).

**Acceptance Criteria:**

**Given** the native app calls `/api/rumeur`, `/api/chantiers`, `/api/enrich`
**When** requests are made from a physical iOS device
**Then** all three routes return 200 responses (no CORS errors)

**Given** the `useRumeur`, `useChantiers`, and `useEnrichment` hooks are ported to `tacet-mobile/`
**When** a zone is selected
**Then** rumeur sensor data, nearby chantiers, and enrichment summary are fetched and available in component state

**Given** the device is offline
**When** API calls fail
**Then** stale state is shown with the existing stale indicator (no crash)

**Technical constraints:**
- Add CORS headers to `tacet/next.config.js` for `/api/*` paths (allows all origins in dev; tighten for prod)
- Handle OPTIONS preflight for POST `/api/enrich`
- Hook file names: `useRumeur.ts`, `useChantiers.ts`, `useEnrichment.ts` (same as web — direct port)
- `EXPO_PUBLIC_API_BASE_URL` env var: `https://tacet.vercel.app` (prod) / `http://[local-ip]:3000` (dev)
- `ANTHROPIC_API_KEY` stays server-side on Vercel — never in Expo bundle

**Dependencies:** Stories 7.1, 7.2; requires CORS changes to `tacet/` Next.js app

---

### Story 7.4: IrisPopup as native modal and zone detail UX

As a user,
I want the zone detail popup (IrisPopup) to open as a native iOS bottom sheet when I tap a zone,
So that the acoustic score, RUMEUR data, chantiers, and enrichment summary are all visible with native iOS interaction patterns.

**Acceptance Criteria:**

**Given** a zone is tapped on the map
**When** `selectedZoneCode` is set in Zustand
**Then** a native bottom sheet slides up from the bottom (Expo Router `presentation: "modal"` or `@gorhom/bottom-sheet`)

**Given** the bottom sheet is open
**When** the user views it
**Then** it displays: zone name, arrondissement, Score Sérénité (SerenityBar), day/night dB levels (time-aware, using `time-context.ts`), RUMEUR sensor data, active chantiers count, enrichment summary (if confidence === "high")

**Given** the user swipes down
**When** the gesture completes
**Then** the bottom sheet closes and the map returns to normal state

**Given** the SearchBar is tapped
**When** the user types an address
**Then** Photon geocoding suggestions appear and selecting one flies the map to that location

**Technical constraints:**
- Port `IrisPopup.tsx`, `SerenityBar.tsx`, `TierBadge.tsx`, `DataProvenance.tsx` to React Native components
- Port `time-context.ts` unchanged (pure utility, no web APIs)
- Geocoding: reuse existing `/api/geocode` proxy or call Photon directly
- NativeWind v4 for all styling (replace Tailwind CSS classes with equivalent `className` props)

**Dependencies:** Stories 7.1, 7.2, 7.3

---

### Story 7.5: Dark theme, offline indicator, TestFlight submission

As a user,
I want the iOS app to have the Tacet dark theme, show an offline banner when connectivity is lost, and be available on TestFlight for real-device testing,
So that the app is polished and distributable (FR — visual parity with V2 web).

**Acceptance Criteria:**

**Given** the app launches on any device
**When** the map and all UI elements render
**Then** the dark theme matches the V2 web design (dark background, amber accents, white text)

**Given** the device loses connectivity
**When** the app is in use
**Then** an `OfflineBanner` appears at the top of the screen (same copy as web: "Hors connexion — données mises en cache")

**Given** the app regains connectivity
**When** the banner is visible
**Then** the banner dismisses automatically

**Given** the app passes all jest-expo tests
**When** `eas build --platform ios --profile preview` completes
**Then** the build is distributed to TestFlight and installable on the developer's device

**Technical constraints:**
- NativeWind CSS variable theme tokens matching V2 web design system
- `@react-native-community/netinfo` for connectivity detection
- Lighthouse/performance budgets: not applicable to native; replace with Xcode Instruments check (startup time < 2s)
- App icon: reuse existing Tacet maskable icon assets

**Dependencies:** Stories 7.1–7.4; Apple Developer Program ($99/yr) required
