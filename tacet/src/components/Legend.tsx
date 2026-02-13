"use client";

import { NOISE_CATEGORIES, ACTIVE_LEVELS } from "@/lib/noise-categories";

export function Legend() {
  const activeCategories = NOISE_CATEGORIES.filter((cat) =>
    ACTIVE_LEVELS.includes(cat.level)
  );

  return (
    <div
      className="absolute bottom-4 left-4 z-10 max-w-[120px] rounded-xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md"
      role="list"
      aria-label="Légende niveaux de bruit"
    >
      <ul className="flex flex-col gap-1.5">
        {activeCategories.map((cat) => (
          <li
            key={cat.level}
            className="flex items-center gap-2 text-sm text-white"
            role="listitem"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: cat.color }}
              aria-hidden
            />
            <span>{cat.label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-white/60">
        Source : Cartographie air-bruit — Airparif et Bruitparif
      </p>
    </div>
  );
}
