---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: '2026-03-19'
version: V3
inputDocuments:
  - distracted-feynman/_bmad-output/planning-artifacts/prd-v3.md
  - _bmad-output/planning-artifacts/architecture.md
  - youthful-dubinsky/_bmad-output/planning-artifacts/ux-design-specification.md
  - peaceful-merkle/_bmad-output/planning-artifacts/prd-v3-validation-report.md
  - distracted-feynman/docs/planning/ambient-agentic-vision.md
  - docs/planning/prd.md
---

# Tacet V3 — Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Tacet V3, decomposing the requirements from the PRD V3 (44 FRs, 34 NFRs), V2 Architecture, UX Design (V2 base + V3 ambient agentic extensions), and the Ambient Agentic Vision into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. Mobile App Foundation**
- FR-001: A user can install and run the Tacet mobile app on an iOS device via Expo Go by scanning a QR code
- FR-002: A user can install and run the Tacet mobile app on an iOS device via TestFlight
- FR-003: The system produces a production iOS app via EAS Build CI/CD without manual intervention
- FR-004: A user can navigate all core app screens using iOS VoiceOver

**2. Acoustic Map & Zone Intelligence**
- FR-005: A user can view an interactive map of Paris displaying all 992 IRIS zones with their Score Sérénité
- FR-006: A user can select an IRIS zone and view its acoustic profile (score, day/night levels, data source and vintage)
- FR-007: The system displays time-appropriate acoustic signals based on the current hour without user configuration
- FR-008: The system enriches a selected zone with a contextual narrative summary via `/api/enrich` when the enrichment feature flag is enabled
- FR-009: A user can set a session intent (logement / calme maintenant / s'informer) that shapes which signals are emphasised for the duration of the session
- FR-010: The system displays a proactive quieter zone alternative when the selected zone scores below Score 40 and a quieter alternative exists within 500m
- FR-011: A user can view the nearest live RUMEUR sensor reading in a zone popup when a sensor is within 1km
- FR-012: A user can view active construction zones relevant to a selected IRIS zone
- FR-013: The system falls back to static PPBE data and displays a data-status indicator when live RUMEUR data is unavailable

**3. Calm Route Planning**
- FR-014: A user can input an origin and destination address to request a calm pedestrian route
- FR-015: The system computes and displays a pedestrian route acoustically weighted by the Score Sérénité of IRIS zones traversed
- FR-016: A user can view the composite serenity score and estimated travel time for a computed route
- FR-017: The system proposes a mid-route detour when a live noise spike is detected along the active route
- FR-018: A user can share a computed calm route
- FR-019: A user can save a calm route for future reference

**4. Ambient Agent & Push Intelligence**
- FR-020: A user can opt in to ambient push notifications for saved or pinned zones
- FR-021: The system sends a push notification when a statistically significant acoustic change is detected in a user's pinned zone
- FR-022: The system generates push notification copy in French calibrated to the sentiment of the acoustic event (quiet window vs. noise spike vs. construction start)
- FR-023: A user can configure notification frequency and disable push notifications from within the app
- FR-024: A push notification deep-links the user directly to the relevant zone in the map

**5. Natural Language Query**
- FR-025: A user can submit a natural language query in French to find places or zones matching acoustic and contextual criteria
- FR-026: The system returns a ranked, mapped result set for a valid NLQ query within the acoustic dataset
- FR-027: Each NLQ result displays its acoustic score, distance from the query origin, and data source citation
- FR-028: The system displays a transparency disclosure on a user's first NLQ interaction indicating that AI is involved in result generation
- FR-029: The system falls back to structured search when an NLQ query returns no results

**6. B2B Reports & Billing**
- FR-030: A B2B user can create an account and authenticate with email and password
- FR-031: A B2B user can view an acoustic dashboard for a specified Paris address combining PPBE historical data and RUMEUR live readings
- FR-032: A B2B user can export a certified PDF acoustic report for a specified address
- FR-033: A certified PDF report includes data source attribution (Bruitparif, PPBE cycle, Etalab licence), methodology disclaimer, and generation timestamp
- FR-034: A B2B user can subscribe to a paid tier and manage their subscription via Stripe
- FR-035: The system restricts acoustic dashboard access and PDF export to authenticated B2B subscribers

**7. Data Compliance & Attribution**
- FR-036: The system displays ODbL/Etalab data attribution in all views presenting acoustic or routing data
- FR-037: The system presents a specific, honest rationale before requesting device location access
- FR-038: The system requests background location permission only when a user explicitly enables the ambient agent
- FR-039: The system requests push notification permission only after the user has completed a first value interaction (route completed or first NLQ result)
- FR-040: All acoustic data views include a methodology disclaimer noting data source, collection period, and limitations
- FR-041: A user can request deletion of their account and all associated personal data

**8. Developer Workflow**
- FR-042: A developer can load the latest app code on a physical iOS device via Expo Go in under 60 seconds from a cold start
- FR-043: The system hot-reloads UI changes on connected Expo Go devices without requiring a full rebuild
- FR-044: The CI/CD pipeline produces a TestFlight-ready build from a main branch push in under 15 minutes

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

**Performance (7)**
- NFR-P1: `/api/enrich` responds within 800ms server-side; IrisPopup falls back to default rendering if response exceeds 1,500ms
- NFR-P2: Calm route computation completes within 4 seconds for any A→B within Paris intra-muros
- NFR-P3: Web PWA Core Web Vitals: LCP < 2.0s on mobile 4G; INP < 100ms; CLS < 0.1
- NFR-P4: Web PWA initial JS bundle < 250 KB; PMTiles initial load < 1.5s
- NFR-P5: Lighthouse Performance ≥ 90; Lighthouse Accessibility ≥ 95 — enforced in CI
- NFR-P6: App loads on physical iOS device via Expo Go within 60s cold start; UI hot-reloads within 2s
- NFR-P7: NLQ query → structured spatial result → LLM formatting → map render total < 3 seconds

**Security (7)**
- NFR-S1: All API secrets remain server-side only — never bundled in RN app binary or client JS
- NFR-S2: B2B auth uses short-lived JWTs (< 1h expiry) with refresh token rotation
- NFR-S3: All Stripe webhook events validated via HMAC signature verification
- NFR-S4: B2B-gated Route Handlers enforce subscription status server-side on every request
- NFR-S5: Certified PDF reports generated server-side only
- NFR-S6: All user data transmitted via HTTPS/TLS; no plaintext storage of passwords or API keys at rest
- NFR-S7: NLQ queries referencing identifiable location data not persisted beyond session without explicit consent

**Reliability (4)**
- NFR-R1: Zone score display and static-data route planning must succeed when RUMEUR API is fully unavailable
- NFR-R2: `/api/enrich` failure must not block IrisPopup render — default template visible within 300ms
- NFR-R3: Scheduled ambient push jobs must be idempotent — no duplicate push notifications
- NFR-R4: EAS Update OTA deploys must not break offline-cached routes — backward-compatible JS updates only

**Scalability (3)**
- NFR-SC1: System sustains 10× user growth from MVP baseline without architectural change
- NFR-SC2: `/api/enrich` calls capped via 15-minute cache keyed on (zone_code, hour_bucket, intent) — cache hit rate ≥ 80%
- NFR-SC3: NLQ free tier rate-limited to 10 queries/day/user; B2B tiers exempt

**Accessibility (5)**
- NFR-A1: Web PWA meets RGAA 4.1 (superset of WCAG 2.1 AA)
- NFR-A2: iOS app: all navigation-critical screens fully navigable via VoiceOver
- NFR-A3: Score Sérénité colour scale achieves contrast ratio ≥ 4.5:1
- NFR-A4: All push notification body copy is intelligible without visual context
- NFR-A5: Lighthouse Accessibility ≥ 95 enforced in CI; blocks merge

**Integration Reliability (4)**
- NFR-I1: RUMEUR API degradation triggers static PPBE fallback and status indicator within 5 seconds
- NFR-I2: Expo Push / APNs delivery includes retry logic; push cadence cap of 1 push/day/user
- NFR-I3: EAS Build CI/CD produces signed TestFlight-ready IPA within 15 minutes
- NFR-I4: App Store submission requires Privacy manifest + Info.plist location usage strings reviewed

**Compliance (5)**
- NFR-C1: ODbL/Etalab attribution component non-removable in all data views and PDF templates
- NFR-C2: RGPD data deletion requests processed within 30 days
- NFR-C3: EU AI Act Art. 52 transparency disclosure shown on first NLQ session per device
- NFR-C4: No IDFA usage anywhere in the RN app
- NFR-C5: B2B certified PDF reports include disclaimer in non-removable footer

### Additional Requirements

**From Architecture (V2 — foundational, still applicable to web PWA):**
- Migration-in-place from V1 brownfield (no fresh starter — preserve existing production code)
- MapLibre GL JS direct integration (no react-map-gl wrapper), dynamic import, ref-based
- PMTiles on Vercel Blob CDN for base map tiles; PPBE GeoJSON precached by Serwist
- RUMEUR proxy via Next.js Route Handler with 3-min server-side cache
- Client state: SWR for server data + React Context for UI state (no Zustand/Redux)
- Serwist offline caching: precache (shell, fonts, GeoJSON), runtime cache (tiles SWR 7d, RUMEUR network-first 3min, Photon cache-first 24h)
- HTTP security headers: CSP, X-Frame-Options DENY, nosniff, strict Referrer-Policy
- $0 variable infrastructure cost enforced on all dependency decisions
- Feature flags via env vars (NEXT_PUBLIC_ENABLE_RUMEUR, NEXT_PUBLIC_ENABLE_ENRICHMENT)
- 3-tier component organization: ui/ (shadcn), tacet/ (domain), map/ (MapLibre layers)

**From PRD V3 — New Architecture Requirements:**
- React Native / Expo (Expo Go → TestFlight → EAS Build) for iOS mobile app
- `/api/enrich` Route Handler: Claude Haiku integration for zone narrative summaries, 15-min cache
- OSRM or GraphHopper for pedestrian routing with acoustic weighting via custom cost function
- Expo Push Service + APNs for push notification delivery
- Stripe integration for B2B subscription billing and webhook events
- B2B auth: email + password, short-lived JWTs with refresh rotation
- Server-side certified PDF generation (no client-side PDF construction)
- Privacy manifest (PrivacyInfo.xcprivacy) for iOS App Store compliance
- EU AI Act Art. 52 transparency disclosure for NLQ/ambient agent

**From UX Design (V2 base + V3 ambient agentic extensions):**
- L1/L2/L3 visibility model for IrisPopup (answer / context / depth)
- Polymorphic bottom sheet: single container accepting IrisPopup, Route summary, NLQ results
- SearchBar with `onInputClassified(intent, payload)` callback architecture (V2: address only → V3: route/NLQ)
- Intent classification pipeline: regex client-side (V3) → LLM fallback (V4)
- Score Dots at zone centroids with clustering at low zoom levels
- PWA install prompt deferred to after first zone tap (first value interaction)
- Zone pin system: up to 3 zones, sessionStorage-backed, mini-tray in AppNav
- Expert mode toggle: label tier for casual users / precise dB for power users
- Share card design optimized for WhatsApp screenshot legibility
- Glass morphism treatment for overlays (IrisPopup, SearchBar, AppNav)
- 5-tier Score Sérénité labels: Très calme / Calme / Modéré / Bruyant / Très bruyant
- `contextHints` prop on all V2 components (accepted but ignored until V3 activation)
- `prefers-reduced-motion` respected for map animations

**From Ambient Agentic Vision (Epic 6 — V3 core differentiators):**
- Story 6.0: Zone enrichment agent (POST /api/enrich, Claude Haiku, signal prioritization)
- Story 6.1: Time-aware signal weighting (night_level primary 20:00–06:00, automatic)
- Story 6.2: Intent layer (one-tap "Je cherche..." → logement / calme maintenant / s'informer)
- Story 6.3: Proactive zone alternatives (Score < 40 → suggest quieter zone within 500m)
- Story 6.4: Service worker push for watched zones (opt-in, calm tone, deep link)
- Story 6.5: Route serenity / quiet path (IRIS adjacency graph, acoustic-weighted routing)

### Success Criteria Traceability

#### User Success Criteria

| Criterion | Target | Enabling Epic(s) | Key Stories | NFRs |
|---|---|---|---|---|
| Calm route planning from app open | < 30 seconds | Epic 1, Epic 3 | 1.1 (Expo Go), 3.1 (route input), 3.2 (route computation) | NFR-P2 (< 4s computation), NFR-P6 (< 60s cold start) |
| NLQ ranked result set | < 3 seconds | Epic 5 | 5.1 (NLQ input), 5.2 (ranked results) | NFR-P7 (< 3s total pipeline) |
| Ambient push notification retention | ≥ 40% retention rate | Epic 4 | 4.1 (opt-in), 4.2 (change detection + French copy), 4.3 (frequency config) | NFR-I2 (1 push/day cap), NFR-A4 (screen-reader copy) |
| B2B certified report export | < 2 minutes from login | Epic 6 | 6.1 (auth), 6.2 (dashboard), 6.3 (PDF export) | NFR-S5 (server-side PDF) |
| Expo Go scan-to-run | < 60 seconds cold | Epic 1 | 1.1 (Expo scaffold + QR) | NFR-P6 |

#### Business Success Criteria

| Criterion | Target | Enabling Epic(s) | Key Stories |
|---|---|---|---|
| V3 launch (soft) | Expo Go shareable with 5 beta testers; calm route on ≥ 3 corridors | Epic 1, Epic 3 | 1.1 (Expo Go), 1.3 (TestFlight), 3.2 (route computation) |
| App Store submission | iOS live; Lighthouse ≥ 90; App Store rating ≥ 4.2 | Epic 1, Epic 7 | 1.3 (EAS Build), 1.5 (privacy manifest), 7.1 (attribution) |
| 6 months: 10k MAU | 10,000 MAU iOS + web | Epic 2, Epic 3 | 2.1 (map), 2.2 (search + auto-reveal), 2.4 (enrichment agent), 3.2 (calm routes) |
| 6 months: B2B revenue | ≥ 1 B2B paying customer (€50+/mo) | Epic 6 | 6.1 (auth), 6.3 (PDF), 6.4 (Stripe) |
| 6 months: press coverage | ≥ 3 press citations | Epic 2, Epic 3 | 2.4 (enrichment — differentiator), 3.2 (calm routes — newsworthy feature) |
| 12 months: MAU scale | 50,000 MAU Paris | All B2C epics | All map + route + NLQ stories |
| 12 months: B2B MRR | ≥ €500 MRR | Epic 6 | 6.4 (Stripe subscriptions) |
| 12 months: election coverage | Mention in Paris 2026 election campaign | Epic 2 | 2.1 (map — reference tool for noise data) |

#### Technical Success Criteria

| Criterion | Target | Enabling Epic(s) | Key Stories | NFRs |
|---|---|---|---|---|
| RN app cold start | < 2s on iPhone 12 | Epic 1 | 1.1 (Expo scaffold), 1.2 (MapLibre RN) | NFR-P6 |
| Calm route computation | < 4s (A→B Paris) | Epic 3 | 3.2 (acoustic-weighted route) | NFR-P2 |
| NLQ round-trip | < 3s on 4G | Epic 5 | 5.2 (NLQ processing) | NFR-P7 |
| Ambient push delivery latency | < 5 min from trigger | Epic 4 | 4.2 (change detection + delivery) | NFR-I2 |
| EAS Build → TestFlight | < 15 minutes | Epic 1 | 1.3 (EAS Build CI/CD) | NFR-I3 |
| Shared codebase reuse | ≥ 70% business logic | Epic 1, Epic 2 | 1.1 (shared types), 1.2 (shared data pipeline) | — |
| B2B PDF export generation | < 10s server-side | Epic 6 | 6.3 (certified PDF) | NFR-S5 |
| App Store first submission | Zero rejection (privacy/permissions) | Epic 1, Epic 7 | 1.5 (privacy manifest), 7.2 (permission rationale) | NFR-I4, NFR-C4 |

#### Measurable Outcomes

| Metric | V3 Target | Enabling Epic(s) | Key Stories | NFRs |
|---|---|---|---|---|
| Lighthouse Performance (web) | ≥ 90 | Epic 2 | 2.1 (map optimization) | NFR-P5 |
| Lighthouse Accessibility (web) | ≥ 95 | Epic 2, Epic 7 | 2.1 (ARIA), 7.1 (attribution) | NFR-A1, NFR-A5 |
| LCP mobile | < 2.0s | Epic 2 | 2.1 (map load) | NFR-P3 |
| Bundle JS initial (web) | < 250 KB | Epic 2 | 2.1 (dynamic import) | NFR-P4 |
| PWA Install Rate | ≥ 15% | Epic 2 | 2.2 (search → score → value moment) | — |
| App Store Rating | ≥ 4.2 | All epics | All user-facing stories | — |
| Score Sérénité accuracy vs PPBE | ≥ 95% | Epic 2 | 2.1 (score computation) | — |
| NLQ query success rate | ≥ 90% | Epic 5 | 5.2 (ranked results), 5.3 (fallback) | NFR-P7 |
| Ambient agent false positive rate | < 20% | Epic 4 | 4.2 (change detection logic) | NFR-R3 |
| B2B report export success rate | ≥ 99% | Epic 6 | 6.3 (PDF generation) | NFR-S5 |
| Organic share rate | ≥ 12% | Epic 2, Epic 3 | 2.1 (share card), 3.4 (share route) | — |

### FR Coverage Map

FR-001: Epic 1 — Install via Expo Go (QR code)
FR-002: Epic 1 — Install via TestFlight
FR-003: Epic 1 — EAS Build CI/CD (production iOS)
FR-004: Epic 1 — iOS VoiceOver navigation
FR-005: Epic 2 — Interactive map 992 IRIS zones with Score Sérénité
FR-006: Epic 2 — Zone acoustic profile (score, day/night, vintage)
FR-007: Epic 2 — Time-appropriate signals (automatic, no config)
FR-008: Epic 2 — Zone enrichment agent (/api/enrich, Claude Haiku)
FR-009: Epic 2 — Session intent (logement / calme maintenant / s'informer)
FR-010: Epic 2 — Proactive quieter zone alternative (Score < 40, within 500m)
FR-011: Epic 2 — Nearest RUMEUR sensor reading (within 1km)
FR-012: Epic 2 — Active construction zones in zone popup
FR-013: Epic 2 — PPBE fallback when RUMEUR unavailable
FR-014: Epic 3 — Route origin + destination input
FR-015: Epic 3 — Acoustic-weighted pedestrian route computation
FR-016: Epic 3 — Composite serenity score + travel time for route
FR-017: Epic 3 — Mid-route detour on live noise spike
FR-018: Epic 3 — Share calm route
FR-019: Epic 3 — Save calm route for future reference
FR-020: Epic 4 — Opt-in ambient push notifications for pinned zones
FR-021: Epic 4 — Push on statistically significant acoustic change
FR-022: Epic 4 — French push copy calibrated to acoustic sentiment
FR-023: Epic 4 — Configure notification frequency + disable
FR-024: Epic 4 — Push deep-links to relevant zone
FR-025: Epic 5 — NLQ input in French
FR-026: Epic 5 — Ranked mapped result set
FR-027: Epic 5 — Score + distance + data citation per result
FR-028: Epic 5 — AI transparency disclosure (EU AI Act Art. 52)
FR-029: Epic 5 — Fallback to structured search
FR-030: Epic 6 — B2B account creation + email/password auth
FR-031: Epic 6 — Acoustic dashboard (PPBE + RUMEUR)
FR-032: Epic 6 — Certified PDF acoustic report export
FR-033: Epic 6 — PDF attribution + disclaimer + timestamp
FR-034: Epic 6 — Stripe subscription management
FR-035: Epic 6 — Gated access to dashboard + PDF
FR-036: Epic 7 — ODbL/Etalab attribution in all data views
FR-037: Epic 7 — Honest location permission rationale
FR-038: Epic 7 — Background location only for ambient agent
FR-039: Epic 7 — Push permission after first value interaction
FR-040: Epic 7 — Methodology disclaimer in all data views
FR-041: Epic 7 — Account + data deletion (RGPD)
FR-042: Epic 1 — Expo Go cold start < 60s
FR-043: Epic 1 — Hot reload on Expo Go devices
FR-044: Epic 1 — TestFlight build < 15min from main push

## Epic List

### Epic 1: Mobile Foundation & Developer Experience
Users can install Tacet on iOS via Expo Go or TestFlight, navigate all screens with VoiceOver, and developers can build/deploy efficiently with hot reload and CI/CD.
**FRs covered:** FR-001, FR-002, FR-003, FR-004, FR-042, FR-043, FR-044

### Epic 2: Acoustic Map & Zone Intelligence
Users can explore the Paris map, view Score Sérénité for any zone, get AI-enriched contextual narratives, set session intent, see proactive quieter alternatives, live RUMEUR sensors, and construction sites — with graceful fallback when data is unavailable.
**FRs covered:** FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013

### Epic 3: Calm Route Planning
Users can plan acoustically-weighted pedestrian routes between two Paris addresses, see composite serenity scores and travel time, receive mid-route detour suggestions on noise spikes, and share or save routes.
**FRs covered:** FR-014, FR-015, FR-016, FR-017, FR-018, FR-019

### Epic 4: Ambient Push Agent
Users can opt in to push notifications for pinned zones, receive French-language alerts when acoustic conditions change significantly, configure frequency, and deep-link back to the relevant zone.
**FRs covered:** FR-020, FR-021, FR-022, FR-023, FR-024

### Epic 5: Natural Language Query
Users can ask acoustic questions in French, get ranked mapped results with scores and data citations, see AI transparency disclosure, with fallback to structured search.
**FRs covered:** FR-025, FR-026, FR-027, FR-028, FR-029
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

### Epic 6: B2B Reports & Billing
B2B users can create accounts, view acoustic dashboards combining PPBE + RUMEUR for any address, export certified PDF reports with full attribution and disclaimers, subscribe via Stripe, with access gated to paid tiers.
**FRs covered:** FR-030, FR-031, FR-032, FR-033, FR-034, FR-035

### Epic 7: Compliance, Permissions & Data Rights
All users benefit from transparent data attribution (ODbL/Etalab), honest permission rationale (location, background, push — each at the right moment), methodology disclaimers, and data deletion rights.
**FRs covered:** FR-036, FR-037, FR-038, FR-039, FR-040, FR-041

---

## Epic 1: Mobile Foundation & Developer Experience

Users can install Tacet on iOS via Expo Go or TestFlight, navigate all screens with VoiceOver, and developers can build/deploy efficiently with hot reload and CI/CD.

### Story 1.1: Expo project initialization and shared navigation shell

As a developer,
I want to scaffold a React Native / Expo project with tab navigation, shared screen structure, and Expo Go development workflow,
So that I can run Tacet on a physical iOS device and iterate rapidly with hot reload.

**Acceptance Criteria:**

**Given** the Tacet monorepo (or workspace) exists with the Next.js web app
**When** the Expo project is initialized (e.g. `npx create-expo-app` or manual scaffold)
**Then** the project structure includes: app entry, tab navigator (Map, Search, Settings), shared type definitions
**And** `npx expo start` launches the dev server and generates a QR code

**Given** a physical iOS device with Expo Go installed
**When** the developer scans the QR code
**Then** the app loads on the device within 60 seconds from cold start (NFR-P6, FR-001)
**And** the developer sees the navigation shell with placeholder screens
### Epic 6: Ambient Intelligence
Tacet moves from a map you consult to an environment that notices things for you — contextual signals surface automatically, an AI agent synthesises zone context, intent-based personalisation shapes what's shown, and the most advanced users can find the quietest walking route between two addresses.
**FRs covered:** FR38, FR39, FR40, FR41, FR42, FR43, FR44, FR45

---

**Given** the developer modifies a UI file (e.g. a screen component)
**When** the file is saved
**Then** Expo Go hot-reloads the change on the connected device within 2 seconds without full rebuild (FR-043, NFR-P6)

**Given** API secrets exist (ANTHROPIC_API_KEY, BRUITPARIF_API_KEY)
**When** the RN app is built or bundled
**Then** no server-side secrets are included in the client bundle (NFR-S1)

### Story 1.2: MapLibre integration in React Native

As a user,
I want to view the Paris acoustic map inside the Tacet iOS app with the same Score Sérénité data as the web PWA,
So that I can browse neighborhoods on my phone natively.

**Acceptance Criteria:**

**Given** the RN app has a Map tab
**When** the Map screen loads
**Then** a MapLibre GL Native (or @maplibre/maplibre-react-native) map renders centered on Paris with the same default zoom as the web app
**And** the IRIS GeoJSON data (992 zones) loads and displays Score Dots (colored circles at zone centroids) matching the web's tier color scheme

**Given** the map is displayed
**When** the user pans and zooms
**Then** map interactions are smooth and responsive on a physical iOS device
**And** Score Dots cluster at low zoom levels and expand at neighborhood zoom (≥ 13)

**Given** the user taps a Score Dot or IRIS zone
**When** the tap is registered
**Then** the zone is selected (highlighted boundary) and a zone popup (bottom sheet) opens automatically showing the Score Sérénité, tier label, and zone name

**Given** the base map tiles are configured
**When** the map renders
**Then** PMTiles protocol is used (or equivalent tile source) with no variable API cost ($0 infra constraint)

### Story 1.3: TestFlight distribution via EAS Build CI/CD

As a developer,
I want the CI/CD pipeline to produce a signed iOS app and push it to TestFlight automatically on main branch merge,
So that testers can install the latest build without manual intervention (FR-002, FR-003, FR-044).

**Acceptance Criteria:**

**Given** the repository has an EAS Build configuration (eas.json) with an iOS production profile
**When** a commit is pushed to the main branch
**Then** a GitHub Actions workflow (or EAS Build trigger) starts an iOS build
**And** the build produces a signed IPA within 15 minutes (NFR-I3)

**Given** the EAS Build completes successfully
**When** the IPA is produced
**Then** it is automatically submitted to TestFlight (via EAS Submit or equivalent)
**And** testers with TestFlight access can install the new build (FR-002)

**Given** the build fails
**When** the failure is detected
**Then** an alert is sent to IVAN (e.g. GitHub Actions notification, email, or Slack)
**And** the failure reason is visible in the build logs

**Given** the EAS Build configuration
**When** the production profile is used
**Then** the app signing uses the correct Apple Developer certificates and provisioning profiles
**And** no manual intervention is required for the build-to-TestFlight pipeline (FR-003)

### Story 1.4: VoiceOver accessibility for core screens

As a user with a visual impairment,
I want to navigate all core app screens (map, zone popup, search, settings) using iOS VoiceOver,
So that I can access acoustic data without relying on visual presentation (FR-004, NFR-A2).

**Acceptance Criteria:**

**Given** VoiceOver is enabled on an iOS device
**When** the user opens the Tacet app
**Then** the tab navigator is announced with descriptive labels (e.g. "Carte, onglet 1 sur 3")
**And** each tab is reachable by swiping left/right

**Given** the Map screen is active with VoiceOver
**When** the user navigates
**Then** key map controls (zoom in, zoom out, current location) are focusable and announced
**And** a "Vue accessible" or equivalent action is available to access zone data as a list (linking to the web TextAlternativeView or a native equivalent)

**Given** a zone popup (bottom sheet) is open
**When** VoiceOver reads the content
**Then** the Score Sérénité, tier label, zone name, and data vintage are announced in logical order
**And** interactive elements (share, pin, close) have accessibility labels

**Given** the Search screen is active
**When** the user interacts with the search field
**Then** autocomplete suggestions are announced as they appear
**And** selecting a suggestion is possible via VoiceOver gestures

**Given** the Settings screen exists
**When** VoiceOver navigates
**Then** all toggles, buttons, and informational text are accessible with labels and traits

### Story 1.5: Privacy manifest and App Store compliance

As a product owner,
I want the iOS app to include a complete Privacy manifest and correct Info.plist strings so that it passes App Store review,
So that we meet Apple's compliance requirements before submission (NFR-I4, NFR-C4).

**Acceptance Criteria:**

**Given** the Expo/EAS project configuration
**When** the iOS build is produced
**Then** a `PrivacyInfo.xcprivacy` file is included declaring all API usage categories (network, location if used, no IDFA)

**Given** the app may request location access (for future ambient agent)
**When** Info.plist is configured
**Then** `NSLocationWhenInUseUsageDescription` contains a specific, honest rationale in French (e.g. "Pour afficher les zones calmes autour de vous")
**And** no `NSLocationAlwaysUsageDescription` is set until ambient agent is implemented (Epic 4)

**Given** the app is scanned for IDFA usage
**When** the build is analyzed (e.g. by Apple's automated check or manual grep)
**Then** zero references to IDFA / AdSupport / ATTrackingManager exist in the binary (NFR-C4)

**Given** the pre-submission checklist
**When** reviewed
**Then** all items pass: Privacy manifest complete, Info.plist strings reviewed, no IDFA, TestFlight beta review completed before App Store submission

---

**Epic 1 Summary:** 5 stories, covering FR-001, FR-002, FR-003, FR-004, FR-042, FR-043, FR-044 + NFR-P6, NFR-A2, NFR-I3, NFR-I4, NFR-C4, NFR-S1.

---

## Epic 2: Acoustic Map & Zone Intelligence

Users can explore the Paris map, view Score Sérénité for any zone, get AI-enriched contextual narratives, set session intent, see proactive quieter alternatives, live RUMEUR sensors, and construction sites — with graceful fallback when data is unavailable.

### Story 2.1: Interactive map with Score Sérénité and zone selection

As a user,
I want to view an interactive map of Paris displaying all 992 IRIS zones with their Score Sérénité, select a zone by tapping, and see its acoustic profile,
So that I can explore neighborhoods and find calm areas at a glance (FR-005, FR-006).

**Acceptance Criteria:**

**Given** the user opens the map (web PWA or mobile app)
**When** the map loads
**Then** all 992 IRIS zones are displayed with Score Dots colored by the 5-tier system (Très calme #34D399, Calme #6EE7B7, Modéré #FCD34D, Bruyant #FCA5A5, Très bruyant #D8B4FE)
**And** the map centers on Paris at a default zoom showing the city overview

**Given** the map is displayed
**When** the user taps or clicks a Score Dot or IRIS zone
**Then** the zone boundary is highlighted (dashed outline, light fill)
**And** a zone popup (IrisPopup / bottom sheet) opens automatically (slide-up 300ms, no second tap required)
**And** the popup displays: Score Sérénité (0–100, large, tier-colored), tier label, zone name, arrondissement

**Given** the IrisPopup is open
**When** the user views the L1 (answer) layer
**Then** the acoustic profile shows: Score, day level, night level, data source ("Bruitparif · PPBE"), data vintage year
**And** a character note is shown in italic when available (FR-006)

**Given** the user taps outside the popup or presses close
**When** the action is triggered
**Then** the popup dismisses and the zone highlight clears

### Story 2.2: Address search with Photon geocoding and auto-reveal

As a user,
I want to search for a Paris address and have the map fly to the corresponding zone with the popup opening automatically,
So that I find the Score for any address in one gesture (FR-005 context, UX core loop).

**Acceptance Criteria:**

**Given** the SearchBar is visible at the top of the map
**When** the user types at least 2 characters
**Then** after 350ms debounce, autocomplete suggestions appear from Photon Komoot (Paris-bounded, no API key)
**And** up to 5 suggestions show street + arrondissement or landmark name

**Given** the user selects a suggestion
**When** the selection is made
**Then** the map flies to the coordinates (~1200ms flyTo)
**And** the IRIS zone containing that point is resolved and selected
**And** the IrisPopup opens automatically — zero extra taps from suggestion to Score

**Given** the SearchBar supports intent classification architecture (V3-ready)
**When** the input is classified
**Then** `onInputClassified` returns `{ intent: 'address', payload: ... }` (V3: route/NLQ intents will extend this)

**Given** the user clears the search
**When** the clear action is triggered
**Then** the map returns to default view, selection is cleared, and popup closes

### Story 2.3: Time-aware signal weighting

As a user,
I want the app to automatically emphasize night noise levels in the evening and contextualise RUMEUR and Chantier signals by time of day,
So that I see the most relevant acoustic data without configuring anything (FR-007).

**Acceptance Criteria:**

**Given** the current hour is between 20:00–06:00
**When** the user views a zone's acoustic profile in the IrisPopup
**Then** `night_level` is the primary dB value shown (replacing day_level as default)
**And** if RUMEUR data is available, it is labeled with time context (e.g. "en ce moment" vs "ce matin")

**Given** the current hour is between 06:00–20:00
**When** the user views a zone
**Then** `day_level` is the primary dB value shown

**Given** a chantier has a `date_fin` in the past
**When** the chantier data is processed for display
**Then** that chantier is filtered out of the contextual display (not shown as active)

**Given** the system uses `new Date()` for time detection
**When** the app is running
**Then** no user configuration, toggle, or setting is required — time-awareness is automatic

### Story 2.4: Zone enrichment agent (/api/enrich)

As a user,
I want the zone popup to include a 1–2 sentence AI-generated contextual narrative that synthesizes all available signals for my zone,
So that I get a clear, human-readable summary instead of interpreting raw data myself (FR-008).

**Acceptance Criteria:**

**Given** the enrichment feature flag is enabled (`NEXT_PUBLIC_ENABLE_ENRICHMENT=true`)
**When** the user selects a zone and the IrisPopup opens
**Then** a `POST /api/enrich` call fires in parallel with RUMEUR/Chantier fetches
**And** the request body includes: zone_code, zone_name, arrondissement, noise_level, day_level, night_level, score_serenite, current_iso_timestamp, intent (if set), rumeur_sensor (if available), nearby_chantiers (if any), recent_reports (if any)

**Given** the `/api/enrich` Route Handler receives the request
**When** it processes the call
**Then** it calls Claude Haiku (`claude-haiku-4-5-20251001`) server-side with a French system prompt (< 150 tokens)
**And** returns `{ summary, primary_signal, secondary_signal?, confidence, cachedAt }`
**And** the response is cached by `(zone_code, hour_bucket_15min, intent)` — same zone at the same hour returns cached summary

**Given** the enrichment response arrives within 800ms (NFR-P1)
**When** the IrisPopup is displayed
**Then** the `summary` is rendered below the Score in the L1 layer
**And** `primary_signal` and `secondary_signal` determine which contextual blocks are shown

**Given** the enrichment call fails, exceeds 1,500ms, or returns `confidence: "low"`
**When** the IrisPopup renders
**Then** the default template is shown (current V2 rendering) — no regression, no blocking (NFR-R2)

**Given** the feature flag is disabled (`NEXT_PUBLIC_ENABLE_ENRICHMENT=false`)
**When** the user selects a zone
**Then** no `/api/enrich` call is made; IrisPopup renders the default template

**Given** the API key `ANTHROPIC_API_KEY`
**When** the enrichment call is made
**Then** the key is used server-side only — never exposed in client bundle or response (NFR-S1)

### Story 2.5: Session intent layer

As a user,
I want to optionally indicate my intent ("Je cherche un logement" / "un endroit calme maintenant" / "à m'informer") with one tap,
So that the app emphasizes the most relevant signals for my session (FR-009).

**Acceptance Criteria:**

**Given** the user has selected their first zone in the session
**When** the IrisPopup opens for the first time
**Then** a lightweight intent prompt is shown: "Je cherche..." with three options: **Un logement** / **Un endroit calme maintenant** / **À m'informer**
**And** the prompt is dismissable (defaults to "À m'informer")

**Given** the user selects "Un logement"
**When** the session continues
**Then** day/night split is emphasized in zone views, comparison tray is surfaced early, and "quieter zones nearby" are shown when relevant
**And** the intent is passed to `/api/enrich` as `intent: "logement"`

**Given** the user selects "Un endroit calme maintenant"
**When** the session continues
**Then** live RUMEUR reading dominates, micro-report count is shown, and time-of-day context is foregrounded
**And** the intent is passed to `/api/enrich` as `intent: "calme_maintenant"`

**Given** the user selects "À m'informer" or dismisses
**When** the session continues
**Then** the default experience is shown — scores and sources, no additional weighting

**Given** the intent is set
**When** stored
**Then** it persists in localStorage for the session
**And** a small reset link is available in the zone popup footer to change intent

### Story 2.6: Proactive quieter zone alternative

As a user,
I want the app to proactively suggest a quieter nearby zone when I'm looking at a noisy area,
So that I discover better alternatives without searching manually (FR-010).

**Acceptance Criteria:**

**Given** the user selects a zone with Score Sérénité < 40
**When** a quieter zone exists within 500m (computed from IRIS centroid data)
**Then** a suggestion is shown inline in the IrisPopup below the score: "Zone plus calme à [X]m" with the alternative's score and name

**Given** the suggestion is displayed
**When** the user taps the suggestion
**Then** the map navigates to the alternative zone and opens its IrisPopup

**Given** the user selects a zone with Score Sérénité ≥ 40
**When** the IrisPopup opens
**Then** no alternative suggestion is shown

**Given** the user selects a zone with Score < 40
**When** no quieter zone exists within 500m
**Then** no suggestion is shown (silence is better than a useless suggestion)

### Story 2.7: RUMEUR live sensor reading in zone popup

As a user,
I want to see the nearest live RUMEUR sensor reading inside the zone popup when a sensor is within 1km,
So that I know the current noise level near this zone in real time (FR-011).

**Acceptance Criteria:**

**Given** the RUMEUR data is available and the user selects a zone
**When** a RUMEUR sensor exists within 1km of the selected zone's tap coordinates
**Then** the nearest sensor's current dB reading and distance are shown in the IrisPopup (e.g. "Capteur à 350m — 54 dB en ce moment")

**Given** no RUMEUR sensor exists within 1km
**When** the IrisPopup opens
**Then** no RUMEUR reading is shown (no empty placeholder)

**Given** the RUMEUR data is available
**When** displayed in the popup
**Then** the reading includes the last-update timestamp (e.g. "il y a 2 min")

### Story 2.8: Construction sites in zone popup and PPBE fallback

As a user,
I want to see active construction sites relevant to my zone and understand that the static Score may not reflect them; and I want the app to work gracefully when live data is unavailable,
So that I factor temporary noise into my decision and always have access to baseline data (FR-012, FR-013).

**Acceptance Criteria:**

**Given** the Chantiers data is available and the user selects a zone
**When** active construction sites exist within a relevant radius (e.g. 400m)
**Then** the count and nearest chantier details (distance, expected end date) are shown in the IrisPopup

**Given** chantiers are displayed alongside the Score
**When** the user views the popup
**Then** a calm disclosure is visible: "Le Score annuel ne reflète pas les chantiers en cours" (FR-012)

**Given** RUMEUR API is unavailable or returns an error
**When** the user selects a zone
**Then** the app falls back to static PPBE data — Score Sérénité and zone profile display normally
**And** a data-status indicator is shown: "Données temps réel indisponibles — Score basé sur données annuelles" (FR-013)
**And** the app does not crash or become unusable (NFR-R1, NFR-I1)

**Given** the Chantiers API is unavailable
**When** the user selects a zone
**Then** the chantiers section is silently omitted with an informative note; rest of popup unaffected

---

**Epic 2 Summary:** 8 stories, covering FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013 + NFR-P1, NFR-R1, NFR-R2, NFR-S1, NFR-SC2, NFR-I1.

---

## Epic 3: Calm Route Planning

Users can plan acoustically-weighted pedestrian routes between two Paris addresses, see composite serenity scores and travel time, receive mid-route detour suggestions on noise spikes, and share or save routes.

### Story 3.1: Route input with dual address fields

As a user,
I want to enter an origin and destination address to request a calm pedestrian route,
So that I can plan a quiet walk between two points in Paris (FR-014).

**Acceptance Criteria:**

**Given** the SearchBar supports intent classification (from Epic 2)
**When** the user enters a route-pattern input (e.g. "de Bastille à République" or uses a dedicated route UI)
**Then** the intent is classified as `route` and two address fields (origin + destination) are presented
**And** both fields use Photon Komoot geocoding with autocomplete (Paris-bounded, 350ms debounce)

**Given** both origin and destination are selected
**When** the user confirms the route request
**Then** the system initiates route computation

**Given** only one address is provided
**When** the user has not completed both fields
**Then** the route cannot be requested — a prompt indicates the missing field

**Given** the polymorphic bottom sheet (UX architecture)
**When** the route input is active
**Then** the bottom sheet displays the route input form (replacing IrisPopup content)

### Story 3.2: Acoustic-weighted route computation and display

As a user,
I want the system to compute and display a pedestrian route that prioritizes quiet IRIS zones,
So that I walk through the calmest streets in Paris (FR-015, FR-016).

**Acceptance Criteria:**

**Given** valid origin and destination coordinates
**When** route computation is triggered
**Then** the system computes a pedestrian route using IRIS zone adjacency, weighted by Score Sérénité (higher score = lower cost)
**And** computation completes within 4 seconds (NFR-P2)

**Given** the route is computed
**When** displayed on the map
**Then** the route polyline is drawn on the MapLibre map, colored by the serenity tier of each segment
**And** the route summary in the bottom sheet shows: composite serenity score (weighted average across traversed zones) and estimated walking time

**Given** the route traverses multiple IRIS zones
**When** the user views the route summary
**Then** each zone traversed is listed with its Score, allowing the user to understand which segments are quieter

**Given** no valid route exists (e.g. destination outside Paris intra-muros)
**When** computation fails
**Then** a calm error message is shown: "Itinéraire non disponible pour cette destination"

### Story 3.3: Mid-route detour on live noise spike

As a user,
I want the app to suggest a detour when a live noise spike is detected along my active route,
So that I can avoid unexpectedly noisy areas in real time (FR-017).

**Acceptance Criteria:**

**Given** a route is active and displayed on the map
**When** RUMEUR data refreshes and a sensor along the route shows a significant noise spike (e.g. > 70 dB)
**Then** a notification appears in the route summary: "Bruit élevé détecté sur votre itinéraire — itinéraire alternatif disponible"
**And** an alternative quieter segment is proposed

**Given** the user views the detour suggestion
**When** the user accepts the detour
**Then** the route is recalculated to avoid the noisy segment and the map updates

**Given** the user dismisses the detour
**When** the suggestion is closed
**Then** the original route remains active and no further suggestion for the same spike is shown

**Given** RUMEUR data is unavailable
**When** a route is active
**Then** no detour suggestions are shown — the route remains based on static PPBE data (NFR-R1)

### Story 3.4: Share and save calm routes

As a user,
I want to share a computed calm route and save it for future reference,
So that I can send it to a friend or revisit it later (FR-018, FR-019).

**Acceptance Criteria:**

**Given** a route is computed and displayed
**When** the user taps the Share button in the route summary
**Then** the native share sheet is invoked with: route description (origin → destination), composite serenity score, and a link or image

**Given** the Web Share API is not available
**When** share is triggered
**Then** a copy-link fallback is provided

**Given** a route is computed
**When** the user taps Save
**Then** the route (origin, destination, waypoints, composite score) is persisted locally (localStorage or AsyncStorage)
**And** saved routes are accessible from a "Mes itinéraires" section

**Given** the user opens saved routes
**When** they select a saved route
**Then** the route is redrawn on the map with the saved data
**And** scores may be recalculated if newer data is available (or display "Score au moment de la sauvegarde")

---

**Epic 3 Summary:** 4 stories, covering FR-014, FR-015, FR-016, FR-017, FR-018, FR-019 + NFR-P2, NFR-R1.

---

## Epic 4: Ambient Push Agent

Users can opt in to push notifications for pinned zones, receive French-language alerts when acoustic conditions change significantly, configure frequency, and deep-link back to the relevant zone.

### Story 4.1: Push notification opt-in and permission request

As a user,
I want to opt in to ambient push notifications for my pinned zones, with the permission request coming only after I've seen value,
So that I receive useful alerts without being asked prematurely (FR-020, FR-039).

**Acceptance Criteria:**

**Given** the user has completed a first value interaction (route completed or first NLQ result — FR-039)
**When** the user navigates to pinned zones or notification settings
**Then** an opt-in prompt explains the value: "Recevez des alertes quand le bruit change dans vos zones épinglées"
**And** the iOS push notification permission dialog is triggered only after the user accepts the opt-in

**Given** the user has not completed a value interaction
**When** they navigate the app
**Then** no push permission is requested — the opt-in prompt is not shown yet

**Given** the user grants push permission
**When** the device token is received
**Then** the token is registered with Expo Push Service for the user's pinned zones

**Given** the user denies push permission
**When** the denial is detected
**Then** the app degrades gracefully — no further permission requests, ambient agent features work without push (in-app only)

### Story 4.2: Acoustic change detection and push delivery

As a user,
I want to receive a push notification when a significant acoustic change is detected in one of my pinned zones,
So that I stay informed about noise conditions without checking the app constantly (FR-021, FR-022).

**Acceptance Criteria:**

**Given** the user has pinned zones and push is enabled
**When** a scheduled server-side job runs (e.g. cron checking RUMEUR data)
**Then** the system detects statistically significant acoustic changes in pinned zones (e.g. RUMEUR reading > 75 dB, or 3+ micro-reports in 1 hour, or new chantier started)

**Given** a significant change is detected
**When** the push is prepared
**Then** the system calls Claude Haiku to generate French push copy calibrated to the acoustic event sentiment:
- Quiet window: "Votre zone Marais est particulièrement calme ce soir — 48 dB"
- Noise spike: "Bruit élevé détecté dans votre zone — capteur à 71 dB"
- Construction start: "Nouveau chantier signalé près de votre zone Bastille"

**Given** the push copy is generated
**When** delivered via Expo Push / APNs
**Then** the notification is delivered to the user's device (NFR-I2)
**And** push cadence is capped at 1 push/day/user regardless of trigger count (NFR-I2)

**Given** the same cron window runs again
**When** it has already sent a push for this zone
**Then** no duplicate push is sent — jobs are idempotent (NFR-R3)

### Story 4.3: Notification frequency settings and deep-link

As a user,
I want to configure how often I receive notifications and tap a notification to go directly to the relevant zone,
So that I control my alert experience and can act on information immediately (FR-023, FR-024).

**Acceptance Criteria:**

**Given** the user navigates to notification settings
**When** the settings screen loads
**Then** the user can configure notification frequency: "Toutes les alertes" / "1 par jour" / "1 par semaine" / "Désactivé"
**And** the current setting is persisted (localStorage or server-side for B2B users)

**Given** the user sets frequency to "Désactivé"
**When** a trigger fires
**Then** no push notification is sent to this user

**Given** a push notification is delivered
**When** the user taps the notification
**Then** the app opens (or foregrounds) and navigates directly to the relevant zone on the map with its IrisPopup open (FR-024)
**And** the deep-link scheme (e.g. `tacet://zone/{zone_code}`) resolves correctly on iOS

**Given** push notification copy is delivered
**When** read by a screen reader
**Then** the copy is intelligible without visual context (NFR-A4)

---

**Epic 4 Summary:** 3 stories, covering FR-020, FR-021, FR-022, FR-023, FR-024, FR-039 + NFR-R3, NFR-I2, NFR-A4.

---

## Epic 5: Natural Language Query

Users can ask acoustic questions in French, get ranked mapped results with scores and data citations, see AI transparency disclosure, with fallback to structured search.

### Story 5.1: NLQ input and intent classification

As a user,
I want to type a natural language question in French in the SearchBar and have it recognized as a query (not an address),
So that I can ask things like "Café calme près de République" naturally (FR-025).

**Acceptance Criteria:**

**Given** the SearchBar has intent classification (from Epic 2)
**When** the user types an input that matches NLQ patterns (e.g. contains "calme", "bruit", "tranquille", question words, or does not match address/route patterns)
**Then** the intent classifier returns `{ intent: 'nlq', payload: { query: '...' } }`

**Given** the intent is classified as NLQ
**When** the user submits the query
**Then** the query is sent to the NLQ processing pipeline (server-side)
**And** a loading state is shown in the bottom sheet

**Given** the SearchBar placeholder
**When** NLQ is enabled
**Then** the placeholder reads "Adresse, itinéraire, ou question…" (V3 UX spec)

### Story 5.2: NLQ processing, ranked results, and map display

As a user,
I want my natural language query to return a ranked, mapped result set with acoustic scores and data citations,
So that I can visually explore the answer on the map (FR-026, FR-027).

**Acceptance Criteria:**

**Given** a valid NLQ query is submitted
**When** the server processes it
**Then** the query is parsed into structured spatial criteria (zone filter, score threshold, distance constraint)
**And** matching zones/POIs are ranked by relevance and acoustic score
**And** the total pipeline completes within 3 seconds (NFR-P7)

**Given** results are returned
**When** displayed
**Then** the map shows result markers at matched locations
**And** the bottom sheet (polymorphic — NLQ results variant) shows a ranked list with:
- Zone/POI name
- Score Sérénité
- Distance from query origin
- Data source citation (e.g. "PPBE 2024" or "RUMEUR en direct") (FR-027)

**Given** the user taps a result in the list
**When** the tap is registered
**Then** the map navigates to that zone and opens the standard IrisPopup

**Given** NLQ queries containing location references
**When** processed
**Then** they are not persisted beyond the session without explicit consent (NFR-S7)

### Story 5.3: AI transparency disclosure and structured search fallback

As a user,
I want to see a one-time transparency disclosure that AI is involved in NLQ, and get useful results even when NLQ returns nothing,
So that I trust the system and always get an answer (FR-028, FR-029).

**Acceptance Criteria:**

**Given** the user triggers their first NLQ interaction on this device
**When** the NLQ results are shown
**Then** a transparency disclosure banner is displayed: "Vous interagissez avec un système IA — résultats basés sur les données Bruitparif et Open Data Paris" (EU AI Act Art. 52, NFR-C3)
**And** the disclosure is shown once per device (persisted in localStorage)

**Given** the user has seen the disclosure before
**When** they make subsequent NLQ queries
**Then** the disclosure is not shown again

**Given** an NLQ query returns no matching results
**When** the empty state is reached
**Then** the system falls back to structured search: "Aucun résultat pour votre question — voici les zones les plus calmes à proximité" (FR-029)
**And** a list of the top 5 quietest zones near the query origin is shown as a fallback

**Given** the NLQ service is unavailable (server error, timeout)
**When** the query fails
**Then** a calm error message is shown and the user can retry or use address search instead

---

**Epic 5 Summary:** 3 stories, covering FR-025, FR-026, FR-027, FR-028, FR-029 + NFR-P7, NFR-S7, NFR-C3, NFR-SC3.

---

## Epic 6: B2B Reports & Billing

B2B users can create accounts, view acoustic dashboards combining PPBE + RUMEUR for any address, export certified PDF reports with full attribution and disclaimers, subscribe via Stripe, with access gated to paid tiers.

### Story 6.1: B2B account creation and authentication

As a B2B user,
I want to create an account with email and password and log in securely,
So that I can access premium acoustic data features (FR-030).

**Acceptance Criteria:**

**Given** a prospective B2B user visits the B2B signup page
**When** they submit email and password
**Then** an account is created with the B2B role
**And** a confirmation email is sent
**And** the user can log in with their credentials

**Given** a B2B user logs in
**When** authentication succeeds
**Then** a short-lived JWT (< 1h expiry) is issued with a refresh token (NFR-S2)
**And** the user is redirected to the B2B dashboard

**Given** a JWT expires
**When** the user makes a request
**Then** the refresh token rotation issues a new JWT transparently
**And** if the refresh token is also expired, the user is redirected to login

**Given** passwords
**When** stored
**Then** they are hashed (bcrypt or argon2) — never stored in plaintext (NFR-S6)

### Story 6.2: Acoustic dashboard for B2B subscribers

As a B2B user,
I want to view an acoustic dashboard for a specified Paris address combining PPBE historical data and RUMEUR live readings,
So that I can assess the acoustic profile of a location for my business needs (FR-031).

**Acceptance Criteria:**

**Given** an authenticated B2B subscriber
**When** they enter a Paris address on the dashboard
**Then** the dashboard displays: Score Sérénité, day/night levels, data vintage, nearest RUMEUR sensor reading (if available), and active chantiers

**Given** RUMEUR data is available
**When** the dashboard renders
**Then** live sensor data is shown with timestamp and distance from the queried address

**Given** RUMEUR is unavailable
**When** the dashboard renders
**Then** a fallback indicator shows: "Données temps réel indisponibles — Score basé sur PPBE annuel"

**Given** a non-authenticated or free-tier user
**When** they attempt to access the dashboard
**Then** access is denied with a redirect to pricing/signup (FR-035, NFR-S4)

### Story 6.3: Certified PDF acoustic report export

As a B2B user,
I want to export a certified PDF acoustic report for a specified address with full data attribution and disclaimers,
So that I can share professional acoustic documentation with clients (FR-032, FR-033).

**Acceptance Criteria:**

**Given** an authenticated B2B subscriber views a dashboard for an address
**When** they click "Exporter rapport PDF"
**Then** a server-side PDF generation process creates a certified report (NFR-S5)
**And** the PDF includes: Score Sérénité, day/night levels, nearest RUMEUR reading (if available), map snapshot, and data vintage

**Given** the PDF is generated
**When** the content is assembled
**Then** it includes: data source attribution ("Données Bruitparif (ODbL) + Open Data Paris (Etalab)"), methodology disclaimer, generation timestamp (FR-033, NFR-C1)
**And** a non-removable footer reads: "À titre informatif — ne constitue pas un acte réglementaire" (NFR-C5)

**Given** the PDF is ready
**When** the user downloads it
**Then** the file is delivered via HTTPS (NFR-S6) and named descriptively (e.g. "Tacet-rapport-{address}-{date}.pdf")

### Story 6.4: Stripe subscription and access gating

As a B2B user,
I want to subscribe to a paid tier via Stripe and have my dashboard and PDF access gated by my subscription status,
So that I can manage my billing and the system enforces fair access (FR-034, FR-035).

**Acceptance Criteria:**

**Given** an authenticated B2B user without an active subscription
**When** they visit the pricing page
**Then** subscription tiers are displayed: B2B Pro (€99/mo) and B2B Enterprise (€200/mo) with feature details

**Given** the user selects a tier
**When** they complete Stripe Checkout
**Then** a subscription is created and the user's role is updated to B2B Subscriber
**And** they are redirected to the dashboard with full access

**Given** Stripe sends webhook events (payment_intent.succeeded, customer.subscription.deleted, etc.)
**When** the server receives a webhook
**Then** the webhook signature is verified via HMAC (NFR-S3)
**And** subscription status is updated accordingly (active, cancelled, past_due)

**Given** a B2B subscriber's subscription lapses
**When** they attempt to access dashboard or PDF export
**Then** access is denied with a message: "Votre abonnement a expiré — renouvelez pour continuer"
**And** enforcement is server-side on every request (NFR-S4)

**Given** the NLQ free tier rate limit
**When** a free user exceeds 10 queries/day
**Then** NLQ is blocked until the next day; B2B Pro and Enterprise are exempt (NFR-SC3)

---

**Epic 6 Summary:** 4 stories, covering FR-030, FR-031, FR-032, FR-033, FR-034, FR-035 + NFR-S2, NFR-S3, NFR-S4, NFR-S5, NFR-S6, NFR-C1, NFR-C5, NFR-SC3.

---

## Epic 7: Compliance, Permissions & Data Rights

All users benefit from transparent data attribution, honest permission rationale, methodology disclaimers, and data deletion rights.

### Story 7.1: ODbL/Etalab attribution and methodology disclaimers

As a user,
I want to see data attribution (Bruitparif ODbL, Open Data Paris Etalab) and methodology disclaimers in every data view,
So that I know where the data comes from and its limitations (FR-036, FR-040).

**Acceptance Criteria:**

**Given** any view displaying acoustic data (map, IrisPopup, route summary, NLQ results, B2B dashboard, PDF)
**When** the view renders
**Then** ODbL/Etalab attribution is displayed (e.g. footer: "Données Bruitparif (ODbL) · Open Data Paris (Etalab)")
**And** the attribution component is non-removable — its absence triggers a build lint error (NFR-C1)

**Given** any view displaying acoustic data
**When** the user views the data
**Then** a methodology disclaimer is present: "Score Sérénité — métrique indicative basée sur PPBE Lden. Non certifié pour usage réglementaire." (FR-040)
**And** the disclaimer includes data source and collection period when contextually relevant

**Given** routing data uses OSM-derived sources
**When** a route is displayed
**Then** ODbL attribution for OpenStreetMap routing data is also displayed

### Story 7.2: Location permission rationale and progressive requests

As a user,
I want the app to explain why it needs my location before asking, and to request background location only when I enable the ambient agent,
So that I trust the permission requests and feel in control (FR-037, FR-038).

**Acceptance Criteria:**

**Given** the app needs foreground location (e.g. to center the map on the user)
**When** the permission is about to be requested
**Then** a pre-permission rationale screen is shown: specific and honest explanation in French (e.g. "Pour afficher les zones calmes autour de vous")
**And** the iOS permission dialog is triggered only after the user taps "Continuer" on the rationale screen

**Given** the user has not enabled the ambient agent
**When** the app is running
**Then** `NSLocationAlwaysUsageDescription` / background location is NOT requested — only when-in-use is sufficient

**Given** the user explicitly enables the ambient agent (Epic 4)
**When** the ambient agent requires background location
**Then** a separate rationale screen explains the need for background access: "Pour vous alerter quand le bruit change dans vos zones épinglées, même quand l'app est fermée"
**And** only then is `requestAlwaysAuthorization` triggered (FR-038)

**Given** the user denies location
**When** the app continues
**Then** the app works with manual address input — map browsing and search remain functional

### Story 7.3: Account and data deletion (RGPD)

As a user,
I want to request deletion of my account and all associated personal data,
So that my RGPD data subject rights are respected (FR-041).

**Acceptance Criteria:**

**Given** a B2B user (or any user with persisted data in V3)
**When** they navigate to account settings and select "Supprimer mon compte"
**Then** a confirmation dialog explains what will be deleted: account, location history, route history, NLQ session logs, push preferences

**Given** the user confirms deletion
**When** the request is processed
**Then** all personal data is deleted within 30 days (NFR-C2)
**And** the user receives a confirmation email
**And** the user is logged out and redirected to the home page

**Given** a free (non-account) user
**When** they want to clear their local data
**Then** a "Effacer mes données locales" option in settings clears localStorage, sessionStorage, and cached zone/route data

**Given** the deletion is complete
**When** verified
**Then** deletion covers: account record, email, billing history reference (Stripe customer ID retained per legal obligation), saved zones, saved routes, push device tokens, NLQ logs

---

**Epic 7 Summary:** 3 stories, covering FR-036, FR-037, FR-038, FR-039, FR-040, FR-041 + NFR-C1, NFR-C2.
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
