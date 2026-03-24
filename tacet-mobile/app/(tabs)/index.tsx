import MapLibreGL from "@maplibre/maplibre-react-native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { DEFAULT_ZOOM, NOISE_FILL_EXPRESSION, PARIS_CENTER } from "@/constants/colors";
import { PMTILES_STYLE } from "@/constants/mapStyle";
import { useGeoJSON } from "@/hooks/useGeoJSON";
import { type IrisProperties, useMapStore } from "@/store/mapStore";

// Suppress default MapLibre telemetry opt-in prompt
MapLibreGL.setAccessToken(null);

export default function MapScreen() {
  const { geojson, loading, error } = useGeoJSON();
  const { selectedZone, setSelectedZone, clearSelectedZone } = useMapStore();

  function handleZonePress(e: { features?: { properties?: Record<string, unknown> }[] }) {
    const feature = e.features?.[0];
    if (!feature?.properties) {
      clearSelectedZone();
      return;
    }
    const props = feature.properties as IrisProperties;
    // Toggle: tap same zone again to deselect
    if (selectedZone?.code_iris === props.code_iris) {
      clearSelectedZone();
    } else {
      setSelectedZone(props);
    }
  }

  if (loading) {
    return (
      <View style={styles.skeleton}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.skeletonText}>Chargement des zones acoustiques…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.skeleton}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleJSON={JSON.stringify(PMTILES_STYLE)}
        logoEnabled={false}
        compassEnabled={false}
        attributionEnabled={false}
        onPress={() => clearSelectedZone()}
      >
        <MapLibreGL.Camera
          defaultSettings={{
            centerCoordinate: PARIS_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
        />

        {geojson && (
          <MapLibreGL.ShapeSource
            id="iris-source"
            shape={geojson}
            onPress={handleZonePress}
          >
            {/* Fill layer — colour by noise_level */}
            <MapLibreGL.FillLayer
              id="iris-fill"
              style={{
                fillColor: NOISE_FILL_EXPRESSION,
                fillOpacity: 0.45,
              }}
            />
            {/* Highlight border for selected zone */}
            <MapLibreGL.LineLayer
              id="iris-selected"
              filter={[
                "==",
                ["get", "code_iris"],
                selectedZone?.code_iris ?? "",
              ]}
              style={{
                lineColor: "#ffffff",
                lineWidth: 2,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  map: { flex: 1 },
  skeleton: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  skeletonText: { color: "#aaa", fontSize: 14 },
  errorText: { color: "#f87171", fontSize: 14, textAlign: "center", paddingHorizontal: 24 },
});
