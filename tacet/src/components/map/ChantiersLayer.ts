import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";

const SOURCE_ID = "chantiers";
const LAYER_ID = "chantiers-circles";

interface ChantierRecord {
  geo_point_2d?: { lon: number; lat: number };
  adresse?: string;
  date_fin?: string;
  type_chantier?: string;
}

function toGeoJSON(records: ChantierRecord[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: records
      .filter((r) => r.geo_point_2d?.lon && r.geo_point_2d?.lat)
      .map((r, i) => ({
        type: "Feature" as const,
        id: i,
        geometry: {
          type: "Point" as const,
          coordinates: [r.geo_point_2d!.lon, r.geo_point_2d!.lat],
        },
        properties: {
          adresse: r.adresse ?? "",
          date_fin: r.date_fin ?? "",
          type_chantier: r.type_chantier ?? "",
        },
      })),
  };
}

export function addChantiersLayer(map: MapLibreMap, records: ChantierRecord[]) {
  const data = toGeoJSON(records);

  if (map.getSource(SOURCE_ID)) {
    (map.getSource(SOURCE_ID) as GeoJSONSource).setData(data);
    return;
  }

  map.addSource(SOURCE_ID, { type: "geojson", data });

  map.addLayer({
    id: LAYER_ID,
    type: "circle",
    source: SOURCE_ID,
    paint: {
      "circle-color": "#f59e0b",
      "circle-radius": 7,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.85,
    },
  });
}

export function removeChantiersLayer(map: MapLibreMap) {
  if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}
