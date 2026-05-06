---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
status: complete
completedAt: '2026-03-18'
inputDocuments:
  - docs/planning/product-brief.md
  - docs/planning/research/domain-research.md
  - docs/planning/research/market-research.md
  - docs/planning/research/technical-research.md
  - _bmad-output/planning-artifacts/project-context.md
  - docs/planning/ambient-agentic-vision.md
workflowType: 'prd'
project_name: Tacet
version: 'V3'
date: '2026-03-18'
author: IVAN
classification:
  projectType: mobile_app+web_app+saas_b2b
  mobileToolchain: React Native / Expo (Expo Go → EAS Build)
  domain: civic_environmental
  complexity: high
  projectContext: brownfield
---

# Product Requirements Document — Tacet V3

**Author:** IVAN
**Date:** 2026-03-18
**Version:** V3 (iOS Native + Calm Routes + NLQ + B2B)

## Executive Summary

Tacet V3 is the **ambient urban acoustic intelligence layer for Paris** — a React Native / Expo mobile app (iOS-first, Android-ready) and continuing web PWA that transforms noise data into proactive, conversational, and navigational guidance. Where V1 made acoustic data visible and V2 made it searchable, V3 makes it **actionable and ambient**: the city becomes navigable by sound, and the app acts as a background agent that surfaces insights without being asked.

**Problem:** 17.2 million French people are severely disrupted by noise daily, yet no consumer tool helps them navigate, decide, or plan around their acoustic environment. Citymapper routes by speed; Google Maps routes by distance. No tool routes by serenity, alerts you to a noise spike in your neighborhood, or lets you ask "find me a quiet café near Oberkampf with Wi-Fi" in plain language.

**Solution:** Tacet V3 delivers five net-new capabilities on top of the V2 data layer:
1. **Calm Route Planner** — turn-by-turn pedestrian navigation weighted by acoustic data (OSRM/GraphHopper + PPBE + RUMEUR)
2. **Thematic Routes** — curated walks by theme (nature, street art, food, coffee) with noise scores per segment
3. **Natural Language Query (NLQ)** — conversational interface to the acoustic dataset; one sentence replaces a multi-step search flow
4. **Ambient Agent** — proactive push intelligence: noise spikes, quiet windows, construction starts, personalized thresholds — surfaced without user initiation
5. **B2B Certified Reports** — exportable acoustic evidence for studios, architects, coworkings, medical cabinets; subscription tier 50–200€/month

**Distribution:** Expo Go for rapid development iteration → EAS Build for App Store submission. Shared React codebase with existing Next.js PWA maximizes code reuse and caps marginal engineering cost per platform.

**Strategic timing:** Elections Paris 2026 (bruit = campagne issue), Bruitparif API access (TAC-28 in resolution), and a live V2 data layer mean V3 builds on proven infrastructure, not a greenfield bet.

### What Makes This Special

- **Acoustic routing moat:** No competitor has routing weighted by real acoustic data. The PPBE + RUMEUR combination is unique to Tacet and non-trivially reproducible.
- **Ambient over reactive:** Most apps wait to be asked. Tacet V3's agent layer pushes insight to users at the right moment — when noise spikes, when a quiet window opens, when a construction phase starts near a saved route.
- **NLQ collapses UX complexity:** A single natural language query replaces zone selection → layer toggle → filter — reducing time-to-insight from ~3 interactions to 1 sentence.
- **B2B on the same data stack:** The B2B certified report tier generates revenue from infrastructure already built for B2C, with zero marginal data cost.
- **Expo bridge:** Expo Go iteration speed + EAS Build for store distribution means solo-founder mobile velocity with professional-grade distribution.

## Project Classification

| Dimension | Value |
|---|---|
| **Project Type** | mobile_app (React Native/Expo) + web_app (PWA) + saas_b2b |
| **Mobile toolchain** | Expo Go (dev iteration) → EAS Build (App Store) |
| **Domain** | civic_environmental — RGPD, RGAA, ODbL/Etalab, Directive 2002/49/CE |
| **Complexity** | High — regulated datasets, multi-platform, routing engine, LLM/NLQ, B2B billing |
| **Project Context** | Brownfield — V3 delta on V2-delivered baseline (V1 live, V2 in-sprint) |

## Success Criteria

### User Success

- A user plans a calm pedestrian route between two Paris addresses in **< 30 seconds** from app open
- A user submits an NLQ query ("café calme près de République avec Wi-Fi") and receives a ranked, mapped result set in **< 3 seconds**
- The ambient agent delivers a contextually relevant push notification (noise spike, quiet window, route alert) that the user does not dismiss immediately — proxy for perceived relevance (**target: ≥ 40% notification retention rate**)
- A B2B customer exports a certified acoustic report for a specific address in **< 2 minutes** from login
- Expo Go scan-to-run works in **< 60 seconds** from cold QR scan on a physical device (developer iteration success)

### Business Success

| Horizon | Target |
|---|---|
| **V3 launch (soft)** | Expo Go build shareable with 5 beta testers; calm route functional on ≥ 3 test corridors |
| **App Store submission** | iOS app live; Lighthouse mobile perf ≥ 90; App Store rating ≥ 4.2 at 50 reviews |
| **6 months post-launch** | 10,000 MAU across iOS + web; ≥ 1 B2B paying customer (50€+/month); ≥ 3 press citations |
| **12 months** | 50,000 MAU Paris; B2B MRR ≥ 500€; mention in Paris 2026 election campaign coverage |
| **3 years** | Expansion to Lyon/Marseille; B2B ARR ≥ 20K€; community Waze-for-Noise layer launched |

### Technical Success

- React Native / Expo app cold start **< 2s** on iPhone 12 or equivalent
- Calm route computation (A→B, Paris intra-muros) **< 4s** including acoustic weighting
- NLQ query round-trip (device → LLM → map result) **< 3s** on 4G
- Ambient agent push delivery latency **< 5 minutes** from trigger event (noise spike detected by RUMEUR)
- EAS Build CI/CD pipeline: prod build → TestFlight in **< 15 minutes**
- Shared codebase: ≥ 70% business logic reuse between RN app and Next.js PWA
- B2B PDF export generation **< 10 seconds** server-side
- Zero App Store rejection on first submission for privacy / permissions compliance

### Measurable Outcomes

| Metric | V3 Target |
|---|---|
| Lighthouse Performance (web) | ≥ 90 |
| Lighthouse Accessibility (web) | ≥ 95 |
| LCP mobile | < 2.0s |
| Bundle JS initial (web) | < 250 Ko |
| PWA Install Rate | ≥ 15% |
| App Store Rating | ≥ 4.2 |
| Score Sérénité accuracy vs PPBE | ≥ 95% |
| NLQ query success rate (result returned) | ≥ 90% |
| Ambient agent false positive rate | < 20% |
| B2B report export success rate | ≥ 99% |
| Organic share rate | ≥ 12% |

## Product Scope

### MVP — Minimum Viable Product

The V3 MVP is validated when a user can:
1. Install the app via Expo Go **or** TestFlight
2. Plan and follow a calm pedestrian route (A→B) on at least the core Paris arrondissements (1–11)
3. Submit one NLQ query and receive a mapped, actionable result
4. Receive at least one ambient push notification triggered by a real RUMEUR event
5. *(B2B)* Log in, input an address, and export a basic certified PDF report

MVP explicitly excludes: thematic routes curation, Android EAS build, multi-city expansion, Waze-for-Noise crowdsourcing.

### Growth Features (Post-MVP)

- Thematic routes (nature, street art, food, coffee) with editorial curation
- Android App Store release via EAS Build
- B2B subscription management UI (Stripe billing, invoice download)
- NLQ memory / conversation history (follow-up queries)
- Ambient agent personalization (user-defined thresholds, saved zones)
- SSE real-time streaming to replace polling (Vercel Pro tier)
- Offline route caching for pre-planned walks

### Vision (Future)

- Expansion hors Paris IDF (Lyon, Marseille, Bruxelles, Amsterdam)
- Community Waze-for-Noise layer (crowdsourced reports, AI-validated)
- Acoustic AR overlay (camera view + noise heatmap)
- B2G institutional reporting tier (collectivités, urbanistes)
- Voice-first NLQ (speak your query, get a route)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — deliver one end-to-end journey (calm route, iOS, Expo Go → TestFlight) at production quality before expanding surface area.

**Rationale:** V3 has 7 capability clusters. Shipping all simultaneously is the solo-founder trap. The routing journey (install → plan → walk) is the highest-differentiation, most shareable moment. It validates the acoustic routing moat before investing in NLQ, B2B, and ambient agent complexity.

**Resource profile:** Solo founder (IVAN). All stories must be sequenceable without parallel workstreams. No story should block another unless explicitly noted.

**MVP is complete when:**
1. Expo Go QR scan → app running on physical iPhone in < 60s ✓
2. Calm pedestrian route A→B computed and displayed in < 4s ✓
3. `/api/enrich` (Story 6.0) enriches zone popup with Haiku summary ✓
4. Story 6.1 time-aware weighting live (zero UI, automatic) ✓
5. Story 6.2 intent layer (one-tap, localStorage) ✓
6. IrisPopup design sprint output implemented ✓
7. EAS Build → TestFlight pipeline running in CI (< 15 min build) ✓

NLQ, B2B, ambient push, and thematic routes are explicitly **post-MVP**.

### MVP Feature Set (Phase 1 — V3.0)

**Core user journeys supported:**
- J1 (Maria, calm route — happy path)
- J5 (IVAN, Expo Go dev workflow)
- Partial J4 (Sophie, degraded — RUMEUR fallback already exists from V2)

**Must-have capabilities:**

| Capability | Story | Dependency |
|---|---|---|
| Expo SDK setup + Expo Go workflow | New | None |
| EAS Build CI/CD → TestFlight | New | Expo SDK |
| RN map view (MapLibre RN) | New | Expo SDK |
| PMTiles + IRIS layer in RN | New | MapLibre RN |
| Story 6.1: Time-aware signal weighting | 6.1 | None — zero UI |
| Story 6.0: `/api/enrich` Route Handler | 6.0 | `ANTHROPIC_API_KEY` |
| `NEXT_PUBLIC_ENABLE_ENRICHMENT` feature flag | 6.0 | None |
| IrisPopup design sprint → implementation | Design sprint | Story 6.0 output |
| Story 6.2: Intent layer (one-tap, localStorage) | 6.2 | IrisPopup sprint |
| Story 6.3: Proactive zone alternatives | 6.3 | Story 6.0, centroids |
| Basic calm route — IRIS adjacency graph + turf.js | 6.5a | IRIS data + turf.js |
| Route display on map | 6.5b | MapLibre RN |
| Safe area handling (Dynamic Island, notch) | Infra | Expo SDK |

**Explicitly out of MVP:**
- NLQ conversational interface
- B2B auth + certified PDF export + Stripe billing
- Ambient push notifications (Story 6.4)
- Android EAS Build
- Thematic routes (street art, food, coffee)
- OSRM/GraphHopper external routing engine (turf.js adjacency graph covers MVP routing)

### Post-MVP Features

**Phase 2 — V3.1 (Growth, sequenced):**

| Priority | Feature | Rationale |
|---|---|---|
| 1 | Story 6.4: Ambient push alerts | Highest retention leverage once user base exists |
| 2 | NLQ — structured spatial query + `/api/enrich` formatting | Differentiator; builds on 6.0 already in prod |
| 3 | B2B: auth + acoustic dashboard + Stripe billing | Revenue gate; self-contained workstream |
| 4 | B2B: certified PDF export | Completes B2B story; unblocks Maxime journey |
| 5 | Android EAS Build | Doubles addressable mobile market; low marginal cost |
| 6 | NLQ conversation history | Growth on top of NLQ MVP |
| 7 | Offline route caching | Quality of life; builds on existing Serwist |
| 8 | Ambient agent personalisation (threshold learning) | Builds on intent layer |

**Phase 3 — V3.2+ (Expansion):**

| Feature | Rationale |
|---|---|
| Thematic routes (nature, street art, food, coffee) | Editorial curation effort; deferred until routing proven |
| OSRM/GraphHopper integration | Replace turf.js adjacency for longer cross-arrondissement routes |
| Waze-for-Noise crowdsourcing | Moderation complexity; requires user base first |
| B2B team seats + white-label report | Enterprise tier; requires V3.1 B2B validation |
| Acoustic AR overlay | Post-product-market-fit exploratory |
| Expansion hors Paris (Lyon, Marseille) | Requires city-specific PPBE + sensor partnerships |
| Voice-first NLQ | Builds on text NLQ; deferred until NLQ proven |
| SSE real-time streaming | Vercel Pro cost; polling sufficient at current scale |

### Risk Mitigation Strategy

**Technical risks:**

| Risk | Severity | Mitigation |
|---|---|---|
| turf.js IRIS adjacency routing coverage / quality | Medium | Validate on 3 test corridors before sprint; fallback to "no quiet route found" gracefully |
| MapLibre React Native + PMTiles compatibility | Medium | Spike in Week 1 of Expo setup; fallback to WebView wrapper if blocked |
| App Store first submission rejection | Medium | TestFlight external review first; Privacy manifest checklist; no IDFA |
| TAC-28 RUMEUR API still blocked | Low (MVP) | Static PPBE covers MVP routing; RUMEUR enriches but never blocks |
| `/api/enrich` latency spikes | Low | Non-blocking by design; 1.5s timeout + fallback rendering |

**Market risks:**

| Risk | Mitigation |
|---|---|
| Acoustic routing not compelling vs fastest route | A/B test in Phase 2; MVP ships both options |
| B2B market smaller than projected | Free B2C grows first; B2B is revenue upside, not survival dependency |
| Elections Paris 2026 timing | Target V3 MVP before Q3 2026 campaign peak |

**Resource risks (solo founder):**

| Risk | Mitigation |
|---|---|
| Story 6.5 route serenity over-scoped | Break into 4 sub-stories; ship incrementally |
| Expo RN learning curve | Time-box Expo spike to 2 days; WebView fallback known |
| B2B Stripe + auth adds 2+ sprints | B2B deferred to Phase 2 entirely |

## User Journeys

### Journey 1 — Maria, Calm Route Seeker (Primary — Happy Path)

**Who:** Maria, 36, designer d'intérieur. She found her apartment in Belleville using Tacet V2's Score Sérénité. She's now a convert — she uses Tacet to navigate her city, not just evaluate it.

**Opening scene:** Saturday morning. Maria is meeting a friend at a gallery in the Marais. She opens Tacet on her iPhone. She doesn't want to walk along the Rue de Rivoli — too loud, too crowded. She wants the calm version of this trip.

**Rising action:** She taps "Itinéraire calme" in the app. Enters her address and the gallery. The app returns three route options in 3 seconds, each tagged with a composite acoustic score. The quietest winds through Passage Molière and cuts through the Place des Vosges colonnades. She taps "Commencer."

**Climax:** Halfway through, she passes a section of unexpected roadworks — the app, detecting a RUMEUR spike, gently suggests a 90-second detour. She takes it. The alternate segment scores 72/100 serenity. She arrives calm, not frazzled.

**Resolution:** She screenshots the route and sends it to her friend with the caption "Pour les prochains rendez-vous dans le Marais." Tacet gains its 8th organic share of the day from Maria alone.

**Capabilities revealed:** routing engine (acoustic-weighted), RUMEUR live overlay on active routes, mid-route rerouting on noise spike, route share export.

---

### Journey 2 — Maria, NLQ & Ambient Agent (Primary — Ambient Path)

**Who:** Same Maria. She's been using the app for 6 months. She has saved zones: her apartment, her studio, her child's école maternelle.

**Opening scene:** Tuesday at 7h42. Maria receives a push notification before she's even opened the app: *"Ton quartier est inhabitellement calme ce matin — fenêtre calme jusqu'à 9h30. Idéal pour une sortie avec Lucas."*

**Rising action:** She opens the notification. The ambient agent surfaces the 3h quiet window in her IRIS zone — a Tuesday morning lull correlated with school hours and low traffic. She wasn't looking for this information. It found her.

**Climax:** She taps the notification, which opens directly to a NLQ prompt pre-populated with her zone. She types: "Square calme pour un enfant de 4 ans à moins de 10 min à pied." The NLQ agent returns 2 ranked results with noise scores, walk time, and a serenity thumbnail. She picks the second one — lower score but shade.

**Resolution:** She arrives at the square at 8h15. The ambient agent has started logging this as a "preferred morning spot." Next week it will include it in its quiet window suggestions automatically.

**Capabilities revealed:** ambient push notifications (RUMEUR-triggered), NLQ with spatial context, personalization memory layer, location-based pre-population, offline map tile caching.

---

### Journey 3 — Maxime, B2B Studio Founder (B2B — Success Path)

**Who:** Maxime, 44, fondateur d'un studio d'enregistrement indépendant à Paris 10ème. Cherche un local pour son second studio. Son critère absolu : < 45 dB Lden en journée, isolement possible sans frais d'insonorisation excessifs.

**Opening scene:** Maxime has a notaire rendez-vous Thursday for a local in the Haut-Marais. He needs certified acoustic data to negotiate the lease terms and justify a sound-proofing budget to his accountant.

**Rising action:** He logs into Tacet B2B on web (he's on a laptop). He enters the address. The B2B dashboard pulls up 5 years of Bruitparif PPBE data for that IRIS zone, the nearest RUMEUR sensor readings, and a day/night/weekend breakdown. It surfaces a key risk: a RATP bus depot 80m away creates a consistent 6h–8h morning spike.

**Climax:** He clicks "Générer rapport certifié." In 8 seconds, a PDF is ready: letterhead, address, data sources cited (Bruitparif, PPBE 4th cycle, Etalab licence), acoustic profile, risk flags, and a methodology disclaimer. It's signed with a Tacet certification timestamp.

**Resolution:** He attaches the report to his accountant email and uses it to negotiate a 15% rent reduction citing documented acoustic risk. He subscribes to the 99€/month B2B tier. ROI: day one.

**Capabilities revealed:** B2B auth layer, address-level acoustic dashboard, PPBE + RUMEUR combined view, PDF certified export with data provenance, Stripe subscription billing.

---

### Journey 4 — Sophie, Habituée Reconvertie (Secondary — Edge Case / Degraded)

**Who:** Sophie, 42, enseignante, Paris 11ème. She's been on Tacet since V1, originally for apartment browsing. She now uses it to plan her children's school walk.

**Opening scene:** A new chantier has appeared on her usual school route — construction noise audible from 50m. She opens Tacet to find a quieter alternative but notices the RUMEUR layer isn't loading (TAC-28 degraded — fallback to PPBE static data).

**Rising action:** The app gracefully falls back: static PPBE scores replace live RUMEUR readings. A subtle inline indicator reads "Données temps réel indisponibles — scores basés sur données historiques 2024." She isn't alarmed. She finds a back-route through Rue Trousseau that scores 68/100 on static data.

**Climax:** She saves it as "Trajet école calme" in her saved routes. The app confirms it'll auto-monitor this route for live acoustic changes once RUMEUR reconnects.

**Resolution:** The next morning the route works perfectly. RUMEUR reconnects overnight; the route's live score is 71/100. The offline/degraded experience preserved user trust without confusion.

**Capabilities revealed:** graceful RUMEUR fallback to static PPBE, offline-aware route saving, status indicator (live vs. historical data), auto-resume monitoring on reconnect.

---

### Journey 5 — IVAN, Developer (Expo Go Iteration)

**Who:** IVAN, solo founder, building V3. He's iterating on the NLQ screen on a physical iPhone without a full EAS build cycle.

**Opening scene:** He's added a new NLQ suggestion chip component. He wants to see it on a real device in 30 seconds, not wait 8 minutes for a simulator build.

**Rising action:** He runs `npx expo start` from the repo root. Opens Expo Go on his iPhone, scans the QR code. The app loads with his latest changes — including the new chip UI — in 22 seconds from cold.

**Climax:** He spots an alignment issue on iPhone 14 Pro's Dynamic Island safe area. Fixes it in the source file. The app hot-reloads in under 2 seconds. He screenshots it and marks the story done.

**Resolution:** He pushes to main. EAS Build CI/CD kicks off automatically. TestFlight build ready in 12 minutes. He sends the TestFlight link to 3 beta testers before lunch.

**Capabilities revealed:** Expo Go QR dev workflow, fast refresh / HMR, EAS Build CI/CD pipeline, TestFlight distribution, safe area handling (Dynamic Island, notch variants).

---

### Journey Requirements Summary

| Journey | Capabilities Required | FRs |
|---|---|---|
| J1 — Maria, calm route | Acoustic routing engine, RUMEUR live overlay, mid-route reroute, route share | FR-005–013, FR-014–019 |
| J2 — Maria, ambient agent | Push notifications (RUMEUR-triggered), NLQ w/ spatial context, personalization memory | FR-020–024, FR-025–029 |
| J3 — Maxime, B2B | B2B auth, acoustic dashboard, PDF certified export, Stripe billing | FR-030–035 |
| J4 — Sophie, degraded | RUMEUR fallback, offline-aware routes, data status indicator, auto-resume | FR-013, FR-019 |
| J5 — IVAN, dev | Expo Go workflow, HMR, EAS Build CI/CD, TestFlight, safe area handling | FR-001–004, FR-042–044 |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Acoustic-Weighted Routing**
Tacet V3 introduces **serenity as a first-class routing cost function** — the routing engine (turf.js IRIS adjacency graph for walking, OSRM/GraphHopper for longer paths) weights street segments by PPBE Lden and live RUMEUR readings. No competitor routes pedestrians by acoustic quality.

*Assumption challenged:* Navigation is about getting there fast → navigation is about arriving in the right state.
*Inspiration:* Citymapper "quieter streets" + Her Way (risk-aware routing without user configuration).

---

**2. `/api/enrich` — Zone Intelligence Agent (Story 6.0)**

The core ambient agent primitive. A server-side Route Handler assembles full zone context and calls Claude Haiku to produce a ranked, human-readable synthesis. It is the centralised reasoning layer for all contextual signals across the product.

**Request body:**
```
POST /api/enrich
{
  zone_code, zone_name, arrondissement,
  noise_level, day_level, night_level, score_serenite,
  current_iso_timestamp,
  intent?,          // "logement" | "calme_maintenant" | null
  rumeur_sensor?,   // { leq, distanceM } | null
  nearby_chantiers?,// { count, nearestDistanceM } | null
  recent_reports?   // count in last hour | null
}
```

**Response schema:**
```
{
  summary: string,          // 1–2 sentences, French, mobile-readable
  primary_signal: "rumeur" | "chantier" | "reports" | "score" | "night",
  secondary_signal?: same,
  confidence: "high" | "low", // low = UI falls back to default rendering
  cachedAt: ISO timestamp
}
```

**Example outputs:**

| Input context | Summary |
|---|---|
| Score 72, night 58 dB, no live data | "Zone résidentielle calme. Les niveaux nocturnes restent modérés — bon signal pour un logement." |
| Score 31, Rumeur 71 dB at 200m, 3 reports | "Bruit élevé en ce moment. Capteur à 200 m relevait 71 dB — probablement lié à l'activité du quartier ce soir." |
| Score 58, 2 chantiers, intent=logement | "Score moyen, mais 2 chantiers actifs à proximité. À vérifier : leurs dates de fin avant de signer." |
| Score 85, no signals | "L'une des zones les plus calmes de Paris. Données cohérentes jour et nuit." |

**Cost/latency profile:**
- Model: `claude-haiku-4-5-20251001` — hardcoded, no upgrade without cost review
- Target latency: < 800ms server-side (fires in parallel with RUMEUR/Chantiers fetches)
- Cache key: `enrich-${zone_code}-${Math.floor(Date.now() / 900_000)}-${intent ?? 'none'}` (15-min TTL)
- Graceful degradation: if call fails or exceeds 1.5s → IrisPopup renders current default template unchanged
- Feature flag: `NEXT_PUBLIC_ENABLE_ENRICHMENT` (off by default, on in staging)

**What it unlocks:** Stories 6.1–6.4 pass signal data through the agent rather than building separate UI logic. The IrisPopup design sprint only needs to solve one problem: render `{ summary, primary_signal, secondary_signal }` beautifully.

---

**3. Sentiment-Aware Ambient Push Alerts (Story 6.4)**

Push trigger logic is deterministic (RUMEUR delta rule: zone score improves ≥ 10 pts vs. 7-day rolling average, or ≥ 3 micro-reports in 1 hour for pinned zones). The notification copy is generated by `/api/enrich` with `intent: "ambient_push"`. Sentiment calibrates to context:

- Quiet window opening → inviting, warm ("Ce matin, ton quartier respire")
- Noise spike → calm, informative, non-alarming ("Niveau inhabituel détecté — probablement temporaire")
- Chantier start → practical ("Un chantier commence rue de la Roquette lundi. Tes trajets matin ajustés.")

*The LLM is never the trigger. It is the voice.* Trigger logic stays server-side and deterministic.

---

**4. NLQ on Structured Civic Data**
"Café calme sous 55 dB près de République avec Wi-Fi" — a spatial query against Bruitparif + OSM POI + live RUMEUR. `/api/enrich` with `intent: "nlq"` handles semantic formatting after the structured spatial query resolves a candidate set. The LLM translates intent → structured query → formatted result. The data is ground truth.

---

**5. Time-Aware Signal Weighting (Story 6.1 — highest priority, zero new UI)**
The app knows what time it is. Night scores silently weight `night_level` dB more heavily 20h–6h. RUMEUR readings contextualised ("now" vs "from this morning"). Chantiers with `date_fin` in the past filtered. No toggle, no setting — automatic.

---

**6. Intent Layer — Session Personalisation (Story 6.2)**
One-tap intent on first zone popup: **un logement / un endroit calme maintenant / à m'informer**. localStorage-persisted, no login required. Feeds `intent` into `/api/enrich` for every subsequent call in the session.

---

**7. Expo/RN Bridge: Solo-Founder Mobile Velocity**
Expo Go → EAS Build applied to a geospatial + live-sensor + AI-enriched app. 70%+ business logic shared between Next.js PWA and RN. Solo founder ships native mobile without a separate tech stack.

### Inspiration References

| Reference | What Tacet steals |
|---|---|
| **Aino** (urban planning agent) | Agent decides which signals matter; UI only renders the selected output — not every possible combination |
| **Her Way** (Sze Wai Law-Lis) | Route-level serenity; time-of-day as silent first-class signal; proactive alternatives without configuration |
| **Dark Sky** (acquired Apple 2020) | Hyperlocal + proactive + no dashboard; "usually vs right now" made beautiful; push via SW for zones of interest |
| **Foursquare / ambient location** | "Usually calm · Busier than usual right now" framing — historic vs live not presented as equivalent |
| **Citymapper** | Route as primary product primitive, not zone; intent-based routing |

### Priority Order (Epic 6)

| Priority | Story | Rationale |
|---|---|---|
| 1 | 6.1 Time-aware weighting | Zero new UI, immediate value, uses existing data |
| 2 | 6.0 `/api/enrich` agent | Solves information presentation architecturally; unblocks design sprint |
| 3 | Design sprint (IrisPopup) | Scoped: render `{ summary, primary_signal, secondary_signal }` — not every signal combo |
| 4 | 6.2 Intent layer | Feeds `intent` into agent; highest personalisation leverage |
| 5 | 6.3 Proactive alternatives | Agent surfaces alternatives in summary |
| 6 | 6.4 Push alerts | High value; requires permission UX care |
| 7 | 6.5 Route serenity | Highest complexity + differentiation |

### Market Context & Competitive Landscape

| Competitor | Gap Tacet Fills |
|---|---|
| Citymapper | Routes by transit/speed; no acoustic layer; no ambient agent |
| Google Maps | Routes by speed/distance; no noise data; no NLQ |
| AirParif | Air quality only; no routing; no NLQ; B2G-oriented UI |
| Bruitparif (direct) | Raw technical data; no consumer UX; no routing; no mobile app |
| Ambiciti (withdrawn ~2023) | Market vacancy confirmed — B2C noise-intelligence uncontested |

### Validation Approach

| Innovation | Method | Success Signal |
|---|---|---|
| `/api/enrich` quality | NLQ tap rate; push retention | NLQ ≥ 85% session→interaction; push ≥ 40% retention |
| Acoustic routing | A/B calm vs fastest — post-arrival satisfaction | ≥ 60% prefer calm for leisure/errands |
| Time-aware weighting | Session depth on evening vs morning usage | +15% zone popup dwell time 20h–22h |
| Sentiment push alerts | Push opt-out rate at 7 days | < 10% opt-out |
| B2B certified report | First paying customer within 60 days | 1 customer ≥ 50€/month |

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Haiku hallucination | All values passed as structured context; Haiku formats only; `confidence: "low"` triggers fallback |
| Push notification fatigue | Max 1/day/user; sentiment calibration avoids alarm tone; easy off-switch |
| `/api/enrich` latency > 1.5s | Non-blocking — IrisPopup renders default immediately; enrichment updates when ready |
| LLM cost scaling | 15-min cache per `(zone_code, hour_bucket, intent)`; Haiku tier ~$0.0004/call |
| NLQ empty results | Fallback to structured search UI; sessions logged for prompt tuning |
| IrisPopup visual overload | Design sprint gated before 6.1–6.4 UI implementation |

> **Reference:** `docs/planning/ambient-agentic-vision.md` is the canonical spec for Epic 6. Agent implementation rules 7–12 live there and apply to all stories in this epic.

## Mobile App Specific Requirements (React Native / Expo)

### Project-Type Overview

Cross-platform React Native app (iOS-first, Android-ready) distributed via Expo Go for development iteration and EAS Build for App Store submission. Shares business logic with the Next.js PWA at ≥ 70%.

### Platform Requirements

| Dimension | Spec |
|---|---|
| **Framework** | React Native via Expo SDK (latest stable) |
| **Primary target** | iOS 16+ (iPhone 12 and above) |
| **Secondary target** | Android 12+ (via EAS Build, post-MVP) |
| **Dev workflow** | Expo Go (QR scan → device in < 60s) |
| **Distribution** | EAS Build → TestFlight (beta) → App Store |
| **OTA updates** | EAS Update for JS-layer hotfixes post-submission |
| **Safe areas** | Dynamic Island, notch, home indicator — all handled via `react-native-safe-area-context` |
| **Screen sizes** | iPhone SE (375px) through iPhone 16 Pro Max (430px) as primary range |

### Device Permissions

| Permission | When Requested | Rationale |
|---|---|---|
| `location when in use` | Before first route planning action | Route A→B, NLQ spatial context |
| `location always` | Only when ambient agent explicitly enabled by user, with explanation screen before system prompt | Background RUMEUR monitoring |
| `push notifications` | After first value moment (first route completed or first NLQ result) | Ambient agent alerts |
| `background app refresh` | Ambient agent opt-in flow | Quiet window detection |

All permission rationale strings in `Info.plist` must be specific and honest — reviewed before first App Store submission. Privacy manifest (`PrivacyInfo.xcprivacy`) required.

### Offline Mode

- **Route planning:** Cached PPBE static tile data enables offline route scoring; RUMEUR layer degrades gracefully to "données historiques"
- **Map tiles:** PMTiles pre-cached via Serwist (Paris intra-muros coverage)
- **Saved routes:** Persisted locally; acoustic scores from last sync shown with timestamp
- **NLQ / `/api/enrich`:** Requires connectivity — offline state shows graceful "mode hors-ligne" indicator, NLQ disabled

### Push Strategy

- **Provider:** Expo Push Notification service (APNs for iOS, FCM for Android)
- **Trigger source:** Server-side cron job (Vercel cron) evaluating RUMEUR delta vs. 7-day rolling average and micro-report accumulation per pinned zone
- **Copy generation:** `/api/enrich` with `intent: "ambient_push"` — sentiment-calibrated French copy
- **Cadence cap:** Maximum 1 push/day/user regardless of trigger count
- **Opt-out:** Single toggle in app settings; permission revocable at OS level
- **Deep link:** Each notification deep-links to the relevant zone in the map

### App Store Compliance

- No IDFA usage
- All location use clearly described in App Store listing and `Info.plist`
- Privacy manifest complete before submission
- TestFlight external beta review before public submission
- Age rating: 4+ (no user-generated content in MVP)

## Web App Specific Requirements (Next.js PWA)

### Browser Matrix

| Browser | Support Level |
|---|---|
| Chrome 120+ | Full |
| Firefox 120+ | Full |
| Safari 17+ (macOS + iOS) | Full — critical path for PWA install on iOS |
| Edge 120+ | Full |
| Samsung Internet 23+ | Supported |
| IE / legacy | Not supported |

Mobile Safari is the highest-priority target — PWA install on iOS requires Safari. All interactive features tested on iOS Safari first.

### Responsive Design

- **Breakpoints:** Mobile-first; `sm` 640px / `md` 768px / `lg` 1024px (Tailwind defaults)
- **Primary design target:** 375px (iPhone SE) — all layouts must be thumb-navigable at this width
- **Map interaction:** Full-screen map on mobile; sidebar panel on ≥ 768px
- **IrisPopup:** Bottom sheet on mobile; floating card on desktop
- **NLQ input:** Full-width bottom bar on mobile; top search bar on desktop

### Performance Targets

Web PWA performance targets are formalized in NFR-P1 through NFR-P7. Quick reference:

| Metric | Target | NFR |
|---|---|---|
| LCP (mobile 4G) | < 2.0s | NFR-P3 |
| FID / INP | < 100ms | NFR-P3 |
| CLS | < 0.1 | NFR-P3 |
| Lighthouse Performance | ≥ 90 | NFR-P5 |
| Lighthouse Accessibility | ≥ 95 | NFR-P5 |
| Initial JS bundle | < 250 KB | NFR-P4 |
| PMTiles initial load | < 1.5s (Paris intra-muros) | NFR-P4 |
| `/api/enrich` response | < 800ms (server-side, cached at 15 min) | NFR-P1 |

### SEO Strategy

Minimal — Tacet is an interactive map application, not a content-indexable site. Static metadata only:
- `<title>` and `<meta description>` per route
- `og:image` for share cards (zone Score Sérénité snapshot)
- `robots.txt` allows indexing of landing page; disallows map/app routes
- No server-side rendering of zone data for SEO — all map content is client-rendered

### Accessibility Level

RGAA 4.1 (superset of WCAG 2.1 AA) — formalized in NFR-A1 through NFR-A5. Lighthouse accessibility ≥ 95 enforced in CI; Score Sérénité colour scale contrast ≥ 4.5:1 against all background variants.

## SaaS B2B Specific Requirements

### Tenant Model

**Single-tenant lite** for MVP — no org/team management. Each B2B customer is an individual account (email + password). Growth feature: team seats and shared report library.

### Permission Model (RBAC)

| Role | Capabilities |
|---|---|
| **Free (B2C)** | Map access, zone scores, NLQ queries, route planning, ambient agent |
| **B2B Subscriber** | All Free + acoustic dashboard, certified PDF export, address history, API rate limit increase |
| **Admin (internal)** | Customer management, billing override, usage monitoring |

Gate enforcement: server-side on all B2B Route Handlers — never client-side only.

### Subscription Tiers

| Tier | Price | Features |
|---|---|---|
| **Free** | €0 | Full B2C feature set; NLQ limited to 10 queries/day |
| **B2B Pro** | €99/month | Unlimited queries; acoustic dashboard; certified PDF export (unlimited); address history; priority support |
| **B2B Enterprise** | €200/month (custom) | Multi-address batch export; API access; white-label report option; SLA |

Billing via **Stripe** — subscription creation, webhook events (payment success/failure/churn), invoice PDF download.

### Integration List

| Integration | Purpose | Priority |
|---|---|---|
| Stripe | B2B subscription billing + webhook events | MVP |
| Claude API (Haiku) | `/api/enrich`, NLQ formatting, ambient push copy | MVP |
| Bruitparif RUMEUR | Live sensor data (TAC-28 pending) | MVP (with fallback) |
| Expo Push Service | iOS/Android push notification delivery | MVP |
| EAS Build | CI/CD for RN app builds | MVP |
| Photon Komoot | Geocoding (address → coordinates) | MVP |
| OSRM / GraphHopper | Pedestrian routing engine | Growth (Story 6.5) |

### Compliance Requirements

- RGPD data subject rights: deletion flow, data export, consent log
- B2B invoices: VAT-compliant (French entity)
- Stripe data processing agreement signed
- B2B certified reports: disclaimer "à titre informatif — ne constitue pas un acte réglementaire"

## Domain-Specific Requirements

### Compliance & Regulatory

**Open Data Licensing**
- All PPBE-derived acoustic data is published under **ODbL (OpenStreetMap) + Etalab licence ouverte** — attribution required in all user-facing views and B2B exports
- Bruitparif RUMEUR API use is subject to a **bilateral TAC** (pending TAC-28 resolution) — production use requires signed data sharing agreement; mock/fallback mandatory until then
- Any OSM-derived routing data (OSRM/GraphHopper) must respect **ODbL attribution** in route views and exported materials

**Privacy (RGPD / GDPR)**
- Location data (saved zones, route history, ambient agent triggers) is **sensitive personal data under RGPD Art. 9** — explicit opt-in consent required before first location access
- Ambient agent push notifications require **granular permission scoping** (iOS: location always/while-using, push notification, background refresh)
- NLQ queries containing location references must not be stored in identifiable form beyond session without explicit user consent
- B2B user data (email, company, billing) subject to standard RGPD data subject rights — deletion flow required
- **Data minimisation principle:** collect only what's needed per session; no passive location tracking unless ambient agent explicitly enabled by user

**Accessibility (RGAA / WCAG 2.1 AA)**
- Web PWA: RGAA 4.1 compliance required (French government standard, superset of WCAG 2.1 AA)
- React Native app: iOS VoiceOver support required for all navigation-critical screens (route start/stop, NLQ input, zone score display)
- Score Sérénité colour scale must pass contrast ratio ≥ 4.5:1 against all background variants
- All push notification copy must be understandable without visual context (screen-reader compatible)

**EU Noise Directive**
- Directive 2002/49/CE — any acoustic data displayed must include a **methodology disclaimer** clarifying data source, collection period, and limitations (PPBE cycle vintage, sensor density)
- B2B certified reports must explicitly cite the directive and note that Tacet data is informative, not legally binding for permit/regulatory purposes

**EU AI Act (NLQ / Ambient Agent)**
- NLQ and ambient agent use an LLM inference layer — classifiable as **limited-risk AI system** under EU AI Act (Art. 52) requiring **transparency disclosure** ("Vous interagissez avec un système IA")
- NLQ must surface its data sources in results ("basé sur PPBE 2024 + RUMEUR en direct")
- No automated decision-making with legal/significant effects — NLQ results are advisory only

### Technical Constraints

**Security**
- `BRUITPARIF_API_KEY` and any LLM API keys (Claude/OpenAI) must remain **server-side only** — never bundled in RN app or web client
- B2B auth: email + password minimum; TOTP 2FA as growth feature; JWT short-lived tokens (< 1h) with refresh rotation
- PDF certified export: server-side generation only; signed with timestamp; no client-side PDF construction
- Stripe webhook validation required (signature verification on all billing events)

**Location & Push Permissions (iOS)**

See Mobile App / Device Permissions for the full permission request matrix (FR-037–039). Formalized in NFR-S1 (server-side key handling) and NFR-I2 (push delivery constraints).

**Data Provenance**
- Every acoustic score displayed must be traceable to: data source (PPBE cycle N / RUMEUR sensor ID) + collection date + licence
- B2B reports must include a provenance chain: raw Bruitparif data → PPBE processing → Tacet Score Sérénité methodology → report timestamp

### Integration Requirements

**Routing Engine**
- OSRM or GraphHopper (open-source, self-hostable or managed) for pedestrian routing — acoustic weighting applied as custom cost function on street segments
- OpenStreetMap data for street network (ODbL) — must be kept updated (monthly refresh minimum for Paris intra-muros)
- Routing must handle Paris-specific constraints: pedestrian zones, riverbanks, passages couverts, park interior paths

**Bruitparif RUMEUR API (TAC-28)**
- On resolution: server-side proxy via Next.js Route Handler with 3-minute cache
- Fallback: graceful degradation to PPBE static data with visible status indicator
- SLA: no hard dependency on RUMEUR for routing availability — static data path must always work

**LLM (NLQ & Ambient Agent)**
- NLQ: structured prompt → LLM → parsed response → map render pipeline
- LLM provider must offer EU data residency option (RGPD compliance) — prefer Claude API (Anthropic) or a EU-hosted alternative
- Ambient agent trigger logic runs server-side (cron + RUMEUR data delta) — LLM used only for notification copy generation, not trigger logic itself

**App Store (iOS / EAS Build)**
- Privacy manifest (`PrivacyInfo.xcprivacy`) required for any API usage declared to Apple (location, push, network)
- App Store review: location use description strings must be specific and honest
- No use of IDFA (Identifier for Advertisers) — Tacet has no ad network integration

### Risk Mitigations

| Risk | Mitigation |
|---|---|
| TAC-28 RUMEUR API blocked | Static PPBE fallback always operational; mock data for dev; graceful UI indicator |
| iOS location permission denied | Route planner works with manual address input; ambient agent disabled gracefully |
| LLM hallucination in NLQ results | Results always sourced from structured Tacet data — LLM formats, does not invent; source citation mandatory |
| EU AI Act compliance gap | Transparency banner on first NLQ use; results labelled "informatif, non contractuel" |
| App Store rejection (privacy) | Privacy manifest complete; permission rationale strings reviewed pre-submission; TestFlight beta review first |
| B2B report used as legal evidence | Disclaimer on every report: "à titre informatif — ne constitue pas un acte réglementaire" |
| ODbL attribution omission | Attribution component in map footer and PDF footer is non-removable |

## Functional Requirements

### Mobile App Foundation

- **FR-001:** A user can install and run the Tacet mobile app on an iOS device via Expo Go by scanning a QR code
- **FR-002:** A user can install and run the Tacet mobile app on an iOS device via TestFlight
- **FR-003:** The system produces a production iOS app via EAS Build CI/CD without manual intervention
- **FR-004:** A user can navigate all core app screens using iOS VoiceOver

### Acoustic Map & Zone Intelligence

- **FR-005:** A user can view an interactive map of Paris displaying all 992 IRIS zones with their Score Sérénité
- **FR-006:** A user can select an IRIS zone and view its acoustic profile (score, day/night levels, data source and vintage)
- **FR-007:** The system displays time-appropriate acoustic signals based on the current hour without user configuration
- **FR-008:** The system enriches a selected zone with a contextual narrative summary via `/api/enrich` when the enrichment feature flag is enabled
- **FR-009:** A user can set a session intent (logement / calme maintenant / s'informer) that shapes which signals are emphasised for the duration of the session
- **FR-010:** The system displays a proactive quieter zone alternative when the selected zone scores below Score 40 and a quieter alternative exists within 500m
- **FR-011:** A user can view the nearest live RUMEUR sensor reading in a zone popup when a sensor is within 1km
- **FR-012:** A user can view active construction zones relevant to a selected IRIS zone
- **FR-013:** The system falls back to static PPBE data and displays a data-status indicator when live RUMEUR data is unavailable

### Calm Route Planning

- **FR-014:** A user can input an origin and destination address to request a calm pedestrian route
- **FR-015:** The system computes and displays a pedestrian route acoustically weighted by the Score Sérénité of IRIS zones traversed
- **FR-016:** A user can view the composite serenity score and estimated travel time for a computed route
- **FR-017:** The system proposes a mid-route detour when a live noise spike is detected along the active route
- **FR-018:** A user can share a computed calm route
- **FR-019:** A user can save a calm route for future reference

### Ambient Agent & Push Intelligence

- **FR-020:** A user can opt in to ambient push notifications for saved or pinned zones
- **FR-021:** The system sends a push notification when a statistically significant acoustic change is detected in a user's pinned zone
- **FR-022:** The system generates push notification copy in French calibrated to the sentiment of the acoustic event (quiet window vs. noise spike vs. construction start)
- **FR-023:** A user can configure notification frequency and disable push notifications from within the app
- **FR-024:** A push notification deep-links the user directly to the relevant zone in the map

### Natural Language Query

- **FR-025:** A user can submit a natural language query in French to find places or zones matching acoustic and contextual criteria
- **FR-026:** The system returns a ranked, mapped result set for a valid NLQ query within the acoustic dataset
- **FR-027:** Each NLQ result displays its acoustic score, distance from the query origin, and data source citation
- **FR-028:** The system displays a transparency disclosure on a user's first NLQ interaction indicating that AI is involved in result generation
- **FR-029:** The system falls back to structured search when an NLQ query returns no results

### B2B Reports & Billing

- **FR-030:** A B2B user can create an account and authenticate with email and password
- **FR-031:** A B2B user can view an acoustic dashboard for a specified Paris address combining PPBE historical data and RUMEUR live readings
- **FR-032:** A B2B user can export a certified PDF acoustic report for a specified address
- **FR-033:** A certified PDF report includes data source attribution (Bruitparif, PPBE cycle, Etalab licence), methodology disclaimer, and generation timestamp
- **FR-034:** A B2B user can subscribe to a paid tier and manage their subscription via Stripe
- **FR-035:** The system restricts acoustic dashboard access and PDF export to authenticated B2B subscribers

### Data Compliance & Attribution

- **FR-036:** The system displays ODbL/Etalab data attribution in all views presenting acoustic or routing data
- **FR-037:** The system presents a specific, honest rationale before requesting device location access
- **FR-038:** The system requests background location permission only when a user explicitly enables the ambient agent
- **FR-039:** The system requests push notification permission only after the user has completed a first value interaction (route completed or first NLQ result)
- **FR-040:** All acoustic data views include a methodology disclaimer noting data source, collection period, and limitations
- **FR-041:** A user can request deletion of their account and all associated personal data

### Developer Workflow

- **FR-042:** A developer can load the latest app code on a physical iOS device via Expo Go in under 60 seconds from a cold start
- **FR-043:** The system hot-reloads UI changes on connected Expo Go devices without requiring a full rebuild
- **FR-044:** The CI/CD pipeline produces a TestFlight-ready build from a main branch push in under 15 minutes

## Non-Functional Requirements

### Performance

- **NFR-P1:** `/api/enrich` responds within 800ms server-side when called in parallel with RUMEUR/chantier fetches; IrisPopup falls back to default rendering if response exceeds 1,500ms
- **NFR-P2:** Calm route computation completes within 4 seconds of route form submission for any A→B within Paris intra-muros
- **NFR-P3:** Web PWA Core Web Vitals: LCP < 2.0s on mobile 4G; INP < 100ms; CLS < 0.1
- **NFR-P4:** Web PWA initial JS bundle < 250 KB; PMTiles Paris intra-muros tile layer initial load < 1.5s
- **NFR-P5:** Lighthouse Performance ≥ 90; Lighthouse Accessibility ≥ 95 — enforced in CI via `lighthouserc.js` budget
- **NFR-P6:** App loads on a physical iOS device via Expo Go within 60 seconds cold start; UI hot-reloads after a file save within 2 seconds
- **NFR-P7:** NLQ query → structured spatial result → LLM formatting → map render total < 3 seconds

### Security

- **NFR-S1:** All API secrets (`ANTHROPIC_API_KEY`, `BRUITPARIF_API_KEY`, Stripe keys) remain server-side only — never bundled in the RN app binary or any client-side JS bundle
- **NFR-S2:** B2B auth uses short-lived JWTs (< 1h expiry) with refresh token rotation; no long-lived session tokens
- **NFR-S3:** All Stripe webhook events validated via HMAC signature verification before any processing occurs
- **NFR-S4:** B2B-gated Route Handlers enforce subscription status server-side on every request — no client-side gating
- **NFR-S5:** Certified PDF reports generated server-side only; no client-side PDF construction at any tier
- **NFR-S6:** All user data transmitted via HTTPS/TLS; no plaintext storage of passwords or API keys at rest
- **NFR-S7:** NLQ queries referencing identifiable location data are not persisted beyond the session without explicit, separate user consent

### Reliability

- **NFR-R1:** Zone score display and static-data route planning must succeed when RUMEUR API is fully unavailable — no RUMEUR dependency on the critical render path
- **NFR-R2:** `/api/enrich` failure (timeout, 5xx, network error) must not block IrisPopup render — default template visible within 300ms of zone selection regardless of enrichment status
- **NFR-R3:** Scheduled ambient push jobs must be idempotent — re-running the same cron window must not deliver duplicate push notifications to any user
- **NFR-R4:** EAS Update OTA deploys must not break offline-cached routes — backward-compatible JS updates only; breaking changes require a full EAS Build

### Scalability

- **NFR-SC1:** System sustains 10× user growth from MVP baseline without architectural change — Vercel serverless auto-scaling is the primary mechanism; no pre-provisioned capacity
- **NFR-SC2:** `/api/enrich` calls capped via a 15-minute cache keyed on `(zone_code, hour_bucket, intent)` — cache hit rate ≥ 80% at sustained load expected
- **NFR-SC3:** NLQ free tier rate-limited to 10 queries/day/user enforced server-side; B2B Pro and Enterprise tiers exempt

### Accessibility

- **NFR-A1:** Web PWA meets **RGAA 4.1** (superset of WCAG 2.1 AA) for all user-facing screens
- **NFR-A2:** iOS app: all navigation-critical screens (route input, NLQ input, zone popup, settings) are fully navigable via **VoiceOver** without requiring visual context
- **NFR-A3:** Score Sérénité colour scale achieves contrast ratio **≥ 4.5:1** against all background variants used in the UI
- **NFR-A4:** All push notification body copy is intelligible without visual context (screen-reader compatible)
- **NFR-A5:** Lighthouse Accessibility ≥ 95 enforced in CI; any PR that degrades this score below threshold is blocked from merge

### Integration Reliability

- **NFR-I1:** RUMEUR API degradation triggers static PPBE fallback and status indicator within 5 seconds; the fallback path must be covered by integration tests
- **NFR-I2:** Expo Push / APNs delivery includes retry logic for failed sends; push cadence cap of **1 push/day/user** enforced server-side regardless of trigger count
- **NFR-I3:** EAS Build CI/CD produces a signed, TestFlight-ready IPA within **15 minutes** of a main branch push; build failure triggers alert to IVAN
- **NFR-I4:** App Store submission requires Privacy manifest (`PrivacyInfo.xcprivacy`) complete and all `Info.plist` location usage strings reviewed — enforced as a pre-submission checklist step

### Compliance

- **NFR-C1:** ODbL/Etalab attribution component is non-removable in all data views and all PDF export templates; removal triggers a build lint error
- **NFR-C2:** RGPD data deletion requests processed within **30 days** of submission; deletion covers account, location history, route history, and NLQ session logs
- **NFR-C3:** EU AI Act Art. 52 transparency disclosure shown on first NLQ session per device — shown once, persisted in `localStorage`
- **NFR-C4:** No IDFA (Identifier for Advertisers) usage anywhere in the RN app — verified pre-submission
- **NFR-C5:** B2B certified PDF reports include disclaimer "à titre informatif — ne constitue pas un acte réglementaire" in a non-removable footer
