#!/usr/bin/env node
/**
 * Prépare les sources de données puis lance le build paris-noise-iris.
 *
 * 1. IRIS : paris_iris.geojson (existant, datasourcesparis_iris copié, ou téléchargé)
 * 2. Bruitparif : convert-bruitparif-shp.js (SHP → GeoJSON, pure Node.js)
 * 3. Build : npm run build:data
 *
 * Options : --skip-download (ne pas télécharger/copier IRIS)
 *           --skip-ogr (ne pas exécuter la conversion Bruitparif)
 *           --force-download (télécharger même si paris_iris ou datasourcesparis_iris existe)
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SOURCES_DIR = path.join(ROOT, "data", "sources");
const PARIS_IRIS_PATH = path.join(SOURCES_DIR, "paris_iris.geojson");
const DATASOURCES_IRIS_PATH = path.join(SOURCES_DIR, "datasourcesparis_iris.geojson");
const BRUITPARIF_OUT_PATH = path.join(SOURCES_DIR, "bruitparif_paris.geojson");
const CONVERT_SCRIPT_PATH = path.join(__dirname, "convert-bruitparif-shp.js");

const IRIS_API_URL =
  "https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/iris/exports/geojson?limit=-1&refine=depcom%3A75156";

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    skipDownload: args.includes("--skip-download"),
    skipOgr: args.includes("--skip-ogr"),
    forceDownload: args.includes("--force-download"),
  };
}

function ensureSourcesDir() {
  if (!fs.existsSync(SOURCES_DIR)) {
    fs.mkdirSync(SOURCES_DIR, { recursive: true });
    console.log("Créé:", SOURCES_DIR);
  }
}

async function ensureParisIris(opts) {
  if (opts.skipDownload && !opts.forceDownload) {
    if (fs.existsSync(PARIS_IRIS_PATH)) {
      console.log("IRIS: paris_iris.geojson existe déjà (--skip-download).");
      return true;
    }
    if (fs.existsSync(DATASOURCES_IRIS_PATH)) {
      fs.copyFileSync(DATASOURCES_IRIS_PATH, PARIS_IRIS_PATH);
      console.log("IRIS: datasourcesparis_iris.geojson copié vers paris_iris.geojson.");
      return true;
    }
    console.warn("IRIS: --skip-download mais aucun fichier local. Le build risque d'échouer.");
    return false;
  }

  if (fs.existsSync(PARIS_IRIS_PATH) && !opts.forceDownload) {
    console.log("IRIS: paris_iris.geojson existe déjà.");
    return true;
  }

  if (fs.existsSync(DATASOURCES_IRIS_PATH) && !opts.forceDownload) {
    fs.copyFileSync(DATASOURCES_IRIS_PATH, PARIS_IRIS_PATH);
    console.log("IRIS: datasourcesparis_iris.geojson copié vers paris_iris.geojson.");
    return true;
  }

  return await downloadParisIris();
}

function downloadParisIris() {
  console.log("IRIS: téléchargement depuis data.iledefrance.fr...");
  return new Promise((resolve) => {
    const https = require("https");
    const req = https.get(IRIS_API_URL, { timeout: 60000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirect = res.headers.location;
        if (redirect) {
          require(redirect.startsWith("https") ? "https" : "http")
            .get(redirect, (r) => {
              let buf = "";
              r.on("data", (c) => (buf += c));
              r.on("end", () => {
                try {
                  fs.writeFileSync(PARIS_IRIS_PATH, buf, "utf8");
                  console.log("IRIS: écrit", PARIS_IRIS_PATH);
                  resolve(true);
                } catch (e) {
                  console.error("IRIS: erreur écriture:", e.message);
                  resolve(false);
                }
              });
            })
            .on("error", (e) => {
              console.error("IRIS: erreur redirection:", e.message);
              resolve(false);
            });
          return;
        }
      }
      let buf = "";
      res.on("data", (c) => (buf += c));
      res.on("end", () => {
        try {
          const data = JSON.parse(buf);
          if (data.type === "FeatureCollection" || Array.isArray(data.features)) {
            fs.writeFileSync(PARIS_IRIS_PATH, JSON.stringify(data), "utf8");
            console.log("IRIS: écrit", PARIS_IRIS_PATH);
            resolve(true);
          } else {
            console.error("IRIS: réponse invalide (pas FeatureCollection)");
            resolve(false);
          }
        } catch (e) {
          console.error("IRIS: erreur parsing/écriture:", e.message);
          resolve(false);
        }
      });
    });
    req.on("error", (e) => {
      console.error(
        "IRIS: échec téléchargement.",
        "Téléchargez manuellement:",
        IRIS_API_URL,
        "\nPuis enregistrez sous data/sources/paris_iris.geojson"
      );
      resolve(false);
    });
  });
}

function runConvertBruitparif(opts) {
  if (opts.skipOgr) {
    if (fs.existsSync(BRUITPARIF_OUT_PATH)) {
      console.log("Bruitparif: bruitparif_paris.geojson existe déjà (--skip-ogr).");
      return true;
    }
    console.warn("Bruitparif: --skip-ogr mais fichier absent. Le build utilisera le fallback arrondissements.");
    return true;
  }

  const result = spawnSync("node", [CONVERT_SCRIPT_PATH], {
    stdio: "inherit",
    cwd: ROOT,
  });

  if (result.status !== 0) {
    console.error("Conversion Bruitparif échouée (code:", result.status, ")");
    return false;
  }

  return true;
}

async function main() {
  const opts = parseArgs();

  ensureSourcesDir();

  const irisOk = await ensureParisIris(opts);
  if (!irisOk) {
    console.error("Échec préparation IRIS. Abandon.");
    process.exit(1);
  }

  const convertOk = runConvertBruitparif(opts);
  if (!convertOk) {
    console.warn("Conversion Bruitparif échouée. Le build utilisera le fallback arrondissements si disponible.");
  }

  console.log("\nLancement: npm run build:data");
  const build = spawnSync("npm", ["run", "build:data"], {
    stdio: "inherit",
    cwd: ROOT,
    shell: true,
  });

  process.exit(build.status ?? 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
