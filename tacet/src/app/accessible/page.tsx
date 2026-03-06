import type { Metadata } from "next";
import Link from "next/link";
import { TextAlternativeView } from "@/components/tacet/TextAlternativeView";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Vue accessible — Données par zone",
  description: "Tableau des zones IRIS et scores de sérénité, alternative textuelle à la carte.",
};

export default function AccessiblePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 text-white" id="main-content">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold">
            Vue accessible — Données bruit par zone IRIS
          </h1>
          <p className="mb-6 text-sm text-white/70">
            Alternative textuelle à la carte : parcourez les zones au clavier (Tab, Entrée).
            Données identiques à la carte interactive.
          </p>
          <TextAlternativeView />
          <p className="mt-8">
            <Link href="/" className="text-sm text-teal-400 hover:underline">
              ← Retour à la carte
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
