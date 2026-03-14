"use client";

import { useEffect, useRef, useCallback } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapContext } from "@/contexts/MapContext";
import { PARIS_CENTER, DEFAULT_ZOOM, NOISE_CATEGORIES } from "@/lib/noise-categories";
import { getBaseMapStyle } from "@/lib/map-style";
import { addChantiersLayer, removeChantiersLayer } from "@/components/map/ChantiersLayer";
import { addRumeurLayer, removeRumeurLayer } from "@/components/map/RumeurLayer";
import { useChantiersData } from "@/hooks/useChantiersData";
import { useRumeurData } from "@/hooks/useRumeurData";
import type { IrisProperties } from "@/types/iris";

const GEOJSON_URL = "/data/paris-noise-iris.geojson";
const CENTROIDS_URL = "/data/iris-centroids.geojson";

const colorExpression: unknown = [
  "match",
  ["get", "noise_level"],
  ...NOISE_CATEGORIES.flatMap((cat) => [cat.level, cat.color]),
  "#666666",
];

const NEIGHBORHOOD_ZOOM = 13;

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, setSelectedZone, selectedZone, activeLayers } = useMapContext();
  const chantiersEnabled = activeLayers.has("chantiers");
  const rumeurEnabled = activeLayers.has("rumeur");
  const { data: chantiersResponse } = useChantiersData(chantiersEnabled);
  const { data: rumeurResponse } = useRumeurData(rumeurEnabled);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const map = mapRef.current;
      if (!map) return;
      const dotFeatures = map.queryRenderedFeatures(e.point, {
        layers: ["score-dots-circles", "score-dots-cluster"],
      });
      if (dotFeatures.length > 0) {
        const f = dotFeatures[0];
        const props = f.properties as { cluster?: boolean; cluster_id?: number } | undefined;
        if (props?.cluster && typeof props.cluster_id === "number") {
          const source = map.getSource("iris-centroids") as maplibregl.GeoJSONSource;
          source.getClusterExpansionZoom(props.cluster_id).then((zoom) => {
            const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
            map.flyTo({ center: coords, zoom });
          }).catch(() => {});
          return;
        }
        if (props && !props.cluster) {
          setSelectedZone(props as unknown as IrisProperties);
          return;
        }
      }
      const fillFeatures = map.queryRenderedFeatures(e.point, { layers: ["iris-fill"] });
      if (fillFeatures.length > 0 && fillFeatures[0].properties) {
        setSelectedZone(fillFeatures[0].properties as unknown as IrisProperties);
      } else {
        setSelectedZone(null);
      }
    },
    [mapRef, setSelectedZone]
  );

  const handleMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!containerRef.current || !mapRef.current) return;
      const features = mapRef.current.queryRenderedFeatures(e.point, {
        layers: ["iris-fill", "score-dots-circles", "score-dots-cluster"],
      });
      containerRef.current.style.cursor = features.length > 0 ? "pointer" : "";
    },
    [mapRef]
  );

  const cleanupRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    cancelledRef.current = false;

    const initMap = async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      const { Protocol } = await import("pmtiles");

      const protocol = new Protocol();
      maplibregl.addProtocol("pmtiles", protocol.tile);

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style: getBaseMapStyle(),
        center: PARIS_CENTER,
        zoom: DEFAULT_ZOOM,
        maxBounds: [
          [2.15, 48.75],
          [2.55, 48.95],
        ],
        dragRotate: false,
      });

      map.addControl(new maplibregl.NavigationControl({}), "top-right");
      map.addControl(new maplibregl.FullscreenControl({}), "top-right");

      mapRef.current = map;

      const resizeObserver = new ResizeObserver(() => map.resize());
      if (containerRef.current) resizeObserver.observe(containerRef.current);

      map.on("click", handleClick);
      map.on("mousemove", handleMouseMove);

      const loadData = async () => {
        try {
          const [irisRes, centroidsRes] = await Promise.all([
            fetch(GEOJSON_URL),
            fetch(CENTROIDS_URL),
          ]);
          const [geojson, centroidsGeojson] = await Promise.all([
            irisRes.json(),
            centroidsRes.json(),
          ]);

          if (!map.getSource("iris")) {
            map.addSource("iris", { type: "geojson", data: geojson });
            map.addLayer({
              id: "iris-fill",
              type: "fill",
              source: "iris",
              paint: {
                "fill-color": colorExpression as string,
                "fill-opacity": 0.5,
                "fill-outline-color": "rgba(255,255,255,0.1)",
              },
            });
            map.addLayer({
              id: "zone-highlight-fill",
              type: "fill",
              source: "iris",
              paint: {
                "fill-color": "#ffffff",
                "fill-opacity": 0.03,
              },
              filter: ["==", ["get", "code_iris"], ""],
            });
            map.addLayer({
              id: "zone-highlight-line",
              type: "line",
              source: "iris",
              paint: {
                "line-color": "rgba(255,255,255,0.9)",
                "line-width": 2,
                "line-dasharray": [2, 1],
              },
              filter: ["==", ["get", "code_iris"], ""],
            });
          }

          if (!map.getSource("iris-centroids")) {
            map.addSource("iris-centroids", {
              type: "geojson",
              data: centroidsGeojson,
              cluster: true,
              clusterMaxZoom: NEIGHBORHOOD_ZOOM - 1,
              clusterRadius: 50,
            });
            map.addLayer({
              id: "score-dots-circles",
              type: "circle",
              source: "iris-centroids",
              filter: ["!=", "cluster", true],
              paint: {
                "circle-color": colorExpression as string,
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  13,
                  5,
                  16,
                  10,
                ],
                "circle-stroke-width": 1,
                "circle-stroke-color": "rgba(255,255,255,0.3)",
              },
            });
            map.addLayer({
              id: "score-dots-cluster",
              type: "circle",
              source: "iris-centroids",
              filter: ["==", "cluster", true],
              paint: {
                "circle-color": "#0D9488",
                "circle-radius": 20,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
              },
            });
            map.addLayer({
              id: "score-dots-cluster-count",
              type: "symbol",
              source: "iris-centroids",
              filter: ["==", "cluster", true],
              layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-size": 12,
              },
              paint: { "text-color": "#fff" },
            });
          }
        } catch {
          // calm degradation
        }
      };

      map.on("load", loadData);
      if (map.isStyleLoaded()) loadData();

      return () => {
        resizeObserver.disconnect();
        map.off("click", handleClick);
        map.off("mousemove", handleMouseMove);
        map.remove();
        mapRef.current = null;
        maplibregl.removeProtocol("pmtiles");
      };
    };

    initMap().then((fn) => {
      if (cancelledRef.current) fn();
      else cleanupRef.current = fn;
    });

    return () => {
      cancelledRef.current = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [handleClick, handleMouseMove, mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const code = selectedZone?.code_iris ?? "";
    if (map.getLayer("zone-highlight-line")) {
      map.setFilter("zone-highlight-line", ["==", ["get", "code_iris"], code]);
      map.setFilter("zone-highlight-fill", ["==", ["get", "code_iris"], code]);
    }
  }, [selectedZone, mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (chantiersEnabled && chantiersResponse?.data) {
      addChantiersLayer(map, chantiersResponse.data);
    } else {
      removeChantiersLayer(map);
    }
  }, [chantiersEnabled, chantiersResponse, mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const applyLayerState = () => {
      if (!map.isStyleLoaded()) return;
      if (rumeurEnabled && rumeurResponse?.data?.measurements) {
        addRumeurLayer(map, rumeurResponse.data.measurements);
      } else {
        removeRumeurLayer(map);
      }
    };

    if (!map.isStyleLoaded()) {
      const onLoad = () => {
        applyLayerState();
        map.off("load", onLoad);
      };
      map.on("load", onLoad);
      return () => { map.off("load", onLoad); };
    }

    applyLayerState();
  }, [rumeurEnabled, rumeurResponse, mapRef]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label="Carte du bruit à Paris par zone IRIS"
    />
  );
}
