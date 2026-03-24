import MapLibreGL from "@maplibre/maplibre-react-native";
import { StyleSheet, View } from "react-native";

import { PMTILES_STYLE } from "@/constants/mapStyle";

// Suppress default MapLibre telemetry opt-in prompt
MapLibreGL.setAccessToken(null);

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleJSON={JSON.stringify(PMTILES_STYLE)}
        logoEnabled={false}
        compassEnabled={false}
        attributionEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  map: { flex: 1 },
});
