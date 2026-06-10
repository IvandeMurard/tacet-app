# Architectural Decision Record (ADR-001) : The Hospitality Agentic Mesh

> **Source de vérité globale du Mesh :**
> Document canonique : `aetherix-hospitality-ai/docs/mesh-architecture.md`
> Workspace Linear : **Hospitality Agent** (Team `HOS` / Projet `Tacet`)
> Ce document est la référence canonique globale. ARCHITECTURE_MANIFEST.md détaille les décisions locales à Tacet.

## 1. Vision Globale (The Moat)
Le projet évolue d'une logique de "Features" (un agent F&B isolé, un script de prédiction météo) vers une architecture **Platform** : le **Hospitality Agentic Mesh**.
L'objectif est de s'aligner sur la cartographie moderne des systèmes hôteliers (PMS comme "Commerce Hub" universel) en créant des couches IA spécialisées, indépendantes, communicant via le standard **MCP (Model Context Protocol)**.

## 2. Décisions Architecturales Majeures

### A. Aetherix : D'Orchestrateur à "Execution Node"
*   **Ancien paradigme :** Aetherix gérait la logique d'orchestration globale tout en exécutant des tâches opérationnelles (F&B, Staffing). Risque de devenir un monolithe rigide.
*   **Nouveau paradigme :** Aetherix devient un **nœud d'exécution pur**. Il expose ses capacités (ex: `forecast_covers`, `adjust_staffing`) via un serveur MCP. Il est PMS-agnostic et peut être appelé par n'importe quel orchestrateur (interne ou externe).

### B. Tacet : Le "Sensory Node" (Jumeau Environnemental)
*   Tacet agit comme le capteur physique du Mesh. 
*   Il ingère des données chaotiques (Météo, Paris Open Data, Bruit) et les traduit en signaux structurés via MCP (ex: `room_risk_score`).
*   Il nourrit le RMS (couche Commerce) avec des modificateurs de prix prédictifs et alerte les opérations sans prendre de décision autonome destructrice.

### C. L'Orchestrateur (Séparation des responsabilités)
*   Un "Supervisory Agent" (LLM Root) distinct sera responsable de lire les événements de Tacet et d'appeler les outils d'Aetherix ou du PMS.
*   **Statut Phase 3 :** Non codé pour le moment (un seul design partner). L'architecture le prévoit sur le papier (Article technique) pour montrer la vision, mais on évite la dette technique.

### D. Anima (Guest Context Node) - Horizon Phase 4/5
*   Création future d'un nœud dédié à la Mémoire Relationnelle (Vectorisation des humeurs, retards de vol, historique CRM).
*   **Statut Phase 3 :** L'algorithme "SensoryMemory" de Tacet sert d'embryon technologique pour prouver la viabilité d'une mémoire persistante.

## 3. Roadmap d'Exécution (Phase 3 - Track B)
*   **Build :** Aetherix-as-a-node (serveur MCP standardisé).
*   **Build :** SensoryMemory algorithm (embryon de mémoire).
*   **Build :** Paris Open Data MCP node (prototype Tacet/Sensory Node).
*   **Paperware (Signal) :** Publication d'un article technique décrivant cette architecture Mesh pour générer du signal investisseur/marché sans alourdir le code.

---
*Note pour les LLM (Claude, Antigravity, etc.) :* Ce document sert de source de vérité pour le contexte architectural global. Toute nouvelle feature sur Aetherix ou Tacet doit respecter ce principe de modularité MCP et ne pas recréer de dépendances monolithiques.
