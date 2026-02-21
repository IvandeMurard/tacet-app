# PRD — Tacet V1.0

**Version :** 1.0
**Date :** 2026-02-21
**Méthode :** BMAD-METHOD — Phase 1 (Product Manager)
**Statut :** Validé ✅
**Référence :** [project-brief.md](./project-brief.md)

---

## 1. Résumé produit

Tacet est une PWA mobile-first permettant aux Parisiens de visualiser la pollution sonore de leur ville via une carte choroplèthe officielle (Bruitparif 2024), d'explorer le niveau sonore de n'importe quelle adresse, et de comparer les arrondissements.

**Proposition de valeur :**
> Tacet transforme les données officielles de bruit en une carte que tout le monde comprend — pour choisir où vivre, où sortir, et où élever ses enfants.

---

## 2. Personas & jobs-to-be-done

### Lucas, 28 ans — Cycliste & télétravailleur
- **JTBD** : Trouver des zones calmes pour travailler ou se déplacer au quotidien
- **Trigger d'usage** : "Je veux choisir mon prochain café de travail dans un quartier calme"
- **Features clés** : Carte + address search + popup IRIS

### Marie, 36 ans — Future locataire
- **JTBD** : Évaluer le bruit d'un quartier avant de signer un bail
- **Trigger d'usage** : "Je visite un appart rue de Rivoli — c'est calme ?"
- **Features clés** : Address search + score sérénité + comparaison

### Sophie, 39 ans — Mère de famille
- **JTBD** : Trouver des sorties et itinéraires calmes pour ses enfants
- **Trigger d'usage** : "Je cherche un parc tranquille pour dimanche"
- **Features clés** : Carte + partage + contenu éditorial

---

## 3. Fonctionnalités V1.0

### 3.1 Carte choroplèthe (P0)

**Description :** Visualisation de Paris par zones IRIS colorées selon le niveau sonore Bruitparif 2024.

**Critères d'acceptation :**
- [ ] 992 zones IRIS affichées sur fond Mapbox dark-v11
- [ ] 3 niveaux de couleur visibles : Calme (#0D9488), Modéré (#F59E0B), Bruyant (#F97316)
- [ ] Niveau 4 "Très bruyant" (#EF4444) prêt mais non peuplé (Bruitparif 9-classes = 3 niveaux)
- [ ] Opacité 0.7, contour blanc/15%
- [ ] Bornes géographiques Paris : [2.15, 48.75] → [2.55, 48.95]
- [ ] Zoom initial 11.5, centre [2.3522, 48.8566]
- [ ] Rotation et pitch désactivés (carte 2D uniquement)
- [ ] Chargement < 3s sur 4G (GeoJSON 1.66 MB)

**Fichiers concernés :**
- `tacet/src/components/Map.tsx`
- `tacet/src/lib/noise-categories.ts`
- `tacet/public/data/paris-noise-iris.geojson`

---

### 3.2 Popup IRIS au clic (P0)

**Description :** Cliquer sur une zone IRIS affiche un panel d'information contextuel.

**Critères d'acceptation :**
- [ ] Clic sur une zone IRIS déclenche l'affichage d'un panel/popup
- [ ] Contenu affiché :
  - Nom de la zone (ex. "Quinze-Vingts 11")
  - Arrondissement (ex. "12e arrondissement")
  - Niveau sérénité : badge coloré + label (Calme / Modéré / Bruyant)
  - Sources principales de bruit (ex. "Circulation", "Ferroviaire")
  - Description courte (ex. "Zone modérément bruyante en journée")
  - Mention source_type : si "arrondissement_fallback", afficher "⚠️ Estimation par arrondissement"
- [ ] Panel fermable (clic extérieur ou bouton ✕)
- [ ] Design glassmorphism cohérent avec la légende existante
- [ ] Mobile-first : panel en bottom sheet sur mobile, tooltip/sidebar sur desktop

**Fichiers concernés :**
- `tacet/src/components/Map.tsx` (ajout onClick handler)
- Nouveau composant `tacet/src/components/IrisPopup.tsx`

---

### 3.3 Address Search (P0)

**Description :** Barre de recherche d'adresse permettant de centrer la carte et d'obtenir le score sérénité d'un lieu.

**Critères d'acceptation :**
- [ ] Champ de recherche visible sur la carte (position : top-center ou top-left)
- [ ] Autocomplétion via Mapbox Geocoding API (France / Paris)
- [ ] Sélection d'une adresse : carte centrée + zoom sur la zone IRIS correspondante
- [ ] Affichage automatique du popup IRIS de la zone sélectionnée
- [ ] État vide : placeholder "Chercher une adresse à Paris…"
- [ ] Accessible au clavier

**Fichiers concernés :**
- Nouveau composant `tacet/src/components/SearchBar.tsx`
- `tacet/src/app/page.tsx` (intégration)

---

### 3.4 Légende cohérente (P0)

**Description :** Unifier le design system couleurs entre Map.tsx et noise-categories.ts.

**Critères d'acceptation :**
- [ ] Couleurs centralisées dans `noise-categories.ts`, référencées dans `Map.tsx`
- [ ] Couleurs finales (à valider avec brief) :
  - Calme : `#0D9488` (teal)
  - Modéré : `#F59E0B` (amber)
  - Bruyant : `#F97316` (orange)
  - Très bruyant : `#EF4444` (red) — prévu, non peuplé
- [ ] Légende affiche 3 niveaux actifs + mention "(données non disponibles)" pour niveau 4
- [ ] Attribution Bruitparif/Airparif présente dans la légende

**Fichiers concernés :**
- `tacet/src/lib/noise-categories.ts`
- `tacet/src/components/Map.tsx`
- `tacet/src/components/Legend.tsx`

---

### 3.5 PWA manifest + service worker basique (P1)

**Description :** Rendre Tacet installable sur mobile via PWA.

**Critères d'acceptation :**
- [ ] `manifest.json` présent avec : name, short_name, icons (192px + 512px), theme_color, background_color, display: standalone
- [ ] Service worker basique (cache-first pour le GeoJSON + assets statiques)
- [ ] Prompt d'installation visible sur Chrome/Android
- [ ] Score Lighthouse PWA ≥ 90

**Fichiers concernés :**
- `tacet/public/manifest.json` (à créer)
- `tacet/public/sw.js` ou intégration next-pwa

---

### 3.6 Déploiement Vercel (P1)

**Description :** Rendre Tacet accessible publiquement.

**Critères d'acceptation :**
- [ ] Déployé sur Vercel (domaine `tacet.vercel.app` ou custom)
- [ ] Variable d'env `NEXT_PUBLIC_MAPBOX_TOKEN` configurée dans Vercel
- [ ] Build Next.js statique ou SSR fonctionnel sans erreur
- [ ] GeoJSON accessible depuis `public/data/paris-noise-iris.geojson`
- [ ] HTTPS actif

---

## 4. Fonctionnalités hors scope V1

Ces fonctionnalités sont explicitement exclues de V1 :

| Fonctionnalité | Raison |
|---------------|--------|
| Silence Barometer (ranking arrondissements) | Phase 2 — si temps post-V1 |
| Itinéraires calmes piéton/vélo | Phase 3 — requiert routing engine |
| Données temps-réel (chantiers, événements) | Phase 3 — APIs externes |
| Authentification / comptes utilisateurs | Non nécessaire V1 |
| Contenu éditorial élections | Phase 2 |
| Expansion IDF | Phase 4 |
| Crowdsourcing / NoiseCapture | Phase 4 |
| Niveau 4 "Très bruyant" peuplé | Dépend données source |

---

## 5. Métriques de succès

### Métriques primaires (mesurables à J+30)

| Métrique | Définition | Cible V1 |
|---------|-----------|----------|
| Visites uniques | Sessions distinctes 30j post-lancement | ≥ 5 000 |
| Taux de rebond | Sessions < 10s / total sessions | ≤ 60% |
| Durée session médiane | Temps moyen passé sur la carte | ≥ 1m30 |
| Interactions carte | % sessions avec ≥ 1 clic IRIS | ≥ 40% |
| Recherches adresse | % sessions avec ≥ 1 recherche | ≥ 20% |

### Métriques secondaires

| Métrique | Cible |
|---------|-------|
| Mentions presse / newsletters | ≥ 5 dans les 30j post-lancement |
| Partages réseaux sociaux | ≥ 500 |
| Installations PWA | ≥ 200 |
| Score Lighthouse Performance | ≥ 85 |
| Score Lighthouse PWA | ≥ 90 |

### Métriques de qualité données

| Métrique | Cible |
|---------|-------|
| Couverture données réelles | ≥ 78% (actuel) → amélioration si possible |
| Zones fallback documentées | 100% (badge ⚠️ visible) |

---

## 6. Contraintes & hypothèses

### Contraintes techniques

- **Framework** : Next.js 14 App Router — pas de migration
- **Carte** : Mapbox GL JS v3 — pas de remplacement
- **Token Mapbox** : tier gratuit → 50 000 chargements/mois. Suffisant au lancement
- **Hébergement** : Vercel free tier → 100 GB bandwidth/mois
- **GeoJSON** : Servi en statique depuis `public/data/` — pas de backend requis en V1

### Hypothèses produit

- Les utilisateurs acceptent une carte 2D sans rotation (cohérent avec usage info, pas navigation)
- Le dark theme est accessible et lisible (à tester sur mobile en extérieur)
- La granularité IRIS (992 zones) est suffisamment précise pour être utile sans être écrasante
- 78% de couverture données réelles est acceptable si les 22% restants sont signalés

### Dépendances externes

- **Bruitparif** : données 2024 déjà en local (`data/sources/bruitparif_paris.geojson`)
- **Mapbox** : token valide requis (`.env.local`)
- **IGN/INSEE** : IRIS Paris déjà en local (`data/sources/paris_iris.geojson`)

---

## 7. Questions ouvertes

| Question | Impact | Décision requise par |
|---------|--------|----------------------|
| Améliorer les 214 IRIS fallback ? | Mineur — crédibilité | Avant déploiement |
| Couleurs finales design system ? | Mineur — cohérence | Avant BMAD-2 |
| Custom domain vs tacet.vercel.app ? | Faible | Post-lancement |
| Expo/React Native maintenu ou abandonné ? | Important — focus | Cette semaine |

---

## 8. Artefacts BMAD suivants

- [x] `docs/project-brief.md` — ✅ Validé
- [x] `docs/prd.md` — ✅ Ce document
- [ ] `docs/architecture.md` — À créer (BMAD-2)
- [ ] `docs/epics/` — À créer (BMAD-3)
- [ ] `docs/stories/` — À créer (BMAD-4)
