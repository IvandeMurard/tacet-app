#!/usr/bin/env node
/**
 * convert-bruitparif-shp.js
 *
 * Converts Bruitparif SHP (Lambert 93) → GeoJSON (WGS84), clipped to Paris.
 * Pure Node.js — no GDAL, no system dependencies.
 *
 * Input:  data/sources/Couches SIG air-bruit 2024_9_classes.zip (or extracted .shp)
 * Output: data/sources/bruitparif_paris.geojson
 *
 * Dependencies: shapefile, proj4, adm-zip
 *
 * Usage:
 *   node scripts/convert-bruitparif-shp.js
 *   node scripts/convert-bruitparif-shp.js --input path/to/file.shp
 *   node scripts/convert-bruitparif-shp.js --input path/to/archive.zip
 */

const fs = require("fs");
const path = require("path");
const shapefile = require("shapefile");
const proj4 = require("proj4");
const AdmZip = require("adm-zip");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Lambert 93 (EPSG:2154) — Bruitparif native CRS
proj4.defs(
  "EPSG:2154",
  "+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 " +
    "+x_0=700000 +y_0=6600000 +ellps=GRS80 " +
    "+towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);

// Paris bounding box in Lambert 93 (aligné avec ogr2ogr -clip Paris)
const PARIS_BBOX_L93 = {
  minX: 647000,
  minY: 6855000,
  maxX: 657000,
  maxY: 6865000,
};

// Default paths (relative to project root)
const DEFAULT_SOURCE_PATTERNS = [
  "data/sources/Couches SIG air-bruit 2024_9_classes",
  "data/sources/Couches SIG air-bruit 2024_9_classes.zip",
];
const OUTPUT_PATH = "data/sources/bruitparif_paris.geojson";

// ---------------------------------------------------------------------------
// Coordinate helpers
// ---------------------------------------------------------------------------

function reprojectCoord([x, y]) {
  return proj4("EPSG:2154", "EPSG:4326", [x, y]);
}

function reprojectRing(ring) {
  return ring.map(reprojectCoord);
}

function reprojectGeometry(geometry) {
  switch (geometry.type) {
    case "Point":
      geometry.coordinates = reprojectCoord(geometry.coordinates);
      break;
    case "MultiPoint":
    case "LineString":
      geometry.coordinates = geometry.coordinates.map(reprojectCoord);
      break;
    case "MultiLineString":
    case "Polygon":
      geometry.coordinates = geometry.coordinates.map(reprojectRing);
      break;
    case "MultiPolygon":
      geometry.coordinates = geometry.coordinates.map((polygon) =>
        polygon.map(reprojectRing)
      );
      break;
  }
  return geometry;
}

/**
 * Bbox check: does any part of this geometry fall within Paris?
 * Uses the first coordinate of each polygon as a fast proxy.
 */
function isInParisBbox(geometry) {
  const bbox = PARIS_BBOX_L93;
  let coords;

  switch (geometry.type) {
    case "Point":
      coords = [geometry.coordinates];
      break;
    case "Polygon":
      coords = [geometry.coordinates[0][0]];
      break;
    case "MultiPolygon":
      coords = geometry.coordinates.map((poly) => poly[0][0]);
      break;
    default:
      coords = [
        Array.isArray(geometry.coordinates[0])
          ? geometry.coordinates[0][0] || geometry.coordinates[0]
          : geometry.coordinates,
      ];
  }

  return coords.some(
    ([x, y]) =>
      x >= bbox.minX && x <= bbox.maxX && y >= bbox.minY && y <= bbox.maxY
  );
}

// ---------------------------------------------------------------------------
// SHP file resolution (recursive search in directories)
// ---------------------------------------------------------------------------

/**
 * Recursively find first .shp in directory (handles nested ZIP extraction).
 * Returns { shpPath, dbfPath } or null.
 */
function findShpInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const found = findShpInDir(full);
      if (found) return found;
    } else if (e.name.toLowerCase().endsWith(".shp")) {
      return {
        shpPath: full,
        dbfPath: full.replace(/\.shp$/i, ".dbf"),
      };
    }
  }
  return null;
}

function extractFromZip(zipPath) {
  console.log(`  Extracting ZIP: ${path.basename(zipPath)}`);
  const zip = new AdmZip(zipPath);
  const tempDir = path.join(
    path.dirname(zipPath),
    ".bruitparif_extracted_temp"
  );

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }

  zip.extractAllTo(tempDir, true);
  const result = findShpInDir(tempDir);
  if (!result) throw new Error(`No .shp found in extracted ZIP: ${zipPath}`);
  result.tempDir = tempDir;
  return result;
}

/**
 * Find .shp — from CLI arg, default patterns (ZIP or directory).
 * Returns { shpPath, dbfPath, tempDir? }
 */
function resolveShpFile(inputArg) {
  const projectRoot = path.resolve(__dirname, "..");

  if (inputArg) {
    const abs = path.resolve(projectRoot, inputArg);
    if (!fs.existsSync(abs)) {
      throw new Error(`Input not found: ${abs}`);
    }
    if (abs.toLowerCase().endsWith(".zip")) {
      return extractFromZip(abs);
    }
    if (abs.toLowerCase().endsWith(".shp")) {
      return { shpPath: abs, dbfPath: abs.replace(/\.shp$/i, ".dbf") };
    }
    if (fs.statSync(abs).isDirectory()) {
      const found = findShpInDir(abs);
      if (!found) throw new Error(`No .shp file found in ${abs}`);
      return found;
    }
    throw new Error(`Input must be .shp, .zip, or directory: ${abs}`);
  }

  for (const pattern of DEFAULT_SOURCE_PATTERNS) {
    const abs = path.resolve(projectRoot, pattern);
    if (!fs.existsSync(abs)) continue;

    if (fs.statSync(abs).isDirectory()) {
      const found = findShpInDir(abs);
      if (found) return found;
    } else if (abs.toLowerCase().endsWith(".zip")) {
      return extractFromZip(abs);
    }
  }

  throw new Error(
    "Bruitparif source not found. Place the ZIP or extracted folder in data/sources/, " +
      "e.g. data/sources/Couches SIG air-bruit 2024_9_classes/\n" +
      "Or use: --input path/to/file.shp"
  );
}

// ---------------------------------------------------------------------------
// Main conversion
// ---------------------------------------------------------------------------

async function convert(inputArg) {
  const startTime = Date.now();
  const projectRoot = path.resolve(__dirname, "..");
  const outputPath = path.resolve(projectRoot, OUTPUT_PATH);

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Bruitparif SHP → GeoJSON (Paris, WGS84)        ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log();

  console.log("[1/4] Locating Shapefile...");
  const { shpPath, dbfPath, tempDir } = resolveShpFile(inputArg);
  console.log(`  SHP: ${shpPath}`);
  console.log(`  DBF: ${dbfPath}`);

  if (!fs.existsSync(shpPath)) {
    throw new Error(`SHP file not found: ${shpPath}`);
  }
  if (!fs.existsSync(dbfPath)) {
    console.warn(`  ⚠ DBF not found — properties will be empty`);
  }

  console.log("\n[2/4] Reading & filtering to Paris bbox...");

  const features = [];
  let totalRead = 0;
  let keptCount = 0;

  const source = await shapefile.open(
    shpPath,
    fs.existsSync(dbfPath) ? dbfPath : undefined,
    { encoding: "utf-8" }
  );

  while (true) {
    const result = await source.read();
    if (result.done) break;

    totalRead++;
    const feature = result.value;

    if (totalRead % 10000 === 0) {
      process.stdout.write(`  ${totalRead} read, ${keptCount} kept\r`);
    }

    if (!feature.geometry) continue;
    if (!isInParisBbox(feature.geometry)) continue;

    reprojectGeometry(feature.geometry);
    features.push(feature);
    keptCount++;
  }

  console.log(
    `  Total read: ${totalRead} | Paris: ${keptCount} | Skipped: ${totalRead - keptCount}`
  );

  console.log(`\n[3/4] Writing ${OUTPUT_PATH}...`);

  const geojson = {
    type: "FeatureCollection",
    metadata: {
      source:
        "Cartographie air-bruit établie par Airparif et Bruitparif – http://carto.airparif.bruitparif.fr",
      generated: new Date().toISOString(),
      crs: "EPSG:4326",
      original_crs: "EPSG:2154",
      feature_count: features.length,
    },
    features,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(geojson));

  const fileSizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
  console.log(`  Output: ${outputPath} (${fileSizeMB} MB)`);

  if (tempDir && fs.existsSync(tempDir)) {
    console.log("\n[4/4] Cleaning up temp extraction...");
    fs.rmSync(tempDir, { recursive: true });
    console.log(`  Removed: ${tempDir}`);
  } else {
    console.log("\n[4/4] No cleanup needed.");
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log();
  console.log("✅ Done in " + elapsed + "s");
  console.log(`   ${keptCount} Paris features → ${OUTPUT_PATH}`);
  console.log();

  if (features.length > 0) {
    const sample = features[0].properties;
    console.log("Sample properties:", JSON.stringify(sample, null, 2));
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let inputArg = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--input" && args[i + 1]) {
    inputArg = args[++i];
  }
}

convert(inputArg).catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
