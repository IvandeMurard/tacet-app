# REFACTOR_ROAST_001 : Suppression de la Dette Technique & Pivot Architectural

*Date de l'audit : Juin 2026*
*Contexte : Suite à l'analyse stratégique (Roast) de l'architecture de Tacet.*

## 1. Objectif du Refactoring
Aligner le code de Tacet avec sa vision : un moteur de prédiction environnemental ("Urban ISR") rapide, furtif et sans états inutiles (Stateless-first). Le code actuel souffre de graves goulets d'étranglements de performance qui empêchent toute mise en production.

## 2. Actions Requises (À exécuter par l'Agent Développeur)

### A. Purge de la "Sensory Memory" (Priorité Absolue)
La "Sensory Memory" (mémoire globale inter-hôtels) est un gadget conceptuel qui détruit les performances (requêtes SQL O(N) dans la boucle principale).
- **Action :** Supprimer le fichier `app/services/sensory_memory.py`.
- **Action :** Dans `app/services/acoustic_engine.py`, supprimer toutes les références à `sensory_bonus` et `get_sensory_modifier()`.
- **Action :** Nettoyer les imports associés. La base de données ne doit plus être interrogée pour obtenir des "statistiques globales".

### B. Pivot du Ray-Tracing (De Synchrone vers Cache)
Le calcul géométrique `LineString.intersects(building)` via OSMnx est actuellement fait en temps réel à chaque appel API pour chaque événement.
- **Action de conception (Architecte) :** Concevoir un modèle de données "Acoustic Heatmap Cache". Au lieu de calculer l'intersection à la volée, le système doit posséder une grille pré-calculée autour de l'hôtel (ex: Nord, Sud, Est, Ouest avec les pénalités associées).
- **Action d'implémentation (Développeur) :** Modifier `acoustic_engine.py` pour qu'il interroge ce dictionnaire en cache (O(1)) plutôt que de calculer des intersections mathématiques complexes en temps réel. Le téléchargement d'OSMnx ne doit se faire *qu'une seule fois* lors de l'initialisation de l'hôtel.

## 3. Définition of Done (DoD)
- L'API `generate_forecast` répond en moins de 100ms (contre plusieurs secondes actuellement).
- La base de données n'est plus scannée globalement. Seule la configuration locale (`Idiosyncratic Memory`) est conservée.
- Les tests unitaires (s'il y en a) sont mis à jour pour refléter la suppression de la Sensory Memory.
