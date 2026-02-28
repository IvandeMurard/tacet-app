"use client";

import { X, Share2, Sun, Moon } from "lucide-react";
import { getNoiseCategory, getSereniteScore, arLabel } from "@/lib/noise-categories";

// Propriétés GeoJSON exposées par paris-noise-iris.geojson
export interface IrisProperties {
  code_iris: string;
  name: string;
  c_ar: number;
  noise_level: number;
  primary_sources?: string;
  day_level?: number;
  night_level?: number;
  description?: string;
}

interface IrisPopupProps {
  properties: IrisProperties;
  onClose: () => void;
}

const CATEGORY_EMOJI: Record<number, string> = {
  1: "🟢",
  2: "🟡",
  3: "🔴",
  4: "🟣",
};

export function IrisPopup({ properties, onClose }: IrisPopupProps) {
  const { code_iris, name, c_ar, noise_level, primary_sources, day_level, night_level } =
    properties;

  const category = getNoiseCategory(noise_level);
  const score = getSereniteScore(noise_level);
  const label = arLabel(c_ar);
  const emoji = CATEGORY_EMOJI[noise_level] ?? "⚪";

  const scoreBarClass =
    score >= 70
      ? "bg-green-400"
      : score >= 45
      ? "bg-amber-400"
      : score >= 15
      ? "bg-red-400"
      : "bg-violet-400";

  const scoreTextClass =
    score >= 70
      ? "text-green-400"
      : score >= 45
      ? "text-amber-400"
      : score >= 15
      ? "text-red-400"
      : "text-violet-400";

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
        // Annulé par l'utilisateur — pas d'action requise
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
    }
  };

  return (
    <div
      className="absolute bottom-8 left-1/2 z-30 w-[320px] sm:w-[360px] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/65 p-5 shadow-2xl backdrop-blur-xl"
      role="dialog"
      aria-label={`Informations sonores — ${name}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-0.5 text-[10px] uppercase tracking-widest text-white/40">
            {label} arrondissement · IRIS {code_iris}
          </p>
          <h3 className="truncate text-[15px] font-semibold leading-snug text-white">{name}</h3>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 shrink-0 rounded-full p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
          aria-label="Fermer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Catégorie */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-base leading-none">{emoji}</span>
        <span
          className="rounded-full border px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${category?.color}18`,
            color: category?.color,
            borderColor: `${category?.color}33`,
          }}
        >
          {category?.label}
        </span>
      </div>

      {/* Score de Sérénité */}
      <div className="mb-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs tracking-wide text-white/40">Score de Sérénité</span>
          <span className={`text-2xl font-bold leading-none tabular-nums ${scoreTextClass}`}>
            {score}
            <span className="ml-0.5 text-xs font-normal text-white/35">/100</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${scoreBarClass}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Jour / Nuit */}
      {(day_level != null || night_level != null) && (
        <div className="mb-4 flex gap-4">
          {day_level != null && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Sun size={11} className="shrink-0 text-amber-400" />
              <span>
                Jour :{" "}
                <strong className="font-medium text-white/70">{day_level} dB</strong>
              </span>
            </div>
          )}
          {night_level != null && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Moon size={11} className="shrink-0 text-indigo-400" />
              <span>
                Nuit :{" "}
                <strong className="font-medium text-white/70">{night_level} dB</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Source */}
      {primary_sources && (
        <p className="mb-4 text-[10px] leading-relaxed text-white/25">
          Source : {primary_sources}
        </p>
      )}

      {/* Bouton Partager */}
      <button
        onClick={handleShare}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-colors"
        style={{
          backgroundColor: "rgba(13,148,136,0.12)",
          color: "#2DD4BF",
          border: "1px solid rgba(13,148,136,0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(13,148,136,0.22)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(13,148,136,0.12)";
        }}
      >
        <Share2 size={13} />
        Partager ce score
      </button>
    </div>
  );
}
