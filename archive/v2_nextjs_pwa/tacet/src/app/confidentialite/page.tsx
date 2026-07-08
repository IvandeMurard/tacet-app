import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données Tacet.",
};

export default function ConfidentialitePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-2xl font-bold">Politique de confidentialité</h1>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Données traitées</h2>
            <p className="text-sm text-white/80">
              Tacet ne collecte pas de données personnelles identifiantes. Les seules données
              susceptibles d’être enregistrées côté infrastructure sont les logs techniques
              (adresses IP, user-agent) par la plateforme d’hébergement (Vercel), avec une
              rétention n’excédant pas 30 jours.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Recherche d’adresse</h2>
            <p className="text-sm text-white/80">
              Les requêtes de géocodage (recherche d’adresse) sont envoyées à des services
              tiers (Photon / Komoot ou, en version antérieure, Mapbox). Aucune adresse
              n’est stockée sur nos serveurs.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Cookies et traceurs</h2>
            <p className="text-sm text-white/80">
              L’application ne dépose pas de cookies à finalité publicitaire ou de suivi.
              Aucun script de mesure d’audience tiers n’est chargé en version actuelle.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Vos droits</h2>
            <p className="text-sm text-white/80">
              Pour toute question ou demande de suppression de données, vous pouvez nous
              contacter via la page <Link href="/contact" className="underline hover:text-white">Nous contacter</Link>.
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
