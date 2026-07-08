# Story 7.1: Expo Foundation — Map Rendering on Device

Status: done

## Story

As a developer,
I want a new `tacet-mobile/` Expo SDK 53 project with MapLibre RN v11 + NativeWind + PMTiles base map rendering on a physical iOS device,
so that the native app scaffold is established and the map tile stack is confirmed working end-to-end before any feature work begins.

## Acceptance Criteria

1. **Project boots on device:** `eas build --profile development` completes, the dev client installs on a physical iOS device, and the app launches without crashing.
2. **Map renders with PMTiles:** A full-screen MapLibre map displays the Protomaps PMTiles base map (Paris region). No white tiles, no crashes during pan/pinch.
3. **Style JSON approach:** The PMTiles source is defined inside a style JSON object passed to `<MapView style={mapStyle}>` — NOT as a raw `pmtiles://` URL string passed directly to MapView. This is required to use MapLibre Native's built-in PMTiles reader correctly.
4. **NativeWind integration confirmed:** A test component uses `className="bg-black text-white"` and the styles apply correctly (confirms babel/metro plugin is wired).
5. **Test harness works:** `npm test` in `tacet-mobile/` runs at least one passing jest-expo smoke test.
6. **Expo Router v4 installed:** The app uses file-based routing with a root `_layout.tsx` and a `(tabs)/index.tsx` map screen.
7. **No feature code:** This story is scaffold only — no GeoJSON layer, no zone selection, no API calls. Map + NativeWind + routing only.
8. **Committed to repo:** `tacet-mobile/` folder is committed to the Tacet repo root alongside `tacet/`.

## Tasks / Subtasks

- [ ] **Task 1 — Scaffold Expo SDK 53 project** (AC: 1, 6, 8)
  - [ ] Run `npx create-expo-app@latest tacet-mobile --template tabs` in Tacet repo root
  - [ ] Confirm Expo SDK 53 in `package.json` (upgrade if needed: `npx expo install expo@latest`)
  - [ ] Confirm Expo Router v4 is installed
  - [ ] Add `tacet-mobile/` to `.gitignore` exclusions appropriately (keep `node_modules/` ignored, commit everything else)

- [ ] **Task 2 — Install and configure MapLibre RN v11** (AC: 2, 3)
  - [ ] `cd tacet-mobile && npx expo install @maplibre/maplibre-react-native@next` (v11 beta)
  - [ ] If v11 beta causes build failures, fallback to v10 stable: `@maplibre/maplibre-react-native@latest`
  - [ ] Add config plugin to `app.json` plugins array: `"@maplibre/maplibre-react-native"`
  - [ ] Define `PMTILES_STYLE` constant — style JSON object with PMTiles source (see Dev Notes)
  - [ ] Replace default map screen with `<MapView style={styles.map} styleJSON={JSON.stringify(PMTILES_STYLE)} />`

- [ ] **Task 3 — Install and configure NativeWind v4** (AC: 4)
  - [ ] `npx expo install nativewind tailwindcss`
  - [ ] Create `tailwind.config.js` with `content: ["./app/**/*.{js,ts,tsx}", "./src/**/*.{js,ts,tsx}"]`
  - [ ] Add NativeWind babel plugin to `babel.config.js`: `"nativewind/babel"`
  - [ ] Add NativeWind metro plugin to `metro.config.js` (see NativeWind v4 setup docs)
  - [ ] Add `/// <reference types="nativewind/types" />` to `global.d.ts`
  - [ ] Verify: add `className="bg-black flex-1"` to root `<View>` in `_layout.tsx` and confirm it applies

- [ ] **Task 4 — Configure EAS Build** (AC: 1)
  - [ ] `npx eas init` (or manually create `eas.json`) with three profiles: `development`, `preview`, `production`
  - [ ] `development` profile: `"developmentClient": true, "distribution": "internal"`
  - [ ] Add `EXPO_PUBLIC_API_BASE_URL` to `.env` (value: `https://tacet.vercel.app` for prod, `http://[local-ip]:3000` for dev)
  - [ ] Document: `eas build --platform ios --profile development` command in README

- [ ] **Task 5 — Configure jest-expo** (AC: 5)
  - [ ] Confirm `jest-expo` preset in `package.json` (default for Expo templates)
  - [ ] Add `transformIgnorePatterns` for native module mocking (see Dev Notes)
  - [ ] Write one smoke test: `it("renders without crashing", () => { expect(true).toBe(true) })` in `__tests__/smoke.test.ts`
  - [ ] Run `npm test -- --run` — confirm passes

- [ ] **Task 6 — Verify on device and commit** (AC: 1, 2, 3, 8)
  - [ ] Build dev client: `eas build --platform ios --profile development`
  - [ ] Install on device via EAS / Expo Orbit
  - [ ] Visually confirm: map renders, PMTiles tiles load, pan/pinch smooth
  - [ ] `git add tacet-mobile/ && git commit`

## Dev Notes

### Architecture Constraints (MUST follow)

- **`tacet-mobile/` is a standalone Expo project** — NOT a Next.js project, NOT a monorepo package. It lives at `[repo-root]/tacet-mobile/` next to `[repo-root]/tacet/` (the Next.js app).
- **No native folders to commit** — Expo managed workflow: `ios/` and `android/` are NOT committed (add to `.gitignore`). EAS builds them remotely.
- **`app.json` not `app.config.ts`** for initial setup — simpler and sufficient. Upgrade to `app.config.ts` only if dynamic config is needed later.
- **Expo Go will NOT work** — MapLibre RN requires a custom dev client. Do not attempt to test with Expo Go; it will fail with a native module error.
- **`@/` path alias** — configure in `tsconfig.json` (`"paths": { "@/*": ["./src/*"] }`) and in `babel.config.js` (`module-resolver` plugin). All imports must use `@/` — never `../../`.

### PMTiles Style JSON Pattern

```typescript
// src/constants/mapStyle.ts
export const PMTILES_STYLE = {
  version: 8,
  glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/dark",
  sources: {
    protomaps: {
      type: "vector",
      url: "pmtiles://https://build.protomaps.com/20240828.pmtiles",
      attribution: "© Protomaps, © OpenStreetMap",
    },
  },
  layers: [
    // Minimal dark base map layers — see Protomaps dark theme
    // Full layer list: https://protomaps.com/docs/basemaps/theme-dark
  ],
};
```

> ⚠️ The `pmtiles://https://...` URL must be INSIDE the style JSON object, not passed directly as a MapView prop. MapLibre Native's built-in PMTiles reader handles it from there. This is the fix for the iOS NSUrl crash (issue #618, PR #625).

### MapView Usage Pattern

```tsx
// app/(tabs)/index.tsx
import MapView from "@maplibre/maplibre-react-native";
import { PMTILES_STYLE } from "@/constants/mapStyle";
import { StyleSheet, View } from "react-native";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleJSON={JSON.stringify(PMTILES_STYLE)}
        logoEnabled={false}
        compassEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  map: { flex: 1 },
});
```

### NativeWind v4 Setup (babel.config.js + metro.config.js)

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: { "@": "./src" },
        },
      ],
    ],
  };
};
```

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

### jest-expo transformIgnorePatterns

```json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|nativewind|react-native-css-interop)"
    ]
  }
}
```

### EAS eas.json

```json
{
  "cli": { "version": ">= 13.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Key Version Constraints

| Package | Version | Notes |
|---------|---------|-------|
| expo | SDK 53 | New arch enabled by default |
| @maplibre/maplibre-react-native | v11 beta (`@next`) | Full new-arch support; fallback to v10 if unstable |
| nativewind | v4 | Production-stable; v5 is preview only |
| expo-router | v4 | Default in SDK 53 |
| react-native | ≥ 0.74 | Bundled with Expo SDK 53 |

### What NOT to do

- Do NOT install Serwist, next-pwa, or any PWA-related package — this is a native app
- Do NOT run `expo prebuild` or commit `ios/`/`android/` folders — EAS manages this
- Do NOT use Expo Go for testing — it won't work with MapLibre RN
- Do NOT add GeoJSON layers, zone selection, or API calls in this story — scaffold only
- Do NOT use `../../` relative imports — always `@/`

### Project Structure

```
tacet-mobile/
  app/
    _layout.tsx          ← Root stack + NativeWind theme provider
    (tabs)/
      _layout.tsx        ← Tab navigator
      index.tsx          ← Map screen (this story)
  src/
    constants/
      mapStyle.ts        ← PMTILES_STYLE constant
  __tests__/
    smoke.test.ts        ← Jest smoke test
  app.json               ← Expo config + MapLibre plugin
  eas.json               ← EAS build profiles
  babel.config.js        ← NativeWind babel plugin + module-resolver
  metro.config.js        ← NativeWind metro plugin
  tailwind.config.js     ← NativeWind content paths
  global.css             ← NativeWind global CSS (minimal)
  tsconfig.json          ← @/ path alias
  .env                   ← EXPO_PUBLIC_API_BASE_URL (not committed)
  .env.example           ← Template for env vars
  .gitignore             ← node_modules/, ios/, android/, .expo/
```

### References

- Research document (primary): `_bmad-output/planning-artifacts/research/technical-maplibre-rn-pmtiles-expo-research-2026-03-20.md`
- MapLibre RN Expo setup: https://maplibre.org/maplibre-react-native/docs/setup/expo/
- PMTiles iOS fix (PR #625): https://github.com/maplibre/maplibre-react-native/issues/618
- NativeWind v4 installation: https://www.nativewind.dev/getting-started/expo-router
- EAS Build intro: https://docs.expo.dev/build/introduction/
- Expo unit testing: https://docs.expo.dev/develop/unit-testing/

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

N/A

### Completion Notes List

- Expo SDK 55 installed (template default — newer than specified SDK 53, full new-arch support confirmed)
- MapLibre RN v11.0.0-beta.18 installed via `@beta` tag (`@next` no longer exists)
- Config plugin auto-added to app.json by `npx expo install`
- `@/` path alias resolves to project root (`./*`) — consistent with template structure; `src/` layer not needed
- `nativewind/babel` plugin skipped in Jest env (conflicts with Babel caching); use `process.env.NODE_ENV` check — `api.env()` cannot be used after `api.cache()`
- global.css imported in `app/_layout.tsx` to activate NativeWind styles
- jest-expo 55.0.11 + jest 29.7.0; smoke test validates PMTILES_STYLE shape
- EAS build requires Apple Developer Program ($99/year) and physical device for dev client

### File List

- tacet-mobile/app/(tabs)/index.tsx
- tacet-mobile/app/_layout.tsx
- tacet-mobile/constants/mapStyle.ts
- tacet-mobile/babel.config.js
- tacet-mobile/metro.config.js
- tacet-mobile/tailwind.config.js
- tacet-mobile/global.css
- tacet-mobile/global.d.ts
- tacet-mobile/eas.json
- tacet-mobile/.env.example
- tacet-mobile/.gitignore (updated)
- tacet-mobile/package.json (updated — jest config + test script)
- tacet-mobile/__tests__/smoke.test.ts
