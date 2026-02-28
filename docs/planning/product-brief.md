---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - _bmad-output/planning-artifacts/research/market-Tacet-research-2026-02-25.md
  - _bmad-output/planning-artifacts/research/domain-Tacet-research-2026-02-25.md
  - _bmad-output/planning-artifacts/research/technical-Tacet-research-2026-02-25.md
date: '2026-02-26'
author: IVAN
workflowType: 'product-brief'
project_name: Tacet
---

# Product Brief: Tacet

**Date:** 2026-02-26
**Author:** IVAN
**Projet:** Tacet — Carte sonore urbaine de Paris

---

## Executive Summary

**Tacet** est une application mobile PWA de cartographie sonore pour Paris qui transforme des données environnementales complexes et anxiogènes en un **compagnon premium, rassurant et beau** — pour que chaque Parisien puisse comprendre, naviguer et décider en fonction de son environnement sonore.

**Problème central :** 17,2 millions de Français sont fortement gênés par le bruit quotidiennement, mais aucun outil grand public accessible et beau n'existe pour les aider à comprendre leur environnement sonore. Le marché B2C est vacant depuis le retrait d'Ambiciti (~2023-2024).

**Solution :** Une couche sonore qui alimente trois expériences — information IRIS (V1 ✅ livré), aide à la décision immobilière (V2), navigation par rues calmes (V3). La V1 existe déjà. La V2 est en cours de construction (TAC-28→37).

**Fenêtre stratégique :** Élections municipales Paris 2026 — le bruit est explicitement cité comme enjeu de campagne. Tacet est la seule application grand public à rendre ces données accessibles et belles.

**Founder's edge :** Après Sonor (B2G, 2021-2023) — plateforme SaaS+conseil pour collectivités qui n'a pas tenu ses promesses faute de compétences techniques, de données accessibles, et d'un cycle de vente institutionnel trop long — Tacet met l'intelligence directement entre les mains des utilisateurs. Même mission. Impact exponentiellement plus grand.

---

## Core Vision

### Problem Statement

Les Parisiens vivent dans l'une des villes les plus bruyantes d'Europe (Lden > 55 dB pour 61% des résidents selon PPBE Paris 4ème cycle), mais la donnée qui permettrait d'en prendre conscience et d'agir est :

- Enfouie dans des PDF administratifs (PPBE, cartes Bruitparif)
- Inaccessible sur des portails techniques non conçus pour le grand public
- Absente de tous les outils de consommation courante (Citymapper, Mappy, PAP, SeLoger)

**Problème #1 (cœur) — Information sonore :** Pas d'outil clair, fiable et beau pour répondre à "Est-ce calme ici ?" en quelques secondes.

**Problème #2 (dérivé) — Décision immobilière/pro :** La recherche d'appartement ou de bureau se fait sans contexte sonore, menant à des erreurs coûteuses (déménagement subi, plaintes locataires, baux rompus).

**Problème #3 (dérivé) — Navigation urbaine :** Aucun outil pour naviguer par les rues calmes de Paris, ou par thèmes (nature, street art, gastronomie, café).

### Solution Vision

Tacet est **la couche sonore** de Paris — une infrastructure de données acoustiques qui alimente trois expériences, dans l'ordre de valeur croissante :

1. **Information** (V1 ✅) — Carte IRIS + Score Sérénité + Baromètre + couches thématiques (élections)
2. **Décision** (V2) — "Trouve-moi un quartier calme" pour movers B2C et futurs bureaux B2B
3. **Navigation** (V3) — Route planner par rues calmes + routes thématiques (nature, histoire, street art, food, coffee)

**Philosophie design :** Transformer la donnée complexe et anxiogène en compagnon premium, rassurant et serein. Tons chauds, grands espaces blancs, émotions calmes. La clarté d'information de Citymapper, l'esthétique des apps de voyage premium — sans la surcharge visuelle d'AirParif.

### The Founder Story

Sonor (2021-2023) était une plateforme B2G : diagnostics sonores pour collectivités + conseil humain. Elle a échoué par cumul de contraintes — pas de compétences techniques internes, données Bruitparif difficiles d'accès, modèle hybride SaaS+conseil trop complexe, cycle de vente institutionnel trop long.

Tacet est la réponse directe : mêmes données, même mission de réduction des nuisances sonores urbaines, mais distribuée directement aux utilisateurs via une app mobile belle et accessible. B2C = zéro cycle de vente, scale organique, impact mesuré en utilisateurs actifs plutôt qu'en dossiers signés.

### Unique Differentiators

1. **Seule app grand public avec données Bruitparif temps réel** — Réseau RUMEUR (85+ capteurs, 3min refresh, Paris + Périphérique)
2. **Score Sérénité** — Score composite propriétaire (0-100) qui traduit les décibels en ressenti, accessible à tous
3. **UX calme de catégorie** — À l'opposé des cartes environnementales techniques (AirParif, PPBE), Tacet est conçu pour réduire l'anxiété, pas la créer
4. **Infrastructure $0** — MapLibre + PMTiles + Open Data Paris → zéro coût variable, même à 200k utilisateurs
5. **Timing politique** — Élections Paris 2026, bruit = enjeu de campagne, Tacet est déjà en ligne

---

## Target Users

### Persona 1 (Primaire) — Maria, 36 ans — La Future Habitante

**Contexte :** Designer d'intérieur, Paris 3ème. En recherche active d'appartement depuis 2 mois. Budget 900€/mois, cible Belleville, Ménilmontant, République. Mère d'un enfant de 4 ans. Partner en télétravail 4j/5.

**Problème vécu :** Visite les appartements en semaine le matin — les heures les plus calmes. Ne peut pas savoir ce qu'il se passe le samedi soir à 2h. Le bruit est son critère #1, avant le prix au m². Actuellement : lit les avis Google, revient visiter 3 fois à des heures différentes, interroge les voisins. Chronophage, peu fiable.

**Journey Tacet :**
- **Découverte :** Article sur la qualité de vie à Paris ou recommandation d'une amie en recherche → Tacet
- **Onboarding :** Entre son quartier cible → voit le Score Sérénité immédiatement sur la carte
- **Usage core :** Compare 3 adresses, consulte le Baromètre (jour/nuit/week-end), zoome sur les IRIS
- **Moment Aha! :** "Belleville est plus calme que je pensais après 22h" → confiance pour signer le bail
- **Rétention :** Revient après emménagement pour vérifier son nouveau quartier, partage à 3 amies également en recherche

**Citation :** *"Je veux juste savoir la vérité sur le bruit avant de signer un bail de 3 ans."*

**Succès :** Trouver son quartier calme en < 5 minutes, avec une confiance suffisante pour agir.

---

### Persona 2 (Secondaire) — Sophie, 42 ans — La Mère Attentive

**Contexte :** Enseignante, 2 enfants (6 et 9 ans). Paris 11ème. Préoccupations : trajet école, qualité des espaces de jeu, environnement d'apprentissage à domicile.

**Problème vécu :** Recherches sur les effets du bruit sur l'apprentissage (> 55 dB affecte la concentration et la lecture chez l'enfant). Veut savoir si l'environnement de ses enfants est problématique. Ne peut pas interpréter les cartes PPBE.

**Journey Tacet :**
- **Découverte :** Groupe WhatsApp de parents d'école ou recommandation pédiatre
- **Usage core :** Vérifie le bruit autour de l'école, du domicile, des parcs
- **Moment Aha! :** Trouve le trajet école le plus calme, découvre un square de calme insoupçonné
- **Advocacy :** Partage dans les groupes de parents, devient évangéliste naturelle

**Citation :** *"Je ne savais pas qu'il y avait une rue aussi calme juste derrière l'école."*

---

### Persona 3 (Future — V3+) — B2B : Studio / Cabinet / Coworking

**Profil :** Fondateur de studio d'enregistrement, architecte acousticien, médecin en quête de local calme, espace coworking cherchant certification "calme".

**Valeur B2B :** Données historiques agrégées + export de rapport certifié + abonnement premium 50-200€/mois.

**Statut :** Out of scope V1 et V2. Pilier de revenus V3+.

---

### User Journey Synthèse

| Étape | Maria | Sophie |
|-------|-------|--------|
| Découverte | Article / amie en recherche | Groupe parents / pédiatre |
| Premier usage | Recherche adresse → carte immédiate | Cherche école / domicile |
| Valeur core | Score Sérénité + Baromètre | Comparaison trajet école |
| Moment Aha! | "Je peux signer ce bail" | "Cette rue est calme pour mes enfants" |
| Rétention | Revient post-emménagement | Usage régulier |
| Advocacy | Partage à amies en recherche | Évangélise groupes parents |

---

## Success Metrics

### User Success

- Maria trouve son quartier calme en **< 5 minutes** (time-to-insight)
- L'utilisateur comprend le Score Sérénité sans aide ni tutoriel (clarté immédiate)
- L'utilisateur revient au moins 1 fois (valeur perçue assez forte)
- L'utilisateur partage Tacet de façon organique (valeur assez forte pour la recommander)

### Business Objectives

| Horizon | Objectif |
|---------|----------|
| **3 mois (V2 launch)** | 500 utilisateurs actifs hebdomadaires · PWA installable · Lighthouse perf ≥ 85 |
| **6 mois** | 2,000 MAU · 1 article dans presse française (Numerama, Le Monde, etc.) · TAC-28 résolu (API Bruitparif) |
| **12 mois** | 10,000 MAU · Mention dans campagne électorale Paris 2026 · Partenariat Bruitparif formalisé |
| **3 ans (V3+)** | 50,000 MAU Paris · Revenue B2B lancé · Expansion Lyon/Marseille/Bruxelles |

### Key Performance Indicators

| KPI | V2 cible | V3 cible |
|-----|----------|----------|
| Lighthouse Performance | ≥ 85 | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 | ≥ 95 |
| LCP (Core Web Vital) | < 2.5s | < 2.0s |
| Bundle JS initial | < 300 Ko | < 250 Ko |
| PWA Install Rate | ≥ 8% | ≥ 15% |
| Score Sérénité accuracy vs PPBE | ≥ 90% | ≥ 95% |
| Weekly Active Users | 500 | 10,000 |
| Session Duration | ≥ 2 min | ≥ 3 min |
| Organic Share Rate | ≥ 5% | ≥ 12% |
| API cost per user (variable) | $0 permanent | $0 permanent |

---

## MVP Scope

### V1 — Livré (État actuel)

- ✅ Carte IRIS Paris (992 zones) avec Score Sérénité
- ✅ Baromètre sonore (comparaison jour/nuit/semaine)
- ✅ Couche élections Paris 2026 (thématique)
- ✅ Application web responsive (Next.js + Mapbox GL JS)

### V2 — Core Features (en construction — TAC-28→37)

| Feature | Issue | Priorité | Sprint |
|---------|-------|----------|--------|
| Migration MapLibre GL JS (ADR-01) | TAC-29 | 🔴 Haute | V2.1 |
| PMTiles pipeline Tippecanoe + Vercel Blob (ADR-02) | TAC-30 | 🔴 Haute | V2.1 |
| CI/CD : Vitest + Playwright + GitHub Actions (ADR-04) | TAC-31 | 🟡 Moyenne | V2.1 |
| Lighthouse CI budget guard | TAC-32 | 🟡 Moyenne | V2.1 |
| PWA Serwist + offline shell (ADR-03) | TAC-33 | 🟡 Moyenne | V2.2 |
| Geocoding Photon Komoot (recherche adresse) | TAC-34 | 🟡 Moyenne | V2.2 |
| Route Handler proxy Bruitparif + polling 3min (ADR-05) | TAC-35 | 🟠 Normale | V2.3 (bloqué TAC-28) |
| Couche chantiers Open Data Paris | TAC-36 | 🟠 Normale | V2.3 |
| Tests E2E Playwright ≥ 10 scénarios | TAC-37 | 🟠 Normale | V2.2 |

**Pré-requis externe :** TAC-28 — Contacter Bruitparif pour accès API RUMEUR (urgent, non bloquant pour TAC-29→34)

### Out of Scope — V2

| Feature | Raison | Horizon |
|---------|--------|---------|
| Route planner rues calmes | Routing engine (OSRM/Valhalla) + UX dédiée | V3 |
| Routes thématiques (street art, food, coffee) | Agrégation sources 3e + curation éditoriale | V3 |
| B2B dashboard / export rapport | Modèle commercial séparé | V3+ |
| Alertes bruit push notification | Service Worker notifications + backend | V3 |
| Crowdsourced noise reports | Modération + validation = complexité opérationnelle | V3 |
| App native iOS/Android | PWA first (même install expérience, zéro coût stores) | V4+ |
| Expansion hors Paris IDF | Requiert PPBE + capteurs pour d'autres villes | V3+ |
| SSE streaming temps réel | Vercel Pro requis — polling 3min suffisant V2 | V3 |

### MVP Success Criteria

La V2 est réussie si :
1. Maria trouve son quartier calme en **< 5 minutes**
2. La carte charge en **< 2.5s** (LCP) sur mobile 4G
3. L'app est installable comme PWA (Lighthouse Performance ≥ 85)
4. Le coût infrastructure reste à **$0** à 10,000 utilisateurs/mois
5. Les données Bruitparif RUMEUR sont visibles sur la carte *(si TAC-28 résolu)*

### Future Vision — V3 et au-delà

**Navigation Calme :** Route planner par les rues les moins bruyantes de Paris. Routes thématiques optionnelles : nature (parcs + squares), street art (Belleville, Oberkampf), gastronomie (marchés, restaurants étoilés), coffee shops calmes.

**Compagnon sonore intelligent :** Requête en langage naturel — "Trouve-moi un café calme en dessous de 55 dB près de République, avec du Wi-Fi."

**Alertes personnalisées :** Notification push quand le bruit dépasse le seuil personnel dans ton quartier.

**Données B2B certifiées :** Rapports exportables pour studios d'enregistrement, architectes, cabinets médicaux, coworkings. Abonnement premium 50-200€/mois.

**Expansion européenne :** Lyon, Marseille, Bruxelles, Amsterdam — villes avec données bruit ouvertes et PPBE publiés.

**Communauté Waze-for-Noise :** Signalements utilisateurs (chantier imprévu, concert, livraison nocturne) validés par IA avant publication.
