import dynamic from "next/dynamic";
import Link from "next/link";
import { Legend } from "@/components/Legend";
import { BRAND_COLOR } from "@/lib/noise-categories";

const Map = dynamic(() => import("@/components/Map").then((m) => m.Map), {
  ssr: false,
});

// Navigation flottante bottom-center — ne conflicte pas avec SearchBar (top)
// ni Legend (bottom-left) ni IrisPopup (bottom-center, z-30 > z-20 nav)
function AppNav() {
  return (
    <nav
      className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/15 bg-black/65 px-1 py-1 shadow-xl backdrop-blur-xl"
      aria-label="Navigation Tacet"
    >
      {/* Marque */}
      <Link
        href="/"
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold tracking-tight transition-colors hover:bg-white/10"
        style={{ color: BRAND_COLOR }}
        aria-label="Tacet — accueil carte"
      >
        Tacet
      </Link>

      <span className="h-3.5 w-px bg-white/15" aria-hidden />

      {/* Baromètre */}
      <Link
        href="/barometre"
        className="rounded-xl px-3 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/10 hover:text-white"
      >
        Baromètre
      </Link>

      {/* Élections */}
      <Link
        href="/elections"
        className="rounded-xl px-3 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/10 hover:text-white"
      >
        Élections 2026
      </Link>
    </nav>
  );
}

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Map />
      <Legend />
      <AppNav />
    </main>
  );
}
