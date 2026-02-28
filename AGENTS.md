# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Tacet is an Expo-based React Native mobile application built with TypeScript. The project uses Expo Router for file-based routing and targets iOS, Android, and web platforms. Key integrations include Supabase for backend services and Mapbox for mapping functionality.

## Architecture

### Routing System
The app uses Expo Router with file-based routing:
- `app/_layout.tsx`: Root layout with font loading, splash screen management, and theme provider setup
- `app/(tabs)/_layout.tsx`: Tab navigation layout with two tabs
- `app/(tabs)/index.tsx` and `app/(tabs)/two.tsx`: Main tab screens
- `app/modal.tsx`: Modal screen accessible via stack navigation
- The initial route is configured to `(tabs)` via `unstable_settings.initialRouteName`

### Theming System
Theme management is centralized and supports both light and dark modes:
- `constants/Colors.ts`: Defines color palettes for light/dark themes
- `components/Themed.tsx`: Provides `Text` and `View` components that automatically adapt to the current color scheme
- `components/useColorScheme.ts` (and `.web.ts`): Platform-specific hooks for detecting color scheme
- Theme colors are applied via React Navigation's `ThemeProvider`

### Path Aliases
TypeScript is configured with the `@/*` path alias that resolves to the project root, enabling imports like `@/components/Themed` instead of relative paths.

### Platform-Specific Code
The project uses `.web.ts` extensions for web-specific implementations (e.g., `useColorScheme.web.ts`, `useClientOnlyValue.web.ts`) to provide different behavior across platforms.

## Environment Configuration

### Required Environment Variables
Copy `.env.example` to `.env` and configure:
- `SUPABASE_URL`: Your Supabase project URL (found in Settings > API > Project URL)
- `SUPABASE_ANON_KEY`: Supabase public/anon key (found in Settings > API > Project API keys)
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox public token (starts with `pk.`, found at https://account.mapbox.com/)
- `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`: Mapbox download/secret token (starts with `sk.`, create with DOWNLOADS:READ scope at https://account.mapbox.com/access-tokens/)

**CRITICAL**: Never commit the `.env` file. The `.gitignore` is configured to exclude all `.env*` files except `.env.example`.

## Development Commands

### Running the App
```bash
npm start              # Start Expo dev server with platform selector
npm run android        # Start on Android emulator/device
npm run ios            # Start on iOS simulator/device
npm run web            # Start web version
```

### EAS Build (Production)
The project is configured with EAS (Expo Application Services):
- Development builds: `eas build --profile development`
- Preview builds: `eas build --profile preview`
- Production builds: `eas build --profile production`
- EAS project ID: `dca79a48-1c47-4034-89c5-f29214e50d29`

## Key Dependencies

### Core Framework
- **Expo SDK 54**: Main framework with new architecture enabled (`newArchEnabled: true`)
- **Expo Router 6**: File-based routing system
- **React 19.1.0** and **React Native 0.81.5**

### Notable Libraries
- `@supabase/supabase-js`: Backend integration (requires environment configuration)
- `@rnmapbox/maps`: Mapbox integration for maps. Initialized in `config/mapbox.ts` with token from environment variables. Use the `MapView` component from `components/MapView.tsx` for basic map functionality.
- `expo-location`: Location services (configured in app.json with permission message)
- `@react-native-async-storage/async-storage`: Local storage
- `react-native-reanimated` and `react-native-worklets`: Animation support

## Important Notes

### TypeScript Configuration
- Strict mode is enabled
- Project extends `expo/tsconfig.base`
- Typed routes are experimental and enabled via `app.json`

### Native Folders
The `/ios` and `/android` folders are generated and gitignored. They are created during development client builds and should not be manually edited or committed.

### Package Information
The package is currently named `temp-expo-init` - this should be updated along with the app scheme (`tempexpoinit`) and Android package name (`com.ivandemurard.tacet`) if this is meant to be production-ready.

### Web Support
Web bundling uses Metro (not webpack), and static output is configured in `app.json`.
