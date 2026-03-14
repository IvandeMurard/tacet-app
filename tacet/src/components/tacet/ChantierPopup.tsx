"use client";

import { useEffect, useRef } from "react";
import { X, HardHat } from "lucide-react";
import type { ChantierProperties } from "@/types/chantier";

interface ChantierPopupProps {
  properties: ChantierProperties;
  onClose: () => void;
}

function formatEndDate(dateStr: string): string {
  if (!dateStr) return "Date non précisée";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Date non précisée";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function ChantierPopup({ properties, onClose }: ChantierPopupProps) {
  const { adresse, date_fin, type_chantier } = properties;
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = popupRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute bottom-8 left-1/2 z-30 w-[300px] sm:w-[340px] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/65 p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Informations du chantier"
      aria-modal="true"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <HardHat size={14} className="shrink-0 text-amber-400" />
          <p className="text-[10px] uppercase tracking-widest text-white/40">Chantier</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
          aria-label="Fermer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-3">
        <div>
          <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">Adresse</p>
          <p className="text-sm font-medium leading-snug text-white">
            {adresse || "Adresse inconnue"}
          </p>
        </div>

        <div>
          <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">Fin prévue</p>
          <p className="text-sm text-white/80">{formatEndDate(date_fin)}</p>
        </div>

        <div>
          <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">Type</p>
          <p className="text-sm text-white/80">{type_chantier || "Type non précisé"}</p>
        </div>

        <p className="text-[10px] italic text-white/25">
          Rayon d'impact non disponible dans les données Open Data Paris.
        </p>
      </div>
    </div>
  );
}
