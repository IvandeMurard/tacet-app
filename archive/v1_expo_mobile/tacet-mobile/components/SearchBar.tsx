import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PHOTON_URL = "https://photon.komoot.io/api/";

interface PhotonFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  properties: {
    name?: string;
    city?: string;
    country?: string;
    type?: string;
  };
}

interface SearchBarProps {
  onSelectLocation: (coords: [number, number], label: string) => void;
}

export function SearchBar({ onSelectLocation }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `${PHOTON_URL}?q=${encodeURIComponent(text)}&limit=5&lang=fr&bbox=2.2,48.8,2.5,49.0`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Photon: ${res.status}`);
        const json = (await res.json()) as { features: PhotonFeature[] };
        setResults(json.features ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    search(text);
  };

  const handleSelect = (feature: PhotonFeature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const label = [feature.properties.name, feature.properties.city]
      .filter(Boolean)
      .join(", ");
    setQuery(label);
    setResults([]);
    setFocused(false);
    onSelectLocation([lng, lat], label);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Chercher une adresse…"
          placeholderTextColor="rgba(255,255,255,0.3)"
          returnKeyType="search"
          clearButtonMode="never"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {loading && <ActivityIndicator size="small" color="#0D9488" style={styles.spinner} />}
        {!loading && query.length > 0 && (
          <TouchableOpacity onPress={handleClear} hitSlop={8}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {focused && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(_, i) => String(i)}
          style={styles.list}
          keyboardShouldPersistTaps="always"
          renderItem={({ item }) => {
            const label = [item.properties.name, item.properties.city]
              .filter(Boolean)
              .join(", ");
            return (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.resultText} numberOfLines={1}>
                  {label}
                </Text>
                {item.properties.type && (
                  <Text style={styles.resultType}>{item.properties.type}</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 56,
    left: 12,
    right: 12,
    zIndex: 40,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,10,10,0.88)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    padding: 0,
  },
  spinner: { marginLeft: 4 },
  clearBtn: { fontSize: 12, color: "rgba(255,255,255,0.4)", paddingLeft: 4 },
  list: {
    backgroundColor: "rgba(10,10,10,0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 4,
    maxHeight: 220,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  resultText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.85)" },
  resultType: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    marginLeft: 8,
    textTransform: "capitalize",
  },
});
