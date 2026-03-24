"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { IrisProperties } from "@/types/iris";

const PINNED_STORAGE_KEY = "tacet-pinned-zones";
const LAST_ZONE_STORAGE_KEY = "tacet-last-zone";
export const MAX_PINNED = 3;

function loadPinnedFromStorage(): IrisProperties[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(PINNED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IrisProperties[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_PINNED) : [];
  } catch (error) {
    console.error("Error loading pinned zones from storage:", error);
    return [];
  }
}

function savePinnedToStorage(zones: IrisProperties[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(zones.slice(0, MAX_PINNED)));
  } catch (error) {
    console.error("Error saving pinned zones to storage:", error);
  }
}

function loadLastZoneFromStorage(): IrisProperties | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_ZONE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IrisProperties;
  } catch (error) {
    console.error("Error loading last zone from storage:", error);
    return null;
  }
}

function saveLastZoneToStorage(zone: IrisProperties | null) {
  if (typeof window === "undefined") return;
  try {
    if (zone) {
      localStorage.setItem(LAST_ZONE_STORAGE_KEY, JSON.stringify(zone));
    }
  } catch (error) {
    console.error("Error saving last zone to storage:", error);
  }
}

export type LayerId = "chantiers" | "elections" | "rumeur";

export interface MapContextValue {
  selectedZone: IrisProperties | null;
  setSelectedZone: (zone: IrisProperties | null) => void;
  lastVisitedZone: IrisProperties | null;
  activeLayers: Set<LayerId>;
  toggleLayer: (id: LayerId) => void;
  pinnedZones: IrisProperties[];
  pinZone: (zone: IrisProperties) => void;
  unpinZone: (codeIris: string) => void;
  mapRef: MutableRefObject<MapLibreMap | null>;
  flyToAndSelectZone: (lngLat: [number, number]) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [selectedZone, setSelectedZoneRaw] = useState<IrisProperties | null>(null);
  const [lastVisitedZone] = useState<IrisProperties | null>(loadLastZoneFromStorage);
  const [activeLayers, setActiveLayers] = useState<Set<LayerId>>(new Set());
  const [pinnedZones, setPinnedZones] = useState<IrisProperties[]>(loadPinnedFromStorage);
  const mapRef = useRef<MapLibreMap | null>(null);

  const setSelectedZone = useCallback((zone: IrisProperties | null) => {
    setSelectedZoneRaw(zone);
    if (zone) saveLastZoneToStorage(zone);
  }, []);

  useEffect(() => {
    savePinnedToStorage(pinnedZones);
  }, [pinnedZones]);

  const pinZone = useCallback((zone: IrisProperties) => {
    setPinnedZones((prev) => {
      const exists = prev.some((z) => z.code_iris === zone.code_iris);
      if (exists) return prev;
      const next = [...prev, zone];
      return next.length > MAX_PINNED ? next.slice(-MAX_PINNED) : next;
    });
  }, []);

  const unpinZone = useCallback((codeIris: string) => {
    setPinnedZones((prev) => prev.filter((z) => z.code_iris !== codeIris));
  }, []);

  const toggleLayer = useCallback((id: LayerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const flyToAndSelectZone = useCallback((lngLat: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: lngLat, zoom: 15, duration: 1200 });
    const onMoveEnd = () => {
      map.off("moveend", onMoveEnd);
      const pixel = map.project(lngLat);
      const dotFeatures = map.queryRenderedFeatures(pixel, { layers: ["score-dots-circles"] });
      const fillFeatures = map.queryRenderedFeatures(pixel, { layers: ["iris-fill"] });
      const features = dotFeatures.length > 0 ? dotFeatures : fillFeatures;
      if (features.length > 0 && features[0].properties) {
        setSelectedZone(features[0].properties as unknown as IrisProperties);
      }
    };
    map.once("moveend", onMoveEnd);
  }, [setSelectedZone]);

  const value = useMemo<MapContextValue>(
    () => ({
      selectedZone,
      setSelectedZone,
      lastVisitedZone,
      activeLayers,
      toggleLayer,
      pinnedZones,
      pinZone,
      unpinZone,
      mapRef,
      flyToAndSelectZone,
    }),
    [selectedZone, setSelectedZone, lastVisitedZone, activeLayers, toggleLayer, pinnedZones, pinZone, unpinZone, flyToAndSelectZone]
  );

  return (
    <MapContext.Provider value={value}>{children}</MapContext.Provider>
  );
}

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapProvider");
  return ctx;
}
