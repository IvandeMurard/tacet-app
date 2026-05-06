---
status: ready
createdAt: '2026-03-06'
inputDocuments:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/stories/story-*.md
  - docs/planning/research/technical-research.md
  - docs/planning/research/market-research.md
totalStoryPoints: 103
totalStories: 28
blockedStories: 3
readyStories: 25
---

# Tacet V2 — Consolidated Sprint Backlog

**Created:** 2026-03-06
**Project:** Tacet V2 (open-source map migration, PWA, real-time data layers)
**Deadline:** Q2 2026 (elections window: March 15-22, 2026)

---

## Elections-Window Scope Assessment

**Paris municipal elections:** March 15 & 22, 2026 (9 days from today).

The elections sprint was a **V1 deliverable** (Baromètre, editorial elections content, V1 map) that has already shipped. V2 is a post-elections technical foundation rebuild. The market research Go-to-Market phases confirm:

- **Phase 1 (Elections Sprint):** V1 features — already delivered (Baromètre, `/elections`, `/barometre`, SearchBar, IrisPopup)
- **Phase 2 (Post-Elections Growth, April-June 2026):** V2 foundation — MapLibre migration, PWA, CI/CD
- **Phase 3 (Distribution Expansion, July-December 2026):** V2 completion — real-time layers, IDF expansion

**V2 Sprint V2.1 starts after elections.** No V2 stories are elections-blocking. The V1 app at tacet.vercel.app serves the elections window. V2 work proceeds on its own timeline.

---

## Pre-Sprint Prerequisites

| ID | Task | Status | Notes |
|----|------|--------|-------|
| PREREQ-1 | `iris-centroids.geojson` generation | **DONE** | 332 KB valid GeoJSON with 992 IRIS Point features, properties include `code_iris`, `name`, `c_ar`, `noise_level`, `coordinates`. Located at `tacet/public/data/iris-centroids.geojson`. |
| PREREQ-2 | E2E test infrastructure (Playwright + Vitest) | **DONE** | `playwright.config.ts`, `vitest.config.ts`, `.github/workflows/ci.yml` all exist. 6 E2E spec files (15 tests), 1 unit test file. `@playwright/test` ^1.49.0, `vitest` ^2.1.0 installed. |
| PREREQ-3 | TAC-28 Bruitparif API access | **BLOCKED** | External dependency. Blocks TAC-35 (RUMEUR stories 3.1-3.3 only). All other work proceeds independently. |

---

## Sprint V2.1 — Foundations (4 weeks)

**Goal:** Replace Mapbox with MapLibre + PMTiles, establish CI/CD pipeline with Lighthouse guards. The map renders on the open-source stack with Score Dots and zone selection working.

**Capacity:** 23 story points | 6 stories | All ready

| # | Story | TAC | Epic | Priority | SP | Depends | Status |
|---|-------|-----|------|----------|----|---------|--------|
| 1.1 | MapLibre GL JS migration and map container | TAC-29 | Epic 1 | must | 5 | — | ready |
| 1.2 | PMTiles protocol and base map tiles | TAC-30 | Epic 1 | must | 3 | 1.1 | ready |
| 1.3 | IRIS Score Dots layer and zone selection | TAC-29 | Epic 1 | must | 5 | 1.1, 1.2 | ready |
| 1.4 | Zone highlight and boundary on selection | TAC-29 | Epic 1 | must | 2 | 1.1, 1.3 | ready |
| 1.5 | CI/CD pipeline and unit tests | TAC-31 | Epic 1 | must | 5 | — | ready |
| 1.6 | Lighthouse CI budget guards | TAC-32 | Epic 1 | must | 3 | 1.5 | ready |

**Implementation sequence:**
1. **1.1** + **1.5** in parallel (no dependencies — map migration and CI setup)
2. **1.2** after 1.1 (PMTiles needs MapLibre)
3. **1.6** after 1.5 (Lighthouse needs CI pipeline)
4. **1.3** after 1.1 + 1.2 (Score Dots need map + tiles)
5. **1.4** after 1.3 (highlight needs zone selection)

**Sprint V2.1 exits when:** MapLibre renders Paris with Score Dots, zone selection works, CI pipeline runs lint + unit tests + build + Lighthouse on every PR.

---

## Sprint V2.2 — Core UX + PWA (3 weeks)

**Goal:** Deliver the core user experience (address search, IrisPopup, zone comparison), PWA installation, and offline support. Maria's J1 journey is complete end-to-end.

**Capacity:** 40 story points | 12 stories | All ready

| # | Story | TAC | Epic | Priority | SP | Depends | Status |
|---|-------|-----|------|----------|----|---------|--------|
| 2.1 | Photon Komoot geocoding and SearchBar | TAC-34 | Epic 2 | must | 5 | — | ready |
| 2.2 | IrisPopup auto-reveal and Score display | TAC-38 | Epic 2 | must | 3 | 1.3 | ready |
| 2.3 | Data vintage, disclaimer, methodology link | TAC-39 | Epic 2 | must | 2 | 2.2 | ready |
| 2.4 | Native share and ShareCard | TAC-40 | Epic 2 | must | 3 | 2.2 | ready |
| 2.5 | Zone pin and ComparisonTray (max 3) | TAC-41 | Epic 2 | must | 5 | 2.2 | ready |
| 2.6 | SerenityBar, TierBadge, DataProvenance | TAC-42 | Epic 2 | should | 2 | 2.2 | ready |
| 4.1 | Serwist service worker and precache | TAC-33 | Epic 4 | must | 5 | 1.1 | ready |
| 4.2 | Offline last-visited zone and runtime caching | TAC-33 | Epic 4 | must | 3 | 4.1, 2.2 | ready |
| 4.3 | PWA install prompt and offline banner | TAC-33 | Epic 4 | should | 2 | 4.1 | ready |
| 4.4 | Manifest, icons, and installability | TAC-33 | Epic 4 | must | 2 | 4.1 | ready |
| 5.3 | Legal notice, attributions, privacy policy | TAC-47 | Epic 5 | must | 3 | — | ready |
| 5.5 | RGPD compliance and zero third-party tracking | TAC-49 | Epic 5 | must | 2 | 5.3 | ready |
| 3.6 | Barometre du Silence page (V2 rebuild) | TAC-44 | Epic 3 | must | 3 | — | ready |

**Implementation sequence:**
1. **2.1** + **4.1** + **5.3** + **3.6** in parallel (no V2.1 dependencies beyond 1.1/1.3)
2. **2.2** after 1.3 lands (IrisPopup needs zone selection)
3. **4.4** + **4.3** after 4.1 (PWA manifest and install prompt need service worker)
4. **2.3** + **2.4** + **2.5** + **2.6** after 2.2 (all extend IrisPopup)
5. **4.2** after 4.1 + 2.2 (offline zone needs both SW and popup)
6. **5.5** after 5.3 (RGPD needs legal pages)

**Sprint V2.2 exits when:** Maria can search an address, see Score Serenite, share it, pin zones, and install the PWA. Offline mode works with last-visited zone cached. Legal/privacy pages live.

---

## Sprint V2.3 — Data Layers + Quality (4 weeks)

**Goal:** Add real-time and contextual data layers (Chantiers, RUMEUR if unblocked, Elections), complete accessibility, E2E test coverage, and feedback forms.

**Capacity:** 40 story points | 10 stories | 7 ready, 3 blocked (TAC-28)

| # | Story | TAC | Epic | Priority | SP | Depends | Status |
|---|-------|-----|------|----------|----|---------|--------|
| 3.4 | Chantiers API proxy and Chantiers layer | TAC-36 | Epic 3 | must | 5 | 1.1 | ready |
| 3.5 | Chantiers limitation disclosure + Elections layer | TAC-43 | Epic 3 | should | 3 | 3.4 | ready |
| 3.1 | RUMEUR API proxy and server-side cache | TAC-35 | Epic 3 | must | 3 | — | **BLOCKED** (TAC-28) |
| 3.2 | useRumeurData hook and RUMEUR layer on map | TAC-35 | Epic 3 | must | 5 | 3.1, 1.1 | **BLOCKED** (TAC-28) |
| 3.3 | RUMEUR timestamp and stale/unavailable indicator | TAC-35 | Epic 3 | must | 2 | 3.2 | **BLOCKED** (TAC-28) |
| 5.1 | TextAlternativeView (keyboard-navigable table) | TAC-45 | Epic 5 | must | 5 | 1.3 | ready |
| 5.2 | Full keyboard navigation and focus management | TAC-46 | Epic 5 | must | 5 | 2.2 | ready |
| 5.4 | Feedback and B2B contact forms | TAC-48 | Epic 5 | should | 3 | — | ready |
| 5.6 | E2E Playwright scenarios (>= 10) | TAC-37 | Epic 5 | must | 5 | 1.5 | ready |
| — | Expand unit test coverage (>= 80% critical) | TAC-31 | Epic 5 | must | 4 | 1.5 | ready |

**Note on RUMEUR:** If TAC-28 resolves during V2.2 or V2.3, stories 3.1-3.3 (10 SP) are pulled in. If still blocked at V2.3 end, they defer to V2.4 with mock data and graceful degradation already in place.

**Implementation sequence:**
1. **3.4** + **5.1** + **5.4** + **5.6** in parallel
2. **3.5** after 3.4 (Elections layer needs Chantiers base)
3. **5.2** after 2.2 (focus management needs IrisPopup)
4. **3.1** → **3.2** → **3.3** when TAC-28 unblocks (sequential chain)

**Sprint V2.3 exits when:** Chantiers layer works, accessibility meets RGAA >= 95, >= 10 E2E scenarios pass in CI, contact forms functional. RUMEUR conditional on TAC-28.

---

## Summary

| Sprint | Weeks | Stories | Story Points | Blocked | Key Deliverable |
|--------|-------|---------|--------------|---------|-----------------|
| **V2.1** | 4 | 6 | 23 | 0 | MapLibre + PMTiles + CI/CD + Lighthouse |
| **V2.2** | 3 | 13 | 40 | 0 | Core UX (search, score, share, pin) + PWA + legal |
| **V2.3** | 4 | 10 | 40 | 3 | Data layers + accessibility + E2E + forms |
| **Total** | **11** | **28+1** | **103+4** | **3** | Full V2 delivery |

**Velocity assumption:** Solo developer, ~10 SP/week sustainable.

### Blocked Items (TAC-28 Bruitparif API)

| Story | SP | Impact |
|-------|----|--------|
| 3.1 RUMEUR API proxy | 3 | Server-side route handler |
| 3.2 RUMEUR layer + hook | 5 | Map layer + SWR polling |
| 3.3 RUMEUR stale indicator | 2 | UI timestamp/status |
| **Total blocked** | **10** | Defers to V2.4 if unresolved by V2.3 end |

### Priority Distribution

| Priority | Stories | Story Points |
|----------|---------|--------------|
| must | 24 | 91 |
| should | 4 | 10 |
| **Total** | **28** | **101** |

---

## Sprint V2.1 Readiness Checklist

- [x] **Product Brief** — complete
- [x] **PRD** — complete, validated 5/5
- [x] **UX Design Specification** — complete (14 steps)
- [x] **Architecture Decision Document** — complete (8 steps, all PASS)
- [x] **Epics Breakdown** — complete (5 epics, 37 FRs mapped)
- [x] **Story Specifications** — complete (28 stories with acceptance criteria)
- [x] **Project Context** — complete (agent onboarding doc)
- [x] **iris-centroids.geojson** — generated (332 KB, 992 IRIS Point features)
- [x] **E2E infrastructure** — Playwright config, 6 spec files, CI workflow exist
- [x] **Unit test infrastructure** — Vitest config, 1 test file exists
- [x] **CI/CD workflow** — `.github/workflows/ci.yml` with lint, test, e2e, lighthouse jobs
- [x] **Elections-window scope** — confirmed V1 serves elections; V2 is post-elections

**Status: SPRINT V2.1 IS READY TO START.**
