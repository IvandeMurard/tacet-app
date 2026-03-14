import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst, CacheableResponsePlugin } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // E4-H1: GeoJSON data files — CacheFirst (static between deployments)
    // Ensures paris-noise-iris.geojson + iris-centroids.geojson render offline
    {
      matcher: ({ url }: { url: URL }) =>
        url.pathname.startsWith("/data/") && url.pathname.endsWith(".geojson"),
      handler: new CacheFirst({
        cacheName: "geojson-cache",
        plugins: [new CacheableResponsePlugin({ statuses: [200] })],
      }),
    },
    // E4-M2: API routes — NetworkFirst with 5s timeout, fallback to cached response
    // Enables offline RUMEUR + Chantiers from last successful fetch
    {
      matcher: ({ url }: { url: URL }) => /^\/api\/(rumeur|chantiers)$/.test(url.pathname),
      handler: new NetworkFirst({
        cacheName: "api-routes-cache",
        networkTimeoutSeconds: 5,
        plugins: [new CacheableResponsePlugin({ statuses: [200] })],
      }),
    },
    // Default Next.js cache strategies (pages, JS, CSS, fonts, images)
    ...defaultCache,
  ],
});

serwist.addEventListeners();
