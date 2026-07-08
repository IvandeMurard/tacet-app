# CLAUDE.md — Tacet (Sensory Node)

> **Source de vérité globale du Mesh :** `../aetherix-hospitality-ai/docs/mesh-architecture.md`
> **Règle absolue :** Tacet est un nœud du Mesh Hôtelier. Ne jamais lui coder de fonctions d'orchestration ou de décisions autonomes d'écriture sur le PMS. Son rôle est de capter, analyser et exposer via MCP.

---

## Projet

**Tacet** — Le jumeau environnemental (*Sensory Node*) du Mesh Hôtelier.
**Philosophie :** "Headless Physics Engine" — Ingère des données chaotiques (météo, bruit, grèves) et les traduit en règles de *Yield* ou en alertes de confort.
**Paradigme :** Stateless (calcul en temps réel via Ray-Tracing) + Stateful Memory (Idiosyncratic & SensoryMemory).

> [!WARNING]
> **Règle de Session Globale (Le "Brutal Feedback") :** 
> Toute nouvelle idée, feature ou implémentation doit subir une analyse critique exigeante, sans complaisance. Aucun gadget, aucun gimmick. Un léger "over-engineering" est toléré uniquement s'il sert la vision profonde du produit (modèles mathématiques, Urban ISR, architecture Mesh). Tout ce qui dévie de la vision (ex: Hardware IoT, fonctions gadget) doit être roaster et rejeté.

---

## Stack

| Couche | Technologie | Notes |
|--------|------------|-------|
| Backend | FastAPI + Python 3.12 | Async, Pydantic v2 |
| Base de données | SQLite / SQLAlchemy | Mémoire Idiosyncratique & SensoryMemory |
| Physique 3D | OSMnx, Shapely, GeoPandas | Ray-Tracing acoustique, shielding des bâtiments |
| Protocole Sortant | MCP Server | Expose les données aux orchestrateurs (Aetherix/Claude) |

---

## Décisions architecturales propres à Tacet

| # | Décision | Résumé |
|---|---------|--------|
| 1 | **Sensory Node pur** | Tacet ne prend pas de décisions (pas d'autonomie). Il calcule un "Yield Modifier" et l'expose via MCP ou Webhook. |
| 2 | **Ray-Tracing Acoustique** | La distance linéaire ne suffit pas. Le bruit urbain rebondit. On utilise Shapely/OSMnx pour calculer les intersections de bâtiments (-15 dB par obstacle physique). |
| 3 | **Dual Memory System** | Tacet possède une mémoire *Idiosyncratique* (hôtel spécifique apprend les rejets) et une mémoire globale *SensoryMemory* (ajustement écosystème). |
| 4 | **Explainability Chain** | Pas de boîte noire. Chaque payload d'alerte contient un tableau explicatif du calcul mathématique (ex: `Base - Distance - Shielding = Final`). |

---

## Fichiers clés

```text
app/api/                  — Routes FastAPI (Webhooks, Forecast, Analytics)
app/services/             — Moteurs physiques (Acoustic Engine) et Mémoire
app/services/sensory_memory.py — Agrégation statistique globale
app/ingest/               — Connecteurs de données brutes (Météo, Paris Open Data, Trafic)
app/mcp_server.py         — Le cœur de l'interface Mesh (Model Context Protocol)
ARCHITECTURE_MANIFEST.md  — Décisions locales (ADR-001)
```

---

## Workspace Linear (Contexte)

**Workspace :** Hospitality Agent
**Team :** Aetherix (HOS)
**Project :** Tacet (Issues préfixées par `HOS-`)
*Toujours loguer les décisions et les PRs dans le contexte du ticket HOS correspondant.*
