# Project Brief — Tacet

**Version :** 0.2 (personas validés, données confirmées)
**Date :** 2026-02-21
**Méthode :** BMAD-METHOD — Phase 0 (Business Analyst)
**Statut :** Validé ✅

---

## 1. Résumé exécutif

Tacet est une Progressive Web App B2C qui permet aux Parisiens de visualiser la pollution sonore de leur ville et de prendre des décisions informées : choisir où habiter, se déplacer dans les zones calmes, comprendre les inégalités sonores entre quartiers.

Le projet cible le lancement avant les élections municipales de mars 2026 comme fenêtre d'amplification médiatique et politique, puis vise une présence pérenne comme référence grand public sur le sujet bruit en Île-de-France.

**Nom :** Tacet — du latin « il se tait », indication musicale signifiant le silence.

---

## 2. Problème

### Problème primaire
Les Parisiens subissent la pollution sonore sans avoir accès à une information claire, accessible et actionnable sur leur environnement sonore. Les outils existants (carte.bruitparif.fr, données Lden officielles) sont précis mais inaccessibles : UX institutionnelle, non mobile, incompréhensibles sans formation technique.

### Problème secondaire
À l'approche des élections municipales 2026, les questions de cadre de vie urbain (bruit, air, mobilité) n'ont pas d'outil de référence citoyen permettant de comparer les bilans des arrondissements ou d'interpeller les candidats avec des données.

### Données de contexte
- Le bruit est la 2e cause de nuisance urbaine déclarée (source Bruitparif)
- 60% des Parisiens estiment que le bruit affecte leur qualité de vie
- Bruitparif publie des données officielles gratuites (open data) depuis 2022
- Aucun outil grand public ne les rend lisibles et actionnables

---

## 3. Opportunité

| Dimension | Description |
|-----------|-------------|
| Timing | Élections municipales mars 2026 : fenêtre médiatique sur le cadre de vie |
| Donnée | Bruitparif 2024 (9 classes, Île-de-France) : open data, officielle, crédible |
| Marché | 2,1M d'habitants Paris, 12M IDF — zéro outil B2C de référence |
| Tech | Stack moderne (Next.js + Mapbox) accessible, déployable en semaines |
| Différenciation | UX > institutionnelle + angle éditorial + mobile-first |

---

## 4. Personas cibles (hypothèses — à valider)

> ⚠️ Ces 3 personas sont des hypothèses de travail. Ils doivent être validés, affinés ou remplacés avant de finaliser le PRD.

---

### Persona A — Lucas, 28 ans, Cycliste & télétravailleur

**Profil :** Vit dans le 11e, télétravaille 3 jours/semaine, se déplace à vélo. Sensible à son environnement quotidien. Utilise Citymapper, Komoot, Strava.

**Job-to-be-done principal :**
> "Quand je cherche un café ou une bibliothèque où travailler, je veux savoir lesquels sont dans des zones calmes, pour ne pas arriver quelque part de bruyant."

**Jobs-to-be-done secondaires :**
- Planifier un itinéraire vélo moins stressant
- Comprendre pourquoi son quartier est bruyant (types de sources)

**Fréquence d'usage attendue :** 2-4x/semaine
**Point de découverte probable :** réseaux sociaux, article média
**Willingness to pay :** Faible (accès mobile gratuit attendu)

---

### Persona B — Marie, 36 ans, Future locataire

**Profil :** Vit en banlieue, cherche un appartement à Paris pour rapprochement pro. Compare 3-4 arrondissements. Utilise SeLoger, Leboncoin, Google Maps.

**Job-to-be-done principal :**
> "Quand je visite un appartement, je veux savoir si le quartier est bruyant avant de signer, parce que c'est quelque chose que je ne peux pas voir le jour de la visite."

**Jobs-to-be-done secondaires :**
- Comparer 2 adresses précises sur le critère bruit
- Avoir un "score sérénité" partageable avec son conjoint

**Fréquence d'usage attendue :** 3-5x sur 2-3 semaines (usage ponctuel, haute valeur)
**Point de découverte probable :** SEO ("bruit quartier Paris"), recommandation agence
**Willingness to pay :** Potentiellement moyen (décision financière en jeu)

---

### Persona C — Sophie, 39 ans, Mère de famille

**Profil :** Vit dans le 15e avec 2 enfants (6 et 9 ans). Cherche régulièrement des parcs, balades et activités calmes pour ses enfants. Sensible aux enjeux de santé environnementale. Utilise Google Maps, Mairie de Paris app.

**Job-to-be-done principal :**
> "Quand je prépare une sortie avec mes enfants, je veux trouver un parc ou un itinéraire loin du bruit des voitures, parce que je sais que le bruit affecte leur développement et leur bien-être."

**Jobs-to-be-done secondaires :**
- Comparer des quartiers pour un éventuel déménagement (recoupement avec Marie)
- Comprendre quels arrondissements sont les plus exposés pour interpeller la mairie
- Partager une découverte "zone calme" avec d'autres parents

**Fréquence d'usage attendue :** 1-2x/semaine (week-ends, périodes de vacances scolaires)
**Point de découverte probable :** bouche-à-oreille entre parents, article santé/environnement, Instagram
**Willingness to pay :** Faible à moyen (dépend de la fonctionnalité — gratuit pour explorer, payant si alertes personnalisées)

**Note :** Le use case éditorial (journaliste, militant) est un **use case secondaire transversal** servi par les 3 personas via la fonctionnalité de partage de carte. Pas de persona dédié.

---

## 5. Solution proposée

Une Progressive Web App (Next.js 14, Mapbox GL JS) permettant de :

1. **Visualiser** la carte du bruit de Paris par zone IRIS (992 zones) en 4 niveaux de sérénité
2. **Explorer** son adresse : score de sérénité, niveau Lden, sources principales de bruit
3. **Comparer** les arrondissements via un baromètre du silence
4. **Comprendre** via un contenu éditorial lié aux élections 2026
5. **Partager** ses découvertes (URL par zone, image carte)

---

## 6. Objectifs & métriques de succès

### Objectifs V1 (mars 2026)

| Objectif | Métrique | Cible |
|----------|----------|-------|
| Lancement avant élections | Date de déploiement | < 28/02/2026 |
| Trafic médiatique | Visites uniques sur 30 jours post-lancement | ≥ 5 000 |
| Engagement | Taux de rebond < 70%, session > 1min30 | À mesurer |
| Distribution | Mentions presse / partages réseaux | ≥ 5 mentions |
| Crédibilité | Données Bruitparif 2024 réelles intégrées | Oui (non négociable) |

### Objectifs long terme (post-élections)

- Devenir la référence B2C sur le bruit en Île-de-France
- Expansion au-delà de Paris (IDF, puis autres métropoles)
- Modèle de monétisation défini et testé (H2 2026)

---

## 7. Contraintes

| Contrainte | Détail |
|-----------|--------|
| **Temps** | ~7 jours pour V1 déployable (objectif 28/02) |
| **Équipe** | 1 développeur + IA (Claude Code) |
| **Budget** | Zéro ou minimal (Vercel free tier, Mapbox free tier) |
| **Données** | Bruitparif 2024 open data, intégration SHP pipeline requis |
| **Tech** | Stack arrêtée : Next.js 14 + Mapbox (pas de refonte) |
| **Legal** | Attribution Bruitparif/Airparif obligatoire |

---

## 8. Périmètre V1

### IN — Non-négociable

- Carte choroplèthe Paris (992 IRIS) avec données Bruitparif 2024 **réelles**
- 3 niveaux de bruit visibles (niveau 4 si données disponibles)
- Popup au clic (nom zone, niveau, description, sources)
- Address search (Mapbox geocoding)
- Légende cohérente avec design system
- PWA manifest (installable mobile)
- Déploiement Vercel (URL publique)
- Attribution Bruitparif correcte

### OUT — Hors scope V1

- Routing calme (piéton/vélo)
- Données temps-réel (événements, chantiers)
- Silence Barometer (Phase 2 — si temps restant)
- Contenu éditorial élections (Phase 2)
- Authentification / comptes utilisateurs
- NoiseCapture / crowdsourcing
- Expansion IDF

---

## 9. Hypothèse de monétisation

**V1 : Gratuit, sans publicité, sans tracking agressif.**

Priorité : traction et crédibilité avant mars 2026. La monétisation est explicitement hors-scope V1. Elle sera définie en H2 2026 selon les signaux d'usage observés.

Hypothèses à tester post-V1 (non ordonnées) :
- B2C2B : insights d'usage vers collectivités / promoteurs immobiliers
- Freemium : diagnostic d'adresse premium, alertes
- Financement institutionnel : ADEME, Région IDF, Bruitparif
- Modèle média : contenu + audience

---

## 10. Hypothèses clés & risques

| Hypothèse | Risque si fausse |
|-----------|-----------------|
| Les utilisateurs veulent consulter le bruit avant de chercher un logement | Persona B invalide → faible traction |
| L'angle élections génère de la couverture presse | Zéro amplification → lancement silencieux |
| Bruitparif 2024 SHP est disponible et intégrable via le pipeline Node.js existant | Données non intégrées → carte fictive en prod |
| PWA suffit vs application native | Engagement mobile inférieur aux attentes |
| Glassmorphism dark UI est lisible en extérieur | UX dégradée sur le terrain |

---

## 11. Questions ouvertes

1. **Personas :** Les 3 personas (Lucas, Marie, Amélie) sont-ils les bons ? Quelle priorité entre eux ?
2. **Expo vs Next.js :** Le prototype Rork (Expo/React Native) est-il maintenu ou abandonné ?
3. **Données Bruitparif 2024 :** ✅ Résolu — pipeline déjà exécuté le 12/02. 778/992 IRIS en données réelles, 214 en fallback arrondissement (documenté dans metadata).
4. **Mapbox token :** Tier gratuit suffisant pour le trafic cible au lancement ?
5. **Contenu éditorial :** Qui rédige les textes (angle élections) ? Humain ou IA ?

---

## Artefacts BMAD suivants

- [ ] `docs/prd.md` — PRD complet (après validation de ce brief)
- [ ] `docs/architecture.md` — Architecture technique
- [ ] `docs/epics/` — Epics découpés par domaine
- [ ] `docs/stories/` — Stories prêtes pour implémentation
