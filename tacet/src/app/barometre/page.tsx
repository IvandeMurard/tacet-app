import type { Metadata } from "next";
import Link from "next/link";
import { BarometreChart } from "@/components/BarometreChart";
import { BRAND_COLOR } from "@/lib/noise-categories";
import { DATA_YEAR } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Baromètre du Silence — Tacet Paris",
  description:
    `Classement des 20 arrondissements de Paris par niveau sonore. Données Lden Bruitparif ${DATA_YEAR}. Enjeu des élections municipales mars 2026.`,
  openGraph: {
    title: "Quel arrondissement de Paris est le plus calme ?",
    description:
      `Le 16e est le plus silencieux (61 dB Lden), le 8e le plus bruyant (71 dB). Données Bruitparif ${DATA_YEAR}.`,
    type: "website",
  },
};

export default function BarometrePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Header sticky */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-sm text-white/50 transition-colors hover:text-white"
            aria-label="Retour à la carte"
          >
            ← Carte
          </Link>
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: BRAND_COLOR }}
          >
            Tacet
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Titre principal */}
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-widest text-white/30">
            Données Bruitparif {DATA_YEAR}
          </p>
          <h1 className="mb-3 text-2xl font-bold leading-tight sm:text-3xl">
            Baromètre du Silence
          </h1>
          <p className="text-base text-white/60 leading-relaxed">
            Les 20 arrondissements de Paris classés du plus calme au plus bruyant,
            d&apos;après le niveau Lden (exposition sonore journalière).
          </p>
        </div>

        {/* Contexte élections */}
        <div className="mb-8 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4">
          <p className="text-sm leading-relaxed text-amber-100/80">
            <span className="mr-1.5">🗳</span>
            <strong className="text-amber-200">Élections municipales — 15 & 22 mars 2026</strong>
            <br />
            Le bruit figure parmi les premières préoccupations des Parisiens. Certains candidats
            s&apos;engagent à réduire les nuisances sonores. Ces données permettent de mesurer
            l&apos;état réel du territoire — avant les promesses.
          </p>
        </div>

        {/* Classement */}
        <BarometreChart />

        {/* Explication méthodologique */}
        <div className="mt-10 rounded-xl border border-white/8 bg-white/[0.03] px-5 py-4 text-xs text-white/30 space-y-2">
          <p>
            <strong className="text-white/50">Lden (Level Day Evening Night)</strong> — indicateur
            européen d&apos;exposition sonore pondéré selon les périodes de la journée.
            Unité : dB(A).
          </p>
          <p>
            <strong className="text-white/50">Score de Sérénité</strong> — indicateur Tacet :
            50 dB → 100 pts · 75 dB → 0 pts. Échelle positive : plus le score est élevé,
            plus l&apos;environnement sonore est favorable.
          </p>
          <p>
            Source : <strong className="text-white/40">Bruitparif</strong> — Cartographie
            stratégique du bruit air-bruit Île-de-France {DATA_YEAR}.
          </p>
        </div>
      </div>
    </main>
  );
}
