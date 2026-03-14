"use client";

import { useEffect, useRef } from "react";
import { X, Radio } from "lucide-react";
import type { RumeurFeatureProperties } from "@/types/rumeur";
import { formatRelativeTime } from "@/lib/format-date";

interface RumeurPopupProps {
  properties: RumeurFeatureProperties;
  onClose: () => void;
}

export function RumeurPopup({ properties, onClose }: RumeurPopupProps) {
  const { stationId, leq, lmin, lmax, timestamp } = properties;
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

  const leqDisplay =
    leq !== null && leq !== undefined
      ? `${Math.round(leq)} dB`
      : null;

  const hasRange = lmin !== null && lmin !== undefined && lmax !== null && lmax !== undefined;
  const relativeTime = formatRelativeTime(timestamp);

  return (
    <div
      ref={popupRef}
      className="absolute bottom-8 left-1/2 z-30 w-[300px] sm:w-[340px] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/65 p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Capteur RUMEUR — niveau sonore"
      aria-modal="true"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Radio size={14} className="shrink-0 text-teal-400" />
          <p className="text-[10px] uppercase tracking-widest text-white/40">Capteur RUMEUR</p>
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
        {/* Station ID */}
        <div>
          <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">Station</p>
          <p className="text-sm font-medium text-white">{stationId}</p>
        </div>

        {/* Leq — primary metric */}
        <div>
          <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">
            Niveau sonore (Leq)
          </p>
          {leqDisplay !== null ? (
            <p className="text-2xl font-bold tabular-nums text-teal-300">{leqDisplay}</p>
          ) : (
            <p className="text-sm text-white/40">Niveau non disponible</p>
          )}
        </div>

        {/* Min / Max range — only when both values are present */}
        {hasRange && (
          <div className="flex gap-4">
            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">Min</p>
              <p className="text-sm tabular-nums text-white/70">{Math.round(lmin as number)} dB</p>
            </div>
            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">Max</p>
              <p className="text-sm tabular-nums text-white/70">{Math.round(lmax as number)} dB</p>
            </div>
          </div>
        )}

        {/* Timestamp */}
        {relativeTime && (
          <p className="text-xs text-white/40">
            Mesuré{" "}
            <span className="text-white/60">{relativeTime}</span>
          </p>
        )}
      </div>
    </div>
  );
}
