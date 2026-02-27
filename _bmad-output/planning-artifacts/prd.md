---
stepsCompleted: [1, 2, "2b", "2c", 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
classification:
  projectType: web_app
  subtype: PWA
  domain: civic_environmental
  complexity: medium
  projectContext: brownfield
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-Tacet-2026-02-26.md
  - _bmad-output/planning-artifacts/research/market-Tacet-research-2026-02-25.md
  - _bmad-output/planning-artifacts/research/domain-Tacet-research-2026-02-25.md
  - _bmad-output/planning-artifacts/research/technical-Tacet-research-2026-02-25.md
workflowType: 'prd'
project_name: Tacet
briefCount: 1
researchCount: 3
brainstormingCount: 0
projectDocsCount: 0
---

# Product Requirements Document - Tacet

**Author:** IVAN
**Date:** 2026-02-26

---

## Executive Summary

Tacet is a mobile-first Progressive Web App (PWA) that transforms Paris's existing urban noise data — Bruitparif PPBE measurements across 992 IRIS zones, RUMEUR real-time sensor network, Open Data Paris APIs — into a calm, premium consumer companion. Raw acoustic data (Lden dB values) is converted into a human-readable Serenity Score (0–100), presented through a warm, white-space-dominant interface designed to reduce anxiety rather than amplify it.

**Target users:** Maria (36, future tenant — primary anchor persona), Sophie (42, mother — secondary). Core job-to-be-done: answer "Is this neighborhood calm enough for me?" in under 5 minutes, with sufficient confidence to act (sign a lease, choose a school route, plan a walk).

**Problem:** 17.2 million people in France are significantly disturbed by noise daily (ADEME/CNB 2024, social cost 155 Md€/yr). The data that could help them exists — Bruitparif PPBE maps, Open Data Paris APIs, RUMEUR sensor feeds — but is inaccessible: buried in administrative PDFs, rendered on technically-complex institutional portals (AirParif-style), absent from all consumer tools (Citymapper, PAP, SeLoger). The B2C market has been vacant since Ambiciti exited (~2023–2024).

**Current state (V1, brownfield):** Next.js 14 PWA deployed on Vercel. Delivered features: choropleth IRIS map (992 zones), Serenity Score, Silence Barometer, address geocoding (Mapbox), 2026 Elections thematic layer. V2 in progress: full migration to open-source stack (MapLibre GL JS + PMTiles + Serwist + Photon Komoot) eliminating all variable API costs — $0 at any scale.

**Strategic window:** Paris municipal elections 2026 — noise explicitly cited as a campaign issue by candidates. Tacet is the only consumer product making this data accessible and beautiful, positioned ahead of this inflection point.

### What Makes This Special

**Core insight:** The noise data is not the problem — the interface is. Bruitparif and Open Data Paris publish high-quality acoustic data. It is displayed on institutional portals that are dense, technical, and visually alarming. Tacet inverts the interface: same data sources, opposite emotional register. Where AirParif creates anxiety, Tacet creates clarity and serenity.

**Five structural advantages:**
1. **Only B2C app with Bruitparif real-time data** — RUMEUR network (85+ sensors, 3-min refresh). No consumer competitor has this integration.
2. **Score Sérénité** — Proprietary composite score (0–100) translating Lden dB into human-legible serenity. Removes the acoustic expertise barrier entirely.
3. **Calm-first UX category** — Warm tones, generous white space, Citymapper-grade information clarity without UI density. Unique aesthetic position in the environmental data space; the antithesis of AirParif.
4. **$0 permanent infrastructure** — MapLibre (MIT) + PMTiles (Protomaps) + Open Data Paris eliminates all variable tile and geocoding API costs. Financially sustainable at 200k users with zero marginal infrastructure cost.
5. **Founder domain depth** — Sonor (B2G, 2021–2023) built institutional noise diagnostics for municipalities, exposing the data landscape and its gaps. Tacet applies that domain knowledge directly to B2C, removing the 18-month institutional sales cycle that made B2G unscalable.

---

## Project Classification

| Dimension | Value |
|-----------|-------|
| **Project Type** | `web_app` — PWA, Next.js App Router (hybrid SSR + `'use client'` for MapLibre), mobile-first |
| **Domain** | Civic / Environmental — Open Data (ODbL, Etalab), RGPD, RGAA, Directive EU 2002/49/CE |
| **Complexity** | **Medium** — regulatory (RGPD + RGAA + ODbL licences) + geospatial (PMTiles, 992 IRIS zones, turf.js) + real-time (Bruitparif RUMEUR polling 3-min) |
| **Project Context** | **Brownfield** — V1 deployed on Vercel (production); V2 = open-source stack migration + real-time layer + PWA hardening |

---

## Success Criteria

### User Success

Primary persona (Maria, 36, future tenant): task completion — answer "Is this neighborhood calm enough for me?" in under 5 minutes, without requiring acoustic expertise or tutorial. The Score Sérénité (0–100) serves as the primary legibility mechanism.

- **Time-to-insight:** User arrives at a confident, actionable answer (lease, school route, walk) within 5 minutes of first session.
- **Legibility without friction:** Score Sérénité comprehensible without explanation — no tooltip or onboarding required to interpret a zone's serenity level.
- **Return intent:** User returns to Tacet before a second decision point (second apartment viewing, neighborhood comparison). Proxy signal: ≥ 2 sessions/user in first 30 days.
- **Organic share moment:** "I found this tool" sharing — target ≥ 5% of active users share a zone or score within 30 days.
- **Emotional register:** App perceived as calming, not alarming. Qualitative target: NPS ≥ 30 at V2 launch.

### Business Success

**3-month targets (V2 launch):**
- 500 weekly active users (WAU) — organic, no paid acquisition.
- Press mention in ≥ 2 Paris media covering elections 2026 urban noise angle.
- RUMEUR real-time layer live (TAC-35 complete, TAC-28 access granted by Bruitparif).

**12-month targets:**
- 10,000 monthly active users (MAU) — driven by elections 2026 media cycle.
- RUMEUR layer monetization gateway activated: premium/partnership model (B2G or sponsored data access — commercial terms TBD with Bruitparif).
- V3 B2B data revenue: ≥ 3 paying clients (studios, medical offices, coworking) at 50–200€/mo/client.

**Strategic success indicator:**
Tacet cited as the reference consumer tool for Paris urban noise data at the 2026 municipal elections moment.

### Technical Success

**Performance (Lighthouse CI budget guards):**
- Performance score ≥ 85 (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Accessibility score ≥ 95 (RGAA compliance baseline — enforced by CI)
- PWA: installable from browser, offline shell operational (Serwist)

**Infrastructure:**
- $0 variable API cost at any scale (MapLibre MIT + PMTiles Protomaps + Photon Komoot)
- RUMEUR polling: 3-minute refresh cadence, < 1s UI update on new sensor data
- Initial JS bundle < 300 KB gzipped

**Score Sérénité accuracy:**
Qualitative concordance audit on representative 50-IRIS sample: Tacet Score Sérénité vs Bruitparif PPBE Lden reference values. Target: ≥ 90% directional concordance (correct quiet/moderate/noisy/very-noisy ranking). Manual audit — conducted once at V2 launch, once after RUMEUR integration.

### Measurable Outcomes

| Metric | Target | Timeline | Source |
|--------|--------|----------|--------|
| WAU | 500 | V2 +3 months | Analytics |
| MAU | 10,000 | V2 +12 months | Analytics |
| Time-to-insight | < 5 min | At launch | UX testing |
| NPS | ≥ 30 | V2 +1 month | Survey |
| Lighthouse Performance | ≥ 85 | At launch | LHCI |
| Lighthouse Accessibility | ≥ 95 | At launch | LHCI |
| Bundle size (gzip) | < 300 KB | At launch | CI |
| Infrastructure cost | $0 variable | At launch | Infra |
| Score Sérénité concordance | ≥ 90% | V2 launch | Manual audit |
| B2B clients (V3) | ≥ 3 clients | +12 months | CRM |

**Regulatory milestones (required for MVP):**
- **RGPD** — Zero third-party cookies, no personal data collected without explicit consent, privacy policy in place → V2 launch
- **RGAA** — Lighthouse Accessibility ≥ 95 enforced by CI budget guard → V2 launch
- **ODbL + Etalab** — Bruitparif + Open Data Paris attribution displayed in UI and legal notice → V2 launch
- **Directive EU 2002/49/CE** — PPBE data correctly attributed, methodology documented → V2 launch

## Product Scope

### MVP — Minimum Viable Product

V2 deliverables (TAC-28→37) constitute the MVP:

- **TAC-29** — MapLibre GL JS migration (eliminates Mapbox variable costs)
- **TAC-30** — PMTiles pipeline: Tippecanoe + Vercel Blob CDN (−70% tile weight)
- **TAC-31** — CI/CD: Vitest + Playwright + GitHub Actions
- **TAC-32** — Lighthouse CI budget guard (Performance ≥ 85, Accessibility ≥ 95)
- **TAC-33** — PWA: Serwist offline shell + installable manifest
- **TAC-34** — Geocoding: Photon Komoot (free, no API key, OSM-based)
- **TAC-35** — Bruitparif RUMEUR real-time layer (3-min polling) *(blocked on TAC-28)*
- **TAC-36** — Construction sites layer (Open Data Paris API v2.1)
- **TAC-37** — E2E tests: Playwright ≥ 10 geospatial scenarios

**External blocker:** TAC-28 — Bruitparif API access agreement (urgent, required for TAC-35).

**Compliance baseline (non-negotiable for MVP):** RGPD + RGAA + ODbL/Etalab attribution.

*Sequencing rationale, dependencies, and risk mitigation for each TAC → see Project Scoping & Phased Development.*

### Growth Features (Post-MVP)

V3 — competitive differentiators beyond core use case:

- Calm route planner (quiet streets navigation across Paris)
- Thematic routes: nature, street art, gastronomy, coffee shops along low-noise paths
- Personal noise alerts (push notifications above user-defined dB threshold)
- RUMEUR SSE streaming — real-time server-sent events (requires Vercel Pro)
- Deck.gl heatmap overlay (RUMEUR sensor density)
- B2B data layer — certified noise reports for studios, medical, coworking (V3 revenue)

### Vision (Future)

V4+ — long-term differentiation and scale:

- Natural language query: "Find a quiet café near République under 55 dB" (LLM-powered)
- Community layer: user-reported noise events (Waze-for-noise model)
- City expansion: Lyon, Marseille, Brussels, Amsterdam (PMTiles scales at near-zero marginal cost)
- B2B SaaS at scale: municipal data licensing, real estate platform API, health/insurance sector
- Ambiciti successor: capture the B2C market segment vacated since their exit (~2023–2024)

---

## User Journeys

### Journey 1 — Maria: "Est-ce que cet appartement est dans un quartier calme ?"
*(Primary user — success path)*

**Opening Scene.** Maria, 36 ans, directrice de projet dans le 10e, reçoit une alerte SeLoger un mardi matin : un 2-pièces dans le 19e, rue de Crimée, dans son budget. Elle a visité 8 appartements en 3 semaines. Ce soir, elle a une seconde visite. Elle cherche sur Google Maps — rien de clair sur le bruit. Elle tombe sur Tacet via un article partagé sur Twitter.

**Rising Action.** Elle ouvre Tacet sur mobile. La carte charge en < 2s (PWA offline-capable). Elle tape "rue de Crimée, Paris 19" — autocomplétion en 3 lettres (Photon). La zone IRIS se colorie : Score Sérénité **72 / 100**. Elle voit : "Quartier majoritairement calme — axe Crimée animé en soirée, intérieur d'îlot protégé." Elle active RUMEUR : capteur rue de Riquet à 200m — 54 dB en temps réel. Elle capture l'écran, le partage à sa colocataire via WhatsApp.

**Climax.** Elle compare avec l'appartement précédent (rue du Faubourg du Temple, 10e) — Score 41/100, rouge chaud. La différence est immédiate, visuelle, sans lire un seul chiffre technique. Elle ne sait pas ce qu'est un Lden. Elle n'a pas besoin de le savoir.

**Resolution.** Elle confirme la visite. Elle revient sur Tacet 3 jours plus tard pour un appartement dans le 11e. Tacet est installé en PWA sur son écran d'accueil.

**Capabilities revealed:** Photon geocoding, choropleth IRIS Score Sérénité 0–100 lisible immédiatement, RUMEUR layer activable, partage natif mobile, PWA installable.

---

### Journey 2 — Maria: "Le quartier a changé — et maintenant ?"
*(Primary user — edge case / recovery)*

**Opening Scene.** Maria a signé son bail rue de Crimée 6 semaines plus tôt. Elle remarque depuis 2 semaines un bruit inhabituel en semaine, tôt le matin. Elle rouvre Tacet.

**Rising Action.** Score Sérénité toujours 72 — données PPBE annuelles, pas encore mises à jour. Mais elle active le layer "Chantiers" (TAC-36) : chantier de voirie déclaré depuis 3 semaines, 4 mois prévus, à 80m. Elle active RUMEUR : 68 dB à 06h30. Elle comprend : le Score statique ne reflète pas l'événementiel. Elle envoie un feedback via le formulaire footer.

**Climax.** Elle trouve l'information utile mais identifie une limite produit : le Score annuel ne capte pas les chantiers. L'interface est transparente sur cette limite — le layer Chantiers le révèle explicitement.

**Resolution.** Elle utilise Tacet comme monitoring continu, pas seulement décisionnel. Elle met en liste d'attente l'alerte push (V3) quand le capteur dépasse 65 dB.

**Capabilities revealed:** layer Chantiers (TAC-36), transparence limites Score, formulaire feedback, alerte push V3. **Failure mode identifié:** Score statique ne reflète pas l'événementiel — communication claire requise sur la nature annuelle des données PPBE.

---

### Journey 3 — Sophie: "Quelle école est dans le quartier le plus calme ?"
*(Secondary user — recurring use)*

**Opening Scene.** Sophie, 42 ans, cherche une école primaire hors secteur pour son fils (dérogation). Elle hésite entre 3 écoles dans des arrondissements différents. Critère principal : qualité de vie autour de l'école. Elle a entendu parler de Tacet via une réunion de parents d'élèves.

**Rising Action.** Sur son iPad, elle compare les zones IRIS : École A (15e, Score 68), École B (14e, Score 55, proche périphérique), École C (13e, Score 74). Elle consulte RUMEUR aux heures de sortie. Elle construit sa recommandation.

**Climax.** Elle présente à son conjoint : "Regarde, l'école du 13e est objectivement dans la zone la plus calme." L'argument chiffré + visuel clôt le débat familial en 3 minutes.

**Resolution.** Sophie revient sur Tacet tous les 2-3 mois pour monitoring. Elle recommande Tacet à 2 autres parents via WhatsApp de classe — usage récurrent et bouche-à-oreille organique.

**Capabilities revealed:** comparaison multi-zones fluide, usage récurrent (monitoring, pas seulement décisionnel), mobile + tablette, partage social.

---

### Journey 4 — Maxime: "Je veux intégrer les données Tacet dans notre outil PropTech"
*(API consumer / B2B V3 — technical user)*

**Opening Scene.** Maxime, 31 ans, CTO d'une startup PropTech, découvre Tacet via ProductHunt. Son outil manque d'une couche acoustique. Il cherche une API sur les données de bruit parisien.

**Rising Action.** Pas d'API publique documentée sur le site. Il contacte via le formulaire. IVAN répond en 48h : Score Sérénité par IRIS en JSON, mise à jour mensuelle, +RUMEUR temps réel si partnership. Maxime propose un pilot à 150€/mo.

**Climax.** Il intègre le Score Sérénité dans sa fiche espace : "Quartier : Score Sérénité 78/100 — données Tacet." Ses utilisateurs réagissent positivement dans les retours UX.

**Resolution.** Il renouvelle, passe à 200€/mo pour accès RUMEUR. Il devient client référence V3 B2B. Il mentionne Tacet dans un article Medium. → **Déclencheur d'un portail client dédié en V3.**

**Capabilities revealed:** API JSON IRIS (V3), documentation API publique, contact business, pricing transparent, portail client B2B (V3 — backlog TAC créé).

---

### Journey Requirements Summary

| Journey | Capabilities Clés |
|---------|-------------------|
| Maria — success | Photon geocoding, Score Sérénité immédiat, RUMEUR layer, partage natif, PWA |
| Maria — edge case | Layer Chantiers, transparence Score limites, feedback form, alerte push V3 |
| Sophie — récurrent | Comparaison multi-zones, monitoring récurrent, tablette, bouche-à-oreille |
| Maxime — B2B dev | API JSON IRIS, docs API, contact business, portail client V3 (backlog) |

**Note:** Pas de journey admin/ops pour V2 (produit solo-founder, ops = GitHub + Vercel). À revisiter en V3 si portail client B2B nécessite un dashboard de gestion.

---

## Domain-Specific Requirements

### Compliance & Regulatory

**RGPD (Règlement Général sur la Protection des Données)**
- Zero third-party cookies or tracking scripts in production
- IP addresses treated as personal data: server logs retention ≤ 30 days, no third-party log aggregation without DPA
- Analytics: RGPD-compliant tool only (Plausible Analytics — no GA4)
- Formulaire de contact: privacy notice required at submission point; data deleted on request
- No user accounts in V2 — minimal RGPD surface; architecture preserves this

**RGAA (Référentiel Général d'Amélioration de l'Accessibilité) — WCAG 2.1 Level AA**
- Lighthouse Accessibility ≥ 95 enforced by CI budget guard
- MapLibre WebGL map: text alternative required (keyboard-navigable list of IRIS zones + scores)
- Color palette: contrast ratio ≥ 4.5:1 for all text and Score Sérénité color gradients
- PWA manifest: `lang` attribute set to `fr`

**ODbL (Open Database License) — Bruitparif + Open Data Paris**
- Attribution displayed in UI footer and legal notice: "Données Bruitparif (CC-BY) + Open Data Paris (Etalab)"
- Derivative database (Tacet processed IRIS GeoJSON): must be distributed under ODbL if redistributed as a database
- B2B API output: distributes computed Score Sérénité (produced work, not raw database) — ODbL share-alike likely does not apply. **Legal review required before V3 B2B launch.**
- PMTiles tiles: are produced works (map renderings) → no ODbL share-alike obligation

**Directive EU 2002/49/CE (Environmental Noise Directive)**
- PPBE data correctly cited as source; Lden → Score Sérénité methodology documented in legal notice
- Disclaimer required in UI: "Données indicatives — Score Sérénité basé sur PPBE Lden (données annuelles). Non certifié pour usage réglementaire."
- Tacet must not be presented as a compliance tool

### Technical Constraints

**Data freshness & accuracy**
- PPBE data: annual update cycle — UI must display data vintage year prominently
- RUMEUR data: 3-minute polling — "Temps réel" label must include last-update timestamp
- Score Sérénité: clearly labeled as derived/indicative metric, not official measure

**Bruitparif RUMEUR API — commercial use rights (open risk)**
- TAC-28: API access negotiation pending. B2C free use with attribution assumed.
- **Open risk:** RUMEUR data resale for B2B V3 may require separate commercial license from Bruitparif.
- V3 B2B revenue model is conditional on Bruitparif permitting commercial redistribution — OR on B2B value proposition being built on Tacet's computed Score (not raw RUMEUR data). See Innovation section.
- Mitigation: raise commercial use question explicitly during TAC-28 negotiation.

**Privacy by design**
- No geolocation stored (geocoding = ephemeral, not persisted)
- No user session tracking without consent
- No third-party SDKs collecting telemetry

### Integration Requirements

| Integration | Type | License/Terms | Risk |
|-------------|------|---------------|------|
| Bruitparif PPBE | Static GeoJSON | ODbL — attribution required | Low |
| Bruitparif RUMEUR | REST API polling | Pending TAC-28 — commercial terms TBD | **High** |
| Open Data Paris (Chantiers) | REST API v2.1 | Etalab (permissive) | Low |
| Photon Komoot | REST geocoding | Open use — OSM-based | Low |
| PMTiles / Protomaps CDN | Tile serving | MIT | Low |
| MapLibre GL JS | Rendering | BSD-3 | None |
| data.gouv.fr BAN | Address geocoding | Etalab (permissive) | Low — evaluate V3 |

**data.gouv.fr — open data enrichment opportunity (V3)**
- Hosts Bruitparif PPBE datasets, INSEE IRIS demographics, Base Adresse Nationale (BAN)
- BAN may offer higher French address accuracy than Photon Komoot
- INSEE IRIS demographics could enrich Score Sérénité with population density context
- No MCP connector in registry — evaluation deferred to V3 technical research phase

### Risk Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Bruitparif RUMEUR commercial use denied | Medium | High (affects B2B V3) | Negotiate in TAC-28; structure B2B value on computed Score, not raw RUMEUR |
| ODbL share-alike applies to B2B API output | Medium | Medium | Legal review before V3; structure output as produced works |
| RGAA map accessibility fails audit | Medium | Medium | Text-alternative for map in V2; Lighthouse CI guard |
| PPBE data outdated (annual cycle) | Certain | Low | Vintage label in UI; RUMEUR as real-time complement |
| RGPD analytics gap | Low | Medium | Plausible from V2 launch, not GA4 |

---

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Interface Inversion — même données, registre émotionnel opposé**

Bruitparif, AirParif et les portails institutionnels publient des données acoustiques de haute qualité, présentées dans des interfaces denses, techniques et anxiogènes. Tacet ne crée pas de nouvelles données — il inverse l'interface. Même sources, lecture opposée. Dans un marché saturé d'outils qui alertent, Tacet est le premier à apaiser.

Signal détecté : *"L'interface institutionnelle anxiogène inversée en compagnon premium serein."*

**2. Score Sérénité — human-legibility layer sur données techniques**

Le Lden (dB pondéré jour-soir-nuit, Directive EU 2002/49/CE) est incompréhensible pour 99% des utilisateurs. Le Score Sérénité (0–100) est une transformation propriétaire Tacet qui rend ce chiffre actionnable sans formation acoustique. Aucun concurrent B2C ne possède ce traducteur.

Signal détecté : *"Removing the acoustic expertise barrier entirely."*

**3. $0 Infrastructure Permanente — avantage structurel de coûts**

MapLibre (MIT) + PMTiles (Protomaps) + Photon Komoot = $0 variable à n'importe quelle échelle. Ce n'est pas un hack temporaire — c'est une décision architecturale qui change la structure des coûts de façon permanente. Citymapper, PAP, SeLoger ne peuvent pas répliquer sans replatformer.

Signal détecté : *"Financially sustainable at 200k users with zero marginal infrastructure cost."*

**4. Transition B2G → B2C — domain knowledge arbitrage**

Sonor (2021–2023) a exposé le paysage data (Bruitparif, PPBE, RUMEUR) mais a échoué en B2G (cycle 18 mois, budget tech absent côté collectivités). Cette connaissance est réappliquée directement en B2C — sans le cycle institutionnel. Arbitrage de domain knowledge sur un marché vacant depuis l'exit Ambiciti (~2023–2024).

Signal détecté : *"Founder domain depth removes 18-month institutional sales cycle."*

**5. Computed Value > Raw Data — modèle B2B sans revente de données**

Tacet ne revend pas les données Bruitparif (risque ODbL + droits RUMEUR). Il vend sa **transformation propriétaire** : Score Sérénité calculé, normalisé, historisé sur 992 zones. B2C = lecture visuelle interactive. B2B = donnée structurée en bulk (JSON/CSV), exports certifiés PDF, webhooks, white-label embed. Le droit de calcul Tacet est indépendant des droits Bruitparif — c'est la PI du fondateur.

Signal détecté : *"Data is free, insight is paid."*

### Market Context & Competitive Landscape

- **Ambiciti** (France, B2C noise) — exit ~2023–2024 → marché B2C vacant
- **Bruitparif / AirParif portails** — institutionnel, sans investissement UX consommateur
- **Citymapper** — navigation transit, aucune couche acoustique, aucun support décision immobilier
- **PAP / SeLoger / Leboncoin** — aucune couche acoustique ; bruit = pain point non résolu
- **Sonor** (IVAN, B2G 2021–2023) — adjacent mais B2G consultatif, non scalable
- **Paris Elections 2026** — fenêtre stratégique : bruit = sujet de campagne, Tacet = outil référence potentiel

**Verdict :** Tacet est actuellement le seul outil B2C avec données acoustiques temps réel pour Paris. Fenêtre d'avantage compétitif estimée : 12–18 mois.

### Validation Approach

| Innovation | Signal de validation | Timeline |
|------------|---------------------|----------|
| Interface Inversion | NPS ≥ 30 ; verbatims "calming not scary" | V2 +1 mois |
| Score Sérénité lisibilité | Time-to-insight < 5 min sans tutorial | V2 launch — UX test |
| $0 infra permanence | $0 API cost à 10k MAU — Vercel analytics | V2 +3 mois |
| B2B computed value | 1 client pilot signé ≥ 100€/mo avant portail | V3 pre-build |
| Domain knowledge arbitrage | Mention presse dans ≥ 2 médias Paris | V2 +3 mois |

### Risk Mitigation

| Risque Innovation | Mitigation |
|-------------------|------------|
| Concurrent B2C émerge (Ambiciti retour ou nouveau) | Vitesse d'exécution V2 + RUMEUR exclusive (TAC-28) comme fossé |
| Score Sérénité mal compris ou anxiogène | A/B test 2 interfaces landing à V2 launch |
| Bruitparif publie son propre score grand public | Tacet ajoute RUMEUR temps réel + historique + certification comme différenciants durables |
| Bruitparif interdit usage commercial RUMEUR | B2B basé sur Score Sérénité PPBE annuel uniquement — viable sans RUMEUR pour V3 launch |

---

## Web App Specific Requirements

### Project-Type Overview

Tacet est une Progressive Web App (PWA) Next.js 14 App Router déployée sur Vercel. Architecture hybride : SSR/ISR pour les pages éditoriales et de zone (SEO) + `'use client'` pour le canvas MapLibre (WebGL, non-SSR). Pattern : shell statique hydraté côté client, fonctionnalités cartographiques en mode client uniquement.

### Browser Matrix

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome (desktop + Android) | ✅ Primary | WebGL + PWA install |
| Safari (iOS + macOS) | ✅ Required | iOS PWA add-to-homescreen (Serwist) |
| Firefox (desktop) | ✅ Required | WebGL standard |
| Edge (desktop) | ✅ Required | Chromium-based |
| Samsung Internet | ⚠️ Best-effort | Android secondary |
| IE11 / browsers < 2022 | ❌ Not supported | WebGL absent ou partiel |

**Minimum requirement :** WebGL 1.0 (requis pour MapLibre GL JS).

### Responsive Design

- **Mobile-first** — breakpoints : 375px (iPhone SE) → 430px → 768px (iPad) → 1280px (desktop)
- Carte MapLibre : plein écran sur mobile, panneau latéral sur desktop ≥ 768px
- Score Sérénité : overlay carte (mobile) / panneau info (desktop)
- Touch events : zoom pinch/spread, tap zone IRIS, swipe panneau détail
- PWA viewport : `width=device-width, initial-scale=1, viewport-fit=cover` (iOS safe area)

### Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 85 |
| LCP | < 2.5s |
| INP | < 100ms |
| CLS | < 0.1 |
| Initial JS bundle (gzip) | < 300 KB |
| PMTiles tile first load | < 1s (3G) |
| RUMEUR data refresh | < 1s UI update |
| PWA offline shell | Instant (precached) |

*CI enforcement details and NFR identifiers: see Non-Functional Requirements → Performance (NFR-P1–NFR-P8).*

### SEO Strategy

**Pages indexables (SSR/ISR) :**
- Landing page : proposition de valeur, Score Sérénité demo statique
- Baromètre du Silence : classement arrondissements (ISR daily)
- Pages thématiques élections 2026 : éditoriales, ISR
- **Pages de zone IRIS** : `app/zone/[slug]/page.tsx` Server Component, `revalidate = 86400`, `fallback: 'blocking'` — génération ISR à la première requête (992 zones, zéro build time). *Recommandation : implémenter en V2.1 (premier sprint post-MVP), pas V2 initial — ROI SEO élevé, non bloquant pour MVP.*

**Pages non-indexables (client-only) :**
- Carte interactive MapLibre : `'use client'`, rendu WebGL client uniquement
- RUMEUR layer : temps réel, non-indexable par nature

**Meta :** Open Graph, Twitter Card, `<html lang="fr">`, canonical URLs, `WebApplication` schema.org.

### Accessibility Level

RGAA niveau AA (WCAG 2.1 Level AA) — Lighthouse Accessibility ≥ 95 (CI guard). Spécificités :
- Keyboard navigation : tab order logique sur tous les éléments interactifs
- Focus management : modal Score — focus trap + Escape close
- ARIA : `role="application"` sur canvas + `aria-label` + alternative textuelle liste IRIS
- `prefers-reduced-motion` : respecté pour animations carte
- Color-only : Score Sérénité doit avoir label textuel en plus de la couleur

### Implementation Considerations

**Next.js App Router patterns :**
- Server Components : layout, navigation, pages éditoriales, pages de zone IRIS
- Client Components : MapLibre canvas, RUMEUR polling, Photon input, panneau Score
- API Routes : `/api/rumeur` (proxy Bruitparif — évite CORS + cache serveur 3 min)

**PWA offline (Serwist) :**
- Precache : app shell, fonts, assets statiques, PMTiles manifest
- Runtime cache : tuiles MapLibre (stale-while-revalidate), données PPBE GeoJSON (cache-first, 24h)
- **Offline dernière zone :** GeoJSON + Score de la dernière zone consultée mis en cache (Cache API + localStorage pour métadonnées). Bannière "mode hors ligne — données de votre dernière session" affichée.
- Push notifications : V3 (alerte seuil dB — requiert Vercel Pro)

**MapLibre + PMTiles :**
- Dynamic import `maplibre-gl` (code-split, évite dépassement bundle 300KB)
- `PMTilesProtocol` enregistré au `maplibregl.addProtocol`
- Source tiles : Vercel Blob CDN (même domaine — pas de CORS)

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach :** Experience MVP — brownfield (V1 en production). V2 n'est pas une validation marché (marché validé par Sonor + exit Ambiciti). L'objectif : élever l'expérience pour qu'elle mérite d'être partagée organiquement avant les élections 2026. Contrainte dominante : fenêtre temporelle, pas la validation produit.

**Resource Requirements :** Solo developer (IVAN) + Claude Code agents pour accélération. Pas de recrutement V2. Budget infra : $0 variable (architectural decision).

**Deadline stratégique :** Élections municipales Paris 2026 — fenêtre médiatique. Livraison V2 cible : Q2 2026.

### MVP Feature Set (Phase 1 — V2)

**Core User Journeys Supported :**
- ✅ Journey 1 — Maria success : géocodage → Score Sérénité → RUMEUR → partage
- ✅ Journey 2 — Maria edge case : Chantiers layer + transparence limite Score
- ✅ Journey 3 — Sophie récurrent : comparaison multi-zones, tablette

**Must-Have Capabilities (TAC-28→37) :**

| Feature | TAC | Justification MVP |
|---------|-----|-------------------|
| MapLibre GL JS migration | TAC-29 | Élimine coûts Mapbox — sans ça, pas de scalabilité |
| PMTiles pipeline | TAC-30 | −70% poids tuiles — performance core |
| CI/CD Vitest + Playwright + GitHub Actions | TAC-31 | Qualité non-négociable solo dev |
| Lighthouse CI budget guard | TAC-32 | RGAA + performance enforcement automatique |
| PWA Serwist offline + dernière zone | TAC-33 | Installable + offline dernière zone consultée |
| Geocoding Photon Komoot | TAC-34 | Remplace Mapbox géocodage — gratuit |
| RUMEUR real-time layer | TAC-35 | **Killer feature** — seul B2C avec données temps réel. Bloqué sur TAC-28 |
| Layer Chantiers | TAC-36 | Complète le Score statique (Journey 2) |
| E2E Playwright | TAC-37 | ≥ 10 scénarios géospatiaux |

**External Blocker :** TAC-28 — accès API RUMEUR Bruitparif. Critique, urgent, hors du contrôle d'IVAN.

**Deliberately excluded from MVP :**
- Pages de zone IRIS SEO → V2.1
- Plausible Analytics → V2.1
- Alerte push seuil dB → V3
- API B2B → V3
- Calm route planner → V3

### Post-MVP Features

**Phase 2 — V2.1 (~4 semaines post-launch) :**
- Pages de zone IRIS SEO (`/zone/[slug]` ISR, 992 zones) — SEO programmatique
- Plausible Analytics RGPD-compliant
- Formulaire feedback structuré
- A/B test landing (validation interface inversion)

**Phase 3 — V3 (post-validation B2C, ~Q3/Q4 2026) :**
*(Capability list: see Product Scope → Growth Features)*
- Calm route planner + itinéraires thématiques, alertes push, RUMEUR SSE streaming
- B2B revenue layer: API Score Sérénité JSON + certified PDF reports + portail client (backlog Linear)

**Phase 4 — V4+ :** NLQ, community layer, expansion villes, B2B SaaS at scale.

### Risk Mitigation Strategy

| Risque | Type | Mitigation |
|--------|------|------------|
| TAC-28 refus ou délai Bruitparif | Technique | Livrer TAC-29→34+36→37 d'abord. Mock RUMEUR en dev. Relancer Bruitparif en parallèle. |
| Fenêtre élections 2026 ratée | Marché | Scope MVP discipliné — zéro feature creep. V2.1 = strict post-launch. |
| Solo dev burnout | Ressource | Prioriser TAC-31 (CI/CD) tôt. Claude Code agents. Séquencer par dépendances. |
| Concurrent B2C émerge | Marché | Publier sur ProductHunt avant feature complete. TAC-28 = fossé exclusivité RUMEUR. |

---

## Functional Requirements

*Ce document constitue le contrat de capacités pour Tacet V2. Toute fonctionnalité absente de cette liste n'existera pas dans le produit final sans amendement explicite.*

### 1. Map Discovery

- **FR1 :** Users can view a choropleth map of Paris displaying noise levels for all 992 IRIS zones simultaneously.
- **FR2 :** Users can pan and zoom the map to navigate between neighborhoods.
- **FR3 :** Users can select an IRIS zone by tapping or clicking on it to access its noise data.
- **FR4 :** Users can visually compare multiple zones through a continuous color gradient representing serenity levels.
- **FR5 :** Users can access the map as a full-screen experience on mobile devices.

### 2. Zone Information & Score Sérénité

- **FR6 :** Users can view the Score Sérénité (0–100) for any selected IRIS zone.
- **FR7 :** Users can read a human-readable description of a zone's noise character without requiring acoustic expertise.
- **FR8 :** Users can see the data vintage year of the PPBE noise measurements for a selected zone.
- **FR9 :** Users can read a disclaimer clarifying that the Score Sérénité is an indicative metric not certified for regulatory use.
- **FR10 :** Users can access the scoring methodology documentation (Lden → Score Sérénité transformation) via the legal notice.
- **FR11 :** Users can share a zone's Score Sérénité and map view via the device's native share mechanism.

### 3. Address Search & Navigation

- **FR12 :** Users can search for a Paris address and navigate the map to the corresponding IRIS zone.
- **FR13 :** Users can see address autocomplete suggestions as they type, without requiring a full address entry.
- **FR14 :** Users can search by neighborhood name or landmark in addition to a full street address.
- **FR15 :** Users can clear an active search and return to a default map view.

### 4. Data Layers

- **FR16 :** Users can activate or deactivate the Bruitparif RUMEUR real-time sensor overlay on the map.
- **FR17 :** Users can view the current noise level (dB) from RUMEUR sensors near a selected zone.
- **FR18 :** Users can see the timestamp of the most recent RUMEUR data refresh.
- **FR19 :** Users can activate or deactivate the Construction Sites (Chantiers) layer showing active construction near any zone.
- **FR20 :** Users can view a construction site's location, affected radius, and expected end date.
- **FR21 :** Users can understand that an active construction site may not be reflected in the static Score Sérénité (transparent product communication of this limitation).
- **FR22 :** Users can activate or deactivate the 2026 Elections thematic layer contextualizing noise data for the municipal campaign.
- **FR23 :** Users can access the Baromètre du Silence ranking of Paris arrondissements by average serenity level.

### 5. Real-Time Data & Freshness

- **FR24 :** The system automatically refreshes RUMEUR sensor data on a 3-minute cadence without requiring user action.
- **FR25 :** Users receive a visual indicator when live RUMEUR data is unavailable or stale.
- **FR26 :** Users can distinguish between live data and cached offline data at any point in the session.
- **FR27 :** Users can see the annual update cycle disclosure for PPBE-derived data prominently in the zone information panel.

### 6. Progressive Web App & Offline

- **FR28 :** Users can install the application to their device home screen as a PWA without an app store.
- **FR29 :** Users can access the application offline, with the data of their last visited IRIS zone available.
- **FR30 :** Users can see a clear indicator when the application is operating in offline mode.
- **FR31 :** Users can launch the cached application shell in under 2 seconds from a subsequent visit.

### 7. Accessibility, Legal & Contact

- **FR32 :** Users with visual impairments can access IRIS zone noise information through a keyboard-navigable text alternative to the map canvas.
- **FR33 :** Users navigating by keyboard can reach all interactive elements in a logical tab sequence.
- **FR34 :** Users can access the legal notice, data source attributions (Bruitparif ODbL, Open Data Paris Etalab), and privacy policy from any page.
- **FR35 :** Users can submit feedback about a zone's noise data or the product via a contact form.
- **FR36 :** Prospective B2B clients can submit an expression of interest in data access via a dedicated contact channel.
- **FR37 :** The system does not collect personal data without explicit user consent, and no third-party tracking scripts are loaded.

---

## Non-Functional Requirements

### Performance

| NFR | Critère | Enforcement |
|-----|---------|-------------|
| NFR-P1 | LCP < 2.5s on 4G mobile for initial page load | LHCI CI guard (TAC-32) |
| NFR-P2 | App shell available < 1s on return visit (PWA cache) | Serwist precache |
| NFR-P3 | Lighthouse Performance ≥ 85 | CI budget guard — blocks merge |
| NFR-P4 | INP < 100ms for map interactions (zone tap, layer toggle) | CI guard |
| NFR-P5 | CLS < 0.1 — no layout shift during tile loading | CI guard |
| NFR-P6 | PMTiles first tile visible < 1s on 3G | Vercel Blob CDN |
| NFR-P7 | RUMEUR UI update < 1s after new data received | Client polling |
| NFR-P8 | Initial JS bundle < 300 KB gzipped (MapLibre dynamic import) | CI guard |

### Security

- **NFR-S1 :** All client-server communications use HTTPS exclusively (TLS 1.2+). No mixed content permitted.
- **NFR-S2 :** The `/api/rumeur` proxy does not log client IPs beyond Vercel platform defaults. Server log retention ≤ 30 days.
- **NFR-S3 :** No third-party API credentials (Bruitparif RUMEUR key) exposed client-side. All credentials stored exclusively in Vercel environment variables.
- **NFR-S4 :** Contact form data transmitted via HTTPS only; no server-side persistence beyond email transit to IVAN.
- **NFR-S5 :** Zero third-party scripts loaded in V2. In V2.1: Plausible Analytics only (RGPD-compliant by design, no cookies).
- **NFR-S6 :** HTTP security headers configured on Vercel: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

### Scalability

- **NFR-SC1 :** Application supports 10,000 simultaneous users without performance degradation — achieved through static architecture (PMTiles CDN + Next.js ISR + Vercel Edge Network). No manual scaling required.
- **NFR-SC2 :** The `/api/rumeur` proxy caches Bruitparif response server-side for 3 minutes. A traffic spike of 10,000 concurrent users generates exactly 1 upstream request per 3-minute window to Bruitparif, not 10,000.
- **NFR-SC3 :** PMTiles served from Vercel Blob (distributed CDN edge). Origin server not solicited for tiles after first edge cache hit.
- **NFR-SC4 :** No stateful database or persistent service in V2. Any third-party failure (Bruitparif RUMEUR, Open Data Paris) degrades gracefully without rendering the application inaccessible.

### Accessibility

- **NFR-A1 :** Lighthouse Accessibility ≥ 95, enforced by CI budget guard (TAC-32) — blocks merge if not met.
- **NFR-A2 :** Color contrast ratio ≥ 4.5:1 for all text and Score Sérénité color gradient labels (WCAG AA).
- **NFR-A3 :** Full keyboard navigation: all interactive elements (map, layers, search, zone panel) accessible via Tab / Shift-Tab / Enter / Escape without a pointing device.
- **NFR-A4 :** MapLibre WebGL canvas exposes a screen-reader-accessible text alternative: keyboard-navigable list of IRIS zones with Score Sérénité values.
- **NFR-A5 :** `prefers-reduced-motion` honored — map animations disabled when user has set this system preference.
- **NFR-A6 :** `lang="fr"` on `<html>` element and PWA manifest.

### Reliability

- **NFR-R1 :** Target availability ≥ 99.5% (Vercel infrastructure SLA). No custom stateful service in V2 that could add downtime risk.
- **NFR-R2 :** Graceful degradation: if Bruitparif RUMEUR API is unavailable, the app displays PPBE static data normally with a "données temps réel indisponibles" indicator. Application does not crash or become unusable.
- **NFR-R3 :** Graceful degradation: if Open Data Paris (Chantiers) API is unavailable, the layer is silently disabled with an informative message. Rest of application unaffected.
- **NFR-R4 :** Offline PWA: last visited zone Score Sérénité and IRIS data available from Serwist cache when offline. "Mode hors ligne" banner displayed.
- **NFR-R5 :** PPBE GeoJSON (992 zones) precached in service worker — available even if Vercel CDN is temporarily unreachable.

### Maintainability

- **NFR-M1 :** Unit test coverage (Vitest) ≥ 80% on critical functions: Lden → Score Sérénité transformation, IRIS GeoJSON parsing, RUMEUR cache logic (TAC-31).
- **NFR-M2 :** E2E coverage (Playwright) ≥ 10 geospatial scenarios covering primary journeys: address search, zone select, layer toggle, offline mode (TAC-37).
- **NFR-M3 :** CI/CD pipeline (GitHub Actions) blocks merge to main if: unit tests fail, E2E tests fail, or any Lighthouse budget guard not met (TAC-31/32).
- **NFR-M4 :** Continuous deployment to Vercel Preview on every PR — visual review before merge, no manual action required (TAC-31).
- **NFR-M5 :** Zero API keys committed to source. All sensitive environment variables managed via Vercel Environment Variables exclusively.

### Data Privacy

- **NFR-PP1 :** No personal data collected in V2: no user accounts, no tracked sessions, no stored geolocation.
- **NFR-PP2 :** Geocoding is ephemeral: Photon Komoot requests not logged by Tacet. User-entered addresses never persisted server-side.
- **NFR-PP3 :** Privacy policy accessible from all pages (footer), explicitly describing: data processed (Vercel server logs only), retention period (≤ 30 days), and deletion request contact.
- **NFR-PP4 :** In V2.1 (Plausible Analytics): cookieless configuration, IP anonymisation via Plausible, no fingerprinting. Analytics data not shared with third parties.

### Product Decision: User Accounts Strategy

**Decision (2026-02-27):** No user accounts in V2. Deliberate architectural and brand choice.

**Rationale:**
- "No account required" is an explicit UX differentiator — instant access matches the calm-first brand; competitors create friction, Tacet removes it.
- Maria's job-to-be-done (lease decision) is high-intent but low-frequency — she doesn't need an account for a one-time decision.
- RGPD surface remains minimal without accounts.
- localStorage provides "memory" for last visited zone without signup friction.

**Phased account strategy:**
- **V2:** Zero accounts. localStorage for last zone. Email capture optional via newsletter (Baromètre du Silence weekly — V2.1).
- **V3 B2C:** Optional account as premium gate (~5€/mo) — unlocks: unlimited saved zones, push alert configuration, RUMEUR history export. Never required for base access.
- **V3 B2B:** Account mandatory for API key management, usage dashboard, billing (portail client — backlog Linear).
