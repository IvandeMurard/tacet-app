"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Legend } from "@/components/Legend";
import { IrisPopup } from "@/components/IrisPopup";
import { SearchBar } from "@/components/SearchBar";
import { ComparisonTray } from "@/components/tacet/ComparisonTray";
import { useMapContext } from "@/contexts/MapContext";
import { BRAND_COLOR } from "@/lib/noise-categories";

const MapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((m) => ({ default: m.MapContainer })),
  { ssr: false }
);

function LayerToggle({
  label,
  active,
  onToggle,
  ariaLabel,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`rounded-xl px-3 py-1.5 text-xs transition-colors ${
        active
          ? "bg-white/15 font-medium text-white"
          : "text-white/55 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function AppNav({ onOpenCompare }: { onOpenCompare: () => void }) {
  const { pinnedZones, activeLayers, toggleLayer } = useMapContext();
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

export function MapPageClient() {
  const { selectedZone, setSelectedZone, flyToAndSelectZone, pinZone, pinnedZones } = useMapContext();
  const [trayOpen, setTrayOpen] = useState(false);

  const isPinned = selectedZone ? pinnedZones.some((z) => z.code_iris === selectedZone.code_iris) : false;

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
      <SearchBar onAddressSelect={flyToAndSelectZone} />
      {selectedZone && (
        <IrisPopup
          properties={selectedZone}
          onClose={() => setSelectedZone(null)}
          onPin={() => pinZone(selectedZone)}
          isPinned={isPinned}
        />
      )}
      <ComparisonTray isOpen={trayOpen} onClose={() => setTrayOpen(false)} />
      <AppNav onOpenCompare={() => setTrayOpen((v) => !v)} />
    </main>
  );
}
