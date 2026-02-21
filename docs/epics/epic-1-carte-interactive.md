# Epic 1 — Carte interactive

**Priorité :** P0 — Bloquant pour V1
**Statut :** Prêt pour implémentation
**Persona(s) :** Lucas, Marie, Sophie
**Référence PRD :** §3.1, §3.2, §3.3, §3.4

---

## Objectif

Rendre la carte choroplèthe pleinement interactive et visuellement cohérente : popup IRIS au clic, recherche d'adresse, design system unifié.

## Valeur utilisateur

> En tant que Parisien, je veux cliquer sur n'importe quelle zone de Paris et voir immédiatement son niveau sonore et ses caractéristiques, pour prendre des décisions informées sur mes déplacements ou mon logement.

## Stories

| Story | Titre | Priorité | Effort |
|-------|-------|----------|--------|
| 1.1 | Unifier le design system couleurs | P0 | S |
| 1.2 | Popup IRIS au clic | P0 | M |
| 1.3 | Address search Mapbox geocoding | P0 | M |
| 1.4 | Légende mise à jour (4 niveaux + attribution) | P0 | S |

## Critères d'acceptation epic

- [ ] Cliquer sur n'importe quelle zone IRIS affiche ses informations
- [ ] Rechercher une adresse parisienne centre la carte sur la bonne zone
- [ ] Les couleurs sont cohérentes entre carte, légende, et popup
- [ ] Les zones "arrondissement_fallback" sont signalées visuellement
- [ ] L'interface est utilisable sur mobile (375px) et desktop

## Dépendances

- `data/paris-noise-iris.geojson` disponible avec 992 features ✅
- Mapbox token configuré ✅
- `noise-categories.ts` réécrit (Story 1.1) bloque Stories 1.2 et 1.4
