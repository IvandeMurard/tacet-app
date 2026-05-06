import { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getNoiseCategory, getSereniteScore } from "@/constants/colors";
import { useChantiers } from "@/hooks/useChantiers";
import { useEnrichment } from "@/hooks/useEnrichment";
import { useRumeur } from "@/hooks/useRumeur";
import {
  isChantierExpired,
  isNightTime,
  SENSOR_EVENING_START_HOUR,
} from "@/lib/time-context";
import { useMapStore } from "@/store/mapStore";
import type { EnrichmentRequest } from "@/types/enrichment";
import { SerenityBar } from "./SerenityBar";
import { TierBadge } from "./TierBadge";

const SHEET_HEIGHT = 440;
const DISMISS_THRESHOLD = 100;

function arLabel(c_ar: number): string {
  return c_ar === 1 ? "1er" : `${c_ar}e`;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#4ade80";
  if (score >= 45) return "#fbbf24";
  if (score >= 15) return "#f87171";
  return "#c084fc";
}

export function ZoneSheet() {
  const { selectedZone, clearSelectedZone } = useMapStore();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const isVisible = !!selectedZone;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isVisible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 14,
    }).start();
  }, [isVisible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > 8 && gs.dy > 0,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.8) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => clearSelectedZone());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 120,
            friction: 14,
          }).start();
        }
      },
    })
  ).current;

  const { data: rumeurData } = useRumeur(isVisible);
  const { data: chantiersData } = useChantiers(isVisible);

  const now = new Date();
  const isNight = isNightTime(now);

  const enrichmentRequest: EnrichmentRequest | null = selectedZone
    ? {
        zone_code: selectedZone.code_iris,
        zone_name: selectedZone.name,
        arrondissement: selectedZone.c_ar,
        noise_level: selectedZone.noise_level,
        day_level: selectedZone.day_level ?? null,
        night_level: selectedZone.night_level ?? null,
        score_serenite: getSereniteScore(selectedZone.noise_level),
        current_iso_timestamp: now.toISOString(),
      }
    : null;

  const { enrichment } = useEnrichment(enrichmentRequest);

  if (!selectedZone) return null;

  const category = getNoiseCategory(selectedZone.noise_level);
  const score = getSereniteScore(selectedZone.noise_level);
  const color = getScoreColor(score);
  const label = arLabel(selectedZone.c_ar);
  const primaryLevel = isNight ? selectedZone.night_level : selectedZone.day_level;
  const secondaryLevel = isNight ? selectedZone.day_level : selectedZone.night_level;

  // Nearest sensor — rough proximity sort (accurate proximity via centroids is Story 7.x)
  const nearestSensor = rumeurData?.data?.measurements
    .filter((m) => m.leq != null)
    .sort((a, b) => {
      const da =
        Math.abs((a.lat ?? 48.8566) - 48.8566) +
        Math.abs((a.lon ?? 2.3522) - 2.3522);
      const db =
        Math.abs((b.lat ?? 48.8566) - 48.8566) +
        Math.abs((b.lon ?? 2.3522) - 2.3522);
      return da - db;
    })[0];

  const activeChantiers = (chantiersData?.data ?? []).filter(
    (c) => !isChantierExpired(c.date_fin, now)
  );

  const showSensor =
    nearestSensor?.leq != null &&
    (isNight || now.getHours() >= SENSOR_EVENING_START_HOUR);

  return (
    <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
      {/* Drag handle */}
      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={styles.handle} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.meta}>
              {label} arrondissement · IRIS {selectedZone.code_iris}
            </Text>
            <Text style={styles.zoneName} numberOfLines={1}>
              {selectedZone.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={clearSelectedZone}
            style={styles.closeBtn}
            hitSlop={8}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tier badge */}
        {category && (
          <View style={styles.badgeRow}>
            <TierBadge label={category.label} color={category.color} />
          </View>
        )}

        {/* Serenity score */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Score de Sérénité</Text>
            <Text style={[styles.scoreValue, { color }]}>
              {score}
              <Text style={styles.scoreMax}>/100</Text>
            </Text>
          </View>
          <SerenityBar score={score} color={color} />
        </View>

        {/* Enrichment summary or fallback description */}
        {enrichment?.confidence === "high" && enrichment.summary ? (
          <Text style={styles.enrichment}>{enrichment.summary}</Text>
        ) : selectedZone.description ? (
          <Text style={styles.description}>{selectedZone.description}</Text>
        ) : null}

        {/* Day / Night dB levels */}
        {(primaryLevel != null || secondaryLevel != null) && (
          <View style={styles.levelsRow}>
            {primaryLevel != null && (
              <View style={styles.levelItem}>
                <Text style={styles.levelIcon}>{isNight ? "🌙" : "☀️"}</Text>
                <Text style={styles.levelText}>
                  {isNight ? "Nuit · Ln" : "Jour · Lden"}{" "}
                  <Text style={styles.levelValue}>{primaryLevel} dB</Text>
                </Text>
              </View>
            )}
            {secondaryLevel != null && (
              <View style={styles.levelItem}>
                <Text style={styles.levelIcon}>{isNight ? "☀️" : "🌙"}</Text>
                <Text style={styles.levelText}>
                  {isNight ? "Jour · Lden" : "Nuit · Ln"}{" "}
                  <Text style={styles.levelValue}>{secondaryLevel} dB</Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {/* RUMEUR sensor */}
        {showSensor && (
          <View style={styles.dataRow}>
            <Text style={styles.dataIcon}>📡</Text>
            <Text style={styles.dataText}>
              Capteur Bruitparif{" "}
              <Text style={styles.dataValue}>
                {nearestSensor!.leq!.toFixed(1)} dB
              </Text>
            </Text>
          </View>
        )}

        {/* Active chantiers */}
        {activeChantiers.length > 0 && (
          <View style={styles.dataRow}>
            <Text style={styles.dataIcon}>🏗</Text>
            <Text style={styles.dataText}>
              {activeChantiers.length} chantier
              {activeChantiers.length > 1 ? "s" : ""} actif
              {activeChantiers.length > 1 ? "s" : ""} à Paris
            </Text>
          </View>
        )}

        {/* Data provenance */}
        <Text style={styles.provenance}>Bruitparif · PPBE 2024</Text>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "rgba(10,10,10,0.93)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 50,
  },
  handleArea: { alignItems: "center", paddingTop: 12, paddingBottom: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  headerText: { flex: 1, marginRight: 12 },
  meta: { fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 },
  zoneName: { fontSize: 16, fontWeight: "600", color: "#fff" },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 14, color: "rgba(255,255,255,0.4)" },
  badgeRow: { marginBottom: 14 },
  scoreSection: { marginBottom: 14 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 },
  scoreLabel: { fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5 },
  scoreValue: { fontSize: 44, fontWeight: "700", lineHeight: 48 },
  scoreMax: { fontSize: 14, fontWeight: "400", color: "rgba(255,255,255,0.3)" },
  enrichment: { fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.7)", marginBottom: 14 },
  description: { fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.5)", marginBottom: 14 },
  levelsRow: { flexDirection: "row", gap: 16, marginBottom: 12 },
  levelItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  levelIcon: { fontSize: 11 },
  levelText: { fontSize: 12, color: "rgba(255,255,255,0.55)" },
  levelValue: { fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  dataRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  dataIcon: { fontSize: 13 },
  dataText: { fontSize: 12, color: "rgba(255,255,255,0.55)" },
  dataValue: { fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  provenance: { fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 },
});
