import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales, attributions et méthodologie Tacet.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-2xl font-bold">Mentions légales</h1>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Éditeur</h2>
            <p className="text-sm text-white/80">
              Tacet — Carte interactive de la pollution sonore à Paris.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Données et attributions</h2>
            <p className="text-sm text-white/80">
              Les données de bruit sont issues de la cartographie air-bruit (Bruitparif,
              partenariat Airparif/Bruitparif), sous licence{" "}
              <a
                href="https://opendatacommons.org/licenses/odbl/1-0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                Open Database License (ODbL)
              </a>
              . Les contours IRIS proviennent de l’INSEE/IGN. Les données ouvertes de la Ville
              de Paris sont fournies sous licence{" "}
              <a
                href="https://www.etalab.gouv.fr/licence-ouverte-open-licence"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                Etalab (Licence Ouverte)
              </a>
              .
            </p>
          </section>

          <section id="methodologie" className="mb-6 scroll-mt-4">
            <h2 className="mb-2 text-lg font-semibold">Méthodologie — Score Sérénité</h2>
            <p className="text-sm text-white/80">
              Le Score Sérénité (0–100) est un indicateur indicatif dérivé des niveaux de bruit
              (Lden en dB). Il ne constitue pas une certification à usage réglementaire. La
              transformation Lden → Score est documentée dans la documentation technique du
              projet.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Hébergement</h2>
            <p className="text-sm text-white/80">
              L’application est hébergée sur Vercel.
            </p>
          </section>

          <p className="mt-8">
            <Link href="/" className="text-sm text-teal-400 hover:underline">
              ← Retour à la carte
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
