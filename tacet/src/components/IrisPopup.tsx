"use client";

import { useEffect, useRef } from "react";
import { X, Share2, Sun, Moon, Pin } from "lucide-react";
import Link from "next/link";
import { getNoiseCategory, getSereniteScore, arLabel } from "@/lib/noise-categories";
import { SerenityBar } from "@/components/tacet/SerenityBar";
import { TierBadge } from "@/components/tacet/TierBadge";
import { DataProvenance } from "@/components/tacet/DataProvenance";
import type { IrisProperties } from "@/types/iris";

export type { IrisProperties };

interface IrisPopupProps {
  properties: IrisProperties;
  onClose: () => void;
  onPin?: () => void;
  isPinned?: boolean;
}

const DATA_YEAR = 2024;

export function IrisPopup({ properties, onClose, onPin, isPinned = false }: IrisPopupProps) {
  const { code_iris, name, c_ar, noise_level, primary_sources, day_level, night_level, description } =
    properties;

  const category = getNoiseCategory(noise_level);
  const score = getSereniteScore(noise_level);
  const label = arLabel(c_ar);

  const scoreColor =
    score >= 70
      ? "#4ade80"
      : score >= 45
      ? "#fbbf24"
      : score >= 15
      ? "#f87171"
      : "#c084fc";

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

  const handleShare = async () => {
    const text = `${name} · ${label} arr. — Score Sérénité ${score}/100 (${category?.label}) | Tacet Paris`;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Tacet — Bruit à Paris",
          text,
          url: window.location.href,
        });
      } catch {
        // Annulé par l'utilisateur
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute bottom-8 left-1/2 z-30 w-[320px] sm:w-[360px] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/65 p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label={`Informations sonores — ${name}`}
      aria-modal="true"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-0.5 text-[10px] uppercase tracking-widest text-white/40">
            {label} arrondissement · IRIS {code_iris}
          </p>
          <h3 className="truncate text-[15px] font-semibold leading-snug text-white">{name}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onPin && (
            <button
              type="button"
              onClick={onPin}
              className={`rounded-full p-1.5 transition-colors ${
                isPinned ? "text-teal-400" : "text-white/30 hover:bg-white/10 hover:text-white/70"
              }`}
              aria-label={isPinned ? "Retirer des favoris" : "Épingler pour comparer"}
            >
              <Pin size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
            aria-label="Fermer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <TierBadge label={category?.label ?? ""} color={category?.color ?? "#666"} />
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs tracking-wide text-white/40">Score de Sérénité</span>
          <span
            className="text-5xl font-bold leading-none tabular-nums"
            style={{ color: scoreColor }}
          >
            {score}
            <span className="ml-0.5 text-base font-normal text-white/35">/100</span>
          </span>
        </div>
        <SerenityBar score={score} color={scoreColor} className="h-1" />
      </div>

      {description && (
        <p className="mb-4 text-sm italic text-white/50">{description}</p>
      )}

      {(day_level != null || night_level != null) && (
        <div className="mb-4 flex gap-4">
          {day_level != null && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Sun size={11} className="shrink-0 text-amber-400" />
              <span>Jour : <strong className="text-white/70">{day_level} dB</strong></span>
            </div>
          )}
          {night_level != null && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Moon size={11} className="shrink-0 text-indigo-400" />
              <span>Nuit : <strong className="text-white/70">{night_level} dB</strong></span>
            </div>
          )}
        </div>
      )}

      {primary_sources && (
        <p className="mb-4 text-[10px] leading-relaxed text-white/25">
          Source : {Array.isArray(primary_sources) ? primary_sources.join(", ") : primary_sources}
        </p>
      )}

      <div className="mb-4 space-y-1 text-[10px] text-white/30">
        <p>Données {DATA_YEAR} · Score indicatif, non certifié pour un usage réglementaire.</p>
        <p>
          <Link href="/mentions-legales#methodologie" className="underline hover:text-white/60">
            Méthodologie Lden → Score
          </Link>
        </p>
        <DataProvenance />
      </div>

      <button
        onClick={handleShare}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-colors"
        style={{
          backgroundColor: "rgba(13,148,136,0.12)",
          color: "#2DD4BF",
          border: "1px solid rgba(13,148,136,0.25)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(13,148,136,0.22)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(13,148,136,0.12)"; }}
      >
        <Share2 size={13} />
        Partager ce score
      </button>
    </div>
  );
}
