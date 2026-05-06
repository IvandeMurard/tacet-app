import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Nous contacter",
  description: "Formulaire de contact et feedback Tacet.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 text-white">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-6 text-2xl font-bold">Nous contacter</h1>
          <p className="mb-6 text-sm text-white/80">
            Pour un retour sur les données de bruit, une suggestion ou une demande d’accès aux
            données (B2B), utilisez le formulaire ci-dessous. Vos données ne sont pas stockées
            sur nos serveurs et sont transmises par courriel de manière sécurisée (HTTPS).
          </p>
          <ContactForm />
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
