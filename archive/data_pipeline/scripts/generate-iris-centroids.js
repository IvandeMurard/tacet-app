#!/usr/bin/env node
/**
 * Generate iris-centroids.geojson from paris-noise-iris.geojson (point at centroid of each IRIS).
 * Used for Score Dots layer in MapLibre.
 *
 * Usage: node scripts/generate-iris-centroids.js
 * Reads: tacet/public/data/paris-noise-iris.geojson (or data/paris-noise-iris.geojson)
 * Writes: tacet/public/data/iris-centroids.geojson
 */

const fs = require("fs");
const path = require("path");
const centroid = require("@turf/centroid").default;

const ROOT = path.resolve(__dirname, "..");
const SOURCES = [
  path.join(ROOT, "tacet", "public", "data", "paris-noise-iris.geojson"),
  path.join(ROOT, "data", "paris-noise-iris.geojson"),
];
const OUT_PATH = path.join(ROOT, "tacet", "public", "data", "iris-centroids.geojson");

function findInputPath() {
  for (const p of SOURCES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("paris-noise-iris.geojson not found in tacet/public/data or data/");
}

const inputPath = findInputPath();
const geojson = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const features = geojson.features.map((f) => {
  const c = centroid(f);
  c.properties = { ...f.properties };
  return c;
});

const out = {
  type: "FeatureCollection",
  features,
};
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(out), "utf8");
console.log("Wrote", OUT_PATH, "with", features.length, "centroids");
