import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm"
      role="contentinfo"
      aria-label="Pied de page"
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-white/60">
        <Link
          href="/mentions-legales"
          className="transition-colors hover:text-white/90"
        >
          Mentions légales
        </Link>
        <Link
          href="/confidentialite"
          className="transition-colors hover:text-white/90"
        >
          Politique de confidentialité
        </Link>
        <Link
          href="/accessible"
          className="transition-colors hover:text-white/90"
        >
          Vue accessible
        </Link>
        <Link
          href="/contact"
          className="transition-colors hover:text-white/90"
        >
          Nous contacter
        </Link>
      </div>
    </footer>
  );
}
