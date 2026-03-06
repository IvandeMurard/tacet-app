"use client";

import { X } from "lucide-react";
import { getNoiseCategory, getSereniteScore, arLabel } from "@/lib/noise-categories";
import { useMapContext } from "@/contexts/MapContext";
import type { IrisProperties } from "@/types/iris";

interface ComparisonTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

function ZoneRow({ zone, onUnpin }: { zone: IrisProperties; onUnpin: () => void }) {
  const category = getNoiseCategory(zone.noise_level);
  const score = getSereniteScore(zone.noise_level);
  const label = arLabel(zone.c_ar);

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{zone.name}</p>
        <p className="text-[10px] text-white/40">{label} arr.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: category?.color }}
        >
          {score}
        </span>
        <span className="text-[10px] text-white/40">/100</span>
        <button
          type="button"
          onClick={onUnpin}
          className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={`Retirer ${zone.name} des favoris`}
        >
          <X size={14} />
        </button>
      </div>
    </li>
  );
}

export function ComparisonTray({ isOpen, onClose }: ComparisonTrayProps) {
  const { pinnedZones, unpinZone } = useMapContext();

  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-20 left-1/2 z-25 w-[320px] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/80 p-4 shadow-2xl backdrop-blur-xl"
      role="dialog"
      aria-label="Zones épinglées — comparaison"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Zones à comparer ({pinnedZones.length}/3)
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>
      {pinnedZones.length === 0 ? (
        <p className="py-4 text-center text-sm text-white/40">
          Épinglez des zones depuis la carte pour les comparer.
        </p>
      ) : (
        <ul className="space-y-2">
          {pinnedZones.map((zone) => (
            <ZoneRow
              key={zone.code_iris}
              zone={zone}
              onUnpin={() => unpinZone(zone.code_iris)}
            />
          ))}
        </ul>
      )}
      <p className="mt-3 text-[10px] text-white/30">
        Cliquez sur une zone sur la carte pour la sélectionner.
      </p>
    </div>
  );
}
