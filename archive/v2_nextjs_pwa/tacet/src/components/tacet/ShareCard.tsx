"use client";

import type { IrisProperties } from "@/types/iris";
import { getNoiseCategory, getSereniteScore, arLabel } from "@/lib/noise-categories";

interface ShareCardProps {
  properties: IrisProperties;
  className?: string;
}

/** Content suitable for screenshot or Web Share payload (zone name, score, tier). */
export function ShareCard({ properties, className = "" }: ShareCardProps) {
  const { name, c_ar, noise_level } = properties;
  const category = getNoiseCategory(noise_level);
  const score = getSereniteScore(noise_level);
  const label = arLabel(c_ar);

  return (
    <div
      className={`rounded-xl border border-white/15 bg-black/80 p-4 shadow-xl ${className}`}
      style={{ minWidth: 280 }}
    >
      <p className="text-[10px] uppercase tracking-widest text-white/40">
        {label} arr. · Tacet
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{name}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: category?.color }}
        >
          {score}
        </span>
        <span className="text-xs text-white/50">/100</span>
        {category && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `${category.color}22`,
              color: category.color,
            }}
          >
            {category.label}
          </span>
        )}
      </div>
      <p className="mt-2 text-[10px] text-white/30">Bruitparif · PPBE 2024</p>
    </div>
  );
}
