"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Legend } from "@/components/Legend";
import { IrisPopup } from "@/components/IrisPopup";
import { ChantierPopup } from "@/components/tacet/ChantierPopup";
import { RumeurPopup } from "@/components/tacet/RumeurPopup";
import { SearchBar } from "@/components/SearchBar";
import { ComparisonTray } from "@/components/tacet/ComparisonTray";
import { useMapContext, MAX_PINNED } from "@/contexts/MapContext";
import { useRumeurData } from "@/hooks/useRumeurData";
import { useChantiersData } from "@/hooks/useChantiersData";
import { useRestoreLastZone } from "@/hooks/useRestoreLastZone";
import { useZoneDeepLink } from "@/hooks/useZoneDeepLink";
import { RumeurStatusBar } from "@/components/tacet/RumeurStatusBar";
import { PWAInstallPrompt } from "@/components/tacet/PWAInstallPrompt";
import { BRAND_COLOR } from "@/lib/noise-categories";
import type { RumeurMeasurement } from "@/types/rumeur";

const MapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((m) => ({ default: m.MapContainer })),
  { ssr: false }
);

/** Haversine distance in metres between two WGS-84 points. */
function haversineM([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const SENSOR_RADIUS_M = 1_000;
const CHANTIER_RADIUS_M = 400;

function AppNav({ onOpenCompare }: { onOpenCompare: () => void }) {
  const { pinnedZones } = useMapContext();
  const pinCount = pinnedZones.length;

  return (
    <nav
      className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/15 bg-black/65 px-1 py-1 shadow-xl backdrop-blur-xl"
      aria-label="Navigation Tacet"
    >
      <Link
        href="/"
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold tracking-tight transition-colors hover:bg-white/10"
        style={{ color: BRAND_COLOR }}
        aria-label="Tacet — accueil carte"
      >
        Tacet
      </Link>
      <span className="h-3.5 w-px bg-white/15" aria-hidden />
      <LayerToggle
        label="Chantiers"
        active={activeLayers.has("chantiers")}
        onToggle={() => toggleLayer("chantiers")}
        ariaLabel="Afficher les chantiers en cours"
      />
      {process.env.NEXT_PUBLIC_ENABLE_RUMEUR === "true" && (
        <LayerToggle
          label="Capteurs"
          active={activeLayers.has("rumeur")}
          onToggle={() => toggleLayer("rumeur")}
          ariaLabel="Afficher les capteurs de bruit RUMEUR"
        />
      )}
      <LayerToggle
        label="Élections"
        active={activeLayers.has("elections")}
        onToggle={() => toggleLayer("elections")}
        ariaLabel="Afficher la couche thématique Élections 2026"
      />
      <button
        type="button"
        onClick={onOpenCompare}
        className="rounded-xl px-3 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Comparer les zones épinglées"
      >
        Comparer {pinCount > 0 ? `(${pinCount})` : ""}
      </button>
      <Link
        href="/barometre"
        className="rounded-xl px-3 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/10 hover:text-white"
      >
        Baromètre
      </Link>
    </nav>
  );
}

/**
 * Always-on RUMEUR status pill. Fetching is always enabled; the pill renders
 * only when there is actionable status to show (error or stale data).
 */
function RumeurStatus({ rumeurResponse, swrError }: {
  rumeurResponse: ReturnType<typeof useRumeurData>["data"];
  swrError: unknown;
}) {
  const error: string | null =
    rumeurResponse?.error ??
    (swrError instanceof Error ? swrError.message : swrError ? "Erreur réseau" : null);

  if (!rumeurResponse && !error) return null;

  return (
    <RumeurStatusBar
      cachedAt={rumeurResponse?.cachedAt ?? null}
      error={error}
      fallback={rumeurResponse?.fallback ?? false}
    />
  );
}

export function MapPageClient() {
  const { selectedZone, setSelectedZone, flyToAndSelectZone, pinZone, pinnedZones, selectedChantier, setSelectedChantier, selectedRumeur, setSelectedRumeur } = useMapContext();
  const { selectedZone, setSelectedZone, selectedZoneLngLat, flyToAndSelectZone, pinZone, pinnedZones, selectedChantier, setSelectedChantier, selectedRumeur, setSelectedRumeur } =
    useMapContext();
  useRestoreLastZone();
  useZoneDeepLink();
  const [trayOpen, setTrayOpen] = useState(false);

  // Always-on data fetching — no toggles
  const { data: rumeurResponse, error: rumeurSwrError } = useRumeurData(true);
  const { data: chantiersResponse } = useChantiersData(true);

  const isPinned = selectedZone ? pinnedZones.some((z) => z.code_iris === selectedZone.code_iris) : false;
  const pinDisabled = !isPinned && pinnedZones.length >= MAX_PINNED;

  // Contextual proximity data for the selected zone
  const nearestSensor = useMemo(() => {
    if (!selectedZoneLngLat || !rumeurResponse?.data?.measurements?.length) return null;
    let best: { measurement: RumeurMeasurement; distanceM: number } | null = null;
    for (const m of rumeurResponse.data.measurements) {
      if (m.lat == null || m.lon == null) continue;
      const d = haversineM(selectedZoneLngLat, [m.lon, m.lat]);
      if (d <= SENSOR_RADIUS_M && (!best || d < best.distanceM)) {
        best = { measurement: m, distanceM: d };
      }
    }
    return best;
  }, [selectedZoneLngLat, rumeurResponse]);

  const nearbyChantiers = useMemo(() => {
    if (!selectedZoneLngLat || !chantiersResponse?.data?.length) return [];
    type RawChantier = NonNullable<typeof chantiersResponse.data>[number];
    return (chantiersResponse.data as RawChantier[])
      .filter((c: RawChantier) => c.geo_point_2d != null)
      .map((c: RawChantier) => ({
        ...c,
        distanceM: haversineM(selectedZoneLngLat, [c.geo_point_2d!.lon, c.geo_point_2d!.lat]),
      }))
      .filter((c: RawChantier & { distanceM: number }) => c.distanceM <= CHANTIER_RADIUS_M)
      .sort((a: RawChantier & { distanceM: number }, b: RawChantier & { distanceM: number }) => a.distanceM - b.distanceM);
  }, [selectedZoneLngLat, chantiersResponse]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <a
        href="#main-map"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>
      <div id="main-map">
        <MapContainer />
      </div>
      <Legend />
      <SearchBar
        onAddressSelect={flyToAndSelectZone}
        onClear={() => {
          setSelectedZone(null);
          setSelectedChantier(null);
          setSelectedRumeur(null);
        }}
      />
      {selectedZone && (
        <IrisPopup
          properties={selectedZone}
          onClose={() => setSelectedZone(null)}
          onPin={() => pinZone(selectedZone)}
          isPinned={isPinned}
          pinDisabled={pinDisabled}
          nearestSensor={nearestSensor}
          nearbyChantiers={nearbyChantiers}
        />
      )}
      {selectedChantier && (
        <ChantierPopup
          properties={selectedChantier}
          onClose={() => setSelectedChantier(null)}
        />
      )}
      {selectedRumeur && (
        <RumeurPopup
          properties={selectedRumeur}
          onClose={() => setSelectedRumeur(null)}
        />
      )}
      {selectedChantier && (
        <ChantierPopup
          properties={selectedChantier}
          onClose={() => setSelectedChantier(null)}
        />
      )}
      {selectedRumeur && (
        <RumeurPopup
          properties={selectedRumeur}
          onClose={() => setSelectedRumeur(null)}
        />
      )}
      <ComparisonTray isOpen={trayOpen} onClose={() => setTrayOpen(false)} />
      {process.env.NEXT_PUBLIC_ENABLE_RUMEUR === "true" && <RumeurStatus />}
      {process.env.NEXT_PUBLIC_ENABLE_RUMEUR === "true" && (
        <RumeurStatus rumeurResponse={rumeurResponse} swrError={rumeurSwrError} />
      )}
      <PWAInstallPrompt triggered={selectedZone !== null} />
      <AppNav onOpenCompare={() => setTrayOpen((v) => !v)} />
    </main>
  );
}
