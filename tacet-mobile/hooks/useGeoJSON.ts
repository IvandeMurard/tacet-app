import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";

const GEOJSON_FILENAME = "paris-noise-iris.geojson";
const GEOJSON_LOCAL_URI = FileSystem.documentDirectory + GEOJSON_FILENAME;
const GEOJSON_REMOTE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/data/${GEOJSON_FILENAME}`;

async function ensureGeoJSON(): Promise<FeatureCollection> {
  const info = await FileSystem.getInfoAsync(GEOJSON_LOCAL_URI);

  if (!info.exists) {
    // First launch — download from Vercel CDN and cache locally
    await FileSystem.downloadAsync(GEOJSON_REMOTE_URL, GEOJSON_LOCAL_URI);
  }

  const raw = await FileSystem.readAsStringAsync(GEOJSON_LOCAL_URI);
  return JSON.parse(raw) as FeatureCollection;
}

interface UseGeoJSONResult {
  geojson: FeatureCollection | null;
  loading: boolean;
  error: string | null;
}

export function useGeoJSON(): UseGeoJSONResult {
  const [geojson, setGeoJSON] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    ensureGeoJSON()
      .then((data) => {
        if (!cancelled) {
          setGeoJSON(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load GeoJSON";
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { geojson, loading, error };
}
