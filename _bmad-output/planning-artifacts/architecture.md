---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-05'
v3AddedAt: '2026-03-18'
inputDocuments:
  - docs/planning/prd.md
  - docs/planning/product-brief.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/planning/research/technical-research.md
  - docs/planning/research/domain-research.md
  - docs/planning/research/market-research.md
  - _bmad-output/planning-artifacts/prd-v3.md
  - docs/planning/ambient-agentic-vision.md
  - _bmad-output/planning-artifacts/prd-v3-validation-report.md
workflowType: 'architecture'
project_name: 'Tacet'
user_name: 'IVAN'
date: '2026-03-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

37 FRs across 7 categories. Architecturally, they decompose into 4 subsystems:

1. **Map Rendering & Interaction** (FR1–5, FR16–23) — Choropleth visualization of 992 IRIS zones via MapLibre GL JS, with toggleable data layers (RUMEUR real-time, Chantiers, Elections). Score Dots at zone centroids with clustering at low zoom. Zone selection triggers auto-reveal IrisPopup. This subsystem is 100% client-side (WebGL canvas).

2. **Data Pipeline & Freshness** (FR6–11, FR24–27) — Two data cadences: PPBE annual (static GeoJSON, served from Vercel Blob CDN via PMTiles or direct), and RUMEUR 3-minute polling (server-side proxy with cache). Score Sérénité (0–100) is a derived metric computed from Lden dB values. All data provenance (source, vintage, timestamp) must be surfaced in the UI.

3. **Search & Navigation** (FR12–15) — Address geocoding via Photon Komoot (OSM-based, free, no API key). Paris-bounded, autocomplete with debounce (350ms). On selection: map flyTo + zone auto-select + IrisPopup auto-reveal. Zero-tap path from address to Score.

4. **PWA, Offline & Compliance** (FR28–37) — Serwist service worker: precache app shell + PPBE GeoJSON, runtime cache for tiles (stale-while-revalidate) and RUMEUR (cache-first 3min). Last visited zone data cached for offline access. RGPD (zero cookies, ephemeral geocoding), RGAA (Lighthouse >= 95, TextAlternativeView), ODbL/Etalab attribution. Contact form for feedback and B2B interest.

**Non-Functional Requirements:**

NFRs that will directly drive architectural decisions:

| Category | Key NFRs | Architectural Impact |
|----------|----------|---------------------|
| **Performance** | LCP < 2.5s, bundle < 300KB gzip, INP < 100ms, PMTiles < 1s on 3G | MapLibre dynamic import (code-split), PMTiles on Vercel Blob CDN, aggressive tree-shaking |
| **Security** | Zero third-party scripts, CSP headers, no client-side API keys | Server-side proxy for RUMEUR, environment variables on Vercel, strict CSP |
| **Scalability** | 10k concurrent, 1 upstream request per 3-min window | Static-first architecture, edge caching, server-side RUMEUR cache |
| **Accessibility** | RGAA >= 95, full keyboard nav, screen reader alternative | TextAlternativeView (first-class table), ARIA patterns, focus management |
| **Reliability** | 99.5% uptime, graceful degradation on all API failures | No stateful backend, each external API failure isolated, offline PWA |
| **Maintainability** | Vitest >= 80%, Playwright >= 10 E2E, LHCI budget guards | CI/CD pipeline blocks merge on failure, preview deployments on every PR |
| **Privacy** | Zero personal data, ephemeral geocoding, no accounts V2 | No database, no session storage of PII, Plausible Analytics (V2.1 only) |

**Scale & Complexity:**

- Primary domain: Mobile-first PWA (geospatial)
- Complexity level: Medium
- Estimated architectural components: ~12 (MapLibre canvas, ScoreDot layer, IrisPopup, SearchBar, AppNav, ComparisonTray, ShareCard, TextAlternativeView, RUMEUR proxy, Chantiers proxy, Serwist SW, LHCI pipeline)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|-----------|--------|--------|
| **$0 variable API cost** | PRD — foundational decision | Eliminates Mapbox, Google Maps, paid geocoding. Locks in MapLibre + PMTiles + Photon. |
| **Brownfield V1 on Vercel** | Current deployment | Next.js 14 App Router, Vercel serverless/edge, existing `tacet/` folder structure preserved. |
| **TAC-28 Bruitparif API access** | External blocker | RUMEUR layer must be architecturally optional. Mock in dev, graceful degradation in prod. |
| **RGPD + RGAA + ODbL** | French/EU regulatory | Zero cookies, Lighthouse a11y >= 95, data attribution in footer + legal notice. Compliance enforced by CI. |
| **Solo developer** | Resource constraint | Architecture must favor simplicity, convention over configuration, minimal operational overhead. No custom backend or database in V2. |
| **Q2 2026 deadline** | Paris elections window | Scope discipline — MVP features only (TAC-29 to TAC-37). No feature creep. |
| **WebGL requirement** | MapLibre GL JS | Browsers without WebGL 1.0 not supported. Text alternative required for accessibility. |
| **No user accounts V2** | Product decision | No database, no auth, no session persistence. localStorage for last zone, sessionStorage for pinned zones. |

### Cross-Cutting Concerns Identified

1. **Offline-First / PWA Caching** — Touches every data source (PPBE GeoJSON, PMTiles, RUMEUR, Chantiers, Photon geocoding results). Serwist must define a coherent caching strategy per resource type. The "last visited zone" offline pattern requires coordinating Cache API + localStorage.

2. **Graceful Degradation** — Every external dependency (Bruitparif RUMEUR, Open Data Paris Chantiers, Photon Komoot, Vercel Blob CDN) can fail independently. The architecture must isolate each failure path: RUMEUR down = static PPBE still works; Photon down = search unavailable but map browsing works; CDN down = service worker serves cached tiles.

3. **Accessibility (RGAA >= 95)** — Not a feature — a cross-cutting concern. Every component (SearchBar, IrisPopup, AppNav, ComparisonTray, map canvas) must meet WCAG 2.1 AA. The WebGL map requires a complete TextAlternativeView. Focus management, ARIA roles, keyboard navigation, and `prefers-reduced-motion` affect every interactive surface.

4. **Data Provenance & Trust** — Users must always know which data they're reading (PPBE annual vs RUMEUR real-time vs Chantiers event), when it was last updated, and its known limitations. This metadata pattern repeats across IrisPopup, layer indicators, and offline banners.

5. **$0 Infrastructure Enforcement** — Every technology choice must be validated against the zero-variable-cost constraint. No paid API can enter the dependency graph without explicit architectural exception. This affects map tiles, geocoding, analytics, hosting, and future B2B considerations.

6. **Bundle Size Budget** — The 300KB gzipped JS budget is tight for a geospatial app. MapLibre GL JS alone is ~200KB min. This forces aggressive code-splitting (dynamic import for MapLibre), tree-shaking, and careful dependency management across all components.

## Starter Template Evaluation

### Primary Technology Domain

**Mobile-first PWA (web_app)** — brownfield Next.js project, migration from Mapbox to MapLibre, adding PWA/offline, CI/CD, and real-time data layer.

### Starter Options Considered

#### Option A: Fresh `create-next-app` + reconfigure

Start from scratch with `npx create-next-app@latest --typescript --tailwind --app --src-dir` and re-integrate existing domain logic and components.

- **Pros:** Clean dependency tree, latest Next.js (15.5.12 or 16.1.6), fresh config.
- **Cons:** Significant rework re-integrating V1 code. Risk of losing production-tested patterns. V1 is working — no reason to discard it.
- **Verdict:** Rejected. The brownfield V1 codebase is an asset, not technical debt. Migration-in-place is safer and faster for a solo developer under deadline.

#### Option B: Migration-in-place (selected)

Evolve the existing `tacet/` project. Replace Mapbox with MapLibre, add Serwist for PWA, add Vitest + Playwright + GitHub Actions for CI, add shadcn/ui for component library, upgrade Next.js if beneficial.

- **Pros:** Zero-risk migration path. Domain logic (`noise-categories.ts`, Score Sérénité) preserved. Existing Vercel deployment intact. Each migration step (TAC-29 to TAC-37) is independently deployable and testable.
- **Cons:** Must manage coexistence during migration (e.g., Mapbox removed only after MapLibre fully works). Package.json accumulates temporary dependencies.
- **Verdict:** Selected. Matches brownfield context, solo developer constraint, and Q2 2026 deadline.

#### Option C: T3 App / Blitz / RedwoodJS full-stack starter

Full-stack starters with database, auth, tRPC, Prisma, etc.

- **Pros:** Pre-wired full-stack patterns.
- **Cons:** Tacet V2 has no database, no user accounts, no auth, no tRPC needs. These starters add massive unnecessary complexity and dependencies. Violates the simplicity constraint.
- **Verdict:** Rejected. Tacet is a static-first geospatial PWA, not a full-stack CRUD app.

### Selected Starter: Migration-in-Place from V1

**Rationale for Selection:**

Tacet V1 is a working, production-deployed Next.js 14 application. The V2 migration is additive (new libraries, new capabilities) and subtractive (remove Mapbox). The existing project structure, domain logic, Tailwind config, and Vercel deployment are assets. A fresh starter would require re-integrating all of this for zero benefit.

**Initialization Command:**

No `create-` command. The project already exists. The migration sequence is:

```bash
cd tacet

# Phase 1: Map migration (TAC-29)
npm uninstall mapbox-gl react-map-gl @types/mapbox-gl
npm install maplibre-gl@^5.19.0 pmtiles@^4.4.0

# Phase 2: PWA (TAC-33)
npm install @serwist/next@^9.5.6
npm install -D serwist@^9.5.6

# Phase 3: Testing + CI (TAC-31)
npm install -D vitest@latest @vitejs/plugin-react @testing-library/react @testing-library/dom jsdom
npm install -D @playwright/test@^1.58.2

# Phase 4: Component library
npx shadcn@latest init
```

**Architectural Decisions Provided by Existing Project:**

**Language & Runtime:**
- TypeScript 5 (strict) — preserved from V1
- Node.js 18+ (Vercel runtime) — preserved

**Styling Solution:**
- Tailwind CSS 3.4 + `tailwindcss-animate` — preserved from V1
- shadcn/ui added for standardized accessible components (Radix UI primitives)
- CSS custom properties for Tacet design tokens (Score tiers, brand, glass morphism)

**Build Tooling:**
- Next.js built-in: SWC compiler, Turbopack dev server (Next.js 14.2+)
- No custom Webpack config needed
- Next.js 14.2.35 retained for V2 (stable, Serwist 9.x compatible, no risk of breaking changes from Next.js 15/16 migration mid-project)

**Testing Framework:**
- Unit: Vitest (latest) + React Testing Library — fast, Vite-native, TypeScript-first
- E2E: Playwright 1.58 — cross-browser, geospatial scenario support, CI-friendly
- Lighthouse CI: `@lhci/cli` — budget guards for Performance >= 85, Accessibility >= 95

**Code Organization:**
- `tacet/src/app/` — Next.js App Router pages and layouts
- `tacet/src/components/ui/` — shadcn/ui base components
- `tacet/src/components/tacet/` — Tacet custom components (IrisPopup, AppNav, ComparisonTray, ShareCard)
- `tacet/src/components/map/` — MapLibre layer config and map logic
- `tacet/src/lib/` — Domain logic (noise-categories, utils)
- `tacet/public/data/` — Static GeoJSON data files

**Development Experience:**
- `next dev` with Turbopack for fast refresh
- Vitest watch mode for unit tests
- Playwright UI mode for E2E debugging
- Vercel Preview deployments on every PR
- GitHub Actions CI: lint + test + Lighthouse on every push

**Key Version Decisions (web-verified March 2026):**

| Dependency | V1 Current | V2 Target | Rationale |
|-----------|-----------|-----------|-----------|
| Next.js | 14.2.35 | 14.2.x (stay) | Stable, Serwist compatible, avoid mid-migration framework upgrade |
| mapbox-gl | 3.18.1 | removed | Replaced by MapLibre |
| react-map-gl | 8.1.0 | removed | Direct MapLibre GL JS usage (no wrapper needed) |
| maplibre-gl | — | ^5.19.0 | Latest stable, BSD-3, WebGL 2 + Globe support |
| pmtiles | — | ^4.4.0 | Latest stable, MapLibre protocol integration |
| @serwist/next | — | ^9.5.6 | PWA service worker, Next.js 14 compatible |
| vitest | — | latest | Unit testing, Vite-native |
| @playwright/test | — | ^1.58.2 | E2E, cross-browser, CI-friendly |
| shadcn/ui | — | latest (CLI) | Accessible component primitives (Radix) |
| Photon Komoot | — | public API v1.0 | OSM geocoding, no API key, free |

**Note:** Next.js upgrade to 15.x or 16.x is deliberately deferred to post-V2. The migration from Mapbox to MapLibre + adding PWA + CI is already significant scope. Changing the framework version simultaneously would compound risk for a solo developer.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

1. IRIS data serving: Static GeoJSON (precached) + PMTiles for base map tiles
2. MapLibre integration: Direct (no react-map-gl wrapper), dynamic import, ref-based
3. RUMEUR proxy: Next.js Route Handler with 3-min server-side cache
4. Client state: SWR for server data + React Context for UI state
5. CI/CD: GitHub Actions (lint → test → build → e2e → LHCI), blocks merge on failure

**Important Decisions (Shape Architecture):**

6. Component organization: 3-tier (`ui/`, `tacet/`, `map/`)
7. Security headers: Strict CSP via `next.config.js`
8. Offline caching: Serwist precache (shell + GeoJSON) + runtime cache (tiles, RUMEUR)
9. Bundle optimization: MapLibre dynamic import, shadcn individual imports, < 300KB budget
10. Feature flags: env-var-based (`NEXT_PUBLIC_ENABLE_RUMEUR`) for gradual rollout

**Deferred Decisions (Post-MVP / V3):**

11. Photon self-hosting vs data.gouv.fr BAN (evaluate at scale)
12. RUMEUR SSE streaming (requires Vercel Pro)
13. Plausible Analytics integration (V2.1)
14. B2B API design and authentication (V3)
15. Permis de construire / urban planning data layer (V3 — see research note below)

### Data Architecture

**Decision 1.1 — IRIS Data Serving: Static GeoJSON + PMTiles**

- IRIS zone data (~2.4 MB GeoJSON): served from `public/data/`, precached by Serwist service worker. 992 polygons is small enough for direct GeoJSON. Works offline from first visit.
- Base map tiles: PMTiles format via `pmtiles@^4.4.0`, served from Vercel Blob CDN. PMTiles protocol registered with MapLibre via `maplibregl.addProtocol`.
- Score Sérénité: computed from Lden dB values in `noise-categories.ts` (preserved from V1). Pure client-side derivation, no server computation.

**Decision 1.2 — RUMEUR Real-Time Proxy**

- Route Handler: `app/api/rumeur/route.ts` — fetches Bruitparif RUMEUR API, caches response in-memory for 3 minutes, returns JSON.
- API key stored in Vercel Environment Variables (`BRUITPARIF_API_KEY`), never exposed client-side.
- Client polling: SWR with `refreshInterval: 180_000` (3 min), automatic deduplication, stale-while-revalidate.
- Graceful degradation: if RUMEUR unavailable, SWR returns last cached data + `isValidating: false` + error state → OfflineBanner variant.

**Decision 1.3 — Chantiers Layer**

- Route Handler: `app/api/chantiers/route.ts` — fetches Open Data Paris API v2.1, caches 1 hour.
- Lazy-loaded: client fetches only when user activates Chantiers layer in AppNav.
- License: Etalab (permissive), no commercial restrictions.

**Decision 1.4 — Client-Side State Management**

- **SWR** (`swr@latest`): for all server data fetching — RUMEUR polling, Chantiers lazy fetch, Photon geocoding results. Provides caching, revalidation, deduplication, error handling, and `refreshInterval`.
- **React Context**: for UI state — selected zone, active layers, pinned zones (sessionStorage-backed, max 3), expert mode toggle, light/dark theme preference.
- No Zustand, no Redux, no global state library. State surface is small enough for Context.

**Decision 1.5 — Offline Caching (Serwist)**

| Resource | Strategy | TTL | Notes |
|----------|----------|-----|-------|
| App shell (HTML, JS, CSS) | Precache | Build-time | Updated on new deployment |
| PPBE GeoJSON (`paris-noise-iris.geojson`) | Precache | Build-time | 992 zones, ~2.4 MB, available offline from first visit |
| Fonts (Inter) | Precache | Build-time | next/font handles loading |
| PMTiles base map tiles | Runtime: stale-while-revalidate | 7 days | Large, progressive, CDN-cached |
| RUMEUR data | Runtime: network-first | 3 min | Falls back to last cached response |
| Photon geocoding | Runtime: cache-first | 24 hours | Same address = same result |
| Last visited zone metadata | localStorage | Indefinite | Score, tier, name, arrondissement |

### Authentication & Security

**Decision 2.1 — No Authentication in V2**

No user accounts, no auth, no session tokens. Zero authentication surface.

**Decision 2.2 — API Key Management**

- `BRUITPARIF_API_KEY`: Vercel env var, accessed only in `app/api/rumeur/route.ts`. Never in client bundle.
- Photon Komoot: no key needed.
- No other secrets in V2.

**Decision 2.3 — HTTP Security Headers**

Configured in `next.config.js` `headers()`:

| Header | Value | Rationale |
|--------|-------|-----------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://photon.komoot.io https://*.protomaps.com; img-src 'self' data: blob:; worker-src 'self'` | Restrict all external resources to known APIs |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=()` | No device access needed |

**Decision 2.4 — RGPD Compliance**

- Zero cookies (no analytics, no tracking, no session cookies).
- Geocoding ephemeral: Photon requests not logged, addresses never persisted.
- Contact form data sent via email only, no server-side storage.
- Privacy policy in footer on every page.

### API & Communication Patterns

**Decision 3.1 — Next.js Route Handlers**

All server APIs as App Router Route Handlers:
- `GET /api/rumeur` — Bruitparif proxy, 3-min cache, shields API key
- `GET /api/chantiers` — Open Data Paris proxy, 1-hour cache
- No versioning, no public API in V2 (internal consumption only)

**Decision 3.2 — Error Handling Pattern**

Consistent across all Route Handlers:
- Try/catch with structured response: `{ data: T | null, error: string | null, fallback: boolean, cachedAt: string | null }`
- Upstream timeout: 5 seconds
- On failure: return `fallback: true` + last cached data if available
- Client-side: SWR `onError` → calm degradation UI, never crash

**Decision 3.3 — Photon Geocoding (Client-Direct)**

- Direct client → `https://photon.komoot.io/api/?q={query}&bbox=2.22,48.81,2.47,48.90&limit=5&lang=fr`
- No proxy needed (public, no API key, CORS-friendly)
- Debounce 350ms in SearchBar
- Rate limit: ~1 req/s (Photon fair use). Debounce handles this for single users.
- V3 evaluation: self-host Photon or switch to data.gouv.fr BAN at scale.

### Frontend Architecture

**Decision 4.1 — MapLibre Direct Integration**

- No `react-map-gl` wrapper. Direct `maplibregl.Map` instantiation via `useRef` + `useEffect`.
- Loaded via `next/dynamic(() => import('./MapContainer'), { ssr: false })`.
- Map instance shared to child components via `MapContext` (React Context).
- PMTiles protocol: `let protocol = new pmtiles.Protocol(); maplibregl.addProtocol('pmtiles', protocol.tile);`

**Decision 4.2 — Component Architecture (3-Tier)**

- `src/components/ui/` — shadcn/ui: Button, Badge, Toggle, Alert, Dialog, Separator, Tooltip, Command
- `src/components/tacet/` — Business: IrisPopup, AppNav, ComparisonTray, ShareCard, SearchBar, TextAlternativeView, OfflineBanner, PWAInstallPrompt, DataProvenance, SerenityBar, TierBadge
- `src/components/map/` — MapLibre: MapContainer (init + dynamic import), ScoreDotLayer, ClusterLayer, RumeurLayer, ChantiersLayer, AmbientGlowLayer, ZoneHighlight

**Decision 4.3 — Routing (Minimal)**

| Route | Rendering | Purpose |
|-------|-----------|---------|
| `/` | Client-heavy (SSR shell + `'use client'` map) | Main map page |
| `/barometre` | ISR (daily revalidation) | Silence Barometer ranking |
| `/elections` | ISR | Elections 2026 thematic |
| `/accessible` | SSR | TextAlternativeView (RGAA) |
| `/zone/[slug]` | ISR (V2.1, deferred) | SEO zone pages |

**Decision 4.4 — Bundle Optimization**

- MapLibre: dynamic import → separate chunk (~200KB gzip), loaded only on map pages
- PMTiles: co-loaded with MapLibre (~15KB)
- shadcn/ui: individual imports, no barrel file
- SWR: ~4KB gzip
- Total budget: < 300KB gzip per page, enforced by LHCI

### Infrastructure & Deployment

**Decision 5.1 — CI/CD: GitHub Actions**

Pipeline: `push/PR → main`:
1. `lint` — `next lint`
2. `unit-tests` — `vitest run`
3. `build` — `next build`
4. `e2e-tests` — `playwright test` against build
5. `lighthouse-ci` — `lhci autorun` (Performance >= 85, Accessibility >= 95)

All jobs must pass. Vercel auto-deploys preview on PR, production on merge to main.

**Decision 5.2 — Environment Configuration**

- `tacet/.env.local` — local dev secrets
- Vercel Environment Variables — production
- Feature flags: `NEXT_PUBLIC_ENABLE_RUMEUR=true/false` for gradual rollout
- `.env.example` — documents all variables (committed)

**Decision 5.3 — Monitoring**

- V2: Vercel Analytics (free, built-in Web Vitals)
- V2.1: Plausible Analytics (RGPD, cookieless)
- No custom logging. Vercel function logs for Route Handler debugging.

**Decision 5.4 — Scaling (Static-First)**

- PMTiles: Vercel Blob CDN (edge-cached globally)
- PPBE GeoJSON: Serwist precache (zero origin requests on return)
- RUMEUR proxy: 1 upstream request per 3 min regardless of client count
- No database, no connection pools. Vercel edge network handles distribution.

### Decision Impact Analysis

**Implementation Sequence:**

1. TAC-29: MapLibre migration (remove Mapbox, add MapLibre + PMTiles)
2. TAC-31: CI/CD pipeline (Vitest + Playwright + GitHub Actions)
3. TAC-32: Lighthouse CI budget guards
4. TAC-34: Photon geocoding (replace Mapbox Geocoding)
5. TAC-33: Serwist PWA (offline shell, precaching)
6. TAC-35: RUMEUR layer (Route Handler, SWR polling) — blocked on TAC-28
7. TAC-36: Chantiers layer (Route Handler, lazy load)
8. TAC-37: E2E Playwright scenarios

**Cross-Component Dependencies:**

- MapLibre (TAC-29) must land before RUMEUR (TAC-35) and Chantiers (TAC-36) map layers
- CI pipeline (TAC-31) should land early so all subsequent TACs get tested
- Serwist (TAC-33) after MapLibre (TAC-29) to cache correct tile format
- Photon (TAC-34) is independent — can run in parallel with TAC-29

### V3 Data Enrichment: Permis de Construire (Building Permits)

**Research finding (March 2026):** Paris publishes building permit data as open data, viable for V3 enrichment.

**Primary source — Open Data Paris:**
- Dataset: `dossiers-recents-durbanisme` (last 6 months) + `autorisations-durbanisme-h` (historical)
- Coverage: Permis de Construire (PC), Permis de Démolir (PD), Permis d'Aménager (PA), Déclarations Préalables (DP), Certificats d'Urbanisme (CU)
- Fields: type, arrondissement, description des travaux, date de dépôt, mois de décision, décision autorité, adresse terrain, géolocalisation
- API: OpenDataSoft REST API (`parisdata.opendatasoft.com`)
- License: Open Licence (Etalab) — free for commercial use with attribution
- Refresh: rolling 6-month window for recent; historical dataset for older records

**Secondary source — data.gouv.fr (national):**
- SITADEL database: national building permits since 2013, monthly updates, Etalab license
- API ADS (SOGEFI): richer data but paid subscription (5,000–50,000 API calls/year)

**Architectural value for Tacet V3:**
- Geolocated permits can be overlaid on the IRIS map as a contextual layer (like Chantiers)
- Use case: Maria sees "3 permis de construire accordés dans cette zone au dernier semestre" → anticipates neighborhood evolution and potential noise impact
- Complements the PLU enrichment opportunity already noted in the UX spec
- Same proxy pattern as Chantiers: Route Handler + lazy load on layer activation
- No additional infrastructure cost ($0 — Etalab license, OpenDataSoft API)

**Decision: Deferred to V3.** Added to backlog as a contextual data layer alongside PLU data. Architecture supports it via the same Route Handler proxy + lazy layer activation pattern used for Chantiers.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**12 critical conflict points** identified where AI agents could diverge if patterns are not specified.

### Naming Patterns

**File Naming:**

| Category | Convention | Example |
|----------|-----------|---------|
| React components | PascalCase `.tsx` | `IrisPopup.tsx`, `SearchBar.tsx`, `TierBadge.tsx` |
| MapLibre layer configs | PascalCase `.ts` | `ScoreDotLayer.ts`, `RumeurLayer.ts` |
| Hooks | camelCase with `use` prefix `.ts` | `useMapContext.ts`, `useSelectedZone.ts` |
| Utilities / lib | kebab-case `.ts` | `noise-categories.ts`, `utils.ts` |
| Route Handlers | `route.ts` inside folder | `app/api/rumeur/route.ts` |
| Tests | co-located, `.test.ts` suffix | `noise-categories.test.ts`, `IrisPopup.test.tsx` |
| Types | PascalCase `.ts` or co-located | `types.ts` inside feature folder, or `src/types/` for shared |
| CSS / Tailwind config | kebab-case | `globals.css`, `tailwind.config.ts` |

**Component & Function Naming:**

| Category | Convention | Example | Anti-pattern |
|----------|-----------|---------|--------------|
| React components | PascalCase | `IrisPopup`, `ComparisonTray` | `irisPopup`, `iris-popup` |
| Props interfaces | `{ComponentName}Props` | `IrisPopupProps` | `IIrisPopupProps`, `PopupProps` |
| Hooks | `use{Feature}` camelCase | `useSelectedZone`, `useRumeurData` | `UseSelectedZone`, `selected-zone-hook` |
| Event handlers | `handle{Event}` or `on{Event}` | `handleZoneSelect`, `onLayerToggle` | `zoneSelected`, `clickHandler` |
| Boolean state | `is/has/should` prefix | `isLoading`, `hasError`, `isLayerActive` | `loading`, `error`, `active` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_ZOOM`, `PARIS_CENTER`, `RUMEUR_POLL_INTERVAL` | `defaultZoom`, `ParisCenter` |
| CSS variables | `--kebab-case` with prefix | `--score-tres-calme`, `--brand-teal`, `--glass-bg` | `--scoreTresCalme` |

**API Naming:**

| Convention | Pattern | Example |
|-----------|---------|---------|
| Route Handler paths | `/api/kebab-case` | `/api/rumeur`, `/api/chantiers` |
| Query parameters | camelCase | `?bbox=...&limit=5&lang=fr` |
| JSON response fields | camelCase | `{ sensorId, noiseLevel, lastUpdated }` |

### Structure Patterns

**Test Co-location:**

Tests live next to the file they test. No separate `__tests__/` directory.

```
src/lib/noise-categories.ts
src/lib/noise-categories.test.ts
src/components/tacet/IrisPopup.tsx
src/components/tacet/IrisPopup.test.tsx
```

E2E tests are the exception — they live in a top-level `e2e/` folder:

```
tacet/e2e/
  address-search.spec.ts
  zone-selection.spec.ts
  layer-toggle.spec.ts
  offline-mode.spec.ts
```

**Component File Structure:**

Each Tacet business component is a single file unless it exceeds ~200 lines. If it grows, split into a folder:

```
src/components/tacet/IrisPopup/
  index.tsx           (main component, re-exports)
  IrisPopup.tsx       (component logic)
  IrisPopup.test.tsx  (tests)
  useIrisPopupData.ts (hook, if needed)
```

**Import Aliases:**

All imports use the `@/` path alias (configured in `tsconfig.json`):

```typescript
import { getSereniteScore } from '@/lib/noise-categories'
import { IrisPopup } from '@/components/tacet/IrisPopup'
import { Button } from '@/components/ui/button'
```

Never use relative imports across module boundaries (e.g., `../../components/`).

### Format Patterns

**Route Handler Response Format:**

Every Route Handler returns a consistent JSON structure:

```typescript
// Success
{ data: T, error: null, cachedAt: string | null }

// Error with fallback
{ data: T | null, error: string, fallback: true, cachedAt: string }

// Error without fallback
{ data: null, error: string, fallback: false, cachedAt: null }
```

Always return `NextResponse.json()` with explicit status codes:
- `200` — success (fresh or cached)
- `502` — upstream failure (Bruitparif/Open Data Paris down)
- `504` — upstream timeout

**Date/Time Format:**

- All dates in JSON: ISO 8601 strings (`2026-03-05T14:30:00Z`)
- Display in UI: French locale (`Intl.DateTimeFormat('fr-FR')`)
- RUMEUR timestamp display: relative ("il y a 3 min") via a simple helper, no `date-fns` or `dayjs` dependency

**GeoJSON Conventions:**

- IRIS zone properties use the existing field names from V1 GeoJSON (preserve data pipeline compatibility)
- Score Sérénité always computed client-side from `lden_db` field via `getSereniteScore()`
- Centroid coordinates: `[lng, lat]` order (GeoJSON standard), never `[lat, lng]`

### State Management Patterns

**SWR Hooks (Server Data):**

Each data source gets a dedicated SWR hook in `src/hooks/`:

```typescript
// src/hooks/useRumeurData.ts
export function useRumeurData(enabled: boolean) {
  return useSWR(
    enabled ? '/api/rumeur' : null,
    fetcher,
    { refreshInterval: 180_000, revalidateOnFocus: false }
  )
}
```

Pattern rules:
- Hook name matches data source: `useRumeurData`, `useChantiersData`, `usePhotonSearch`
- Conditional fetching via `null` key (SWR convention)
- `refreshInterval` only for polling data (RUMEUR). Others use default (manual revalidation).
- `revalidateOnFocus: false` for all map data (prevents jarring map reloads)

**React Context (UI State):**

Single `MapContext` provides UI state to all map-related components:

```typescript
interface MapContextValue {
  selectedZone: IrisZone | null
  setSelectedZone: (zone: IrisZone | null) => void
  activeLayers: Set<LayerId>
  toggleLayer: (id: LayerId) => void
  pinnedZones: IrisZone[]    // max 3, sessionStorage-backed
  pinZone: (zone: IrisZone) => void
  unpinZone: (zoneId: string) => void
  expertMode: boolean
  toggleExpertMode: () => void
  mapRef: React.RefObject<maplibregl.Map | null>
}
```

Rules:
- One Context, not multiple. The state surface is small.
- `selectedZone` is the source of truth for IrisPopup visibility.
- `pinnedZones` synced to `sessionStorage` on every change (max 3).
- `expertMode` synced to `localStorage` (persists across sessions).
- `activeLayers` is a `Set<'rumeur' | 'chantiers' | 'elections' | 'ambientGlow'>`.

### Process Patterns

**Error Handling:**

| Layer | Pattern | Example |
|-------|---------|---------|
| Route Handler | try/catch → structured JSON response | `{ data: null, error: "Bruitparif RUMEUR unavailable", fallback: true, cachedAt: "..." }` |
| SWR hook | `onError` callback → set error state | Show OfflineBanner variant, keep last data visible |
| React component | Error Boundary at page level | `app/error.tsx` catches unhandled errors, shows calm recovery UI |
| MapLibre | `map.on('error')` handler | Log to console, never crash the map. Missing tiles = blank area, not app crash. |
| Photon geocoding | catch in SearchBar | Show "Adresse non trouvée" inline, never a toast or modal |

**Emotional register rule:** All user-facing error messages are calm and informative, never alarming. Use amber tones, never red (red is reserved for "Bruyant" tier). Examples:
- "Données temps réel indisponibles — dernières données connues affichées"
- "Recherche d'adresse momentanément indisponible"
- "Vous êtes hors ligne — données de votre dernière session"

**Loading States:**

| Component | Loading Pattern |
|-----------|----------------|
| IrisPopup | Skeleton (pulsing rectangles matching component anatomy) |
| Map tiles | Blank canvas with `--bg-canvas` background + subtle spinner |
| SearchBar results | "Recherche..." text in dropdown |
| RUMEUR layer | Dots appear with fade-in 200ms as data arrives |
| Chantiers layer | Same fade-in pattern |

Rule: Every component that fetches data must handle 3 states: `loading`, `error`, `success`. No component may render empty without explanation.

**MapLibre Layer Pattern:**

Every map layer follows the same lifecycle:

```typescript
// src/components/map/RumeurLayer.ts
export function addRumeurLayer(map: maplibregl.Map, data: GeoJSON) {
  if (map.getSource('rumeur')) {
    (map.getSource('rumeur') as GeoJSONSource).setData(data)
    return
  }
  map.addSource('rumeur', { type: 'geojson', data })
  map.addLayer({ id: 'rumeur-circles', type: 'circle', source: 'rumeur', /* ... */ })
}

export function removeRumeurLayer(map: maplibregl.Map) {
  if (map.getLayer('rumeur-circles')) map.removeLayer('rumeur-circles')
  if (map.getSource('rumeur')) map.removeSource('rumeur')
}
```

Rules:
- Always check if source/layer exists before adding (idempotent).
- Layer IDs follow `{source}-{type}` pattern: `score-dots-circles`, `rumeur-circles`, `chantiers-symbols`, `zone-highlight-line`, `zone-highlight-fill`.
- Source IDs match the data source name: `score-dots`, `rumeur`, `chantiers`, `zone-highlight`.
- Each layer file exports `add{Layer}` and `remove{Layer}` functions.

### Enforcement Guidelines

**All AI Agents MUST:**

1. Use `@/` path aliases for all cross-module imports — never relative `../../`
2. Co-locate tests next to source files with `.test.ts(x)` suffix
3. Return the standard `{ data, error, fallback, cachedAt }` format from all Route Handlers
4. Use PascalCase for components, camelCase for hooks/functions, kebab-case for utility files
5. Handle all 3 states (loading, error, success) in every data-fetching component
6. Use calm, informative language for error messages — never alarming, never red
7. Check source/layer existence before MapLibre `addSource`/`addLayer` calls
8. Use SWR for all server data fetching — no raw `fetch` in components
9. Keep all API keys in Route Handlers — never in client code
10. Use `next/dynamic` with `ssr: false` for any component that imports MapLibre

## Project Structure & Boundaries

### Complete Project Directory Structure

```
tacet/                                    # THE APP (Next.js 14)
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions: lint → test → build → e2e → LHCI
│
├── e2e/                                  # Playwright E2E tests (TAC-37)
│   ├── address-search.spec.ts            # FR12–15: Photon geocoding flow
│   ├── zone-selection.spec.ts            # FR1–5: map tap → IrisPopup auto-reveal
│   ├── layer-toggle.spec.ts             # FR16–23: RUMEUR / Chantiers / Elections
│   ├── offline-mode.spec.ts              # FR28–31: PWA offline, cached zone
│   ├── score-display.spec.ts             # FR6–11: Score Sérénité, provenance
│   ├── accessibility.spec.ts             # FR32–33: keyboard nav, focus management
│   └── playwright.config.ts
│
├── public/
│   ├── data/
│   │   ├── paris-noise-iris.geojson      # 992 IRIS zones (V1, preserved)
│   │   ├── paris-noise-arrondissements.geojson  # Arrondissement aggregates (V1)
│   │   └── iris-centroids.geojson        # Zone centroids for ScoreDots (V2, generated)
│   ├── manifest.json                     # PWA manifest (V2 enhanced via Serwist)
│   ├── icons/                            # PWA icons (192, 512, maskable)
│   └── og-image.png                      # Open Graph share image
│
├── src/
│   ├── app/
│   │   ├── globals.css                   # Tailwind base + Tacet design tokens (CSS vars)
│   │   ├── layout.tsx                    # Root layout: Inter font, lang="fr", metadata, MapProvider
│   │   ├── page.tsx                      # Main map page: dynamic import MapContainer
│   │   ├── error.tsx                     # Error Boundary: calm recovery UI
│   │   ├── barometre/
│   │   │   └── page.tsx                  # Silence Barometer (ISR)
│   │   ├── elections/
│   │   │   └── page.tsx                  # Elections 2026 layer
│   │   ├── accessible/
│   │   │   └── page.tsx                  # TextAlternativeView (RGAA table, SSR)
│   │   └── api/
│   │       ├── rumeur/
│   │       │   └── route.ts              # Bruitparif RUMEUR proxy, 3-min cache (TAC-35)
│   │       └── chantiers/
│   │           └── route.ts              # Open Data Paris proxy, 1-hour cache (TAC-36)
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui primitives (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── command.tsx
│   │   │
│   │   ├── tacet/                        # Tacet business components
│   │   │   ├── IrisPopup.tsx             # Zone popup: Score, tier, character note, share/pin
│   │   │   ├── IrisPopup.test.tsx
│   │   │   ├── SearchBar.tsx             # Photon geocoding autocomplete (TAC-34)
│   │   │   ├── SearchBar.test.tsx
│   │   │   ├── AppNav.tsx                # Floating nav: layers, pins, settings
│   │   │   ├── ComparisonTray.tsx        # Pinned zones comparison (max 3, sessionStorage)
│   │   │   ├── ShareCard.tsx             # Screenshot-ready share card (dom-to-image)
│   │   │   ├── TextAlternativeView.tsx   # RGAA: keyboard-navigable zone table
│   │   │   ├── OfflineBanner.tsx         # Calm offline indicator
│   │   │   ├── PWAInstallPrompt.tsx      # Install dialog after first zone tap
│   │   │   ├── DataProvenance.tsx        # "Bruitparif · PPBE 2024" footer micro-component
│   │   │   ├── SerenityBar.tsx           # Score progress bar (4px, tier-colored)
│   │   │   ├── TierBadge.tsx             # Tier label badge ("Calme", "Modéré"...)
│   │   │   └── Legend.tsx                # Map legend (migrated from V1)
│   │   │
│   │   └── map/                          # MapLibre configuration & layers
│   │       ├── MapContainer.tsx          # MapLibre init, PMTiles protocol, dynamic import
│   │       ├── MapContainer.test.tsx
│   │       ├── ScoreDotLayer.ts          # IRIS centroid circles + clustering
│   │       ├── RumeurLayer.ts            # Real-time sensor overlay
│   │       ├── ChantiersLayer.ts         # Construction sites symbols
│   │       ├── AmbientGlowLayer.ts       # Optional radial glow (OFF by default)
│   │       ├── ZoneHighlight.ts          # Selected zone: dashed border + 3% fill
│   │       └── ElectionsLayer.ts         # 2026 elections thematic
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useRumeurData.ts              # SWR: /api/rumeur, 3-min polling
│   │   ├── useChantiersData.ts           # SWR: /api/chantiers, lazy
│   │   ├── usePhotonSearch.ts            # SWR: Photon geocoding, debounced
│   │   └── useOnlineStatus.ts            # navigator.onLine reactive hook
│   │
│   ├── contexts/
│   │   └── MapContext.tsx                # Selected zone, active layers, pinned zones, expertMode, mapRef
│   │
│   ├── lib/                              # Domain logic & utilities
│   │   ├── noise-categories.ts           # Score Sérénité, NOISE_CATEGORIES, tier logic (V1)
│   │   ├── noise-categories.test.ts
│   │   ├── utils.ts                      # cn() — clsx + tailwind-merge (V1)
│   │   ├── fetcher.ts                    # SWR global fetcher
│   │   ├── format-date.ts               # Relative time ("il y a 3 min"), Intl.DateTimeFormat
│   │   └── constants.ts                  # PARIS_CENTER, DEFAULT_ZOOM, RUMEUR_POLL_INTERVAL, etc.
│   │
│   ├── types/                            # Shared TypeScript types
│   │   ├── iris.ts                       # IrisZone, IrisFeature, IrisProperties
│   │   ├── rumeur.ts                     # RumeurSensor, RumeurResponse
│   │   ├── chantiers.ts                  # ChantierFeature, ChantierProperties
│   │   └── layers.ts                     # LayerId union type
│   │
│   └── sw.ts                             # Serwist service worker entry (TAC-33)
│
├── .env.example                          # Documents: BRUITPARIF_API_KEY, NEXT_PUBLIC_ENABLE_RUMEUR
├── .gitignore
├── components.json                       # shadcn/ui config (V1, preserved)
├── next.config.mjs                       # Serwist wrapper, security headers, env
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts                    # Tacet tokens, Score tier colors
├── tsconfig.json                         # strict, @/ alias
├── vitest.config.ts                      # Vitest config: jsdom, React plugin, path aliases
├── lighthouserc.js                       # LHCI budget: perf >= 85, a11y >= 95
└── README.md
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Internal | External | Protocol |
|----------|----------|----------|----------|
| `/api/rumeur` | SWR hook → Route Handler | Route Handler → Bruitparif API | JSON over HTTPS, 3-min server cache |
| `/api/chantiers` | SWR hook → Route Handler | Route Handler → Open Data Paris API v2.1 | JSON over HTTPS, 1-hour server cache |
| Photon geocoding | SearchBar → Photon directly | Client → `photon.komoot.io` | JSON over HTTPS, no proxy |
| PMTiles | MapLibre → Vercel Blob CDN | Client → CDN edge | Binary tiles, stale-while-revalidate |
| PPBE GeoJSON | MapLibre → Serwist cache | Precached at build | Local file, offline-first |

**Component Boundaries:**

```
MapContext (provides: selectedZone, activeLayers, pinnedZones, mapRef)
├── MapContainer (owns: MapLibre instance, all map layers)
│   ├── ScoreDotLayer (reads: GeoJSON centroids)
│   ├── RumeurLayer (reads: useRumeurData SWR)
│   ├── ChantiersLayer (reads: useChantiersData SWR)
│   ├── ZoneHighlight (reads: selectedZone from context)
│   └── AmbientGlowLayer (reads: activeLayers from context)
├── SearchBar (writes: setSelectedZone, calls: usePhotonSearch)
├── IrisPopup (reads: selectedZone, writes: pinZone)
├── AppNav (reads/writes: activeLayers, pinnedZones count)
├── ComparisonTray (reads: pinnedZones, writes: unpinZone)
└── OfflineBanner (reads: useOnlineStatus)
```

Rule: Components communicate only through MapContext. No prop-drilling across siblings. No direct component-to-component calls.

**Data Boundaries:**

| Data | Source | Lives In | Accessed By |
|------|--------|----------|-------------|
| IRIS zones (992) | Static GeoJSON | `public/data/paris-noise-iris.geojson` | MapContainer (Serwist precache) |
| IRIS centroids | Generated GeoJSON | `public/data/iris-centroids.geojson` | ScoreDotLayer |
| Score Sérénité | Computed from Lden | `lib/noise-categories.ts` | IrisPopup, TextAlternativeView |
| RUMEUR sensors | Bruitparif API | `/api/rumeur` → SWR | RumeurLayer, IrisPopup |
| Chantiers | Open Data Paris | `/api/chantiers` → SWR | ChantiersLayer |
| Geocoding results | Photon Komoot | Client-direct → SWR | SearchBar |
| Pinned zones | sessionStorage | MapContext | ComparisonTray, AppNav |
| Last visited zone | localStorage | Read on mount | OfflineBanner |
| Expert mode pref | localStorage | MapContext | IrisPopup |

### Requirements to Structure Mapping

| TAC / FR | Files |
|----------|-------|
| TAC-29 (MapLibre) | `components/map/MapContainer.tsx`, `ScoreDotLayer.ts`, `ZoneHighlight.ts`, `page.tsx` |
| TAC-30 (PMTiles) | `components/map/MapContainer.tsx` (protocol), `next.config.mjs`, Vercel Blob setup |
| TAC-31 (CI/CD) | `.github/workflows/ci.yml`, `vitest.config.ts`, `e2e/playwright.config.ts` |
| TAC-32 (LHCI) | `lighthouserc.js`, `.github/workflows/ci.yml` |
| TAC-33 (PWA) | `src/sw.ts`, `next.config.mjs` (Serwist wrap), `public/manifest.json`, `public/icons/` |
| TAC-34 (Photon) | `hooks/usePhotonSearch.ts`, `components/tacet/SearchBar.tsx` |
| TAC-35 (RUMEUR) | `app/api/rumeur/route.ts`, `hooks/useRumeurData.ts`, `components/map/RumeurLayer.ts` |
| TAC-36 (Chantiers) | `app/api/chantiers/route.ts`, `hooks/useChantiersData.ts`, `components/map/ChantiersLayer.ts` |
| TAC-37 (E2E) | `e2e/*.spec.ts` |
| TAC-38 (Story 2.2) | `components/tacet/IrisPopup.tsx`, MapContext |
| TAC-39 (Story 2.3) | `components/tacet/IrisPopup.tsx`, legal notice page/section |
| TAC-40 (Story 2.4) | `components/tacet/ShareCard.tsx`, `components/tacet/IrisPopup.tsx` |
| TAC-41 (Story 2.5) | MapContext (pinnedZones), `components/tacet/ComparisonTray.tsx`, `components/tacet/AppNav.tsx` |
| TAC-42 (Story 2.6) | `components/tacet/SerenityBar.tsx`, `components/tacet/TierBadge.tsx`, `components/tacet/DataProvenance.tsx`, IrisPopup |
| TAC-43 (Story 3.5) | Chantiers disclosure copy, `components/map/ElectionsLayer.ts`, AppNav layer toggle |
| TAC-44 (Story 3.6) | `app/barometre/page.tsx`, aggregation logic |
| TAC-45 (Story 5.1) | `app/accessible/page.tsx`, `components/tacet/TextAlternativeView.tsx` |
| TAC-46 (Story 5.2) | All interactive components (focus, tab order, trap in IrisPopup) |
| TAC-47 (Story 5.3) | Footer links, legal notice page, privacy policy page |
| TAC-48 (Story 5.4) | Contact/feedback form, B2B form, footer entry points |
| TAC-49 (Story 5.5) | Privacy policy, CSP, zero third-party scripts, form privacy notices |
| FR32–33 (RGAA) | `app/accessible/page.tsx`, `components/tacet/TextAlternativeView.tsx` |
| FR28–31 (PWA) | `src/sw.ts`, `components/tacet/OfflineBanner.tsx`, `components/tacet/PWAInstallPrompt.tsx` |

## TAC Implementation Map

All implementation tasks (TACs) with story cross-references and status. TAC-28 (Bruitparif API access) is an external blocker; TAC-29→34, TAC-36, TAC-37 (and TAC-38 through TAC-49) are implementation-ready and can proceed in parallel.

| TAC | Story | Title / Scope | Status |
|-----|-------|----------------|--------|
| TAC-28 | (external) | Bruitparif API access | **BLOCKED** — external dependency |
| TAC-29 | 1.1, 1.3, 1.4 | MapLibre migration, Score Dots, zone selection, highlight | ready |
| TAC-30 | 1.2 | PMTiles protocol and base map tiles | ready |
| TAC-31 | 1.5 | CI/CD pipeline and unit tests | ready |
| TAC-32 | 1.6 | Lighthouse CI budget guards | ready (depends on TAC-31) |
| TAC-33 | 4.1, 4.2, 4.3, 4.4 | Serwist PWA, offline, install prompt, manifest | ready (depends on TAC-29) |
| TAC-34 | 2.1 | Photon geocoding and SearchBar | ready |
| TAC-35 | 3.1, 3.2, 3.3 | RUMEUR API proxy, layer, timestamp/stale indicator | **BLOCKED** by TAC-28 |
| TAC-36 | 3.4 | Chantiers API proxy and Chantiers layer | ready |
| TAC-37 | 5.6 | E2E Playwright scenarios | ready (depends on TAC-31) |
| TAC-38 | 2.2 | IrisPopup auto-reveal and Score display | ready (depends on TAC-29) |
| TAC-39 | 2.3 | Data vintage, disclaimer, methodology link | ready |
| TAC-40 | 2.4 | Native share and ShareCard | ready |
| TAC-41 | 2.5 | Zone pin and ComparisonTray (max 3) | ready |
| TAC-42 | 2.6 | SerenityBar, TierBadge, DataProvenance in IrisPopup | ready |
| TAC-43 | 3.5 | Chantiers limitation disclosure and Elections layer | ready (depends on TAC-36) |
| TAC-44 | 3.6 | Baromètre du Silence page | ready |
| TAC-45 | 5.1 | TextAlternativeView (keyboard-navigable zone table) | ready (depends on TAC-29) |
| TAC-46 | 5.2 | Full keyboard navigation and focus management | ready |
| TAC-47 | 5.3 | Legal notice, attributions, privacy policy | ready |
| TAC-48 | 5.4 | Feedback and B2B contact forms | ready |
| TAC-49 | 5.5 | RGPD compliance and zero third-party tracking | ready |

### Data Flow

```
                    ┌─────────────────┐
                    │  Bruitparif API  │
                    └────────┬────────┘
                             │ (3-min poll)
                    ┌────────▼────────┐
                    │  /api/rumeur    │ Route Handler (server cache)
                    └────────┬────────┘
                             │
    ┌──────────┐    ┌────────▼────────┐    ┌──────────────┐
    │  Photon  │◄───│   SWR Hooks     │───►│ Open Data    │
    │  Komoot  │    │ (client cache)  │    │ Paris API    │
    └──────────┘    └────────┬────────┘    └──────────────┘
                             │
                    ┌────────▼────────┐
                    │   MapContext     │ (selectedZone, layers, pins)
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
   │ MapContainer │   │  IrisPopup  │   │   AppNav    │
   │ + Layers     │   │ + Share     │   │ + Tray      │
   └──────────────┘   └─────────────┘   └─────────────┘
          │
   ┌──────▼────────────────────────┐
   │  Serwist Service Worker       │
   │  (precache: shell + GeoJSON)  │
   │  (runtime: tiles + RUMEUR)    │
   └───────────────────────────────┘
```

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** PASS

All technology choices verified compatible (March 2026): Next.js 14.2 + Serwist 9.5, Next.js 14.2 + MapLibre 5.19 (dynamic import), MapLibre 5.19 + PMTiles 4.4 (addProtocol), Vitest + Next.js 14, Playwright 1.58 + Vercel preview, SWR + React 18, shadcn/ui + Tailwind 3.4, Photon Komoot 1.0 (client-direct, CORS-friendly). No version conflicts detected.

**Pattern Consistency:** PASS

File naming (PascalCase components, kebab-case utils) consistent with V1 and Next.js conventions. Import aliases (`@/`) configured in tsconfig.json and vitest.config.ts. Route Handler response format consistent across all API routes. MapLibre layer pattern (add/remove, idempotent) applies uniformly to all 6 layers. SWR hook naming consistent across all 3 data hooks.

**Structure Alignment:** PASS

3-tier component organization maps cleanly to the technology stack. MapContext as single communication channel prevents prop-drilling. Route Handlers follow App Router convention. E2E tests separated from unit tests per pattern definition.

### Requirements Coverage Validation

**Functional Requirements Coverage:** PASS (37/37)

| FR Category | FRs | Architectural Support |
|-------------|-----|----------------------|
| Map Discovery (FR1–5) | 5 | MapContainer + ScoreDotLayer + ZoneHighlight |
| Zone Info & Score (FR6–11) | 6 | IrisPopup + noise-categories.ts + DataProvenance + ShareCard |
| Address Search (FR12–15) | 4 | SearchBar + usePhotonSearch + MapContext.setSelectedZone |
| Data Layers (FR16–23) | 8 | RumeurLayer + ChantiersLayer + ElectionsLayer + AppNav toggles |
| Real-Time & Freshness (FR24–27) | 4 | /api/rumeur + SWR polling + DataProvenance timestamps |
| PWA & Offline (FR28–31) | 4 | sw.ts (Serwist) + OfflineBanner + PWAInstallPrompt + localStorage |
| Accessibility & Legal (FR32–37) | 6 | TextAlternativeView + app/accessible + error.tsx + footer links |

**Non-Functional Requirements Coverage:** PASS

All 7 NFR categories covered: Performance (LHCI guards), Security (CSP + proxy), Scalability (static-first), Accessibility (LHCI a11y >= 95), Reliability (graceful degradation), Maintainability (Vitest + Playwright + CI), Privacy (zero cookies, no PII).

### Implementation Readiness Validation

**Decision Completeness:** PASS — 15 decisions documented with versions, rationale, affected components. All versions web-verified.

**Structure Completeness:** PASS — 50+ files defined, every TAC mapped to specific files, data flow diagram documents all integration paths.

**Pattern Completeness:** PASS — 10 enforcement rules, naming conventions across all categories, error handling per layer, loading states per component.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps (non-blocking):**

1. `iris-centroids.geojson` generation — data pipeline task (turf.js centroid), to be done before TAC-29.
2. Map base style URL — Protomaps style choice deferred to TAC-29 implementation.
3. Contact form (FR35–36) — simplest pattern: mailto or free form service (Formspree/Tally.so).

**Nice-to-Have Gaps:**

4. Share deep link URL pattern (`/?zone=iris-code`) — simple, define during implementation.
5. Character notes data source — editorial content, not architectural.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed (37 FRs, 7 NFR categories)
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (8 constraints)
- [x] Cross-cutting concerns mapped (6 concerns)

**Architectural Decisions**

- [x] Critical decisions documented with versions (15 decisions)
- [x] Technology stack fully specified (all web-verified March 2026)
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined (50+ files)
- [x] Component boundaries established
- [x] Integration points mapped (5 API boundaries)
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**

1. Zero ambiguity on technology versions — every dependency web-verified with exact semver ranges.
2. Brownfield migration path is low-risk — each TAC is independently deployable and testable.
3. $0 infrastructure is architecturally enforced — no paid API in the dependency graph.
4. AI agent consistency is strong — 10 explicit enforcement rules, pattern examples, and anti-patterns.
5. Every FR and NFR traces to specific files and components — no orphaned requirements.

**Areas for Future Enhancement (V3):**

- Permis de construire data layer (research complete, architecture supports it)
- PLU urban planning data enrichment
- Photon self-hosting or BAN migration at scale
- RUMEUR SSE streaming (Vercel Pro)
- B2B API design and authentication
- Next.js 15/16 upgrade (post-V2 stabilization)

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- When in doubt, choose the simpler option that respects $0 infra and calm-first UX

**First Implementation Priority:** TAC-29 (MapLibre migration) — replace mapbox-gl and react-map-gl with direct MapLibre GL JS 5.19 + PMTiles 4.4. This unblocks all subsequent TACs.

---

## V3 Architecture — Ambient Intelligence, Routing & B2B

### V3 Context & Scope Delta

**What V3 adds on top of V2:**

V2 made Paris acoustic data visible and searchable. V3 makes it **actionable and ambient**: the city becomes navigable by sound, and the app acts as a background agent that surfaces insights without being asked. V3 also introduces the first revenue layer (B2B certified reports) and the first native mobile distribution channel (iOS via Expo).

**Baseline assumption:** V2 architecture (above) is fully delivered. All V2 decisions, patterns, and boundaries remain in force unless explicitly superseded below. V3 is a delta — not a rewrite.

**Five net-new capability clusters:**

| # | Capability | V3 Phase | Key New Dependencies |
|---|-----------|----------|---------------------|
| 1 | **Zone Intelligence Agent** (`/api/enrich`) | V3.0 MVP | Claude Haiku API, `@anthropic-ai/sdk` |
| 2 | **Calm Route Planner** (acoustic-weighted pedestrian routing) | V3.0 MVP | `@turf/turf`, IRIS adjacency graph |
| 3 | **iOS Native App** (React Native / Expo) | V3.0 MVP | Expo SDK, `@maplibre/maplibre-react-native`, EAS Build |
| 4 | **Ambient Push Agent** (proactive RUMEUR-triggered notifications) | V3.1 Growth | Expo Push Service, Vercel Cron |
| 5 | **B2B Certified Reports** (auth, dashboard, PDF export, Stripe billing) | V3.1 Growth | NextAuth.js / custom JWT, Stripe, server-side PDF |

**New architectural constraints vs V2:**

| Constraint | Source | Impact |
|-----------|--------|--------|
| **Multi-platform** (web PWA + iOS RN) | PRD V3 | Shared business logic ≥ 70%; platform-specific UI layers |
| **LLM in the critical path** | Story 6.0 `/api/enrich` | Non-blocking by design; 1.5s timeout + fallback; 15-min cache |
| **Server-side secrets expansion** | Claude API + Stripe + B2B JWT | `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `JWT_SECRET` — all server-only |
| **App Store compliance** | iOS distribution | Privacy manifest, `Info.plist` rationale strings, no IDFA |
| **EU AI Act (Art. 52)** | NLQ + ambient agent use LLM | Transparency disclosure on first NLQ interaction |
| **Location-sensitive personal data** | Ambient agent + saved routes | RGPD Art. 9 — explicit opt-in; data minimisation; deletion flow |
| **Solo founder sequencing** | Resource reality | All stories sequenceable without parallel workstreams; no story blocks another unless noted |
| **$0 variable infra for V3.0 MVP** | Continuity from V2 | Vercel Hobby for MVP; Vercel Pro ($20/mo) accepted for V3.1 SSE + push cron |

### Phase Breakdown

**V3.0 MVP — Ambient Intelligence + Routing + iOS Shell**

The MVP is validated when:
1. Expo Go QR scan → app running on physical iPhone in < 60s
2. Calm pedestrian route A→B computed and displayed in < 4s
3. `/api/enrich` (Story 6.0) enriches zone popup with Haiku summary
4. Story 6.1 time-aware weighting live (zero UI, automatic)
5. Story 6.2 intent layer (one-tap, localStorage)
6. IrisPopup design sprint output implemented
7. EAS Build → TestFlight pipeline running in CI (< 15 min)

**V3.1 Growth — Push + NLQ + B2B + Android**

Sequenced priorities:
1. Story 6.4: Ambient push alerts (highest retention leverage)
2. NLQ: structured spatial query + `/api/enrich` formatting
3. B2B: auth + acoustic dashboard + Stripe billing
4. B2B: certified PDF export
5. Android EAS Build
6. NLQ conversation history
7. Offline route caching
8. Ambient agent personalisation (threshold learning)

**V3.2+ Expansion — Routes + Scale + Cities**

- Thematic routes (nature, street art, food, coffee)
- OSRM/GraphHopper integration (replace turf.js for longer routes)
- Waze-for-Noise crowdsourcing
- B2B team seats + white-label
- Expansion hors Paris (Lyon, Marseille, Bruxelles)
- Voice-first NLQ
- SSE real-time streaming (Vercel Pro)

### V3 Core Architectural Decisions

#### Decision 6.1 — React Native / Expo Bridge

**Context:** V3 requires a native iOS app for App Store distribution, push notifications, and background location access. The existing V2 codebase is Next.js web-only.

**Decision:** React Native via Expo SDK. Expo Go for dev iteration (QR scan → device in < 60s). EAS Build for TestFlight / App Store distribution. Shared business logic with Next.js PWA at ≥ 70%.

**Monorepo structure:**

```
tacet/                          # Existing Next.js PWA (V2 — unchanged)
tacet-mobile/                   # New RN/Expo app (V3)
packages/shared/                # Shared business logic (V3)
```

**Shared layer (`packages/shared/`):**
- `noise-categories.ts` — Score Sérénité computation (moved from `tacet/src/lib/`)
- `constants.ts` — `PARIS_CENTER`, `DEFAULT_ZOOM`, tier colors, etc.
- `types/` — `IrisZone`, `RumeurSensor`, `ChantierFeature`, `LayerId`, `EnrichmentResponse`
- `hooks/` — `useRumeurData`, `useChantiersData`, `usePhotonSearch`, `useEnrichment` (SWR hooks — platform-agnostic via `swr`)
- `lib/fetcher.ts` — SWR global fetcher
- `lib/format-date.ts` — relative time helper

**Platform-specific layers:**
- `tacet/` — Next.js pages, MapLibre GL JS (WebGL), Serwist SW, shadcn/ui components
- `tacet-mobile/` — Expo screens, `@maplibre/maplibre-react-native`, `react-native-safe-area-context`, Expo Push

**Map library split:**
- Web: MapLibre GL JS 5.19 (direct, `useRef` + `useEffect`, dynamic import) — unchanged from V2
- iOS: `@maplibre/maplibre-react-native` — React Native wrapper, declarative API, PMTiles via custom tile source

**Key version decisions (V3):**

| Dependency | Target | Rationale |
|-----------|--------|-----------|
| Expo SDK | latest stable | Expo Go + EAS Build + OTA updates |
| `@maplibre/maplibre-react-native` | latest stable | Official RN binding for MapLibre |
| `react-native-safe-area-context` | latest | Dynamic Island, notch, home indicator |
| `@anthropic-ai/sdk` | latest | Claude Haiku calls in `/api/enrich` |
| `@turf/turf` | latest (modular imports) | IRIS adjacency graph, routing, spatial ops |
| Stripe SDK (`stripe`) | latest | B2B billing (server-side) |
| `expo-notifications` | latest | Push notification handling |

**Rationale for Expo over bare RN:** Solo founder velocity. Expo Go eliminates simulator build cycles during dev. EAS Build handles signing, TestFlight upload, and OTA updates. The geospatial + LLM feature set does not require native modules outside Expo's managed workflow.

**Next.js version:** Stays at 14.2.x for V3.0. Upgrade to 15.x deferred to V3.1 or later — same rationale as V2 (avoid mid-migration framework upgrade).

#### Decision 6.2 — `/api/enrich` Zone Intelligence Agent

**Context:** IrisPopup now has 5+ signal types (PPBE score, RUMEUR live, Chantiers, micro-reports, day/night levels, intent). Adding signals without a synthesis layer creates visual noise. Inspired by Aino (urban planning agent).

**Decision:** Server-side Route Handler that assembles zone context and calls Claude Haiku to produce a ranked, human-readable synthesis. The agent decides which 1–2 signals matter; the UI renders only those.

**Route Handler:** `app/api/enrich/route.ts`

```typescript
// POST /api/enrich
// Request body:
{
  zone_code: string,
  zone_name: string,
  arrondissement: string,
  noise_level: number,
  day_level: number,
  night_level: number,
  score_serenite: number,
  current_iso_timestamp: string,
  intent?: "logement" | "calme_maintenant" | "informer" | "ambient_push" | "nlq" | null,
  rumeur_sensor?: { leq: number, distanceM: number } | null,
  nearby_chantiers?: { count: number, nearestDistanceM: number } | null,
  recent_reports?: number | null
}

// Response:
{
  summary: string,           // 1–2 sentences, French, mobile-readable
  primary_signal: "rumeur" | "chantier" | "reports" | "score" | "night",
  secondary_signal?: same,
  confidence: "high" | "low",
  cachedAt: string           // ISO timestamp
}
```

**LLM configuration:**
- Model: `claude-haiku-4-5-20251001` — hardcoded. No upgrade without explicit cost review.
- System prompt: French, < 150 tokens. Tone: calm, factual, useful. Never repeats the score — enriches it.
- Target latency: < 800ms server-side (fires in parallel with RUMEUR/Chantiers fetches)
- Cache key: `enrich-${zone_code}-${Math.floor(Date.now() / 900_000)}-${intent ?? 'none'}` (15-min TTL)
- Cost: ~$0.0004/call. At 10k MAU with 80% cache hit rate: ~$24/month.

**Graceful degradation:** If call fails or exceeds 1.5s → IrisPopup renders current default template unchanged. The enrichment is **additive, never blocking**. `confidence: "low"` → UI falls back to default rendering.

**Feature flag:** `NEXT_PUBLIC_ENABLE_ENRICHMENT` (off by default, on in staging).

**What this unlocks:** Stories 6.1–6.4 pass signal data through the agent rather than building separate UI logic. The IrisPopup design sprint only needs to solve one problem: render `{ summary, primary_signal, secondary_signal }` beautifully.

#### Decision 6.3 — Calm Route Engine

**Context:** No competitor routes pedestrians by acoustic quality. The PPBE + RUMEUR combination is unique to Tacet.

**Decision (V3.0 MVP):** IRIS zone adjacency graph computed from `paris-noise-iris.geojson` via `@turf/turf`. Walking routes weighted by Score Sérénité of traversed zones. No external routing API for MVP.

**Routing algorithm (MVP):**

1. **Adjacency graph generation** (build-time script):
   - Input: `paris-noise-iris.geojson` (992 IRIS polygons)
   - Compute: `@turf/boolean-touches` or shared-boundary detection for all IRIS pairs
   - Output: `public/data/iris-adjacency.json` — `{ [irisCode]: { neighbors: string[], centroid: [lng, lat], score: number } }`
   - One-time generation; regenerated only when GeoJSON source updates

2. **Route computation** (client-side):
   - Input: origin + destination (Photon geocoding → coordinates)
   - `@turf/point-in-polygon` to identify origin/destination IRIS zones
   - Dijkstra/A* over adjacency graph, edge weight = `100 - score_serenite` (lower score = higher cost)
   - Output: ordered list of IRIS zone codes + composite serenity score + estimated walk time (centroid-to-centroid distances)
   - Target: < 4s for any A→B within Paris intra-muros

3. **Route display**:
   - Polyline connecting zone centroids (simplified for MVP)
   - Colored by per-segment serenity score (reuses tier color palette)
   - Composite score shown in route card

**Decision (V3.2+ Growth):** Replace turf.js adjacency with OSRM or GraphHopper for street-level routing. Acoustic weighting applied as a custom cost function on street segments (mapped to IRIS zone scores). Self-hosted or managed instance. Deferred until adjacency routing proves the concept.

**Mid-route rerouting (V3.1):** When RUMEUR detects a noise spike along an active route, the `/api/enrich` agent with `intent: "route_reroute"` suggests a detour. Deterministic trigger (RUMEUR delta ≥ 15 dB from zone baseline), LLM only for copy.

#### Decision 6.4 — Push Notification Architecture

**Context:** Ambient agent surfaces insights without user initiation — noise spikes, quiet windows, construction starts near saved zones.

**Decision:** Expo Push Notification service (APNs for iOS, FCM for Android). Server-side trigger logic via Vercel Cron. LLM generates notification copy only — never the trigger.

**Architecture:**

```
[Vercel Cron — every 3 min]
      ↓
[/api/cron/ambient-check]
  1. Fetch current RUMEUR readings
  2. Compare vs 7-day rolling average per zone
  3. Check micro-report accumulation per pinned zone
  4. For each triggered event:
      ↓
  [/api/enrich with intent="ambient_push"]
      ↓
  [Expo Push API → APNs/FCM]
      ↓
  [User device notification]
```

**Trigger rules (deterministic, no LLM):**
- Zone score improves ≥ 10 pts vs 7-day rolling average → quiet window notification
- RUMEUR reading ≥ 75 dB in a pinned zone → noise spike notification
- ≥ 3 micro-reports in 1 hour for a pinned zone → crowd signal notification
- New chantier starts within 400m of a saved route → construction alert

**Cadence cap:** Maximum 1 push/day/user regardless of trigger count. Server-side enforcement.

**Permission request timing:** After first value moment only (first route completed or first NLQ result). Never on first launch.

**Copy generation:** `/api/enrich` with `intent: "ambient_push"`. Sentiment calibrates to context:
- Quiet window → warm, inviting ("Ce matin, ton quartier respire")
- Noise spike → calm, informative ("Niveau inhabituel détecté — probablement temporaire")
- Chantier start → practical ("Un chantier commence rue de la Roquette lundi")

**V3.0 MVP:** Push architecture is designed but **not shipped**. Story 6.4 is V3.1. V3.0 builds the `/api/enrich` and cron infrastructure that V3.1 push depends on.

**Vercel Cron:** Hobby tier supports cron (1/day minimum interval). 3-min ambient check requires **Vercel Pro** ($20/mo) — accepted for V3.1.

#### Decision 6.5 — B2B Auth & Billing

**Context:** B2B certified reports are the first revenue layer. Studios, architects, coworkings need acoustic evidence for lease negotiations and sound-proofing budgets.

**Decision:** Self-contained B2B module. JWT auth + Stripe billing + server-side PDF generation. Entirely V3.1 — not in V3.0 MVP.

**Auth:**
- Email + password registration (no OAuth for MVP B2B)
- Short-lived JWTs (< 1h expiry) with refresh token rotation
- Server-side session validation on every B2B Route Handler
- TOTP 2FA as growth feature (V3.2+)
- User data stored in a lightweight database (Vercel Postgres or Supabase — first database in Tacet, B2B only)

**RBAC:**

| Role | Capabilities |
|------|-------------|
| **Free (B2C)** | Map, zones, NLQ (10 queries/day), routes, ambient agent |
| **B2B Pro** (€99/mo) | All Free + acoustic dashboard + unlimited PDF export + address history + priority support |
| **B2B Enterprise** (€200/mo) | All Pro + multi-address batch export + API access + white-label + SLA |

**Billing:**
- Stripe Checkout for subscription creation
- Stripe Webhooks for payment events (validated via HMAC signature — NFR-S3)
- Invoice PDF download via Stripe Dashboard link
- Route Handlers: `app/api/b2b/subscribe/route.ts`, `app/api/b2b/webhook/route.ts`

**PDF Export:**
- Server-side only (NFR-S5) — no client-side PDF construction
- Content: data source attribution (Bruitparif, PPBE cycle, Etalab), methodology disclaimer, acoustic profile (day/night/weekend breakdown), risk flags, generation timestamp
- Disclaimer: "à titre informatif — ne constitue pas un acte réglementaire" (non-removable footer)
- Route Handler: `app/api/b2b/report/route.ts`
- Target: < 10s generation time

**Database (first in Tacet):**
- Vercel Postgres (managed, serverless-friendly) or Supabase
- Tables: `users`, `subscriptions`, `report_history`, `api_keys`
- B2B data only — B2C remains zero-database (localStorage/sessionStorage)
- RGPD deletion flow: account + all associated data within 30 days

#### Decision 6.6 — NLQ Pipeline

**Context:** Natural language query collapses UX complexity — a single sentence replaces zone selection → layer toggle → filter. "Café calme sous 55 dB près de République avec Wi-Fi."

**Decision:** Structured spatial query → LLM formatting pipeline. The LLM translates intent; the data is ground truth. Entirely V3.1.

**Pipeline:**

```
[User NLQ input]
      ↓
[/api/nlq/route.ts]
  1. Send query to Claude Haiku with structured prompt
  2. LLM extracts: { type, location, maxNoise, amenities, radius }
  3. Structured spatial query against IRIS data + OSM POI
  4. Candidate set ranked by acoustic score
  5. /api/enrich with intent="nlq" formats results
      ↓
[Ranked, mapped result set → UI]
```

**Constraints:**
- NLQ free tier: 10 queries/day/user (server-side rate limit — NFR-SC3)
- B2B Pro/Enterprise: unlimited
- EU AI Act transparency: disclosure on first NLQ use per device (NFR-C3)
- Results always sourced from structured Tacet data — LLM formats, does not invent
- Source citation mandatory in every result ("basé sur PPBE 2024 + RUMEUR en direct")
- Target: query → map render total < 3s (NFR-P7)

**NLQ queries referencing identifiable location data:** Not persisted beyond session without explicit consent (NFR-S7).

#### Decision 6.7 — State Management Evolution

**Context:** V2 uses a single `MapContext` for UI state + SWR for server data. V3 adds cross-platform shared state, routing state, intent state, and B2B session state.

**Decision:** Preserve V2 patterns. Extend, don't replace.

**V3 state additions:**

| State | Storage | Platform | Scope |
|-------|---------|----------|-------|
| `intent` | localStorage | Web + RN (AsyncStorage) | Session — persists across sessions, resettable |
| `enrichment` | SWR cache (15-min TTL) | Web + RN | Per zone per hour bucket |
| `activeRoute` | React state (MapContext extension) | Web + RN | Ephemeral — cleared on navigation |
| `savedRoutes` | localStorage / AsyncStorage | Web + RN | Persistent |
| `pushOptIn` | localStorage / AsyncStorage | Web + RN | Persistent |
| `b2bSession` | JWT in httpOnly cookie (web) / SecureStore (RN) | Web + RN | Short-lived (< 1h) |
| `nlqHistory` | sessionStorage (web) / React state (RN) | Web + RN | Ephemeral per session |

**MapContext extension (V3):**

```typescript
interface MapContextValue {
  // V2 (preserved)
  selectedZone: IrisZone | null
  setSelectedZone: (zone: IrisZone | null) => void
  activeLayers: Set<LayerId>
  toggleLayer: (id: LayerId) => void
  pinnedZones: IrisZone[]
  pinZone: (zone: IrisZone) => void
  unpinZone: (zoneId: string) => void
  expertMode: boolean
  toggleExpertMode: () => void
  mapRef: React.RefObject<maplibregl.Map | null>

  // V3 additions
  intent: Intent | null                    // "logement" | "calme_maintenant" | "informer"
  setIntent: (intent: Intent | null) => void
  activeRoute: CalmRoute | null            // computed route being displayed
  setActiveRoute: (route: CalmRoute | null) => void
  savedRoutes: CalmRoute[]                 // localStorage-backed
  saveRoute: (route: CalmRoute) => void
  removeRoute: (routeId: string) => void
}
```

**Rule:** Shared hooks in `packages/shared/hooks/` use SWR (works in both web and RN). Platform-specific state (MapContext) stays in each app. No Zustand, no Redux — state surface remains small enough for Context + SWR.

#### Decision 6.8 — Security & Compliance Additions

**New secrets (V3):**

| Secret | Location | Used By |
|--------|----------|---------|
| `ANTHROPIC_API_KEY` | Vercel env var | `/api/enrich`, `/api/nlq` |
| `STRIPE_SECRET_KEY` | Vercel env var | `/api/b2b/subscribe`, `/api/b2b/webhook` |
| `STRIPE_WEBHOOK_SECRET` | Vercel env var | `/api/b2b/webhook` (HMAC validation) |
| `JWT_SECRET` | Vercel env var | B2B auth token signing |
| `DATABASE_URL` | Vercel env var | B2B Postgres connection |

All server-side only. None bundled in RN app binary or web client JS.

**EU AI Act compliance (Art. 52):**
- NLQ and ambient agent are limited-risk AI systems requiring transparency disclosure
- First NLQ session: one-time banner "Vous interagissez avec un système IA" — persisted in localStorage (NFR-C3)
- All NLQ results: "basé sur PPBE 2024 + RUMEUR en direct" source citation
- NLQ results are advisory only — no automated decision-making with legal effects

**App Store compliance:**
- Privacy manifest (`PrivacyInfo.xcprivacy`) complete before first submission
- All `Info.plist` location usage strings specific and honest
- No IDFA (NFR-C4)
- Permissions requested only at value moments (Decision 6.4)
- TestFlight external beta review before public submission

**RGPD additions (V3):**
- Location data (saved zones, route history, ambient agent triggers): explicit opt-in consent
- NLQ queries with location references: not persisted beyond session without consent (NFR-S7)
- B2B user data: RGPD data subject rights — deletion within 30 days (NFR-C2)
- Data minimisation: collect only per-session needs; no passive location tracking unless ambient agent explicitly enabled

**CSP header update (V3):**

```
connect-src 'self'
  https://photon.komoot.io
  https://*.protomaps.com
  https://api.anthropic.com        # /api/enrich server-side (not client — but CORS preflight)
  https://api.stripe.com           # B2B billing
  https://exp.host                 # Expo Push (RN only)
```

Note: Claude API and Stripe calls are server-side only. CSP `connect-src` additions are for webhook/redirect flows, not direct client calls.

### V3 Implementation Patterns & Consistency Rules

#### LLM Call Pattern (Non-Blocking, Cached, Feature-Flagged)

Every LLM integration in V3 follows the same pattern:

```typescript
// Pattern: non-blocking enrichment call
async function fetchEnrichment(zoneContext: EnrichmentRequest): Promise<EnrichmentResponse | null> {
  const cacheKey = `enrich-${zoneContext.zone_code}-${Math.floor(Date.now() / 900_000)}-${zoneContext.intent ?? 'none'}`

  // 1. Check cache first
  const cached = cache.get(cacheKey)
  if (cached) return cached

  // 2. Call with timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: ENRICHMENT_SYSTEM_PROMPT,    // French, < 150 tokens
      messages: [{ role: 'user', content: JSON.stringify(zoneContext) }],
      signal: controller.signal
    })
    const result = parseEnrichmentResponse(response)
    cache.set(cacheKey, result, TTL_15_MIN)
    return result
  } catch {
    return null   // Graceful degradation — UI renders default
  } finally {
    clearTimeout(timeout)
  }
}
```

**Rules:**
1. Model hardcoded to `claude-haiku-4-5-20251001` — no upgrade without cost review
2. Always behind a feature flag (`NEXT_PUBLIC_ENABLE_ENRICHMENT`, `NEXT_PUBLIC_ENABLE_NLQ`)
3. Cache per `(zone_code, hour_bucket, intent)` — 15-min TTL
4. 1.5s hard timeout — abort and return null
5. `confidence: "low"` → UI falls back to default rendering
6. Never in client bundle — server-side Route Handler only
7. System prompt in French, < 150 tokens, calm/factual tone

#### Push Notification Pattern (Deterministic Trigger → LLM Copy)

```
[Trigger Logic]        →  [Copy Generation]     →  [Delivery]
Server-side cron          /api/enrich               Expo Push API
Deterministic rules       intent="ambient_push"     APNs / FCM
No LLM involved           Sentiment-calibrated      1/day/user cap
```

**Rules:**
1. The LLM is never the trigger — it is the voice
2. Trigger logic is deterministic: RUMEUR delta ≥ 10 pts, micro-reports ≥ 3/hour, chantier start
3. Cadence cap: 1 push/day/user — server-side enforcement, no exceptions
4. Permission requested only after first value moment (route completed or NLQ result)
5. Deep link: every notification opens directly to the relevant zone
6. Idempotent: re-running the same cron window must not duplicate notifications (NFR-R3)

#### B2B Route Handler Gating Pattern

Every B2B-gated endpoint follows this middleware pattern:

```typescript
// app/api/b2b/report/route.ts
import { verifyB2BSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await verifyB2BSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.hasActiveSubscription) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
  }
  // ... proceed with B2B logic
}
```

**Rules:**
1. Subscription status checked server-side on every request (NFR-S4) — never client-side only
2. JWT validation via `verifyB2BSession` — checks expiry, signature, and subscription status
3. All B2B routes under `app/api/b2b/` — clear boundary separation from B2C routes
4. Stripe webhook signature validation on all billing events (NFR-S3)
5. Rate limiting on NLQ: 10/day for free tier, unlimited for B2B Pro/Enterprise

#### Expo/RN Component Sharing Pattern

```
packages/shared/              # Platform-agnostic (pure TS, no JSX)
├── hooks/useEnrichment.ts    # SWR hook — works in web + RN
├── hooks/useRumeurData.ts    # SWR hook
├── lib/noise-categories.ts   # Pure computation
├── lib/constants.ts          # Shared constants
└── types/                    # Shared TypeScript types

tacet/src/components/         # Web-specific (React + DOM)
├── tacet/IrisPopup.tsx       # Web IrisPopup (shadcn/ui, bottom sheet)
└── map/MapContainer.tsx      # Web MapLibre GL JS

tacet-mobile/src/screens/     # RN-specific (React Native)
├── ZoneDetail.tsx            # RN equivalent of IrisPopup
└── MapScreen.tsx             # @maplibre/maplibre-react-native
```

**Rules:**
1. Shared layer = pure TypeScript + SWR hooks — no JSX, no platform imports
2. `packages/shared/` never imports from `react-native` or `next`
3. Platform-specific UI stays in its app directory
4. SWR works in both environments — the fetcher is the only platform-specific part
5. Types are defined once in `packages/shared/types/` — both apps import from there

#### Routing Computation Pattern

```typescript
// packages/shared/lib/route-engine.ts
export function computeCalmRoute(
  origin: [number, number],       // [lng, lat]
  destination: [number, number],
  adjacencyGraph: AdjacencyGraph,
  irisZones: Map<string, IrisZone>
): CalmRoute | null {
  const originZone = findContainingZone(origin, irisZones)    // @turf/boolean-point-in-polygon
  const destZone = findContainingZone(destination, irisZones)
  if (!originZone || !destZone) return null

  // Dijkstra with acoustic cost: weight = 100 - score_serenite
  const path = dijkstra(adjacencyGraph, originZone.code, destZone.code)
  if (!path) return null

  return {
    id: generateId(),
    zones: path.zones,
    polyline: path.zones.map(z => adjacencyGraph[z].centroid),
    compositeScore: mean(path.zones.map(z => irisZones.get(z)!.score)),
    estimatedMinutes: estimateWalkTime(path.totalDistanceM),
    createdAt: new Date().toISOString()
  }
}
```

**Rules:**
1. Route engine is pure TypeScript in `packages/shared/` — works in web + RN
2. Adjacency graph is a static JSON file generated at build time (not computed per request)
3. Edge weight = `100 - score_serenite` — lower score = higher cost = avoided
4. RUMEUR live data optional overlay: if available, adjust edge weights for zones with active RUMEUR readings
5. Fallback: "Aucun itinéraire calme trouvé" if no path exists — never crash

#### V3 Naming Patterns (Additions)

| Category | Convention | Example |
|----------|-----------|---------|
| RN screens | PascalCase `.tsx` | `MapScreen.tsx`, `ZoneDetail.tsx`, `RouteInput.tsx` |
| Shared hooks | camelCase `use` prefix `.ts` | `useEnrichment.ts`, `useCalmRoute.ts` |
| Shared lib | kebab-case `.ts` | `route-engine.ts`, `adjacency-graph.ts` |
| B2B Route Handlers | `app/api/b2b/{resource}/route.ts` | `app/api/b2b/report/route.ts` |
| Cron Route Handlers | `app/api/cron/{job}/route.ts` | `app/api/cron/ambient-check/route.ts` |
| Feature flags | `NEXT_PUBLIC_ENABLE_{FEATURE}` | `NEXT_PUBLIC_ENABLE_ENRICHMENT`, `NEXT_PUBLIC_ENABLE_NLQ` |

#### V3 Enforcement Rules (Additions to V2 Rules)

All V2 enforcement rules (1–10) remain in force. V3 adds:

11. All LLM calls use `claude-haiku-4-5-20251001` — no model upgrade without explicit cost review
12. All LLM calls are non-blocking with 1.5s hard timeout — UI renders default on failure
13. All LLM integrations behind feature flags — off by default in production until validated
14. All B2B Route Handlers verify JWT + subscription status server-side — never client-side gating
15. Push notification trigger logic is deterministic — LLM generates copy only, never triggers
16. Push cadence capped at 1/day/user — server-side enforcement
17. Shared business logic lives in `packages/shared/` — no platform-specific imports
18. Route engine uses IRIS adjacency graph (static JSON) — no runtime graph computation
19. All V3 secrets (`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `JWT_SECRET`, `DATABASE_URL`) server-side only — never in client or RN bundle
20. EU AI Act transparency disclosure on first NLQ session — persisted in localStorage

### V3 Project Structure Additions

```
project-root/
├── tacet/                                    # THE WEB APP (Next.js 14 — V2, preserved)
│   └── src/
│       └── app/
│           └── api/
│               ├── rumeur/route.ts           # V2 (preserved)
│               ├── chantiers/route.ts        # V2 (preserved)
│               ├── enrich/route.ts           # V3.0: Zone intelligence agent
│               ├── nlq/route.ts              # V3.1: NLQ query pipeline
│               ├── cron/
│               │   └── ambient-check/route.ts # V3.1: Push trigger cron
│               └── b2b/
│                   ├── auth/route.ts          # V3.1: B2B login/register
│                   ├── subscribe/route.ts     # V3.1: Stripe subscription
│                   ├── webhook/route.ts       # V3.1: Stripe webhooks
│                   ├── report/route.ts        # V3.1: PDF export
│                   └── dashboard/route.ts     # V3.1: Acoustic dashboard data
│
├── tacet-mobile/                             # THE MOBILE APP (React Native / Expo — V3.0)
│   ├── app/                                  # Expo Router file-based routing
│   │   ├── (tabs)/
│   │   │   ├── index.tsx                     # Map screen (main)
│   │   │   ├── route.tsx                     # Route planner screen
│   │   │   └── settings.tsx                  # Settings + push opt-in
│   │   ├── zone/[code].tsx                   # Zone detail (IrisPopup equivalent)
│   │   └── _layout.tsx                       # Root layout + safe area
│   ├── components/
│   │   ├── MapView.tsx                       # @maplibre/maplibre-react-native wrapper
│   │   ├── ZonePopup.tsx                     # RN zone detail card
│   │   ├── RouteCard.tsx                     # Route result display
│   │   ├── IntentPicker.tsx                  # One-tap intent selector
│   │   └── SerenityBadge.tsx                 # Score badge (RN)
│   ├── app.json                              # Expo config
│   ├── eas.json                              # EAS Build config (TestFlight + App Store)
│   ├── metro.config.js                       # Metro bundler (monorepo support)
│   └── tsconfig.json
│
├── packages/
│   └── shared/                               # SHARED BUSINESS LOGIC (V3.0)
│       ├── hooks/
│       │   ├── useEnrichment.ts              # SWR: /api/enrich
│       │   ├── useCalmRoute.ts               # Route computation hook
│       │   ├── useRumeurData.ts              # Moved from tacet/src/hooks/
│       │   ├── useChantiersData.ts           # Moved from tacet/src/hooks/
│       │   ├── usePhotonSearch.ts            # Moved from tacet/src/hooks/
│       │   └── useOnlineStatus.ts            # Moved from tacet/src/hooks/
│       ├── lib/
│       │   ├── noise-categories.ts           # Moved from tacet/src/lib/
│       │   ├── noise-categories.test.ts
│       │   ├── constants.ts                  # Moved from tacet/src/lib/
│       │   ├── fetcher.ts                    # Moved from tacet/src/lib/
│       │   ├── format-date.ts               # Moved from tacet/src/lib/
│       │   ├── route-engine.ts               # IRIS adjacency Dijkstra (V3.0)
│       │   ├── route-engine.test.ts
│       │   └── adjacency-graph.ts            # Graph loader/query helpers
│       ├── types/
│       │   ├── iris.ts                       # IrisZone, IrisFeature, IrisProperties
│       │   ├── rumeur.ts                     # RumeurSensor, RumeurResponse
│       │   ├── chantiers.ts                  # ChantierFeature, ChantierProperties
│       │   ├── layers.ts                     # LayerId union type
│       │   ├── enrichment.ts                 # EnrichmentRequest, EnrichmentResponse
│       │   ├── routes.ts                     # CalmRoute, RouteSegment, AdjacencyGraph
│       │   └── intent.ts                     # Intent union type
│       ├── package.json
│       └── tsconfig.json
│
├── scripts/
│   ├── generate-centroids.ts                 # V2 (preserved)
│   └── generate-adjacency-graph.ts           # V3.0: IRIS adjacency from GeoJSON
│
├── data/                                     # V2 (preserved)
│   └── public/data/
│       ├── paris-noise-iris.geojson          # 992 IRIS zones
│       ├── iris-centroids.geojson            # Zone centroids
│       └── iris-adjacency.json              # V3.0: Adjacency graph (generated)
│
├── package.json                              # Root workspace config
├── pnpm-workspace.yaml                       # Monorepo workspace definition
└── turbo.json                                # Turborepo config (optional, for build orchestration)
```

### V3 Component Boundary Diagram

```
packages/shared/ (pure TS — platform-agnostic)
├── useEnrichment()       → SWR → /api/enrich
├── useCalmRoute()        → route-engine.ts → adjacency graph
├── useRumeurData()       → SWR → /api/rumeur
├── useChantiersData()    → SWR → /api/chantiers
├── usePhotonSearch()     → SWR → Photon Komoot
├── noise-categories.ts   → Score Sérénité computation
└── types/                → shared interfaces

tacet/ (Next.js PWA — web platform)
├── MapContext (extended V3: + intent, activeRoute, savedRoutes)
│   ├── MapContainer + all V2 map layers (preserved)
│   ├── SearchBar (preserved)
│   ├── IrisPopup (V3: + enrichment rendering + intent picker)
│   ├── RoutePanel (V3.0: route input + result display)
│   ├── AppNav (preserved, + route entry point)
│   └── OfflineBanner (preserved)
└── /api/ Route Handlers
    ├── /api/enrich (V3.0)
    ├── /api/nlq (V3.1)
    ├── /api/cron/ambient-check (V3.1)
    └── /api/b2b/* (V3.1)

tacet-mobile/ (Expo/RN — iOS platform)
├── MapScreen → @maplibre/maplibre-react-native
├── ZoneDetail → uses useEnrichment() from shared
├── RouteInput → uses useCalmRoute() from shared
├── IntentPicker → localStorage equivalent (AsyncStorage)
└── Push handling → expo-notifications
```

**Data Flow (V3):**

```
                    ┌─────────────────┐
                    │  Bruitparif API  │
                    └────────┬────────┘
                             │ (3-min poll)
                    ┌────────▼────────┐     ┌──────────────┐
                    │  /api/rumeur    │     │  Claude API   │
                    └────────┬────────┘     │  (Haiku)      │
                             │              └──────┬───────┘
    ┌──────────┐    ┌────────▼────────┐           │
    │  Photon  │◄───│   SWR Hooks     │◄──────────┘ /api/enrich
    │  Komoot  │    │ (shared layer)  │
    └──────────┘    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  MapContext (V3) │ + intent, activeRoute, savedRoutes
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐    ┌────────▼────────┐    ┌───────▼───────┐
│  Web PWA    │    │  iOS App (RN)   │    │  /api/b2b/*   │
│  (tacet/)   │    │ (tacet-mobile/) │    │  V3.1         │
└─────────────┘    └─────────────────┘    └───────────────┘
       │                     │
┌──────▼─────────────────────▼──────┐
│  Serwist SW (web) / Expo Push    │
│  Offline cache    Push delivery  │
└──────────────────────────────────┘
```

### V3 Phase → Decision → File Mapping

#### V3.0 MVP Files

| Decision | Story | New/Modified Files |
|----------|-------|--------------------|
| 6.1 Expo bridge | — | `tacet-mobile/` (entire directory), `packages/shared/` (entire directory), `pnpm-workspace.yaml`, root `package.json`, `turbo.json` |
| 6.2 `/api/enrich` | 6.0 | `tacet/src/app/api/enrich/route.ts`, `packages/shared/hooks/useEnrichment.ts`, `packages/shared/types/enrichment.ts` |
| 6.2 (time-aware) | 6.1 | `tacet/src/app/api/enrich/route.ts` (time context in prompt), `packages/shared/lib/noise-categories.ts` (night weighting) |
| 6.2 (intent) | 6.2 | `packages/shared/types/intent.ts`, IrisPopup (intent picker UI), MapContext (intent state) |
| 6.2 (alternatives) | 6.3 | `/api/enrich` (alternatives in response), IrisPopup (alternative zone link) |
| 6.3 Route engine | 6.5a | `packages/shared/lib/route-engine.ts`, `packages/shared/lib/adjacency-graph.ts`, `scripts/generate-adjacency-graph.ts`, `public/data/iris-adjacency.json` |
| 6.3 Route display | 6.5b | `tacet/src/components/tacet/RoutePanel.tsx`, `tacet/src/components/map/RouteLayer.ts`, `tacet-mobile/src/screens/RouteInput.tsx` |
| Design sprint | IrisPopup | `tacet/src/components/tacet/IrisPopup.tsx` (redesign), `tacet-mobile/src/components/ZonePopup.tsx` |
| Shared lib migration | — | Move `noise-categories.ts`, `constants.ts`, `fetcher.ts`, `format-date.ts`, SWR hooks from `tacet/src/` → `packages/shared/` |

#### V3.1 Growth Files

| Decision | Feature | New/Modified Files |
|----------|---------|-------------------|
| 6.4 Push | Ambient alerts | `tacet/src/app/api/cron/ambient-check/route.ts`, `tacet-mobile/` (expo-notifications setup), `packages/shared/types/push.ts` |
| 6.5 B2B auth | Auth + billing | `tacet/src/app/api/b2b/auth/route.ts`, `tacet/src/app/api/b2b/subscribe/route.ts`, `tacet/src/app/api/b2b/webhook/route.ts`, `tacet/src/lib/auth.ts` |
| 6.5 B2B report | PDF export | `tacet/src/app/api/b2b/report/route.ts`, `tacet/src/lib/pdf-generator.ts` |
| 6.5 B2B dashboard | Dashboard data | `tacet/src/app/api/b2b/dashboard/route.ts`, `tacet/src/app/b2b/page.tsx` |
| 6.6 NLQ | Query pipeline | `tacet/src/app/api/nlq/route.ts`, `packages/shared/hooks/useNLQ.ts`, `packages/shared/types/nlq.ts` |
| 6.1 Expo Android | Android build | `tacet-mobile/eas.json` (Android profile), `.github/workflows/eas-build.yml` |

#### V3.2+ Expansion Files

| Feature | New Files |
|---------|----------|
| Thematic routes | `packages/shared/lib/thematic-routes.ts`, editorial content data files |
| OSRM/GraphHopper | `tacet/src/app/api/route/route.ts` (external routing proxy), `packages/shared/lib/route-engine-osrm.ts` |
| SSE streaming | `tacet/src/app/api/rumeur-stream/route.ts`, `packages/shared/hooks/useRumeurStream.ts` |
| Multi-city | `public/data/{city}-noise-iris.geojson`, `public/data/{city}-adjacency.json` |

### V3 Story → TAC Cross-Reference

| Story | PRD V3 FRs | Architecture Decision | Phase |
|-------|-----------|----------------------|-------|
| 6.0 Zone enrichment agent | FR-008 | Decision 6.2 | V3.0 |
| 6.1 Time-aware weighting | FR-007 | Decision 6.2 (time context) | V3.0 |
| 6.2 Intent layer | FR-009 | Decision 6.7 (intent state) | V3.0 |
| 6.3 Proactive alternatives | FR-010 | Decision 6.2 (alternatives) | V3.0 |
| 6.4 Push alerts | FR-020–024 | Decision 6.4 | V3.1 |
| 6.5 Route serenity | FR-014–019 | Decision 6.3 | V3.0 |
| Expo setup | FR-001–004, FR-042–044 | Decision 6.1 | V3.0 |
| IrisPopup design sprint | FR-006, FR-008–012 | Decision 6.2 (UI rendering) | V3.0 |
| NLQ | FR-025–029 | Decision 6.6 | V3.1 |
| B2B auth + billing | FR-030–035 | Decision 6.5 | V3.1 |
| B2B PDF export | FR-032–033 | Decision 6.5 (PDF) | V3.1 |
| Data compliance | FR-036–041 | Decision 6.8 | V3.0–V3.1 |

### V3 Architecture Validation

#### Requirements Coverage

**Functional Requirements Coverage: 44/44 FRs**

| FR Category | FRs | Architectural Support |
|-------------|-----|----------------------|
| Mobile App Foundation (FR-001–004) | 4 | Decision 6.1 — Expo SDK + EAS Build + VoiceOver |
| Acoustic Map & Zone Intelligence (FR-005–013) | 9 | Decision 6.2 — `/api/enrich` + time-aware + intent + alternatives + V2 map preserved |
| Calm Route Planning (FR-014–019) | 6 | Decision 6.3 — turf.js adjacency graph + route display + mid-route reroute |
| Ambient Agent & Push (FR-020–024) | 5 | Decision 6.4 — Expo Push + Vercel Cron + deterministic triggers + LLM copy |
| Natural Language Query (FR-025–029) | 5 | Decision 6.6 — structured spatial query → LLM formatting pipeline |
| B2B Reports & Billing (FR-030–035) | 6 | Decision 6.5 — JWT auth + Stripe + server-side PDF |
| Data Compliance & Attribution (FR-036–041) | 6 | Decision 6.8 — EU AI Act, App Store, RGPD, ODbL |
| Developer Workflow (FR-042–044) | 3 | Decision 6.1 — Expo Go QR dev + HMR + EAS Build CI/CD |

**Non-Functional Requirements Coverage: 34/34 NFRs**

| NFR Category | Count | Architectural Support |
|-------------|-------|----------------------|
| Performance (NFR-P1–P7) | 7 | `/api/enrich` 800ms target + 1.5s timeout (P1), route < 4s (P2), LCP/CWV (P3–P5), Expo Go < 60s (P6), NLQ < 3s (P7) |
| Security (NFR-S1–S7) | 7 | All secrets server-side (S1), JWT short-lived (S2), Stripe HMAC (S3), server-side gating (S4), server-side PDF (S5), TLS (S6), NLQ privacy (S7) |
| Reliability (NFR-R1–R4) | 4 | RUMEUR fallback (R1), enrichment non-blocking (R2), idempotent cron (R3), OTA backward-compat (R4) |
| Scalability (NFR-SC1–SC3) | 3 | Vercel auto-scale (SC1), enrich cache 80%+ hit (SC2), NLQ rate limit (SC3) |
| Accessibility (NFR-A1–A5) | 5 | RGAA web (A1), VoiceOver RN (A2), contrast (A3), push copy (A4), LHCI guard (A5) |
| Integration (NFR-I1–I4) | 4 | RUMEUR fallback tested (I1), push retry + cap (I2), EAS Build < 15min (I3), privacy manifest (I4) |
| Compliance (NFR-C1–C5) | 5 | ODbL lint (C1), RGPD deletion 30d (C2), AI Act disclosure (C3), no IDFA (C4), PDF disclaimer (C5) |

#### Gap Analysis

**Critical Gaps:** None.

**Important Gaps (non-blocking, to resolve during implementation):**

1. **Monorepo tooling choice** — pnpm workspaces vs Turborepo vs Nx. Recommendation: pnpm workspaces (minimal, no overhead). Add Turborepo only if build orchestration becomes a pain point.
2. **Database selection for B2B** — Vercel Postgres vs Supabase. Decision deferred to V3.1 sprint planning. Either works; prefer Vercel Postgres for deployment simplicity.
3. **IRIS adjacency graph quality** — Must validate on ≥ 3 test corridors (PRD risk mitigation) before committing to turf.js approach. Fallback: "Aucun itinéraire calme trouvé" if graph coverage insufficient.
4. **MapLibre React Native + PMTiles compatibility** — Spike in Week 1 of Expo setup. Fallback: WebView wrapper if blocked.
5. **IrisPopup design sprint output** — Blocks Stories 6.1–6.4 UI implementation. Must run before coding the enrichment rendering.
6. **Vercel Cron interval** — Hobby tier = 1/day minimum. V3.1 push requires 3-min check → Vercel Pro ($20/mo).

**Nice-to-Have Gaps:**
7. **Route share format** — deep link URL pattern for shared calm routes. Define during implementation.
8. **B2B PDF template design** — visual design of the certified report. Deferred to V3.1 sprint.

#### Architecture Completeness Checklist (V3)

**Requirements Analysis**
- [x] PRD V3 validated (5/5 quality rating, 44 FRs, 34 NFRs)
- [x] Phased development defined (V3.0 → V3.1 → V3.2+)
- [x] New constraints identified (multi-platform, LLM, B2B, App Store, EU AI Act)
- [x] Cross-cutting concerns mapped (LLM non-blocking, push determinism, shared state)

**Architectural Decisions**
- [x] 8 core decisions documented with rationale (6.1–6.8)
- [x] Technology stack specified per phase
- [x] Integration patterns defined (LLM, push, B2B, routing)
- [x] Performance targets mapped to decisions

**Implementation Patterns**
- [x] LLM call pattern (non-blocking, cached, feature-flagged)
- [x] Push notification pattern (deterministic trigger → LLM copy)
- [x] B2B gating pattern (JWT middleware)
- [x] Cross-platform sharing pattern (shared hooks + platform-specific UI)
- [x] Routing computation pattern (adjacency graph + Dijkstra)

**Project Structure**
- [x] Monorepo layout defined (tacet/ + tacet-mobile/ + packages/shared/)
- [x] Component boundaries established per platform
- [x] Data flow diagram updated for V3
- [x] Phase → file mapping complete

**Validation**
- [x] 44/44 FRs covered
- [x] 34/34 NFRs covered
- [x] Gap analysis: 0 critical, 6 important (non-blocking), 2 nice-to-have

### V3 Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION (V3.0 MVP)

**Confidence Level:** High for V3.0 MVP, Medium-High for V3.1 Growth (B2B database + NLQ pipeline need implementation spikes)

**V3 Implementation Priority:**

1. **Shared library extraction** — Move `noise-categories.ts`, hooks, types from `tacet/src/` to `packages/shared/`. Unblocks all V3 work.
2. **Story 6.1 (time-aware weighting)** — Zero new UI, immediate value, uses existing data. Good first proof of ambient behaviour.
3. **Story 6.0 (`/api/enrich`)** — Route Handler + Haiku integration. Solves information presentation architecturally. Unblocks design sprint.
4. **`scripts/generate-adjacency-graph.ts`** — Build-time prerequisite for routing. Validate on 3 corridors.
5. **Expo SDK setup + MapLibre RN spike** — Validate RN map + PMTiles before committing to the mobile story sequence.

**Key Architectural Strengths (V3):**
1. V2 baseline is fully preserved — V3 is additive, not a rewrite
2. LLM integration is non-blocking by design — the app works identically if Claude API is down
3. Shared business logic (≥ 70%) reduces cross-platform maintenance burden
4. B2B is entirely self-contained (V3.1) — does not affect B2C architecture
5. Routing engine starts simple (adjacency graph) with a clear upgrade path (OSRM/GraphHopper)
6. Every innovation has a deterministic fallback — no LLM dependency on the critical path
