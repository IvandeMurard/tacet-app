"use client";

import useSWR from "swr";

const PHOTON_URL = "https://photon.komoot.io/api/";
const PARIS_BBOX = "2.224,48.815,2.470,48.902";

export interface PhotonFeature {
  type: "feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  };
}

export interface PhotonResult {
  features: PhotonFeature[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<PhotonResult>);

export function usePhotonSearch(query: string | null, _debounceMs = 350) {
  const searchParams = new URLSearchParams({
    q: query ?? "",
    bbox: PARIS_BBOX,
    limit: "5",
    lang: "fr",
  });
  const key = query && query.trim().length >= 2 ? `${PHOTON_URL}?${searchParams.toString()}` : null;

  return useSWR<PhotonResult>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: _debounceMs,
  });
}

export function photonFeatureToDisplay(f: PhotonFeature): string {
  const p = f.properties;
  const parts = [p.street ?? p.name ?? "", p.housenumber, p.district ?? p.city ?? p.state].filter(Boolean);
  return parts.join(", ");
}

export function photonFeatureToCoords(f: PhotonFeature): [number, number] {
  return f.geometry.coordinates;
}
