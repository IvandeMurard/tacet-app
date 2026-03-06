"use client";

import { useState, useEffect } from "react";
import { getNoiseCategory, getSereniteScore, arLabel } from "@/lib/noise-categories";
import type { IrisProperties } from "@/types/iris";

const GEOJSON_URL = "/data/paris-noise-iris.geojson";

export function TextAlternativeView() {
  const [zones, setZones] = useState<IrisProperties[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((geojson: GeoJSON.FeatureCollection) => {
        const props = (geojson.features ?? [])
          .map((f) => f.properties as IrisProperties)
          .filter(Boolean);
        setZones(props);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="py-8 text-center text-white/60" aria-busy="true">
        Chargement des zones…
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-8 text-center text-amber-200/80">
        Données momentanément indisponibles. Réessayez plus tard.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/15 bg-black/40">
      <table
        className="w-full text-left text-sm"
        role="table"
        aria-label="Zones IRIS et Score de Sérénité"
      >
        <thead>
          <tr className="border-b border-white/15">
            <th scope="col" className="px-4 py-3 font-semibold text-white/90">
              Zone / IRIS
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-white/90">
              Arrondissement
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-white/90">
              Score Sérénité
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-white/90">
              Niveau
            </th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => {
            const category = getNoiseCategory(zone.noise_level);
            const score = getSereniteScore(zone.noise_level);
            const label = arLabel(zone.c_ar);
            return (
              <tr
                key={zone.code_iris}
                className="border-b border-white/10 transition-colors hover:bg-white/5"
              >
                <td className="px-4 py-2 font-medium text-white">
                  {zone.name} <span className="text-white/50">({zone.code_iris})</span>
                </td>
                <td className="px-4 py-2 text-white/80">{label} arr.</td>
                <td className="px-4 py-2 tabular-nums text-white/90">{score}/100</td>
                <td className="px-4 py-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${category?.color}22`,
                      color: category?.color,
                    }}
                  >
                    {category?.label ?? "—"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
