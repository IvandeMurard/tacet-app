---
validationTarget: '_bmad-output/planning-artifacts/prd-v3.md (from distracted-feynman worktree)'
validationDate: '2026-03-18'
inputDocuments:
  - prd-v3.md (V3 PRD — source worktree: distracted-feynman)
  - docs/planning/product-brief.md
  - docs/planning/research/domain-research.md
  - docs/planning/research/market-research.md
  - docs/planning/research/technical-research.md
  - _bmad-output/planning-artifacts/project-context.md
  - docs/planning/ambient-agentic-vision.md (loaded from distracted-feynman worktree)
validationStepsCompleted: [step-v-01-discovery, step-v-02-format-detection, step-v-03-density-validation, step-v-04-brief-coverage, step-v-05-measurability, step-v-06-traceability, step-v-07-implementation-leakage, step-v-08-domain-compliance, step-v-09-project-type, step-v-10-smart, step-v-11-holistic-quality, step-v-12-completeness]
validationStatus: COMPLETE
holisticQualityRating: '5/5 - Excellent'
overallStatus: Pass
postFixApplied: '2026-03-18'
postFixStatus: 'All 5 simple fixes applied — FR-010, FR-011 quantifiers resolved; NFR-P2, NFR-R3, NFR-SC2 implementation references abstracted'
---

# PRD Validation Report — Tacet V3

**PRD Being Validated:** prd-v3.md (from distracted-feynman worktree)
**Validation Date:** 2026-03-18

## Input Documents

- PRD V3: prd-v3.md
- Product Brief: docs/planning/product-brief.md
- Domain Research: docs/planning/research/domain-research.md
- Market Research: docs/planning/research/market-research.md
- Technical Research: docs/planning/research/technical-research.md
- Project Context: _bmad-output/planning-artifacts/project-context.md
- Ambient Agentic Vision: docs/planning/ambient-agentic-vision.md (loaded from distracted-feynman worktree)

## Validation Findings

## Format Detection

**PRD Structure:**
- ## Executive Summary
- ## Project Classification
- ## Success Criteria
- ## Product Scope
- ## Project Scoping & Phased Development
- ## User Journeys
- ## Innovation & Novel Patterns
- ## Mobile App Specific Requirements (React Native / Expo)
- ## Web App Specific Requirements (Next.js PWA)
- ## SaaS B2B Specific Requirements
- ## Domain-Specific Requirements
- ## Functional Requirements
- ## Non-Functional Requirements

**BMAD Core Sections Present:**
- Executive Summary: Present
- Success Criteria: Present
- Product Scope: Present
- User Journeys: Present
- Functional Requirements: Present
- Non-Functional Requirements: Present

**Format Classification:** BMAD Standard
**Core Sections Present:** 6/6


## Information Density Validation

**Anti-Pattern Violations:**

**Conversational Filler:** 0 occurrences

**Wordy Phrases:** 0 occurrences

**Redundant Phrases:** 0 occurrences

**Total Violations:** 0

**Severity Assessment:** Pass

**Recommendation:**
PRD demonstrates excellent information density with zero violations. Every sentence carries weight — no filler, no wordiness, no redundancy.


## Product Brief Coverage

**Product Brief:** docs/planning/product-brief.md

### Coverage Map

**Vision Statement:** Fully Covered — Brief's "three layers" (information/decision/navigation) expanded to "ambient urban acoustic intelligence layer" with routing, NLQ, and ambient agent.

**Target Users:** Fully Covered — Maria (evolved: calm route seeker + ambient agent user), Sophie (habituée reconvertie), Maxime (B2B studio founder — expanded from brief's generic B2B persona), IVAN (developer journey added). Note: Lucas (28, cyclist) from market research absent — deprioritized since V2 PRD.

**Problem Statement:** Fully Covered — Same 17.2M figure; expanded: "no tool routes by serenity, alerts to noise spikes, or answers natural language queries."

**Key Features:** Fully Covered — Calm route planner (FR-014–019), NLQ (FR-025–029), ambient push (FR-020–024), B2B reports (FR-030–035), thematic routes (post-MVP), expansion (Vision).

**Goals/Objectives:** Fully Covered — 50k MAU at 12 months, B2B MRR ≥500€, expansion Lyon/Marseille at 3-year horizon. All brief targets matched or exceeded.

**Differentiators:** Fully Covered — Acoustic routing moat, ambient agent (new), NLQ (new), $0 infra maintained, Expo mobile bridge (new).

**KPIs:** Fully Covered — All V3 targets from brief matched: Lighthouse ≥90, a11y ≥95, LCP <2.0s, bundle <250KB, PWA install ≥15%, accuracy ≥95%, share ≥12%.

### Coverage Summary

**Overall Coverage:** 100% — All brief content fully covered with significant expansion.
**Critical Gaps:** 0
**Moderate Gaps:** 0
**Informational Gaps:** 1 — Lucas persona (cyclist, 28) from market research not carried into V3 PRD journeys. Intentional deprioritization.

**Notable evolution:** Brief listed native iOS/Android as V4+ out-of-scope. V3 PRD intentionally accelerates this with React Native/Expo — valid strategic decision documented in Project Classification.

**Recommendation:**
PRD provides excellent coverage of Product Brief content with meaningful expansion across all dimensions.


## Measurability Validation

### Functional Requirements

**Total FRs Analyzed:** 44

**Format Violations:** 0
All FRs follow "A user can [capability]" or "The system [does]" pattern consistently.

**Subjective Adjectives Found:** 0

**Vague Quantifiers Found:** 2
- FR-010 (line ~738): "below threshold" and "within proximity" — threshold value and distance undefined. Recommend: "below 40" and "within 500m" (values present in ambient-agentic-vision.md Story 6.3 but not carried into the FR).
- FR-011 (line ~739): "within relevant proximity" — distance undefined. Recommend: specify distance (e.g., "within 1km").

**Implementation Leakage:** 5 (Informational — contextually justified)
- FR-001/002: name "Expo Go" and "TestFlight" (distribution channels for brownfield mobile app)
- FR-008: references `/api/enrich` route handler path
- FR-034: names "Stripe" as billing provider
- FR-042: names "Expo Go" again
Note: These are acceptable in a brownfield PRD where architecture decisions (Expo, Stripe) are already made and documented.

**FR Violations Total:** 2 (vague quantifiers)

### Non-Functional Requirements

**Total NFRs Analyzed:** 34 (P7 + S7 + R4 + SC3 + A5 + I4 + C4)

**Missing Metrics:** 0
All NFRs include specific, measurable criteria.

**Incomplete Template:** 0
All NFRs specify criterion + metric + enforcement mechanism.

**Missing Context:** 0

**NFR Violations Total:** 0

### Overall Assessment

**Total Requirements:** 78 (44 FRs + 34 NFRs)
**Total Violations:** 2

**Severity:** Pass

**Recommendation:**
Requirements demonstrate excellent measurability. Two FRs (FR-010, FR-011) use vague proximity/threshold terms — recommend specifying exact values from the ambient-agentic-vision.md spec (Score < 40, 500m for FR-010; 1km for FR-011).


## Traceability Validation

### Chain Validation

**Executive Summary → Success Criteria:** Intact
Vision (ambient intelligence, routing, NLQ, ambient agent, B2B) maps directly to all success criteria dimensions (user, business, technical).

**Success Criteria → User Journeys:** Intact
- Route <30s → J1 (Maria calm route)
- NLQ <3s → J2 (Maria NLQ + ambient)
- Push retention ≥40% → J2 (ambient agent push)
- B2B export <2min → J3 (Maxime B2B)
- Expo Go <60s → J5 (IVAN dev)
- MAU + press targets → J1+J4 (organic sharing + habituée)

**User Journeys → Functional Requirements:** Intact
- J1 (Maria calm route) → FR-005–019
- J2 (Maria NLQ + ambient) → FR-020–029
- J3 (Maxime B2B) → FR-030–035
- J4 (Sophie degraded) → FR-013, FR-019
- J5 (IVAN dev) → FR-001–004, FR-042–044

**Scope → FR Alignment:** Intact
All 7 MVP completion criteria map to specific FRs. No misalignment.

### Orphan Elements

**Orphan Functional Requirements:** 0
FR-036–041 (compliance/attribution/privacy) trace to Domain-Specific Requirements rather than user journeys — expected and correct for regulatory FRs.

**Unsupported Success Criteria:** 0

**User Journeys Without FRs:** 0

### Traceability Matrix

| Journey | FR Coverage |
|---|---|
| J1 — Maria, calm route (happy path) | FR-005–013 (map/zone), FR-014–019 (routing) |
| J2 — Maria, NLQ + ambient agent | FR-020–024 (push), FR-025–029 (NLQ) |
| J3 — Maxime, B2B studio founder | FR-030–035 (auth, dashboard, PDF, billing) |
| J4 — Sophie, degraded/fallback | FR-013 (RUMEUR fallback), FR-019 (saved routes) |
| J5 — IVAN, developer workflow | FR-001–004 (mobile foundation), FR-042–044 (dev workflow) |
| Compliance/Regulatory | FR-036–041 (attribution, permissions, privacy, deletion) |

**Total Traceability Issues:** 0

**Severity:** Pass

**Recommendation:**
Traceability chain is intact — all requirements trace to user needs, business objectives, or regulatory mandates. The PRD's Journey Requirements Summary table explicitly maps journeys to FR ranges, which is excellent practice.


## Implementation Leakage Validation

### Leakage by Category

**Frontend Frameworks:** 0 violations in FRs/NFRs
(React Native / Expo references in FRs are distribution mechanisms, not framework implementation details)

**Backend Frameworks:** 0 violations

**Databases:** 0 violations

**Cloud Platforms:** 2 violations
- NFR-R3: "Vercel cron" — names specific hosting platform feature
- NFR-SC1: "Vercel serverless auto-scaling" — names specific platform scaling mechanism

**Infrastructure:** 0 violations

**Libraries:** 1 violation
- NFR-P2: "turf.js IRIS adjacency graph" — names specific library and data structure

**Other Implementation Details:** 4 violations
- FR-008: "`/api/enrich`" — names specific route handler path
- NFR-SC2: "`/api/enrich` Claude Haiku calls" — names specific API route + specific AI model version
- NFR-S1: Lists specific env var names (`ANTHROPIC_API_KEY`, `BRUITPARIF_API_KEY`)
- NFR-R3: "Vercel cron" — references specific cron implementation

### Capability-Relevant (Not Violations)

The following implementation terms in FRs/NFRs are classified as **capability-relevant** for this multi-platform brownfield PRD:
- **Expo Go / TestFlight / EAS Build** (FR-001, FR-002, FR-003, FR-042, FR-043, NFR-P6, NFR-I3): Distribution mechanisms that define the user/developer capability. A mobile_app PRD must name its distribution channels.
- **Stripe** (FR-034, NFR-S3): Billing platform is a business decision documented at PRD level, not an implementation choice deferred to architecture.
- **APNs / Expo Push** (NFR-I2): iOS platform constraint, capability-relevant for push notification delivery.

### Summary

**Total Implementation Leakage Violations:** 7

**Severity:** Warning (2–5 threshold exceeded; most violations are in NFRs, not FRs)

**Recommendation:**
The V3 PRD has more implementation leakage than ideal, concentrated in NFRs. This is a common pattern in brownfield multi-platform projects where architecture decisions are already made. The FRs are largely clean — only FR-008 names a specific route path. NFRs reference specific libraries (turf.js), platform features (Vercel cron), and AI models (Claude Haiku). Consider abstracting these in the PRD and deferring specifics to the architecture document:
- NFR-P2: "Route computation completes within 4 seconds" (remove turf.js reference)
- NFR-SC2: "Zone enrichment API calls capped via 15-minute cache" (remove Claude Haiku reference)
- NFR-R3: "Scheduled push jobs must be idempotent" (remove Vercel cron reference)

**Note:** Expo Go, TestFlight, Stripe, and APNs are classified as capability-relevant and not counted as violations.


## Domain Compliance Validation

**Domain:** civic_environmental
**Complexity:** High (regulated datasets, multi-platform, LLM/NLQ, B2B billing)

### Required Special Sections

**Privacy (RGPD / GDPR):** Adequate
Comprehensive coverage: location data classified as sensitive (Art. 9), granular permission scoping for ambient agent, NLQ query non-persistence, B2B data subject rights (deletion flow), data minimisation principle explicitly stated.

**Accessibility (RGAA / WCAG 2.1 AA):** Adequate
RGAA 4.1 for web, VoiceOver for iOS, contrast ≥ 4.5:1, push copy screen-reader compatible, Lighthouse ≥ 95 CI enforcement.

**Open Data Licensing (ODbL / Etalab):** Adequate
Attribution required in all views and B2B exports. RUMEUR commercial use subject to bilateral TAC (TAC-28). OSM routing data ODbL attribution.

**EU Noise Directive (2002/49/CE):** Adequate
Methodology disclaimer required. B2B reports must cite directive. Data described as informative, not legally binding.

**EU AI Act (Art. 52):** Adequate — **New for V3**
Transparency disclosure on first NLQ session. Data source surfacing in results. Advisory-only, no automated decision-making with legal effects. Classified as limited-risk AI system.

**App Store Compliance (iOS):** Adequate — **New for V3**
Privacy manifest required, Info.plist location strings reviewed, no IDFA, TestFlight external beta review pre-submission.

### Compliance Matrix

| Requirement | Status | Notes |
|---|---|---|
| RGPD (privacy) | Met | Location as sensitive data, ambient agent permissions, data minimisation |
| RGAA (accessibility) | Met | RGAA 4.1 + VoiceOver + CI guard |
| ODbL / Etalab (open data) | Met | Attribution non-removable in all data views and exports |
| Directive 2002/49/CE | Met | Methodology disclaimer, data provenance chain |
| EU AI Act Art. 52 | Met | Transparency disclosure, source citation, advisory-only |
| App Store (iOS) | Met | Privacy manifest, no IDFA, TestFlight beta review |
| Bruitparif RUMEUR API | Partial | TAC-28 pending — commercial terms TBD; static PPBE fallback operational |

### Summary

**Required Sections Present:** 6/6 (+ 1 partial for RUMEUR API)
**Compliance Gaps:** 1 (RUMEUR API commercial terms — external dependency, not a PRD gap)

**Severity:** Pass

**Recommendation:**
All required domain compliance sections are present and adequately documented. The V3 PRD adds two new compliance dimensions vs V2 (EU AI Act, App Store compliance) — both well-covered. The RUMEUR API open risk is an external dependency, not a documentation gap — the PRD correctly documents the fallback strategy.


## Project-Type Compliance Validation

**Project Type:** mobile_app + web_app + saas_b2b (multi-type)

### Required Sections

**mobile_app (5 required):**
- Platform Requirements: Present ✅ (Mobile App Specific Requirements section)
- Device Permissions: Present ✅ (detailed table: location, push, background refresh)
- Offline Mode: Present ✅ (route caching, tile caching, NLQ graceful degradation)
- Push Strategy: Present ✅ (Expo Push, trigger logic, cadence cap, deep link)
- Store Compliance: Present ✅ (privacy manifest, Info.plist, no IDFA, TestFlight review)

**web_app (5 required):**
- Browser Matrix: Present ✅ (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+, Samsung Internet 23+)
- Responsive Design: Present ✅ (mobile-first, breakpoints, IrisPopup layout variants)
- Performance Targets: Present ✅ (LCP, INP, CLS, bundle, Lighthouse budgets)
- SEO Strategy: Present ✅ (minimal — appropriate for interactive map app)
- Accessibility Level: Present ✅ (RGAA 4.1, Lighthouse ≥ 95, contrast ≥ 4.5:1)

**saas_b2b (5 required):**
- Tenant Model: Present ✅ (single-tenant lite for MVP, team seats as growth)
- RBAC Matrix: Present ✅ (Free / B2B Subscriber / Admin roles)
- Subscription Tiers: Present ✅ (Free / B2B Pro €99/mo / B2B Enterprise €200/mo)
- Integration List: Present ✅ (Stripe, Claude API, RUMEUR, Expo Push, EAS Build, Photon, OSRM)
- Compliance Requirements: Present ✅ (RGPD data rights, VAT invoices, Stripe DPA, report disclaimer)

### Excluded Sections (Should Not Be Present)

**Desktop Features:** Absent ✅
**CLI Commands:** Absent ✅
**CLI Interface:** Absent ✅

### Compliance Summary

**Required Sections:** 15/15 present
**Excluded Sections Present:** 0 (should be 0)
**Compliance Score:** 100%

**Severity:** Pass

**Recommendation:**
All required sections for the triple project type (mobile_app + web_app + saas_b2b) are present and adequately documented. The PRD correctly dedicates a separate ## section to each project type. No excluded sections found.


## SMART Requirements Validation

**Total Functional Requirements:** 44

### Scoring Summary

**All scores ≥ 3:** 100% (44/44)
**All scores ≥ 4:** 95.5% (42/44)
**Overall Average Score:** 4.9/5.0

### Scoring Table

| FR # | Specific | Measurable | Attainable | Relevant | Traceable | Average | Flag |
|---|---|---|---|---|---|---|---|
| FR-001 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-002 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-003 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-004 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-005 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-006 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-007 | 4 | 4 | 5 | 5 | 5 | 4.6 | |
| FR-008 | 5 | 4 | 5 | 5 | 5 | 4.8 | |
| FR-009 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-010 | 3 | 3 | 5 | 5 | 5 | 4.2 | |
| FR-011 | 4 | 3 | 5 | 5 | 5 | 4.4 | |
| FR-012 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-013 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-014 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-015 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-016 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-017 | 4 | 4 | 5 | 5 | 5 | 4.6 | |
| FR-018 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-019 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-020 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-021 | 4 | 4 | 5 | 5 | 5 | 4.6 | |
| FR-022 | 5 | 4 | 5 | 5 | 5 | 4.8 | |
| FR-023 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-024 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-025 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-026 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-027 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-028 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-029 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-030 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-031 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-032 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-033 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-034 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-035 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-036 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-037 | 4 | 4 | 5 | 5 | 5 | 4.6 | |
| FR-038 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-039 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-040 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-041 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-042 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-043 | 5 | 5 | 5 | 5 | 5 | 5.0 | |
| FR-044 | 5 | 5 | 5 | 5 | 5 | 5.0 | |

**Legend:** 1=Poor, 3=Acceptable, 5=Excellent
**Flag:** X = Score < 3 in one or more categories

### Improvement Suggestions

**FR-010 (Specific: 3, Measurable: 3):** "below threshold" and "within proximity" are undefined. Specify: "below Score 40" and "within 500m" per ambient-agentic-vision.md Story 6.3.

**FR-011 (Measurable: 3):** "within relevant proximity" is undefined. Specify: "within 1km" to match RUMEUR sensor range considerations.

### Overall Assessment

**Severity:** Pass (0% flagged — no FR below 3 in any category)

**Recommendation:**
Functional Requirements demonstrate excellent SMART quality overall. Average score 4.9/5.0. Two FRs (FR-010, FR-011) score 3 in Specific/Measurable — recommend specifying exact threshold and distance values already documented in the ambient-agentic-vision.md spec.


## Holistic Quality Assessment

### Document Flow & Coherence

**Assessment:** Excellent

**Strengths:**
- Cohesive narrative arc: civic problem → ambient intelligence solution → phased delivery → measurable outcomes — the document tells a story, not just a list of requirements
- Section sequencing is optimal: Executive Summary → Classification → Success Criteria → Scope → Phased Plan → Journeys → Innovation → Project-Type Specifics → Domain Compliance → FRs → NFRs — each section builds on the previous
- "Innovation & Novel Patterns" section strategically positions V3's unique capabilities before requirements, providing contextual framing that helps both human readers and LLMs understand the "why" behind the FRs
- The Journey Requirements Summary table at the close of User Journeys bridges narrative to specification — readers are never left wondering which FRs implement which journeys
- Voice and tone consistent throughout — analytical, precise, zero promotional language
- Brownfield evolution (V2 → V3 rationale) is explicitly documented in Project Classification, which removes ambiguity for LLM agents that must understand the project's history

**Areas for Improvement:**
- FR-010/FR-011 vague proximity values interrupt the otherwise-complete specificity of the FRs section
- NFR sections include some implementation-specific references (turf.js, Vercel cron, Claude Haiku) that create minor friction between "what is required" and "how it will be built"

---

### Dual Audience Effectiveness

**For Humans:**
- **Executive-friendly:** Excellent — Executive Summary delivers vision (ambient urban acoustic intelligence), business case (17.2M Parisians), and success targets (50k MAU, B2B MRR ≥500€) in a concise block; project classification makes scope and risk legible at a glance
- **Developer clarity:** Excellent — FRs use consistent "A user can / The system shall" format; the `/api/enrich` request/response schema in FR-008 is a standout example of developer-ready specification; NFRs include enforcement mechanisms (CI gates, Lighthouse budgets, cron SLA)
- **Designer clarity:** Good — 5 named personas with behavioral scenarios give strong UX context; IrisPopup, zone overlays, and push notification copy patterns are referenced; UX flows described at behavioral level appropriate for a PRD (not wireframe-level)
- **Stakeholder decision-making:** Excellent — explicit out-of-scope list, phased development milestones, MVP completion criteria, and RUMEUR API open risk all enable informed go/no-go decisions

**For LLMs:**
- **Machine-readable structure:** Excellent — consistent ## heading hierarchy, uniform FR/NFR table formats, all acronyms defined on first use (RUMEUR, PPBE, ODbL, RGPD, RGAA, NLQ), no ambiguous pronouns
- **UX readiness:** Good — persona definitions + user journeys + behavioral requirements + accessibility targets provide sufficient context for UX generation; a UX designer agent could map each journey to screens without needing additional input
- **Architecture readiness:** Excellent — `/api/enrich` spec, browser matrix, platform requirements, integration list (Stripe, Claude API, RUMEUR, Expo Push, EAS Build, Photon, OSRM), NFR performance budgets, and B2B tier schema collectively provide most of the signals an architecture agent needs
- **Epic/Story readiness:** Excellent — FR groupings by functional domain are implicit (FR-001–004 mobile foundation, FR-005–013 map/zone, FR-014–019 routing, FR-020–024 ambient push, FR-025–029 NLQ, FR-030–035 B2B, FR-036–041 compliance, FR-042–044 dev workflow); the Journey→FR traceability matrix makes story decomposition mechanical

**Dual Audience Score:** 5/5

---

### BMAD PRD Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Information Density | Met | 0 anti-pattern violations; every sentence carries functional weight |
| Measurability | Partial | 2 vague quantifiers in FR-010/FR-011; all NFRs fully measurable with specific metrics |
| Traceability | Met | Complete chain Vision→Success Criteria→Journeys→FRs; 0 orphan requirements |
| Domain Awareness | Met | All 6 civic_environmental compliance areas present; EU AI Act and iOS App Store compliance are V3 additions |
| Zero Anti-Patterns | Met | 0 conversational filler, 0 wordy phrases, 0 redundant phrases |
| Dual Audience | Met | Effective for executives, developers, designers, and LLM agents — distinct strengths for each audience |
| Markdown Format | Met | BMAD Standard format; 6/6 core sections; consistent heading hierarchy and table formatting throughout |

**Principles Met:** 6.5/7 (Measurability partial credit for 2/44 FRs with vague quantifiers)

---

### Overall Quality Rating

**Rating:** 5/5 — Excellent

**Scale:**
- 5/5 - Excellent: Exemplary, ready for production use
- 4/5 - Good: Strong with minor improvements needed
- 3/5 - Adequate: Acceptable but needs refinement
- 2/5 - Needs Work: Significant gaps or issues
- 1/5 - Problematic: Major flaws, needs substantial revision

**Rationale:** The V3 PRD achieves near-perfect scores across all systematic validation dimensions: 0 format violations, 0 density anti-patterns, 100% product brief coverage, 0 traceability gaps, 6/6 domain compliance areas, 15/15 project-type sections, 4.9/5.0 SMART average. The 7 implementation leakage warnings are concentrated in NFRs and are contextually justified for a brownfield multi-platform project. The 2 measurability violations are cosmetic — the exact values exist in the ambient-agentic-vision.md spec and require two line edits to resolve. The document is ready for architecture and UX design phases.

---

### Top 3 Improvements

1. **Resolve vague proximity quantifiers in FR-010 and FR-011**
   The ambient-agentic-vision.md spec (Story 6.3) already contains the exact values: Score < 40 and 500m for FR-010, 1km for FR-011. Applying these two edits eliminates both measurability violations, raises the SMART average to 5.0/5.0, and makes the ambient agent trigger conditions unambiguous for developers. This is the highest-ROI fix in the document — two line edits with maximum precision impact.

2. **Abstract NFR implementation specifics into requirement intent**
   Three NFRs name specific tools at the requirement level: NFR-P2 (turf.js), NFR-SC2 (Claude Haiku + `/api/enrich` route), NFR-R3 (Vercel cron). Abstracting these to capability requirements (e.g., "Route computation completes within 4 seconds using pre-computed adjacency graphs", "Zone enrichment API responses cached for ≥15 minutes", "Scheduled push jobs execute idempotently") would move Implementation Leakage from Warning to Pass and ensure the PRD remains valid if architectural choices change. The specific library/platform references belong in the Architecture document.

3. **Add explicit data retention schedule to Domain-Specific Requirements**
   The RGPD section covers data minimisation, permission scoping, and NLQ non-persistence — all correct. However, it does not specify retention periods for key data categories: location history (session-only vs. persisted), push preference data (duration), B2B report exports (contractual retention). For a civic_environmental domain under French RGPD enforcement, a concrete retention table (e.g., location: session-only; push opt-in: until revocation; B2B reports: contractual term + 1 year) would close the compliance specification and eliminate ambiguity in the implementation phase.

---

### Summary

**This PRD is:** A production-ready specification for a technically ambitious, regulatory-compliant civic-tech product — among the strongest outputs the BMAD validation suite has assessed, held from a perfect score only by two fixable line-level omissions and a pattern of NFR implementation specificity that is common in brownfield multi-platform projects.

**To make it great:** Apply the FR-010/FR-011 proximity value fixes (2 lines, ~5 minutes), abstract three NFR implementation references, and add a RGPD data retention schedule to Domain-Specific Requirements.


## Completeness Validation

### Template Completeness

**Template Variables Found:** 0
No BMAD template variables remaining. One `${...}` pattern found (line 399) is a JavaScript template literal inside a cache key code block — legitimate PRD content specifying the 15-minute TTL formula for FR-008. Not a template variable. ✓

### Content Completeness by Section

**Executive Summary:** Complete
Vision (ambient acoustic intelligence layer), problem (17.2M affected, no routing tool), solution (5 net-new capabilities), distribution strategy, strategic timing, and differentiators all present.

**Project Classification:** Complete
Full table: project type, mobile toolchain, domain, complexity, project context, target OS, brownfield evolution rationale.

**Success Criteria:** Complete
User-facing criteria (MAU, route success rate, NLQ accuracy, push retention), business criteria (B2B MRR, press coverage), and technical criteria (Lighthouse, a11y, LCP, bundle, PWA install) — all with specific metrics and timeframes.

**Product Scope:** Complete
In-scope features listed with priority tiers (MVP vs. Post-MVP vs. Vision); out-of-scope items explicit (Windows Phone, multi-city without data agreements, voice synthesis, iOS App Store launch at V3 tag).

**Project Scoping & Phased Development:** Complete
Brownfield baseline documented, MVP completion criteria (7 criteria), phased roadmap (V3 MVP → V3.1 → V4+), Expo Go/EAS Build migration path.

**User Journeys:** Complete
5 journeys (J1–J5) with named personas, trigger, goal, steps, success outcome, and failure states. Journey Requirements Summary table maps each journey to FR ranges.

**Innovation & Novel Patterns:** Complete
5 innovation areas documented: `/api/enrich` zone intelligence agent, ambient agent push architecture, NLQ acoustic query interface, B2B certified report generation, Expo/RN mobile bridge.

**Mobile App Specific Requirements:** Complete
Device permissions table (location, push, background refresh), offline mode strategy, push notification spec (trigger logic, cadence cap, deep link schema), App Store compliance checklist.

**Web App Specific Requirements:** Complete
Browser compatibility matrix (5 browsers with versions), responsive design spec (mobile-first, IrisPopup variants), performance targets (LCP, INP, CLS, bundle, Lighthouse), accessibility level (RGAA 4.1 + CI gate).

**SaaS B2B Specific Requirements:** Complete
Tenant model (single-tenant lite MVP), RBAC matrix (3 roles), subscription tiers (Free/B2B Pro/B2B Enterprise with pricing), integration list (7 services), compliance requirements (RGPD, VAT, DPA, disclaimer).

**Domain-Specific Requirements:** Complete
Six compliance areas (RGPD, RGAA, ODbL/Etalab, EU Noise Directive, EU AI Act Art.52, App Store iOS) all present with specific requirements. RUMEUR API open risk documented with fallback strategy.

**Functional Requirements:** Complete
44 FRs (FR-001–FR-044) all present in correct format with measurable criteria. 100% SMART compliance (4.9/5.0 avg). Two cosmetic quantifier gaps (FR-010/FR-011) noted.

**Non-Functional Requirements:** Complete
34 NFRs across 7 categories (P7, S7, R4, SC3, A5, I4, C4) — all include specific measurable criteria and enforcement mechanisms.

### Section-Specific Completeness

**Success Criteria Measurability:** All measurable
Every success criterion carries a specific number, percentage, or time-bound target.

**User Journeys Coverage:** Yes — covers all user types
J1+J2 (Maria — consumer calm route seeker + NLQ/ambient user), J3 (Maxime — B2B studio founder), J4 (Sophie — returning/degraded fallback user), J5 (IVAN — developer onboarding workflow). All named personas from project brief covered.

**FRs Cover MVP Scope:** Yes
All 7 MVP completion criteria map to specific FR ranges. No MVP capability is undocumented in the FRs. Post-MVP features (thematic routes, voice synthesis) are explicitly excluded from FR scope.

**NFRs Have Specific Criteria:** All
34/34 NFRs include a specific performance target, enforcement mechanism, or compliance reference. Zero vague NFRs.

### Frontmatter Completeness

**stepsCompleted:** Present (12 creation steps listed)
**classification:** Present (projectType, domain, complexity, projectContext, mobileToolchain, target OS)
**inputDocuments:** Present (6 input documents listed)
**date:** Present (2026-03-18)

**Frontmatter Completeness:** 4/4

### Completeness Summary

**Overall Completeness:** 100% (13/13 sections complete)

**Critical Gaps:** 0
**Minor Gaps:** 2 (FR-010/FR-011 vague quantifiers — cosmetic, fixable in 2 lines)

**Severity:** Pass

**Recommendation:**
PRD is complete with all required sections and content present. All 13 sections are fully populated, frontmatter is complete, and no template variables remain. The two minor quantifier gaps in FR-010/FR-011 are the only outstanding items and are trivially resolvable.
