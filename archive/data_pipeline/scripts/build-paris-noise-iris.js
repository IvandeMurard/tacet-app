#!/usr/bin/env node
/**
 * Build data/paris-noise-iris.geojson from Bruitparif SIG (9 classes) and Paris IRIS contours.
 *
 * Usage: node scripts/build-paris-noise-iris.js
 *
 * Expects (optional):
 *   - data/sources/paris_iris.geojson — Contours IRIS Paris (code 75156)
 *   - data/sources/bruitparif_2024_9classes.geojson — Bruitparif air-bruit 9 classes
 *
 * Fallback: if Bruitparif is missing, assigns noise_level from arrondissement data
 * (tacet/public/data/paris-noise-arrondissements.geojson) using IRIS centroid.
 *
 * Output: data/paris-noise-iris.geojson with properties:
 *   noise_level (1-4), primary_sources, day_level, night_level, description, code_iris, name, c_ar
 */

const fs = require("fs");
const path = require("path");
const centroid = require("@turf/centroid").default;
const booleanPointInPolygon = require("@turf/boolean-point-in-polygon").default;

const ROOT = path.resolve(__dirname, "..");
const SOURCES_DIR = path.join(ROOT, "data", "sources");
const OUT_PATH = path.join(ROOT, "data", "paris-noise-iris.geojson");
const ARRONDISSEMENTS_PATH = path.join(
  ROOT,
  "tacet",
  "public",
  "data",
  "paris-noise-arrondissements.geojson"
);
const FIXTURE_IRIS_PATH = path.join(ROOT, "scripts", "fixtures", "paris_iris_minimal.geojson");

// Bruitparif 9-class (propriété "9") : 1er chiffre = bruit, 2e = air
// 1er chiffre 1 (11,12,13) → Calme, 2 (21,22,23) → Modéré, 3 (31,32,33) → Bruyant
// Niveau 4 (Très Bruyant) non alimenté par Bruitparif 9-classes — réservé pour futures sources
function bruitparifClassToNoiseLevel(code9) {
  if (code9 == null) return 2;
  const str = String(code9);
  const bruitDigit = parseInt(str[0], 10); // 1er chiffre : 1, 2 ou 3
  if (bruitDigit === 1) return 1;
  if (bruitDigit === 2) return 2;
  return 3; // 3 → Bruyant (pas 4)
}

// noise_category (from arrondissement file) -> noise_level 1-4
function categoryToNoiseLevel(cat) {
  const map = { Calme: 1, Modéré: 2, Bruyant: 3, "Très Bruyant": 4 };
  return map[cat] ?? 2;
}

const NOISE_LABELS = { 1: "Calme", 2: "Modéré", 3: "Bruyant", 4: "Très bruyant" };
const DESCRIPTIONS = {
  1: "Zone calme, idéale pour la détente.",
  2: "Bruit de fond urbain modéré.",
  3: "Zone passante, préférez les heures creuses.",
  4: "Très exposée au bruit (axes, gares).",
};

function getIrisFeatures(geojson) {
  const fc = geojson.type === "FeatureCollection" ? geojson : { type: "FeatureCollection", features: [geojson] };
  return fc.features || [];
}

function getPolygonFeatures(geojson) {
  const features = getIrisFeatures(geojson);
  const out = [];
  for (const f of features) {
    if (f.geometry.type === "Polygon") out.push(f);
    else if (f.geometry.type === "MultiPolygon") {
      for (const ring of f.geometry.coordinates) {
        out.push({
          type: "Feature",
          geometry: { type: "Polygon", coordinates: ring },
          properties: f.properties,
        });
      }
    }
  }
  return out;
}

function toPolygonFeature(feature) {
  const g = feature.geometry;
  if (g.type === "Polygon")
    return { type: "Feature", geometry: g, properties: feature.properties || {} };
  if (g.type === "MultiPolygon" && g.coordinates.length > 0)
    return {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: g.coordinates[0] },
      properties: feature.properties || {},
    };
  return null;
}

function bboxFromPolygon(coords) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const ring of coords) {
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return [minX, minY, maxX, maxY];
}

function buildBruitRtree(bruitPolygons, Rbush) {
  const tree = new Rbush();
  const items = bruitPolygons.map((bf) => {
    const bp = toPolygonFeature(bf);
    if (!bp) return null;
    const [minX, minY, maxX, maxY] = bboxFromPolygon(bp.geometry.coordinates);
    return { minX, minY, maxX, maxY, bf };
  }).filter(Boolean);
  tree.load(items);
  return tree;
}

function spatialJoinDominantBruit(irisFeature, bruitTreeOrList, classProp) {
  const classPropName = classProp || "code_9";
  const cen = centroid(irisFeature);
  const [minX, minY, maxX, maxY] = [
    cen.geometry.coordinates[0] - 0.001,
    cen.geometry.coordinates[1] - 0.001,
    cen.geometry.coordinates[0] + 0.001,
    cen.geometry.coordinates[1] + 0.001,
  ];
  const rawSearch = Array.isArray(bruitTreeOrList) ? [] : bruitTreeOrList.search({ minX, minY, maxX, maxY });
  const candidates = Array.isArray(bruitTreeOrList)
    ? bruitTreeOrList
    : rawSearch.map((n) => n.bf);
  for (const bf of candidates) {
    const bp = toPolygonFeature(bf);
    if (!bp) continue;
    try {
      if (booleanPointInPolygon(cen, bp)) {
        const code = bf.properties[classPropName] ?? bf.properties.classe ?? bf.properties.code_9 ?? bf.properties["9"];
        return bruitparifClassToNoiseLevel(code);
      }
    } catch (_) {}
  }
  return null;
}

function arrondissementForPoint(pointFeature, arrondissementFeatures) {
  for (const ar of arrondissementFeatures) {
    const poly = toPolygonFeature(ar);
    if (poly && booleanPointInPolygon(pointFeature, poly)) return ar.properties;
  }
  return null;
}

function getIrisArrondissementCode(properties) {
  if (!properties) return null;
  const code = properties.DCOMIRIS || properties.CODE_IRIS || properties.code_iris || properties.dcomiris;
  if (code) {
    const s = String(code);
    if (s.length >= 5) return s.slice(0, 5); // 75101..75120
  }
  return properties.DEPCOM || properties.code_insee;
}

function buildFromBruitparifAndIris(irisGeo, bruitGeo, classProp, Rbush, arrGeo) {
  const irisFeatures = getIrisFeatures(irisGeo);
  const bruitPolygons = getPolygonFeatures(bruitGeo);
  const bruitTree = buildBruitRtree(bruitPolygons, Rbush);
  const arFeatures = arrGeo ? getIrisFeatures(arrGeo) : [];
  const out = [];
  for (const iris of irisFeatures) {
    let noiseLevel = spatialJoinDominantBruit(iris, bruitTree, classProp);
    let sourceType = "bruitparif";
    if (noiseLevel == null && arFeatures.length > 0) {
      const cen = centroid(iris);
      const arProps = arrondissementForPoint(cen, arFeatures);
      noiseLevel = arProps ? categoryToNoiseLevel(arProps.noise_category) : 2;
      sourceType = "arrondissement_fallback";
    }
    if (noiseLevel == null) continue;
    const props = iris.properties || {};
    const codeIris = props.CODE_IRIS || props.DCOMIRIS || props.code_iris || props.id || "";
    out.push({
      type: "Feature",
      geometry: iris.geometry,
      properties: {
        code_iris: codeIris,
        name: props.NOM_IRIS || props.nom_iris || props.name || `IRIS ${codeIris}`,
        c_ar: props.c_ar ?? (getIrisArrondissementCode(props) ? parseInt(String(getIrisArrondissementCode(props)).slice(-2), 10) : null),
        noise_level: noiseLevel,
        source_type: sourceType,
        primary_sources: ["Circulation"],
        day_level: noiseLevel,
        night_level: noiseLevel,
        description: DESCRIPTIONS[noiseLevel] || "",
      },
    });
  }
  return out;
}

function buildFromIrisAndArrondissements(irisGeo, arrGeo) {
  const irisFeatures = getIrisFeatures(irisGeo);
  const arFeatures = getIrisFeatures(arrGeo);
  const out = [];
  for (const iris of irisFeatures) {
    const cen = centroid(iris);
    const arProps = arrondissementForPoint(cen, arFeatures);
    const noiseLevel = arProps ? categoryToNoiseLevel(arProps.noise_category) : 2;
    const props = iris.properties || {};
    const codeIris = props.CODE_IRIS || props.DCOMIRIS || props.code_iris || props.id || "";
    const cAr = arProps ? arProps.c_ar : (getIrisArrondissementCode(props) ? parseInt(String(getIrisArrondissementCode(props)).slice(-2), 10) : null);
    out.push({
      type: "Feature",
      geometry: iris.geometry,
      properties: {
        code_iris: codeIris,
        name: props.NOM_IRIS || props.nom_iris || props.name || `IRIS ${codeIris}`,
        c_ar: cAr,
        noise_level: noiseLevel,
        source_type: "arrondissement_fallback",
        primary_sources: ["Circulation"],
        day_level: noiseLevel,
        night_level: noiseLevel,
        description: DESCRIPTIONS[noiseLevel] || "",
      },
    });
  }
  return out;
}

async function main() {
  const irisPath = path.join(SOURCES_DIR, "paris_iris.geojson");
  const bruitPath = path.join(SOURCES_DIR, "bruitparif_2024_9classes.geojson");
  const bruitParisPath = path.join(SOURCES_DIR, "bruitparif_paris.geojson");

  let irisGeo = null;
  let bruitGeo = null;
  let arrGeo = null;

  if (fs.existsSync(irisPath)) {
    try {
      irisGeo = JSON.parse(fs.readFileSync(irisPath, "utf8"));
    } catch (e) {
      console.error("Erreur lecture paris_iris.geojson:", e.message);
      process.exit(1);
    }
  } else if (fs.existsSync(FIXTURE_IRIS_PATH)) {
    try {
      irisGeo = JSON.parse(fs.readFileSync(FIXTURE_IRIS_PATH, "utf8"));
      console.warn("Utilisation du jeu minimal (fixture). Pour les ~992 IRIS Paris, placez paris_iris.geojson dans data/sources/.");
    } catch (e) {
      console.error("Erreur lecture fixture IRIS:", e.message);
      process.exit(1);
    }
  }

  for (const p of [bruitParisPath, bruitPath]) {
    if (fs.existsSync(p)) {
      try {
        bruitGeo = JSON.parse(fs.readFileSync(p, "utf8"));
        break;
      } catch (e) {
        console.error("Erreur lecture", path.basename(p) + ":", e.message);
      }
    }
  }

  if (fs.existsSync(ARRONDISSEMENTS_PATH)) {
    try {
      arrGeo = JSON.parse(fs.readFileSync(ARRONDISSEMENTS_PATH, "utf8"));
    } catch (e) {
      console.warn("Arrondissements non chargé:", e.message);
    }
  }

  let features = [];

  if (irisGeo && bruitGeo) {
    const { default: Rbush } = await import("rbush");
    const firstBruit = (bruitGeo.features || [])[0];
    const classProp = firstBruit && firstBruit.properties
    ? (firstBruit.properties.code_9 !== undefined ? "code_9" : firstBruit.properties.classe !== undefined ? "classe" : firstBruit.properties["9"] !== undefined ? "9" : "code_9")
    : "code_9";
    features = buildFromBruitparifAndIris(irisGeo, bruitGeo, classProp, Rbush, arrGeo);
    console.log("Mode: Bruitparif + IRIS (jointure spatiale). Features:", features.length);
  } else if (irisGeo && arrGeo) {
    features = buildFromIrisAndArrondissements(irisGeo, arrGeo);
    console.log("Mode: IRIS + arrondissements (centroïde). Features:", features.length);
  } else {
    console.error(
      "Données manquantes. Placez au moins l'un des suivants dans data/sources/:\n" +
        "  - paris_iris.geojson (obligatoire)\n" +
        "  - bruitparif_2024_9classes.geojson (optionnel, sinon arrondissements utilisés)\n" +
        "Voir data/README.md pour les sources."
    );
    process.exit(1);
  }

  const result = {
    type: "FeatureCollection",
    metadata: {
      source_geometry: "Contours IRIS Paris (INSEE/IGN)",
      source_noise: bruitGeo ? "Bruitparif cartographie air-bruit 9 classes" : "Bruitparif / arrondissements (Lden)",
      noise_level_mapping: "1=Calme, 2=Modéré, 3=Bruyant, 4=Très bruyant (non alimenté par Bruitparif 9-classes)",
      crs: "EPSG:4326 (WGS84)",
      generated: new Date().toISOString().slice(0, 10),
    },
    features,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log("Écrit:", OUT_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
