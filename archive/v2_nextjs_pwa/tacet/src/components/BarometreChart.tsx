"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, ExternalLink } from "lucide-react";
import { arLabel, getSereniteScoreFromDb, getNoiseCategoryFromDb } from "@/lib/noise-categories";

export interface ArrProperties {
  c_ar: number;
  nom: string;
  l_ar: string;
  lden_db: number;
  noise_category?: string;
}

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface BarometreChartProps {
  /** Pre-sorted arrondissement data (calme→bruyant) supplied by the Server Component parent. */
  arrondissements: ArrProperties[];
}

export function BarometreChart({ arrondissements }: BarometreChartProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text =
      "🏙 Baromètre du Silence — Paris 2026\n" +
      "🥇 Le 16e arrondissement est le plus calme de Paris (61 dB Lden)\n" +
      "⚠️ Le 8e est le plus bruyant (71 dB Lden)\n" +
      "→ Données Bruitparif | tacet.paris";

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Tacet — Baromètre du Silence", text, url: window.location.href });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (arrondissements.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/40">
        Données non disponibles — rechargez la page.
      </p>
    );
  }

  // Plage de scores pour normaliser la barre de progression
  const scores = arrondissements.map((a) => getSereniteScoreFromDb(a.lden_db));
  const maxScore = Math.max(...scores);

  return (
    <div>
      {/* Légende colonnes */}
      <div className="mb-2 flex items-center gap-3 px-4 text-[10px] uppercase tracking-widest text-white/25">
        <span className="w-7 shrink-0 text-center">#</span>
        <span className="flex-1">Arrondissement</span>
        <span className="w-28 text-right hidden sm:block">Score Sérénité</span>
        <span className="w-12 text-right">Lden</span>
      </div>

      {/* Classement */}
      <ol className="space-y-1.5" aria-label="Classement arrondissements par calme">
        {arrondissements.map((arr, index) => {
          const rank = index + 1;
          const score = getSereniteScoreFromDb(arr.lden_db);
          const category = getNoiseCategoryFromDb(arr.lden_db);
          const label = arLabel(arr.c_ar);
          const barWidth = maxScore > 0 ? (score / maxScore) * 100 : score;
          const isTop3 = rank <= 3;
          const isBottom3 = rank >= arrondissements.length - 2;

          return (
            <li
              key={arr.c_ar}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-white/5 ${
                isTop3
                  ? "border-green-500/20 bg-green-500/5"
                  : isBottom3
                  ? "border-red-500/15 bg-red-500/5"
                  : "border-white/8 bg-white/[0.03]"
              }`}
            >
              {/* Rang / médaille */}
              <span className="w-7 shrink-0 text-center text-sm">
                {MEDALS[rank] ?? (
                  <span
                    className={`font-bold tabular-nums ${
                      isTop3 ? "text-green-400" : isBottom3 ? "text-red-400" : "text-white/30"
                    }`}
                  >
                    {rank}
                  </span>
                )}
              </span>

              {/* Nom arrondissement */}
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-white">
                  {label} arr.
                </span>
              </div>

              {/* Barre de score + valeur */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Barre (visible sm+) */}
                <div className="hidden sm:block w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>

                {/* Score numérique */}
                <span className="w-14 text-right tabular-nums">
                  <span className="text-sm font-semibold" style={{ color: category.color }}>
                    {score}
                  </span>
                  <span className="text-[10px] text-white/30">/100</span>
                </span>

                {/* dB Lden */}
                <span className="w-12 text-right text-xs text-white/40 tabular-nums">
                  {arr.lden_db} dB
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors"
          style={{
            backgroundColor: "rgba(13,148,136,0.12)",
            color: "#2DD4BF",
            borderColor: "rgba(13,148,136,0.25)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(13,148,136,0.22)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(13,148,136,0.12)"; }}
        >
          <Share2 size={15} />
          {copied ? "Lien copié !" : "Partager ce classement"}
        </button>

        <Link
          href="/"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink size={15} />
          Explorer la carte IRIS
        </Link>
      </div>
    </div>
  );
}
