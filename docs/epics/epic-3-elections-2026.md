# Epic 3 — Angle élections 2026

**Priorité :** P1 — Fenêtre de lancement (mars 2026)
**Statut :** En attente de Epic 1 + 2
**Persona(s) :** Sophie, Marie, Lucas (usage partage)
**Référence PRD :** §3 (hors scope V1 strict, mais levier distribution)

---

## Objectif

Exploiter la fenêtre médiatique des élections municipales de mars 2026 avec des features éditoriales légères mais hautement shareables.

## Valeur utilisateur

> En tant que Parisien actif lors des élections, je veux connaître le bilan sonore de mon arrondissement et pouvoir le partager pour interpeller les candidats ou informer mon entourage.

## Stories

| Story | Titre | Priorité | Effort |
|-------|-------|----------|--------|
| 3.1 | Silence Barometer — ranking arrondissements | P1 | M |
| 3.2 | Page / section "Bilan sonore 2024" par arrondissement | P2 | L |
| 3.3 | Share URL par adresse / zone | P1 | S |
| 3.4 | Meta social (OG image, Twitter card) avec aperçu carte | P2 | M |

## Critères d'acceptation epic

- [ ] Un visiteur peut voir le classement des 20 arrondissements par niveau sonore moyen
- [ ] Chaque arrondissement a une URL partageable avec un résumé sonore
- [ ] Le partage génère une preview rich sur Twitter/LinkedIn/WhatsApp

## Notes

- Cet epic est distinct du MVP strict (Epic 1 + 2) mais est le principal levier de viralité
- La Story 3.3 (share URL) peut être implémentée rapidement et booste les Stories 3.1/3.2
- Story 3.2 (contenu éditorial) peut être généré avec assistance IA à partir des données GeoJSON

## Dépendances

- Epic 1 et 2 complétés
- Données noise_level par arrondissement agrégées depuis paris-noise-iris.geojson
