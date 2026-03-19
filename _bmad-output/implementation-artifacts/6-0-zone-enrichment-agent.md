# Story 6.0: Zone Enrichment Agent

Status: ready-for-dev

## Story

As a user selecting a zone on the Tacet map,
I want the zone popup to surface a 1–2 sentence contextual summary of what this zone sounds like right now,
so that I understand its acoustic character at a glance without parsing multiple individual data points (FR41).

## Acceptance Criteria

1. **`npm install @anthropic-ai/sdk`** is run and the package appears in `package.json` dependencies (not devDependencies).
2. **`POST /api/enrich`** Route Handler exists at `tacet/src/app/api/enrich/route.ts`. Accepts JSON body matching `EnrichmentRequest`. Returns JSON matching `EnrichmentResult` shape: `{ summary, primary_signal, secondary_signal?, confidence, cachedAt }`. Always returns HTTP 200 — caller checks `confidence: "low"` for failures.
3. **Server-side Claude API call** — `ANTHROPIC_API_KEY` used only in the route handler, never in client code. Uses `claude-haiku-4-5-20251001`. If key is absent, returns `confidence: "low"` gracefully (no 500 crash).
4. **1.5s timeout** — if Claude API exceeds 1.5s, route returns `{ confidence: "low", summary: "", primary_signal: "score", cachedAt: null }`. IrisPopup shows default view.
5. **In-memory cache** — cache key: `enrich-${zone_code}-${Math.floor(Date.now() / 900_000)}-${intent ?? 'none'}` (15-min bucket). Same zone+hour+intent returns cached result without a new Claude call.
6. **Feature flag** — `useEnrichment` hook returns `null` immediately when `NEXT_PUBLIC_ENABLE_ENRICHMENT !== "true"`. Zero behaviour change when flag is off. Default is off.
7. **Non-blocking rendering** — IrisPopup renders immediately with the full default view. Enrichment summary appears when the async call resolves. No loading spinner, no layout shift, no blocking of zone popup open.
8. **Summary rendered in IrisPopup** — when `enrichment` is available and `confidence === "high"`, a `<p>` with the summary text is rendered below the score block, above the day/night levels. French, 1–2 sentences, mobile-readable.
9. **Confidence: "low" fallback** — when `confidence === "low"` (timeout, parse error, API error, or agent unsure), IrisPopup renders identically to pre-Epic-6 — zero regression, no empty placeholder.
10. **`intent` is null in this story** — Story 6.2 will wire the intent from localStorage. The request body sends `intent: null` for now. The cache key still includes it (`"none"` bucket).
11. **Types in `@/types/enrichment.ts`** — `EnrichmentRequest`, `EnrichmentResult`, `PrimarySignal` exported. Imported by route, hook, and IrisPopup.
12. **Unit tests** — Route handler: ≥ 5 tests (success, no API key, timeout, parse failure, cache hit). Hook: ≥ 3 tests (flag off, success, low-confidence fallback). IrisPopup: ≥ 2 new tests (summary rendered, low-confidence fallback).
13. **`.env.example`** updated with `ANTHROPIC_API_KEY=` and `NEXT_PUBLIC_ENABLE_ENRICHMENT=false`.
14. **No changes to MapPageClient.tsx, MapContext.tsx, or any other file** — enrichment is fully self-contained in IrisPopup.

## Tasks / Subtasks

- [ ] **Task 1 — Install SDK** (AC: 1)
  - [ ] `cd tacet && npm install @anthropic-ai/sdk`
  - [ ] Confirm `@anthropic-ai/sdk` appears in `package.json` dependencies section (not devDependencies)

- [ ] **Task 2 — Create `@/types/enrichment.ts`** (AC: 11)
  - [ ] `PrimarySignal` type: `"rumeur" | "chantier" | "reports" | "score" | "night"`
  - [ ] `EnrichmentRequest` interface: `{ zone_code, zone_name, arrondissement, noise_level, day_level, night_level, score_serenite, current_iso_timestamp, intent?: string | null, rumeur_sensor?: { leq: number; distanceM: number } | null, nearby_chantiers?: { count: number; nearestDistanceM: number } | null, recent_reports?: number | null }`
  - [ ] `EnrichmentResult` interface: `{ summary: string; primary_signal: PrimarySignal; secondary_signal?: PrimarySignal; confidence: "high" | "low"; cachedAt: string | null; error?: string }`

- [ ] **Task 3 — Create `tacet/src/app/api/enrich/route.ts`** (AC: 2, 3, 4, 5)
  - [ ] Import `Anthropic` from `"@anthropic-ai/sdk"`, `NextRequest`/`NextResponse` from `"next/server"`, types from `"@/types/enrichment"`
  - [ ] Define `MODEL = "claude-haiku-4-5-20251001"` and `TIMEOUT_MS = 1500` as named constants
  - [ ] In-memory cache: `const cache = new Map<string, { result: EnrichmentResult; expiresAt: number }>()`
  - [ ] `getCacheKey(zone_code, intent)` using the 15-min bucket formula
  - [ ] `SYSTEM_PROMPT` constant: French, ≤ 150 tokens, instructs JSON response with exact shape (see Dev Notes)
  - [ ] `export async function POST(request: NextRequest)` handler:
    - Parse body, return 400 on malformed JSON
    - Return `confidence: "low"` (200) if `ANTHROPIC_API_KEY` missing
    - Check cache, return cached result if fresh
    - Use `Promise.race([claudeCall, timeoutReject])` for 1.5s timeout
    - Parse Claude text response as JSON with try/catch
    - Validate required fields (`summary`, `primary_signal`, `confidence`) — throw if absent
    - Store in cache with `expiresAt = Date.now() + 900_000`
    - On any error/timeout: return `{ summary: "", primary_signal: "score", confidence: "low", cachedAt: null }`

- [ ] **Task 4 — Create `tacet/src/app/api/enrich/route.test.ts`** (AC: 12)
  - [ ] Mock `@anthropic-ai/sdk` via `vi.mock("@anthropic-ai/sdk", ...)` (see Dev Notes for mock pattern)
  - [ ] Test: no API key → returns 200 with `confidence: "low"` (no crash)
  - [ ] Test: valid request → returns parsed summary with `confidence: "high"`
  - [ ] Test: Claude returns unparseable JSON → returns `confidence: "low"`
  - [ ] Test: Claude call hangs past TIMEOUT_MS → returns `confidence: "low"` (use `vi.useFakeTimers`)
  - [ ] Test: second request same zone+hour → returns cached result (mock called only once)

- [ ] **Task 5 — Create `tacet/src/hooks/useEnrichment.ts`** (AC: 6, 7)
  - [ ] `"use client"` directive
  - [ ] Reads `process.env.NEXT_PUBLIC_ENABLE_ENRICHMENT === "true"` — if false, immediately returns `{ enrichment: null, isLoading: false }`
  - [ ] `useEffect` fires when `zone_code` changes (dep: `request?.zone_code`, `request?.intent`)
  - [ ] POST to `/api/enrich` with `{ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) }`
  - [ ] Sets `enrichment = null` if response `confidence === "low"` or fetch throws
  - [ ] Cleanup: `cancelled = true` flag prevents state update on unmounted/zone-changed component
  - [ ] Returns `{ enrichment: EnrichmentResult | null, isLoading: boolean }`

- [ ] **Task 6 — Create `tacet/src/hooks/useEnrichment.test.ts`** (AC: 12)
  - [ ] Test: feature flag off → returns `{ enrichment: null, isLoading: false }` immediately
  - [ ] Test: flag on, success response → returns enrichment with summary
  - [ ] Test: flag on, `confidence: "low"` response → returns `{ enrichment: null }`

- [ ] **Task 7 — Modify `tacet/src/components/IrisPopup.tsx`** (AC: 7, 8, 9, 10)
  - [ ] Add import: `import { useEnrichment } from "@/hooks/useEnrichment"`
  - [ ] Add import: `import type { EnrichmentRequest } from "@/types/enrichment"`
  - [ ] After existing `useNoiseReports` call, build enrichment request object (see Dev Notes for exact shape) and call `const { enrichment } = useEnrichment(enrichmentRequest)`
  - [ ] In JSX: after the `<SerenityBar>` block and before the description block, add:
    ```tsx
    {enrichment && enrichment.confidence !== "low" && enrichment.summary && (
      <p className="mb-4 text-sm leading-relaxed text-white/70">
        {enrichment.summary}
      </p>
    )}
    ```
  - [ ] No other JSX changes — `primary_signal`/`secondary_signal` rendering is deferred to post-design-sprint

- [ ] **Task 8 — Update `tacet/src/components/IrisPopup.test.tsx`** (AC: 12)
  - [ ] Mock `useEnrichment` hook: `vi.mock("@/hooks/useEnrichment", () => ({ useEnrichment: vi.fn() }))`
  - [ ] Add `beforeEach`: `(useEnrichment as vi.Mock).mockReturnValue({ enrichment: null, isLoading: false })`
  - [ ] Test: enrichment with `confidence: "high"` and summary → summary text rendered in DOM
  - [ ] Test: enrichment with `confidence: "low"` → summary NOT in DOM, existing content unaffected
  - [ ] Confirm all 10 existing tests still pass (mock ensures default `null` enrichment)

- [ ] **Task 9 — Update `.env.example`** (AC: 13)
  - [ ] Add `ANTHROPIC_API_KEY=` (empty, documents the key)
  - [ ] Add `NEXT_PUBLIC_ENABLE_ENRICHMENT=false`

- [ ] **Task 10 — Regression check** (AC: 9, 12)
  - [ ] `cd tacet && npm test -- --run` — all tests green
  - [ ] Manual: open popup with flag off → no change, no console errors
  - [ ] Manual: open popup with flag on → summary appears after ~500ms, no layout shift

## Dev Notes

### Architecture Constraints (MUST follow)

- **`@/` aliases only** — `@/types/enrichment`, `@/hooks/useEnrichment`, never relative paths
- **Tests co-located** — `route.test.ts` next to `route.ts`, `useEnrichment.test.ts` next to hook
- **`ANTHROPIC_API_KEY` is server-side only** — checked in `route.ts` via `process.env.ANTHROPIC_API_KEY`. Never referenced in client code or passed to hooks.
- **`NEXT_PUBLIC_ENABLE_ENRICHMENT` is client-side** — Next.js inlines `NEXT_PUBLIC_` env vars at build time. The hook reads this on the client.
- **Always return HTTP 200 from `/api/enrich`** — callers check `confidence: "low"`, never HTTP status. This prevents error handling complexity in the hook.
- **No SWR for the enrich call** — it's a POST with a dynamic body. Use `useEffect` + `fetch` directly (not `useSWR`).
- **iOS-first concern** — enrichment is fire-and-forget. IrisPopup must be fully interactive before enrichment resolves. No loading state visible to user.

### System Prompt (exact text — ≤ 150 tokens)

```
Tu es un assistant de Tacet, application de bruit urbain à Paris.
Tu résumes en 1-2 phrases le contexte sonore d'une zone pour un utilisateur mobile.
Ton ton est calme, factuel, utile. Tu ne répètes pas le score — tu l'enrichis.
Réponds uniquement en JSON valide:
{"summary":"...","primary_signal":"rumeur"|"chantier"|"reports"|"score"|"night","secondary_signal"?:"...","confidence":"high"|"low"}
```

> ⚠️ `confidence: "low"` must be returned when the agent has insufficient data (e.g. only a score, no live signals). The UI falls back silently. Do NOT fabricate context.

### Route Handler Pattern (follow exactly)

The `/api/enrich` route follows the established pattern from `/api/rumeur/route.ts` and `/api/chantiers/route.ts` with these differences:

| Aspect | `/api/rumeur` `/api/chantiers` | `/api/enrich` |
|--------|-------------------------------|----------------|
| Method | GET | POST |
| Response shape | `{ data, error, fallback, cachedAt }` | `{ summary, primary_signal, secondary_signal?, confidence, cachedAt }` |
| Cache mechanism | Module-level `let cache` | Module-level `Map<string, ...>` (keyed per zone) |
| Error behaviour | 502 on upstream fail | 200 with `confidence: "low"` |
| Auth | `BRUITPARIF_API_KEY` | `ANTHROPIC_API_KEY` |

### Timeout Pattern (Promise.race)

```typescript
const claudeCall = client.messages.create({
  model: MODEL,
  max_tokens: 150,
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content: JSON.stringify(body) }],
});

const timeoutReject = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)
);

const message = await Promise.race([claudeCall, timeoutReject]);
```

### Anthropic SDK Mock Pattern (for route.test.ts)

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

// In tests:
mockCreate.mockResolvedValueOnce({
  content: [{ type: "text", text: JSON.stringify({
    summary: "Zone calme, données cohérentes.",
    primary_signal: "score",
    confidence: "high",
  })}],
});
```

> Use `vi.resetModules()` + `beforeEach` as in `chantiers/route.test.ts` to prevent cache bleed between tests.

### EnrichmentRequest build inside IrisPopup

```typescript
// After: const { recentCount, canReport, addReport } = useNoiseReports(code_iris);
const enrichmentRequest: EnrichmentRequest = {
  zone_code: code_iris,
  zone_name: name,
  arrondissement: c_ar,
  noise_level,
  day_level: day_level ?? null,
  night_level: night_level ?? null,
  score_serenite: score,            // already computed above
  current_iso_timestamp: new Date().toISOString(),
  rumeur_sensor: nearestSensor?.measurement.leq != null
    ? { leq: nearestSensor.measurement.leq, distanceM: nearestSensor.distanceM }
    : null,
  nearby_chantiers: nearbyChantiers.length > 0
    ? { count: nearbyChantiers.length, nearestDistanceM: nearbyChantiers[0]?.distanceM ?? 0 }
    : null,
  recent_reports: recentCount > 0 ? recentCount : null,
  intent: null,  // Story 6.2 wires this from localStorage key "tacet_intent"
};
const { enrichment } = useEnrichment(enrichmentRequest);
```

> `score` is already computed earlier in IrisPopup via `getSereniteScore(noise_level)` — reuse it.

### useEnrichment Dependency Array

The effect deps must be `[request?.zone_code, request?.intent, enabled]` — NOT `[request]`. Passing the whole `request` object would cause infinite re-renders since it's a new object every render. The zone_code change is the correct trigger for a new enrichment call.

```typescript
useEffect(() => {
  // ...
}, [request?.zone_code, request?.intent, enabled]);
```

### Feature Flag — Staging vs Production

- `NEXT_PUBLIC_ENABLE_ENRICHMENT=false` in `.env.example` (default off)
- Set to `true` in Vercel staging environment variables (not committed)
- In production: remains `false` until explicitly enabled after testing

### IrisPopup Render Position

```
[Header: zone name, arrondissement, close button]
[TierBadge]
[Score (text-5xl) + SerenityBar]        ← existing
[enrichment.summary paragraph]          ← NEW (only when enrichment present)
[description paragraph]                 ← existing (optional)
[day/night levels]                      ← existing (modified by Story 6.1)
[contextual signals block]              ← existing
[sources / DataProvenance]              ← existing
[report button]                         ← existing
[share button]                          ← existing
```

### Deferred: primary_signal / secondary_signal rendering

The AC mentions `primary_signal` and `secondary_signal` shaping which contextual blocks are shown. **This is explicitly deferred** until the IrisPopup design sprint (see `docs/planning/ambient-agentic-vision.md#The-Information-Presentation-Challenge`). In Story 6.0:
- `summary` text is rendered
- `primary_signal` / `secondary_signal` are stored in the `EnrichmentResult` type but **not used to filter contextual blocks** — that logic comes post-design-sprint
- Do NOT attempt to implement signal-based block filtering in this story

### Project Structure Notes

**Files to create:**
- `tacet/src/types/enrichment.ts`
- `tacet/src/app/api/enrich/route.ts`
- `tacet/src/app/api/enrich/route.test.ts`
- `tacet/src/hooks/useEnrichment.ts`
- `tacet/src/hooks/useEnrichment.test.ts`

**Files to modify:**
- `tacet/src/components/IrisPopup.tsx` (add hook call + summary render, ~10 lines)
- `tacet/src/components/IrisPopup.test.tsx` (add mock + 2 new tests)
- `tacet/package.json` (add `@anthropic-ai/sdk` to dependencies)
- `tacet/.env.example` (add 2 new env vars)

**Files to NOT touch:** `MapPageClient.tsx`, `MapContext.tsx`, any existing Route Handlers, any other hooks, any type files.

### References

- Story spec source: `_bmad-output/planning-artifacts/epics.md#Story-6.0`
- Full Epic 6 vision + system prompt constraints: `docs/planning/ambient-agentic-vision.md`
- Route Handler pattern: `tacet/src/app/api/rumeur/route.ts` (in-memory cache, NO_STORE, error handling)
- Route test pattern: `tacet/src/app/api/chantiers/route.test.ts` (vi.resetModules, vi.stubGlobal)
- IrisPopup current state: `tacet/src/components/IrisPopup.tsx` (311 lines, `useNoiseReports` at line 61)
- Feature flag pattern: `tacet/src/app/MapPageClient.tsx` line 177 (`NEXT_PUBLIC_ENABLE_RUMEUR`)
- RUMEUR types (for nearestSensor shape): `tacet/src/types/rumeur.ts`
- Existing env structure: `tacet/.env.example` (if present) or project-context.md env section
- Anthropic SDK docs: `https://docs.anthropic.com/en/api/getting-started` — use `@anthropic-ai/sdk` v0.x latest stable

## Dev Agent Record

### Agent Model Used

_to be filled by dev agent_

### Debug Log References

### Completion Notes List

### File List
