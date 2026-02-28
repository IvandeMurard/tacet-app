"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MapComponent, {
  Source,
  Layer,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { FillLayer, ExpressionSpecification, MapLayerMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PARIS_CENTER, DEFAULT_ZOOM, NOISE_CATEGORIES } from "@/lib/noise-categories";
import { IrisPopup } from "@/components/IrisPopup";
import type { IrisProperties } from "@/components/IrisPopup";
import { SearchBar } from "@/components/SearchBar";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const GEOJSON_URL = "/data/paris-noise-iris.geojson";

// Choroplèthe : fill-color depuis NOISE_CATEGORIES — source de vérité unique
// Évite la duplication des hex entre Map.tsx et noise-categories.ts (Story 1.1)
const colorExpression = [
  "match",
  ["get", "noise_level"],
  ...NOISE_CATEGORIES.flatMap((cat) => [cat.level, cat.color]),
  "#666666", // fallback zones sans données
] as ExpressionSpecification;

const fillPaint: FillLayer["paint"] = {
  "fill-color": colorExpression,
  "fill-opacity": 0.7,
  "fill-outline-color": "rgba(255,255,255,0.15)",
};

export function Map() {
  const mapRef = useRef<MapRef>(null);
  // Cible du fly-to depuis la SearchBar (via ref pour éviter stale closures)
  const flyTargetRef = useRef<[number, number] | null>(null);

  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperties, setSelectedProperties] = useState<IrisProperties | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => {
        setGeojson(data);
        setIsLoading(false);
      })
      .catch(() => {
        setGeojson(null);
        setIsLoading(false);
      });
  }, []);

  // ── Clic carte : ouvre l'IrisPopup pour la zone IRIS sélectionnée ────────
  const handleClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (feature?.properties) {
      setSelectedProperties(feature.properties as IrisProperties);
    } else {
      setSelectedProperties(null);
    }
  }, []);

  // ── Curseur pointer sur les zones IRIS, flèche ailleurs ──────────────────
  const handleMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const canvas = mapRef.current?.getCanvas();
    if (!canvas) return;
    const features = mapRef.current?.queryRenderedFeatures(event.point, {
      layers: ["iris-fill"],
    });
    canvas.style.cursor = features && features.length > 0 ? "pointer" : "";
  }, []);

  // ── SearchBar : fly-to après sélection d'adresse ─────────────────────────
  const handleAddressSelect = useCallback((lngLat: [number, number]) => {
    flyTargetRef.current = lngLat;
    mapRef.current?.flyTo({ center: lngLat, zoom: 15, duration: 1200 });
  }, []);

  // ── moveend : après le fly-to, interroge la zone IRIS sous le point ───────
  const handleMoveEnd = useCallback(() => {
    if (!flyTargetRef.current || !mapRef.current) return;
    const lngLat = flyTargetRef.current;
    flyTargetRef.current = null;

    const pixel = mapRef.current.project(lngLat);
    const features = mapRef.current.queryRenderedFeatures(pixel, {
      layers: ["iris-fill"],
    });
    if (features.length > 0) {
      setSelectedProperties(features[0].properties as IrisProperties);
    }
  }, []);

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "pk.ton_token_ici") {
    return (
      <div className="grid h-full min-h-[400px] place-items-center rounded-lg border bg-muted/50 p-4 text-muted-foreground">
        Configure <code className="rounded bg-muted px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code> dans{" "}
        <code className="rounded bg-muted px-1">.env.local</code>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white mx-auto" />
            <p className="text-sm text-white/80">Chargement de la carte…</p>
          </div>
        </div>
      )}

      {/* SearchBar en overlay top-center (TAC-10) */}
      <SearchBar onAddressSelect={handleAddressSelect} />

      <MapComponent
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: PARIS_CENTER[0],
          latitude: PARIS_CENTER[1],
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        maxBounds={[
          [2.15, 48.75],
          [2.55, 48.95],
        ]}
        dragRotate={false}
        touchPitch={false}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["iris-fill"]}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMoveEnd={handleMoveEnd}
      >
        {geojson && (
          <Source id="iris" type="geojson" data={geojson}>
            {/* Couche choroplèthe principale */}
            <Layer id="iris-fill" type="fill" paint={fillPaint} />

            {/* Contour blanc sur la zone IRIS sélectionnée */}
            {selectedProperties && (
              <Layer
                id="iris-selected"
                type="line"
                paint={{
                  "line-color": "rgba(255,255,255,0.9)",
                  "line-width": 2,
                }}
                filter={["==", ["get", "code_iris"], selectedProperties.code_iris]}
              />
            )}
          </Source>
        )}

        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
      </MapComponent>

      {/* Popup IrisPopup (TAC-9 + TAC-15) */}
      {selectedProperties && (
        <IrisPopup
          properties={selectedProperties}
          onClose={() => setSelectedProperties(null)}
        />
      )}
    </div>
  );
}
