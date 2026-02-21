# Architecture — Tacet V1.0

**Version :** 1.0
**Date :** 2026-02-21
**Méthode :** BMAD-METHOD — Phase 2 (Software Architect)
**Statut :** Validé ✅
**Référence :** [prd.md](./prd.md)

---

## 1. Vue d'ensemble

Tacet V1 est une application **statique full-client** (Next.js static export ou SSR léger) avec une carte interactive Mapbox, sans backend applicatif propre. Toutes les données sont servies sous forme de fichiers statiques.

```
┌─────────────────────────────────────────────────────┐
│                   Utilisateur (browser)              │
│              PWA installable / mobile-first          │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────┐
│              Vercel CDN (Edge Network)               │
│   Next.js 14 App Router (static export preferred)   │
│                                                      │
│   /                → page.tsx (Map + Search)         │
│   /data/paris-noise-iris.geojson  → fichier statique │
│   /manifest.json   → PWA manifest                   │
│   /sw.js           → Service Worker                 │
└────┬──────────────────────────────────────┬─────────┘
     │ Mapbox GL JS (tiles)                 │ Geocoding API
┌────▼──────────────────┐    ┌─────────────▼──────────┐
│  Mapbox Tile Server   │    │  Mapbox Geocoding API   │
│  (mapbox://styles/...) │    │  (address search)       │
└───────────────────────┘    └────────────────────────┘
```

**Décision clé : pas de backend Tacet en V1.** Toute la logique est côté client. Supabase est supprimé des dépendances actives.

---

## 2. Choix techniques structurants

### 2.1 PWA-only vs application native

**Décision : PWA Next.js uniquement pour V1.**

| Critère | PWA (Next.js) | Native (Expo) |
|---------|---------------|---------------|
| Time-to-market | ✅ Jours | ❌ Semaines (stores) |
| Personas (Lucas/Marie/Sophie) | ✅ Web suffit | Pas de valeur ajoutée V1 |
| Partage (URL par adresse) | ✅ Natif | ❌ Friction (store + deep link) |
| Distribution médias/presse | ✅ URL directe | ❌ Impossible |
| Coût maintenance | ✅ Un seul codebase | ❌ Double codebase |

**Conséquence : le prototype Expo/Rork est mis en pause** (branche archivée, non supprimée).

---

### 2.2 GeoJSON statique vs Mapbox Vector Tiles

**Décision V1 : GeoJSON statique (statu quo) avec optimisation si nécessaire.**

| Critère | GeoJSON statique (actuel) | MVT (Tippecanoe) |
|---------|--------------------------|------------------|
| Complexité implémentation | ✅ Zéro | ❌ Pipeline + tiles serveur |
| Performance (1.66 MB) | ⚠️ 3-4s sur 4G moyen | ✅ Streaming par tuile |
| Mise à jour données | ✅ Remplacer un fichier | ❌ Regénérer toutes les tuiles |
| Hébergement | ✅ Vercel public/ | ❌ Tile server requis |

**Plan d'optimisation si LCP > 3s mesuré en prod :**
1. Compresser le GeoJSON (`gzip` ou `brotli` — Vercel active automatiquement)
2. Simplifier les géométries IRIS (tolérance 0.0001°) → réduction estimée ~30-40%
3. Si encore insuffisant : migrer vers tuiles MVT via Mapbox Uploads API (tiles hébergées chez Mapbox)

---

### 2.3 Supabase

**Décision : Supabase retiré des dépendances Next.js en V1.**

Il n'y a aucun use case backend défini en V1 (pas d'auth, pas de persistance, pas de crowdsourcing). La dépendance `@supabase/supabase-js` sera retirée du `package.json` de `tacet/`.

Supabase sera réintroduit si Phase 3+ nécessite : favoris utilisateurs, crowdsourcing bruit, alertes personnalisées.

---

### 2.4 Mapbox token management

**Décision : token public dans variable d'env côté client uniquement.**

- `NEXT_PUBLIC_MAPBOX_TOKEN` : token Mapbox public (préfixe `pk.`) dans `.env.local`
- Configurer les restrictions URL sur le token Mapbox (autoriser uniquement `tacet.vercel.app` et `localhost`)
- Aucun token secret côté client

---

### 2.5 Structure de déploiement Vercel

**Décision : Next.js App Router avec rendu hybride (statique par défaut).**

- `page.tsx` → rendu statique (pas de `getServerSideProps`, pas d'API routes en V1)
- GeoJSON servi depuis `public/data/` → CDN Vercel (Edge cache)
- Compression Brotli automatique par Vercel → GeoJSON 1.66 MB → ~300-400 KB compressé
- Build command : `npm run build` dans le répertoire `tacet/`

---

## 3. Structure des composants

```
tacet/src/
├── app/
│   ├── layout.tsx           # Root layout, dark mode, meta
│   └── page.tsx             # Page principale (composition)
├── components/
│   ├── Map.tsx              # Mapbox choroplèthe (existant — à modifier)
│   ├── Legend.tsx           # Légende glassmorphism (existant — à modifier)
│   ├── IrisPopup.tsx        # Panel détail zone IRIS (à créer)
│   └── SearchBar.tsx        # Barre de recherche Mapbox geocoding (à créer)
├── lib/
│   └── noise-categories.ts  # Design system couleurs + constantes (existant — à corriger)
└── types/
    └── iris.ts              # Types TypeScript pour les propriétés IRIS (à créer)
```

### Flux de données principal

```
page.tsx
  └── Map.tsx
        ├── fetch("/data/paris-noise-iris.geojson") → GeoJSON state
        ├── Source + Layer (choroplèthe)
        ├── onClick(feature) → selectedIris state → IrisPopup.tsx
        └── SearchBar.tsx
              └── Mapbox Geocoding API → flyTo() + selectedIris state
```

---

## 4. Design system couleurs (centralisé)

**Source unique de vérité : `tacet/src/lib/noise-categories.ts`**

```typescript
export const NOISE_COLORS = {
  1: '#0D9488', // Calme      — teal-600
  2: '#F59E0B', // Modéré     — amber-400
  3: '#F97316', // Bruyant    — orange-500
  4: '#EF4444', // Très bruyant — red-500 (non peuplé V1)
} as const;

export const NOISE_LABELS = {
  1: 'Calme',
  2: 'Modéré',
  3: 'Bruyant',
  4: 'Très bruyant',
} as const;

export const ACTIVE_LEVELS = [1, 2, 3] as const; // niveau 4 absent données Bruitparif

export const PARIS_CENTER: [number, number] = [2.3522, 48.8566];
export const DEFAULT_ZOOM = 11.5;
```

Toutes les couleurs dans `Map.tsx` et `Legend.tsx` **référencent `NOISE_COLORS`**, sans valeur hardcodée.

---

## 5. Types TypeScript

**Nouveau fichier : `tacet/src/types/iris.ts`**

```typescript
export interface IrisProperties {
  code_iris: string;
  name: string;
  c_ar: number;
  noise_level: 1 | 2 | 3 | 4;
  source_type: 'bruitparif' | 'arrondissement_fallback';
  primary_sources: string[];
  day_level: number;
  night_level: number;
  description: string;
}

export interface IrisFeature extends GeoJSON.Feature<GeoJSON.Polygon, IrisProperties> {}
```

---

## 6. Performance targets

| Métrique | Target | Méthode de mesure |
|---------|--------|-------------------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Lighthouse, 4G throttle |
| FID / INP | ≤ 100ms | Lighthouse |
| GeoJSON load time | ≤ 2s | Network tab, 4G throttle |
| Lighthouse Performance | ≥ 85 | Production build |
| Lighthouse PWA | ≥ 90 | Production build |
| Lighthouse Accessibility | ≥ 85 | Production build |

---

## 7. PWA — spécifications

### manifest.json

```json
{
  "name": "Tacet — Bruit à Paris",
  "short_name": "Tacet",
  "description": "Visualisez la pollution sonore à Paris",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0D9488",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker

Stratégie : **cache-first** pour assets statiques + GeoJSON, **network-first** pour geocoding API.

Implémentation recommandée : `next-pwa` (Ducanh Tran) ou service worker custom minimal.

---

## 8. Décisions différées (post-V1)

| Décision | Contexte | Timing |
|---------|---------|--------|
| Mapbox Vector Tiles | Si performance GeoJSON insuffisante | Post-déploiement V1 si LCP > 3s |
| Supabase auth + favoris | Si rétention devient objectif | Phase 2 |
| Custom domain | `tacet.app` ou `tacetparis.fr` | Post-lancement |
| Expansion Île-de-France | GeoJSON Paris → IDF | Phase 4 |

---

## 9. Artefacts BMAD suivants

- [x] `docs/project-brief.md` — ✅ Validé
- [x] `docs/prd.md` — ✅ Validé
- [x] `docs/architecture.md` — ✅ Ce document
- [ ] `docs/epics/` — À créer (BMAD-3)
- [ ] `docs/stories/` — À créer (BMAD-4)
