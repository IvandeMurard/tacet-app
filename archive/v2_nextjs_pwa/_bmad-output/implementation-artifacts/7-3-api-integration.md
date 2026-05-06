# Story 7.3: API Integration — RUMEUR, Chantiers, Enrichment (+ CORS)

Status: done

## Story

As a user,
I want to see live RUMEUR sensor readings, active construction sites, and the Claude Haiku zone summary in the native app,
so that all real-time data layers from the web app are available on iOS (FR12, FR19, FR26, FR37).

## Acceptance Criteria

1. **CORS on API routes:** `/api/rumeur`, `/api/chantiers`, `/api/enrich` all respond with `Access-Control-Allow-Origin: *` (dev); no CORS errors from native app.
2. **OPTIONS preflight for /api/enrich:** `OPTIONS /api/enrich` returns 204 with correct headers.
3. **useRumeur hook:** Returns `{ data, error, fallback, cachedAt, loading }`. Polls every 3 minutes matching server cache TTL.
4. **useChantiers hook:** Returns `{ data, error, fallback, cachedAt, loading }`. Fetches once on mount.
5. **useEnrichment hook:** Returns `{ enrichment, isLoading }`. POSTs `EnrichmentRequest` when `zone_code` changes. Silent on low-confidence or error.
6. **Offline resilience:** All three hooks handle network errors gracefully — return `error` string, no crash.
7. **Tests pass:** `npm test -- --watchAll=false` passes in `tacet-mobile/`.
8. **Committed:** Both `tacet/` (CORS) and `tacet-mobile/` (hooks + types) committed.

## Tasks / Subtasks

- [ ] **Task 1 — CORS in tacet/next.config.mjs + OPTIONS handler** (AC: 1, 2)
  - [ ] Add `/api/:path*` CORS headers to `headers()` in `next.config.mjs`
  - [ ] Add `OPTIONS` export to `tacet/src/app/api/enrich/route.ts`

- [ ] **Task 2 — Create tacet-mobile/types/** (AC: 3, 4, 5)
  - [ ] `types/rumeur.ts` — RumeurMeasurement, RumeurData, RumeurResponse
  - [ ] `types/enrichment.ts` — EnrichmentRequest, EnrichmentResult, PrimarySignal
  - [ ] `types/chantier.ts` — ChantierRecord, ChantiersResponse

- [ ] **Task 3 — Port hooks** (AC: 3, 4, 5, 6)
  - [ ] `hooks/useRumeur.ts` — poll GET /api/rumeur every 3 min
  - [ ] `hooks/useChantiers.ts` — fetch GET /api/chantiers once
  - [ ] `hooks/useEnrichment.ts` — POST /api/enrich on zone_code change

- [ ] **Task 4 — Smoke tests + commit** (AC: 7, 8)

## Dev Notes

### CORS headers pattern (next.config.mjs)
```js
{
  source: "/api/:path*",
  headers: [
    { key: "Access-Control-Allow-Origin", value: "*" },
    { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
  ],
}
```

### OPTIONS handler (enrich/route.ts)
```ts
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

### API base URL pattern in hooks
```ts
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://tacet.vercel.app";
```

### Note on CORS and React Native
React Native's `fetch()` does NOT send `Origin` headers (browser-only security mechanism). CORS errors cannot occur from a native app. CORS headers are added to:
1. Support any browser-based testing/debugging tools
2. Future-proof for web panel consumers
3. Story requirement compliance

### Hook polling pattern (useRumeur)
```ts
useEffect(() => {
  let cancelled = false;
  const run = () => { /* fetch */ };
  run();
  const interval = setInterval(run, 180_000); // 3 min
  return () => { cancelled = true; clearInterval(interval); };
}, []);
```

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References

N/A

### Completion Notes List

- CORS via `next.config.mjs` `headers()` — no middleware needed; applies to all `/api/*` routes automatically
- `async headers()` in next.config is the config callback (not `next/headers` request API) — false positive from validator, no fix needed
- React Native `fetch()` does NOT send `Origin` headers — CORS errors cannot occur natively; headers are defensive for browser tooling
- `jest-expo` does NOT load `.env` — `EXPO_PUBLIC_API_BASE_URL` is `undefined` in test runtime; hooks use `?? "https://tacet.vercel.app"` fallback
- `useRumeur` uses `useCallback` + ref-based cancellation flag `{ value: boolean }` to avoid stale closure in `setInterval`
- `useEnrichment` dep array uses `request?.zone_code` + `request?.intent` (not full `request` object) — prevents infinite re-render loop on reference change; same pattern as web hook
- 14 smoke tests passing (up from 10 in Story 7.2)

### File List

- tacet/next.config.mjs (updated — CORS headers for /api/*)
- tacet/src/app/api/enrich/route.ts (updated — OPTIONS handler)
- tacet-mobile/types/rumeur.ts (new)
- tacet-mobile/types/enrichment.ts (new)
- tacet-mobile/types/chantier.ts (new)
- tacet-mobile/hooks/useRumeur.ts (new)
- tacet-mobile/hooks/useChantiers.ts (new)
- tacet-mobile/hooks/useEnrichment.ts (new)
- tacet-mobile/__tests__/smoke.test.ts (updated — 4 new type tests)
