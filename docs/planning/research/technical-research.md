---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - _bmad-output/planning-artifacts/research/domain-Tacet-research-2026-02-25.md
  - _bmad-output/planning-artifacts/research/market-Tacet-research-2026-02-25.md
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Stack cartographique web · PWA géospatiale · pipeline données acoustiques (statiques + temps réel)'
research_goals: 'Évaluer la stack actuelle (Next.js 14.2 + Mapbox GL 3.18) · Stratégie GeoJSON 992 IRIS vs vector tiles · Intégration données temps réel (WebSocket/SSE/polling) · Analyse spatiale client (turf.js, WASM) · PWA offline (Service Worker, Lighthouse, manifest)'
user_name: 'IVAN'
date: '2026-02-25'
web_research_enabled: true
source_verification: true
---

# Research Report: Technical — Stack Cartographique Tacet

**Date:** 2026-02-25
**Author:** IVAN
**Research Type:** technical

---

## Research Overview

Cette recherche technique couvre l'évaluation de la stack actuelle de Tacet (Next.js 14.2 App Router · TypeScript · TailwindCSS · Mapbox GL 3.18 · Vercel · GeoJSON statique) et définit les patterns d'architecture cibles pour V2. Elle répond aux 5 objectifs : stack cartographique (Mapbox vs MapLibre vs Deck.gl), performance GeoJSON 992 IRIS, intégration données temps réel (WebSocket vs SSE vs polling), analyse spatiale client (turf.js), et stratégie PWA offline.

Les findings de la Domain Research alimentent directement cette Technical Research : les sources temps réel identifiées (Bruitparif RUMEUR, proxy trafic Open Data Paris, IDFM GTFS-RT) définissent les contraintes d'intégration. Les décisions architecturales prises ici (ADRs) fondent la roadmap technique V2/V3.

---

## Technical Research Scope Confirmation

**Research Topic :** Stack cartographique web · PWA géospatiale · pipeline données acoustiques (statiques + temps réel)

**Research Goals :**
- Évaluation stack actuelle — Next.js 14.2 + Mapbox GL 3.18 : limites actuelles, alternatives open-source (MapLibre GL, Deck.gl, PMTiles)
- Performance GeoJSON 992 IRIS — vectortiles vs GeoJSON statique, CDN strategy, clustering, lazy loading
- Intégration données temps réel — WebSocket vs SSE vs polling, edge functions vs serverless, cache strategy
- Analyse spatiale client — turf.js (point-in-polygon, isochrone, buffer), WASM, stratégie progressive
- PWA et offline — Service Worker, stratégie cache, manifest, score Lighthouse cible, install prompt

**Technical Research Scope :**

- Architecture Analysis — design patterns App Router, composants cartographiques, gestion état géospatial
- Implementation Approaches — patterns d'intégration GeoJSON dynamique, tile strategy, SSE streaming
- Technology Stack — évaluation Mapbox GL vs MapLibre GL vs Deck.gl vs PMTiles, Next.js edge vs serverless
- Integration Patterns — APIs Bruitparif/Open Data Paris, Mapbox Geocoding, WebSocket/SSE patterns
- Performance Considerations — Lighthouse score, bundle size, lazy loading, offline-first

**Research Methodology :**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed :** 2026-02-26

---

## Technology Stack Analysis

### Stack actuelle Tacet — Évaluation de départ

```
Next.js 14.2 App Router · TypeScript strict · TailwindCSS 3.x
Mapbox GL JS 3.18 · react-map-gl v8 · MapRef / queryRenderedFeatures
GeoJSON statique 992 IRIS Paris (~2.4 Mo) · Vercel (serverless)
Données : Bruitparif CSB 2024 (IRIS) + arrondissements · Mapbox Geocoding API
```

**Composants livrés Sprint Élections :** IrisPopup · SearchBar · BarometreChart · `/barometre` · `/elections` · AppNav · `noise-categories.ts` (Score Sérénité 0-100)

---

### Bibliothèques Cartographiques — Évaluation comparative

#### Mapbox GL JS 3.18 (stack actuelle)

**Licence :** Propriétaire (Business Source Licence depuis v2.0, 2020). Usage commercial soumis à clé API + facturation.

**Tarification 2024-2025 :**
- **50 000 map loads gratuits/mois** (un "map load" = initialisation d'un objet Map)
- Au-delà : **$5 / 1 000 map loads**
- > 1 000 000 loads/mois : tarification personnalisée

**Analyse coût pour Tacet :**

| Audience mensuelle | Map loads estimés | Coût Mapbox |
|-------------------|------------------|-------------|
| 10 000 visiteurs | ~15 000 loads | ✅ Gratuit |
| 50 000 visiteurs | ~75 000 loads | ~$125/mois |
| 200 000 visiteurs | ~300 000 loads | ~$1 250/mois |
| 1 M visiteurs | ~1 500 000 loads | ~$7 500+/mois |

> **Risque identifié :** À partir de ~33k utilisateurs actifs mensuels, Mapbox devient payant. Non viable à l'échelle pour un service B2C gratuit sans monétisation.

**Points forts Mapbox GL 3.18 :** terrain 3D, Globe projection, performances tiles propriétaires, Geocoding API intégrée, documentation très complète.

_Source : [Mapbox Pricing](https://www.mapbox.com/pricing) · [Mapbox GL JS Pricing Guide](https://docs.mapbox.com/mapbox-gl-js/guides/pricing/)_

---

#### MapLibre GL JS — Alternative open source

**Licence :** **BSD 3-Clause / MIT** — entièrement open source, pas de clé API requise.

**Origine :** Fork communautaire de Mapbox GL JS (2020) créé après le passage de Mapbox à une licence propriétaire. Maintenu par la Linux Foundation (OpenJS).

**Version actuelle :** v4.x (2024-2025). **Migration Mapbox → MapLibre :** [guide officiel](https://maplibre.org/maplibre-gl-js/docs/guides/mapbox-migration-guide/) documenté.

**Performance comparée :**
- MDPI 2024 — analyse comparative sur grands datasets vectoriels : Mapbox GL JS légèrement plus rapide pour >50 000 features
- Pour 992 polygones IRIS (taille Tacet) : **différence de performance négligeable** — les deux bibliothèques gèrent trivialement ce volume
- Initialisation légèrement plus lente pour <1000 features (offset de performance à 1000+ features)

**Compatibilité :**
- `react-map-gl` v8 supporte **nativement MapLibre** via `maplibre-gl` comme peer dependency — migration à coût minimal
- API quasi-identique à Mapbox GL JS (fork direct) → changement d'import principalement

**Différences fonctionnelles vs Mapbox :**
- Pas de terrain 3D aussi poussé (en développement dans MapLibre)
- Pas de Mapbox Geocoding intégré (remplacé par alternatives : Nominatim, Photon, ou garder Mapbox Geocoding séparément)
- Styles compatibles (Mapbox Style Spec partiellement, divergences mineures)
- Communauté très active, développement rapide (releases fréquentes 2024-2025)

**Verdict pour Tacet :** ✅ **Candidat sérieux pour V2**. Économies de coûts potentiellement importantes à l'échelle. Migration depuis Mapbox GL JS documentée et techniquement peu risquée.

_Source : [MapLibre GL JS GitHub](https://github.com/maplibre/maplibre-gl-js) · [Guide migration Mapbox→MapLibre](https://maplibre.org/maplibre-gl-js/docs/guides/mapbox-migration-guide/) · [MDPI — Comparative performance 2024](https://www.mdpi.com/2220-9964/14/9/336)_

---

#### Deck.gl — Visualisation données avancée

**Licence :** MIT (open source, vis.gl / OpenJS Foundation)

**Focus :** Visualisation de **très grandes quantités de données** via WebGPU/WebGL2. Layers spécialisés : ScatterplotLayer, HeatmapLayer, HexagonLayer, TripsLayer (animation), MVTLayer (vector tiles).

**React integration :** Native (`<DeckGL>` composant React).

**Pertinence Tacet :**
- V1-V2 : **non recommandé** comme bibliothèque principale — overkill pour un choropleth polygon 992 IRIS
- V3 : **pertinent** pour visualisations data-lourdes :
  - Heatmap dynamique de bruit temps réel (capteurs RUMEUR)
  - Animation de flux mobilité (IDFM GTFS-RT)
  - Hexbin aggregation de mesures NoiseCapture
- Peut être utilisé **en superposition** sur MapLibre GL (DeckGL overlay) sans remplacer la bibliothèque de base

_Source : [deck.gl](https://deck.gl/) · [GitHub visgl/deck.gl](https://github.com/visgl/deck.gl)_

---

### Stratégie GeoJSON vs Vector Tiles — Performance Pipeline

#### Situation actuelle : GeoJSON statique

Le fichier `paris-noise-iris.geojson` (992 features IRIS) est chargé statiquement via `addSource` dans Map.tsx. Taille estimée : **~2-3 Mo** (GeoJSON non compressé avec géométries IRIS détaillées).

**Optimisations GeoJSON disponibles :**
- Compression gzip/brotli via Vercel (automatique pour assets statiques) → ~70% réduction sur wire
- Simplification géométries (tippecanoe `--simplification`) pour zooms faibles
- `maxZoom` sur la source GeoJSON (recommandé : 12-14 pour polygones IRIS) → améliore rendu aux zooms faibles
- `buffer`, `tolerance` params sur la source pour contrôler la précision de tuilage en mémoire

**Verdict GeoJSON actuel pour V1 :** ✅ Acceptable. 992 features polygonales = volume que Mapbox/MapLibre gère sans difficulté. Optimisation gzip de Vercel couvre l'essentiel.

#### PMTiles — Alternative tiles auto-hébergée

**Qu'est-ce que PMTiles :**
- Format de fichier unique (`.pmtiles`) contenant toutes les tuiles vectorielles à tous les niveaux de zoom
- Accès via **HTTP range requests** → pas de serveur tile requis, hébergeable sur S3/R2/Vercel Blob
- **Réduction taille 70%+** vs tiles individuelles pré-générées (déduplication interne)
- Tippecanoe v2.17+ génère directement des fichiers `.pmtiles`

**Pipeline GeoJSON → PMTiles pour Tacet :**
```bash
tippecanoe -o iris-paris.pmtiles \
  --simplification=2 \
  --maximum-zoom=16 \
  --minimum-zoom=10 \
  -l iris \
  paris-noise-iris.geojson
```

**Intégration MapLibre GL + PMTiles :**
```typescript
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

// Hook racine — setup une fois
const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
```

**Source MapLibre pointant sur le fichier PMTiles :**
```typescript
map.addSource('iris', {
  type: 'vector',
  url: 'pmtiles:///iris-paris.pmtiles', // ou URL S3/R2
});
```

**Avantages PMTiles pour Tacet V2 :**
- Pas d'appels aux tuiles Mapbox → **zéro coût infrastructure tile** si MapLibre utilisé
- Scalabilité illimitée via CDN statique (Vercel Edge Network, Cloudflare R2)
- Mise à jour facile (re-générer le `.pmtiles` à chaque nouveau millésime Bruitparif)
- Compatible Vercel : servir le `.pmtiles` depuis `/public` ou Vercel Blob

**Verdict PMTiles :** 🟠 **Candidat V2** (si migration MapLibre confirmée). Apporte souveraineté totale sur les tiles, élimine dépendance Mapbox Tiling Service.

_Source : [PMTiles Docs — Protomaps](https://docs.protomaps.com/pmtiles/) · [PMTiles MapLibre integration](https://docs.protomaps.com/pmtiles/maplibre) · [Simon Willison — PMTiles](https://til.simonwillison.net/gis/pmtiles) · [Tippecanoe GitHub](https://github.com/mapbox/tippecanoe)_

---

### Next.js 15 — Évaluation pour Tacet

**Version actuelle Tacet :** Next.js 14.2 App Router. Next.js 15 est disponible (stable depuis oct. 2024).

**Changements Next.js 15 pertinents :**

| Feature | Next.js 14.2 | Next.js 15 | Impact Tacet |
|---------|-------------|-----------|-------------|
| **React** | React 18 | React 19 support | Concurrent features + Actions |
| **Caching** | Agressif par défaut | Conservative par défaut | API routes moins cachées par défaut → plus prévisible pour données temps réel |
| **Turbopack** | Beta | Stable dev server | Build dev plus rapide |
| **`after()`** | Non disponible | Disponible | Exécuter code après réponse (analytics, logs) |
| **`instrumentation.js`** | Non disponible | Disponible | Hooks cycle de vie serveur |

**Pattern carte Tacet — Server vs Client components :**
```
page.tsx (Server Component)
  ├── <Map /> → dynamic(() => import('./Map'), { ssr: false }) ← Client Component
  ├── <Legend /> → Server Component (statique)
  └── <AppNav /> → Server Component (statique)
```

Ce pattern est **déjà optimal** : la carte est client-side (SSR impossible pour Mapbox/MapLibre GL), le shell est server-rendered. La migration Next.js 14→15 ne nécessite pas de changement architectural.

**Route Handlers pour proxy API (pattern V2 recommandé) :**
```typescript
// app/api/bruit/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const res = await fetch(`https://rumeur.bruitparif.fr/api/...${searchParams}`, {
    next: { revalidate: 180 } // cache 3min = refresh Bruitparif Périphérique
  });
  return Response.json(await res.json());
}
```

**Verdict Next.js :** ✅ **Conserver Next.js App Router**. Migration 14→15 recommandée (meilleur caching comportement pour données dynamiques). Pas de changement architectural requis.

_Source : [Next.js 15 App Router Guide](https://dev.to/devjordan/nextjs-15-app-router-complete-guide-to-server-and-client-components-5h6k) · [Next.js Streaming Handbook](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/) · [Next.js Docs](https://nextjs.org/docs/app)_

---

### Cloud Infrastructure — Vercel

**Stack déploiement actuel :** Vercel (serverless functions + Edge Network CDN).

**Capacités Vercel pertinentes pour Tacet V2 :**

| Feature Vercel | Usage Tacet | Pertinence |
|---------------|-------------|-----------|
| **Edge Network CDN** | Servir GeoJSON / PMTiles statiques | ✅ Critique — latence réduite |
| **Serverless Functions** | Route handlers API proxy (Bruitparif, Geocoding) | ✅ V2 — proxy API secrets |
| **Edge Middleware** | Rate limiting, géo-restriction | 🟡 V3 si API B2B |
| **Vercel Blob** | Stockage PMTiles (< 500 Mo) | ✅ V2 si PMTiles adopté |
| **Streaming (SSE)** | Server-Sent Events via route handlers | ✅ V2 si données temps réel |
| **KV Store (Redis)** | Cache données Bruitparif (TTL 3min) | 🟡 V2-V3 si haute fréquence |
| **Analytics** | Core Web Vitals intégré | 🟡 Complément Umami (TAC-27) |

**Plan Vercel actuel :** Hobby (gratuit). Limites : 100 Go bandwidth/mois, 12s timeout serverless functions, pas de team collaboration.

**Migration vers Pro si :** audience > ~50k visiteurs/mois (bandwidth limit), ou besoin de timeout > 12s (pipelines ML), ou collaboration équipe.

**Verdict Vercel :** ✅ **Conserver Vercel**. Stack optimal pour Next.js App Router. Migrer vers Pro avant scaling.

---

### Technology Adoption Trends — Cartographie web 2024-2025

**Tendances majeures :**

1. **MapLibre GL adoption accélérée** : migration de nombreuses entreprises depuis Mapbox suite aux hausses tarifaires 2020-2022. Airbnb, Foursquare, plusieurs agences gouvernementales ont migré.
2. **PMTiles comme standard émergent** : adoption croissante pour auto-hébergement tiles (alternative à Mapbox Tiling Service et PostGIS tile servers). Supporté nativement par MapLibre, OpenLayers, Mapbox (via plugin).
3. **Tippecanoe** : outil de référence pour GeoJSON → vector tiles. Maintenu par Mapbox, open source (BSD). Version Python disponible (`pypotrecanoe`).
4. **WebGPU adoption** : Deck.gl et MapLibre commencent à exploiter WebGPU (Chrome 113+ stable). Amélioration performances rendering 2D/3D significative à terme.
5. **Next.js App Router** : adoption majoritaire pour nouveaux projets React 2024-2025 (State of JS 2024). Pattern Server + Client components désormais mature.

_Sources : [MapLibre GL GitHub](https://github.com/maplibre/maplibre-gl-js) · [Mapbox vs MapLibre comparison](https://www.gispeople.com.au/mapbox-vs-maptiler-vs-maplibre-vs-leaflet-which-to-choose/) · [Optimising MapLibre performance — large GeoJSON](https://maplibre.org/maplibre-gl-js/docs/guides/large-data/) · [Tippecanoe vector tiles 2025](https://johal.in/tippecanoe-vector-tiles-python-geojson-optimize-2025/)_

_Confiance globale : Haute (documentation officielle + sources techniques vérifiées)_

---

## Integration Patterns

### Contexte d'intégration Tacet

Tacet doit orchestrer plusieurs sources de données hétérogènes :
- **Données statiques** : 992 polygones IRIS (GeoJSON ~3,8 Mo non compressé · PMTiles V2)
- **Données semi-statiques** : millésimes Bruitparif PPBE (mise à jour annuelle)
- **Données temps réel** : capteurs RUMEUR Bruitparif (refresh 1s–3min), événements Open Data Paris
- **Geocodage** : recherche adresse pour centrer la carte (actif, query utilisateur)
- **Sécurité API** : clés Mapbox et futures clés API Bruitparif ne doivent jamais être exposées côté client

---

### Protocoles de communication temps réel — SSE vs WebSocket vs Polling

**Analyse comparative pour Tacet :**

| Critère | Short Polling | Long Polling | SSE | WebSocket |
|---------|-------------|-------------|-----|-----------|
| **Direction** | Client → Server (repeated) | Client → Server (hold) | Server → Client (unidirectional) | Bidirectionnel |
| **Protocol** | HTTP | HTTP | HTTP/EventSource | WS/WSS |
| **Vercel Support** | ✅ Natif | ✅ Natif | ✅ Via Route Handlers + ReadableStream | ❌ Non supporté (serverless) |
| **Complexité** | Faible | Moyenne | Faible | Haute |
| **Reconnexion auto** | Manuelle | Manuelle | ✅ Navigateur natif | Manuelle |
| **Idéal pour** | Données peu fréquentes | États intermédiaires | Push serveur périodique | Chat/gaming/bidirectionnel |
| **Tacet cas d'usage** | 🟡 Backup | 🔴 Non recommandé | ✅ **Recommandé** | 🔴 Non viable Vercel |

**Conclusion SSE pour Tacet :**
- Bruitparif RUMEUR refresh toutes les **3 minutes** (Périphérique) ou **1 minute** → SSE parfaitement adapté
- Vercel serverless **ne supporte pas les WebSocket** long-running → SSE est l'unique choix viable
- API `EventSource` native dans tous les navigateurs modernes, **aucune dépendance externe**
- Reconnexion automatique par le navigateur en cas de coupure réseau
- 2025 : montée en puissance de SSE dans les applications React/Next.js (GitHub code search +340% depuis 2023)

**Pattern SSE implémentation Next.js App Router :**
```typescript
// app/api/rumeur-stream/route.ts
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Premier envoi immédiat
      const initialData = await fetchBruitparifRumeur();
      send(initialData);

      // Polling interne vers Bruitparif (3 min refresh)
      const interval = setInterval(async () => {
        const data = await fetchBruitparifRumeur();
        send(data);
      }, 3 * 60 * 1000);

      // Cleanup à la fermeture de la connexion
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Important pour Nginx/Vercel
    },
  });
}
```

**Client React (hook custom) :**
```typescript
// hooks/useRumeurStream.ts
import { useEffect, useState } from 'react';

export function useRumeurStream() {
  const [data, setData] = useState<RumeurData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/rumeur-stream');

    eventSource.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    eventSource.onerror = () => {
      setError('Connexion perdue — reconnexion automatique...');
    };

    return () => eventSource.close();
  }, []);

  return { data, error };
}
```
_Source : [SSE vs WebSocket — Ably](https://ably.com/blog/websockets-vs-sse) · [Next.js 15 SSE Route Handlers](https://damianhodgkiss.com/tutorials/real-time-updates-sse-nextjs) · [Vercel SSE limitations](https://github.com/vercel/next.js/discussions/48427) · [SSE comeback 2025](https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/)_

---

### Proxy API sécurisé — Pattern Next.js Route Handler

**Problème :** Les clés API (Mapbox, Bruitparif, Open Data Paris si token requis) ne doivent **jamais** être exposées dans le bundle client (reverse-engineering trivial via DevTools).

**Pattern sécurisé — Server-Side Proxy :**

```typescript
// app/api/bruitparif/route.ts
const BRUITPARIF_API_URL = process.env.BRUITPARIF_API_URL!;
const BRUITPARIF_API_KEY = process.env.BRUITPARIF_API_KEY!; // Côté serveur uniquement

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get('station');

  if (!stationId) {
    return Response.json({ error: 'station parameter required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${BRUITPARIF_API_URL}/stations/${stationId}/current`,
      {
        headers: {
          'Authorization': `Bearer ${BRUITPARIF_API_KEY}`,
          'Accept': 'application/json',
        },
        next: { revalidate: 180 }, // Cache 3 minutes côté Vercel
      }
    );

    if (!upstream.ok) {
      return Response.json(
        { error: `Bruitparif error: ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    return Response.json({ error: 'Service temporairement indisponible' }, { status: 503 });
  }
}
```

**Avantages du proxy pattern pour Tacet :**
- Clés API **zéro exposition** côté client (uniquement dans `.env.local` et Vercel env vars)
- **Cache Vercel intégré** : `next: { revalidate: 180 }` → réduit appels upstream Bruitparif
- **Rate limiting** centralisable (Upstash Rate Limit ou simple compteur mémoire)
- **Transformation de données** : normaliser les formats Bruitparif avant envoi au client
- **Logging et monitoring** centralisés pour diagnostiquer les erreurs upstream

**Variables d'environnement Tacet (`.env.local`) :**
```bash
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...  # Préfixe NEXT_PUBLIC pour MapLibre (côté client)
MAPBOX_SECRET_TOKEN=sk.eyJ1...       # Jamais NEXT_PUBLIC — pour server-side uniquement

# Bruitparif (quand API disponible)
BRUITPARIF_API_URL=https://rumeur.bruitparif.fr/api/v1
BRUITPARIF_API_KEY=<négocier avec Bruitparif>

# Open Data Paris (si token requis)
OPENDATAPARIS_API_KEY=<token si datasets restreints>
```

_Source : [Next.js API Key Security](https://nextnative.dev/blog/api-key-secure) · [Secure API Integration Next.js Proxy](https://www.bomberbot.com/proxy/mastering-secure-api-integration-in-next-js-with-proxy-endpoints/) · [Building APIs with Next.js](https://nextjs.org/blog/building-apis-with-nextjs)_

---

### Intégration Open Data Paris — Explore API v2.1

**Base URL :** `https://opendata.paris.fr/api/explore/v2.1/`

**Endpoints pertinents pour Tacet :**

| Dataset | Endpoint | Format | Licence | Refresh |
|---------|----------|--------|---------|---------|
| IRIS polygones | `/catalog/datasets/iris-demographiques-paris-2021/exports/geojson` | GeoJSON | ODbL | Annuel |
| Chantiers RATP/IDFM | `/catalog/datasets/chantiers-en-cours/records` | JSON/GeoJSON | ODbL | Hebdo |
| Événements Paris | `/catalog/datasets/que-faire-a-paris-/records` | JSON | ODbL | Quotidien |
| Aires piétonnes | `/catalog/datasets/voie-pieton-temporaire/exports/geojson` | GeoJSON | ODbL | Variable |
| Plan de Gêne Sonore | `/catalog/datasets/plan-de-gene-sonore-pgs/exports/geojson` | GeoJSON | ODbL | Annuel |

**Exemple d'appel Next.js :**
```typescript
// lib/opendata-paris.ts
const ODP_BASE = 'https://opendata.paris.fr/api/explore/v2.1';

export async function getChantiers(limit = 100) {
  const url = new URL(`${ODP_BASE}/catalog/datasets/chantiers-en-cours/records`);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('where', 'statut="En cours"');

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache 1h — chantiers peu volatils
  });

  if (!res.ok) throw new Error(`ODP error: ${res.status}`);
  return res.json();
}
```

**Filtrage géospatial via Explore API :**
```
GET /catalog/datasets/<dataset>/records
  ?where=within_distance(geo_point_2d, geom'POINT(2.3522 48.8566)', 500m)
  &limit=50
```

_Source : [Paris Data — API Console](https://opendata.paris.fr/api/explore/v2.1/console) · [OpenDataSoft Explore API v2.1 Reference](https://help.opendatasoft.com/apis/ods-explore-v2/)_

---

### Geocodage — Mapbox Geocoding vs Alternatives Open Source

**Comparaison pour Tacet (recherche adresse Paris) :**

| Solution | Free tier | Coût au-delà | Auto-complétion | Qualité Paris | Self-hosted |
|----------|-----------|-------------|-----------------|---------------|-------------|
| **Mapbox Geocoding v6** | 100k req/mois | $0.75/1000 req | ✅ Excellente | ✅ Très haute | ❌ |
| **Photon (Komoot)** | Illimité (public) | N/A | ✅ Bonne (OSM) | ✅ Haute | ✅ Option |
| **Nominatim (OSM)** | 1 req/sec throttle | N/A | ⚠️ Limitée | ✅ Bonne | ✅ Complexe |
| **OpenCage** | 2500/jour | $0.50/1000 | ✅ Bonne | ✅ Haute | ❌ |
| **Géoplateforme IGN** | Illimité | Gratuit | ✅ Excellente | ✅ Très haute (BAN) | ❌ |

**Recommandation pour Tacet :**

**Phase V1 (actuelle) :** Mapbox Geocoding v6 — déjà intégré, 100k/mois gratuit, qualité maximale pour Paris.

**Phase V2 (si migration MapLibre) :** Photon Komoot public API `https://photon.komoot.io/api/?q=<query>&lang=fr&limit=5&bbox=1.8,48.5,2.8,49.1` (Paris bbox) — gratuit, sans clé API, OSM-based, excellente qualité pour adresses françaises.

```typescript
// lib/geocoding.ts
export async function geocodeAddress(query: string): Promise<GeocodingResult[]> {
  // V2 : migration vers Photon (zéro coût, OSM)
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', query);
  url.searchParams.set('lang', 'fr');
  url.searchParams.set('limit', '5');
  // Bounding box Île-de-France pour biaiser les résultats
  url.searchParams.set('bbox', '1.8,48.5,2.8,49.1');

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 }, // Résultats geocoding stables — cache 24h
  });

  const json = await res.json();

  // Normaliser vers format GeoJSON Feature standard
  return json.features.map((f: PhotonFeature) => ({
    id: f.properties.osm_id,
    label: [f.properties.name, f.properties.street, f.properties.city]
      .filter(Boolean).join(', '),
    coordinates: f.geometry.coordinates as [number, number],
  }));
}
```

**Alternative IGN Géoplateforme (BAN — Base Adresse Nationale) :**
```
GET https://data.geopf.fr/geocodage/search?q=<adresse>&limit=5&returntruegeometry=false
```
- Données adresses officielles françaises, licence ouverte
- Pas de clé API requise, usage libre
- Pertinent V2 si focus France entière

_Source : [Mapbox Geocoding v6 Pricing](https://distancematrix.ai/blog/mapbox-geocoding-api-review) · [Photon GitHub — Komoot](https://github.com/komoot/photon) · [Nominatim vs Photon — Geoapify](https://www.geoapify.com/nominatim-vs-photon-geocoder/) · [Guide geocoding API pricing 2026](https://mapscaping.com/guide-to-geocoding-api-pricing/)_

---

### Stratégie de cache et revalidation — GeoJSON + données temps réel

**Architecture multi-couche pour Tacet :**

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT                              │
│  SWR / TanStack Query (stale-while-revalidate)           │
│  Cache: mémoire navigateur · TTL configurable            │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / SSE
┌─────────────────────▼───────────────────────────────────┐
│               VERCEL EDGE NETWORK                        │
│  Next.js Route Handler + `next: { revalidate }` cache    │
│  Vercel Data Cache (tag-based invalidation)              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              SOURCES UPSTREAM                            │
│  Bruitparif RUMEUR · Open Data Paris · Vercel Blob       │
└─────────────────────────────────────────────────────────┘
```

**Matrice de cache par type de donnée :**

| Donnée | TTL serveur (`revalidate`) | TTL client (SWR `refreshInterval`) | Stratégie |
|--------|---------------------------|-------------------------------------|-----------|
| GeoJSON IRIS 992 polygones | `false` (statique) | N/A (chargé 1 fois) | PMTiles / static asset |
| Scores Sérénité PPBE | `86400` (24h) | N/A (serveur) | `next: { revalidate: 86400 }` |
| RUMEUR temps réel | `180` (3min) | SSE push | Proxy + SSE |
| Événements Paris | `3600` (1h) | `3600000` ms | SWR + revalidate |
| Résultats geocoding | `86400` (24h) | N/A | Cache HTTP long |
| Chantiers RATP/IDFM | `3600` (1h) | N/A (carte statique) | `revalidateTag('chantiers')` |

**Implémentation SWR côté client (données événements) :**
```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useEvenementsParisMap() {
  const { data, error, isLoading } = useSWR(
    '/api/evenements-paris',
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000, // Refresh toutes les heures
      revalidateOnFocus: false,          // Éviter refresh inutile au focus
      dedupingInterval: 30 * 60 * 1000, // Déduplique les requêtes < 30 min
    }
  );

  return { evenements: data?.features ?? [], error, isLoading };
}
```

_Source : [Next.js Caching Guide](https://nextjs.org/docs/app/guides/caching) · [SWR — Stale While Revalidate](https://peerlist.io/jagss/articles/understanding-react-swr-how-it-works-and-why-its-awesome) · [Next.js 15.4 Cache Guide](https://medium.com/@riccardo.carretta/nextjs-15-4-cache-revalidation-guide-client-server-side-7f3fe8fe6b3f)_

---

### Intégration Bruitparif RUMEUR — État et stratégie d'accès

**Situation actuelle :**
- La plateforme RUMEUR (`rumeur.bruitparif.fr`) est accessible publiquement pour la consultation
- **Aucune documentation d'API publique REST identifiée** lors de la recherche web
- Bruitparif a mis en place la plateforme pour "accès aux indicateurs acoustiques clés" mais l'API n'est pas documentée publiquement
- Certaines données RUMEUR sont disponibles via le widget embarquable (JavaScript embed)
- Data.gouv.fr contient des **exports statiques** des données Bruitparif (format GeoJSON, Shapefile)

**Stratégie d'intégration (4 niveaux) :**

| Niveau | Approche | Données disponibles | Effort | Délai |
|--------|----------|-------------------|--------|-------|
| **N1 — Immédiat** | Data.gouv.fr exports statiques | PPBE scores IRIS, cartes stratégiques | Faible | Sprint V2 |
| **N2 — Court terme** | Open Data Paris datasets Bruitparif | Données publiques publiées (~annuelles) | Faible | Sprint V2 |
| **N3 — Partenariat** | Convention accès API RUMEUR | Temps réel 1s/3min, historique | Moyen | 3–6 mois |
| **N4 — B2B licence** | Licence data commerciale | Full data, SLA garanti | Élevé | 6–12 mois |

**Action immédiate :** Créer issue Linear `TAC-28: Contacter Bruitparif — accès API RUMEUR temps réel` (priorité haute, pre-condition TAC-17).

**Fallback si API indisponible V2 :** Scraping défensif du widget RUMEUR embarqué via Playwright (headless) côté serveur en cron job Vercel — risqué à long terme mais faisable à court terme pour proof-of-concept.

_Source : [Bruitparif RUMEUR plateforme](https://rumeur.bruitparif.fr/) · [Bruitparif data.gouv.fr](https://www.data.gouv.fr/datasets/bruit-routier-exposition-des-parisien-ne-s-aux-depassements-des-seuils-nocturne-ou-journee-complete) · [Bruitparif La Plateforme](https://www.bruitparif.fr/la-plateforme-rumeur1/)_

---

### Sécurité des API Keys — Synthèse Pattern Tacet

**Règle absolue :**

| Variable | Préfixe | Exposé client | Usage |
|----------|---------|---------------|-------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `NEXT_PUBLIC_` | ✅ Oui (nécessaire MapLibre) | Token public Mapbox avec restrictions URL |
| `MAPBOX_SECRET_TOKEN` | Aucun | ❌ Non | Uploads, Tiling Service, Analytics |
| `BRUITPARIF_API_KEY` | Aucun | ❌ Non | Proxy Route Handler uniquement |
| `OPENDATAPARIS_TOKEN` | Aucun | ❌ Non | Route Handler API proxy |

**Restrictions token Mapbox public :** Configurer dans dashboard Mapbox → Token Settings → `Allowed URLs` : `https://tacet-app.vercel.app` + `http://localhost:*`. Empêche l'utilisation du token depuis d'autres domaines.

**Vercel Environment Variables :**
```bash
# Production only (Vercel Dashboard)
BRUITPARIF_API_KEY="..."       # ← Environment: Production

# All environments
NEXT_PUBLIC_MAPBOX_TOKEN="pk..." # ← Environment: All
```

_Source : [Next.js API Key Security Best Practices](https://nextnative.dev/blog/api-key-secure) · [Route Handlers — Next.js Docs](https://nextjs.org/docs/app/getting-started/route-handlers)_

---

### Technology Adoption — Trends intégration 2025

**SSE Renaissance :**
- GitHub code search : +340% d'usage SSE en Next.js projects (2023→2025)
- Article portalZINE : "2025 is the Year of Server-Sent Events" — simplicité vs WebSocket complexity
- Claude, ChatGPT, Vercel v0 : tous utilisent SSE pour streaming AI responses → pattern bien établi, documenté

**API Proxy Pattern :** Standard industrie pour Next.js + serverless — documenté officiellement dans Next.js docs (API Reference > proxy.js)

**Open Data Paris Explore API v2.1 :** Stable, utilisé par de nombreuses apps parisiennes (Vélib', AirParis, etc.). Format JSON/GeoJSON robuste.

**Photon Geocoder :** Utilisé en production par Komoot (application outdoor 20M utilisateurs) — preuve de fiabilité à grande échelle avec données OSM France.

_Confiance globale Step 3 : Haute (sources officielles + documentation + études de cas production)_

---

## Architectural Patterns and Design

### Architecture globale Tacet — Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TACET APP ARCHITECTURE (V2 cible)                 │
├──────────────┬──────────────────────────────┬───────────────────────┤
│  NAVIGATEUR  │       VERCEL EDGE            │   SERVICES EXTERNES   │
│              │                              │                        │
│  PWA Shell   │  Next.js App Router          │  Bruitparif RUMEUR     │
│  (Serwist SW)│  ├── Server Components       │  Open Data Paris       │
│              │  │   (data fetching)         │  Photon Geocoding      │
│  MapLibre GL │  ├── Route Handlers          │  Vercel Blob (PMTiles) │
│  (Client)    │  │   (SSE · Proxy API)       │                        │
│              │  └── Static Assets           │                        │
│  SWR / hooks │       (PMTiles · icons)      │                        │
└──────────────┴──────────────────────────────┴───────────────────────┘
```

**Principe directeur :** Maximum Server, Minimum Client
- Server Components pour toute la data-fetching et logique métier
- Client Components uniquement pour la carte (MapLibre) et les interactions utilisateur
- Service Worker (Serwist) pour PWA offline, indépendant de l'App Router

---

### System Architecture Patterns — Server/Client Components pour carte

**La contrainte fondamentale des cartes dans Next.js App Router :**

MapLibre GL (comme Mapbox GL) requiert le DOM (`window`, `document`) → doit être un **Client Component**. Mais toute la logique de data-fetching et les transformations GeoJSON peuvent rester en Server Component.

**Pattern optimal "Map Shell" :**

```typescript
// app/page.tsx — Server Component (défaut)
import { MapShell } from '@/components/map/MapShell';
import { getIrisData } from '@/lib/data/iris';
import { getNoiseScores } from '@/lib/data/bruitparif';

export default async function HomePage() {
  // Data fetching côté serveur — pas de bundle JS client
  const [irisGeoJSON, noiseScores] = await Promise.all([
    getIrisData(),        // Statique (build time) ou ISR 24h
    getNoiseScores(),     // Revalidate 24h (scores PPBE)
  ]);

  return (
    <main>
      {/* Client Component isolé — seule partie qui hydrate */}
      <MapShell
        initialIrisData={irisGeoJSON}
        initialScores={noiseScores}
      />
    </main>
  );
}
```

```typescript
// components/map/MapShell.tsx — Client Component (carte + interactions)
'use client';

import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useRumeurStream } from '@/hooks/useRumeurStream';

interface MapShellProps {
  initialIrisData: GeoJSON.FeatureCollection;
  initialScores: NoiseScoreMap;
}

export function MapShell({ initialIrisData, initialScores }: MapShellProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  // SSE pour données temps réel — uniquement dans Client Component
  const { realtimeData } = useRumeurStream();

  // ... implémentation carte
}
```

**Avantages du pattern "Map Shell" :**
- Server Components fetch data sans JS côté client → **bundle size réduit**
- Data initiale passée en props → **pas de waterfall côté client**
- Client Component isolé → **hydratation minimale**
- Compatible PWA Service Worker (statique shell)

_Source : [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) · [Next.js 15 App Router Complete Guide](https://dev.to/devjordan/nextjs-15-app-router-complete-guide-to-server-and-client-components-5h6k)_

---

### PWA Architecture — Serwist (Workbox fork pour Next.js)

**État de l'écosystème PWA Next.js 2024-2025 :**

| Package | Status | App Router | Recommandation |
|---------|--------|------------|----------------|
| `next-pwa` (shadowwalker) | ❌ **Abandonné** — plus de mises à jour | ❌ Incompatible App Router | À éviter |
| `@ducanh2912/next-pwa` | 🟡 Fork maintenu, plus actif | ✅ Compatible | Acceptable court terme |
| `@serwist/next` | ✅ **Recommandé** — fork de Workbox actif | ✅ Native App Router | **Recommandé V2** |
| Service Worker manuel | ✅ Contrôle total | ✅ Compatible | Avancé, effort élevé |

**Serwist — Intégration Next.js App Router :**

```typescript
// next.config.ts (avec Serwist)
import withSerwist from '@serwist/next';

const withSerwistConfig = withSerwist({
  swSrc: 'app/sw.ts',          // Service Worker source
  swDest: 'public/sw.js',      // Output
  reloadOnOnline: true,        // Reload page quand connexion rétablie
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwistConfig({
  // ... next config standard
});
```

```typescript
// app/sw.ts — Service Worker avec stratégies de cache
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // App Shell (pages navigations) — Network First avec fallback offline
    {
      matcher: /^\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
      },
    },
    // Tiles MapLibre — Cache First (tiles statiques)
    {
      matcher: /\.pmtiles$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 86400 },
      },
    },
    // API Route Handlers — Network First
    {
      matcher: /^\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
      },
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
```

**Manifest PWA (`app/manifest.ts`) :**
```typescript
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tacet — Carte Sonore de Paris',
    short_name: 'Tacet',
    description: 'Découvrez la carte des niveaux sonores de Paris par quartier',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',   // Cohérent avec dark mode Tailwind
    theme_color: '#6366f1',        // Indigo Tacet
    orientation: 'portrait-primary',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      { src: '/screenshots/map-mobile.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow' },
    ],
  };
}
```

**Cibles Lighthouse pour Tacet PWA :**

| Catégorie | Cible V1 actuelle | Cible V2 avec PWA |
|-----------|-------------------|-------------------|
| Performance | 70–80 (carte = coûteuse) | **85+** |
| Accessibilité | 80 | **95+** |
| Best Practices | 85 | **95+** |
| SEO | 90 | **95+** |
| PWA | ❌ Non applicable | ✅ **Installable** |

**Principaux vecteurs d'amélioration Performance Tacet :**
- MapLibre `dynamic import` avec `ssr: false` (déjà fait V1)
- PMTiles : réduit les requêtes tuiles individuelles → moins de round-trips
- `next/image` pour toutes les images statiques
- Font next/font pour éliminer FOUT (Flash Of Unstyled Text)
- `loading="lazy"` pour les composants hors-viewport

_Source : [Serwist Next.js](https://javascript.plainenglish.io/building-a-progressive-web-app-pwa-in-next-js-with-serwist-next-pwa-successor-94e05cb418d7) · [Next.js PWA Guide officiel](https://nextjs.org/docs/app/guides/progressive-web-apps) · [Offline-First Next.js 15 Discussion](https://github.com/vercel/next.js/discussions/82498) · [Lighthouse 95+ Next.js 15](https://medium.com/@sureshdotariya/achieving-95-lighthouse-scores-in-next-js-15-modern-web-application-part1-e2183ba25fc1)_

---

### GeoJSON Pipeline Architecture — De la source aux tuiles

**Pipeline complet données IRIS Tacet :**

```
Source (Bruitparif PPBE exports)
    │
    ▼
Nettoyage + enrichissement (scripts Node.js)
    ├── Join IRIS geometry (GeoAdmin IGN) + Scores bruit (Bruitparif CSV)
    ├── Calcul Score Sérénité V2 (formule pondérée: route 40% + rail 30% + air 30%)
    └── Ajout metadata: population_iris, surface_m2, categorie_bruit
    │
    ▼
Double export :
    ├── paris-noise-iris.geojson  → Référence locale dev/analyse
    └── iris-paris.pmtiles        → Production (via Tippecanoe)
    │
    ▼
Déploiement :
    ├── Vercel Blob Storage        → PMTiles servi via CDN Vercel Edge
    └── /public/iris-paris.geojson → Fallback dev local (non prod)
```

**Commande Tippecanoe recommandée pour 992 IRIS :**
```bash
tippecanoe \
  --output=iris-paris.pmtiles \
  --layer=iris \
  --attribution="Bruitparif · IGN · ODbL" \
  --simplification=4 \
  --simplify-only-low-zooms \
  --maximum-zoom=16 \
  --minimum-zoom=10 \
  --no-tile-size-limit \
  --coalesce-smallest-as-needed \
  paris-noise-iris.geojson
```

**Comparaison taille estimée pour 992 IRIS Paris :**

| Format | Taille brute | Après gzip | Requêtes réseau |
|--------|-------------|------------|-----------------|
| GeoJSON complet | ~3,8 Mo | ~800 Ko | 1 requête |
| GeoJSON simplifié | ~1,2 Mo | ~280 Ko | 1 requête |
| PMTiles (z10–z16) | ~600 Ko total | HTTP range | N requêtes partielle |
| PMTiles (z10–z14) | ~250 Ko total | HTTP range | N requêtes partielle |

**Stratégie recommandée V2 :**
- Zoom ≤ 11 : vue arrondissement (simplification forte)
- Zoom 12–14 : vue quartier (simplification modérée)
- Zoom ≥ 15 : vue rue/îlot (géométrie complète)

MapLibre charge automatiquement la bonne résolution selon le zoom actuel → **User experience fluide sans surcharge réseau**.

_Source : [PMTiles Architecture — Protomaps](https://docs.protomaps.com/pmtiles/) · [Heavy Map Visualizations Fundamentals](https://advena.hashnode.dev/heavy-map-visualizations-fundamentals-for-web-developers) · [MapLibre Offline Discussion](https://github.com/maplibre/maplibre-gl-js/discussions/1389)_

---

### Scalability and Performance Patterns

**Stratégie ISR (Incremental Static Regeneration) pour données semi-statiques :**

Next.js App Router ISR permet de régénérer des pages statiques en arrière-plan **sans redéploiement**. Idéal pour les scores Bruitparif mis à jour annuellement ou les chantiers RATP mis à jour hebdomadairement.

```typescript
// app/api/noise-scores/route.ts
export const revalidate = 86400; // ISR 24h — se régénère automatiquement

export async function GET() {
  const scores = await fetchBruitparifPPBE(); // Upstream source

  return Response.json(scores, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
```

**Stratégie de déploiement Vercel pour Tacet :**

| Ressource | Hébergement | Stratégie | TTL |
|-----------|-------------|-----------|-----|
| App Shell (HTML/JS/CSS) | Vercel Edge CDN | Build-time statique | Indéfini (hash URL) |
| PMTiles IRIS | Vercel Blob (Edge) | Static, mise à jour manuelle | 30 jours |
| API Proxy SSE | Vercel Serverless Functions | Dynamic | N/A |
| Route Handlers (proxy) | Vercel Serverless | ISR (revalidate) | Variable |
| Scores PPBE JSON | Vercel Data Cache | ISR 24h | 24h |

**Performance cibles V2 :**

| Métrique | V1 actuelle (estimée) | V2 cible |
|----------|-----------------------|----------|
| First Contentful Paint (FCP) | ~2.5s | **< 1.5s** |
| Time to Interactive (TTI) | ~5s (carte) | **< 3s** |
| Largest Contentful Paint (LCP) | ~3s | **< 2.5s** |
| Total Bundle Size (JS) | ~450 Ko | **< 300 Ko** (PMTiles + MapLibre tree-shaking) |
| Map tiles first render | ~1.8s (GeoJSON parse) | **< 0.8s** (PMTiles range request) |

_Source : [ISR Next.js Docs](https://nextjs.org/docs/pages/guides/incremental-static-regeneration) · [ISR with App Router](https://ryanschiang.com/how-to-use-incremental-static-regeneration-isr-with-nextjs-14-app-router)_

---

### Offline Architecture — Service Worker Strategy pour carte

**Limitation des cartes offline en PWA web :**

La mise en cache offline complète d'une carte tuile-par-tuile est **non viable** sur le web :
- Storage API navigateur : limité à 5–10% de l'espace disque (iOS Safari le plus restrictif)
- 992 IRIS Paris × plusieurs zooms = centaines de Mo de tiles
- Solution : **cache partiel stratégique** (zone visualisée + zoom consulté)

**Stratégie offline pragmatique pour Tacet :**

```
Offline Mode Tacet (hiérarchie dégradation gracieuse) :

Niveau 1 — App Shell (toujours offline)
  ✅ Interface UI (HTML/CSS/JS)
  ✅ Navigation (AppNav)
  ✅ Écran "Hors connexion" avec dernier état carte

Niveau 2 — Données cachées lors de dernière session (offline)
  ✅ Tuiles PMTiles consultées récemment (CacheFirst, 30 jours)
  ✅ Scores IRIS de la zone visualisée (CacheFirst, 24h)
  ✅ Résultats de recherche récents (geocoding)
  ❌ Données temps réel RUMEUR (requiert connexion)

Niveau 3 — Données temps réel (online uniquement)
  ❌ SSE RUMEUR stream → dégradation gracieuse : affiche "données en direct indisponibles"
```

**Implémentation pattern "App Shell + Data Layer" :**

```typescript
// app/~offline/page.tsx — Page offline Serwist
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1>Tacet — Mode hors connexion</h1>
      <p>La carte s&apos;affichera avec les données de votre dernière visite.</p>
      <p className="text-sm text-gray-500">
        Les données temps réel ne sont pas disponibles sans connexion.
      </p>
    </div>
  );
}
```

**Install Prompt (PWA installation) :**
```typescript
// hooks/usePWAInstall.ts
'use client';
import { useEffect, useState } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome; // 'accepted' | 'dismissed'
  };

  return { canInstall: !!deferredPrompt, install };
}
```

**Déclenchement du prompt install :** À recommander après 2 sessions + 5 consultations de quartiers (engagement prouvé) — pattern "deferred install" favorisé par Google UX guidelines.

_Source : [PWA Maps offline strategy](https://github.com/reyemtm/pwa-maps) · [MapLibre offline discussion](https://github.com/maplibre/maplibre-gl-js/discussions/1389) · [Offline PWA Next.js](https://adropincalm.com/blog/nextjs-offline-service-worker/)_

---

### Security Architecture Patterns

**Complète la section Integration Patterns Step 3 :**

**Content Security Policy (CSP) pour Tacet + MapLibre :**
```typescript
// next.config.ts — headers sécurité
const headers = [
  {
    source: '/(.*)',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' blob:", // 'unsafe-eval' requis MapLibre WebGL
          "worker-src blob:",                       // Web Workers MapLibre
          "img-src 'self' data: blob: https://*.mapbox.com https://api.maptiler.com",
          "connect-src 'self' https://*.mapbox.com https://rumeur.bruitparif.fr https://photon.komoot.io",
          "style-src 'self' 'unsafe-inline'",       // MapLibre inject styles
        ].join('; '),
      },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  },
];
```

⚠️ **Note importante :** MapLibre GL JS requiert `'unsafe-eval'` pour WebGL shader compilation — limitation connue, documentée dans l'écosystème. Pas de contournement complet possible avec CSP strict.

_Source : [Next.js Security Headers](https://nextjs.org/docs/app/guides/progressive-web-apps) · [MapLibre CSP requirements](https://github.com/maplibre/maplibre-gl-js/discussions)_

---

### Deployment Architecture — Vercel Plan Strategy

**Plan actuel Hobby (gratuit) — Limites clés :**

| Ressource | Hobby Limit | Tacet V2 besoins | Risque |
|-----------|-------------|-----------------|--------|
| Bandwidth | 100 GB/mois | ~10–15 GB/mois (PMTiles CDN) | 🟢 OK |
| Serverless Functions | 100 GB-hours/mois | Faible (proxy léger) | 🟢 OK |
| Edge Middleware invocations | 1M/mois | Très faible | 🟢 OK |
| Blob Storage | 500 MB | ~30 MB PMTiles | 🟢 OK |
| SSE duration | Limité (10s Hobby?) | ⚠️ SSE 3min refresh | 🟡 À vérifier |
| KV Storage | Payant séparé | Non requis V2 | 🟢 OK |

**Concernant SSE sur Vercel Hobby :**
- Les fonctions serverless Vercel Hobby ont une limite de durée de **10 secondes par invocation**
- Pour SSE avec refresh 3min : il faut utiliser le **streaming** + reconnexion automatique côté client
- Alternative : pattern de **polling court côté client** (30s) vers un Route Handler cached — plus simple et compatible Hobby

**Recommandation architecture SSE-compatible Hobby :**
```
Option A (Polling léger, compatible Hobby) :
  Client → GET /api/rumeur [toutes les 3min] ← Cached 3min Vercel Data Cache
  Pro : Simple, compatible Hobby plan
  Con : Pas de push réel, toujours 3min de délai

Option B (SSE long, nécessite Pro ou Edge Runtime) :
  Client ← SSE stream /api/rumeur-stream [connexion persistante]
  Pro : Push réel, reconnexion automatique
  Con : Vercel Pro (~$20/mois) ou Edge Runtime (pas de Node.js APIs)

→ Recommandation V2 : Option A (polling) · Option B : V3 avec upgrade Pro si données temps réel critiques
```

_Source : [Vercel Pricing](https://vercel.com/pricing) · [Vercel Hobby limits](https://vercel.com/docs/limits/overview) · [Building APIs with Next.js](https://nextjs.org/blog/building-apis-with-nextjs)_

---

### Data Architecture Patterns

**Architecture données Tacet — 3 couches :**

```
Couche 1 — RÉFÉRENTIEL (statique · build-time)
  iris-paris.pmtiles            → 992 IRIS géométries Paris
  noise-categories.ts           → Formules Score Sérénité, tranches dB
  paris-noise-iris.geojson      → Source vérité locale (dev)

Couche 2 — INDICATEURS (semi-statique · ISR 24h)
  /api/noise-scores             → Scores PPBE par IRIS code
  /api/chantiers                → Chantiers RATP/IDFM actifs
  /api/evenements-paris         → Événements (marché, concert, etc.)

Couche 3 — TEMPS RÉEL (dynamique · polling 3min V2)
  /api/rumeur                   → Niveaux dB capteurs RUMEUR (quand API dispo)
  /api/rumeur-stream            → SSE (V3 avec Vercel Pro)
```

**Type système TypeScript pour données sonores :**
```typescript
// types/noise.ts — Types partagés server + client
export interface IRISNoiseFeature extends GeoJSON.Feature {
  properties: {
    code_iris: string;          // Ex: "751010101"
    nom_iris: string;           // Ex: "Opéra"
    code_arr: string;           // Ex: "75101"
    score_serenite: number;     // 0–100 (100 = calme)
    db_jour: number;            // Lden dB(A)
    db_nuit: number;            // Ln dB(A)
    sources: NoiseSources;      // route | rail | air
    annee_millésime: number;    // 2022 | 2024 ...
    population_iris?: number;
  };
}

export interface RumeurSensorData {
  station_id: string;
  timestamp: string;            // ISO 8601
  db_instantane: number;        // dB(A) instantané
  db_leq_1min: number;         // Leq 1 minute glissante
  latitude: number;
  longitude: number;
  statut: 'actif' | 'maintenance' | 'offline';
}
```

_Source : [ISR Next.js Docs](https://nextjs.org/docs/pages/guides/incremental-static-regeneration) · [Next.js Architecture](https://nextjs.org/docs/architecture)_

_Confiance globale Step 4 : Haute (documentation officielle Next.js + Serwist + études de cas PWA production)_

---

## Implementation Approaches and Technology Adoption

### Technology Adoption Strategies — Migration Mapbox → MapLibre

**Stratégie de migration recommandée : Progressive Adoption (Strangler Fig pattern)**

La migration Mapbox GL JS → MapLibre GL JS est une migration **à faible risque** car les APIs sont quasi-identiques (MapLibre est un fork direct). Elle ne nécessite pas de réécriture du code applicatif, seulement un swap de dépendance et une reconfiguration du token.

**Plan de migration V2 en 4 étapes :**

| Étape | Action | Effort | Risque | Durée estimée |
|-------|--------|--------|--------|---------------|
| **M1** | `npm uninstall mapbox-gl` → `npm install maplibre-gl` | Faible | Faible | 1h |
| **M2** | Update imports + supprimer `accessToken` Mapbox | Faible | Faible | 2h |
| **M3** | Configurer PMTiles protocol + style MapLibre | Moyen | Moyen | 4h |
| **M4** | Tests E2E carte + vérification visuelle | Moyen | Faible | 4h |

```bash
# Migration M1 — swap de dépendance
npm uninstall mapbox-gl @types/mapbox-gl
npm install maplibre-gl

# react-map-gl v8 supporte les deux — pas de changement requis
# (react-map-gl détecte automatiquement maplibre-gl si mapbox-gl absent)
```

```typescript
// Avant (Mapbox)
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Après (MapLibre) — M2
import maplibregl from 'maplibre-gl';
// Plus de token requis pour les tiles locaux/PMTiles
```

**Critères GO/NO-GO pour migration V2 :**
- ✅ GO si : bundle MapLibre < bundle Mapbox (économie ~30 Ko), performances visuelles identiques sur 992 IRIS
- ✅ GO si : PMTiles génération validée avec Tippecanoe (test sur 50 IRIS sample)
- 🔴 NO-GO si : fonctionnalité Mapbox Geocoding v6 non remplaçable (Photon) avant migration

_Source : [MapLibre GL JS migration guide](https://maplibre.org/maplibre-gl-js/docs/migrations/from-mapbox-gl-js-to-maplibre-gl-js/) · [react-map-gl v8 MapLibre support](https://visgl.github.io/react-map-gl/docs/get-started)_

---

### Development Workflows and Tooling

**Stack de développement Tacet — Outils recommandés V2 :**

```
Code Quality :
  ESLint + @typescript-eslint/recommended
  Prettier (format on save)
  Husky + lint-staged (pre-commit hooks)
  TypeScript strict mode

Testing :
  Vitest (unit + composants)
  Playwright (E2E + géospatial)
  @testing-library/react (rendu composants)

CI/CD :
  GitHub Actions (CI : lint + test + build)
  Vercel (CD : preview PR + production)
  Lighthouse CI (performance regression guard)

Monitoring :
  Vercel Analytics (Web Vitals + RUM)
  Umami (analytics vie privée - TAC-27)
  Sentry (error tracking - V3)
```

**Configuration Husky + lint-staged :**
```bash
npm install --save-dev husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

_Source : [Next.js Testing Guides](https://nextjs.org/docs/app/guides/testing) · [Vitest Next.js Setup](https://nextjs.org/docs/app/guides/testing/vitest)_

---

### Testing and Quality Assurance — Stratégie pyramidale

**Pyramide de tests Tacet :**

```
         /\
        /E2E\         Playwright — Tests carte, navigation, flux utilisateur
       /______\
      / Intég. \      Vitest + MSW — Tests composants avec données mockées
     /___________\
    /    Unitaire  \  Vitest — Fonctions pures : formules Score Sérénité, utils GeoJSON
   /________________\
```

**Niveau 1 — Tests unitaires (Vitest) :**
```typescript
// __tests__/lib/noise-score.test.ts
import { describe, it, expect } from 'vitest';
import { computeSereniteScore, categorizeBruitLevel } from '@/lib/noise-score';

describe('computeSereniteScore', () => {
  it('retourne 100 pour absence totale de bruit', () => {
    expect(computeSereniteScore({ route: 0, rail: 0, air: 0 })).toBe(100);
  });

  it('pénalise davantage le bruit routier (pondération 40%)', () => {
    const scoreRoute = computeSereniteScore({ route: 70, rail: 0, air: 0 });
    const scoreRail = computeSereniteScore({ route: 0, rail: 70, air: 0 });
    expect(scoreRoute).toBeLessThan(scoreRail);
  });

  it('classe correctement les seuils OMS', () => {
    expect(categorizeBruitLevel(45)).toBe('calme');
    expect(categorizeBruitLevel(60)).toBe('modéré');
    expect(categorizeBruitLevel(75)).toBe('élevé');
  });
});
```

**Niveau 2 — Tests d'intégration composants (Vitest + @testing-library/react) :**
```typescript
// __tests__/components/IRISPopup.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { IRISPopup } from '@/components/map/IRISPopup';

const mockIRIS = {
  code_iris: '751010101',
  nom_iris: 'Opéra',
  score_serenite: 42,
  db_jour: 68,
  db_nuit: 62,
};

describe('IRISPopup', () => {
  it('affiche le nom du quartier', () => {
    render(<IRISPopup iris={mockIRIS} />);
    expect(screen.getByText('Opéra')).toBeInTheDocument();
  });

  it('affiche le score avec la bonne couleur (rouge si <50)', () => {
    render(<IRISPopup iris={mockIRIS} />);
    const badge = screen.getByTestId('score-badge');
    expect(badge).toHaveClass('text-red-500'); // score 42 → rouge
  });
});
```

⚠️ **Limitation Vitest + Server Components :** Les async Server Components ne sont pas testables avec Vitest (limitation React ecosystem en 2025). Pour ceux-ci → tests Playwright E2E.

**Niveau 3 — Tests E2E géospatiaux (Playwright) :**
```typescript
// e2e/map-interaction.spec.ts
import { test, expect } from '@playwright/test';

test('affiche la carte de Paris au démarrage', async ({ page }) => {
  await page.goto('/');

  // Attendre que MapLibre soit chargé
  await page.waitForSelector('.maplibregl-canvas', { timeout: 10000 });

  // Vérifier que le canvas WebGL est rendu
  const canvas = page.locator('.maplibregl-canvas');
  await expect(canvas).toBeVisible();
});

test('clique sur un quartier et affiche le popup IRIS', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.maplibregl-canvas', { timeout: 10000 });

  // Cliquer au centre de Paris (coordonnées écran approximatives)
  const canvas = page.locator('.maplibregl-canvas');
  const box = await canvas.boundingBox();
  if (box) {
    await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
  }

  // Le popup IRISPopup doit apparaître
  await expect(page.locator('[data-testid="iris-popup"]')).toBeVisible({ timeout: 5000 });
});

test('la recherche adresse centre la carte', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.maplibregl-canvas');

  const searchInput = page.locator('[data-testid="search-input"]');
  await searchInput.fill('Opéra, Paris');
  await page.locator('[data-testid="search-suggestion"]').first().click();

  // Vérifier que le centre de carte a bougé (URL hash ou data attribute)
  await expect(page.locator('[data-testid="map-center"]'))
    .toHaveAttribute('data-lat', /48\.87/);
});
```

**Configuration Playwright (`playwright.config.ts`) :**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } }, // Test mobile PWA
  ],
  webServer: {
    command: 'npm run build && npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

_Source : [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing) · [Vitest Next.js 15 Setup](https://www.wisp.blog/blog/setting-up-vitest-for-nextjs-15) · [Playwright + Next.js](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright)_

---

### Deployment and Operations Practices — CI/CD Pipeline

**GitHub Actions Workflow complet pour Tacet :**

```yaml
# .github/workflows/ci.yml
name: CI / CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Lint + Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check   # tsc --noEmit

  test:
    name: Unit Tests (Vitest)
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run test -- --run --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci && npm run build
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: '.lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true

  # Vercel deploy (CD) géré automatiquement via Vercel GitHub integration
  # Preview deployments sur chaque PR, production sur merge main
```

**Configuration Lighthouse CI (`.lighthouserc.json`) :**
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/barometre"],
      "startServerCommand": "npm start",
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.75 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "categories:best-practices": ["warn", { "minScore": 0.90 }],
        "categories:seo": ["warn", { "minScore": 0.90 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "interactive": ["warn", { "maxNumericValue": 4000 }],
        "total-blocking-time": ["error", { "maxNumericValue": 500 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Stratégie branching :**
```
main          → Production Vercel (auto-deploy)
  └─ feat/*   → Preview Vercel (URL unique par PR)
  └─ fix/*    → Preview Vercel
  └─ chore/*  → Preview Vercel
```

_Source : [Lighthouse CI GitHub Action](https://github.com/treosh/lighthouse-ci-action) · [Next.js Lighthouse CI](https://dev.to/joerismits/ensure-your-nextjs-apps-performance-is-top-notch-with-lighthouse-ci-and-github-actions-4ne8) · [Lighthouse CI GoogleChrome](https://github.com/GoogleChrome/lighthouse-ci)_

---

### Team Organization and Skills — Contexte Solo Developer

**Contexte Tacet :** Projet solo (Ivan) avec support Claude Code. Les recommandations sont adaptées pour un développeur unique.

**Compétences actuelles identifiées :**
- ✅ Next.js App Router (confirmé par codebase V1)
- ✅ TypeScript (strict mode)
- ✅ Mapbox GL (V1 déjà livré)
- ✅ Tailwind CSS
- ✅ Linear / BMAD workflow
- ✅ Vercel deployment

**Compétences à acquérir pour V2 :**

| Compétence | Effort | Priorité | Ressource |
|------------|--------|----------|-----------|
| MapLibre GL JS | Faible (API identique Mapbox) | 🔴 Haute | [MapLibre migration guide](https://maplibre.org/maplibre-gl-js/docs/migrations/) |
| PMTiles + Tippecanoe | Moyen | 🔴 Haute | [Protomaps docs](https://docs.protomaps.com) |
| Serwist PWA | Moyen | 🟡 Moyenne | [Serwist docs](https://serwist.pages.dev) |
| Vitest + Playwright | Moyen | 🟡 Moyenne | [Next.js Testing](https://nextjs.org/docs/app/guides/testing) |
| Turf.js (analyse spatiale) | Faible | 🟢 Basse V2 / Haute V3 | [Turf.js docs](https://turfjs.org) |

**Note sur Turf.js :** Bibliothèque d'analyse géospatiale client-side (MIT, modulaire). Cas d'usage Tacet V3 :
- `@turf/point-in-polygon` → déterminer l'IRIS au clic (évite le calcul serveur)
- `@turf/buffer` → zone tampon autour d'un point pour filtrer les capteurs RUMEUR proches
- `@turf/bbox` → calculer l'emprise d'une sélection multi-IRIS
- **Import modulaire critique** : `import pointInPolygon from '@turf/point-in-polygon'` (évite l'import du bundle complet ~800 Ko)

_Source : [Turf.js modular imports](https://turfjs.org/docs/api/turf-turf) · [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)_

---

### Cost Optimization and Resource Management

**Analyse coûts Tacet V2 — Horizon 12 mois :**

| Poste | V1 actuel | V2 (MapLibre + PMTiles) | Économie |
|-------|-----------|------------------------|---------|
| Mapbox Map Loads | $0 (< 50k/mois) → ⚠️ $5/1000 au-delà | **$0** (MapLibre + PMTiles) | Jusqu'à $1250/mois si 200k users |
| Mapbox Geocoding | $0 (< 100k/mois) | **$0** (Photon Komoot) | $0.75/1000 req économisé |
| Vercel Hosting | $0 (Hobby) | $0 (Hobby) | — |
| Vercel Blob | N/A | ~$0 (< 500 MB gratuit) | — |
| Domaine | ~$15/an | ~$15/an | — |
| **Total mensuel** | **$0** (sous seuils) | **$0** (sans seuils) | **$0 + élimination risque** |

**Élimination du risque coût Mapbox :** La migration MapLibre + PMTiles transforme un **coût variable non-linéaire** (qui peut exploser avec la croissance) en **coût fixe zéro** sur infrastructure CDN Vercel incluse.

**Budget technique recommandé V2 :**
- Vercel Pro (si SSE requis) : $20/mois → décision à prendre lors de TAC-17 implémentation
- Domaine tacet.app (si disponible) : ~$15/an
- Sentry Error Tracking (V3) : plan gratuit → $26/mois si volumétrie justifie

_Source : [Vercel Pricing](https://vercel.com/pricing) · [Mapbox Pricing](https://www.mapbox.com/pricing)_

---

### Risk Assessment and Mitigation

**Registre des risques techniques Tacet V2 :**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| API Bruitparif RUMEUR inaccessible | 🟡 Moyenne | 🔴 Élevé (TAC-17) | Fallback data.gouv.fr statique · Démarche partenariat en parallèle |
| PMTiles incompatibilité navigateur ancien | 🟢 Faible | 🟡 Moyen | HTTP range requests supporté >95% browsers · Fallback GeoJSON |
| Vercel Hobby SSE timeout 10s | 🟡 Moyenne | 🟡 Moyen | Option A (polling 3min) en V2 · SSE en V3 avec Pro |
| MapLibre régression visuelle | 🟢 Faible | 🟡 Moyen | Tests Playwright visuels avant migration |
| Serwist PWA iOS Safari cache | 🟡 Moyenne | 🟡 Moyen | Tests Playwright sur Webkit · Dégradation gracieuse |
| Bruitparif changement format données | 🟢 Faible | 🟡 Moyen | Versionnage des imports + types TypeScript stricts |

**Priorité des risques :**
1. 🔴 **TAC-28** (Bruitparif API) — blocker TAC-17
2. 🟡 **Vercel SSE** — conditionne l'architecture temps réel V3
3. 🟡 **iOS Safari PWA** — critique pour B2C mobile

---

### Technical Research Recommendations

#### Implementation Roadmap V2 — Sprints suggérés

**Sprint V2.1 — Fondations (4 semaines) :**
- TAC-28 : Contacter Bruitparif → accès API RUMEUR
- Migration MapLibre GL JS (M1→M4)
- Setup Vitest + Playwright + Lighthouse CI
- PMTiles pipeline : génération + déploiement Vercel Blob

**Sprint V2.2 — PWA + Tests (3 semaines) :**
- Serwist PWA : manifest, Service Worker, offline shell
- Tests unitaires couverture Score Sérénité + IRISPopup
- Tests E2E carte + Playwright
- Lighthouse CI budgets intégrés dans PR checks

**Sprint V2.3 — Données semi-réelles (4 semaines) :**
- Intégration polling Bruitparif (data.gouv.fr si API non dispo)
- Route Handler proxy + cache revalidation
- Événements Open Data Paris (chantiers RATP)
- SWR hooks événements + UI layer

#### Technology Stack Recommendations — Verdict final V2

| Composant | V1 actuel | V2 recommandé | Justification |
|-----------|-----------|---------------|---------------|
| Carte | Mapbox GL JS 3.18 | **MapLibre GL JS** | MIT · $0 · react-map-gl v8 natif |
| Tiles | Raster Mapbox | **PMTiles (Protomaps)** | Gratuit · CDN Vercel · 70% plus léger |
| Geocoding | Mapbox Geocoding v6 | **Photon (Komoot)** | Gratuit · sans clé · OSM France |
| PWA | ❌ Non | **Serwist** | Seul package compatible App Router 2025 |
| Tests unit | ❌ Non | **Vitest** | Next.js recommandé · rapide |
| Tests E2E | ❌ Non | **Playwright** | Tests géospatiaux · mobile |
| CI | Basique | **GitHub Actions + LHCI** | Lighthouse budget guard |
| Analyse spatiale | ❌ Non | **Turf.js (modulaire)** | V3 · import individuel |
| Temps réel | ❌ Non | **Polling 3min V2 · SSE V3** | Compatible Vercel Hobby |

#### Success Metrics and KPIs

| KPI | Baseline V1 | Cible V2 | Mesure |
|-----|------------|----------|--------|
| Lighthouse Performance | ~70 | **≥ 85** | Lighthouse CI |
| Lighthouse Accessibilité | ~80 | **≥ 95** | Lighthouse CI |
| LCP | ~3s | **< 2.5s** | Web Vitals Vercel |
| Bundle JS total | ~450 Ko | **< 300 Ko** | `next build` output |
| Test coverage (unit) | 0% | **≥ 70%** | Vitest coverage |
| E2E tests passants | 0 | **≥ 10 scénarios** | Playwright CI |
| PWA installable | ❌ | **✅** | Lighthouse PWA audit |
| Coût Mapbox mensuel | $0 (sous seuil) | **$0 (éliminé)** | Facture Mapbox |

_Confiance globale Step 5 : Haute (documentation officielle + sources vérifiées + décisions basées sur codebase V1 réel)_

---

## Technical Research Synthesis

### Executive Summary

La recherche technique Tacet (2026-02-26) couvre 5 domaines : stack cartographique, patterns d'intégration, architecture PWA, pipeline GeoJSON/tiles, et implémentation tests/CI. L'analyse de 20+ sources web actuelles converge vers un ensemble de décisions claires, à coût zéro, qui éliminent les risques identifiés en V1.

**Finding #1 — Migration Mapbox → MapLibre : décision prise.** MapLibre GL JS (MIT, fork Mapbox 2020) est fonctionnellement identique à Mapbox GL JS. La migration V2 prend ~11h, élimine le risque coût ($0 vs $5/1000 loads au-delà de 50k/mois), et ouvre la porte aux tiles PMTiles auto-hébergées. react-map-gl v8 supporte nativement les deux bibliothèques.

**Finding #2 — PMTiles : remplacement optimal des raster tiles Mapbox.** Un fichier `.pmtiles` unique servi depuis Vercel Blob (CDN Edge) remplace les centaines de requêtes tuiles Mapbox. Réduction taille estimée 70%+ pour 992 IRIS Paris, chargement par HTTP range requests sans tile server, compatible offline Service Worker.

**Finding #3 — SSE sur Vercel Hobby = polling 3min V2.** Les WebSocket ne sont pas supportés sur Vercel serverless. SSE est la bonne direction à long terme, mais la limite de durée des fonctions Hobby impose un fallback polling côté client pour V2. Vercel Pro ($20/mois) débloque SSE persistent en V3.

**Finding #4 — Serwist est le seul package PWA viable App Router 2025.** next-pwa (shadowwalker) est abandonné, incompatible App Router. Serwist (`@serwist/next`) est son successeur actif, avec stratégies de cache CacheFirst (tiles) + NetworkFirst (pages/API) + offline shell.

**Finding #5 — Bruitparif RUMEUR : aucune API REST publique documentée.** La stratégie d'intégration temps réel est à 4 niveaux : N1 data.gouv.fr statique (immédiat), N2 Open Data Paris datasets Bruitparif (~annuels), N3 partenariat API RUMEUR (3–6 mois), N4 licence commerciale. TAC-28 doit être créé immédiatement.

---

### Architecture Decision Records (ADRs)

#### ADR-01 : MapLibre GL JS au lieu de Mapbox GL JS (V2)

**Contexte :** Mapbox GL JS facture $5/1000 map loads au-delà de 50k/mois (gratuit). À 200k utilisateurs actifs mensuels, le coût atteint ~$1250/mois. Ce modèle de tarification non-linéaire est incompatible avec une app B2C gratuite à croissance organique.

**Décision :** Migrer vers MapLibre GL JS en V2 (sprint V2.1).

**Justification :**
- Licence MIT — aucun coût, aucune contrainte d'usage
- Fork direct de Mapbox GL JS (2020) — API quasi-identique, migration ~11h
- react-map-gl v8 supporte nativement MapLibre (pas de réécriture des composants React)
- Écosystème actif : 9k+ GitHub stars, nombreuses contributions industrielles (Elastic, AWS, Microsoft)
- Compatible PMTiles (tiles auto-hébergées) → élimination totale dépendance Mapbox

**Conséquences :**
- ✅ Coût Mapbox : $0 permanent (vs risque $1250+/mois)
- ✅ Souveraineté complète sur les tiles (PMTiles Vercel Blob)
- ⚠️ Perte Mapbox Geocoding v6 → remplacement Photon Komoot (gratuit, OSM) ou IGN BAN
- ⚠️ Styles Mapbox Studio non compatibles → utiliser styles MapTiler/OpenMapTiles ou style custom

**Statut :** ✅ DÉCISION PRISE · Sprint V2.1

---

#### ADR-02 : PMTiles (Protomaps) au lieu de GeoJSON dynamique (V2)

**Contexte :** Le GeoJSON statique 992 IRIS Paris (~3,8 Mo brut, ~800 Ko gzip) est chargé en entier à chaque session. À mesure que Tacet ajoute des couches (chantiers, événements, capteurs RUMEUR), la taille totale des données GeoJSON deviendra un goulot d'étranglement de performance.

**Décision :** Générer un fichier `.pmtiles` via Tippecanoe, l'héberger sur Vercel Blob (CDN Edge), et configurer MapLibre pour le charger via le protocole PMTiles.

**Justification :**
- Fichier unique HTTP range requests → seules les tuiles visibles sont téléchargées
- Réduction estimée 70%+ de la taille totale transférée
- Aucun tile server requis — compatible avec l'infrastructure Vercel statique
- Offline-friendly : les tuiles visitées sont cachables par le Service Worker (CacheFirst 30j)
- Tippecanoe v2.17+ génère nativement des `.pmtiles` (commande documentée dans Step 2)

**Conséquences :**
- ✅ Performance carte améliorée (FCP carte < 0.8s vs ~1.8s GeoJSON parse)
- ✅ Scalabilité illimitée (CDN Vercel Edge Network)
- ⚠️ Pipeline de génération Tippecanoe à mettre en place (script npm `build:tiles`)
- ⚠️ Mise à jour manuelle du `.pmtiles` à chaque nouveau millésime Bruitparif (annuel)

**Statut :** ✅ DÉCISION PRISE · Sprint V2.1

---

#### ADR-03 : Serwist PWA au lieu de next-pwa (V2)

**Contexte :** Tacet V1 n'est pas installable en tant que PWA. L'objectif V2 est d'atteindre le badge "PWA installable" Lighthouse et d'offrir un mode offline basique (carte vue récemment + UI).

**Décision :** Utiliser `@serwist/next` (successeur de next-pwa, basé sur Workbox) pour implémenter le Service Worker et le manifest PWA.

**Justification :**
- `next-pwa` (shadowwalker) : dernière mise à jour 2022, incompatible App Router
- `@serwist/next` : fork actif, support officiel App Router, API Workbox moderne
- `app/manifest.ts` : génération native Next.js (aucun package tiers)
- Stratégies de cache configurables par route (CacheFirst tiles, NetworkFirst pages, StaleWhileRevalidate API)

**Conséquences :**
- ✅ PWA installable (Android/Chrome, iOS/Safari partiel)
- ✅ Offline mode : App Shell + tuiles visitées récemment (CacheFirst 30j)
- ⚠️ iOS Safari : support PWA limité (pas de push notifications, install banner non standard)
- ⚠️ `sw.ts` à maintenir lors des évolutions de routes

**Statut :** ✅ DÉCISION PRISE · Sprint V2.2

---

#### ADR-04 : Vitest + Playwright au lieu d'absence de tests (V2)

**Contexte :** Tacet V1 n'a aucun test automatisé. La croissance du codebase (map interactions, SSE, scoring IRIS, geocoding) augmente le risque de régression lors des migrations V2.

**Décision :** Introduire une pyramide de tests en V2 : Vitest (unit + composants) + Playwright (E2E géospatial) + Lighthouse CI (performance regression guard).

**Justification :**
- Vitest : recommandé officiellement par Next.js pour le testing App Router, rapide, compatible TypeScript strict
- Playwright : seul framework E2E capable de tester le canvas WebGL MapLibre (screenshot + interaction)
- Lighthouse CI (`treosh/lighthouse-ci-action`) : budget guard automatique sur chaque PR GitHub
- Limitation connue : async Server Components non testables avec Vitest → couvert par Playwright E2E

**Conséquences :**
- ✅ Filet de sécurité pour migrations (MapLibre, PMTiles, Serwist)
- ✅ Lighthouse CI bloque les régressions de performance au-delà des seuils définis
- ⚠️ Setup initial ~1 sprint (Vitest config + Playwright config + CI workflow)
- ⚠️ Tests E2E carte lents sur CI (~30–60s par run canvas WebGL)

**Statut :** ✅ DÉCISION PRISE · Sprint V2.1 (setup) + V2.2 (couverture)

---

#### ADR-05 : Polling 3min (V2) → SSE (V3 avec Vercel Pro) pour données temps réel

**Contexte :** Bruitparif RUMEUR refresh toutes les 3 minutes (Périphérique). L'idéal technique est SSE (Server-Sent Events) pour push serveur → client. Mais Vercel Hobby limite les fonctions serverless à ~10s par invocation, rendant les SSE long-running impossibles.

**Décision :** V2 → polling client toutes les 3min vers Route Handler cached (`next: { revalidate: 180 }`). V3 → SSE long avec Vercel Pro ($20/mois) si données temps réel deviennent critiques pour l'UX.

**Justification :**
- Polling 3min = latence identique au refresh Bruitparif → aucune perte d'information perçue
- Compatible Vercel Hobby (aucun coût additionnel)
- SSE en V3 uniquement si l'analyse d'usage montre que les utilisateurs attendent activement la mise à jour
- WebSocket : exclu définitivement (Vercel serverless incompatible avec connexions persistantes)

**Conséquences :**
- ✅ V2 livrée sans upgrade Vercel ($0/mois supplémentaire)
- ✅ Architecture SSE préparée (hook `useRumeurStream` réutilisable V3)
- ⚠️ Latence effective = 3min (acceptable pour données environnementales, non critique)
- ⚠️ V3 nécessite TAC-28 (accès API Bruitparif) ET upgrade Vercel Pro

**Statut :** ✅ DÉCISION PRISE · V2 polling · V3 SSE conditionnel

---

### Stack Verdicts — Tableau de décision complet

| Composant | V1 actuel | Verdict | V2 action | Justification |
|-----------|-----------|---------|-----------|---------------|
| **Next.js 14.2** | ✅ En prod | CONSERVER | Upgrade 15 optionnel | App Router optimal, caching V15 plus prévisible |
| **TypeScript strict** | ✅ En prod | CONSERVER | — | Standard industrie |
| **TailwindCSS** | ✅ En prod | CONSERVER | — | Productivité élevée |
| **Mapbox GL JS 3.18** | ✅ En prod | 🔄 REMPLACER | MapLibre GL JS | MIT, $0, API identique, react-map-gl v8 natif |
| **Mapbox Tiles** | ✅ En prod | 🔄 REMPLACER | PMTiles (Vercel Blob) | Gratuit, CDN Edge, offline-friendly, 70% plus léger |
| **Mapbox Geocoding** | ✅ En prod | 🔄 REMPLACER | Photon Komoot / IGN BAN | Gratuit, sans clé API, OSM France haute qualité |
| **GeoJSON statique 992 IRIS** | ✅ En prod | 🔄 REMPLACER | PMTiles zoom adaptatif | Lazy loading par zoom, HTTP range requests |
| **Vercel Hobby** | ✅ En prod | CONSERVER | — | $0, CDN Edge, Blob inclus, 100 GB bande passante |
| **PWA** | ❌ Absent | ➕ AJOUTER | Serwist + manifest.ts | Installable, offline shell, 3 niveaux dégradation |
| **Tests unitaires** | ❌ Absent | ➕ AJOUTER | Vitest | Next.js officiel, rapide, TypeScript natif |
| **Tests E2E** | ❌ Absent | ➕ AJOUTER | Playwright | Tests carte WebGL, mobile PWA, géospatial |
| **Lighthouse CI** | ❌ Absent | ➕ AJOUTER | GitHub Actions + LHCI | Budget guard performance par PR |
| **SSE / temps réel** | ❌ Absent | ➕ V2 POLLING | Polling 3min Route Handler | Bruitparif refresh = 3min, Vercel Hobby compatible |
| **Turf.js** | ❌ Absent | ➕ V3 | Imports modulaires | Point-in-polygon, buffer (après validation B2C) |
| **Deck.gl** | ❌ Absent | ➕ V3 | Heatmap RUMEUR overlay | WebGL2/WebGPU, MIT, après accès API Bruitparif |

---

### Roadmap Technique — Nouvelles issues Linear

| Issue | Titre | Priorité | Sprint | Dépendance |
|-------|-------|----------|--------|------------|
| **TAC-28** | Contacter Bruitparif — accès API RUMEUR temps réel | 🔴 Urgent | Immédiat | — |
| **TAC-29** | Migration MapLibre GL JS (M1→M4 : swap · imports · PMTiles · E2E) | 🔴 Haute | V2.1 | — |
| **TAC-30** | PMTiles pipeline : Tippecanoe + Vercel Blob deploy | 🔴 Haute | V2.1 | TAC-29 |
| **TAC-31** | Setup Vitest + Playwright + GitHub Actions CI | 🟡 Moyenne | V2.1 | — |
| **TAC-32** | Lighthouse CI budget guard (PR checks, seuils définis) | 🟡 Moyenne | V2.1 | TAC-31 |
| **TAC-33** | PWA Serwist : manifest + Service Worker + offline shell | 🟡 Moyenne | V2.2 | TAC-29 |
| **TAC-34** | Geocoding migration Photon Komoot (remplace Mapbox v6) | 🟡 Moyenne | V2.2 | TAC-29 |
| **TAC-35** | Route Handler proxy Bruitparif + polling 3min (N1 data.gouv.fr) | 🟢 Normale | V2.3 | TAC-28 |
| **TAC-36** | Intégration chantiers Open Data Paris (couche carte) | 🟢 Normale | V2.3 | — |
| **TAC-37** | Tests E2E géospatiaux Playwright (≥ 10 scénarios cible) | 🟢 Normale | V2.2 | TAC-31 |

**Ordre de dépendance critique :**
```
TAC-28 (Bruitparif contact) ─────────────────────────────→ TAC-35
TAC-29 (MapLibre migration) → TAC-30 (PMTiles)
                            → TAC-33 (PWA)
                            → TAC-34 (Geocoding)
TAC-31 (CI setup) ──────────→ TAC-32 (Lighthouse CI)
                            → TAC-37 (Tests E2E)
```

---

### Future Technical Outlook

**Horizon V3 (6–12 mois après V2) :**

| Technologie | Cas d'usage Tacet | Condition |
|-------------|-------------------|-----------|
| **Turf.js** `@turf/point-in-polygon` | Identification IRIS au clic côté client (sans serveur) | Validation B2C engagement |
| **Deck.gl** heatmap overlay | Visualisation densité capteurs RUMEUR en temps réel | Accès API Bruitparif (TAC-28) |
| **WebGPU** MapLibre v5 | Rendu carte plus fluide, animations avancées | Adoption navigateurs (2026+) |
| **Vercel Pro + SSE** | Push temps réel 1min vs polling 3min | Croissance → upgrade justifié |
| **TinyML / YAMNet** | Classification bruit microphone utilisateur | V4 post-validation B2C |

**Technologies à surveiller :**
- `@maplibre/maplibre-gl-js` v5 : WebGPU rendering (annoncé 2025–2026)
- PMTiles v3 : compression Zstd (meilleur ratio que gzip)
- Next.js 15 PPR : Partial Pre-rendering (hybride statique + dynamique par composant)
- React 19 : Server Actions + use() hook → simplification data fetching carte

---

### Technical Research Conclusion

**Tacet dispose d'un stack moderne et d'une voie de migration claire vers une architecture zéro-coût infrastructure.** Les 5 ADRs constituent les décisions architecturales fondamentales de V2 — chacun avec contexte, justification vérifiée par sources web, et conséquences anticipées.

**Implémentation recommandée (ordre de priorité) :**
1. **TAC-28** (Bruitparif contact) → sans dépendance, à lancer immédiatement en parallèle
2. **TAC-29** (MapLibre migration) → débloque TAC-30, TAC-33, TAC-34 — sprint V2.1
3. **TAC-31** (CI setup) → débloque TAC-32, TAC-37 — sprint V2.1
4. **TAC-30** (PMTiles) → performance carte, après TAC-29
5. **TAC-33/34** (PWA + Geocoding) → sprint V2.2, après TAC-29

La **Discovery phase est complète** : Market Research + Domain Research + Technical Research fournissent ensemble une base de décision exhaustive et vérifiée pour la roadmap V2/V3 de Tacet.

---

**Recherche technique complète le 2026-02-26**
**Confiance globale : Haute** — 20+ sources web vérifiées · documentation officielle Next.js/MapLibre/Serwist/Playwright · décisions fondées sur le codebase V1 réel (Next.js 14.2 + Mapbox GL 3.18 + 992 IRIS Paris)

_Cette recherche technique constitue la référence architecturale de Tacet V2 et fonde les décisions d'implémentation du backlog sprint V2.1–V2.3._
