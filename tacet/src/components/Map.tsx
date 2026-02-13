"use client";

import { useState, useEffect } from "react";
import MapComponent, { Source, Layer, NavigationControl, FullscreenControl } from "react-map-gl/mapbox";
import type { FillLayer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { PARIS_CENTER, DEFAULT_ZOOM } from "@/lib/noise-categories";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const GEOJSON_URL = "/data/paris-noise-iris.geojson";

// Choroplèthe : fill-color selon noise_level (1, 2, 3)
const fillPaint: FillLayer["paint"] = {
  "fill-color": [
    "match",
    ["get", "noise_level"],
    1,
    "#4ade80",
    2,
    "#fbbf24",
    3,
    "#f87171",
    "#666666",
  ],
  "fill-opacity": 0.7,
  "fill-outline-color": "rgba(255,255,255,0.15)",
};

export function Map() {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <MapComponent
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
      >
        {geojson && (
          <Source id="iris" type="geojson" data={geojson}>
            <Layer id="iris-fill" type="fill" paint={fillPaint} />
          </Source>
        )}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
      </MapComponent>
    </div>
  );
}
