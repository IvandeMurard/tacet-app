"use client";

import { useEffect, useRef, useState } from "react";
import { X, Share2, Sun, Moon, Pin, Check, Volume2, Construction } from "lucide-react";
import Link from "next/link";
import { getNoiseCategory, getSereniteScore, arLabel } from "@/lib/noise-categories";
import { DATA_YEAR } from "@/lib/constants";
import { isNightTime, getSensorTimeLabel, isChantierExpired, SENSOR_EVENING_START_HOUR } from "@/lib/time-context";
import { SerenityBar } from "@/components/tacet/SerenityBar";
import { TierBadge } from "@/components/tacet/TierBadge";
import { DataProvenance } from "@/components/tacet/DataProvenance";
import { useNoiseReports } from "@/hooks/useNoiseReports";
import { useEnrichment } from "@/hooks/useEnrichment";
import type { IrisProperties } from "@/types/iris";
import type { RumeurMeasurement } from "@/types/rumeur";
import type { EnrichmentRequest } from "@/types/enrichment";

export type { IrisProperties };

interface NearbyChantier {
  adresse?: string;
  date_fin?: string;
  type_chantier?: string;
  distanceM: number;
}

interface IrisPopupProps {
  properties: IrisProperties;
  onClose: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  pinDisabled?: boolean;
  nearestSensor?: { measurement: RumeurMeasurement; distanceM: number } | null;
  nearbyChantiers?: NearbyChantier[];
}

export function IrisPopup({
  properties,
  onClose,
  onPin,
  isPinned = false,
  pinDisabled = false,
  nearestSensor = null,
  nearbyChantiers = [],
}: IrisPopupProps) {
  const { code_iris, name, c_ar, noise_level, primary_sources, day_level, night_level, description } =
    properties;

  const category = getNoiseCategory(noise_level);
  const score = getSereniteScore(noise_level);
  const label = arLabel(c_ar);
  const now = new Date();
  const isNight = isNightTime(now);
  const activeChantiers = nearbyChantiers.filter(c => !isChantierExpired(c.date_fin, now));
  const sensorLabel =
    nearestSensor && (isNight || now.getHours() >= SENSOR_EVENING_START_HOUR)
      ? getSensorTimeLabel(nearestSensor.measurement.timestamp, now)
      : "maintenant";

  const scoreColor =
    score >= 70
      ? "#4ade80"
      : score >= 45
      ? "#fbbf24"
      : score >= 15
      ? "#f87171"
      : "#c084fc";

  const popupRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const { recentCount, canReport, addReport } = useNoiseReports(code_iris);
  const [reported, setReported] = useState(false);

  const enrichmentRequest: EnrichmentRequest = {
    zone_code: code_iris,
    zone_name: name,
    arrondissement: c_ar,
    noise_level,
    day_level: day_level ?? null,
    night_level: night_level ?? null,
    score_serenite: score,
    current_iso_timestamp: now.toISOString(),
    rumeur_sensor: nearestSensor?.measurement.leq != null
      ? { leq: nearestSensor.measurement.leq, distanceM: nearestSensor.distanceM }
      : null,
    nearby_chantiers: activeChantiers.length > 0
      ? { count: activeChantiers.length, nearestDistanceM: activeChantiers[0]?.distanceM ?? 0 }
      : null,
    recent_reports: recentCount > 0 ? recentCount : null,
    intent: null,
  };
  const { enrichment } = useEnrichment(enrichmentRequest);

  const handleReport = () => {
    addReport();
    setReported(true);
    setTimeout(() => setReported(false), 3000);
  };

  const sensorColor =
    nearestSensor?.measurement.leq == null
      ? "#9ca3af"
      : nearestSensor.measurement.leq < 50
      ? "#4ade80"
      : nearestSensor.measurement.leq < 60
      ? "#fbbf24"
      : nearestSensor.measurement.leq < 70
      ? "#f97316"
      : "#ef4444";

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
    document.body.style.overflow = "hidden";
    el.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      el.removeEventListener("keydown", onKeyDown);
    };
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
              disabled={pinDisabled}
              className={`rounded-full p-1.5 transition-colors ${
                isPinned
                  ? "text-teal-400"
                  : pinDisabled
                  ? "cursor-not-allowed text-white/15"
                  : "text-white/30 hover:bg-white/10 hover:text-white/70"
              }`}
              aria-label={
                isPinned
                  ? "Retirer des favoris"
                  : pinDisabled
                  ? "Maximum 3 zones épinglées"
                  : "Épingler pour comparer"
              }
              title={pinDisabled ? "Maximum 3 zones épinglées" : undefined}
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

      {enrichment && enrichment.confidence !== "low" && enrichment.summary && (
        <p className="mb-4 text-sm leading-relaxed text-white/70">
          {enrichment.summary}
        </p>
      )}

      {description && (
        <p className="mb-4 text-sm italic text-white/50">{description}</p>
      )}

      {(day_level != null || night_level != null) && (() => {
        const primaryLevel = isNight ? night_level : day_level;
        const primaryIcon = isNight
          ? <Moon size={11} className="shrink-0 text-indigo-400" />
          : <Sun size={11} className="shrink-0 text-amber-400" />;
        const primaryLabel = isNight ? "Nuit · Ln" : "Jour · Lden";
        const secondaryLevel = isNight ? day_level : night_level;
        const secondaryIcon = isNight
          ? <Sun size={11} className="shrink-0 text-amber-400" />
          : <Moon size={11} className="shrink-0 text-indigo-400" />;
        const secondaryLabel = isNight ? "Jour · Lden" : "Nuit · Ln";
        return (
          <div className="mb-4 flex gap-4">
            {primaryLevel != null && (
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                {primaryIcon}
                <span>{primaryLabel} : <strong className="text-white/80">{primaryLevel} dB</strong></span>
              </div>
            )}
            {secondaryLevel != null && (
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                {secondaryIcon}
                <span>{secondaryLabel} : <span className="text-white/40">{secondaryLevel} dB</span></span>
              </div>
            )}
          </div>
        );
      })()}

      {(nearestSensor || activeChantiers.length > 0 || recentCount > 0) && (
        <div className="mb-4 space-y-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          {nearestSensor && nearestSensor.measurement.leq != null && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sensorColor }} />
              <span>
                Capteur à {nearestSensor.distanceM < 1000
                  ? `${Math.round(nearestSensor.distanceM)} m`
                  : `${(nearestSensor.distanceM / 1000).toFixed(1)} km`}{" "}
                · <strong className="text-white/80">{nearestSensor.measurement.leq} dB</strong> {sensorLabel}
              </span>
            </div>
          )}
          {activeChantiers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Construction size={12} className="shrink-0 text-amber-400" />
              <span>
                {activeChantiers.length === 1
                  ? "1 chantier actif"
                  : `${activeChantiers.length} chantiers actifs`}{" "}
                à proximité
              </span>
            </div>
          )}
          {recentCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Volume2 size={12} className="shrink-0 text-rose-400" />
              <span>
                {recentCount === 1
                  ? "1 signalement bruit"
                  : `${recentCount} signalements bruit`}{" "}
                dans la dernière heure
              </span>
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
        type="button"
        onClick={handleReport}
        disabled={!canReport}
        className={`mb-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-colors ${
          reported
            ? "border border-rose-500/30 bg-rose-500/15 text-rose-400"
            : canReport
            ? "border border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            : "cursor-default border border-white/5 bg-transparent text-white/20"
        }`}
        aria-label="Signaler un bruit inhabituel dans cette zone"
      >
        <Volume2 size={13} />
        {reported ? "Signalement enregistré" : canReport ? "Signaler bruit inhabituel" : "Déjà signalé récemment"}
      </button>

      <button
        onClick={handleShare}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-colors"
        style={{
          backgroundColor: copied ? "rgba(34,197,94,0.15)" : "rgba(13,148,136,0.12)",
          color: copied ? "#4ade80" : "#2DD4BF",
          border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(13,148,136,0.25)",
        }}
        onMouseEnter={(e) => { if (!copied) e.currentTarget.style.backgroundColor = "rgba(13,148,136,0.22)"; }}
        onMouseLeave={(e) => { if (!copied) e.currentTarget.style.backgroundColor = "rgba(13,148,136,0.12)"; }}
      >
        {copied ? <Check size={13} /> : <Share2 size={13} />}
        {copied ? "Copié !" : "Partager ce score"}
      </button>
    </div>
  );
}
