import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_COLOR, getSereniteScoreFromDb, getNoiseCategoryFromDb, arLabel } from "@/lib/noise-categories";

export const metadata: Metadata = {
  title: "Élections 2026 & Bruit à Paris — Tacet",
  description:
    "Les candidats aux élections municipales de mars 2026 parlent de bruit. " +
    "Voici les données réelles : classement des 20 arrondissements par niveau sonore Lden. Bruitparif 2024.",
  openGraph: {
    title: "Élections 2026 : quel arrondissement souffre le plus du bruit ?",
    description:
      "Le 8e arrondissement de Paris est le plus bruyant (71 dB Lden). Le 16e est le plus calme (61 dB). " +
      "Données Bruitparif 2024 — avant les promesses.",
    type: "article",
  },
};

// Données Bruitparif 2024 — statiques (mises à jour à chaque nouvelle cartographie)
const RANKING = [
  { c_ar: 16, lden_db: 61 },
  { c_ar: 14, lden_db: 62 },
  { c_ar: 13, lden_db: 63 },
  { c_ar: 15, lden_db: 63 },
  { c_ar: 20, lden_db: 63 },
  { c_ar: 5,  lden_db: 64 },
  { c_ar: 12, lden_db: 64 },
  { c_ar: 19, lden_db: 64 },
  { c_ar: 3,  lden_db: 65 },
  { c_ar: 6,  lden_db: 65 },
  { c_ar: 17, lden_db: 65 },
  { c_ar: 4,  lden_db: 66 },
  { c_ar: 7,  lden_db: 66 },
  { c_ar: 2,  lden_db: 67 },
  { c_ar: 11, lden_db: 67 },
  { c_ar: 18, lden_db: 67 },
  { c_ar: 1,  lden_db: 68 },
  { c_ar: 10, lden_db: 68 },
  { c_ar: 9,  lden_db: 69 },
  { c_ar: 8,  lden_db: 71 },
];

const TOP5 = RANKING.slice(0, 5);
const BOTTOM5 = RANKING.slice(-5).reverse();

function ArrCard({
  c_ar,
  lden_db,
  rank,
}: {
  c_ar: number;
  lden_db: number;
  rank: number;
}) {
  const score = getSereniteScoreFromDb(lden_db);
  const category = getNoiseCategoryFromDb(lden_db);
  const label = arLabel(c_ar);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-4 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-5 text-xs text-white/30 tabular-nums shrink-0">{rank}</span>
        <span className="text-sm font-medium text-white">{label} arr.</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-bold tabular-nums" style={{ color: category.color }}>
          {score}
          <span className="text-[10px] font-normal text-white/30">/100</span>
        </span>
        <span className="text-xs text-white/35 tabular-nums w-12 text-right">{lden_db} dB</span>
      </div>
    </div>
  );
}

export default function ElectionsPage() {
  const quietestScore = getSereniteScoreFromDb(RANKING[0].lden_db);
  const noisiest = RANKING[RANKING.length - 1];
  const noisiestScore = getSereniteScoreFromDb(noisiest.lden_db);
  const noisiestCategory = getNoiseCategoryFromDb(noisiest.lden_db);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Header sticky */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="text-sm text-white/50 transition-colors hover:text-white" aria-label="Retour à la carte">
            ← Carte
          </Link>
          <span className="text-sm font-bold tracking-tight" style={{ color: BRAND_COLOR }}>Tacet</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Hero */}
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-widest text-white/30">
            Élections municipales · Mars 2026
          </p>
          <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">
            Les candidats parlent de bruit.
            <br />
            <span className="text-white/50">Voici les données.</span>
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-xl">
            Le bruit est classé parmi les premières nuisances urbaines par les Parisiens.
            Certains candidats municipaux s&apos;engagent à le réduire. Avant les promesses,
            les données Bruitparif permettent de mesurer la réalité.
          </p>
        </div>

        {/* Chiffre-clé */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-green-500/20 bg-green-500/[0.05] px-5 py-5">
            <p className="mb-1 text-xs text-white/40 uppercase tracking-widest">Plus calme</p>
            <p className="text-3xl font-bold text-green-400">{arLabel(RANKING[0].c_ar)}</p>
            <p className="mt-1 text-sm text-white/60">
              {RANKING[0].lden_db} dB Lden · Score {quietestScore}/100
            </p>
          </div>
          <div
            className="rounded-xl border px-5 py-5"
            style={{
              borderColor: `${noisiestCategory.color}33`,
              backgroundColor: `${noisiestCategory.color}08`,
            }}
          >
            <p className="mb-1 text-xs text-white/40 uppercase tracking-widest">Plus bruyant</p>
            <p className="text-3xl font-bold" style={{ color: noisiestCategory.color }}>
              {arLabel(noisiest.c_ar)}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {noisiest.lden_db} dB Lden · Score {noisiestScore}/100
            </p>
            <p className="mt-1 text-xs" style={{ color: noisiestCategory.color }}>
              Seul arrondissement classé &quot;{noisiestCategory.label}&quot;
            </p>
          </div>
        </div>

        {/* Classements */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Top 5 calme */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-green-400 uppercase tracking-wide">
              🟢 5 arrondissements les plus calmes
            </h2>
            <div className="space-y-1.5">
              {TOP5.map((arr, i) => (
                <ArrCard key={arr.c_ar} c_ar={arr.c_ar} lden_db={arr.lden_db} rank={i + 1} />
              ))}
            </div>
          </div>

          {/* Top 5 bruyant */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-red-400 uppercase tracking-wide">
              🔴 5 arrondissements les plus bruyants
            </h2>
            <div className="space-y-1.5">
              {BOTTOM5.map((arr, i) => (
                <ArrCard key={arr.c_ar} c_ar={arr.c_ar} lden_db={arr.lden_db} rank={20 - i} />
              ))}
            </div>
          </div>
        </div>

        {/* Contexte éditorial */}
        <div className="mb-10 space-y-5">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-5 py-5">
            <h2 className="mb-3 text-base font-semibold text-white">Que mesurent ces données ?</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Le <strong className="text-white/80">Lden (Level Day Evening Night)</strong> est
              l&apos;indicateur européen d&apos;exposition sonore pondéré selon les heures de la journée.
              Il est produit par <strong className="text-white/80">Bruitparif</strong>, l&apos;observatoire
              du bruit en Île-de-France, à partir des données de la cartographie stratégique du bruit 2024.
            </p>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Ces données couvrent les <strong className="text-white/80">992 zones IRIS</strong> de Paris —
              un niveau de précision bien supérieur au découpage par arrondissement. Chaque zone peut
              être explorée individuellement sur la carte interactive Tacet.
            </p>
          </div>

          <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-5 py-5">
            <h2 className="mb-3 text-base font-semibold text-amber-200">Bruit et campagnes 2026</h2>
            <p className="text-sm text-amber-100/60 leading-relaxed">
              La pollution sonore est reconnue comme un enjeu de santé publique majeur. Des études
              épidémiologiques établissent un lien entre l&apos;exposition chronique au bruit et des
              pathologies cardiovasculaires, des troubles du sommeil et des impacts cognitifs,
              notamment chez l&apos;enfant.
            </p>
            <p className="mt-3 text-sm text-amber-100/60 leading-relaxed">
              À Paris, où le trafic routier représente la principale source de nuisance sonore,
              les politiques d&apos;aménagement urbain ont un impact direct et mesurable.
              Tacet permet de vérifier ces engagements avec des données officielles.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/barometre"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: "rgba(13,148,136,0.15)",
              color: "#2DD4BF",
              border: "1px solid rgba(13,148,136,0.3)",
            }}
          >
            Voir le classement complet →
          </Link>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Explorer la carte IRIS
          </Link>
        </div>

        {/* Source */}
        <div className="mt-10 border-t border-white/8 pt-6 text-xs text-white/25 space-y-1">
          <p>
            Source : <strong className="text-white/35">Bruitparif</strong> — Cartographie
            stratégique du bruit air-bruit Île-de-France 2024.
          </p>
          <p>
            Score de Sérénité Tacet : 50 dB → 100 pts · 75 dB → 0 pts · Indicateur positif de
            qualité sonore environnementale.
          </p>
        </div>
      </div>
    </main>
  );
}
