# Epic 2 — PWA & Déploiement

**Priorité :** P1 — Requis avant annonce publique
**Statut :** Prêt pour implémentation (après Epic 1)
**Persona(s) :** Lucas, Sophie (mobile)
**Référence PRD :** §3.5, §3.6

---

## Objectif

Rendre Tacet accessible publiquement via une URL Vercel, installable comme PWA sur mobile.

## Valeur utilisateur

> En tant qu'utilisateur mobile, je veux installer Tacet sur mon écran d'accueil et l'utiliser même en signal faible, comme une vraie application.

## Stories

| Story | Titre | Priorité | Effort |
|-------|-------|----------|--------|
| 2.1 | Retirer Supabase des dépendances Next.js | P1 | S |
| 2.2 | PWA manifest + icônes | P1 | S |
| 2.3 | Service worker (cache GeoJSON + assets) | P1 | M |
| 2.4 | Déploiement Vercel + variable env | P1 | S |
| 2.5 | Audit Lighthouse (Performance ≥ 85, PWA ≥ 90) | P1 | S |

## Critères d'acceptation epic

- [ ] URL publique Vercel fonctionnelle
- [ ] Prompt d'installation PWA visible sur Chrome/Android
- [ ] GeoJSON chargé en < 3s sur réseau 4G simulé
- [ ] Score Lighthouse Performance ≥ 85
- [ ] Score Lighthouse PWA ≥ 90
- [ ] Aucune dépendance Supabase inutilisée

## Dépendances

- Epic 1 complété (carte fonctionnelle) avant déploiement
- Token Mapbox disponible pour Vercel env vars
- Icônes Tacet 192px + 512px (à créer)
