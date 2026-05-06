# Epic 3 Code Review Report

**Epic:** Real-Time & Contextual Data Layers (Stories 3.1–3.6)  
**Review type:** Adversarial code review  
**Criteria:** Story acceptance criteria, architecture (Route Handler shape, cache, layer pattern), NFRs, prior review follow-ups.

---

## Summary

Epic 3 implements the RUMEUR real-time sensor layer, Chantiers (construction sites) layer, Chantiers disclosure, and the Baromètre du Silence page. Stories 3.1–3.3 (RUMEUR API, hook, layer, status bar) are **done** and align with architecture and prior review fixes. Stories 3.4–3.6 show **gaps**: the Chantiers route diverges from the architecture (no in-memory cache, no fallback on failure, no `Cache-Control: no-store`); the Chantiers layer has no tap/hover interaction for radius and end date (AC 3.4); the Elections layer and AppNav toggle are **missing** (Story 3.5); Baromètre data is client-fetched rather than server-rendered/ISR (AC 3.6). RumeurStatusBar correctly uses `data.error` (Story 3.2 L1). No unit tests exist for the Chantiers route or ChantiersLayer. One code-quality finding: ChantiersLayer uses the global `maplibregl.GeoJSONSource` instead of a named ESM import (same pattern fixed in RumeurLayer).

---

## Findings

| ID | Severity | Story | File / Area | Finding | Recommendation |
|----|----------|-------|-------------|---------|----------------|
| **E3-H1** | High | 3.4 | `tacet/src/app/api/chantiers/route.ts` | Chantiers route does not return last cached data with `fallback: true` on upstream failure. Architecture and RUMEUR route use envelope `{ data, error, fallback, cachedAt }` with fallback when cache exists; Chantiers returns 502 with `data: null` and no in-memory cache. NFR-R3 (graceful degradation) is only partially met. | Introduce module-level in-memory cache (e.g. 1-hour TTL) and, on fetch failure, return last cached payload with `fallback: true` and same envelope. If no cache exists, keep current 502 behaviour. |
| **E3-H2** | High | 3.4 | Story 3.4 AC | AC: "When the user taps or hovers a chantier … affected radius and expected end date are visible (tooltip or popup)." MapContainer has no click/hover handler for chantier layer features; ChantiersLayer only adds circles. Properties already include `date_fin` (and `adresse`, `type_chantier`); "affected radius" may require API/schema check (Open Data Paris). | Add in MapContainer (or a dedicated handler) a click/hover handler that queries features on layer `chantiers-circles` and shows a tooltip or popup with `date_fin` and, if available, radius. Reuse pattern from IRIS popup or a minimal Tooltip component. |
| **E3-H3** | High | 3.5 | AppNav / MapContainer | Story 3.5 AC: "When the user toggles the 2026 Elections layer in AppNav … the thematic layer is shown or hidden." `LayerId` includes `"elections"` but there is no ElectionsLayer component, no Elections toggle in AppNav, and no wiring in MapContainer. Elections layer is not implemented. | Implement ElectionsLayer (add/remove idempotent, source/layer IDs per architecture), add Elections LayerToggle in AppNav, and in MapContainer add `electionsEnabled` + effect to add/remove the layer when Elections data is available. |
| **E3-M1** | Medium | 3.4 | `tacet/src/app/api/chantiers/route.ts` | Route uses Next.js `fetch` with `next: { revalidate: CACHE_SECONDS }` (Data Cache), not in-memory cache. Architecture specifies "Route Handler … 1-hour cache" and RUMEUR uses module-level in-memory cache; Chantiers is inconsistent and cannot serve fallback on failure without in-memory state. | Align with RUMEUR pattern: module-level cache with TTL, single upstream request on cache miss, then serve from cache or fallback on error (see E3-H1). |
| **E3-M2** | Medium | 3.4 | `tacet/src/app/api/chantiers/route.ts` | Response does not set `Cache-Control: no-store`. RUMEUR route sets it on all responses to avoid CDN/proxy caching. Architecture implies consistent behaviour for Route Handlers. | Add `Cache-Control: no-store` (or a shared constant) to all GET response headers for `/api/chantiers`. |
| **E3-M3** | Medium | 3.4 | Chantiers API | No runtime validation of upstream response shape. Malformed or non-array response could be passed to client. RUMEUR uses `isValidRumeurData()` before caching. | Add a guard (e.g. `Array.isArray(data)` and optional field checks) and on invalid shape return 502 with a calm error message; do not cache invalid data. |
| **E3-M4** | Medium | 3.6 | `tacet/src/app/barometre/page.tsx`, `BarometreChart.tsx` | AC 3.6: "The page is server-rendered or ISR where appropriate." The barometre page component is server-rendered, but ranking data is fetched client-side in BarometreChart via `fetch("/data/paris-noise-arrondissements.geojson")`. No ISR or server-side data fetch. | Prefer loading arrondissement data on the server (e.g. read GeoJSON in page or use a server component/data fetch) and pass as props, or use ISR with a server-side fetch so the initial HTML contains the ranking and improves LCP/SEO. |
| **E3-M5** | Medium | 3.4 | Tests | No unit tests for GET /api/chantiers (response shape, success, 502 on failure, cache behaviour if added). No unit tests for ChantiersLayer add/remove/setData. NFR-M1 expects Vitest coverage on critical functions. | Add `tacet/src/app/api/chantiers/route.test.ts` for handler (shape, error path, and cache/fallback once implemented). Add ChantiersLayer tests mirroring RumeurLayer.test.ts (add, update, remove). |
| **E3-L1** | Low | 3.4 | `tacet/src/components/map/ChantiersLayer.ts` | Uses global `maplibregl.GeoJSONSource` for the setData cast (line 37). RumeurLayer was updated to use named ESM import `import type { ..., GeoJSONSource } from "maplibre-gl"` (Story 3.2 review L3). Inconsistent and brittle if maplibre is only dynamically imported elsewhere. | Use named import: `import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl"` and cast to `GeoJSONSource` instead of `maplibregl.GeoJSONSource`. |
| **E3-L2** | Low | 3.2 | FR17 | Prior review L5: "View the current noise level (dB) from RUMEUR sensors" — numeric dB (e.g. `leq`) is only encoded in circle color; not shown in UI. Tracked for Story 3.3; still open. | Add popup or tooltip on RUMEUR circle click/hover showing `leq` (and optional `lmin`/`lmax`) so FR17 is fully met. |
| **E3-L3** | Low | 3.1 | Process | Story 3.1 review M3: Unrelated changes in AGENTS.md / README in working tree. Not an Epic 3 code defect. | Commit or stash unrelated files before PR; keep Epic 3 changes scoped. |

---

## Resolved / Already correct

- **RUMEUR route (3.1):** Shape validation, 3-min in-memory cache, in-flight dedup, `Cache-Control: no-store`, fallback on failure, no API key in client. Matches architecture.
- **RumeurStatusBar (3.3):** Uses `data.error` (response envelope) first, then SWR error — Story 3.2 L1 addressed.
- **RumeurStatus connector:** Passes `rumeurResponse?.error`, `cachedAt`, `fallback` to RumeurStatusBar; L1 invariant satisfied.
- **Chantiers disclosure (3.5):** Legend shows "Le Score annuel ne reflète pas les chantiers en cours." AC for disclosure met.
- **Baromètre link:** Nav link to `/barometre` present in MapPageClient (AppNav) and elections page.
- **Layer pattern:** RumeurLayer and ChantiersLayer use idempotent add/remove and layer IDs `rumeur-circles`, `chantiers-circles` per architecture.
- **Security:** BRUITPARIF_API_KEY used only in RUMEUR route (server-side); not exposed to client.

---

## Follow-up actions

1. **Implement E3-H1 and E3-M1:** Chantiers route in-memory cache and fallback response on upstream failure.
2. **Implement E3-H2:** Chantier tap/hover UI (tooltip or popup with date_fin and radius if available).
3. **Implement E3-H3:** Elections layer (ElectionsLayer, AppNav toggle, MapContainer wiring).
4. **Implement E3-M2 and E3-M3:** Chantiers route headers and response validation.
5. **Implement E3-M4:** Baromètre data load on server or ISR.
6. **Implement E3-M5:** Chantiers route and ChantiersLayer unit tests.
7. **Implement E3-L1:** ChantiersLayer GeoJSONSource named import.
8. **Optional E3-L2:** RUMEUR circle tooltip/popup with dB for FR17.

---

*Report generated from Epic 3 code review plan. No code or config changes were made during this review.*
